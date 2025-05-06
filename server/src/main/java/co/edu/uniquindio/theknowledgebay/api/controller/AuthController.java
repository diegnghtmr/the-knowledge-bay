package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.api.dto.AuthResponseDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.LoginRequestDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.LoginResponseDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.RegisterStudentDTO;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.service.InMemoryAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"}) // Keep CORS for frontend
@RequiredArgsConstructor 
public class AuthController {

    private final InMemoryAuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@RequestBody RegisterStudentDTO registerDto) {
        boolean registered = authService.registerStudent(registerDto);

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
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            authService.logout(token);
            return ResponseEntity.ok(new AuthResponseDTO(true, "Logged out successfully."));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new AuthResponseDTO(false, "Missing or invalid Authorization header."));
    }
}