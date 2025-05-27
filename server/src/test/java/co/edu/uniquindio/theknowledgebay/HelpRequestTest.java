package co.edu.uniquindio.theknowledgebay;

import co.edu.uniquindio.theknowledgebay.core.model.Comment;
import co.edu.uniquindio.theknowledgebay.core.model.HelpRequest;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.model.enums.Urgency;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class HelpRequestTest {

    private HelpRequest request;
    private Student student;

    @BeforeEach
    void setUp() {
        student = Student.builder()
                .firstName("Laura")
                .lastName("Gomez")
                .build();

        request = HelpRequest.builder()
                .requestId(1)
                .topics(new DoublyLinkedList<>())
                .information("Necesito ayuda con estructuras de datos")
                .urgency(Urgency.HIGH)
                .student(student)
                .isCompleted(false)
                .requestDate(LocalDate.of(2024, 5, 10))
                .comments(new DoublyLinkedList<>())
                .build();
    }

    @Test
    void testBasicAttributes() {
        assertEquals(1, request.getRequestId());
        assertEquals("Necesito ayuda con estructuras de datos", request.getInformation());
        assertEquals(Urgency.HIGH, request.getUrgency());
        assertEquals(student, request.getStudent());
        assertFalse(request.isCompleted());
        assertEquals(LocalDate.of(2024, 5, 10), request.getRequestDate());
        assertNotNull(request.getTopics());
        assertNotNull(request.getComments());
    }

    @Test
    void testMarkAsCompleted() {
        request.markAsCompleted();
        request.setCompleted(true);
        assertTrue(request.isCompleted());
    }




    @Test
    void testCompareToByUrgency() {
        HelpRequest other = HelpRequest.builder()
                .urgency(Urgency.MEDIUM)
                .requestDate(LocalDate.of(2024, 5, 11))
                .build();

        assertTrue(request.compareTo(other) < 0); // HIGH < MEDIUM (mayor prioridad)
    }

    @Test
    void testCompareToByDateWhenSameUrgency() {
        HelpRequest earlier = HelpRequest.builder()
                .urgency(Urgency.HIGH)
                .requestDate(LocalDate.of(2024, 5, 1))
                .build();

        assertTrue(request.compareTo(earlier) > 0); // request is newer, so comes after
    }

    @Test
    void testCompareToEqual() {
        HelpRequest same = HelpRequest.builder()
                .urgency(Urgency.HIGH)
                .requestDate(LocalDate.of(2024, 5, 10))
                .build();

        assertEquals(0, request.compareTo(same));
    }
}
