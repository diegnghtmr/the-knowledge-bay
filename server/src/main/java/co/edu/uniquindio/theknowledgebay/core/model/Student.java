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

    private DoublyLinkedList<Interest> interests;
    private DoublyLinkedList<Content> publishedContents;
    private DoublyLinkedList<HelpRequest> helpRequests;
    private DoublyLinkedList<StudyGroup> studyGroups;
    private DoublyLinkedList<Chat> chats;
    
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
}
