package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.api.dto.ProfileUpdateDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.ProfileResponseDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.UserSummaryDTO;

import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.model.User;
import co.edu.uniquindio.theknowledgebay.core.service.SessionManager;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.DoublyLinkedNode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/profile")
public class ProfileController {

    private final TheKnowledgeBay theKnowledgeBay;
    private final SessionManager sessionManager;

    @GetMapping
    public ResponseEntity<ProfileResponseDTO> getProfile(@RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("GET /api/profile - Token recibido: " + token);
        
        String currentUserId = sessionManager.getCurrentUserId(token);
        System.out.println("GET /api/profile - User ID: " + currentUserId);
        
        // Default to user id "1" if no valid token (development stub)
        if (currentUserId == null) {
            currentUserId = "1"; 
            System.out.println("GET /api/profile - Usando ID por defecto: " + currentUserId);
        }
        
        User user = theKnowledgeBay.getUserById(currentUserId);
        
        if (user == null) {
            System.out.println("GET /api/profile - Usuario no encontrado con ID: " + currentUserId);
            return ResponseEntity.notFound().build();
        }
        
        System.out.println("GET /api/profile - Usuario encontrado: " + user.getUsername());
        
        String defaultName = "Información no disponible";
        LocalDate defaultDate = LocalDate.of(1900,1,1);
        String defaultBio = "[Tu biografía aquí]";
        
        // Calculate user statistics
        int userContentCount = theKnowledgeBay.getContentCountByUserId(currentUserId);
        int userRequestsCount = theKnowledgeBay.getHelpRequestCountByUserId(currentUserId);
        int userGroupCount = theKnowledgeBay.getUserStudyGroupCount(currentUserId);
        
        ProfileResponseDTO.ProfileResponseDTOBuilder responseBuilder = ProfileResponseDTO.builder()
                .id(currentUserId)
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user instanceof Student && ((Student) user).getFirstName() != null ? ((Student) user).getFirstName() : defaultName)
                .lastName(user instanceof Student && ((Student) user).getLastName() != null ? ((Student) user).getLastName() : defaultName)
                .dateBirth(user instanceof Student && ((Student) user).getDateBirth() != null ? ((Student) user).getDateBirth() : defaultDate)
                .biography(user instanceof Student && ((Student) user).getBiography() != null ? ((Student) user).getBiography() : defaultBio)
                .groups(userGroupCount)
                .contentCount(userContentCount)
                .helpRequestCount(userRequestsCount)
                .interests(user instanceof Student && ((Student) user).getStringInterests() != null ? ((Student) user).getStringInterests() : Arrays.asList());

        if (user instanceof Student) {
            Student student = (Student) user;
            responseBuilder.following(student.getFollowingCount());
            responseBuilder.followers(student.getFollowersCount());
            responseBuilder.currentUserFollowing(false); // Or based on specific logic if viewing another's profile via this endpoint
        } else {
            responseBuilder.following(0);
            responseBuilder.followers(0);
            responseBuilder.currentUserFollowing(false);
        }
                
        return ResponseEntity.ok(responseBuilder.build());
    }

    @PutMapping
    public ResponseEntity<ProfileResponseDTO> updateProfile(@RequestHeader(value = "Authorization", required = false) String token,
                                                            @RequestBody ProfileUpdateDTO dto) {
        System.out.println("PUT /api/profile - Token recibido: " + token);
        
        System.out.println("PUT /api/profile - JSON Recibido: {");
        System.out.println("  username: " + dto.getUsername());
        System.out.println("  email: " + dto.getEmail());
        System.out.println("  password: " + (dto.getPassword() != null ? "[CONFIDENCIAL]" : "null"));
        System.out.println("  firstName: " + dto.getFirstName());
        System.out.println("  lastName: " + dto.getLastName());
        System.out.println("  birthday: " + dto.getBirthday());
        System.out.println("  bio: " + dto.getBiography());
        System.out.println("  interests: " + dto.getInterests());
        System.out.println("}");
        
        // Convertir el formato de fecha si existe
        if (dto.getBirthday() != null && !dto.getBirthday().isEmpty()) {
            try {
                // Definir el formato de la fecha de entrada
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yy");
                // Parsear la fecha
                LocalDate birthDate = LocalDate.parse(dto.getBirthday(), formatter);
                dto.setDateBirth(birthDate);
                System.out.println("Fecha de nacimiento convertida: " + birthDate);
            } catch (DateTimeParseException e) {
                System.out.println("Error al convertir la fecha: " + e.getMessage() + " para el valor: " + dto.getBirthday());
            } catch (Exception e) {
                System.out.println("Error inesperado al procesar la fecha: " + e.getMessage());
            }
        }
        
        String currentUserId = sessionManager.getCurrentUserId(token);
        System.out.println("PUT /api/profile - User ID: " + currentUserId);
        
        // Default to user id "1" if no valid token (development stub)
        if (currentUserId == null) {
            currentUserId = "1";
            System.out.println("PUT /api/profile - Usando ID por defecto: " + currentUserId);
        }

        User existingUser = theKnowledgeBay.getUserById(currentUserId);
        if (existingUser == null) {
            System.out.println("PUT /api/profile - Usuario no encontrado para actualizar");
            return ResponseEntity.notFound().build();
        }

        Student updated = Student.builder()
                .id(currentUserId)
                .username(dto.getUsername())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .dateBirth(dto.getDateBirth())
                .biography(dto.getBiography())
                .build();
        
        if (dto.getInterests() != null && !dto.getInterests().isEmpty()) {
            System.out.println("PUT /api/profile - Intereses recibidos: " + dto.getInterests());
        }
        
        System.out.println("PUT /api/profile - Actualizando usuario: " + updated.getUsername());
        System.out.println("PUT /api/profile - Biografía a actualizar: " + updated.getBiography());
        System.out.println("PUT /api/profile - Fecha a actualizar: " + updated.getDateBirth());
                
        theKnowledgeBay.updateUser(currentUserId, updated, dto.getInterests());

        User user = theKnowledgeBay.getUserById(currentUserId);
        
        if (user == null) {
            System.out.println("PUT /api/profile - Usuario no encontrado después de actualizar");
            return ResponseEntity.notFound().build();
        }

        String defaultName = "Información no disponible";
        LocalDate defaultDate = LocalDate.of(1900,1,1);
        String defaultBio = "[Tu biografía aquí]";
        
        System.out.println("PUT /api/profile - Construyendo respuesta con intereses");
        List<String> userInterests = (user instanceof Student) ? ((Student) user).getStringInterests() : Arrays.asList();
        System.out.println("PUT /api/profile - Intereses: " + userInterests);
        
        // Calculate user statistics
        int userContentCount = theKnowledgeBay.getContentCountByUserId(currentUserId);
        int userRequestsCount = theKnowledgeBay.getHelpRequestCountByUserId(currentUserId);
        int userGroupCountAfterUpdate = theKnowledgeBay.getUserStudyGroupCount(currentUserId);
        
        ProfileResponseDTO.ProfileResponseDTOBuilder responseBuilder = ProfileResponseDTO.builder()
                .id(currentUserId)
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user instanceof Student && ((Student) user).getFirstName() != null ? ((Student) user).getFirstName() : defaultName)
                .lastName(user instanceof Student && ((Student) user).getLastName() != null ? ((Student) user).getLastName() : defaultName)
                .dateBirth(user instanceof Student && ((Student) user).getDateBirth() != null ? ((Student) user).getDateBirth() : defaultDate)
                .biography(user instanceof Student && ((Student) user).getBiography() != null ? ((Student) user).getBiography() : defaultBio)
                .groups(userGroupCountAfterUpdate)
                .contentCount(userContentCount)
                .helpRequestCount(userRequestsCount)
                .interests(userInterests);

        if (user instanceof Student) {
            Student student = (Student) user;
            responseBuilder.following(student.getFollowingCount());
            responseBuilder.followers(student.getFollowersCount());
            responseBuilder.currentUserFollowing(false); // Own profile, not following self in this context
        } else {
            responseBuilder.following(0);
            responseBuilder.followers(0);
            responseBuilder.currentUserFollowing(false);
        }
                
        System.out.println("PUT /api/profile - Usuario actualizado correctamente: " + user.getUsername());
                
        return ResponseEntity.ok(responseBuilder.build());
    }
    
    /**
     * Obtener la lista de seguidores del usuario actual
     */
    @GetMapping("/followers")
    public ResponseEntity<List<UserSummaryDTO>> getFollowers(@RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("GET /api/profile/followers - Token recibido: " + token);
        
        String currentUserId = sessionManager.getCurrentUserId(token);
        System.out.println("GET /api/profile/followers - User ID: " + currentUserId);
        
        // Default to user id "1" if no valid token (development stub)
        if (currentUserId == null) {
            currentUserId = "1";
            System.out.println("GET /api/profile/followers - Usando ID por defecto: " + currentUserId);
        }
        
        User user = theKnowledgeBay.getUserById(currentUserId);
        if (!(user instanceof Student)) {
            System.out.println("GET /api/profile/followers - Usuario no es Student o no encontrado");
            return ResponseEntity.ok(new ArrayList<>());
        }
        
        Student student = (Student) user;
        List<UserSummaryDTO> followers = new ArrayList<>();
        
        System.out.println("GET /api/profile/followers - Procesando seguidores para usuario: " + student.getUsername());
        
        if (student.getFollowers() != null) {
            System.out.println("GET /api/profile/followers - Lista de seguidores no es null, tamaño: " + student.getFollowers().getSize());
            DoublyLinkedNode<Student> current = student.getFollowers().getHead();
            while (current != null) {
                Student follower = current.getData();
                System.out.println("GET /api/profile/followers - Procesando seguidor: " + follower.getUsername() + " (ID: " + follower.getId() + ")");
                UserSummaryDTO dto = UserSummaryDTO.builder()
                        .id(follower.getId())
                        .username(follower.getUsername())
                        .firstName(follower.getFirstName())
                        .lastName(follower.getLastName())
                        .build();
                followers.add(dto);
                current = current.getNext();
            }
        } else {
            System.out.println("GET /api/profile/followers - Lista de seguidores es null");
        }
        
        System.out.println("GET /api/profile/followers - Devolviendo " + followers.size() + " seguidores");
        return ResponseEntity.ok(followers);
    }
    
    /**
     * Obtener la lista de usuarios seguidos por el usuario actual
     */
    @GetMapping("/following")
    public ResponseEntity<List<UserSummaryDTO>> getFollowing(@RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("GET /api/profile/following - Token recibido: " + token);
        
        String currentUserId = sessionManager.getCurrentUserId(token);
        System.out.println("GET /api/profile/following - User ID: " + currentUserId);
        
        // Default to user id "1" if no valid token (development stub)
        if (currentUserId == null) {
            currentUserId = "1";
            System.out.println("GET /api/profile/following - Usando ID por defecto: " + currentUserId);
        }
        
        User user = theKnowledgeBay.getUserById(currentUserId);
        if (!(user instanceof Student)) {
            System.out.println("GET /api/profile/following - Usuario no es Student o no encontrado");
            return ResponseEntity.ok(new ArrayList<>());
        }
        
        Student student = (Student) user;
        List<UserSummaryDTO> following = new ArrayList<>();
        
        System.out.println("GET /api/profile/following - Procesando seguidos para usuario: " + student.getUsername());
        
        if (student.getFollowing() != null) {
            System.out.println("GET /api/profile/following - Lista de seguidos no es null, tamaño: " + student.getFollowing().getSize());
            DoublyLinkedNode<Student> current = student.getFollowing().getHead();
            while (current != null) {
                Student followedUser = current.getData();
                System.out.println("GET /api/profile/following - Procesando seguido: " + followedUser.getUsername() + " (ID: " + followedUser.getId() + ")");
                UserSummaryDTO dto = UserSummaryDTO.builder()
                        .id(followedUser.getId())
                        .username(followedUser.getUsername())
                        .firstName(followedUser.getFirstName())
                        .lastName(followedUser.getLastName())
                        .build();
                following.add(dto);
                current = current.getNext();
            }
        } else {
            System.out.println("GET /api/profile/following - Lista de seguidos es null");
        }
        
        System.out.println("GET /api/profile/following - Devolviendo " + following.size() + " seguidos");
        return ResponseEntity.ok(following);
    }

    /**
     * Obtener el perfil de cualquier usuario por su ID
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ProfileResponseDTO> getUserProfile(
            @PathVariable String userId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        System.out.println("GET /api/profile/" + userId + " - Token recibido: " + token);
        
        String currentUserId = sessionManager.getCurrentUserId(token);
        System.out.println("GET /api/profile/" + userId + " - Current User ID: " + currentUserId);
        
        // Default to user id "1" if no valid token (development stub)
        if (currentUserId == null) {
            currentUserId = "1"; 
            System.out.println("GET /api/profile/" + userId + " - Usando ID por defecto: " + currentUserId);
        }
        
        User user = theKnowledgeBay.getUserById(userId);
        
        if (user == null) {
            System.out.println("GET /api/profile/" + userId + " - Usuario no encontrado con ID: " + userId);
            return ResponseEntity.notFound().build();
        }
        
        System.out.println("GET /api/profile/" + userId + " - Usuario encontrado: " + user.getUsername());
        
        String defaultName = "Información no disponible";
        LocalDate defaultDate = LocalDate.of(1900,1,1);
        String defaultBio = "[Tu biografía aquí]";
        
        // Calculate user statistics
        int userContentCount = theKnowledgeBay.getContentCountByUserId(userId);
        int userRequestsCount = theKnowledgeBay.getHelpRequestCountByUserId(userId);
        int userGroupCount = theKnowledgeBay.getUserStudyGroupCount(userId);
        
        ProfileResponseDTO.ProfileResponseDTOBuilder responseBuilder = ProfileResponseDTO.builder()
                .id(userId)
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user instanceof Student && ((Student) user).getFirstName() != null ? ((Student) user).getFirstName() : defaultName)
                .lastName(user instanceof Student && ((Student) user).getLastName() != null ? ((Student) user).getLastName() : defaultName)
                .dateBirth(user instanceof Student && ((Student) user).getDateBirth() != null ? ((Student) user).getDateBirth() : defaultDate)
                .biography(user instanceof Student && ((Student) user).getBiography() != null ? ((Student) user).getBiography() : defaultBio)
                .groups(userGroupCount)
                .contentCount(userContentCount)
                .helpRequestCount(userRequestsCount)
                .interests(user instanceof Student && ((Student) user).getStringInterests() != null ? ((Student) user).getStringInterests() : Arrays.asList());

        if (user instanceof Student) {
            Student student = (Student) user;
            responseBuilder.following(student.getFollowingCount());
            responseBuilder.followers(student.getFollowersCount());
            // Check if current user is following this user
            boolean isFollowing = theKnowledgeBay.isUserFollowing(currentUserId, userId);
            System.out.println("GET /api/profile/" + userId + " - isFollowing check: " + currentUserId + " follows " + userId + " = " + isFollowing);
            responseBuilder.currentUserFollowing(isFollowing);
        } else {
            responseBuilder.following(0);
            responseBuilder.followers(0);
            responseBuilder.currentUserFollowing(false);
        }
        
        ProfileResponseDTO response = responseBuilder.build();
        System.out.println("GET /api/profile/" + userId + " - Response DTO before return:");
        System.out.println("  - currentUserFollowing: " + response.isCurrentUserFollowing());
        System.out.println("  - following: " + response.getFollowing());
        System.out.println("  - followers: " + response.getFollowers());
        System.out.println("  - groups: " + response.getGroups());
        System.out.println("  - contentCount: " + response.getContentCount());
        System.out.println("GET /api/profile/" + userId + " - Perfil devuelto exitosamente");
        return ResponseEntity.ok(response);
    }
}
