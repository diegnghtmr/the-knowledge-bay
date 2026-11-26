package co.edu.uniquindio.theknowledgebay.api.dto;

import co.edu.uniquindio.theknowledgebay.infrastructure.security.AuthenticatedUser.Role;

public record LoginResponseDTO(String token, String userId, Role role) {
    @Override
    public String toString() {
        return "LoginResponseDTO[redacted]";
    }
}
