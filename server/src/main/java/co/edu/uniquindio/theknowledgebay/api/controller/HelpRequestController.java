package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.api.dto.CreateHelpRequestDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.HelpRequestResponseDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.AuthResponseDTO;
import co.edu.uniquindio.theknowledgebay.core.model.HelpRequest;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.model.Interest;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.model.enums.Urgency;
import co.edu.uniquindio.theknowledgebay.core.service.SessionManager;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/help-requests")
public class HelpRequestController {

    private final TheKnowledgeBay theKnowledgeBay;
    private final SessionManager sessionManager;

    @PostMapping
    public ResponseEntity<AuthResponseDTO> createHelpRequest(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestBody CreateHelpRequestDTO createDto) {
        
        System.out.println("POST /api/help-requests - Token recibido: " + token);
        System.out.println("POST /api/help-requests - Datos recibidos: " + createDto);
        
        String currentUserId = sessionManager.getCurrentUserId(token);
        if (currentUserId == null) {
            // Default to user id "1" if no valid token (development stub)
            currentUserId = "1";
            System.out.println("POST /api/help-requests - Usando ID por defecto: " + currentUserId);
        }

        Student student = (Student) theKnowledgeBay.getUserById(currentUserId);
        if (student == null) {
            System.out.println("POST /api/help-requests - Usuario no encontrado con ID: " + currentUserId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new AuthResponseDTO(false, "Usuario no encontrado."));
        }

        System.out.println("POST /api/help-requests - Usuario encontrado: " + student.getUsername());

        try {
            System.out.println("POST /api/help-requests - Procesando solicitud...");
            
            // Convert topics to Interest objects
            DoublyLinkedList<Interest> topics = new DoublyLinkedList<>();
            if (createDto.getTopics() != null) {
                System.out.println("POST /api/help-requests - Procesando " + createDto.getTopics().size() + " temas");
                for (String topicName : createDto.getTopics()) {
                    topics.addLast(Interest.builder().name(topicName).build());
                }
            }

            // Parse urgency
            Urgency urgency;
            try {
                urgency = Urgency.valueOf(createDto.getUrgency().toUpperCase());
                System.out.println("POST /api/help-requests - Urgencia procesada: " + urgency);
            } catch (IllegalArgumentException e) {
                System.out.println("POST /api/help-requests - Urgencia inválida: " + createDto.getUrgency());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new AuthResponseDTO(false, "Nivel de urgencia inválido."));
            }

            // Create HelpRequest
            System.out.println("POST /api/help-requests - Creando objeto HelpRequest...");
            HelpRequest helpRequest = HelpRequest.builder()
                    .topics(topics)
                    .information(createDto.getInformation())
                    .urgency(urgency)
                    .student(student)
                    .isCompleted(false)
                    .requestDate(LocalDate.now())
                    .comments(new DoublyLinkedList<>())
                    .build();

            System.out.println("POST /api/help-requests - Agregando solicitud al sistema...");
            boolean created = theKnowledgeBay.addHelpRequest(helpRequest);
            
            if (created) {
                System.out.println("POST /api/help-requests - Solicitud creada exitosamente");
                return ResponseEntity.ok(new AuthResponseDTO(true, "Solicitud de ayuda creada exitosamente."));
            } else {
                System.out.println("POST /api/help-requests - Error al crear solicitud");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new AuthResponseDTO(false, "Error al crear la solicitud de ayuda."));
            }

        } catch (Exception e) {
            System.out.println("POST /api/help-requests - Excepción: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDTO(false, "Error interno del servidor: " + e.getMessage()));
        }
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<HelpRequestResponseDTO>> getMyHelpRequests(
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        String currentUserId = sessionManager.getCurrentUserId(token);
        if (currentUserId == null) {
            // Default to user id "1" if no valid token (development stub)
            currentUserId = "1";
        }

        try {
            DoublyLinkedList<HelpRequest> allRequests = theKnowledgeBay.getAllHelpRequests();
            List<HelpRequestResponseDTO> response = new ArrayList<>();

            if (allRequests != null) {
                for (int i = 0; i < allRequests.getSize(); i++) {
                    HelpRequest helpRequest = allRequests.get(i);
                    
                    // Solo incluir solicitudes del usuario actual
                    if (helpRequest.getStudent() != null && 
                        helpRequest.getStudent().getId() != null &&
                        helpRequest.getStudent().getId().equals(currentUserId)) {
                        
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
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<HelpRequestResponseDTO>> getAllHelpRequests() {
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

    @GetMapping("/{id}")
    public ResponseEntity<HelpRequestResponseDTO> getHelpRequestById(@PathVariable int id) {
        try {
            HelpRequest helpRequest = theKnowledgeBay.getHelpRequestById(id);
            
            if (helpRequest == null) {
                return ResponseEntity.notFound().build();
            }

            // Convert Interest objects to strings
            List<String> topicNames = new ArrayList<>();
            if (helpRequest.getTopics() != null) {
                for (int i = 0; i < helpRequest.getTopics().getSize(); i++) {
                    topicNames.add(helpRequest.getTopics().get(i).getName());
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

            return ResponseEntity.ok(dto);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<AuthResponseDTO> markAsCompleted(
            @PathVariable int id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        String currentUserId = sessionManager.getCurrentUserId(token);
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponseDTO(false, "Token de autorización requerido."));
        }

        try {
            boolean completed = theKnowledgeBay.markHelpRequestAsCompleted(id, currentUserId);
            
            if (completed) {
                return ResponseEntity.ok(new AuthResponseDTO(true, "Solicitud de ayuda marcada como completada."));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new AuthResponseDTO(false, "Solicitud de ayuda no encontrada o no autorizada."));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDTO(false, "Error interno del servidor: " + e.getMessage()));
        }
    }
}