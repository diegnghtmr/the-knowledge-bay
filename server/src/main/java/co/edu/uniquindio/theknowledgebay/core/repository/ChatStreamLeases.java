package co.edu.uniquindio.theknowledgebay.core.repository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.JdbcTransactionManager;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.Objects;
import java.util.UUID;

@Repository
public class ChatStreamLeases {
    private static final Logger LOG = LoggerFactory.getLogger(ChatStreamLeases.class);
    private final JdbcTemplate jdbc;
    private final TransactionTemplate transactions;

    public ChatStreamLeases(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
        this.transactions = new TransactionTemplate(new JdbcTransactionManager(Objects.requireNonNull(jdbc.getDataSource())));
    }

    public UUID reserve(String actor, int maximum) {
        Long student = StudentRepository.numericId(actor);
        if (student == null) return null;
        return transactions.execute(status -> {
            // Lock only this student's admissions. Releasing other students' expired rows is independent.
            if (jdbc.queryForList("SELECT id FROM students WHERE id = ? FOR NO KEY UPDATE", Long.class, student).isEmpty()) {
                return null;
            }
            UUID id = UUID.randomUUID();
            return jdbc.update("""
                    INSERT INTO chat_stream_leases(lease_id, student_id, expires_at)
                    SELECT ?, ?, clock_timestamp() + INTERVAL '45 seconds'
                    WHERE (SELECT count(*) FROM chat_stream_leases WHERE student_id = ? AND expires_at > clock_timestamp()) < ?
                    """, id, student, student, maximum) == 1 ? id : null;
        });
    }

    public boolean renew(UUID id) {
        return jdbc.update("""
                UPDATE chat_stream_leases SET expires_at = clock_timestamp() + INTERVAL '45 seconds'
                WHERE lease_id = ? AND expires_at > clock_timestamp()
                """, id) == 1;
    }

    public void release(UUID id) {
        try {
            jdbc.update("DELETE FROM chat_stream_leases WHERE lease_id = ?", id);
        } catch (DataAccessException ignored) {
            // A crashed instance or unavailable database is recovered by the bounded lease lifetime.
            LOG.warn("Unable to release chat stream lease; it will expire");
        }
    }

    public void pruneExpired() {
        jdbc.update("""
                DELETE FROM chat_stream_leases WHERE lease_id IN (
                    SELECT lease_id FROM chat_stream_leases WHERE expires_at <= clock_timestamp()
                    FOR UPDATE SKIP LOCKED
                )
                """);
    }
}
