package co.edu.uniquindio.theknowledgebay.api.dto;

// No lombok for simple DTO if not used elsewhere, or add if standard
public class CommentRequest {
    private String text;
    private String authorId; 
    private String authorName;

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
} 