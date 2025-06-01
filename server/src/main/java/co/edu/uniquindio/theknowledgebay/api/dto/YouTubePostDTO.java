package co.edu.uniquindio.theknowledgebay.api.dto;

public class YouTubePostDTO extends PostDTO {
    private String title;
    private String videoId; // Store video ID or full URL, client can parse if needed
    private String description;

    public YouTubePostDTO() {
        super();
        setType("youtube");
    }

    public YouTubePostDTO(String id, UserSummary author, String timestamp, int likes, String title, String videoId, String description) {
        super(id, "youtube", author, timestamp, likes);
        this.title = title;
        this.videoId = videoId;
        this.description = description;
    }

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getVideoId() {
        return videoId;
    }

    public void setVideoId(String videoId) {
        this.videoId = videoId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
} 