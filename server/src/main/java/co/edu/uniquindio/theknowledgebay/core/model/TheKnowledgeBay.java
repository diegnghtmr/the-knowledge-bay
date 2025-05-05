package co.edu.uniquindio.theknowledgebay.core.model;

import co.edu.uniquindio.theknowledgebay.core.factory.UserFactory;
import co.edu.uniquindio.theknowledgebay.core.repository.StudentRepository;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.queues.PriorityQueue;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.trees.BinarySearchTree;
import jakarta.annotation.PostConstruct;
import lombok.Getter; // Changed from Data
import lombok.NoArgsConstructor;
// Removed Builder and AllArgsConstructor imports
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Scope;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Properties;

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
    private DoublyLinkedList<StudyGroup> studyGroups = new DoublyLinkedList<>();
    private DoublyLinkedList<Chat> chats = new DoublyLinkedList<>();
    private DoublyLinkedList<Comment> comments = new DoublyLinkedList<>();
    private DoublyLinkedList<Message> messages = new DoublyLinkedList<>();
    private DoublyLinkedList<Interest> interests = new DoublyLinkedList<>();

    // Dependencies for Moderator Loading
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ResourceLoader resourceLoader;

    @Value("${moderator.properties.path:classpath:moderator.properties}")
    private String moderatorPropertiesPath;

    @Autowired
    public TheKnowledgeBay(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;

        this.initialize();
    }


    @PostConstruct
    private void initializeModerator() {
        Properties props = new Properties();
        try {
            Resource resource = resourceLoader.getResource(moderatorPropertiesPath);
            InputStream inputStream = resource.getInputStream();
            props.load(inputStream);
            inputStream.close();

            String email = props.getProperty("moderator.email");
            String password = props.getProperty("moderator.password"); // Plain text from properties
            String name = props.getProperty("moderator.name");

            if (email != null && password != null && name != null) {
                String hashedPassword = passwordEncoder.encode(password);
                System.out.println("Moderator loaded successfully: " + this.users.getModerator().getEmail());
            } else {
                System.err.println("Error loading moderator: Missing properties (email, password, or name).");
                // Handle error appropriately - maybe throw an exception?
            }

        } catch (IOException e) {
            System.err.println("Error loading moderator properties file from " + moderatorPropertiesPath + ": " + e.getMessage());
        } catch (Exception e) {
            System.err.println("An unexpected error occurred during moderator initialization: " + e.getMessage());
        }
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

    public void initialize() {
        // Initialize moderator
        Moderator moderator = users.getModerator();

        // Initialize students
        List<Student> students = studentRepository.findAll();
        for (Student student : students) {
            this.users.addStudent(student);
        }


    }


}