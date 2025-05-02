package co.edu.uniquindio.theknowledgebay.service;

import co.edu.uniquindio.theknowledgebay.model.Moderator;
import co.edu.uniquindio.theknowledgebay.model.Student;
import co.edu.uniquindio.theknowledgebay.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.model.User;
import co.edu.uniquindio.theknowledgebay.util.datastructures.nodes.DoublyLinkedNode;
import co.edu.uniquindio.theknowledgebay.service.SessionManager; // Add import for SessionManager
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired; // Keep Autowired
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
// Removed UUID import

@Service
@RequiredArgsConstructor // Now includes PasswordEncoder and SessionManager
@Slf4j
public class InMemoryAuthService {

    // Inject the central data store and password encoder
    @Autowired // Field injection for TheKnowledgeBay (singleton)
    private TheKnowledgeBay theKnowledgeBay;

    private final PasswordEncoder passwordEncoder;
    private final SessionManager sessionManager; // Inject SessionManager

    public Optional<User> findUserByEmail(String email) {
        Moderator moderator = theKnowledgeBay.getModerator();
        if (moderator != null && moderator.getEmail().equalsIgnoreCase(email)) {
            return Optional.of(moderator);
        }
        // Manual iteration using data from TheKnowledgeBay
        DoublyLinkedNode<Student> current = theKnowledgeBay.getStudents().getHead();
        while (current != null) {
            Student student = current.getData();
            if (student.getEmail().equalsIgnoreCase(email)) {
                return Optional.of(student);
            }
            current = current.getNext();
        }
        return Optional.empty();
    }

    public boolean doesEmailExist(String email) {
        Moderator moderator = theKnowledgeBay.getModerator();
        if (moderator != null && moderator.getEmail().equalsIgnoreCase(email)) {
            return true;
        }
        // Manual iteration using data from TheKnowledgeBay
        DoublyLinkedNode<Student> current = theKnowledgeBay.getStudents().getHead();
        while (current != null) {
            Student student = current.getData();
            if (student.getEmail().equalsIgnoreCase(email)) {
                return true;
            }
            current = current.getNext();
        }
        return false;
    }

    public boolean registerStudent(Student student) {
        if (doesEmailExist(student.getEmail())) {
            log.warn("Registration attempt for existing email: {}", student.getEmail());
            return false; // Email already exists
        }
        // Hash password using injected encoder
        student.setPassword(passwordEncoder.encode(student.getPassword()));
        // Ensure biography is initialized if not set
        if (student.getBiography() == null) {
            student.setBiography("");
        }
        // Add student to the central store
        theKnowledgeBay.getStudents().addLast(student);
        log.info("Registered new student: {}", student.getEmail());
        return true;
    }

    public Optional<String> login(String email, String rawPassword) {
        Optional<User> userOpt = findUserByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Use injected encoder for password matching
            if (passwordEncoder.matches(rawPassword, user.getPassword())) {
                // Credentials valid, generate token
                // Create session using SessionManager
                String token = sessionManager.createSession(user.getEmail());
                log.info("Login successful for user: {}", email);
                return Optional.of(token);
            } else {
                log.warn("Invalid password attempt for user: {}", email);
            }
        } else {
            log.warn("Login attempt for non-existent user: {}", email);
        }
        return Optional.empty(); // Login failed
    }

    public Optional<String> validateToken(String token) {
        // Validate against the central session store
        // Validate using SessionManager
        return Optional.ofNullable(sessionManager.getUserIdentifier(token));
    }

    public void logout(String token) {
        // Remove session from the central store
        // Remove session using SessionManager
        sessionManager.removeSession(token);
        // Logging can be simplified or removed if SessionManager handles it
        log.info("Logout requested for token: {}", token);
        // Removed old logging based on removedEmail
    }

    // Removed generateSessionToken() method - logic moved to SessionManager

    // Helper to get user role - needed for LoginResponseDTO
    public String getUserRole(String email) {
        Moderator moderator = theKnowledgeBay.getModerator();
        if (moderator != null && moderator.getEmail().equalsIgnoreCase(email)) {
            return "Moderator";
        }
        // Manual iteration using data from TheKnowledgeBay
        DoublyLinkedNode<Student> current = theKnowledgeBay.getStudents().getHead();
        while (current != null) {
            Student student = current.getData();
            if (student.getEmail().equalsIgnoreCase(email)) {
                return "Student";
            }
            current = current.getNext();
        }
        log.warn("Could not determine role for existing email: {}", email); // Should not happen
        return "Unknown";
    }
}