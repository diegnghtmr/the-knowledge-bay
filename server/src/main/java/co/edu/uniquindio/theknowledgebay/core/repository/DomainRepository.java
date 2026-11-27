package co.edu.uniquindio.theknowledgebay.core.repository;

import co.edu.uniquindio.theknowledgebay.core.model.*;
import co.edu.uniquindio.theknowledgebay.core.model.enums.ContentType;
import co.edu.uniquindio.theknowledgebay.core.model.enums.Urgency;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.JdbcTransactionManager;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.jdbc.core.ConnectionCallback;

import java.time.LocalDate;
import java.util.*;
import java.util.function.BiConsumer;
import java.util.function.Supplier;

@Repository
public class DomainRepository {
    private final JdbcTemplate jdbc;
    private final StudentRepository students;
    private final InterestRepository interests;
    private final TransactionTemplate writes;
    private final TransactionTemplate reads;

    public DomainRepository(JdbcTemplate jdbc, StudentRepository students, InterestRepository interests) {
        this.jdbc = jdbc;
        this.students = students;
        this.interests = interests;
        var manager = new JdbcTransactionManager(Objects.requireNonNull(jdbc.getDataSource()));
        this.writes = new TransactionTemplate(manager);
        this.reads = new TransactionTemplate(manager);
        this.reads.setReadOnly(true);
        this.reads.setIsolationLevel(TransactionDefinition.ISOLATION_REPEATABLE_READ);
    }

    // Preserve the compound-write boundary across all app instances using this schema.
    public <T> T write(Supplier<T> operation) {
        return writes.execute(status -> {
            if (status.isNewTransaction()) {
                jdbc.execute((ConnectionCallback<Void>) connection -> {
                    try (var statement = connection.createStatement()) {
                        statement.execute("SELECT pg_advisory_xact_lock(hashtextextended(current_schema(), 736145))");
                    }
                    return null;
                });
            }
            return operation.get();
        });
    }

    public <T> T read(Supplier<T> operation) {
        return reads.execute(status -> operation.get());
    }

    public void replaceStudentInterests(String studentId, Iterable<Interest> topics) {
        jdbc.update("DELETE FROM students_interests WHERE student_id = ?", StudentRepository.numericId(studentId));
        for (Long id : topicIds(topics)) {
            jdbc.update("INSERT INTO students_interests(student_id, interest_id) VALUES (?, ?)", StudentRepository.numericId(studentId), id);
        }
        ensureAutomaticGroups();
    }

    public void ensureAutomaticGroups() {
        jdbc.update("""
                INSERT INTO study_groups(name, topic_id, date, hidden)
                SELECT 'Grupo de ' || i.name, i.id_interest, ?, FALSE
                FROM interests i
                WHERE NOT EXISTS (SELECT 1 FROM study_groups g WHERE g.topic_id = i.id_interest)
                  AND (SELECT COUNT(*) FROM students_interests si WHERE si.interest_id = i.id_interest) >= 2
                """, LocalDate.now());
    }

    public void renameAutomaticGroups(Interest original, String newName) {
        jdbc.update("UPDATE study_groups SET name = ? WHERE topic_id = ? AND name = ?",
                "Grupo de " + newName, StudentRepository.numericId(original.getIdInterest()), "Grupo de " + original.getName());
    }

    public void removeInterestRelations(String interestId) {
        long id = StudentRepository.numericId(interestId);
        jdbc.update("DELETE FROM students_interests WHERE interest_id = ?", id);
        jdbc.update("DELETE FROM content_topics WHERE interest_id = ?", id);
        jdbc.update("DELETE FROM help_request_topics WHERE interest_id = ?", id);
        jdbc.update("DELETE FROM study_group_members WHERE group_id IN (SELECT group_id FROM study_groups WHERE topic_id = ?)", id);
        jdbc.update("DELETE FROM study_group_contents WHERE group_id IN (SELECT group_id FROM study_groups WHERE topic_id = ?)", id);
        jdbc.update("DELETE FROM study_group_help_requests WHERE group_id IN (SELECT group_id FROM study_groups WHERE topic_id = ?)", id);
        jdbc.update("DELETE FROM study_groups WHERE topic_id = ?", id);
    }

    public boolean follow(String actor, String target) {
        if (!StudentRepository.isCanonicalId(actor) || !StudentRepository.isCanonicalId(target) || actor.equals(target)) {
            return false;
        }
        // Preserve the public idempotent success contract for an already established follow.
        return jdbc.update("""
                INSERT INTO follows(follower_id, followed_id)
                SELECT a.id, b.id FROM students a CROSS JOIN students b WHERE a.id = ? AND b.id = ?
                ON CONFLICT(follower_id, followed_id) DO UPDATE SET followed_id = excluded.followed_id
                """, StudentRepository.numericId(actor), StudentRepository.numericId(target)) == 1;
    }

    public boolean unfollow(String actor, String target) {
        if (!StudentRepository.isCanonicalId(actor) || !StudentRepository.isCanonicalId(target)) return false;
        return jdbc.update("DELETE FROM follows WHERE follower_id = ? AND followed_id = ?", StudentRepository.numericId(actor), StudentRepository.numericId(target)) == 1;
    }

    public boolean isFollowing(String actor, String target) {
        if (!StudentRepository.isCanonicalId(actor) || !StudentRepository.isCanonicalId(target)) return false;
        return count("SELECT COUNT(*) FROM follows WHERE follower_id = ? AND followed_id = ?", StudentRepository.numericId(actor), StudentRepository.numericId(target)) != 0;
    }

    public int insertContent(Content content) {
        if (content == null || content.getContentType() == null || content.getDate() == null || content.getTitle() == null
                || content.getAuthor() == null || students.findProfile(content.getAuthor().getId()) == null) return 0;
        int id = jdbc.queryForObject("""
                INSERT INTO contents(title, information, author_id, date) VALUES (?, ?, ?, ?) RETURNING content_id
                """, Integer.class, content.getTitle(), text(content.getInformation()), StudentRepository.numericId(content.getAuthor().getId()),
                content.getDate());
        saveContentType(id, content.getContentType());
        saveTopics(PostKind.CONTENT, id, content.getTopics());
        var attachment = content.getAttachment();
        if (attachment != null) {
            jdbc.update("INSERT INTO content_attachments(content_id, storage_key, file_name, media_type, file_size) VALUES (?, ?, ?, ?, ?)",
                    id, attachment.storageKey(), attachment.fileName(), attachment.mediaType(), attachment.size());
        }
        return id;
    }

    public boolean updateContent(int id, String title, String information, ContentType type) {
        int updated = jdbc.update("UPDATE contents SET title = COALESCE(?, title), information = COALESCE(?, information) WHERE content_id = ?",
                title, information, id);
        if (updated == 1 && type != null) saveContentType(id, type);
        return updated == 1;
    }

    private void saveContentType(int id, ContentType type) {
        jdbc.update("""
                INSERT INTO content_types(content_id, type) VALUES (?, ?)
                ON CONFLICT(content_id) DO UPDATE SET type = excluded.type
                """, id, type.name());
    }

    public int insertHelp(HelpRequest request) {
        if (request == null || request.getUrgency() == null || request.getRequestDate() == null || request.getStudent() == null
                || students.findProfile(request.getStudent().getId()) == null) return 0;
        int id = jdbc.queryForObject("""
                INSERT INTO help_requests(information, urgency, student_id, is_completed, request_date)
                VALUES (?, ?, ?, ?, ?) RETURNING request_id
                """, Integer.class, text(request.getInformation()), request.getUrgency().name(), StudentRepository.numericId(request.getStudent().getId()),
                request.isCompleted(), request.getRequestDate());
        saveTopics(PostKind.HELP, id, request.getTopics());
        return id;
    }

    public boolean completeHelp(int id, String studentId) {
        return StudentRepository.isCanonicalId(studentId)
                && jdbc.update("UPDATE help_requests SET is_completed = TRUE WHERE request_id = ? AND student_id = ?", id, StudentRepository.numericId(studentId)) == 1;
    }

    public boolean updateHelp(int id, String information, Urgency urgency, boolean completed) {
        return jdbc.update("""
                UPDATE help_requests SET information = COALESCE(?, information), urgency = COALESCE(?, urgency), is_completed = ?
                WHERE request_id = ?
                """, information, urgency == null ? null : urgency.name(), completed, id) == 1;
    }

    public boolean deletePost(PostKind kind, int id) {
        jdbc.update("DELETE FROM " + kind.groupPosts + " WHERE " + kind.id + " = ?", id);
        jdbc.update("DELETE FROM " + kind.topics + " WHERE " + kind.id + " = ?", id);
        if (kind == PostKind.CONTENT) {
            jdbc.update("DELETE FROM content_attachments WHERE content_id = ?", id);
            jdbc.update("DELETE FROM content_likes WHERE content_id = ?", id);
            jdbc.update("DELETE FROM content_types WHERE content_id = ?", id);
        }
        var comments = jdbc.queryForList("SELECT comment_id FROM " + kind.comments + " WHERE " + kind.id + " = ?", Integer.class, id);
        jdbc.update("DELETE FROM " + kind.comments + " WHERE " + kind.id + " = ?", id);
        for (int comment : comments) {
            jdbc.update("""
                    DELETE FROM comments WHERE comment_id = ?
                    AND NOT EXISTS (SELECT 1 FROM content_comments WHERE comment_id = ?)
                    AND NOT EXISTS (SELECT 1 FROM help_request_comments WHERE comment_id = ?)
                    """, comment, comment, comment);
        }
        return jdbc.update("DELETE FROM " + kind.posts + " WHERE " + kind.id + " = ?", id) == 1;
    }

    public boolean likeContent(int id, String studentId) {
        if (!StudentRepository.isCanonicalId(studentId)) return false;
        return jdbc.update("""
                INSERT INTO content_likes(content_id, student_id)
                SELECT c.content_id, s.id FROM contents c CROSS JOIN students s WHERE c.content_id = ? AND s.id = ?
                ON CONFLICT(content_id, student_id) DO NOTHING
                """, id, StudentRepository.numericId(studentId)) == 1;
    }

    public boolean unlikeContent(int id, String studentId) {
        if (!StudentRepository.isCanonicalId(studentId)) return false;
        return jdbc.update("DELETE FROM content_likes WHERE content_id = ? AND student_id = ?", id, StudentRepository.numericId(studentId)) == 1;
    }

    public boolean isGroupMember(String groupId, String studentId) {
        if (!StudentRepository.isCanonicalId(groupId) || !StudentRepository.isCanonicalId(studentId)) return false;
        return count("""
                SELECT COUNT(*) FROM study_groups g WHERE g.group_id = ? AND EXISTS (
                    SELECT 1 FROM students_interests si WHERE si.interest_id = g.topic_id AND si.student_id = ?
                    UNION ALL SELECT 1 FROM study_group_members gm WHERE gm.group_id = g.group_id AND gm.student_id = ?
                )
                """, StudentRepository.numericId(groupId), StudentRepository.numericId(studentId), StudentRepository.numericId(studentId)) != 0;
    }

    public boolean isGroupPost(String groupId, PostKind kind, int postId) {
        if (!StudentRepository.isCanonicalId(groupId)) return false;
        return count("SELECT COUNT(*) FROM study_groups g WHERE g.group_id = ? AND EXISTS (SELECT 1 FROM "
                + kind.posts + " p WHERE p." + kind.id + " = ? AND " + groupPostPredicate(kind) + ")", StudentRepository.numericId(groupId), postId) != 0;
    }

    private static String groupPostPredicate(PostKind kind) {
        return "(EXISTS (SELECT 1 FROM " + kind.topics + " t WHERE t.interest_id = g.topic_id AND t." + kind.id + " = p." + kind.id
                + ") OR EXISTS (SELECT 1 FROM " + kind.groupPosts + " gp WHERE gp.group_id = g.group_id AND gp." + kind.id + " = p." + kind.id + "))";
    }

    public Comment insertComment(PostKind kind, int postId, String studentId, String text, LocalDate date) {
        if (text == null || text.isBlank() || date == null) return null;
        Student author = students.findProfile(studentId);
        if (author == null || count("SELECT COUNT(*) FROM " + kind.posts + " WHERE " + kind.id + " = ?", postId) == 0) {
            return null;
        }
        int id = jdbc.queryForObject("INSERT INTO comments(text, author_id, date) VALUES (?, ?, ?) RETURNING comment_id",
                Integer.class, text, StudentRepository.numericId(studentId), date);
        jdbc.update("INSERT INTO " + kind.comments + "(" + kind.id + ", comment_id) VALUES (?, ?)", postId, id);
        return new Comment(id, text, author, date);
    }

    private Set<Long> topicIds(Iterable<Interest> topics) {
        Set<Long> ids = new LinkedHashSet<>();
        if (topics == null) return ids;
        for (Interest candidate : topics) {
            if (candidate == null) continue;
            Interest interest = interests.findById(candidate.getIdInterest());
            if (interest == null) interest = interests.findByName(candidate.getName()).stream().findFirst().orElse(null);
            if (interest != null) ids.add(StudentRepository.numericId(interest.getIdInterest()));
        }
        return ids;
    }

    private void saveTopics(PostKind kind, int postId, Iterable<Interest> topics) {
        for (Long topic : topicIds(topics)) {
            jdbc.update("INSERT INTO " + kind.topics + "(" + kind.id + ", interest_id) VALUES (?, ?)", postId, topic);
        }
    }

    public int contentCount(String studentId) {
        return studentId == null ? count("SELECT COUNT(*) FROM contents")
                : count("SELECT COUNT(*) FROM contents WHERE author_id = ?", StudentRepository.numericId(studentId));
    }

    public int helpCount(String studentId) {
        return studentId == null ? count("SELECT COUNT(*) FROM help_requests")
                : count("SELECT COUNT(*) FROM help_requests WHERE student_id = ?", StudentRepository.numericId(studentId));
    }

    private int count(String sql, Object... arguments) {
        return jdbc.queryForObject(sql, Integer.class, arguments);
    }

    public List<Content> contents(Integer id, Integer offset, Integer limit) {
        Selection selection = id != null ? new Selection("WHERE content_id = ?", id)
                : limit != null ? new Selection("ORDER BY content_id LIMIT ? OFFSET ?", limit, offset)
                : new Selection("");
        return List.copyOf(loadContents(selection, new Profiles(id != null || limit != null)).values());
    }

    private Map<Integer, Content> loadContents(Selection selection, Profiles profiles) {
        var contents = new LinkedHashMap<Integer, Content>();
        jdbc.query("""
                SELECT p.*, ct.type, a.storage_key, a.file_name, a.media_type, a.file_size FROM (SELECT * FROM contents %s) p
                LEFT JOIN content_types ct ON ct.content_id = p.content_id
                LEFT JOIN content_attachments a ON a.content_id = p.content_id ORDER BY p.content_id
                """.formatted(selection.sql), row -> {
            int id = row.getInt("content_id");
            String type = row.getString("type");
            String key = row.getString("storage_key");
            var attachment = key == null ? null : new Attachment(key, row.getString("file_name"),
                    row.getString("media_type"), row.getLong("file_size"));
            contents.put(id, Content.builder().contentId(id).title(row.getString("title"))
                    .author(profiles.get(row.getString("author_id"))).information(row.getString("information"))
                    .date(LocalDate.parse(row.getString("date"))).contentType(type == null ? ContentType.ARTICLE : ContentType.valueOf(type))
                    .attachment(attachment)
                    .topics(new DoublyLinkedList<>()).likedBy(new DoublyLinkedList<>()).comments(new DoublyLinkedList<>()).build());
        }, selection.args);
        if (contents.isEmpty()) return contents;
        readTopics(PostKind.CONTENT, selection, (id, topic) -> contents.get(id).getTopics().addLast(topic));
        jdbc.query("SELECT l.content_id, l.student_id FROM content_likes l WHERE l.content_id IN (SELECT content_id FROM (SELECT * FROM contents "
                + selection.sql + ")) ORDER BY l.ordinal", row -> {
            var content = contents.get(row.getInt(1));
            var liker = profiles.get(row.getString(2));
            if (liker != null) {
                content.getLikedBy().addLast(liker);
                content.setLikeCount(content.getLikedBy().getSize());
            }
        }, selection.args);
        readComments(PostKind.CONTENT, selection, profiles, (id, comment) -> contents.get(id).getComments().addLast(comment));
        return contents;
    }

    public List<HelpRequest> helpRequests(Integer id) {
        var requests = new ArrayList<>(loadHelp(id == null ? new Selection("") : new Selection("WHERE request_id = ?", id),
                new Profiles(id != null)).values());
        requests.sort(Comparator.<HelpRequest>naturalOrder().thenComparingInt(HelpRequest::getRequestId));
        return requests;
    }

    private Map<Integer, HelpRequest> loadHelp(Selection selection, Profiles profiles) {
        var requests = new LinkedHashMap<Integer, HelpRequest>();
        jdbc.query("SELECT * FROM (SELECT * FROM help_requests " + selection.sql + ") ORDER BY request_id", row -> {
            int id = row.getInt("request_id");
            requests.put(id, HelpRequest.builder().requestId(id).information(row.getString("information"))
                    .student(profiles.get(row.getString("student_id"))).urgency(Urgency.valueOf(row.getString("urgency")))
                    .isCompleted(row.getBoolean("is_completed")).requestDate(LocalDate.parse(row.getString("request_date")))
                    .topics(new DoublyLinkedList<>()).comments(new DoublyLinkedList<>()).build());
        }, selection.args);
        if (requests.isEmpty()) return requests;
        readTopics(PostKind.HELP, selection, (id, topic) -> requests.get(id).getTopics().addLast(topic));
        readComments(PostKind.HELP, selection, profiles, (id, comment) -> requests.get(id).getComments().addLast(comment));
        return requests;
    }

    private void readTopics(PostKind kind, Selection selection, BiConsumer<Integer, Interest> consume) {
        jdbc.query("SELECT t." + kind.id + ", i.id_interest, i.name FROM " + kind.topics
                + " t JOIN interests i ON i.id_interest = t.interest_id WHERE t." + kind.id + " IN (SELECT " + kind.id
                + " FROM (SELECT * FROM " + kind.posts + " " + selection.sql + ")) ORDER BY t.ordinal", row -> {
            consume.accept(row.getInt(1), new Interest(row.getString(2), row.getString(3)));
        }, selection.args);
    }

    private void readComments(PostKind kind, Selection selection, Profiles profiles,
                              BiConsumer<Integer, Comment> consume) {
        jdbc.query("SELECT pc." + kind.id + ", c.* FROM " + kind.comments + " pc JOIN comments c ON c.comment_id = pc.comment_id WHERE pc."
                + kind.id + " IN (SELECT " + kind.id + " FROM (SELECT * FROM " + kind.posts + " " + selection.sql + ")) ORDER BY c.comment_id", row -> {
            consume.accept(row.getInt(1), new Comment(row.getInt("comment_id"), row.getString("text"),
                    profiles.get(row.getString("author_id")), LocalDate.parse(row.getString("date"))));
        }, selection.args);
    }

    public List<StudyGroup> groups() {
        var groups = new LinkedHashMap<String, StudyGroup>();
        jdbc.query("""
                SELECT g.*, i.name AS topic_name FROM study_groups g
                LEFT JOIN interests i ON i.id_interest = g.topic_id ORDER BY g.group_id
                """, row -> {
            String id = row.getString("group_id");
            String topicId = row.getString("topic_id");
            groups.put(id, StudyGroup.builder().id(id).name(row.getString("name"))
                    .topic(topicId == null ? null : new Interest(topicId, row.getString("topic_name")))
                    .date(LocalDate.parse(row.getString("date"))).hidden(row.getBoolean("hidden")).build());
        });
        if (groups.isEmpty()) return List.of();
        var profiles = new Profiles(false);
        jdbc.query("""
                SELECT g.group_id, si.student_id FROM study_groups g
                JOIN students_interests si ON si.interest_id = g.topic_id
                UNION SELECT group_id, student_id FROM study_group_members ORDER BY group_id, student_id
                """, row -> {
            var group = groups.get(row.getString(1));
            var student = profiles.get(row.getString(2));
            if (group != null && student != null) group.getMembers().addLast(student);
        });
        var articles = loadContents(new Selection(groupFeedFilter(PostKind.CONTENT)), profiles);
        var requests = loadHelp(new Selection(groupFeedFilter(PostKind.HELP)), profiles);
        readGroupPosts(PostKind.CONTENT, (group, id) -> groups.get(group).getAssociatedContents().addLast(articles.get(id)));
        readGroupPosts(PostKind.HELP, (group, id) -> groups.get(group).getAssociatedHelpRequests().addLast(requests.get(id)));
        return List.copyOf(groups.values());
    }

    public int studyGroupCount(String studentId) {
        if (!StudentRepository.isCanonicalId(studentId)) return 0;
        return count("""
                SELECT COUNT(*) FROM (
                    SELECT g.group_id FROM study_groups g JOIN students_interests si ON si.interest_id = g.topic_id WHERE si.student_id = ?
                    UNION SELECT group_id FROM study_group_members WHERE student_id = ?
                )
                """, StudentRepository.numericId(studentId), StudentRepository.numericId(studentId));
    }

    private static String groupFeedFilter(PostKind kind) {
        return "WHERE " + kind.id + " IN (SELECT t." + kind.id + " FROM " + kind.topics
                + " t JOIN study_groups g ON g.topic_id = t.interest_id UNION SELECT " + kind.id + " FROM " + kind.groupPosts + ")";
    }

    private void readGroupPosts(PostKind kind, BiConsumer<String, Integer> consume) {
        jdbc.query("SELECT g.group_id, p." + kind.id + " FROM study_groups g JOIN " + kind.posts + " p ON "
                + groupPostPredicate(kind) + " ORDER BY g.group_id, p." + kind.id, row -> {
            consume.accept(row.getString(1), row.getInt(2));
        });
    }

    private static String text(String value) {
        return value == null ? "" : value;
    }

    private record Selection(String sql, Object... args) {}

    private final class Profiles {
        private final Map<String, Student> cache;
        private final boolean single;

        private Profiles(boolean single) {
            this.cache = single ? new HashMap<>() : students.profilesById();
            this.single = single;
        }

        private Student get(String id) {
            if (single) return cache.computeIfAbsent(id, students::findProfile);
            return cache.get(id);
        }
    }

    public enum PostKind {
        CONTENT("contents", "content_id", "content_topics", "content_comments", "study_group_contents"),
        HELP("help_requests", "request_id", "help_request_topics", "help_request_comments", "study_group_help_requests");

        private final String posts;
        private final String id;
        private final String topics;
        private final String comments;
        private final String groupPosts;

        PostKind(String posts, String id, String topics, String comments, String groupPosts) {
            this.posts = posts;
            this.id = id;
            this.topics = topics;
            this.comments = comments;
            this.groupPosts = groupPosts;
        }
    }
}
