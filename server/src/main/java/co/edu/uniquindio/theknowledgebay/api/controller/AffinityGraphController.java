package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.api.dto.AuthResponseDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.ShortestPathDTO;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.service.SessionManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/affinity-graph")
public class AffinityGraphController {

    private final TheKnowledgeBay theKnowledgeBay;
    private final SessionManager sessionManager;

    @GetMapping("/data")
    public ResponseEntity<Map<String, Object>> getAffinityGraphData(
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            List<Map<String, Object>> graphData = theKnowledgeBay.getAffinityGraphData();
            
            if (!graphData.isEmpty()) {
                return ResponseEntity.ok(graphData.get(0));
            } else {
                return ResponseEntity.ok(Map.of(
                    "nodes", List.of(),
                    "links", List.of()
                ));
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "error", "Error interno del servidor: " + e.getMessage(),
                        "nodes", List.of(),
                        "links", List.of()
                    ));
        }
    }

    @GetMapping("/shortest-path")
    public ResponseEntity<ShortestPathDTO> findShortestPath(
            @RequestParam String student1,
            @RequestParam String student2,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            if (student1 == null || student2 == null || student1.trim().isEmpty() || student2.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                    ShortestPathDTO.builder()
                        .pathFound(false)
                        .message("Los IDs de estudiantes son requeridos")
                        .path(List.of())
                        .build()
                );
            }

            List<String> path = theKnowledgeBay.findShortestPathBetweenStudents(student1.trim(), student2.trim());
            
            if (path.isEmpty()) {
                return ResponseEntity.ok(
                    ShortestPathDTO.builder()
                        .pathFound(false)
                        .message("No se encontró una ruta entre los estudiantes")
                        .path(List.of())
                        .build()
                );
            } else {
                return ResponseEntity.ok(
                    ShortestPathDTO.builder()
                        .pathFound(true)
                        .message("Ruta encontrada exitosamente")
                        .path(path)
                        .build()
                );
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ShortestPathDTO.builder()
                        .pathFound(false)
                        .message("Error interno del servidor: " + e.getMessage())
                        .path(List.of())
                        .build());
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refreshAffinityGraph(
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            // For development, allow access without strict authentication
            String currentUserId = sessionManager.getCurrentUserId(token);
            if (currentUserId == null) {
                currentUserId = "admin"; // Default admin user for development
            }

            theKnowledgeBay.refreshAffinityGraph();
            
            return ResponseEntity.ok(new AuthResponseDTO(true, "Grafo de afinidad actualizado exitosamente."));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDTO(false, "Error interno del servidor: " + e.getMessage()));
        }
    }
}