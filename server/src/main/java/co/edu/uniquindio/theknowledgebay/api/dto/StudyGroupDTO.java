package co.edu.uniquindio.theknowledgebay.api.dto;

import java.util.List;

public class StudyGroupDTO {
    private String id;
    private String name;
    private String interest;
    // Description removed as per previous request for client-side
    private int members;
    // Unread count removed as per previous request for client-side
    // heroImage will be constructed on the client-side based on interest

    public StudyGroupDTO() {
    }

    public StudyGroupDTO(String id, String name, String interest, int members) {
        this.id = id;
        this.name = name;
        this.interest = interest;
        this.members = members;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getInterest() {
        return interest;
    }

    public void setInterest(String interest) {
        this.interest = interest;
    }

    public int getMembers() {
        return members;
    }

    public void setMembers(int members) {
        this.members = members;
    }
} 