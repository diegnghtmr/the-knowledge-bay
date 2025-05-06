package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.api.dto.UserProfileDTO;
import co.edu.uniquindio.theknowledgebay.core.model.Interest;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.model.User;
import co.edu.uniquindio.theknowledgebay.core.service.InMemoryAuthService;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.DoublyLinkedNode;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final InMemoryAuthService authService;

    @Autowired // Add if constructor injection requires it in your setup
    public UserController(InMemoryAuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getUserProfile(HttpServletRequest request) {
        String userEmail = (String) request.getAttribute("userEmail");

        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<User> optionalUser = authService.findUserByEmail(userEmail);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = optionalUser.get();

        if (!(user instanceof Student)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User profile not available for this user type.");
        }
        Student student = (Student) user;

        List<String> interestNames = new ArrayList<>();
        if (student.getInterests() != null) {
            DoublyLinkedNode<Interest> currentNode = student.getInterests().getHead();
            while (currentNode != null) {
                Interest interest = currentNode.getData();
                if (interest != null && interest.getName() != null) {
                    interestNames.add(interest.getName());
                }
                currentNode = currentNode.getNext();
            }
            // Alternative using streams (if DoublyLinkedList supports stream() or can be converted):
            // interestNames = student.getInterests().stream()
            //                      .filter(i -> i != null && i.getName() != null)
            //                      .map(Interest::getName)
            //                      .collect(Collectors.toList());
        }

        String birthdateString = (student.getDateBirth() != null)
                                 ? student.getDateBirth().format(DateTimeFormatter.ISO_LOCAL_DATE)
                                 : null;

        UserProfileDTO userProfile = new UserProfileDTO(
                student.getName(),
                student.getLastName(),
                student.getUserName(),
                student.getEmail(),
                student.getBiography(), // Assuming Student has getBiography()
                birthdateString,
                interestNames
        );

        return ResponseEntity.ok(userProfile);
    }
}