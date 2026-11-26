package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.api.config.ApiFailure;
import co.edu.uniquindio.theknowledgebay.api.dto.AuthResponseDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.ProfileResponseDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.ProfileUpdateDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.UserSummaryDTO;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.model.User;
import co.edu.uniquindio.theknowledgebay.core.service.AuthService;
import co.edu.uniquindio.theknowledgebay.infrastructure.security.AuthenticatedUser;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/profile")
public class ProfileController {
    private static final String MISSING_NAME = "Información no disponible";
    private static final LocalDate MISSING_BIRTHDAY = LocalDate.of(1900, 1, 1);
    private static final String MISSING_BIO = "[Tu biografía aquí]";
    private static final DateTimeFormatter SHORT_BIRTHDAY = DateTimeFormatter.ofPattern("dd/MM/yy");

    private final TheKnowledgeBay theKnowledgeBay;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ProfileResponseDTO> getProfile(@AuthenticationPrincipal AuthenticatedUser caller) {
        return getUserProfile(caller.id(), caller);
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal AuthenticatedUser caller, @RequestBody ProfileUpdateDTO dto) {
        User user = authService.findUserById(caller.id()).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        if (dto.getPassword() != null) {
            if (!(user instanceof Student)) {
                return ResponseEntity.status(403).body(new AuthResponseDTO(false,
                        "La contraseña del moderador se administra en la configuración del servidor."));
            }
            if (!AuthService.isAcceptablePassword(dto.getPassword())) {
                return ResponseEntity.badRequest().body(new AuthResponseDTO(false, "La contraseña debe tener de 1 a 72 bytes UTF-8 y no estar en blanco."));
            }
        }
        if (authService.findUserByEmail(dto.getEmail()).filter(existing -> !caller.id().equals(existing.getId())).isPresent()) {
            return ResponseEntity.badRequest().body(new AuthResponseDTO(false, "Ya existe un usuario con ese correo."));
        }
        if (authService.findUserByUsername(dto.getUsername()).filter(existing -> !caller.id().equals(existing.getId())).isPresent()) {
            return ResponseEntity.badRequest().body(new AuthResponseDTO(false, "Ya existe un usuario con ese nombre."));
        }

        Student patch = Student.builder()
                .id(caller.id())
                .username(dto.getUsername())
                .email(dto.getEmail())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .dateBirth(parseBirthday(dto))
                .biography(dto.getBiography())
                .build();
        try {
            if (dto.getPassword() != null) {
                authService.changeStudentPassword(patch, dto.getInterests(), dto.getPassword());
            } else {
                theKnowledgeBay.updateUser(caller.id(), patch, dto.getInterests());
            }
            return getProfile(caller);
        } catch (RuntimeException e) {
            ApiFailure.report("profile.update");
            return ResponseEntity.internalServerError().body(new AuthResponseDTO(false, "Error interno del servidor."));
        }
    }

    @GetMapping("/followers")
    public ResponseEntity<List<UserSummaryDTO>> getFollowers(@AuthenticationPrincipal AuthenticatedUser caller) {
        User user = authService.findUserById(caller.id()).orElse(null);
        return ResponseEntity.ok(user instanceof Student student ? summarize(student.getFollowers()) : List.of());
    }

    @GetMapping("/following")
    public ResponseEntity<List<UserSummaryDTO>> getFollowing(@AuthenticationPrincipal AuthenticatedUser caller) {
        User user = authService.findUserById(caller.id()).orElse(null);
        return ResponseEntity.ok(user instanceof Student student ? summarize(student.getFollowing()) : List.of());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ProfileResponseDTO> getUserProfile(@PathVariable String userId,
                                                            @AuthenticationPrincipal AuthenticatedUser caller) {
        return authService.findUserById(userId)
                .map(user -> ResponseEntity.ok(toProfile(user, caller.id())))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private ProfileResponseDTO toProfile(User user, String callerId) {
        String id = user.getId();
        var builder = ProfileResponseDTO.builder()
                .id(id).username(user.getUsername()).email(user.getEmail())
                .groups(theKnowledgeBay.getUserStudyGroupCount(id))
                .contentCount(theKnowledgeBay.getContentCountByUserId(id))
                .helpRequestCount(theKnowledgeBay.getHelpRequestCountByUserId(id));
        if (user instanceof Student student) {
            return builder.firstName(orDefault(student.getFirstName(), MISSING_NAME))
                    .lastName(orDefault(student.getLastName(), MISSING_NAME))
                    .dateBirth(orDefault(student.getDateBirth(), MISSING_BIRTHDAY))
                    .biography(orDefault(student.getBiography(), MISSING_BIO))
                    .interests(orDefault(student.getStringInterests(), List.of()))
                    .followers(student.getFollowersCount()).following(student.getFollowingCount())
                    .currentUserFollowing(!callerId.equals(id) && authService.findUserById(callerId).isPresent()
                            && theKnowledgeBay.isUserFollowing(callerId, id))
                    .build();
        }
        return builder.firstName(MISSING_NAME).lastName(MISSING_NAME).dateBirth(MISSING_BIRTHDAY)
                .biography(MISSING_BIO).interests(List.of()).build();
    }

    private static <T> T orDefault(T value, T fallback) {
        return value == null ? fallback : value;
    }

    private static LocalDate parseBirthday(ProfileUpdateDTO dto) {
        if (dto.getBirthday() != null && !dto.getBirthday().isEmpty()) {
            try {
                return LocalDate.parse(dto.getBirthday(), SHORT_BIRTHDAY);
            } catch (DateTimeParseException ignored) {
                // Keep the typed date (if supplied) when the legacy format cannot be parsed.
            }
        }
        return dto.getDateBirth();
    }

    private static List<UserSummaryDTO> summarize(DoublyLinkedList<Student> students) {
        if (students == null) {
            return List.of();
        }
        List<UserSummaryDTO> summaries = new ArrayList<>();
        for (var node = students.getHead(); node != null; node = node.getNext()) {
            Student student = node.getData();
            summaries.add(UserSummaryDTO.builder().id(student.getId()).username(student.getUsername())
                    .firstName(student.getFirstName()).lastName(student.getLastName()).build());
        }
        return summaries;
    }
}
