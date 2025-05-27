package co.edu.uniquindio.theknowledgebay.core.service;

import co.edu.uniquindio.theknowledgebay.api.dto.ImportDTO;
import co.edu.uniquindio.theknowledgebay.core.model.Interest;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.repository.InterestRepository;
import co.edu.uniquindio.theknowledgebay.core.repository.StudentRepository;
import org.springframework.stereotype.Service;

@Service
public class ImportService {
    private final InterestRepository interestRepository;
    private final StudentRepository studentRepository;
    private final TheKnowledgeBay theKnowledgeBay;

    public ImportService(InterestRepository interestRepository, StudentRepository studentRepository, TheKnowledgeBay theKnowledgeBay) {
        this.interestRepository = interestRepository;
        this.studentRepository = studentRepository;
        this.theKnowledgeBay = theKnowledgeBay;
    }

    public String processImport(ImportDTO data) {
        if (data == null) {
            return "Error: Los datos de importación no pueden ser nulos";
        }

        int studentsImported = 0;
        int interestsImported = 0;


        // Procesar estudiantes
        if (data.getStudents() != null) {
            for (int i = 0; i < data.getStudents().size(); i++) {
                Student student = data.getStudents().get(i);
                if (isValidStudent(student)) {
                    try {
                        studentRepository.save(student);
                        studentsImported++;
                    } catch (Exception e) {
                        System.err.println("Error al importar estudiante: " + e.getMessage());
                    }
                }
            }
        }

        // Procesar intereses
        if (data.getInterests() != null) {
            for (int i = 0; i < data.getInterests().size(); i++) {
                Interest interest = data.getInterests().get(i);
                if (isValidInterest(interest)) {
                    try {
                        interestRepository.save(interest);
                        interestsImported++;
                    } catch (Exception e) {
                        System.err.println("Error al importar interés: " + e.getMessage());
                    }
                }
            }
        }

        this.theKnowledgeBay.updateData();

        return String.format(
                "Importación completada. Estudiantes: %d/%d, Intereses: %d/%d",
                studentsImported,
                data.getStudents() != null ? data.getStudents().size() : 0,
                interestsImported,
                data.getInterests() != null ? data.getInterests().size() : 0
        );
    }

    private boolean isValidStudent(Student student) {
        return student != null &&
                student.getUsername() != null &&
                !student.getEmail().trim().isEmpty() &&
                student.getId() != null;
    }

    private boolean isValidInterest(Interest interest) {
        return interest != null &&
                interest.getName() != null &&
                !interest.getName().trim().isEmpty() &&
                interest.getIdInterest() != null;
    }
}