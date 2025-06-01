package co.edu.uniquindio.theknowledgebay.api.dto;

public class MarkdownPostDTO extends PostDTO {
    private String title;
    private String content;
    private String videoUrl;
    private String linkUrl;
    private String fileName;
    private String actualContentType;

    public MarkdownPostDTO() {
        super();
        setType("markdown");
    }

    public MarkdownPostDTO(String id, UserSummary author, String timestamp, int likes, String title, String content) {
        super(id, "markdown", author, timestamp, likes);
        this.title = title;
        this.content = content;
        this.videoUrl = null;
        this.linkUrl = null;
        this.fileName = null;
        this.actualContentType = "MARKDOWN";
    }

    // Getter and Setter
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public String getLinkUrl() {
        return linkUrl;
    }

    public void setLinkUrl(String linkUrl) {
        this.linkUrl = linkUrl;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getActualContentType() {
        return actualContentType;
    }

    public void setActualContentType(String actualContentType) {
        this.actualContentType = actualContentType;
    }
} 