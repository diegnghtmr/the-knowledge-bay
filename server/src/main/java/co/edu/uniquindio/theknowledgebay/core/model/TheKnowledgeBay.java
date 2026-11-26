package co.edu.uniquindio.theknowledgebay.core.model;

import co.edu.uniquindio.theknowledgebay.api.dto.ContentResponseDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.HelpRequestResponseDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.ProfileResponseDTO;
import co.edu.uniquindio.theknowledgebay.core.factory.UserFactory;
import co.edu.uniquindio.theknowledgebay.core.model.enums.ContentType;
import co.edu.uniquindio.theknowledgebay.core.model.enums.Urgency;
import co.edu.uniquindio.theknowledgebay.core.repository.ChatRepository;
import co.edu.uniquindio.theknowledgebay.core.repository.DomainRepository;
import co.edu.uniquindio.theknowledgebay.core.repository.DomainRepository.PostKind;
import co.edu.uniquindio.theknowledgebay.core.repository.InterestRepository;
import co.edu.uniquindio.theknowledgebay.core.repository.StudentRepository;
import co.edu.uniquindio.theknowledgebay.infrastructure.config.ModeratorProperties;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.converter.ListToDoublyLinkedList;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.graphs.UndirectedGraph;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.GraphVertex;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Component
public class TheKnowledgeBay {
    private static final int MAX_CONTENT_PAGE_SIZE = 100;
    private final StudentRepository students;
    private final InterestRepository interests;
    private final DomainRepository domain;
    private final ChatRepository chats;
    private final Moderator moderator;

    public TheKnowledgeBay(StudentRepository students, InterestRepository interests, DomainRepository domain,
                           ChatRepository chats, PasswordEncoder passwordEncoder, ModeratorProperties props) {
        this.students = students;
        this.interests = interests;
        this.domain = domain;
        this.chats = chats;
        moderator = new Moderator();
        moderator.setId(props.email());
        moderator.setEmail(props.email());
        moderator.setUsername(props.name());
        moderator.setPassword(passwordEncoder.encode(props.password()));
    }

    public UserFactory getUsers() {
        var result = new UserFactory();
        result.setModerator(moderatorSnapshot());
        result.setStudents(linked(domain.read(students::findAll)));
        return result;
    }

    private Moderator moderatorSnapshot() {
        var copy = new Moderator();
        copy.setId(moderator.getId());
        copy.setEmail(moderator.getEmail());
        copy.setUsername(moderator.getUsername());
        copy.setPassword(moderator.getPassword());
        return copy;
    }

    public void addStudent(Student student) {
        String suppliedId = student.getId();
        try {
            domain.write(() -> {
                requireAvailableIdentity(student, null);
                students.save(student);
                domain.replaceStudentInterests(student.getId(), student.getInterests());
                return null;
            });
        } catch (RuntimeException e) {
            student.setId(suppliedId);
            throw e;
        }
    }

    private void requireAvailableIdentity(Student student, String existingId) {
        User emailOwner = findUserByEmail(student.getEmail());
        if (emailOwner != null && !emailOwner.getId().equals(existingId)) {
            throw new DuplicateKeyException("Email already exists.");
        }
        User usernameOwner = findUserByUsername(student.getUsername());
        if (usernameOwner != null && !usernameOwner.getId().equals(existingId)) {
            throw new DuplicateKeyException("Username already exists.");
        }
    }

    public User getUserById(String id) {
        if (id == null) return null;
        if (id.equals(moderator.getId())) return moderatorSnapshot();
        return domain.read(() -> students.findById(id));
    }

    public User findUserByEmail(String email) {
        if (email == null) return null;
        return email.equalsIgnoreCase(moderator.getEmail()) ? moderatorSnapshot() : students.findByEmail(email);
    }

    public User findUserByUsername(String username) {
        if (username == null) return null;
        return username.equalsIgnoreCase(moderator.getUsername()) ? moderatorSnapshot() : students.findByUsername(username);
    }

    /** Compatibility lookup: missing identities are never created as a side effect. */
    public User findOrCreateUserByEmail(String email) {
        return findUserByEmail(email);
    }

    public boolean updateStudent(String id, ProfileResponseDTO profile) {
        return updateStudentProfile(id, Student.builder().username(profile.getUsername()).email(profile.getEmail())
                .firstName(profile.getFirstName()).lastName(profile.getLastName()).biography(profile.getBiography())
                .dateBirth(profile.getDateBirth()).build(), null);
    }

    public void updateUser(String id, User updated, List<String> interestNames) {
        updateStudentProfile(id, updated, interestNames);
    }

    public void updateUser(String id, User updated) {
        updateUser(id, updated, null);
    }

    private boolean updateStudentProfile(String id, User updated, List<String> interestNames) {
        return domain.write(() -> {
            Student target = students.findById(id);
            if (target == null) return false;
            if (updated.getUsername() != null) target.setUsername(updated.getUsername());
            if (updated.getEmail() != null) target.setEmail(updated.getEmail());
            if (updated.getPassword() != null) target.setPassword(updated.getPassword());
            if (updated instanceof Student profile) {
                if (profile.getFirstName() != null) target.setFirstName(profile.getFirstName());
                if (profile.getLastName() != null) target.setLastName(profile.getLastName());
                if (profile.getDateBirth() != null) target.setDateBirth(profile.getDateBirth());
                if (profile.getBiography() != null) target.setBiography(profile.getBiography());
            }
            requireAvailableIdentity(target, id);
            students.update(target);
            if (interestNames != null) {
                var topics = interestNames.stream().map(this::findInterestByName).filter(Objects::nonNull).toList();
                domain.replaceStudentInterests(id, topics);
            }
            return true;
        });
    }

    /** Group creation now runs in the same transaction as writing student interests. */
    public void updateAutomaticStudyGroupsForStudent(Student student) {
        // Legacy registration and fixture callers need not perform a second write.
    }

    public DoublyLinkedList<Interest> getAllInterests() {
        return linked(interests.findAll());
    }

    public Interest findInterestByName(String name) {
        return interests.findByName(name).stream().findFirst().orElse(null);
    }

    public Interest getInterestById(String id) {
        return interests.findById(id);
    }

    public boolean addInterest(Interest interest) {
        if (interest == null || interest.getName() == null || interest.getName().isBlank()) return false;
        return domain.write(() -> {
            if (findInterestByName(interest.getName()) != null || getInterestById(interest.getIdInterest()) != null) return false;
            return interests.save(interest) == 1;
        });
    }

    public boolean updateInterest(String id, String newName) {
        if (newName == null || newName.isBlank()) return false;
        return domain.write(() -> {
            Interest original = getInterestById(id);
            if (original == null) return false;
            Interest conflicting = findInterestByName(newName);
            if (conflicting != null && !conflicting.getIdInterest().equals(id)) return false;
            String trimmed = newName.strip();
            domain.renameAutomaticGroups(original, trimmed);
            return interests.update(new Interest(id, trimmed)) == 1;
        });
    }

    public boolean deleteInterest(String id) {
        return domain.write(() -> {
            if (getInterestById(id) == null) return false;
            domain.removeInterestRelations(id);
            return interests.deleteById(id) == 1;
        });
    }

    public boolean addContent(Content content) {
        int id = domain.write(() -> domain.insertContent(content));
        if (id == 0) return false;
        content.setContentId(id);
        return true;
    }

    public DoublyLinkedList<Content> getAllContent() {
        return linked(domain.read(() -> domain.contents(null, null, null)));
    }

    public List<Content> getContentPage(int offset, int limit) {
        if (offset < 0 || limit < 1 || limit > MAX_CONTENT_PAGE_SIZE) {
            throw new IllegalArgumentException("Content page requires a nonnegative offset and a limit between 1 and 100");
        }
        return domain.read(() -> domain.contents(null, offset, limit));
    }

    public Content getContentById(int id) {
        return domain.read(() -> domain.contents(id, null, null).stream().findFirst().orElse(null));
    }

    public boolean updateContent(int id, ContentResponseDTO updated) {
        ContentType type = updated.getContentType() == null ? null
                : ContentType.valueOf(updated.getContentType().toUpperCase(Locale.ROOT));
        return domain.write(() -> domain.updateContent(id, updated.getTitle(), updated.getInformation(), type));
    }

    public boolean deleteContent(int id) {
        return domain.write(() -> domain.deletePost(PostKind.CONTENT, id));
    }

    public boolean likeContent(int id, String actorId) {
        return domain.write(() -> domain.likeContent(id, actorId));
    }

    public boolean unlikeContent(int id, String actorId) {
        return domain.write(() -> domain.unlikeContent(id, actorId));
    }

    public boolean addHelpRequest(HelpRequest request) {
        int id = domain.write(() -> domain.insertHelp(request));
        if (id == 0) return false;
        request.setRequestId(id);
        return true;
    }

    public DoublyLinkedList<HelpRequest> getAllHelpRequests() {
        return linked(domain.read(() -> domain.helpRequests(null)));
    }

    public HelpRequest getHelpRequestById(int id) {
        return domain.read(() -> domain.helpRequests(id).stream().findFirst().orElse(null));
    }

    public boolean deleteHelpRequest(int id) {
        return domain.write(() -> domain.deletePost(PostKind.HELP, id));
    }

    public boolean updateHelpRequest(int id, HelpRequestResponseDTO updated) {
        Urgency urgency = null;
        if (updated.getUrgency() != null) {
            try {
                urgency = Urgency.valueOf(updated.getUrgency().toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException ignored) {
                // Preserve the current priority when an admin edit omits a recognized urgency.
            }
        }
        Urgency newUrgency = urgency;
        return domain.write(() -> domain.updateHelp(id, updated.getInformation(), newUrgency, updated.isCompleted()));
    }

    public boolean markHelpRequestAsCompleted(int id, String actorId) {
        return domain.write(() -> domain.completeHelp(id, actorId));
    }

    public DoublyLinkedList<StudyGroup> getStudyGroups() {
        return linked(domain.read(domain::groups));
    }

    public int getUserStudyGroupCount(String id) {
        return domain.studyGroupCount(id);
    }

    public boolean isStudyGroupMember(String groupId, String actorId) {
        return domain.isGroupMember(groupId, actorId);
    }

    public boolean setGroupContentLike(String groupId, int contentId, String actorId, boolean liked) {
        return domain.write(() -> domain.isGroupMember(groupId, actorId) && domain.isGroupPost(groupId, PostKind.CONTENT, contentId)
                && (liked ? domain.likeContent(contentId, actorId) : domain.unlikeContent(contentId, actorId)));
    }

    public Comment addGroupComment(String groupId, PostKind kind, int postId, String actorId, String text) {
        return domain.write(() -> domain.isGroupMember(groupId, actorId) && domain.isGroupPost(groupId, kind, postId)
                ? domain.insertComment(kind, postId, actorId, text, LocalDate.now()) : null);
    }

    public Message sendMessage(String actorId, String peerId, String text) {
        return domain.write(() -> chats.send(actorId, peerId, text));
    }

    public DoublyLinkedList<Message> getMessagesForChat(String actorId, String peerId) {
        return linked(domain.read(() -> chats.messagesFor(actorId, peerId)));
    }

    public List<Chat> getChatContacts(String actorId) {
        return domain.read(() -> chats.chatsFor(actorId));
    }

    public DoublyLinkedList<Chat> getChats() {
        return linked(domain.read(chats::allChats));
    }

    public boolean followUser(String followerId, String followedId) {
        return domain.write(() -> domain.follow(followerId, followedId));
    }

    public boolean unfollowUser(String followerId, String followedId) {
        return domain.write(() -> domain.unfollow(followerId, followedId));
    }

    public boolean isUserFollowing(String followerId, String followedId) {
        return domain.isFollowing(followerId, followedId);
    }

    public int getContentCountByUserId(String id) {
        return StudentRepository.isCanonicalId(id) ? domain.contentCount(id) : 0;
    }

    public int getHelpRequestCountByUserId(String id) {
        return StudentRepository.isCanonicalId(id) ? domain.helpCount(id) : 0;
    }

    public int getTotalUsersCount() {
        return students.count();
    }

    public int getTotalContentCount() {
        return domain.contentCount(null);
    }

    public int getTotalHelpRequestsCount() {
        return domain.helpCount(null);
    }

    public UndirectedGraph<String> getAffinityGraph() {
        return affinityGraph(getUsers().getStudents());
    }

    private static UndirectedGraph<String> affinityGraph(Iterable<Student> students) {
        var graph = new UndirectedGraph<String>();
        for (var student : students) graph.addVertex(student.getId());
        for (var student : students) {
            var followers = new HashSet<String>();
            for (var follower : student.getFollowers()) followers.add(follower.getId());
            for (var followed : student.getFollowing()) {
                if (student.getId().compareTo(followed.getId()) < 0 && followers.contains(followed.getId())) {
                    graph.addEdge(student.getId(), followed.getId());
                }
            }
        }
        return graph;
    }

    public void refreshAffinityGraph() {
        // Graphs are built from a fresh database snapshot on every read.
    }

    public List<Map<String, Object>> getAffinityGraphData() {
        var profiles = getUsers().getStudents();
        var nodes = new ArrayList<Map<String, Object>>();
        var links = new ArrayList<Map<String, Object>>();
        int group = 0;
        for (var student : profiles) {
            nodes.add(Map.of("id", student.getId(), "label", Objects.requireNonNullElse(student.getUsername(), student.getId()),
                    "group", group++ % 4, "interests", student.getStringInterests()));
        }
        for (var vertex = affinityGraph(profiles).getVertices(); vertex != null; vertex = vertex.getNextVertex()) {
            for (var edge = vertex.getEdgeList(); edge != null; edge = edge.getNextEdge()) {
                String source = vertex.getData();
                String target = edge.getAdjacent().getData();
                if (source.compareTo(target) < 0) links.add(Map.of("source", source, "target", target, "weight", 1.0));
            }
        }
        return List.of(Map.of("nodes", nodes, "links", links));
    }

    public List<String> findShortestPathBetweenStudents(String start, String target) {
        var vertices = new HashMap<String, GraphVertex<String>>();
        for (var vertex = getAffinityGraph().getVertices(); vertex != null; vertex = vertex.getNextVertex()) {
            vertices.put(vertex.getData(), vertex);
        }
        if (!vertices.containsKey(start) || !vertices.containsKey(target)) return List.of();
        var queue = new ArrayDeque<String>();
        var parent = new HashMap<String, String>();
        queue.add(start);
        parent.put(start, null);
        while (!queue.isEmpty()) {
            String current = queue.remove();
            if (current.equals(target)) {
                var path = new LinkedList<String>();
                for (String next = current; next != null; next = parent.get(next)) path.addFirst(next);
                return path;
            }
            for (var edge = vertices.get(current).getEdgeList(); edge != null; edge = edge.getNextEdge()) {
                String adjacent = edge.getAdjacent().getData();
                if (!parent.containsKey(adjacent)) {
                    parent.put(adjacent, current);
                    queue.add(adjacent);
                }
            }
        }
        return List.of();
    }

    public List<Map<String, Object>> getTopicActivityData() {
        return domain.read(() -> {
            var counts = new HashMap<String, Integer>();
            for (var content : getAllContent()) countTopics(counts, content.getTopics());
            for (var request : getAllHelpRequests()) countTopics(counts, request.getTopics());
            List<Interest> topics = interests.findAll();
            if (counts.isEmpty()) {
                return topics.stream().limit(5).<Map<String, Object>>map(topic -> Map.of("topic", topic.getName(), "contents", 0)).toList();
            }
            return topics.stream().filter(topic -> counts.containsKey(topic.getName()))
                    .<Map<String, Object>>map(topic -> Map.of("topic", topic.getName(), "contents", counts.get(topic.getName()))).toList();
        });
    }

    private static void countTopics(Map<String, Integer> counts, Iterable<Interest> topics) {
        for (var topic : topics) counts.merge(topic.getName(), 1, Integer::sum);
    }

    public List<Map<String, Object>> getParticipationLevelsData() {
        return domain.read(() -> {
            var now = LocalDate.now();
            int[] weekly = new int[4];
            for (var content : getAllContent()) countWeek(weekly, content.getDate(), now);
            for (var request : getAllHelpRequests()) countWeek(weekly, request.getRequestDate(), now);
            var rows = new ArrayList<Map<String, Object>>();
            for (int i = 0; i < weekly.length; i++) rows.add(Map.of("week", "Sem " + (i + 1), "activity", weekly[i]));
            return rows;
        });
    }

    private static void countWeek(int[] weekly, LocalDate date, LocalDate now) {
        long weeksAgo = ChronoUnit.WEEKS.between(date, now);
        if (weeksAgo >= 0 && weeksAgo < weekly.length) weekly[weekly.length - 1 - (int) weeksAgo]++;
    }

    public List<Map<String, Object>> getCommunityDetectionData() {
        return domain.read(() -> {
            var communities = new HashMap<String, Set<String>>();
            for (var student : students.findAll()) {
                for (var topic : student.getInterests()) {
                    communities.computeIfAbsent(topic.getIdInterest(), key -> new LinkedHashSet<>()).add(student.getUsername());
                }
            }
            var rows = new ArrayList<Map<String, Object>>();
            for (var topic : interests.findAll()) {
                var members = communities.get(topic.getIdInterest());
                if (members != null) rows.add(Map.of("id", rows.size() + 1, "topic", topic.getName(), "students", String.join(", ", members)));
            }
            return rows;
        });
    }

    public List<Map<String, Object>> getMostConnectedUsers() {
        var profiles = getUsers().getStudents();
        var byId = new HashMap<String, Student>();
        for (var student : profiles) byId.put(student.getId(), student);
        var rows = new ArrayList<Map<String, Object>>();
        for (var vertex = affinityGraph(profiles).getVertices(); vertex != null; vertex = vertex.getNextVertex()) {
            int connections = 0;
            for (var edge = vertex.getEdgeList(); edge != null; edge = edge.getNextEdge()) connections++;
            Student student = byId.get(vertex.getData());
            rows.add(Map.of("id", student.getId(), "username", student.getUsername(), "connections", connections,
                    "name", student.getFirstName() + " " + student.getLastName(),
                    "avatar", "https://avatar.vercel.sh/" + student.getUsername() + ".png?size=40"));
        }
        rows.sort(Comparator.comparingInt((Map<String, Object> row) -> (int) row.get("connections")).reversed());
        return rows.stream().limit(5).toList();
    }

    public Map<String, Object> getFullAnalyticsData() {
        return domain.read(() -> Map.of("topicActivity", getTopicActivityData(), "participationLevels", getParticipationLevelsData(),
                "communityClusters", getCommunityDetectionData()));
    }

    private static <T> DoublyLinkedList<T> linked(List<T> items) {
        return ListToDoublyLinkedList.convert(items);
    }
}
