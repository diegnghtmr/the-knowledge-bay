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
import co.edu.uniquindio.theknowledgebay.infrastructure.security.AuthenticatedUser;
import co.edu.uniquindio.theknowledgebay.infrastructure.security.AuthenticatedUser.Role;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/content")
public class ContentController {

    private static final int MAX_TITLE_LENGTH = 150;
    private static final int MAX_BODY_LENGTH = 20_000;
    private static final int MAX_URL_LENGTH = 2_048;

    private final TheKnowledgeBay theKnowledgeBay;
    private final SessionManager sessionManager;

    @PostMapping
    public ResponseEntity<AuthResponseDTO> createContent(
            @AuthenticationPrincipal AuthenticatedUser actor,
            @RequestPart("content") CreateContentDTO request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        if (actor == null) {
            return publicationError(HttpStatus.UNAUTHORIZED, "Token de autorización requerido.");
        }
        if (actor.role() != Role.STUDENT) {
            return publicationError(HttpStatus.FORBIDDEN, "Solo los estudiantes pueden publicar contenido.");
        }
        if (!(theKnowledgeBay.getUserById(actor.id()) instanceof Student student)) {
            return publicationError(HttpStatus.NOT_FOUND, "Usuario no encontrado.");
        }

        ContentType type = parseContentType(request.getContentType());
        if (type == null) {
            return invalidPublication("Tipo de contenido inválido.");
        }
        String title = request.getTitle();
        if (title == null || title.isBlank()) {
            return invalidPublication("El título es obligatorio.");
        }
        if (title.length() > MAX_TITLE_LENGTH) {
            return invalidPublication("El título no puede exceder los 150 caracteres.");
        }
        String body = request.getBody();
        if (body == null || body.isBlank()) {
            return invalidPublication("La descripción del contenido es obligatoria.");
        }
        if (body.length() > MAX_BODY_LENGTH) {
            return invalidPublication("La descripción no puede exceder los 20000 caracteres.");
        }
        if (request.getTopics() == null || request.getTopics().isEmpty()) {
            return invalidPublication("Selecciona al menos un tema para tu publicación.");
        }
        String url = switch (type) {
            case LINK -> request.getLinkUrl();
            case VIDEO -> request.getVideoUrl();
            default -> null;
        };
        if ((type == ContentType.LINK || type == ContentType.VIDEO) && !isHttpUrl(url)) {
            return invalidPublication("Por favor, introduce una URL válida (http/https).");
        }
        if (type == ContentType.RESOURCE && (file == null || file.isEmpty())) {
            return invalidPublication("Debes adjuntar un archivo.");
        }

        DoublyLinkedList<Interest> topics = new DoublyLinkedList<>();
        Set<String> included = new HashSet<>();
        for (String name : request.getTopics()) {
            Interest topic = name == null || name.isBlank() ? null : theKnowledgeBay.findInterestByName(name);
            if (topic == null) {
                return invalidPublication("El tema seleccionado no existe.");
            }
            if (included.add(topic.getName())) {
                topics.addLast(topic);
            }
        }
        String information = switch (type) {
            case LINK -> body + "\n\nEnlace: " + url;
            case VIDEO -> body + "\n\nVideo: " + url;
            case RESOURCE -> body + "\n\nArchivo adjunto: " + file.getOriginalFilename();
            default -> body;
        };
        Content content = Content.builder()
                .topics(topics)
                .title(title)
                .contentType(type)
                .information(information)
                .author(student)
                .likedBy(new DoublyLinkedList<>())
                .comments(new DoublyLinkedList<>())
                .date(LocalDate.now())
                .build();

        try {
            if (theKnowledgeBay.addContent(content)) {
                return ResponseEntity.ok(new AuthResponseDTO(true, "Contenido publicado exitosamente."));
            }
        } catch (RuntimeException exception) {
            log.error("Content publication failed ({})", exception.getClass().getSimpleName());
        }
        return publicationError(HttpStatus.INTERNAL_SERVER_ERROR, "Error al publicar el contenido.");
    }

    private static ContentType parseContentType(String value) {
        if (value == null) return null;
        try {
            return ContentType.valueOf(value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private static boolean isHttpUrl(String value) {
        if (value == null || value.length() > MAX_URL_LENGTH) return false;
        try {
            URI uri = URI.create(value);
            return uri.getHost() != null && ("https".equalsIgnoreCase(uri.getScheme())
                    || "http".equalsIgnoreCase(uri.getScheme()));
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    private static ResponseEntity<AuthResponseDTO> invalidPublication(String message) {
        return publicationError(HttpStatus.BAD_REQUEST, message);
    }

    private static ResponseEntity<AuthResponseDTO> publicationError(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(new AuthResponseDTO(false, message));
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