package co.edu.uniquindio.theknowledgebay.core.service;

import co.edu.uniquindio.theknowledgebay.infrastructure.security.AuthenticatedUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Component
public class SessionManager {
    private final ConcurrentMap<String, Session> activeSessions = new ConcurrentHashMap<>();
    private final Clock clock;
    private final Duration ttl;

    public SessionManager(Clock clock, @Value("${app.sessions.ttl:PT8H}") Duration ttl) {
        if (ttl.isNegative() || ttl.isZero()) {
            throw new IllegalArgumentException("The session TTL must be positive.");
        }
        this.clock = clock;
        this.ttl = ttl;
    }

    public String createSession(AuthenticatedUser user) {
        if (user.id() == null || user.id().isBlank() || user.role() == null) {
            throw new IllegalArgumentException("A session requires a stored user ID and role.");
        }
        Instant now = clock.instant();
        activeSessions.values().removeIf(session -> session.isExpired(now));
        Session session = new Session(user, now.plus(ttl));
        String token;
        do {
            token = UUID.randomUUID().toString();
        } while (activeSessions.putIfAbsent(token, session) != null);
        return token;
    }

    public Optional<AuthenticatedUser> authenticate(String token) {
        if (token == null) {
            return Optional.empty();
        }
        Instant now = clock.instant();
        Session active = activeSessions.computeIfPresent(token, (key, session) -> session.isExpired(now) ? null : session);
        return Optional.ofNullable(active).map(Session::user);
    }

    public void revoke(String token) {
        activeSessions.remove(token);
    }

    public void revokeUser(String id) {
        activeSessions.values().removeIf(session -> session.user().id().equals(id));
    }

    // Transitional bridge for the content and chat controllers. The filter is the only token parser.
    public String getCurrentUserId(String ignoredAuthorizationHeader) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser user ? user.id() : null;
    }

    private record Session(AuthenticatedUser user, Instant expiresAt) {
        boolean isExpired(Instant now) {
            return !now.isBefore(expiresAt);
        }
    }
}
