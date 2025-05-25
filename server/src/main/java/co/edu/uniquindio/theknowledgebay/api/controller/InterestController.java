package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.api.dto.AuthResponseDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.CreateInterestDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.InterestDTO;
import co.edu.uniquindio.theknowledgebay.core.model.Interest;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.service.SessionManager;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/interests")
public class InterestController {

    private final TheKnowledgeBay theKnowledgeBay;
    private final SessionManager sessionManager;

    @GetMapping
    public ResponseEntity<List<InterestDTO>> getAllInterests(
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            DoublyLinkedList<Interest> interests = theKnowledgeBay.getAllInterests();
            List<InterestDTO> response = new ArrayList<>();

            if (interests != null) {
                for (int i = 0; i < interests.getSize(); i++) {
                    Interest interest = interests.get(i);
                    InterestDTO dto = InterestDTO.builder()
                            .idInterest(interest.getIdInterest())
                            .name(interest.getName())
                            .build();
                    response.add(dto);
                }
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<AuthResponseDTO> createInterest(
            @RequestBody CreateInterestDTO createInterestDTO,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            // For development, allow access without strict authentication
            String currentUserId = sessionManager.getCurrentUserId(token);
            if (currentUserId == null) {
                currentUserId = "admin"; // Default admin user for development
            }

            Interest interest = Interest.builder()
                    .name(createInterestDTO.getName())
                    .build();

            boolean added = theKnowledgeBay.addInterest(interest);
            
            if (added) {
                return ResponseEntity.ok(new AuthResponseDTO(true, "Interés creado exitosamente."));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new AuthResponseDTO(false, "Error al crear el interés."));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDTO(false, "Error interno del servidor: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuthResponseDTO> updateInterest(
            @PathVariable String id,
            @RequestBody CreateInterestDTO updateInterestDTO,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            // For development, allow access without strict authentication
            String currentUserId = sessionManager.getCurrentUserId(token);
            if (currentUserId == null) {
                currentUserId = "admin"; // Default admin user for development
            }

            boolean updated = theKnowledgeBay.updateInterest(id, updateInterestDTO.getName());
            
            if (updated) {
                return ResponseEntity.ok(new AuthResponseDTO(true, "Interés actualizado exitosamente."));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new AuthResponseDTO(false, "Interés no encontrado."));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDTO(false, "Error interno del servidor: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<AuthResponseDTO> deleteInterest(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            // For development, allow access without strict authentication
            String currentUserId = sessionManager.getCurrentUserId(token);
            if (currentUserId == null) {
                currentUserId = "admin"; // Default admin user for development
            }

            boolean deleted = theKnowledgeBay.deleteInterest(id);
            
            if (deleted) {
                return ResponseEntity.ok(new AuthResponseDTO(true, "Interés eliminado exitosamente."));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new AuthResponseDTO(false, "Interés no encontrado."));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDTO(false, "Error interno del servidor: " + e.getMessage()));
        }
    }

    @PostMapping("/load-data")
    public ResponseEntity<AuthResponseDTO> loadSampleInterests(
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            // For development, allow access without strict authentication
            String currentUserId = sessionManager.getCurrentUserId(token);
            if (currentUserId == null) {
                currentUserId = "admin"; // Default admin user for development
            }

            // Add sample interests
            String[] sampleInterests = {
                "Inteligencia Artificial",
                "Filosofía", 
                "Matemáticas",
                "Ciencias de la Computación",
                "Historia",
                "Literatura",
                "Física",
                "Química",
                "Biología",
                "Arte",
                "Música",
                "Psicología"
            };

            int addedCount = 0;
            for (String interestName : sampleInterests) {
                Interest interest = Interest.builder()
                        .name(interestName)
                        .build();
                        
                if (theKnowledgeBay.addInterest(interest)) {
                    addedCount++;
                }
            }

            return ResponseEntity.ok(new AuthResponseDTO(true, 
                "Datos de muestra cargados exitosamente. " + addedCount + " intereses agregados."));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDTO(false, "Error interno del servidor: " + e.getMessage()));
        }
    }
}