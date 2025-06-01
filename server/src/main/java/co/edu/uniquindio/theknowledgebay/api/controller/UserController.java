package co.edu.uniquindio.theknowledgebay.api.controller;


import co.edu.uniquindio.theknowledgebay.api.dto.AuthResponseDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.ProfileResponseDTO;
import co.edu.uniquindio.theknowledgebay.core.model.Interest;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.service.SessionManager;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.DoublyLinkedNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final TheKnowledgeBay theKnowledgeBay;
    private final SessionManager sessionManager;

    @GetMapping
    public ResponseEntity<List<ProfileResponseDTO>> getAllUsers(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String interest) {
        
        String currentUserId = null;
        if (token != null && !token.isEmpty() && !token.equals("null")) {
            currentUserId = sessionManager.getCurrentUserId(token); // Assuming token might be the string "null"
        }

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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{userId}/follow")
    public ResponseEntity<AuthResponseDTO> followUser(
            @PathVariable String userId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        String currentUserId = sessionManager.getCurrentUserId(token);
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponseDTO(false, "Token de autorización requerido."));
        }

        if (currentUserId.equals(userId)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AuthResponseDTO(false, "No puedes seguirte a ti mismo."));
        }

        try {
            boolean success = theKnowledgeBay.followUser(currentUserId, userId);
            if (success) {
                return ResponseEntity.ok(new AuthResponseDTO(true, "Usuario seguido exitosamente."));
            } else {
                // Could be because user not found, or trying to follow non-student, or other logic error
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new AuthResponseDTO(false, "No se pudo seguir al usuario. Verifique los IDs."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDTO(false, "Error interno del servidor: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{userId}/follow")
    public ResponseEntity<AuthResponseDTO> unfollowUser(
            @PathVariable String userId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        String currentUserId = sessionManager.getCurrentUserId(token);
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponseDTO(false, "Token de autorización requerido."));
        }

        try {
            boolean success = theKnowledgeBay.unfollowUser(currentUserId, userId);
            if (success) {
                return ResponseEntity.ok(new AuthResponseDTO(true, "Usuario no seguido exitosamente."));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new AuthResponseDTO(false, "No se pudo dejar de seguir al usuario. Verifique los IDs."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDTO(false, "Error interno del servidor: " + e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProfileResponseDTO>> searchUsers(
            @RequestParam String query,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        String currentUserId = null;
        if (token != null && !token.isEmpty() && !token.equals("null")) {
            currentUserId = sessionManager.getCurrentUserId(token);
        }

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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}