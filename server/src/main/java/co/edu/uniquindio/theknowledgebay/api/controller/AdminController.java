package co.edu.uniquindio.theknowledgebay.api.controller;


import co.edu.uniquindio.theknowledgebay.api.dto.AuthResponseDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.ContentResponseDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.HelpRequestResponseDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.ProfileResponseDTO;
import co.edu.uniquindio.theknowledgebay.core.model.*;
import co.edu.uniquindio.theknowledgebay.core.service.SessionManager;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.DoublyLinkedNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {

    private final TheKnowledgeBay theKnowledgeBay;
    private final SessionManager sessionManager;

    // Admin statistics endpoints
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAdminStats(
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        String currentUserId = sessionManager.getCurrentUserId(token);
        // For development, allow access without authentication
        if (currentUserId == null) {
            currentUserId = "admin"; // Default admin user for development
        }

        // For development, skip moderator verification or create one if doesn't exist
        User user = theKnowledgeBay.getUserById(currentUserId);
        if (user == null) {
            // Allow access for development - in production this should be stricter
            System.out.println("Admin access granted for development purposes");
        }

        try {
            Map<String, Object> stats = new HashMap<>();
            
            // KPIs
            Map<String, Object> kpis = new HashMap<>();
            kpis.put("totalUsers", getTotalUsers());
            kpis.put("totalContent", getTotalContent());
            kpis.put("totalHelpRequests", getTotalHelpRequests());
            kpis.put("totalGroups", getTotalGroups());
            
            stats.put("kpis", kpis);
            
            // Most valued content
            stats.put("mostValuedContent", getMostValuedContent());
            
            // Most connected users (placeholder for now)
            stats.put("mostConnectedUsers", getMostConnectedUsers());
            
            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<ProfileResponseDTO>> getAllUsers(
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        String currentUserId = sessionManager.getCurrentUserId(token);
        // For development, allow access without authentication
        if (currentUserId == null) {
            currentUserId = "admin"; // Default admin user for development
        }

        // For development, skip moderator verification
        User user = theKnowledgeBay.getUserById(currentUserId);
        if (user == null) {
            System.out.println("Admin access granted for development purposes");
        }

        try {
            List<ProfileResponseDTO> users = new ArrayList<>();
            
            // Get all students
            DoublyLinkedNode<Student> current = theKnowledgeBay.getUsers().getStudents().getHead();
            while (current != null) {
                Student student = current.getData();
                
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
                        .build();
                
                users.add(dto);
                current = current.getNext();
            }
            
            return ResponseEntity.ok(users);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<AuthResponseDTO> updateUser(
            @PathVariable String userId,
            @RequestBody ProfileResponseDTO updatedUser,
            @RequestHeader(value = "Authorization", required = false) String token) {

        String currentUserId = sessionManager.getCurrentUserId(token);
        // For development, allow access without authentication
        if (currentUserId == null) {
            currentUserId = "admin"; // Default admin user for development
        }

        // For development, skip moderator verification
        User user = theKnowledgeBay.getUserById(currentUserId);
        if (user == null) {
            System.out.println("Admin access granted for development purposes");
        } else if (!(user instanceof Moderator)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new AuthResponseDTO(false, "Access denied. Only moderators can update users."));
        }
        
        try {
            boolean success = theKnowledgeBay.updateStudent(userId, updatedUser);
            if (success) {
                return ResponseEntity.ok(new AuthResponseDTO(true, "User updated successfully."));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new AuthResponseDTO(false, "User not found or update failed."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDTO(false, "Error updating user: " + e.getMessage()));
        }
    }

    @GetMapping("/content")
    public ResponseEntity<List<ContentResponseDTO>> getAllContentAdmin(
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        String currentUserId = sessionManager.getCurrentUserId(token);
        // For development, allow access without authentication
        if (currentUserId == null) {
            currentUserId = "admin"; // Default admin user for development
        }

        // For development, skip moderator verification
        User user = theKnowledgeBay.getUserById(currentUserId);
        if (user == null) {
            System.out.println("Admin access granted for development purposes");
        }

        try {
            DoublyLinkedList<Content> contents = theKnowledgeBay.getAllContent();
            List<ContentResponseDTO> response = new ArrayList<>();

            if (contents != null) {
                for (int i = 0; i < contents.getSize(); i++) {
                    Content content = contents.get(i);
                    
                    // Convert Interest objects to strings
                    List<String> topicNames = new ArrayList<>();
                    if (content.getTopics() != null) {
                        for (int j = 0; j < content.getTopics().getSize(); j++) {
                            topicNames.add(content.getTopics().get(j).getName());
                        }
                    }

                    // Extract URLs and file names from information
                    String linkUrl = null;
                    String videoUrl = null;
                    String fileName = null;
                    
                    if (content.getInformation() != null) {
                        String[] lines = content.getInformation().split("\n");
                        for (String line : lines) {
                            if (line.startsWith("Enlace: ")) {
                                linkUrl = line.substring(8);
                            } else if (line.startsWith("Video: ")) {
                                videoUrl = line.substring(7);
                            } else if (line.startsWith("Archivo adjunto: ")) {
                                fileName = line.substring(17);
                            }
                        }
                    }

                    ContentResponseDTO dto = ContentResponseDTO.builder()
                            .contentId(content.getContentId())
                            .topics(topicNames)
                            .title(content.getTitle())
                            .contentType(content.getContentType().toString())
                            .information(content.getInformation())
                            .authorUsername(content.getAuthor().getUsername())
                            .authorId(content.getAuthor().getId())
                            .likeCount(content.getLikeCount())
                            .hasLiked(false) // Admin view doesn't need this
                            .commentCount(content.getComments() != null ? content.getComments().getSize() : 0)
                            .date(content.getDate())
                            .linkUrl(linkUrl)
                            .videoUrl(videoUrl)
                            .fileName(fileName)
                            .build();
                    
                    response.add(dto);
                }
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/help-requests")
    public ResponseEntity<List<HelpRequestResponseDTO>> getAllHelpRequestsAdmin(
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        String currentUserId = sessionManager.getCurrentUserId(token);
        // For development, allow access without authentication
        if (currentUserId == null) {
            currentUserId = "admin"; // Default admin user for development
        }

        // For development, skip moderator verification
        User user = theKnowledgeBay.getUserById(currentUserId);
        if (user == null) {
            System.out.println("Admin access granted for development purposes");
        }

        try {
            DoublyLinkedList<HelpRequest> helpRequests = theKnowledgeBay.getAllHelpRequests();
            List<HelpRequestResponseDTO> response = new ArrayList<>();

            if (helpRequests != null) {
                for (int i = 0; i < helpRequests.getSize(); i++) {
                    HelpRequest helpRequest = helpRequests.get(i);
                    
                    // Convert Interest objects to strings
                    List<String> topicNames = new ArrayList<>();
                    if (helpRequest.getTopics() != null) {
                        for (int j = 0; j < helpRequest.getTopics().getSize(); j++) {
                            topicNames.add(helpRequest.getTopics().get(j).getName());
                        }
                    }

                    HelpRequestResponseDTO dto = HelpRequestResponseDTO.builder()
                            .requestId(helpRequest.getRequestId())
                            .topics(topicNames)
                            .information(helpRequest.getInformation())
                            .urgency(helpRequest.getUrgency().toString())
                            .studentUsername(helpRequest.getStudent().getUsername())
                            .studentId(helpRequest.getStudent().getId())
                            .isCompleted(helpRequest.isCompleted())
                            .requestDate(helpRequest.getRequestDate())
                            .commentCount(helpRequest.getComments() != null ? helpRequest.getComments().getSize() : 0)
                            .build();
                    
                    response.add(dto);
                }
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/content/{contentId}")
    public ResponseEntity<AuthResponseDTO> updateContent(
            @PathVariable int contentId,
            @RequestBody ContentResponseDTO updatedContent,
            @RequestHeader(value = "Authorization", required = false) String token) {

        String currentUserId = sessionManager.getCurrentUserId(token);
        if (currentUserId == null) {
            currentUserId = "admin"; // Default for development
        }

        User user = theKnowledgeBay.getUserById(currentUserId);
        if (user == null) {
            System.out.println("Admin access for development");
        } else if (!(user instanceof Moderator)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new AuthResponseDTO(false, "Access denied. Only moderators can update content."));
        }

        try {
            boolean success = theKnowledgeBay.updateContent(contentId, updatedContent);
            if (success) {
                return ResponseEntity.ok(new AuthResponseDTO(true, "Content updated successfully."));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new AuthResponseDTO(false, "Content not found or update failed."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDTO(false, "Error updating content: " + e.getMessage()));
        }
    }

    @DeleteMapping("/content/{id}")
    public ResponseEntity<AuthResponseDTO> deleteContent(
            @PathVariable int id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        String currentUserId = sessionManager.getCurrentUserId(token);
        // For development, allow access without authentication
        if (currentUserId == null) {
            currentUserId = "admin"; // Default admin user for development
        }

        // For development, skip moderator verification
        User user = theKnowledgeBay.getUserById(currentUserId);
        if (user == null) {
            System.out.println("Admin access granted for development purposes");
        }

        try {
            boolean deleted = theKnowledgeBay.deleteContent(id);
            
            if (deleted) {
                return ResponseEntity.ok(new AuthResponseDTO(true, "Contenido eliminado exitosamente."));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new AuthResponseDTO(false, "Contenido no encontrado."));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDTO(false, "Error interno del servidor: " + e.getMessage()));
        }
    }

    @PutMapping("/help-requests/{requestId}")
    public ResponseEntity<AuthResponseDTO> updateHelpRequest(
            @PathVariable int requestId,
            @RequestBody HelpRequestResponseDTO updatedHelpRequest,
            @RequestHeader(value = "Authorization", required = false) String token) {

        String currentUserId = sessionManager.getCurrentUserId(token);
        if (currentUserId == null) {
            currentUserId = "admin"; // Default for development
        }

        User user = theKnowledgeBay.getUserById(currentUserId);
        if (user == null) {
            System.out.println("Admin access for development");
        } else if (!(user instanceof Moderator)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new AuthResponseDTO(false, "Access denied. Only moderators can update help requests."));
        }

        try {
            boolean success = theKnowledgeBay.updateHelpRequest(requestId, updatedHelpRequest);
            if (success) {
                return ResponseEntity.ok(new AuthResponseDTO(true, "Help request updated successfully."));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new AuthResponseDTO(false, "Help request not found or update failed."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDTO(false, "Error updating help request: " + e.getMessage()));
        }
    }

    @DeleteMapping("/help-requests/{id}")
    public ResponseEntity<AuthResponseDTO> deleteHelpRequest(
            @PathVariable int id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        String currentUserId = sessionManager.getCurrentUserId(token);
        // For development, allow access without authentication
        if (currentUserId == null) {
            currentUserId = "admin"; // Default admin user for development
        }

        // For development, skip moderator verification
        User user = theKnowledgeBay.getUserById(currentUserId);
        if (user == null) {
            System.out.println("Admin access granted for development purposes");
        }

        try {
            boolean deleted = theKnowledgeBay.deleteHelpRequest(id);
            
            if (deleted) {
                return ResponseEntity.ok(new AuthResponseDTO(true, "Solicitud de ayuda eliminada exitosamente."));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new AuthResponseDTO(false, "Solicitud de ayuda no encontrada."));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDTO(false, "Error interno del servidor: " + e.getMessage()));
        }
    }

    // Helper methods for statistics
    private int getTotalUsers() {
        int count = 0;
        DoublyLinkedNode<Student> current = theKnowledgeBay.getUsers().getStudents().getHead();
        while (current != null) {
            count++;
            current = current.getNext();
        }
        return count;
    }

    private int getTotalContent() {
        DoublyLinkedList<Content> contents = theKnowledgeBay.getAllContent();
        return contents != null ? contents.getSize() : 0;
    }

    private int getTotalHelpRequests() {
        DoublyLinkedList<HelpRequest> requests = theKnowledgeBay.getAllHelpRequests();
        return requests != null ? requests.getSize() : 0;
    }

    private int getTotalGroups() {
        DoublyLinkedList<StudyGroup> groups = theKnowledgeBay.getStudyGroups();
        return groups != null ? groups.getSize() : 0;
    }

    private List<Map<String, Object>> getMostValuedContent() {
        List<Map<String, Object>> result = new ArrayList<>();
        DoublyLinkedList<Content> contents = theKnowledgeBay.getAllContent();
        
        if (contents != null && contents.getSize() > 0) {
            // Convert to list for sorting
            List<Content> contentList = new ArrayList<>();
            for (int i = 0; i < contents.getSize(); i++) {
                contentList.add(contents.get(i));
            }
            
            // Sort by like count (descending)
            contentList.sort((a, b) -> Integer.compare(b.getLikeCount(), a.getLikeCount()));
            
            // Take top 5
            int limit = Math.min(5, contentList.size());
            for (int i = 0; i < limit; i++) {
                Content content = contentList.get(i);
                Map<String, Object> item = new HashMap<>();
                item.put("id", content.getContentId());
                item.put("title", content.getTitle());
                item.put("author", content.getAuthor().getUsername());
                item.put("likes", content.getLikeCount());
                result.add(item);
            }
        }
        
        return result;
    }

    private List<Map<String, Object>> getMostConnectedUsers() {
        return theKnowledgeBay.getMostConnectedUsers();
    }
}