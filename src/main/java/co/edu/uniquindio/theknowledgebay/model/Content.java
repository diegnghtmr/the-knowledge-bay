package co.edu.uniquindio.theknowledgebay.model;

import co.edu.uniquindio.theknowledgebay.util.datastructures.lists.DoublyLinkedList;
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
@Table(name = "contents")
public class Content implements Comparable<Content> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int contentId;

    @Transient
    private DoublyLinkedList<Interest> topics;

    private String title;

    private String information;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private Student author;

    @Transient
    private DoublyLinkedList<Student> likedBy;

    private int likeCount;

    @Transient
    private DoublyLinkedList<Comment> comments;

    private LocalDate date;

    public void addLike(Student s) {
        // TODO: implement functionality
    }

    public void removeLike(Student s) {
        // TODO: implement functionality
    }

    public boolean hasLiked(Student s) {
        // TODO: implement functionality
        return false;
    }

    public void addComment(Comment c) {
        // TODO: implement functionality
    }
    
    @Override
    public int compareTo(Content other) {
        return Integer.compare(this.contentId, other.contentId);
    }
}