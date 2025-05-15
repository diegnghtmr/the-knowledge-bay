package co.edu.uniquindio.theknowledgebay.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
public class ProfileUpdateDTO {
    private String username;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    
    @JsonProperty("birthday")
    private String birthday;
    
    private LocalDate dateBirth;
    
    @JsonProperty("bio")
    private String biography;
    
    private List<String> interests;
}