package co.edu.uniquindio.theknowledgebay.api.dto;

import co.edu.uniquindio.theknowledgebay.core.model.Interest;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import lombok.Getter;

import java.util.List;

@Getter
public class ImportDTO {
    private List<Student> students;
    private List<Interest> interests;

}