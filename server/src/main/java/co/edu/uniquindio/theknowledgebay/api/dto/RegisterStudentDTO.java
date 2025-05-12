package co.edu.uniquindio.theknowledgebay.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterStudentDTO {
    private String username;
    private String email;
    private String password;
    // Add other fields from Student if needed for registration, e.g., username, lastName
    // For simplicity, starting with basic fields.
}