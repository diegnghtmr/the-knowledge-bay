package co.edu.uniquindio.theknowledgebay.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateContentDTO {
    private String title;
    private String contentType; // ARTICLE, QUESTION, LINK, VIDEO, RESOURCE
    private String body;
    private String linkUrl;
    private String videoUrl;
    private List<String> topics;
    // Note: file upload will be handled separately in the controller
}