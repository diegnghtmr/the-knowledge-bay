package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.api.config.ApiFailure;
import co.edu.uniquindio.theknowledgebay.api.dto.AuthResponseDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.LoginRequestDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.LoginResponseDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.RegisterStudentDTO;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.service.AuthService;
import co.edu.uniquindio.theknowledgebay.core.service.SessionManager;
import co.edu.uniquindio.theknowledgebay.infrastructure.config.BearerSessionFilter;
import co.edu.uniquindio.theknowledgebay.infrastructure.security.AuthenticatedUser;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.converter.StringListToInterests;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

@RestController
@RequiredArgsConstructor // Use constructor injection
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final SessionManager sessions;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@RequestBody RegisterStudentDTO registerDto) {
        LocalDate dateOfBirth = null;
        if (registerDto.getDateOfBirth() != null && !registerDto.getDateOfBirth().isEmpty()) {
            try {
                dateOfBirth = LocalDate.parse(registerDto.getDateOfBirth()); // Assumes yyyy-MM-dd format
            } catch (DateTimeParseException e) {
                // Log the error or handle it as a bad request
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new AuthResponseDTO(false, "Invalid date format for dateOfBirth. Please use yyyy-MM-dd."));
            }
        }

        // Convert DTO to Student model using builder
        Student newStudent = Student.builder()
                .username(registerDto.getUsername())
                .email(registerDto.getEmail())
                .password(registerDto.getPassword())
                .firstName(registerDto.getFirstName())
                .lastName(registerDto.getLastName())
                .dateBirth(dateOfBirth)
                .biography(registerDto.getBiography())
                .interests(StringListToInterests.convert(registerDto.getInterests()))
                .build();

        try {
            String[] registered = authService.registerStudent(newStudent);
            boolean success = "true".equals(registered[0]);
            return ResponseEntity.status(success ? HttpStatus.OK : HttpStatus.BAD_REQUEST)
                    .body(new AuthResponseDTO(success, registered[1]));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(new AuthResponseDTO(false, "Unable to register with the supplied details."));
        } catch (RuntimeException e) {
            ApiFailure.report("auth.register");
            return ResponseEntity.internalServerError().body(new AuthResponseDTO(false, "Internal server error."));
        }
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginDto) {
        var result = authService.login(loginDto.getEmail(), loginDto.getPassword());
        if (result.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponseDTO(false, "Invalid email or password."));
        }
        var session = result.get();
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(new LoginResponseDTO(session.token(), session.user().id(), session.user().role()));
    }

    @GetMapping("/session")
    public ResponseEntity<SessionResponse> session(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(new SessionResponse(user.id(), user.role()));
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponseDTO> logout(
            @RequestAttribute(BearerSessionFilter.SESSION_TOKEN_ATTRIBUTE) String sessionToken) {
        sessions.revoke(sessionToken);
        return ResponseEntity.ok(new AuthResponseDTO(true, "Logged out successfully."));
    }

    public record SessionResponse(String userId, AuthenticatedUser.Role role) {}
}