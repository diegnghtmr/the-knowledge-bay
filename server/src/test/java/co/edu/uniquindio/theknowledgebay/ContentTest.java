package co.edu.uniquindio.theknowledgebay;
import co.edu.uniquindio.theknowledgebay.core.model.Comment;
import co.edu.uniquindio.theknowledgebay.core.model.Content;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class ContentTest {

    private Student author;
    private Comment comment;
    private Content content;

    @BeforeEach
    public void setUp() {
        author = Student.builder().firstName("María").build();
        comment = new Comment(1, "Muy bueno", author, LocalDate.now());

        content = Content.builder()
                .contentId(101)
                .topics(new DoublyLinkedList<>())
                .title("Introducción a Java")
                .information("Contenido detallado sobre Java.")
                .author(author)
                .likedBy(new DoublyLinkedList<>())
                .likeCount(0)
                .comments(new DoublyLinkedList<>())
                .date(LocalDate.of(2025, 5, 20))
                .build();
    }

    @Test
    public void testCompareTo() {
        Content other = Content.builder().contentId(105).build();
        assertTrue(content.compareTo(other) < 0);
    }

    @Test
    public void testBuilderAndGetters() {
        assertEquals(101, content.getContentId());
        assertEquals("Introducción a Java", content.getTitle());
        assertEquals("Contenido detallado sobre Java.", content.getInformation());
        assertEquals(author, content.getAuthor());
        assertEquals(LocalDate.of(2025, 5, 20), content.getDate());
    }

    @Test
    public void testAddComment() {
        content.addComment(comment);
    }


    @Test
    public void testRemoveLike() {
        content.addLike(author);
        content.removeLike(author);
        assertFalse(content.hasLiked(author));
        assertEquals(0, content.getLikeCount());
    }
}