package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.api.dto.MessageDTO;
import co.edu.uniquindio.theknowledgebay.core.service.SessionManager;
import co.edu.uniquindio.theknowledgebay.core.service.SessionManager.SessionKey;
import co.edu.uniquindio.theknowledgebay.infrastructure.security.AuthenticatedUser;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.OutputStream;
import java.time.Duration;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

import static java.nio.charset.StandardCharsets.UTF_8;

@Component
public class ChatEvents {
    private static final long STREAM_NANOS = Duration.ofMinutes(5).toNanos();
    private final SessionManager sessions;
    private final ObjectMapper json;
    private final Map<ThreadKey, Set<Subscription>> threads = new ConcurrentHashMap<>();
    private final Semaphore capacity = new Semaphore(256);

    ChatEvents(SessionManager sessions, ObjectMapper json) {
        this.sessions = sessions;
        this.json = json;
    }

    void stream(AuthenticatedUser actor, String peer, SessionKey session, OutputStream output) {
        if (!capacity.tryAcquire()) return;
        var key = ThreadKey.of(actor.id(), peer);
        var sub = new Subscription();
        try {
            if (!isActive(actor, session)) return;
            threads.compute(key, (thread, existing) -> {
                var subscribers = existing == null ? ConcurrentHashMap.<Subscription>newKeySet() : existing;
                subscribers.add(sub);
                return subscribers;
            });
            write(output, "event:ready\ndata:{}\n\n");
            long start = System.nanoTime();
            while (!sub.overflow && System.nanoTime() - start < STREAM_NANOS) {
                var message = sub.pending.poll(15, TimeUnit.SECONDS);
                if (sub.overflow || !isActive(actor, session)) break;
                if (message == null) write(output, ":keepalive\n\n");
                else write(output, "event:message\nid:" + message.getId() + "\ndata:" + json.writeValueAsString(message) + "\n\n");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (IOException ignored) {
            // The client disconnected; it can reconcile with the durable HTTP history on reconnect.
        } finally {
            threads.computeIfPresent(key, (thread, subscribers) -> {
                subscribers.remove(sub);
                return subscribers.isEmpty() ? null : subscribers;
            });
            capacity.release();
        }
    }

    private boolean isActive(AuthenticatedUser actor, SessionKey session) {
        return sessions.authenticate(session).filter(actor::equals).isPresent();
    }

    void publish(String actor, String peer, MessageDTO message) {
        for (var sub : threads.getOrDefault(ThreadKey.of(actor, peer), Set.of())) {
            if (!sub.pending.offer(message)) sub.overflow = true;
        }
    }

    private static void write(OutputStream output, String frame) throws IOException {
        output.write(frame.getBytes(UTF_8));
        output.flush();
    }

    private static final class Subscription {
        private final ArrayBlockingQueue<MessageDTO> pending = new ArrayBlockingQueue<>(64);
        private volatile boolean overflow;
    }

    private record ThreadKey(String first, String second) {
        static ThreadKey of(String a, String b) {
            return a.compareTo(b) < 0 ? new ThreadKey(a, b) : new ThreadKey(b, a);
        }
    }
}
