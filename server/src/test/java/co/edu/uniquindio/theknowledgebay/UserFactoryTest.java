package co.edu.uniquindio.theknowledgebay;
import co.edu.uniquindio.theknowledgebay.core.factory.UserFactory;
import co.edu.uniquindio.theknowledgebay.core.model.Moderator;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.infrastructure.config.ModeratorProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;

class UserFactoryTest {

    private UserFactory userFactory;

    @BeforeEach
    void setUp() {
        userFactory = UserFactory.getInstance();
        // Reset factory state if necessary, though getInstance implies singleton
        // For true isolation, might need a reset method or new instance creation if possible
    }

    @Test
    void testSetAndGetModerator() {
        ModeratorProperties props = Mockito.mock(ModeratorProperties.class);
        Mockito.when(props.name()).thenReturn("admin");
        Mockito.when(props.email()).thenReturn("admin@example.com");
        // No need to mock password() for this test as it's used with encoder elsewhere

        userFactory.setModerator(props, "encodedPassword");
        Moderator mod = userFactory.getModerator();

        assertNotNull(mod);
        assertEquals("admin", mod.getUsername());
        assertEquals("admin@example.com", mod.getEmail());
        assertEquals("encodedPassword", mod.getPassword());
    }

    @Test
    void testAddAndGetStudents() {
        Student student1 = Student.builder().id("s1").username("stud1").build();
        Student student2 = Student.builder().id("s2").username("stud2").build();

        userFactory.add(student1);
        userFactory.add(student2);

        assertNotNull(userFactory.getStudents());
        assertEquals(2, userFactory.getStudents().getSize()); // Assuming previous tests didn't add students
        // or factory is reset.
        // This might be flaky if factory state persists.
        assertTrue(userFactory.getStudents().contains(student1));
        assertTrue(userFactory.getStudents().contains(student2));
    }
}
