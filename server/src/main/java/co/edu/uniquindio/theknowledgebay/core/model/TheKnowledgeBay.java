package co.edu.uniquindio.theknowledgebay.core.model;

import co.edu.uniquindio.theknowledgebay.core.factory.UserFactory;
import co.edu.uniquindio.theknowledgebay.core.repository.StudentRepository;
import co.edu.uniquindio.theknowledgebay.infrastructure.config.ModeratorProperties;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.queues.PriorityQueue;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.trees.BinarySearchTree;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Scope;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import java.util.List;

@Getter
@Component
@Scope(ConfigurableBeanFactory.SCOPE_SINGLETON)
public class TheKnowledgeBay {

   // DataBase connection
    @Autowired
    private final StudentRepository studentRepository;


   // field for data storage
    private final UserFactory users = UserFactory.getInstance();
    private BinarySearchTree<Content> contentTree;
    private PriorityQueue<HelpRequest> helpRequestQueue;
    private final DoublyLinkedList<StudyGroup> studyGroups = new DoublyLinkedList<>();
    private final DoublyLinkedList<Chat> chats = new DoublyLinkedList<>();
    private final DoublyLinkedList<Comment> comments = new DoublyLinkedList<>();
    private final DoublyLinkedList<Message> messages = new DoublyLinkedList<>();
    private final DoublyLinkedList<Interest> interests = new DoublyLinkedList<>();

    // Dependencies for Moderator Loading
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
}