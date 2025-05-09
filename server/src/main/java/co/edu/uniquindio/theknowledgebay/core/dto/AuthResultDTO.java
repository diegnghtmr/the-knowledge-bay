package co.edu.uniquindio.theknowledgebay.core.dto;

import java.io.Serializable;

public class AuthResultDTO implements Serializable {

    private final String token;
    private final String role;

    public AuthResultDTO(String token, String role) {
        this.token = token;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public String getRole() {
        return role;
    }
}