package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.api.dto.AuthResponseDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.LoginRequestDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.LoginResponseDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.RegisterStudentDTO;
import co.edu.uniquindio.theknowledgebay.core.dto.AuthResultDTO;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;

@RestController
@RequiredArgsConstructor // Use constructor injection
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

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
                .firstName("") // Assuming firstName might be part of a more complete profile later
                .lastName("")  // Assuming lastName might be part of a more complete profile later
                .dateBirth(dateOfBirth) // Set the parsed dateOfBirth
                .biography("") // Assuming biography might be part of a more complete profile later
                .build();

        String[] registered = authService.registerStudent(newStudent);

        if (registered[0].equals("true")) {
            return ResponseEntity.ok(new AuthResponseDTO(true, registered[1]));
        } else {
            // Assuming failure is due to existing email based on service logic
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AuthResponseDTO(false, registered[1]));
        }
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginDto) {
        Optional<AuthResultDTO> resultOpt = authService.login(loginDto.getEmail(), loginDto.getPassword());

        if (resultOpt.isPresent()) {
            System.out.println("Login result: " + resultOpt.get().getToken());
            AuthResultDTO result = resultOpt.get();
            return ResponseEntity.ok(new LoginResponseDTO(result.getToken(), result.getRole()));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponseDTO(false, "Invalid email or password."));
        }
    }

    // Logout endpoint
    @PostMapping("/logout")
    public ResponseEntity<AuthResponseDTO> logout(@RequestHeader("Authorization") String authHeader) {
        // The AuthInterceptor already validates the token before this method is called.
        // We just need to extract it again to tell the service which session to remove.
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            authService.logout(token); // Call the service method to remove the session
            return ResponseEntity.ok(new AuthResponseDTO(true, "Logged out successfully."));
        }
        // This case should ideally not be reached if the interceptor is configured correctly
        // for this path, but included for robustness.
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new AuthResponseDTO(false, "Missing or invalid Authorization header."));
    }
}