package co.edu.uniquindio.theknowledgebay;
import co.edu.uniquindio.theknowledgebay.core.model.Content;
import co.edu.uniquindio.theknowledgebay.core.model.HelpRequest;
import co.edu.uniquindio.theknowledgebay.core.model.Message;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class StudentTest {

    private Student student;

    @BeforeEach
    void setUp() {
        student = Student.builder()
                .firstName("Juan")
                .lastName("Perez")
                .dateBirth(LocalDate.of(2000, 1, 1))
                .biography("Estudiante de prueba")
                .interests(new DoublyLinkedList<>())
                .publishedContents(new DoublyLinkedList<>())
                .helpRequests(new DoublyLinkedList<>())
                .studyGroups(new DoublyLinkedList<>())
                .chats(new DoublyLinkedList<>())
                .build();
    }

    @Test
    void testStudentBasicAttributes() {
        assertEquals("Juan", student.getFirstName());
        assertEquals("Perez", student.getLastName());
        assertEquals(LocalDate.of(2000, 1, 1), student.getDateBirth());
        assertEquals("Estudiante de prueba", student.getBiography());
    }


    @Test
    void testLikeContent() {
        Content content = new Content();
        student.likeContent(content);
    }

    @Test
    void testRequestHelp() {
        HelpRequest request = new HelpRequest();
        student.requestHelp(request);
    }

    @Test
    void testSuggestContacts() {
        Student otherStudent = new Student();
        DoublyLinkedList<Student> contacts = student.suggestContacts(otherStudent);
        assertNull(contacts);
    }

    @Test
    void testSendMessage () {
        Message message = new Message();
        student.sendMessage(message);

    }

    @Test
    void testLoginLogout () {
        assertFalse(student.login());
        student.logout();
    }
}
