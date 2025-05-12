package co.edu.uniquindio.theknowledgebay.api.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileResponseDTO {
    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private LocalDate dateBirth;
    private String biography;
    private int following;
    private int followers;
    private int groups;
    private int content;
    private int requests;
    private List<String> interests;
}
