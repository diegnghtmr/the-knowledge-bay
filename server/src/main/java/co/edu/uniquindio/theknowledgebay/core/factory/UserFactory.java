package co.edu.uniquindio.theknowledgebay.core.factory;

import co.edu.uniquindio.theknowledgebay.core.model.Moderator;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.infrastructure.config.ModeratorProperties;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.graphs.UndirectedGraph;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.crypto.password.PasswordEncoder;


@Getter
@Setter
public class UserFactory {
    private Moderator moderator = new Moderator();
    private DoublyLinkedList<Student> students = new DoublyLinkedList<>();
    private UndirectedGraph<Student> studentGraph = new UndirectedGraph<>();
    private static UserFactory instance;

    public static UserFactory getInstance() {
        if (instance == null) {
            instance = new UserFactory();
            return instance;
        } return instance;
    }

    public void add(Student s) {
        students.addLast(s);
    }

    public void setModerator(ModeratorProperties props, String password) {
        moderator.setUsername(props.name());
        moderator.setEmail(props.email());
        moderator.setPassword(password);
    }

}
