package co.edu.uniquindio.theknowledgebay.core.service;

import co.edu.uniquindio.theknowledgebay.core.dto.AuthResultDTO;
import co.edu.uniquindio.theknowledgebay.core.model.Moderator;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.model.User;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.DoublyLinkedNode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired; // Keep Autowired
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

    public boolean registerStudent(Student student) {
        Optional<User> userOpt = findUserByEmail(student.getEmail());
        if (userOpt.isPresent()) {
            log.warn("Registration attempt for existing email: {}", student.getEmail());
            return false;
        }

        student.setPassword(passwordEncoder.encode(student.getPassword()));
        if (student.getBiography() == null) {
            student.setBiography("");
        }

        domain.addStudent(student);
        log.info("Registered new student: {}", student.getEmail());
        return true;
    }

    public Optional<AuthResultDTO> login(String email, String rawPassword) {
        Optional<User> userOpt = findUserByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(rawPassword, user.getPassword())) {
                String token = sessionManager.createSession(user.getEmail());
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