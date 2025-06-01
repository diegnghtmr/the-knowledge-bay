package co.edu.uniquindio.theknowledgebay.api.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSummaryDTO {
    private String id;
    private String username;
    private String firstName;
    private String lastName;
} 