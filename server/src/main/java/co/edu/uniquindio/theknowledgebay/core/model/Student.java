package co.edu.uniquindio.theknowledgebay.core.model;


import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.DoublyLinkedNode;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;


@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@SuperBuilder
public class Student extends User {

    @lombok.Builder.Default
    private DoublyLinkedList<Interest> interests = new DoublyLinkedList<>();
    @lombok.Builder.Default
    private DoublyLinkedList<Content> publishedContents = new DoublyLinkedList<>();
    @lombok.Builder.Default
    private DoublyLinkedList<HelpRequest> helpRequests = new DoublyLinkedList<>();
    @lombok.Builder.Default
    private DoublyLinkedList<StudyGroup> studyGroups = new DoublyLinkedList<>();
    @lombok.Builder.Default
    private DoublyLinkedList<Chat> chats = new DoublyLinkedList<>();

    @lombok.Builder.Default
    private DoublyLinkedList<Student> following = new DoublyLinkedList<>();
    @lombok.Builder.Default
    private DoublyLinkedList<Student> followers = new DoublyLinkedList<>();
    
    private String firstName;
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

    public DoublyLinkedList<Student> suggestContacts(Student s) {
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

    /**
     * Obtiene la lista de intereses como strings para mostrar en el perfil
     * 
     * @return Lista de strings con los nombres de los intereses
     */
    public List<String> getStringInterests() {
        if (interests == null) {
            System.out.println("Intereses es null, retornando lista vacía");
            return Collections.emptyList();
        }
        
        try {
            if (interests.getSize() == 0) {
                System.out.println("Lista de intereses vacía, retornando lista vacía");
                return Collections.emptyList();
            }
            
            List<String> interestNames = new ArrayList<>();
            DoublyLinkedNode<Interest> current = interests.getHead();
            
            while (current != null) {
                Interest interest = current.getData();
                if (interest != null && interest.getName() != null) {
                    interestNames.add(interest.getName());
                }
                current = current.getNext();
            }
            
            return interestNames;
        } catch (Exception e) {
            System.out.println("Error al obtener intereses: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    // Methods for managing followers and following
    public void addFollowing(Student student) {
        if (this.following == null) {
            this.following = new DoublyLinkedList<>();
        }
        if (!this.isFollowing(student)) { // Avoid duplicates
            this.following.addLast(student);
        }
    }

    public boolean removeFollowing(Student student) {
        if (this.following != null) {
            return this.following.remove(student); // Assuming DoublyLinkedList.remove returns boolean
        }
        return false;
    }

    public void addFollower(Student student) {
        if (this.followers == null) {
            this.followers = new DoublyLinkedList<>();
        }
        if (!this.followers.contains(student)) { // Check if student is already a follower to avoid duplicates
            this.followers.addLast(student);
        }
    }

    public boolean removeFollower(Student student) {
        if (this.followers != null) {
            return this.followers.remove(student); // Assuming DoublyLinkedList.remove returns boolean
        }
        return false;
    }

    public int getFollowingCount() {
        return (this.following != null) ? this.following.getSize() : 0;
    }

    public int getFollowersCount() {
        return (this.followers != null) ? this.followers.getSize() : 0;
    }

    public boolean isFollowing(Student student) {
        if (this.following == null || student == null) {
            return false;
        }
        return this.following.contains(student);
    }
}
