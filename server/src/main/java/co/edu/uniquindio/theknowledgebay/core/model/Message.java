package co.edu.uniquindio.theknowledgebay.core.model;

import lombok.AllArgsConstructor;
import lombok.Builder;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {
    private int messageId;
    private String text;
    private Student sender;
    private LocalDateTime timestamp;
}