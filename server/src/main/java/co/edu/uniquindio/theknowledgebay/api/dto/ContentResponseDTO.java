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
public class ContentResponseDTO {
    private int contentId;
    private List<String> topics;
    private String title;
    private String contentType;
    private String information;
    private String authorUsername;
    private String authorId;
    private int likeCount;
    private boolean hasLiked;
    private int commentCount;
    private LocalDate date;
    private String linkUrl;
    private String videoUrl;
    private String fileName;
}