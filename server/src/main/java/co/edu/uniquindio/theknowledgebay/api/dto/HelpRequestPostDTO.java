package co.edu.uniquindio.theknowledgebay.api.dto;

public class HelpRequestPostDTO extends PostDTO {
    private String question;
    private String details;
    private String urgency;

    public HelpRequestPostDTO() {
        super();
        setType("helprequest");
    }

    public HelpRequestPostDTO(String id, UserSummary author, String timestamp, int likes, String question, String details, String urgency) {
        super(id, "helprequest", author, timestamp, likes);
        this.question = question;
        this.details = details;
        this.urgency = urgency;
    }

    // Getters and Setters
    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getUrgency() {
        return urgency;
    }

    public void setUrgency(String urgency) {
        this.urgency = urgency;
    }
} 