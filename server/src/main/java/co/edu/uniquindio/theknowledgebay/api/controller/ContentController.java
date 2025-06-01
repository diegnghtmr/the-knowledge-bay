package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.api.dto.CreateContentDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.ContentResponseDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.AuthResponseDTO;
import co.edu.uniquindio.theknowledgebay.core.model.Content;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.model.User;
import co.edu.uniquindio.theknowledgebay.core.model.Interest;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.model.enums.ContentType;
import co.edu.uniquindio.theknowledgebay.core.service.SessionManager;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/content")
public class ContentController {

    private final TheKnowledgeBay theKnowledgeBay;
    private final SessionManager sessionManager;

    @PostMapping
    public ResponseEntity<AuthResponseDTO> createContent(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestPart("content") CreateContentDTO createDto,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        
        String currentUserId = sessionManager.getCurrentUserId(token);
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponseDTO(false, "Token de autorización requerido."));
        }

        Student student = (Student) theKnowledgeBay.getUserById(currentUserId);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new AuthResponseDTO(false, "Usuario no encontrado."));
        }

        try {
            // Convert topics to Interest objects from the global list
            DoublyLinkedList<Interest> topics = new DoublyLinkedList<>();
            if (createDto.getTopics() != null) {
                for (String topicName : createDto.getTopics()) {
                    Interest existingInterest = theKnowledgeBay.findInterestByName(topicName);
                    if (existingInterest != null) {
                        topics.addLast(existingInterest);
                    } else {
                        // Option 1: Create the interest globally if it doesn't exist
                        // Interest newGlobalInterest = Interest.builder().name(topicName).build();
                        // theKnowledgeBay.addInterest(newGlobalInterest); // This will also assign an ID
                        // topics.addLast(newGlobalInterest);
                        // Option 2: Or, signal an error if interests must pre-exist
                        // return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        //        .body(new AuthResponseDTO(false, "El tema '" + topicName + "' no existe."));
                        // For now, let's assume interests should ideally pre-exist or be created via admin UI.
                        // If a topic name doesn't match a global interest, we might skip it or log a warning.
                        // To ensure association, it MUST be a known interest that could have a group.
                        System.out.println("Warning: Topic '" + topicName + "' provided for content creation does not exist as a global interest. It will not be associated.");
                    }
                }
            }

            // If no valid topics were found/associated, the content might not link to any group.
            if (topics.isEmpty() && createDto.getTopics() != null && !createDto.getTopics().isEmpty()) {
                System.out.println("Warning: No valid global interests found for the provided topic names. Content may not be associated with any study group.");
            }

            // Parse content type
            ContentType contentType;
            try {
                contentType = ContentType.valueOf(createDto.getContentType().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new AuthResponseDTO(false, "Tipo de contenido inválido."));
            }

            // Prepare content information based on type
            String information = createDto.getBody();
            if (contentType == ContentType.LINK && createDto.getLinkUrl() != null) {
                information += "\n\nEnlace: " + createDto.getLinkUrl();
            } else if (contentType == ContentType.VIDEO && createDto.getVideoUrl() != null) {
                information += "\n\nVideo: " + createDto.getVideoUrl();
            } else if (contentType == ContentType.RESOURCE && file != null) {
                // Handle file upload (this would typically involve saving the file to storage)
                information += "\n\nArchivo adjunto: " + file.getOriginalFilename();
            }

            // Create Content
            Content content = Content.builder()
                    .topics(topics)
                    .title(createDto.getTitle())
                    .contentType(contentType)
                    .information(information)
                    .author(student)
                    .likedBy(new DoublyLinkedList<>())
                    .likeCount(0)
                    .comments(new DoublyLinkedList<>())
                    .date(LocalDate.now())
                    .build();

            // Add to the system (this method needs to be implemented in TheKnowledgeBay)
            boolean created = theKnowledgeBay.addContent(content);
            
            if (created) {
                return ResponseEntity.ok(new AuthResponseDTO(true, "Contenido publicado exitosamente."));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new AuthResponseDTO(false, "Error al publicar el contenido."));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDTO(false, "Error interno del servidor: " + e.getMessage()));
        }
    }

    @GetMapping("/my-content")
    public ResponseEntity<List<ContentResponseDTO>> getMyContent(
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        String currentUserId = sessionManager.getCurrentUserId(token);
        if (currentUserId == null) {
            // Default to user id "1" if no valid token (development stub)
            currentUserId = "1";
        }

        try {
            DoublyLinkedList<Content> allContent = theKnowledgeBay.getAllContent();
            List<ContentResponseDTO> response = new ArrayList<>();

            if (allContent != null) {
                for (int i = 0; i < allContent.getSize(); i++) {
                    Content content = allContent.get(i);
                    
                    // Solo incluir contenido del usuario actual
                    if (content.getAuthor() != null && 
                        content.getAuthor().getId() != null &&
                        content.getAuthor().getId().equals(currentUserId)) {
                        
                        // Convert Interest objects to strings
                        List<String> topicNames = new ArrayList<>();
                        if (content.getTopics() != null) {
                            for (int j = 0; j < content.getTopics().getSize(); j++) {
                                topicNames.add(content.getTopics().get(j).getName());
                            }
                        }

                        // Check if current user has liked this content
                        boolean hasLiked = false;
                        if (content.getLikedBy() != null) {
                            for (int k = 0; k < content.getLikedBy().getSize(); k++) {
                                if (content.getLikedBy().get(k).getId().equals(currentUserId)) {
                                    hasLiked = true;
                                    break;
                                }
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
                                .hasLiked(hasLiked)
                                .commentCount(content.getComments() != null ? content.getComments().getSize() : 0)
                                .date(content.getDate())
                                .linkUrl(linkUrl)
                                .videoUrl(videoUrl)
                                .fileName(fileName)
                                .build();
                        
                        response.add(dto);
                    }
                }
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<ContentResponseDTO>> getAllContent(
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            String currentUserId = sessionManager.getCurrentUserId(token);
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

                    // Check if current user has liked this content
                    boolean hasLiked = false;
                    if (currentUserId != null && content.getLikedBy() != null) {
                        for (int k = 0; k < content.getLikedBy().getSize(); k++) {
                            if (content.getLikedBy().get(k).getId().equals(currentUserId)) {
                                hasLiked = true;
                                break;
                            }
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
                            .hasLiked(hasLiked)
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

    @GetMapping("/{id}")
    public ResponseEntity<ContentResponseDTO> getContentById(
            @PathVariable int id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            String currentUserId = sessionManager.getCurrentUserId(token);
            Content content = theKnowledgeBay.getContentById(id);
            
            if (content == null) {
                return ResponseEntity.notFound().build();
            }

            // Convert Interest objects to strings
            List<String> topicNames = new ArrayList<>();
            if (content.getTopics() != null) {
                for (int i = 0; i < content.getTopics().getSize(); i++) {
                    topicNames.add(content.getTopics().get(i).getName());
                }
            }

            // Check if current user has liked this content
            boolean hasLiked = false;
            if (currentUserId != null && content.getLikedBy() != null) {
                for (int k = 0; k < content.getLikedBy().getSize(); k++) {
                    if (content.getLikedBy().get(k).getId().equals(currentUserId)) {
                        hasLiked = true;
                        break;
                    }
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
                    .hasLiked(hasLiked)
                    .commentCount(content.getComments() != null ? content.getComments().getSize() : 0)
                    .date(content.getDate())
                    .linkUrl(linkUrl)
                    .videoUrl(videoUrl)
                    .fileName(fileName)
                    .build();

            return ResponseEntity.ok(dto);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<AuthResponseDTO> likeContent(
            @PathVariable int id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        String currentUserId = sessionManager.getCurrentUserId(token);
        // Default to user id "1" if no valid token (development stub)
        if (currentUserId == null) {
            currentUserId = "1";
        }

        try {
            // First check if content exists
            Content content = theKnowledgeBay.getContentById(id);
            if (content == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new AuthResponseDTO(false, "Contenido no encontrado."));
            }
            
            // Check if user exists
            User user = theKnowledgeBay.getUserById(currentUserId);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new AuthResponseDTO(false, "Usuario no encontrado."));
            }
            
            // Check if user is trying to like their own content
            if (content.getAuthor() != null && content.getAuthor().getId().equals(currentUserId)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new AuthResponseDTO(false, "No puedes dar like a tu propio contenido."));
            }
            
            // Check if user already liked this content
            if (content.getLikedBy() != null) {
                for (int i = 0; i < content.getLikedBy().getSize(); i++) {
                    if (content.getLikedBy().get(i).getId().equals(currentUserId)) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(new AuthResponseDTO(false, "Ya has dado like a este contenido."));
                    }
                }
            }
            
            boolean liked = theKnowledgeBay.likeContent(id, currentUserId);
            
            if (liked) {
                return ResponseEntity.ok(new AuthResponseDTO(true, "Like agregado exitosamente."));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new AuthResponseDTO(false, "Error al agregar el like."));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDTO(false, "Error interno del servidor: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<AuthResponseDTO> unlikeContent(
            @PathVariable int id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        String currentUserId = sessionManager.getCurrentUserId(token);
        // Default to user id "1" if no valid token (development stub)  
        if (currentUserId == null) {
            currentUserId = "1";
        }

        try {
            boolean unliked = theKnowledgeBay.unlikeContent(id, currentUserId);
            
            if (unliked) {
                return ResponseEntity.ok(new AuthResponseDTO(true, "Like removido exitosamente."));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new AuthResponseDTO(false, "Contenido no encontrado."));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDTO(false, "Error interno del servidor: " + e.getMessage()));
        }
    }
}