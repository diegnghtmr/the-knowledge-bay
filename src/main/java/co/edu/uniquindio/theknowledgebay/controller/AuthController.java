package co.edu.uniquindio.theknowledgebay.controller;

import co.edu.uniquindio.theknowledgebay.model.User;
import co.edu.uniquindio.theknowledgebay.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (authService.isEmailTaken(user.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "El correo electrónico ya está registrado"));
        }

        boolean registered = authService.registerUser(user);
        if (registered) {
            return ResponseEntity.ok(Map.of(
                "message", "Usuario registrado exitosamente",
                "username", user.getUsername()
            ));
        }

        return ResponseEntity.badRequest()
                .body(Map.of("message", "El nombre de usuario ya existe"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        Optional<User> userOpt = authService.loginUser(username, password);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login exitoso");
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.badRequest()
                .body(Map.of("message", "Credenciales inválidas"));
    }
}