package co.edu.uniquindio.theknowledgebay.model;

import co.edu.uniquindio.theknowledgebay.model.factories.UserFactory;
import co.edu.uniquindio.theknowledgebay.util.datastructures.trees.BinarySearchTree;
import co.edu.uniquindio.theknowledgebay.util.datastructures.graphs.UndirectedGraph;
import co.edu.uniquindio.theknowledgebay.util.datastructures.queues.PriorityQueue;
import co.edu.uniquindio.theknowledgebay.util.datastructures.lists.DoublyLinkedList;
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
import java.util.Properties;
// Removed Map and HashMap imports if no longer needed elsewhere

@Getter // Changed from Data
@NoArgsConstructor
// Removed AllArgsConstructor and Builder
@Component
@Scope(ConfigurableBeanFactory.SCOPE_SINGLETON)
public class TheKnowledgeBay {
    private final UserFactory userFactory = UserFactory.getInstance();

    // Centralized Data Storage
    private DoublyLinkedList<Student> students = new DoublyLinkedList<>();
    private Moderator moderator;
    // Removed activeSessions map - Moved to SessionManager

    // Existing fields
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
                this.moderator = Moderator.builder()
                        .email(email)
                        .password(hashedPassword) // Store hashed password
                        .name(name)
                        .build();
                System.out.println("Moderator loaded successfully: " + this.moderator.getEmail());
            } else {
                System.err.println("Error loading moderator: Missing properties (email, password, or name).");
                // Handle error appropriately - maybe throw an exception?
            }

        } catch (IOException e) {
            System.err.println("Error loading moderator properties file from " + moderatorPropertiesPath + ": " + e.getMessage());
            // Handle error appropriately
        } catch (Exception e) {
            System.err.println("An unexpected error occurred during moderator initialization: " + e.getMessage());
            // Handle error appropriately
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


}