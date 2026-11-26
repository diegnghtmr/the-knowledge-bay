package co.edu.uniquindio.theknowledgebay.api.controller;


import co.edu.uniquindio.theknowledgebay.api.config.ApiFailure;
import co.edu.uniquindio.theknowledgebay.api.dto.AuthResponseDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.ProfileResponseDTO;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.service.AuthService;
import co.edu.uniquindio.theknowledgebay.infrastructure.security.AuthenticatedUser;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.DoublyLinkedNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final TheKnowledgeBay theKnowledgeBay;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<ProfileResponseDTO>> getAllUsers(
            @AuthenticationPrincipal AuthenticatedUser caller,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String interest) {
        String currentUserId = authService.findUserById(caller.id()).isPresent() ? caller.id() : null;

        try {
            List<ProfileResponseDTO> users = new ArrayList<>();
            
            // Get all students
            DoublyLinkedNode<Student> current = theKnowledgeBay.getUsers().getStudents().getHead();
            while (current != null) {
                Student student = current.getData();
                
                // Apply filters
                boolean matchesSearch = true;
                boolean matchesInterest = true;
                
                if (search != null && !search.trim().isEmpty()) {
                    String searchLower = search.toLowerCase();
                    matchesSearch = (student.getUsername() != null && student.getUsername().toLowerCase().contains(searchLower)) ||
                                   (student.getFirstName() != null && student.getFirstName().toLowerCase().contains(searchLower)) ||
                                   (student.getLastName() != null && student.getLastName().toLowerCase().contains(searchLower)) ||
                                   (student.getEmail() != null && student.getEmail().toLowerCase().contains(searchLower));
                }
                
                if (interest != null && !interest.trim().isEmpty()) {
                    matchesInterest = false;
                    List<String> studentInterests = student.getStringInterests();
                    if (studentInterests != null) {
                        for (String studentInterest : studentInterests) {
                            if (studentInterest.toLowerCase().contains(interest.toLowerCase())) {
                                matchesInterest = true;
                                break;
                            }
                        }
                    }
                }
                
                if (matchesSearch && matchesInterest) {
                    // Convert interests to list of strings
                    List<String> interestNames = student.getStringInterests();
                    
                    ProfileResponseDTO dto = ProfileResponseDTO.builder()
                            .id(student.getId())
                            .username(student.getUsername())
                            .email(student.getEmail())
                            .firstName(student.getFirstName())
                            .lastName(student.getLastName())
                            .dateBirth(student.getDateBirth())
                            .biography(student.getBiography())
                            .interests(interestNames)
                            .contentCount(theKnowledgeBay.getContentCountByUserId(student.getId()))
                            .helpRequestCount(theKnowledgeBay.getHelpRequestCountByUserId(student.getId()))
                            .currentUserFollowing(currentUserId != null && theKnowledgeBay.isUserFollowing(currentUserId, student.getId()))
                            .following(student.getFollowingCount())
                            .followers(student.getFollowersCount())
                            .build();
                    
                    users.add(dto);
                }
                
                current = current.getNext();
            }
            
            return ResponseEntity.ok(users);

        } catch (Exception e) {
            ApiFailure.report("users.list");
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{userId}/follow")
    public ResponseEntity<AuthResponseDTO> followUser(
            @PathVariable String userId,
            @AuthenticationPrincipal AuthenticatedUser caller) {
        if (caller.id().equals(userId)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AuthResponseDTO(false, "No puedes seguirte a ti mismo."));
        }

        try {
            boolean success = isStudent(caller.id()) && isStudent(userId) && theKnowledgeBay.followUser(caller.id(), userId);
            if (success) {
                return ResponseEntity.ok(new AuthResponseDTO(true, "Usuario seguido exitosamente."));
            } else {
                // Could be because user not found, or trying to follow non-student, or other logic error
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new AuthResponseDTO(false, "No se pudo seguir al usuario. Verifique los IDs."));
            }
        } catch (Exception e) {
            return failure("users.follow");
        }
    }

    @DeleteMapping("/{userId}/follow")
    public ResponseEntity<AuthResponseDTO> unfollowUser(
            @PathVariable String userId,
            @AuthenticationPrincipal AuthenticatedUser caller) {
        try {
            boolean success = isStudent(caller.id()) && isStudent(userId) && theKnowledgeBay.unfollowUser(caller.id(), userId);
            if (success) {
                return ResponseEntity.ok(new AuthResponseDTO(true, "Usuario no seguido exitosamente."));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new AuthResponseDTO(false, "No se pudo dejar de seguir al usuario. Verifique los IDs."));
            }
        } catch (Exception e) {
            return failure("users.unfollow");
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProfileResponseDTO>> searchUsers(
            @RequestParam String query,
            @AuthenticationPrincipal AuthenticatedUser caller) {
        String currentUserId = authService.findUserById(caller.id()).isPresent() ? caller.id() : null;

        try {
            List<ProfileResponseDTO> users = new ArrayList<>();
            String queryLower = query.toLowerCase();
            
            // Search through all students
            DoublyLinkedNode<Student> current = theKnowledgeBay.getUsers().getStudents().getHead();
            while (current != null) {
                Student student = current.getData();
                
                // Check if student matches search query
                boolean matches = (student.getUsername() != null && student.getUsername().toLowerCase().contains(queryLower)) ||
                                 (student.getFirstName() != null && student.getFirstName().toLowerCase().contains(queryLower)) ||
                                 (student.getLastName() != null && student.getLastName().toLowerCase().contains(queryLower)) ||
                                 (student.getEmail() != null && student.getEmail().toLowerCase().contains(queryLower));
                
                // Also check interests
                if (!matches) {
                    List<String> studentInterests = student.getStringInterests();
                    if (studentInterests != null) {
                        for (String studentInterest : studentInterests) {
                            if (studentInterest.toLowerCase().contains(queryLower)) {
                                matches = true;
                                break;
                            }
                        }
                    }
                }
                
                if (matches) {
                    // Convert interests to list of strings
                    List<String> interestNames = student.getStringInterests();
                    
                    ProfileResponseDTO dto = ProfileResponseDTO.builder()
                            .id(student.getId())
                            .username(student.getUsername())
                            .email(student.getEmail())
                            .firstName(student.getFirstName())
                            .lastName(student.getLastName())
                            .dateBirth(student.getDateBirth())
                            .biography(student.getBiography())
                            .interests(interestNames)
                            .contentCount(theKnowledgeBay.getContentCountByUserId(student.getId()))
                            .helpRequestCount(theKnowledgeBay.getHelpRequestCountByUserId(student.getId()))
                            .currentUserFollowing(currentUserId != null && theKnowledgeBay.isUserFollowing(currentUserId, student.getId()))
                            .following(student.getFollowingCount())
                            .followers(student.getFollowersCount())
                            .build();
                    
                    users.add(dto);
                }
                
                current = current.getNext();
            }
            
            return ResponseEntity.ok(users);

        } catch (Exception e) {
            ApiFailure.report("users.search");
            return ResponseEntity.internalServerError().build();
        }
    }

    private boolean isStudent(String id) {
        return authService.findUserById(id).orElse(null) instanceof Student;
    }

    private static ResponseEntity<AuthResponseDTO> failure(String operation) {
        ApiFailure.report(operation);
        return ResponseEntity.internalServerError().body(new AuthResponseDTO(false, "Error interno del servidor."));
    }
}