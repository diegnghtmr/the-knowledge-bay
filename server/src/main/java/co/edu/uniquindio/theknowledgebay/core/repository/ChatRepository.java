package co.edu.uniquindio.theknowledgebay.core.repository;

import co.edu.uniquindio.theknowledgebay.core.model.Chat;
import co.edu.uniquindio.theknowledgebay.core.model.Message;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.StreamSupport;

@Repository
public class ChatRepository {
    private final JdbcTemplate jdbc;
    private final StudentRepository students;

    public ChatRepository(JdbcTemplate jdbc, StudentRepository students) {
        this.jdbc = jdbc;
        this.students = students;
    }

    public Message send(String actor, String peer, String text) {
        if (!validPair(actor, peer) || text == null || text.isBlank()) return null;
        Student sender = students.findProfile(actor);
        if (sender == null || students.findProfile(peer) == null) return null;

        long first = Math.min(Long.parseLong(actor), Long.parseLong(peer));
        long second = Math.max(Long.parseLong(actor), Long.parseLong(peer));
        jdbc.update("INSERT INTO chats(student_a_id, student_b_id) VALUES (?, ?) ON CONFLICT DO NOTHING", first, second);
        int chat = jdbc.queryForObject("""
                SELECT chat_id FROM chats WHERE LEAST(student_a_id, student_b_id) = ? AND GREATEST(student_a_id, student_b_id) = ?
                """, Integer.class, first, second);
        LocalDateTime timestamp = LocalDateTime.now();
        int id = jdbc.queryForObject("""
                INSERT INTO messages(text, sender_id, timestamp, chat_id) VALUES (?, ?, ?, ?) RETURNING message_id
                """, Integer.class, text, Long.parseLong(actor), timestamp.toString(), chat);
        jdbc.query("SELECT pg_notify('kb_message_' || md5(current_schema()), ?)",
                rs -> {}, first + ":" + second + ":" + id);
        return new Message(id, text, sender, timestamp);
    }

    public List<Chat> allChats() {
        return load("", "");
    }

    public List<Chat> chatsFor(String actor) {
        if (!StudentRepository.isCanonicalId(actor)) return List.of();
        return load("WHERE c.student_a_id = ? OR c.student_b_id = ?", "AND m.message_id = (SELECT MAX(message_id) FROM messages WHERE chat_id = c.chat_id)", Long.parseLong(actor), Long.parseLong(actor));
    }

    public List<Message> messagesFor(String actor, String peer) {
        if (!validPair(actor, peer)) return List.of();
        long first = Math.min(Long.parseLong(actor), Long.parseLong(peer));
        long second = Math.max(Long.parseLong(actor), Long.parseLong(peer));
        var results = load("WHERE LEAST(c.student_a_id, c.student_b_id) = ? AND GREATEST(c.student_a_id, c.student_b_id) = ?", "", first, second);
        if (results.isEmpty()) return List.of();
        return StreamSupport.stream(results.getFirst().getMessages().spliterator(), false).toList();
    }

    public Message messageFor(String actor, String peer, int messageId) {
        if (!validPair(actor, peer) || messageId <= 0) return null;
        long a = Long.parseLong(actor);
        long b = Long.parseLong(peer);
        return jdbc.query("""
                SELECT m.message_id, m.text, m.sender_id, m.timestamp FROM messages m
                JOIN chats c ON c.chat_id = m.chat_id
                WHERE m.message_id = ?
                  AND LEAST(c.student_a_id, c.student_b_id) = ?
                  AND GREATEST(c.student_a_id, c.student_b_id) = ?
                """, (row, n) -> {
            var sender = students.findProfile(row.getString("sender_id"));
            return sender == null ? null : new Message(row.getInt("message_id"), row.getString("text"), sender,
                    LocalDateTime.parse(row.getString("timestamp")));
        }, messageId, Math.min(a, b), Math.max(a, b)).stream().filter(java.util.Objects::nonNull).findFirst().orElse(null);
    }

    private List<Chat> load(String filter, String messageFilter, Object... arguments) {
        Map<Integer, Chat> chats = new LinkedHashMap<>();
        Map<String, Student> profiles = filter.isEmpty() ? students.profilesById() : new LinkedHashMap<>();
        jdbc.query("SELECT c.* FROM chats c " + filter + " ORDER BY c.chat_id", row -> {
            int id = row.getInt("chat_id");
            var a = profiles.computeIfAbsent(row.getString("student_a_id"), students::findProfile);
            var b = profiles.computeIfAbsent(row.getString("student_b_id"), students::findProfile);
            if (a != null && b != null) {
                chats.put(id, Chat.builder().chatId(id).studentA(a).studentB(b).messages(new DoublyLinkedList<>()).build());
            }
        }, arguments);
        if (chats.isEmpty()) return List.of();
        jdbc.query("SELECT m.* FROM messages m JOIN (SELECT c.* FROM chats c " + filter + ") c ON c.chat_id = m.chat_id "
                + messageFilter + " ORDER BY m.message_id", row -> {
            var chat = chats.get(row.getInt("chat_id"));
            if (chat == null) return;
            var sender = profiles.computeIfAbsent(row.getString("sender_id"), students::findProfile);
            if (sender != null) chat.getMessages().addLast(new Message(row.getInt("message_id"), row.getString("text"),
                    sender, LocalDateTime.parse(row.getString("timestamp"))));
        }, arguments);
        return List.copyOf(chats.values());
    }

    private static boolean validPair(String actor, String peer) {
        return StudentRepository.isCanonicalId(actor) && StudentRepository.isCanonicalId(peer) && !actor.equals(peer);
    }
}
