package co.edu.uniquindio.theknowledgebay.core.repository;

import org.springframework.jdbc.core.JdbcTemplate;

/** Keep generated IDs above explicit import IDs under the domain write transaction lock. */
enum ExplicitIdentity {
    STUDENT("students_id_seq"),
    INTEREST("interests_id_interest_seq");

    private final String sequence;

    ExplicitIdentity(String sequence) {
        this.sequence = sequence;
    }

    void advance(JdbcTemplate jdbc, long id) {
        boolean needsAdvance = Boolean.TRUE.equals(jdbc.queryForObject(
                "SELECT last_value < ? OR (last_value = ? AND NOT is_called) FROM " + sequence,
                Boolean.class, id, id));
        if (needsAdvance && id < Long.MAX_VALUE) {
            // Unlike setval(), RESTART rolls back with the import.
            jdbc.execute("ALTER SEQUENCE " + sequence + " RESTART WITH " + (id + 1));
        }
    }
}
