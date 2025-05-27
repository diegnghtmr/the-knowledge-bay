package co.edu.uniquindio.theknowledgebay.api.dto;

import co.edu.uniquindio.theknowledgebay.core.model.Interest;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import lombok.Getter;

import java.util.List;

@Getter
public class ImportDTO {
    private List<Student> students;
    private List<Interest> interests;

}