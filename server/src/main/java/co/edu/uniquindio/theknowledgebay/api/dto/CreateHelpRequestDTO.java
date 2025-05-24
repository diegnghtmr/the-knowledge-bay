package co.edu.uniquindio.theknowledgebay.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateHelpRequestDTO {
    private List<String> topics;
    private String information;
    private String urgency; // LOW, MEDIUM, HIGH, CRITICAL
}