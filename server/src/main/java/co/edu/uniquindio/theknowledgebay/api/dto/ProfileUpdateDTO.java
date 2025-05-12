package co.edu.uniquindio.theknowledgebay.api.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileUpdateDTO {
    private String username;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private LocalDate dateBirth;
    private String biography;
}