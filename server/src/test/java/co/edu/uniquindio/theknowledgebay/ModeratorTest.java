package co.edu.uniquindio.theknowledgebay;
import co.edu.uniquindio.theknowledgebay.core.model.Moderator;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import org.springframework.boot.test.context.SpringBootTest;
@SpringBootTest
class ModeratorTest {

    @Test
    void testDefaultConstructor() {
        Moderator moderator = new Moderator();
        assertNotNull(moderator);
    }

    @Test
    void testLoginMethod() {
        Moderator moderator = new Moderator();
        assertFalse(moderator.login());
    }

    @Test
    void testLogoutMethod() {
        Moderator moderator = new Moderator();
        assertDoesNotThrow(moderator::logout);
    }

    @Test
    void testManageUsersMethod() {
        Moderator moderator = new Moderator();
        assertDoesNotThrow(moderator::manageUsers);
    }

    @Test
    void testManageContentsMethod() {
        Moderator moderator = new Moderator();
        assertDoesNotThrow(moderator::manageContents);
    }

    @Test
    void testGenerateReportsMethod() {
        Moderator moderator = new Moderator();
        assertDoesNotThrow(moderator::generateReports);
    }

    @Test
    void testViewAffinityGraphMethod() {
        Moderator moderator = new Moderator();
        assertDoesNotThrow(moderator::viewAffinityGraph);
    }

    @Test
    void testEqualsAndHashCode() {
        Moderator m1 = new Moderator();
        Moderator m2 = new Moderator();
        assertEquals(m1, m2);
        assertEquals(m1.hashCode(), m2.hashCode());
    }

    @Test
    void testToString() {
        Moderator moderator = new Moderator();
        String result = moderator.toString();
        assertTrue(result.contains("Moderator"));
    }
}
