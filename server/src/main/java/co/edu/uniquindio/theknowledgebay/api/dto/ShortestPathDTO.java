package co.edu.uniquindio.theknowledgebay.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShortestPathDTO {
    private List<String> path;
    private boolean pathFound;
    private String message;
}