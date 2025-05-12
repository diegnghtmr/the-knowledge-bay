package co.edu.uniquindio.theknowledgebay.core.model;

import co.edu.uniquindio.theknowledgebay.core.factory.UserFactory;
import co.edu.uniquindio.theknowledgebay.core.repository.StudentRepository;
import co.edu.uniquindio.theknowledgebay.infrastructure.config.ModeratorProperties;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.queues.PriorityQueue;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.trees.BinarySearchTree;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.DoublyLinkedNode;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Scope;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import java.time.LocalDate;
import java.util.List;

@Getter
@Component
@Scope(ConfigurableBeanFactory.SCOPE_SINGLETON)
public class TheKnowledgeBay {

    // DataBase connection
    @Autowired
    private final StudentRepository studentRepository;

    // Data storage
    private final UserFactory users = UserFactory.getInstance();
    private BinarySearchTree<Content> contentTree;
    private PriorityQueue<HelpRequest> helpRequestQueue;
    private final DoublyLinkedList<StudyGroup> studyGroups = new DoublyLinkedList<>();
    private final DoublyLinkedList<Chat> chats = new DoublyLinkedList<>();
    private final DoublyLinkedList<Comment> comments = new DoublyLinkedList<>();
    private final DoublyLinkedList<Message> messages = new DoublyLinkedList<>();
    private final DoublyLinkedList<Interest> interests = new DoublyLinkedList<>();

    // Dependencies for Moderator loading
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ModeratorProperties props;

    @Autowired
    public TheKnowledgeBay(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public void addStudent(Student student) {
        users.add(student);
        studentRepository.save(student);
    }

    public void createContent(Content c) {
        if (contentTree == null) {
            contentTree = new BinarySearchTree<>();
        }
        contentTree.insert(c);
    }

    public void createAutomaticGroups() {
        // TODO: implement functionality
    }

    public DoublyLinkedList<Student> findShortestPath(Student s1, Student s2) {
        // TODO: implement functionality
        return null;
    }

    public void processHelpRequests() {
        // TODO: implement functionality
    }

    @PostConstruct
    public void initialize() {
        // Initialize moderator
        String password = passwordEncoder.encode(props.password());
        users.setModerator(props, password);

        // Initialize students
        List<Student> students = studentRepository.findAll();
        for (Student student : students) {
            this.users.add(student);
        }
    }

    /**
     * Retrieves a User by ID, applying defaults for Student fields.
     * @param userId the user ID as String
     * @return the User or null if not found
     */
    public User getUserById(String userId) {
        int id;
        try {
            id = Integer.parseInt(userId);
        } catch (NumberFormatException e) {
            return null;
        }
        // check moderator
        Moderator mod = users.getModerator();
        if (mod.getId() != null && mod.getId().equals(id)) {
            return mod;
        }
        // search students
        DoublyLinkedNode<Student> current = users.getStudents().getHead();
        while (current != null) {
            Student s = current.getData();
            if (s.getId() != null && s.getId().equals(id)) {
                if (s.getBiography() == null || s.getBiography().isEmpty()) {
                    s.setBiography("[Tu biografía aquí]");
                }
                if (s.getDateBirth() == null) {
                    s.setDateBirth(LocalDate.of(1900, 1, 1));
                }
                return s;
            }
            current = current.getNext();
        }
        return null;
    }

    /**
     * Merges non-null fields from an updated User into the existing one.
     * @param userId the user ID as String
     * @param updated the User with updated values
     */
    public void updateUser(String userId, User updated) {
        int id;
        try {
            id = Integer.parseInt(userId);
        } catch (NumberFormatException e) {
            return;
        }
        // update moderator
        Moderator mod = users.getModerator();
        if (mod.getId() != null && mod.getId().equals(id)) {
            if (updated.getUsername() != null) mod.setUsername(updated.getUsername());
            if (updated.getEmail() != null) mod.setEmail(updated.getEmail());
            if (updated.getPassword() != null) mod.setPassword(updated.getPassword());
            return;
        }
        // search students
        DoublyLinkedNode<Student> current = users.getStudents().getHead();
        while (current != null) {
            Student s = current.getData();
            if (s.getId() != null && s.getId().equals(id)) {
                // update common fields
                if (updated.getUsername() != null) s.setUsername(updated.getUsername());
                if (updated.getEmail() != null) s.setEmail(updated.getEmail());
                if (updated.getPassword() != null) s.setPassword(updated.getPassword());
                // update student-specific fields
                if (updated instanceof Student) {
                    Student us = (Student) updated;
                    if (us.getFirstName() != null) s.setFirstName(us.getFirstName());
                    if (us.getLastName() != null) s.setLastName(us.getLastName());
                    if (us.getDateBirth() != null) s.setDateBirth(us.getDateBirth());
                    if (us.getBiography() != null) s.setBiography(us.getBiography());
                }
                return;
            }
            current = current.getNext();
        }
    }
}