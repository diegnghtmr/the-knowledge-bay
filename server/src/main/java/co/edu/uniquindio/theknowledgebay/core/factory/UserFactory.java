package co.edu.uniquindio.theknowledgebay.core.factory;

import co.edu.uniquindio.theknowledgebay.core.model.Moderator;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.graphs.UndirectedGraph;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
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

    public void addStudent(Student s) {
        students.addLast(s);
    }
}
