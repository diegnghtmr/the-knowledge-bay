package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.api.dto.AuthResponseDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.CreateInterestDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.InterestDTO;
import co.edu.uniquindio.theknowledgebay.core.service.InterestService;
import co.edu.uniquindio.theknowledgebay.core.service.SessionManager;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/interests")
public class InterestController {

    private final InterestService interestService;
    private final SessionManager sessionManager;

    public InterestController(InterestService interestService, SessionManager sessionManager) {
        this.interestService = interestService;
        this.sessionManager = sessionManager;
    }

    @GetMapping
    public ResponseEntity<List<InterestDTO>> getAllInterests(
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            return ResponseEntity.ok(interestService.getAllInterests());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<AuthResponseDTO> createInterest(
            @RequestBody CreateInterestDTO createInterestDTO,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            String currentUserId = getCurrentUserId(token);
            String name = createInterestDTO.getName().trim();

            // Validar si el nombre ya existe
            if (interestService.isInterestNameTaken(name)) {
                return ResponseEntity.badRequest().body(
                        new AuthResponseDTO(false, "Ya existe un interés con ese nombre")
                );
            }

            return ResponseEntity.ok(
                    interestService.createInterest(name, currentUserId)
            );
        } catch (Exception e) {
            return errorResponse(e);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuthResponseDTO> updateInterest(
            @PathVariable String id,
            @RequestBody CreateInterestDTO updateInterestDTO,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            String currentUserId = getCurrentUserId(token);
            return ResponseEntity.ok(
                    interestService.updateInterest(id, updateInterestDTO.getName(), currentUserId)
            );
        } catch (Exception e) {
            return errorResponse(e);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<AuthResponseDTO> deleteInterest(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            String currentUserId = getCurrentUserId(token);
            return ResponseEntity.ok(
                    interestService.deleteInterest(id, currentUserId)
            );
        } catch (Exception e) {
            return errorResponse(e);
        }
    }

    private String getCurrentUserId(String token) {
        String userId = sessionManager.getCurrentUserId(token);
        return userId != null ? userId : "admin"; // Default para desarrollo
    }

    private ResponseEntity<AuthResponseDTO> errorResponse(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new AuthResponseDTO(false, "Error interno: " + e.getMessage()));
    }
}