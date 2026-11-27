package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.core.repository.ChatStreamLeases;
import co.edu.uniquindio.theknowledgebay.core.repository.StudentRepository;
import org.postgresql.PGConnection;
import org.postgresql.PGNotification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.SmartLifecycle;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.Duration;

@Component
final class PostgresChatListener implements SmartLifecycle {
    private static final Logger LOG = LoggerFactory.getLogger(PostgresChatListener.class);
    private final DataSource source;
    private final ChatEvents events;
    private final ChatStreamLeases leases;
    private volatile boolean running;
    private Thread worker;

    PostgresChatListener(DataSource source, ChatEvents events, ChatStreamLeases leases) {
        this.source = source;
        this.events = events;
        this.leases = leases;
    }

    @Override
    public void start() {
        Feed initial;
        try {
            initial = listen();
        } catch (SQLException e) {
            throw new IllegalStateException("Could not start PostgreSQL chat listener (SQL state " + e.getSQLState() + ")");
        }
        events.listenerConnected();
        running = true;
        worker = Thread.ofPlatform().daemon().name("kb-postgres-listener").start(() -> receive(initial));
    }

    private Feed listen() throws SQLException {
        Connection connection = source.getConnection();
        try (var statement = connection.createStatement()) {
            String namespace;
            try (var result = statement.executeQuery("SELECT md5(current_schema())")) {
                if (!result.next()) throw new SQLException("No current schema");
                namespace = result.getString(1);
                if (namespace == null || !namespace.matches("[a-f0-9]{32}")) throw new SQLException("No current schema");
            }
            String messages = "kb_message_" + namespace;
            String sessions = "kb_session_" + namespace;
            statement.execute("LISTEN " + messages);
            statement.execute("LISTEN " + sessions);
            return new Feed(connection, connection.unwrap(PGConnection.class), messages, sessions);
        } catch (SQLException e) {
            connection.close();
            throw e;
        }
    }

    private void receive(Feed initial) {
        Feed next = initial;
        while (next != null) {
            try (var feed = next) {
                long nextPrune = System.nanoTime();
                while (running) {
                    var notifications = feed.postgres().getNotifications(1_000);
                    if (notifications != null) {
                        for (var notification : notifications) dispatch(feed, notification);
                    }
                    if (System.nanoTime() - nextPrune >= 0) {
                        leases.pruneExpired();
                        nextPrune = System.nanoTime() + Duration.ofMinutes(1).toNanos();
                    }
                }
            } catch (SQLException | DataAccessException e) {
                if (running) LOG.warn("PostgreSQL chat listener disconnected; streams will reconcile on reconnect");
            } finally {
                events.listenerDisconnected();
            }
            next = reconnect();
        }
    }

    private Feed reconnect() {
        while (running) {
            try {
                Thread.sleep(1_000);
                if (!running) return null;
                Feed feed = listen();
                if (!running) {
                    feed.close();
                    return null;
                }
                events.listenerConnected();
                return feed;
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return null;
            } catch (SQLException ignored) {
                // The PostgreSQL connection may still be unavailable; retry without logging connection details.
            }
        }
        return null;
    }

    private void dispatch(Feed feed, PGNotification notification) {
        if (feed.sessions().equals(notification.getName())) {
            events.sessionsChanged();
        } else if (feed.messages().equals(notification.getName())) {
            String[] ids = notification.getParameter().split(":", -1);
            if (ids.length != 3 || !StudentRepository.isCanonicalId(ids[0]) || !StudentRepository.isCanonicalId(ids[1])) return;
            try {
                int message = Integer.parseInt(ids[2]);
                if (message > 0) events.messageCommitted(ids[0], ids[1], message);
            } catch (NumberFormatException ignored) {
                // Malformed notices aren't messages.
            }
        }
    }

    @Override
    public void stop() {
        running = false;
        events.listenerDisconnected();
        if (worker == null) return;
        worker.interrupt();
        try {
            worker.join(2_000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    @Override
    public boolean isRunning() {
        return running;
    }

    private record Feed(Connection connection, PGConnection postgres, String messages, String sessions) implements AutoCloseable {
        @Override
        public void close() throws SQLException {
            try (connection; var statement = connection.createStatement()) {
                statement.execute("UNLISTEN *");
                postgres.getNotifications();
            }
        }
    }
}
