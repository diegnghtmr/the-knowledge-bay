package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.api.config.ApiFailure;
import co.edu.uniquindio.theknowledgebay.api.dto.ImportDTO;
import co.edu.uniquindio.theknowledgebay.core.service.AuthService;
import co.edu.uniquindio.theknowledgebay.core.service.ImportService;
import co.edu.uniquindio.theknowledgebay.infrastructure.config.SecurityConfig;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@Profile(SecurityConfig.DEV_TOOLS_PROFILE)
@RequestMapping("/api/import")
public class ImportController {
    private final ImportService importService;

    public ImportController(ImportService importService) {
        this.importService = importService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> importData(@RequestBody ImportDTO data) {
        if (data.getStudents() != null && data.getStudents().stream()
                .anyMatch(student -> student == null || !AuthService.isSupportedPasswordHash(student.getPassword()))) {
            return ResponseEntity.badRequest().body(Map.of("error", "Imported students must have supported BCrypt password hashes."));
        }
        try {
            return ResponseEntity.ok(importService.processImport(data));
        } catch (RuntimeException e) {
            ApiFailure.report("import.load");
            return ResponseEntity.internalServerError().body(Map.of("error", "Error interno del servidor"));
        }
    }
}
