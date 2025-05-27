package co.edu.uniquindio.theknowledgebay;
import co.edu.uniquindio.theknowledgebay.core.model.Message;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class MessageTest {

    @Test
    void testAllArgsConstructor() {
        Student sender = Student.builder().firstName("Carlos").lastName("Mendez").build();
        LocalDateTime timestamp = LocalDateTime.now();

        Message message = new Message(1, "Hola, ¿cómo estás?", sender, timestamp);

        assertEquals(1, message.getMessageId());
        assertEquals("Hola, ¿cómo estás?", message.getText());
        assertEquals(sender, message.getSender());
        assertEquals(timestamp, message.getTimestamp());
    }

    @Test
    void testSettersAndGetters() {
        Student sender = Student.builder().firstName("Ana").build();
        LocalDateTime timestamp = LocalDateTime.now();

        Message message = new Message();
        message.setMessageId(2);
        message.setText("Mensaje de prueba");
        message.setSender(sender);
        message.setTimestamp(timestamp);

        assertEquals(2, message.getMessageId());
        assertEquals("Mensaje de prueba", message.getText());
        assertEquals(sender, message.getSender());
        assertEquals(timestamp, message.getTimestamp());
    }

    @Test
    void testBuilder() {
        LocalDateTime now = LocalDateTime.now();
        Student sender = Student.builder().firstName("Luis").build();

        Message message = Message.builder()
                .messageId(3)
                .text("Builder test")
                .sender(sender)
                .timestamp(now)
                .build();

        assertEquals(3, message.getMessageId());
        assertEquals("Builder test", message.getText());
        assertEquals(sender, message.getSender());
        assertEquals(now, message.getTimestamp());
    }

    @Test
    void testEqualsAndHashCode() {
        Student sender = Student.builder().firstName("Pedro").build();
        LocalDateTime time = LocalDateTime.of(2024, 10, 5, 15, 30);

        Message m1 = new Message(10, "Mensaje", sender, time);
        Message m2 = new Message(10, "Mensaje", sender, time);
        Message m3 = new Message(11, "Otro mensaje", sender, time);

        assertEquals(m1, m2);
        assertNotEquals(m1, m3);
        assertEquals(m1.hashCode(), m2.hashCode());
    }

    @Test
    void testToString() {
        Student sender = Student.builder().firstName("Marta").build();
        LocalDateTime timestamp = LocalDateTime.of(2024, 1, 1, 12, 0);

        Message message = new Message(99, "¡Feliz año!", sender, timestamp);

        String expectedStart = "Message(messageId=99, text=¡Feliz año!";
        assertTrue(message.toString().startsWith(expectedStart));
    }
}
