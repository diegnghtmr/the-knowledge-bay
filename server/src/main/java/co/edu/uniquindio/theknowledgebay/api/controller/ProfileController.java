package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.api.dto.ProfileUpdateDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.ProfileResponseDTO;
import co.edu.uniquindio.theknowledgebay.core.model.User;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.service.SessionManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

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
        ProfileResponseDTO response = ProfileResponseDTO.builder()
                .id(currentUserId)
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user instanceof Student && ((Student) user).getFirstName() != null ? ((Student) user).getFirstName() : defaultName)
                .lastName(user instanceof Student && ((Student) user).getLastName() != null ? ((Student) user).getLastName() : defaultName)
                .dateBirth(user instanceof Student && ((Student) user).getDateBirth() != null ? ((Student) user).getDateBirth() : defaultDate)
                .biography(user instanceof Student && ((Student) user).getBiography() != null ? ((Student) user).getBiography() : defaultBio)
                .interests(user instanceof Student && ((Student) user).getInterests() != null ? ((Student) user).getInterests() : Arrays.asList())
                .build();
                
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<ProfileResponseDTO> updateProfile(@RequestHeader(value = "Authorization", required = false) String token,
                                                            @RequestBody ProfileUpdateDTO dto) {
        System.out.println("PUT /api/profile - Token recibido: " + token);
        
        String currentUserId = sessionManager.getCurrentUserId(token);
        System.out.println("PUT /api/profile - User ID: " + currentUserId);
        
        // Default to user id "1" if no valid token (development stub)
        if (currentUserId == null) {
            currentUserId = "1";
            System.out.println("PUT /api/profile - Usando ID por defecto: " + currentUserId);
        }

        Student updated = Student.builder()
                .id(Integer.parseInt(currentUserId))
                .username(dto.getUsername())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .dateBirth(dto.getDateBirth())
                .biography(dto.getBiography())
                .build();
        
        System.out.println("PUT /api/profile - Actualizando usuario: " + updated.getUsername());
                
        theKnowledgeBay.updateUser(currentUserId, updated);

        User user = theKnowledgeBay.getUserById(currentUserId);
        
        if (user == null) {
            System.out.println("PUT /api/profile - Usuario no encontrado después de actualizar");
            return ResponseEntity.notFound().build();
        }

        String defaultName = "Información no disponible";
        LocalDate defaultDate = LocalDate.of(1900,1,1);
        String defaultBio = "[Tu biografía aquí]";
        
        System.out.println("PUT /api/profile - Construyendo respuesta con intereses");
        List<String> userInterests = (user instanceof Student) ? ((Student) user).getInterests() : Arrays.asList();
        System.out.println("PUT /api/profile - Intereses: " + userInterests);
        
        ProfileResponseDTO response = ProfileResponseDTO.builder()
                .id(currentUserId)
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user instanceof Student && ((Student) user).getFirstName() != null ? ((Student) user).getFirstName() : defaultName)
                .lastName(user instanceof Student && ((Student) user).getLastName() != null ? ((Student) user).getLastName() : defaultName)
                .dateBirth(user instanceof Student && ((Student) user).getDateBirth() != null ? ((Student) user).getDateBirth() : defaultDate)
                .biography(user instanceof Student && ((Student) user).getBiography() != null ? ((Student) user).getBiography() : defaultBio)
                .interests(userInterests)
                .build();
                
        System.out.println("PUT /api/profile - Usuario actualizado correctamente: " + response.getUsername());
                
        return ResponseEntity.ok(response);
    }
}
