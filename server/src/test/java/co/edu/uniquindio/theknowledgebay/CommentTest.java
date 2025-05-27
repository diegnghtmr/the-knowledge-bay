package co.edu.uniquindio.theknowledgebay;
import org.springframework.boot.test.context.SpringBootTest;
import co.edu.uniquindio.theknowledgebay.core.model.Comment;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class CommentTest {

    @Test
    public void testAllArgsConstructorAndGetters() {
        Student author =  Student.builder().firstName("Carlos").build();
        LocalDate date = LocalDate.of(2024, 10, 5);

        Comment comment = Comment.builder().text( "Buen trabajo").author(author).date(date).build();

        assertEquals("Buen trabajo", comment.getText());
        assertEquals(author, comment.getAuthor());
        assertEquals(date, comment.getDate());
    }

    @Test
    public void testBuilderCreatesCorrectObject() {
        Student author =  Student.builder().firstName("Lucía").build();
        LocalDate date = LocalDate.now();

        Comment comment = Comment.builder()
                .commentId(2)
                .text("Muy útil")
                .author(author)
                .date(date)
                .build();

        assertEquals(2, comment.getCommentId());
        assertEquals("Muy útil", comment.getText());
        assertEquals(author, comment.getAuthor());
        assertEquals(date, comment.getDate());
    }

    @Test
    public void testSetters() {
        Comment comment = new Comment();
        Student student = Student.builder().firstName("Mario").build();

        comment.setCommentId(10);
        comment.setText("Gracias por compartir");
        comment.setAuthor(student);
        comment.setDate(LocalDate.of(2025, 1, 1));

        assertEquals(10, comment.getCommentId());
        assertEquals("Gracias por compartir", comment.getText());
        assertEquals(student, comment.getAuthor());
        assertEquals(LocalDate.of(2025, 1, 1), comment.getDate());
    }
}