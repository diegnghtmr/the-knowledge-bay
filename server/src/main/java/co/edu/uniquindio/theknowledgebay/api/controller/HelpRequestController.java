package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.api.config.ApiFailure;
import co.edu.uniquindio.theknowledgebay.api.dto.AuthResponseDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.CreateHelpRequestDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.HelpRequestResponseDTO;
import co.edu.uniquindio.theknowledgebay.core.model.HelpRequest;
import co.edu.uniquindio.theknowledgebay.core.model.Interest;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.model.enums.Urgency;
import co.edu.uniquindio.theknowledgebay.core.service.AuthService;
import co.edu.uniquindio.theknowledgebay.infrastructure.security.AuthenticatedUser;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/help-requests")
public class HelpRequestController {
    private final TheKnowledgeBay theKnowledgeBay;
    private final AuthService authService;

    @PostMapping
    public ResponseEntity<AuthResponseDTO> createHelpRequest(@AuthenticationPrincipal AuthenticatedUser caller,
                                                            @RequestBody CreateHelpRequestDTO dto) {
        if (!(authService.findUserById(caller.id()).orElse(null) instanceof Student student)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new AuthResponseDTO(false, "Usuario no encontrado."));
        }
        Urgency urgency;
        try {
            urgency = Urgency.valueOf(dto.getUrgency() == null ? "" : dto.getUrgency().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new AuthResponseDTO(false, "Nivel de urgencia inválido."));
        }

        var topics = new DoublyLinkedList<Interest>();
        if (dto.getTopics() != null) {
            for (String topic : dto.getTopics()) {
                topics.addLast(Interest.builder().name(topic).build());
            }
        }
        HelpRequest request = HelpRequest.builder().topics(topics).information(dto.getInformation())
                .urgency(urgency).student(student).isCompleted(false).requestDate(LocalDate.now())
                .comments(new DoublyLinkedList<>()).build();
        try {
            if (theKnowledgeBay.addHelpRequest(request)) {
                return ResponseEntity.ok(new AuthResponseDTO(true, "Solicitud de ayuda creada exitosamente."));
            }
            return ResponseEntity.internalServerError().body(new AuthResponseDTO(false, "Error al crear la solicitud de ayuda."));
        } catch (RuntimeException e) {
            return failure("help.create");
        }
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<HelpRequestResponseDTO>> getMyHelpRequests(@AuthenticationPrincipal AuthenticatedUser caller) {
        return listRequests(caller.id());
    }

    @GetMapping
    public ResponseEntity<List<HelpRequestResponseDTO>> getAllHelpRequests() {
        return listRequests(null);
    }

    @GetMapping("/{id}")
    public ResponseEntity<HelpRequestResponseDTO> getHelpRequestById(@PathVariable int id) {
        try {
            HelpRequest request = theKnowledgeBay.getHelpRequestById(id);
            return request == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(toResponse(request));
        } catch (RuntimeException e) {
            ApiFailure.report("help.read");
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<AuthResponseDTO> markAsCompleted(@PathVariable int id, @AuthenticationPrincipal AuthenticatedUser caller) {
        try {
            HelpRequest request = theKnowledgeBay.getHelpRequestById(id);
            if (request == null) {
                return missingRequest();
            }
            if (request.getStudent() == null || !caller.id().equals(request.getStudent().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new AuthResponseDTO(false, "No puedes completar esta solicitud de ayuda."));
            }
            return theKnowledgeBay.markHelpRequestAsCompleted(id, caller.id())
                    ? ResponseEntity.ok(new AuthResponseDTO(true, "Solicitud de ayuda marcada como completada."))
                    : missingRequest();
        } catch (RuntimeException e) {
            return failure("help.complete");
        }
    }

    private static ResponseEntity<AuthResponseDTO> missingRequest() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new AuthResponseDTO(false, "Solicitud de ayuda no encontrada o no autorizada."));
    }

    private static ResponseEntity<AuthResponseDTO> failure(String operation) {
        ApiFailure.report(operation);
        return ResponseEntity.internalServerError().body(new AuthResponseDTO(false, "Error interno del servidor."));
    }

    private ResponseEntity<List<HelpRequestResponseDTO>> listRequests(String ownerId) {
        try {
            List<HelpRequestResponseDTO> response = new ArrayList<>();
            var requests = theKnowledgeBay.getAllHelpRequests();
            if (requests != null) {
                for (var node = requests.getHead(); node != null; node = node.getNext()) {
                    HelpRequest request = node.getData();
                    if (ownerId == null || (request.getStudent() != null && ownerId.equals(request.getStudent().getId()))) {
                        response.add(toResponse(request));
                    }
                }
            }
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            ApiFailure.report("help.list");
            return ResponseEntity.internalServerError().build();
        }
    }

    private static HelpRequestResponseDTO toResponse(HelpRequest request) {
        List<String> topics = new ArrayList<>();
        if (request.getTopics() != null) {
            for (var node = request.getTopics().getHead(); node != null; node = node.getNext()) {
                topics.add(node.getData().getName());
            }
        }
        Student author = request.getStudent();
        return HelpRequestResponseDTO.builder().requestId(request.getRequestId()).topics(topics)
                .information(request.getInformation()).urgency(request.getUrgency().toString())
                .studentUsername(author == null ? null : author.getUsername()).studentId(author == null ? null : author.getId())
                .isCompleted(request.isCompleted()).requestDate(request.getRequestDate())
                .commentCount(request.getComments() == null ? 0 : request.getComments().getSize()).build();
    }
}
