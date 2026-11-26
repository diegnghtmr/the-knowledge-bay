package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.api.config.ApiFailure;
import co.edu.uniquindio.theknowledgebay.api.dto.AuthResponseDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.CreateInterestDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.InterestDTO;
import co.edu.uniquindio.theknowledgebay.core.service.InterestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/interests")
public class InterestController {
    private final InterestService interestService;

    @GetMapping
    public ResponseEntity<List<InterestDTO>> getAllInterests() {
        try {
            return ResponseEntity.ok(interestService.getAllInterests());
        } catch (RuntimeException e) {
            ApiFailure.report("interests.list");
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<AuthResponseDTO> createInterest(@RequestBody CreateInterestDTO dto) {
        if (dto.getName() == null || dto.getName().isBlank()) {
            return ResponseEntity.badRequest().body(new AuthResponseDTO(false, "El nombre del interés es requerido."));
        }
        try {
            String name = dto.getName().trim();
            if (interestService.isInterestNameTaken(name)) {
                return ResponseEntity.badRequest().body(new AuthResponseDTO(false, "Ya existe un interés con ese nombre"));
            }
            return ResponseEntity.ok(interestService.createInterest(name));
        } catch (RuntimeException e) {
            return failure("interests.create");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuthResponseDTO> updateInterest(@PathVariable String id, @RequestBody CreateInterestDTO dto) {
        try {
            return ResponseEntity.ok(interestService.updateInterest(id, dto.getName()));
        } catch (RuntimeException e) {
            return failure("interests.update");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<AuthResponseDTO> deleteInterest(@PathVariable String id) {
        try {
            return ResponseEntity.ok(interestService.deleteInterest(id));
        } catch (RuntimeException e) {
            return failure("interests.delete");
        }
    }

    private static ResponseEntity<AuthResponseDTO> failure(String operation) {
        ApiFailure.report(operation);
        return ResponseEntity.internalServerError().body(new AuthResponseDTO(false, "Error interno del servidor."));
    }
}
