package co.edu.uniquindio.theknowledgebay.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import java.time.LocalDate;
import co.edu.uniquindio.theknowledgebay.util.datastructures.lists.DoublyLinkedList;
import jakarta.persistence.Transient;


@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@SuperBuilder
public class Student extends User {

    @Transient
    private DoublyLinkedList<Interest> interests;
    @Transient
    private DoublyLinkedList<Content> publishedContents;
    @Transient
    private DoublyLinkedList<HelpRequest> helpRequests;
    @Transient
    private DoublyLinkedList<StudyGroup> studyGroups;
    @Transient
    private DoublyLinkedList<Chat> chats;
    
    private String username;
    private String lastName;
    private LocalDate dateBirth;
    private String biography;
    
    public void register() {
        // TODO: implement functionality
    }
    
    public void publishContent(Content c) {
        // TODO: implement functionality
    }
    
    public void likeContent(Content c) {
        // TODO: implement functionality
    }
    
    public void unlikeContent(Content c) {
        // TODO: implement functionality
    }
    
    public void requestHelp(HelpRequest r) {
        // TODO: implement functionality
    }
    
    public DoublyLinkedList<Student> seeStudySuggestions() {
        // TODO: implement functionality
        return null;
    }
    
    public void sendMessage(Message m) {
        // TODO: implement functionality
    }
    
    @Override
    public boolean login() {
        // TODO: implement functionality
        return false;
    }
    
    @Override
    public void logout() {
        // TODO: implement functionality
    }
}
