package co.edu.uniquindio.theknowledgebay.core.service;

import co.edu.uniquindio.theknowledgebay.core.dto.AuthResultDTO;
import co.edu.uniquindio.theknowledgebay.core.model.Moderator;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.model.User;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.DoublyLinkedNode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired; // Keep Autowired
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.lang.reflect.MalformedParameterizedTypeException;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor // Now includes PasswordEncoder and SessionManager
@Slf4j
public class AuthService {

    @Autowired
    private TheKnowledgeBay domain;

    private final PasswordEncoder passwordEncoder;
    private final SessionManager sessionManager; // Inject SessionManager

    public Optional<User> findUserByEmail(String email) {
        Moderator moderator = domain.getUsers().getModerator();
        if (moderator != null && moderator.getEmail().equalsIgnoreCase(email)) {
            return Optional.of(moderator);
        }
        // Manual iteration using data from TheKnowledgeBay
        DoublyLinkedNode<Student> current = domain.getUsers().getStudents().getHead();
        while (current != null) {
            Student student = current.getData();
            if (student.getEmail().equalsIgnoreCase(email)) {
                return Optional.of(student);
            }
            current = current.getNext();
        }

        return Optional.empty();
    }

    public Optional<User> findUserByUsername(String username) {
        Moderator moderator = domain.getUsers().getModerator();
        if (moderator != null && moderator.getUsername().equalsIgnoreCase(username)) {
            return Optional.of(moderator);
        }
        // Manual iteration using data from TheKnowledgeBay
        DoublyLinkedNode<Student> current = domain.getUsers().getStudents().getHead();
        while (current != null) {
            Student student = current.getData();
            if (student.getUsername().equalsIgnoreCase(username)) {
                return Optional.of(student);
            }
            current = current.getNext();
        }

        return Optional.empty();
    }

    public String[] registerStudent(Student student) {

        if (findUserByUsername(student.getUsername()).isPresent()) {
            log.warn("Registration attempt for existing username: {}", student.getEmail());
            return new String[] { "false", "Username already exists." };
        }

        if (findUserByEmail(student.getEmail()).isPresent()) {
            log.warn("Registration attempt for existing email: {}", student.getEmail());
            return new String[] { "false", "Email already exists." };
        }

        student.setPassword(passwordEncoder.encode(student.getPassword()));
        if (student.getBiography() == null) {
            student.setBiography("");
        }
        // Ensure interests list is initialized if it's null, though it should be set by controller
        if (student.getInterests() == null) {
            student.setInterests(new DoublyLinkedList<>());
        }

        domain.addStudent(student); // Adds student to UserFactory and persists (if configured)
        log.info("Registered new student: {}", student.getEmail());
        
        // After student is added and their initial interests are set,
        // update/create automatic study groups.
        domain.updateAutomaticStudyGroupsForStudent(student);

        return new String[] { "true", "Student registered successfully." };
    }

    public Optional<AuthResultDTO> login(String email, String rawPassword) {
        Optional<User> userOpt = findUserByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(rawPassword, user.getPassword())) {
                String userId = user.getId() != null ? user.getId() : user.getEmail();
                String token = sessionManager.createSession(userId);
                String role = getUserRole(user);
                log.info("Login successful for user: {}", email);
                return Optional.of(new AuthResultDTO(token, role));
            } else {
                log.warn("Invalid password attempt for user: {}", email);
            }
        } else {
            log.warn("Login attempt for non-existent user: {}", email);
        }
        return Optional.empty();
    }

    public Optional<String> validateToken(String token) {
        // Validate against the central session store
        // Validate using SessionManager
        return Optional.ofNullable(sessionManager.getUserIdentifier(token));
    }

    public boolean isValidToken(String token) {
        return validateToken(token).isPresent();
    }

    public void logout(String token) {
        sessionManager.removeSession(token);
        log.info("Logout requested for token: {}", token);
    }

    private String getUserRole(User user) {
        if (user instanceof Moderator) {
            return "Moderator";
        } else if (user instanceof Student) {
            return "Student";
        } else {
            return "Unknown";
        }
    }

}