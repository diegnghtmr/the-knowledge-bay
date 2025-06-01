package co.edu.uniquindio.theknowledgebay.api.dto;

public class LinkPostDTO extends PostDTO {
    private String title;
    private String url;
    private String description;

    public LinkPostDTO() {
        super();
        setType("link");
    }

    public LinkPostDTO(String id, UserSummary author, String timestamp, int likes, String title, String url, String description) {
        super(id, "link", author, timestamp, likes);
        this.title = title;
        this.url = url;
        this.description = description;
    }

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
} 