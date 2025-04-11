package co.edu.uniquindio.theknowledgebay.model;

import co.edu.uniquindio.theknowledgebay.util.datastructures.lists.DoublyLinkedList;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "study_groups")
public class StudyGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int groupId;

    private String name;

    @Transient
    private DoublyLinkedList<Student> members;

    @ManyToOne
    @JoinColumn(name = "topic_id")
    private Interest topic;

    private LocalDate date;

    private boolean hidden;

    @Transient
    private DoublyLinkedList<Content> associatedContents;

    @Transient
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