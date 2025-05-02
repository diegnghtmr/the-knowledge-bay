package co.edu.uniquindio.theknowledgebay.core.model;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {
    private int commentId;
    private String text;
    private Student author;
    private LocalDate date;
}