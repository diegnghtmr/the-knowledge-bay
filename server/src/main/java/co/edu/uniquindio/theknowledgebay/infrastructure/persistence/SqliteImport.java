package co.edu.uniquindio.theknowledgebay.infrastructure.persistence;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import org.flywaydb.core.Flyway;
import org.slf4j.LoggerFactory;

import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/** One-shot offline copy. No SQLite connection is opened by the server. */
public final class SqliteImport {
    private static final int BATCH_SIZE = 500;

    // Foreign-key order. Ordinal columns preserve the iteration order of SQLite's implicit rowids.
    private static final List<Table> TABLES = List.of(
            new Table("students", "id"), new Table("interests", "id_interest"),
            new Table("students_interests", "ordinal"), new Table("comments", "comment_id"),
            new Table("contents", "content_id"), new Table("content_topics", "ordinal"),
            new Table("content_likes", "ordinal"), new Table("content_comments"),
            new Table("help_requests", "request_id"), new Table("help_request_topics", "ordinal"),
            new Table("help_request_comments"), new Table("study_groups", "group_id"),
            new Table("study_group_members"), new Table("study_group_contents"), new Table("study_group_help_requests"),
            new Table("chats", "chat_id"), new Table("messages", "message_id"),
            new Table("content_types", null, true), new Table("follows", "ordinal", true),
            new Table("bearer_sessions", null, true), new Table("moderator_session_identity", null, true),
            new Table("content_attachments", null, true));

    private SqliteImport() {}

    public static int run(String[] args) {
        if (args.length != 2) {
            System.err.println("Usage: java -jar <server.jar> --import-sqlite <sqlite-file>");
            return 2;
        }
        try {
            Path path = Path.of(args[1]).toAbsolutePath();
            String url = System.getenv("SPRING_DATASOURCE_URL");
            String user = System.getenv("SPRING_DATASOURCE_USERNAME");
            String password = System.getenv("SPRING_DATASOURCE_PASSWORD");
            if (!Files.isRegularFile(path) || url == null || !url.startsWith("jdbc:postgresql:")
                    || user == null || user.isBlank() || password == null) {
                System.err.println("SQLite copy requires an existing source file and PostgreSQL datasource environment variables.");
                return 2;
            }
            try (var source = DriverManager.getConnection("jdbc:sqlite:" + path.toUri() + "?mode=ro")) {
                source.setAutoCommit(false);
                var tables = sourceTables(source);
                if (TABLES.stream().anyMatch(table -> !table.optional() && !tables.contains(table.name()))) {
                    System.err.println("SQLite copy refused: the source is missing required Knowledge Bay tables.");
                    return 1;
                }

                // This standalone command emits only its redacted diagnostics, not migration logs.
                var flywayLogger = (Logger) LoggerFactory.getLogger("org.flywaydb");
                flywayLogger.setLevel(Level.OFF);
                Flyway.configure().dataSource(url, user, password).loggers("slf4j").load().migrate();
                try (var destination = DriverManager.getConnection(url, user, password)) {
                    destination.setAutoCommit(false);
                    try {
                        if (!emptyDestination(destination)) {
                            destination.rollback();
                            System.err.println("SQLite copy refused: the PostgreSQL destination is not empty.");
                            return 1;
                        }
                        for (var table : TABLES) {
                            if (tables.contains(table.name())) copyTable(source, destination, table);
                        }
                        destination.commit();
                    } catch (SQLException | RuntimeException e) {
                        destination.rollback();
                        throw e;
                    }
                }
            }
            System.out.println("SQLite data copied to PostgreSQL.");
            return 0;
        } catch (SQLException | RuntimeException e) {
            // Driver and migration messages can contain record contents, credentials, or session fingerprints.
            System.err.println("SQLite copy failed. Check the source schema, data constraints and PostgreSQL configuration.");
            return 1;
        }
    }

    private static Set<String> sourceTables(Connection source) throws SQLException {
        var tables = new HashSet<String>();
        try (var statement = source.createStatement();
             var rows = statement.executeQuery("SELECT name FROM sqlite_schema WHERE type = 'table'")) {
            while (rows.next()) tables.add(rows.getString(1));
        }
        return tables;
    }

    private static boolean emptyDestination(Connection destination) throws SQLException {
        var names = TABLES.stream().map(Table::name).collect(Collectors.joining(", ")) + ", chat_stream_leases";
        try (var statement = destination.createStatement()) {
            statement.execute("SET LOCAL lock_timeout = '5s'");
            statement.execute("LOCK TABLE " + names + " IN ACCESS EXCLUSIVE MODE");
            for (var name : names.split(", ")) {
                try (var rows = statement.executeQuery("SELECT 1 FROM " + name + " LIMIT 1")) {
                    if (rows.next()) return false;
                }
            }
        }
        return true;
    }

    private static void copyTable(Connection source, Connection destination, Table table) throws SQLException {
        var columns = columns(destination, table);
        String names = columns.stream().map(Column::name).collect(Collectors.joining(", "));
        String placeholders = columns.stream().map(ignored -> "?").collect(Collectors.joining(", "));
        String projection = table.hasOrdinal() ? names.replaceFirst("\\bordinal\\b", "rowid AS ordinal") : names;
        String order = table.hasOrdinal() ? " ORDER BY rowid" : "";
        long highest = 0;
        try (var query = source.createStatement();
             var rows = query.executeQuery("SELECT " + projection + " FROM " + table.name() + order);
             var insert = destination.prepareStatement("INSERT INTO " + table.name() + " (" + names + ") VALUES (" + placeholders + ")")) {
            int count = 0;
            while (rows.next()) {
                for (int i = 0; i < columns.size(); i++) bind(insert, i + 1, rows, columns.get(i));
                insert.addBatch();
                if (++count % BATCH_SIZE == 0) insert.executeBatch();
                if (table.identity() != null) highest = Math.max(highest, rows.getLong(table.identity()));
            }
            insert.executeBatch();
        }
        if (table.identity() == null) return;
        if (!table.hasOrdinal()) {
            try (var query = source.prepareStatement("SELECT seq FROM sqlite_sequence WHERE name = ?")) {
                query.setString(1, table.name());
                try (var rows = query.executeQuery()) {
                    if (rows.next()) highest = Math.max(highest, rows.getLong(1));
                }
            }
        }
        try (var statement = destination.createStatement()) {
            statement.execute("ALTER TABLE " + table.name() + " ALTER COLUMN " + table.identity()
                    + " RESTART WITH " + Math.incrementExact(highest));
        }
    }

    private static List<Column> columns(Connection destination, Table table) throws SQLException {
        var columns = new ArrayList<Column>();
        try (var statement = destination.createStatement();
             var result = statement.executeQuery("SELECT * FROM " + table.name() + " WHERE FALSE")) {
            var meta = result.getMetaData();
            for (int i = 1; i <= meta.getColumnCount(); i++) {
                String name = meta.getColumnName(i);
                if (!name.matches("[a-z][a-z0-9_]*")) throw new SQLException("Unexpected destination column name");
                columns.add(new Column(name, meta.getColumnType(i)));
            }
        }
        return columns;
    }

    private static void bind(PreparedStatement target, int index, ResultSet source, Column column) throws SQLException {
        if (column.type() == Types.DATE) {
            String value = source.getString(index);
            target.setObject(index, value == null || (column.name().equals("date_birth") && value.isBlank())
                    ? null : LocalDate.parse(value));
        } else if (column.type() == Types.BIT || column.type() == Types.BOOLEAN) {
            // SQLite represents booleans as integers; do not silently coerce malformed legacy data.
            Object value = source.getObject(index);
            if (!(value instanceof Integer || value instanceof Long) || (source.getLong(index) != 0 && source.getLong(index) != 1)) {
                throw new SQLException("Invalid SQLite boolean");
            }
            target.setBoolean(index, source.getLong(index) == 1);
        } else if (column.type() == Types.INTEGER || column.type() == Types.BIGINT) {
            Object value = source.getObject(index);
            if (value != null && !(value instanceof Integer || value instanceof Long)) {
                throw new SQLException("Invalid SQLite integer");
            }
            if (value == null) {
                target.setNull(index, column.type());
            } else if (column.type() == Types.INTEGER) {
                target.setInt(index, Math.toIntExact(((Number) value).longValue()));
            } else {
                target.setLong(index, ((Number) value).longValue());
            }
        } else {
            target.setString(index, source.getString(index));
        }
    }

    private record Column(String name, int type) {}

    private record Table(String name, String identity, boolean optional) {
        Table(String name, String identity) { this(name, identity, false); }
        Table(String name) { this(name, null); }
        boolean hasOrdinal() { return "ordinal".equals(identity); }
    }
}
