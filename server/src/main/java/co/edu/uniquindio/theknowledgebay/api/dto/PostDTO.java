package co.edu.uniquindio.theknowledgebay.api.dto;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.util.ArrayList;
import java.util.List;

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = MarkdownPostDTO.class, name = "markdown"),
    @JsonSubTypes.Type(value = LinkPostDTO.class, name = "link"),
    @JsonSubTypes.Type(value = YouTubePostDTO.class, name = "youtube"),
    @JsonSubTypes.Type(value = HelpRequestPostDTO.class, name = "helprequest")
})
public abstract class PostDTO {
    private String id;
    private String type;
    private UserSummary author;
    private String timestamp;
    private int likes;
    private List<CommentDTO> comments = new ArrayList<>();
    private boolean likedByMe; // Assuming this state might be user-specific in a real app

    public PostDTO() {}

    public PostDTO(String id, String type, UserSummary author, String timestamp, int likes) {
        this.id = id;
        this.type = type;
        this.author = author;
        this.timestamp = timestamp;
        this.likes = likes;
        this.comments = new ArrayList<>();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public UserSummary getAuthor() {
        return author;
    }

    public void setAuthor(UserSummary author) {
        this.author = author;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public int getLikes() {
        return likes;
    }

    public void setLikes(int likes) {
        this.likes = likes;
    }

    public List<CommentDTO> getComments() {
        return comments;
    }

    public void setComments(List<CommentDTO> comments) {
        this.comments = comments;
    }

    public boolean isLikedByMe() {
        return likedByMe;
    }

    public void setLikedByMe(boolean likedByMe) {
        this.likedByMe = likedByMe;
    }
} 