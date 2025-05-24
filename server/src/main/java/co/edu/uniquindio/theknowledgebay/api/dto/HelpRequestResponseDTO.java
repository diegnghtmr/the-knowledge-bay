package co.edu.uniquindio.theknowledgebay.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HelpRequestResponseDTO {
    private int requestId;
    private List<String> topics;
    private String information;
    private String urgency;
    private String studentUsername;
    private String studentId;
    private boolean isCompleted;
    private LocalDate requestDate;
    private int commentCount;
}