package co.edu.uniquindio.theknowledgebay.core.service;

import co.edu.uniquindio.theknowledgebay.core.model.Moderator;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.model.User;
import co.edu.uniquindio.theknowledgebay.core.repository.DomainRepository;
import co.edu.uniquindio.theknowledgebay.core.repository.StudentRepository;
import co.edu.uniquindio.theknowledgebay.infrastructure.config.ModeratorProperties;
import co.edu.uniquindio.theknowledgebay.infrastructure.security.AuthenticatedUser;
import co.edu.uniquindio.theknowledgebay.infrastructure.security.AuthenticatedUser.Role;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.sql.init.dependency.DependsOnDatabaseInitialization;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.regex.Pattern;

@Service
@DependsOnDatabaseInitialization
@RequiredArgsConstructor
public class AuthService {
    private static final int MAX_PASSWORD_BYTES = 72;
    // Match supported BCrypt variants and reject unreasonably expensive imported hashes.
    private static final Pattern BCRYPT_HASH = Pattern.compile("\\$2[aby]\\$(?:0[4-9]|1[0-4])\\$[./A-Za-z0-9]{53}");

    private final TheKnowledgeBay domain;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessionManager sessionManager;
    private final DomainRepository transactions;
    private final ModeratorProperties moderator;

    @PostConstruct
    void syncModeratorSessions() {
        transactions.write(() -> {
            sessionManager.syncModerator(moderator, passwordEncoder);
            return null;
        });
    }

    public Optional<User> findUserByEmail(String email) {
        return findUser(user -> email != null && email.equalsIgnoreCase(user.getEmail()));
    }

    public Optional<User> findUserByUsername(String username) {
        return findUser(user -> username != null && username.equalsIgnoreCase(user.getUsername()));
    }

    public Optional<User> findUserById(String id) {
        return findUser(user -> id != null && id.equals(user.getId()));
    }

    private Optional<User> findUser(Predicate<User> matches) {
        Moderator moderator = domain.getUsers().getModerator();
        if (moderator != null && matches.test(moderator)) {
            return Optional.of(moderator);
        }
        var current = domain.getUsers().getStudents().getHead();
        while (current != null) {
            Student student = current.getData();
            if (matches.test(student)) {
                return Optional.of(student);
            }
            current = current.getNext();
        }
        return Optional.empty();
    }

    public synchronized String[] registerStudent(Student student) {
        if (student.getEmail() == null || student.getEmail().isBlank() || student.getUsername() == null || student.getUsername().isBlank()) {
            return new String[] { "false", "Email and username are required." };
        }
        if (!isAcceptablePassword(student.getPassword())) {
            return new String[] { "false", "Password must be nonblank and at most 72 UTF-8 bytes." };
        }
        if (findUserByUsername(student.getUsername()).isPresent()) {
            return new String[] { "false", "Username already exists." };
        }
        if (findUserByEmail(student.getEmail()).isPresent()) {
            return new String[] { "false", "Email already exists." };
        }

        student.setPassword(passwordEncoder.encode(student.getPassword()));
        if (student.getBiography() == null) {
            student.setBiography("");
        }
        if (student.getInterests() == null) {
            student.setInterests(new DoublyLinkedList<>());
        }

        domain.addStudent(student);
        domain.updateAutomaticStudyGroupsForStudent(student);
        return new String[] { "true", "Student registered successfully." };
    }

    public Optional<LoginSession> login(String email, String rawPassword) {
        if (!isAcceptablePassword(rawPassword)) {
            return Optional.empty();
        }
        return findUserByEmail(email).flatMap(user -> {
            String id = user.getId();
            String verifiedHash = user.getPassword();
            Role role = user instanceof Moderator ? Role.MODERATOR : Role.STUDENT;
            if (id == null || id.isBlank() || !isSupportedPasswordHash(verifiedHash)
                    || !passwordEncoder.matches(rawPassword, verifiedHash)) {
                return Optional.empty();
            }
            return transactions.write(() -> {
                if (role == Role.STUDENT) {
                    // Profile reads return snapshots. Recheck the verified credential under the same
                    // write boundary that changes passwords and revokes sessions.
                    var current = studentRepository.findById(id);
                    if (current == null || !verifiedHash.equals(current.getPassword())
                            || !email.equalsIgnoreCase(current.getEmail())) return Optional.empty();
                }
                var principal = new AuthenticatedUser(id, role);
                return Optional.of(new LoginSession(sessionManager.createSession(principal), principal));
            });
        });
    }

    public void changeStudentPassword(Student patch, List<String> interests, String rawPassword) {
        if (!isAcceptablePassword(rawPassword)) {
            throw new IllegalArgumentException("Invalid password.");
        }
        patch.setPassword(passwordEncoder.encode(rawPassword));
        transactions.write(() -> {
            domain.updateUser(patch.getId(), patch, interests);
            sessionManager.revokeStudent(patch.getId());
            return null;
        });
    }

    public static boolean isAcceptablePassword(String password) {
        return password != null && !password.isBlank() && password.getBytes(StandardCharsets.UTF_8).length <= MAX_PASSWORD_BYTES;
    }

    public static boolean isSupportedPasswordHash(String passwordHash) {
        return passwordHash != null && BCRYPT_HASH.matcher(passwordHash).matches();
    }

    public record LoginSession(String token, AuthenticatedUser user) {
        @Override
        public String toString() {
            return "LoginSession[redacted]";
        }
    }
}
