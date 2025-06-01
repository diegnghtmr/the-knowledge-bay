package co.edu.uniquindio.theknowledgebay.core.model;

import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import lombok.AllArgsConstructor;
import lombok.Builder;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class StudyGroup {

    private String id;
    private String name;
    @lombok.Builder.Default
    private DoublyLinkedList<Student> members = new DoublyLinkedList<>();
    private Interest topic;
    @lombok.Builder.Default
    private LocalDate date = LocalDate.now();
    private boolean hidden;
    @lombok.Builder.Default
    private DoublyLinkedList<Content> associatedContents = new DoublyLinkedList<>();
    @lombok.Builder.Default
    private DoublyLinkedList<HelpRequest> associatedHelpRequests = new DoublyLinkedList<>();

    public void addStudent(Student s) {
        if (s != null && !this.members.contains(s)) {
            this.members.addLast(s);
        }
    }

    public void removeStudent(Student s) {
        if (s != null) {
            this.members.remove(s);
        }
    }

    public void setName(String newName) {
        // TODO: implement functionality
    }
}