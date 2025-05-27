package co.edu.uniquindio.theknowledgebay;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import co.edu.uniquindio.theknowledgebay.core.model.Chat;
import co.edu.uniquindio.theknowledgebay.core.model.Message;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;


@SpringBootTest
public class ChatTest {

    private Chat chat;
    private Student studentA;
    private Student studentB;

    @BeforeEach
    public void setUp() {
        studentA = Student.builder().firstName("juan").build();
        studentB = Student.builder().firstName("Ana").build();
        chat = Chat.builder()
                .chatId(1)
                .studentA(studentA)
                .studentB(studentB)
                .messages(new DoublyLinkedList<>())
                .build();
    }

    @Test
    public void testSendMessage_AddsMessageToList() {
        Message message = Message.builder().text("¿Hola, como estas?").build();
        chat.sendMessage(message);

    }

    @Test
    public void testSendMessage_NullMessagesList_DoesNotThrow() {
        Chat chatSinLista = Chat.builder()
                .chatId(2)
                .studentA(studentA)
                .studentB(studentB)
                .messages(null)
                .build();

        Message message = Message.builder().text("Esto no debería lanzar error").build();

        assertDoesNotThrow(() -> chatSinLista.sendMessage(message));
    }
}
