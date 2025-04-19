package co.edu.uniquindio.theknowledgebay.model;

import co.edu.uniquindio.theknowledgebay.util.datastructures.lists.DoublyLinkedList;
import lombok.AllArgsConstructor;
import lombok.Builder;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyGroup {

    private int groupId;

    private String name;

    private DoublyLinkedList<Student> members;

    private Interest topic;

    private LocalDate date;

    private boolean hidden;

    private DoublyLinkedList<Content> associatedContents;

    private DoublyLinkedList<HelpRequest> associatedHelpRequests;

    public void addStudent(Student s) {
        // TODO: implement functionality
    }

    public void removeStudent(Student s) {
        // TODO: implement functionality
    }

    public void setName(String newName) {
        // TODO: implement functionality
    }
}