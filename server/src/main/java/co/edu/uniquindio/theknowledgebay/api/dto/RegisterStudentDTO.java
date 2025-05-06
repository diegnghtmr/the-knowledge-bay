package co.edu.uniquindio.theknowledgebay.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterStudentDTO {
    private String email;
    private String name;
    private String lastName;
    private String username;
    private String password;
    // Add other fields from Student if needed for registration
    // For simplicity, starting with basic fields.
}