package co.edu.uniquindio.theknowledgebay.core.model;

import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Content implements Comparable<Content> {

    private int contentId;

    private DoublyLinkedList<Interest> topics;

    private String title;

    private String information;

    private Student author;

    private DoublyLinkedList<Student> likedBy;

    private int likeCount;

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