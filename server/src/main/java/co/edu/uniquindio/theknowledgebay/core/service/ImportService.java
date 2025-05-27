package co.edu.uniquindio.theknowledgebay.core.service;

import co.edu.uniquindio.theknowledgebay.api.dto.ImportDTO;
import co.edu.uniquindio.theknowledgebay.core.model.Interest;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.repository.InterestRepository;
import co.edu.uniquindio.theknowledgebay.core.repository.StudentRepository;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.converter.DoublyLinkedListToList;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

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

    public Map<String, Object> processImport(ImportDTO data) {
        Map<String, Object> result = new HashMap<>();

        if (data == null) {
            result.put("message", "Error: Los datos de importación no pueden ser nulos");
            return result;
        }

        int studentsImported = 0;
        int interestsImported = 0;

        // Procesar estudiantes
        if (data.getStudents() != null) {
            for (Student student : data.getStudents()) {
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

        // Procesar intereses (evitar duplicados por nombre)
        if (data.getInterests() != null) {
            // Obtener nombres ya existentes (normalizados en minúsculas)
            Set<String> existingNames = DoublyLinkedListToList.convert(interestRepository.findAll())
                    .stream()
                    .map(i -> i.getName().toLowerCase())
                    .collect(Collectors.toSet());

            for (Interest interest : data.getInterests()) {
                if (isValidInterest(interest)) {
                    String name = interest.getName().trim();
                    if (!existingNames.contains(name.toLowerCase())) {
                        try {
                            interestRepository.save(interest);
                            interestsImported++;
                            existingNames.add(name.toLowerCase()); // agregar para evitar repetir dentro del mismo lote
                        } catch (Exception e) {
                            System.err.println("Error al importar interés: " + e.getMessage());
                        }
                    } else {
                        System.out.println("Interés duplicado ignorado: " + name);
                    }
                }
            }
        }

        this.theKnowledgeBay.updateData();

        result.put("message", "Importación completada");
        result.put("studentsImported", studentsImported);
        result.put("studentsTotal", data.getStudents() != null ? data.getStudents().size() : 0);
        result.put("interestsImported", interestsImported);
        result.put("interestsTotal", data.getInterests() != null ? data.getInterests().size() : 0);

        return result;
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