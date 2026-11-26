package co.edu.uniquindio.theknowledgebay.core.service;

import co.edu.uniquindio.theknowledgebay.infrastructure.config.ModeratorProperties;
import co.edu.uniquindio.theknowledgebay.infrastructure.security.AuthenticatedUser;
import co.edu.uniquindio.theknowledgebay.infrastructure.security.AuthenticatedUser.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Component
public class SessionManager {
    private final JdbcTemplate jdbc;
    private final Clock clock;
    private final Duration ttl;

    public SessionManager(JdbcTemplate jdbc, Clock clock, @Value("${app.sessions.ttl:PT8H}") Duration ttl) {
        if (ttl.isNegative() || ttl.isZero()) {
            throw new IllegalArgumentException("The session TTL must be positive.");
        }
        this.jdbc = jdbc;
        this.clock = clock;
        this.ttl = ttl;
    }

    public String createSession(AuthenticatedUser user) {
        if (user.id() == null || user.id().isBlank() || user.role() == null) {
            throw new IllegalArgumentException("A session requires a stored user ID and role.");
        }
        var now = clock.instant();
        jdbc.update("DELETE FROM bearer_sessions WHERE expires_at <= ?", now.toEpochMilli());
        String token;
        do {
            token = UUID.randomUUID().toString();
        } while (jdbc.update("""
                INSERT INTO bearer_sessions (token_hash, user_id, role, expires_at) VALUES (?, ?, ?, ?)
                ON CONFLICT(token_hash) DO NOTHING
                """, keyFor(token).hash(), user.id(), user.role().name(), now.plus(ttl).toEpochMilli()) == 0);
        return token;
    }

    public Optional<AuthenticatedUser> authenticate(SessionKey key) {
        if (key == null) return Optional.empty();
        return jdbc.query("SELECT user_id, role FROM bearer_sessions WHERE token_hash = ? AND expires_at > ?",
                (row, i) -> new AuthenticatedUser(row.getString(1), Role.valueOf(row.getString(2))),
                key.hash(), clock.millis()).stream().findFirst();
    }

    public void revoke(SessionKey key) {
        jdbc.update("DELETE FROM bearer_sessions WHERE token_hash = ?", key.hash());
    }

    public void revokeStudent(String id) {
        jdbc.update("DELETE FROM bearer_sessions WHERE role = 'STUDENT' AND user_id = ?", id);
    }

    // Called in the same database transaction as the revocation, before accepting requests.
    void syncModerator(ModeratorProperties moderator, PasswordEncoder encoder) {
        boolean unchanged = jdbc.query("SELECT user_id, password_hash FROM moderator_session_identity WHERE singleton = 1",
                (row, i) -> moderator.email().equals(row.getString(1)) && encoder.matches(moderator.password(), row.getString(2)))
                .contains(true);
        if (unchanged) return;
        jdbc.update("DELETE FROM bearer_sessions WHERE role = 'MODERATOR'");
        jdbc.update("""
                INSERT INTO moderator_session_identity (singleton, user_id, password_hash) VALUES (1, ?, ?)
                ON CONFLICT(singleton) DO UPDATE SET user_id = excluded.user_id, password_hash = excluded.password_hash
                """, moderator.email(), encoder.encode(moderator.password()));
    }

    public static SessionKey keyFor(String token) {
        try {
            var bytes = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return new SessionKey(HexFormat.of().formatHex(bytes));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is required", e);
        }
    }

    public record SessionKey(String hash) {
        @Override public String toString() { return "SessionKey[redacted]"; }
    }
}
