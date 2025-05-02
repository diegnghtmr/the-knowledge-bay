package co.edu.uniquindio.theknowledgebay.controller;

import co.edu.uniquindio.theknowledgebay.dto.AuthResponseDTO;
import co.edu.uniquindio.theknowledgebay.dto.LoginRequestDTO;
import co.edu.uniquindio.theknowledgebay.dto.LoginResponseDTO;
import co.edu.uniquindio.theknowledgebay.dto.RegisterStudentDTO;
import co.edu.uniquindio.theknowledgebay.model.Student;
import co.edu.uniquindio.theknowledgebay.service.InMemoryAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"}) // Keep CORS for frontend
@RequiredArgsConstructor // Use constructor injection
public class AuthController {

    private final InMemoryAuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@RequestBody RegisterStudentDTO registerDto) {
        // Convert DTO to Student model using builder
        Student newStudent = Student.builder()
                .name(registerDto.getName())
                .email(registerDto.getEmail())
                .password(registerDto.getPassword()) // Password will be hashed in the service
                .biography("") // Initialize biography as required
                // Add other fields from DTO if they exist (e.g., username, lastName)
                .build();

        boolean registered = authService.registerStudent(newStudent);

        if (registered) {
            return ResponseEntity.ok(new AuthResponseDTO(true, "Student registered successfully."));
        } else {
            // Assuming failure is due to existing email based on service logic
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AuthResponseDTO(false, "Email already exists."));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginDto) {
        Optional<String> tokenOpt = authService.login(loginDto.getEmail(), loginDto.getPassword());

        if (tokenOpt.isPresent()) {
            String token = tokenOpt.get();
            String role = authService.getUserRole(loginDto.getEmail()); // Get role after successful login
            return ResponseEntity.ok(new LoginResponseDTO(token, role));
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