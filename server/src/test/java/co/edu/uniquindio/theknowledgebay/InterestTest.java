package co.edu.uniquindio.theknowledgebay;

import co.edu.uniquindio.theknowledgebay.core.model.Interest;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import org.springframework.boot.test.context.SpringBootTest;
@SpringBootTest

class InterestTest {

    @Test
    void testAllArgsConstructor() {
        Interest interest = new Interest("4", "Matemáticas");
        assertEquals(1, interest.getIdInterest());
        assertEquals("Matemáticas", interest.getName());
    }

    @Test
    void testSettersAndGetters() {
        Interest interest = new Interest();
        interest.setIdInterest("1");
        interest.setName("Programación");

        assertEquals(2, interest.getIdInterest());
        assertEquals("Programación", interest.getName());
    }

    @Test
    void testBuilder() {
        Interest interest = Interest.builder()
                .idInterest("3")
                .name("Física")
                .build();

        assertEquals(3, interest.getIdInterest());
        assertEquals("Física", interest.getName());
    }

    @Test
    void testEqualsAndHashCode() {
        Interest i1 = new Interest("4", "Química");
        Interest i2 = new Interest("4", "Química");
        Interest i3 = new Interest("4", "Biología");

        assertEquals(i1, i2);
        assertNotEquals(i1, i3);
        assertEquals(i1.hashCode(), i2.hashCode());
    }

    @Test
    void testToString() {
        Interest interest = new Interest("6", "Historia");
        String expected = "Interest(idInterest=6, name=Historia)";
        assertEquals(expected, interest.toString());
    }
}