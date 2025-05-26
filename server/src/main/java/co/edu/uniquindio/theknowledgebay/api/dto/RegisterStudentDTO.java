package co.edu.uniquindio.theknowledgebay.api.dto;

import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterStudentDTO {
    private String username;
    private String email;
    private String password;
    private String dateOfBirth;
    private String firstName;
    private String lastName;
    private String biography;
    private DoublyLinkedList<String> interests;
    // Add other fields from Student if needed for registration, e.g., username, lastName
    // For simplicity, starting with basic fields.
}