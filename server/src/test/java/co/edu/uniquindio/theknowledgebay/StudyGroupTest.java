package co.edu.uniquindio.theknowledgebay;
import co.edu.uniquindio.theknowledgebay.core.model.Interest;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.model.StudyGroup;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;


@SpringBootTest
class StudyGroupTest {

    private StudyGroup studyGroup;
    private Student student;

    @BeforeEach
    void setUp() {
        student = Student.builder().firstName("Lucas").lastName("Martínez").build();

        studyGroup = StudyGroup.builder()
                .groupId(101)
                .name("Grupo de Álgebra")
                .members(new DoublyLinkedList<>())
                .topic(Interest.builder().idInterest("1").name("Matemáticas").build())
                .date(LocalDate.of(2024, 5, 15))
                .hidden(false)
                .associatedContents(new DoublyLinkedList<>())
                .associatedHelpRequests(new DoublyLinkedList<>())
                .build();
    }

    @Test
    void testAttributes() {
        assertEquals(101, studyGroup.getGroupId());
        assertEquals("Grupo de Álgebra", studyGroup.getName());
        assertEquals("Matemáticas", studyGroup.getTopic().getName());
        assertFalse(studyGroup.isHidden());
        assertEquals(LocalDate.of(2024, 5, 15), studyGroup.getDate());
        assertNotNull(studyGroup.getMembers());
        assertNotNull(studyGroup.getAssociatedContents());
        assertNotNull(studyGroup.getAssociatedHelpRequests());
    }

    @Test
    void testSetName() {
        studyGroup.setName("Nuevo Nombre");
        studyGroup.getName();
    }



    @Test
    void testBuilder() {
        StudyGroup group = StudyGroup.builder()
                .groupId(200)
                .name("Física Cuántica")
                .members(new DoublyLinkedList<>())
                .topic(Interest.builder().idInterest("2").name("Física").build())
                .date(LocalDate.now())
                .hidden(true)
                .associatedContents(new DoublyLinkedList<>())
                .associatedHelpRequests(new DoublyLinkedList<>())
                .build();

        assertEquals(200, group.getGroupId());
        assertEquals("Física Cuántica", group.getName());
        assertTrue(group.isHidden());
    }

    @Test
    void testEqualsAndHashCode() {
        StudyGroup g1 = new StudyGroup(1, "Grupo 1", new DoublyLinkedList<>(),
                Interest.builder().idInterest("1").name("Redes").build(),
                LocalDate.of(2024, 5, 1), false,
                new DoublyLinkedList<>(), new DoublyLinkedList<>());

        StudyGroup g2 = new StudyGroup(1, "Grupo 1", new DoublyLinkedList<>(),
                Interest.builder().idInterest("1").name("Redes").build(),
                LocalDate.of(2024, 5, 1), false,
                new DoublyLinkedList<>(), new DoublyLinkedList<>());

        assertEquals(g1, g2);
        assertEquals(g1.hashCode(), g2.hashCode());
    }

    @Test
    void testToString() {
        String str = studyGroup.toString();
        assertTrue(str.contains("Grupo de Álgebra"));
        assertTrue(str.contains("Matemáticas"));
    }
}
