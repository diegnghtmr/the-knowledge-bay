package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.core.repository.ChatStreamLeases;
import co.edu.uniquindio.theknowledgebay.core.service.ChatService;
import co.edu.uniquindio.theknowledgebay.core.service.SessionManager;
import co.edu.uniquindio.theknowledgebay.core.service.SessionManager.SessionKey;
import co.edu.uniquindio.theknowledgebay.infrastructure.security.AuthenticatedUser;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.context.request.async.CallableProcessingInterceptor;
import org.springframework.web.context.request.async.WebAsyncUtils;

import java.io.IOException;
import java.io.OutputStream;
import java.time.Duration;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import static java.nio.charset.StandardCharsets.UTF_8;

@Component
public class ChatEvents {
    private static final long STREAM_NANOS = Duration.ofMinutes(5).toNanos();
    private static final long HEARTBEAT_NANOS = Duration.ofSeconds(15).toNanos();
    private static final String SLOT_ATTRIBUTE = ChatEvents.class.getName() + ".streamSlot";
    private final SessionManager sessions;
    private final ChatStreamLeases leases;
    private final ChatService chats;
    private final ObjectMapper json;
    private final Map<ThreadKey, Set<Subscription>> threads = new ConcurrentHashMap<>();
    private final Semaphore capacity = new Semaphore(256);
    private final int maxStreamsPerUser;
    private volatile Object listenerGeneration;

    ChatEvents(SessionManager sessions, ChatStreamLeases leases, ChatService chats, ObjectMapper json,
               @Value("${app.chat.max-streams-per-user:${APP_CHAT_MAX_STREAMS_PER_USER:3}}") int maxStreamsPerUser) {
        if (maxStreamsPerUser < 1) throw new IllegalArgumentException("The per-user chat stream limit must be positive.");
        this.sessions = sessions;
        this.leases = leases;
        this.chats = chats;
        this.json = json;
        this.maxStreamsPerUser = maxStreamsPerUser;
    }

    boolean listening() {
        return listenerGeneration != null;
    }

    void listenerConnected() {
        listenerGeneration = new Object();
    }

    void listenerDisconnected() {
        listenerGeneration = null;
        sessionsChanged();
    }

    StreamSlot reserve(String userId, HttpServletRequest request) {
        if (!capacity.tryAcquire()) return null;
        UUID lease = null;
        try {
            lease = leases.reserve(userId, maxStreamsPerUser);
            if (lease == null) return null;
            var slot = new StreamSlot(lease);
            try {
                request.setAttribute(SLOT_ATTRIBUTE, slot);
                WebAsyncUtils.getAsyncManager(request).registerCallableInterceptor(SLOT_ATTRIBUTE, new CallableProcessingInterceptor() {
                    @Override
                    public <T> void afterCompletion(NativeWebRequest webRequest, Callable<T> task) {
                        slot.cancelUnstarted();
                    }
                });
                return slot;
            } catch (RuntimeException e) {
                slot.cancelUnstarted();
                throw e;
            }
        } finally {
            if (lease == null) capacity.release();
        }
    }

    // Called when MVC fails before starting async processing, or finishes the async redispatch.
    public static void cancelUnstarted(HttpServletRequest request) {
        if (request.getAttribute(SLOT_ATTRIBUTE) instanceof StreamSlot slot) slot.cancelUnstarted();
    }

    void stream(StreamSlot slot, AuthenticatedUser actor, String peer, SessionKey session, OutputStream output) {
        if (!slot.start()) return;
        var key = ThreadKey.of(actor.id(), peer);
        var sub = new Subscription();
        try {
            Object generation = listenerGeneration;
            if (generation == null) return;
            threads.compute(key, (thread, existing) -> {
                var subscribers = existing == null ? ConcurrentHashMap.<Subscription>newKeySet() : existing;
                subscribers.add(sub);
                return subscribers;
            });
            // Subscribe before verifying so revocations between HTTP authorization and the ready frame aren't missed.
            if (generation != listenerGeneration || !isActive(actor, session) || !leases.renew(slot.lease)) return;
            write(output, "event:ready\ndata:{}\n\n");
            long end = System.nanoTime() + STREAM_NANOS;
            long heartbeat = System.nanoTime() + HEARTBEAT_NANOS;
            while (!sub.overflow && generation == listenerGeneration) {
                long wait = end - System.nanoTime();
                if (wait <= 0) break;
                Integer id = sub.pending.poll(Math.min(wait, heartbeat - System.nanoTime()), TimeUnit.NANOSECONDS);
                if (sub.overflow || generation != listenerGeneration || System.nanoTime() - end >= 0
                        || !isActive(actor, session) || !leases.renew(slot.lease)) break;
                if (id != null && id > 0) {
                    var message = chats.getMessageForChat(actor.id(), peer, id);
                    if (message == null) continue;
                    write(output, "event:message\nid:" + id + "\ndata:" + json.writeValueAsString(ChatController.toDto(message)) + "\n\n");
                    heartbeat = System.nanoTime() + HEARTBEAT_NANOS;
                } else if (System.nanoTime() - heartbeat >= 0) {
                    write(output, ":keepalive\n\n");
                    heartbeat = System.nanoTime() + HEARTBEAT_NANOS;
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (IOException | DataAccessException ignored) {
            // Unavailable stream or disconnected client; reconnects reconcile with the durable HTTP history.
        } finally {
            threads.computeIfPresent(key, (thread, subscribers) -> {
                subscribers.remove(sub);
                return subscribers.isEmpty() ? null : subscribers;
            });
            // Spring can interrupt the stream task on async completion. JDBC socket I/O on an interrupted
            // virtual thread would fail before releasing its lease, so restore the flag after cleanup.
            boolean interrupted = Thread.interrupted();
            try {
                slot.finish();
            } finally {
                if (interrupted) Thread.currentThread().interrupt();
            }
        }
    }

    private enum SlotState { RESERVED, STREAMING, RELEASED }

    final class StreamSlot {
        private final UUID lease;
        private final AtomicReference<SlotState> state = new AtomicReference<>(SlotState.RESERVED);

        private StreamSlot(UUID lease) { this.lease = lease; }

        private boolean start() { return state.compareAndSet(SlotState.RESERVED, SlotState.STREAMING); }

        private void cancelUnstarted() { releaseFrom(SlotState.RESERVED); }

        private void finish() { releaseFrom(SlotState.STREAMING); }

        private void releaseFrom(SlotState expected) {
            if (state.compareAndSet(expected, SlotState.RELEASED)) {
                try {
                    leases.release(lease);
                } finally {
                    capacity.release();
                }
            }
        }
    }

    private boolean isActive(AuthenticatedUser actor, SessionKey session) {
        return sessions.authenticate(session).filter(actor::equals).isPresent();
    }

    void messageCommitted(String first, String second, int id) {
        for (var sub : threads.getOrDefault(ThreadKey.of(first, second), Set.of())) {
            if (!sub.pending.offer(id)) sub.overflow = true;
        }
    }

    void sessionsChanged() {
        // Zero is a wake-up, not a message. If the queue is full the stream is already awake.
        threads.values().forEach(subscribers -> subscribers.forEach(sub -> sub.pending.offer(0)));
    }

    private static void write(OutputStream output, String frame) throws IOException {
        output.write(frame.getBytes(UTF_8));
        output.flush();
    }

    private static final class Subscription {
        private final ArrayBlockingQueue<Integer> pending = new ArrayBlockingQueue<>(64);
        private volatile boolean overflow;
    }

    private record ThreadKey(String first, String second) {
        static ThreadKey of(String a, String b) {
            return a.compareTo(b) < 0 ? new ThreadKey(a, b) : new ThreadKey(b, a);
        }
    }
}
