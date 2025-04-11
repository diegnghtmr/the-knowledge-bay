package co.edu.uniquindio.theknowledgebay.model;

import co.edu.uniquindio.theknowledgebay.util.datastructures.lists.DoublyLinkedList;
import co.edu.uniquindio.theknowledgebay.model.enums.Urgency;
import jakarta.persistence.*;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "help_requests")
public class HelpRequest implements Comparable<HelpRequest> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int requestId;

    @Transient
    private DoublyLinkedList<Interest> topics;

    private String information;

    @Enumerated(EnumType.STRING)
    private Urgency urgency;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    private boolean isCompleted;

    private LocalDate requestDate;

    @Transient
    private DoublyLinkedList<Comment> comments;

    public void markAsCompleted() {
        // Stub method: implementation not provided
    }

    public void addComment(Comment c) {
        // Stub method: implementation not provided
    }

    @Override
    public int compareTo(HelpRequest other) {
        // First compare by urgency (higher urgency comes first)
        int urgencyCompare = other.urgency.compareTo(this.urgency);
        if (urgencyCompare != 0) {
            return urgencyCompare;
        }
        // If same urgency, older requests come first
        return this.requestDate.compareTo(other.requestDate);
    }
}
