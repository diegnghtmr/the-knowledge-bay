package co.edu.uniquindio.theknowledgebay.core.service;

import co.edu.uniquindio.theknowledgebay.api.dto.ImportDTO;
import co.edu.uniquindio.theknowledgebay.core.model.Interest;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.repository.DomainRepository;
import co.edu.uniquindio.theknowledgebay.core.repository.InterestRepository;
import co.edu.uniquindio.theknowledgebay.core.repository.StudentRepository;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.converter.ListToDoublyLinkedList;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class ImportService {
    private final DomainRepository transactions;
    private final TheKnowledgeBay domain;

    public ImportService(DomainRepository transactions, TheKnowledgeBay domain) {
        this.transactions = transactions;
        this.domain = domain;
    }

    public Map<String, Object> processImport(ImportDTO data) {
        if (data == null) return Map.of("message", "Error: Los datos de importación no pueden ser nulos");
        List<Interest> interests = data.getInterests() == null ? List.of() : data.getInterests();
        List<Student> students = data.getStudents() == null ? List.of() : data.getStudents();
        return transactions.write(() -> {
            int interestCount = 0;
            for (Interest row : interests) if (importInterest(row)) interestCount++;
            int studentCount = 0;
            for (Student row : students) if (importStudent(row)) studentCount++;
            return Map.of("message", "Importación completada", "studentsImported", studentCount,
                    "studentsTotal", students.size(), "interestsImported", interestCount, "interestsTotal", interests.size());
        });
    }

    private boolean importInterest(Interest row) {
        if (row == null || !StudentRepository.isCanonicalId(row.getIdInterest()) || blank(row.getName())) {
            throw new IllegalArgumentException("Invalid interest in import");
        }
        String name = row.getName().strip();
        Interest existing = domain.getInterestById(row.getIdInterest());
        if (existing != null && InterestRepository.normalizeName(existing.getName()).equals(InterestRepository.normalizeName(name))) {
            return false;
        }
        if (!domain.addInterest(new Interest(row.getIdInterest(), name))) {
            throw new IllegalArgumentException("Conflicting interest in import");
        }
        return true;
    }

    private boolean importStudent(Student row) {
        if (row == null || !StudentRepository.isCanonicalId(row.getId()) || blank(row.getUsername()) || blank(row.getEmail())) {
            throw new IllegalArgumentException("Invalid student in import");
        }
        StudentRepository.requirePasswordHash(row.getPassword());
        var resolved = new LinkedHashMap<String, Interest>();
        if (row.getInterests() != null) {
            for (Interest topic : row.getInterests()) {
                Interest existing = topic == null ? null : domain.getInterestById(topic.getIdInterest());
                if (existing == null) throw new IllegalArgumentException("Unknown student interest in import");
                resolved.putIfAbsent(existing.getIdInterest(), existing);
            }
        }
        if (domain.getUserById(row.getId()) instanceof Student existing) {
            if (sameStudent(existing, row, List.copyOf(resolved.values()))) return false;
            throw new IllegalArgumentException("Conflicting student in import");
        }
        domain.addStudent(Student.builder().id(row.getId()).username(row.getUsername()).email(row.getEmail())
                .password(row.getPassword()).firstName(row.getFirstName()).lastName(row.getLastName())
                .dateBirth(row.getDateBirth()).biography(row.getBiography())
                .interests(ListToDoublyLinkedList.convert(List.copyOf(resolved.values()))).build());
        return true;
    }

    private static boolean sameStudent(Student existing, Student incoming, List<Interest> topics) {
        return existing.getUsername().equals(incoming.getUsername()) && existing.getEmail().equals(incoming.getEmail())
                && existing.getPassword().equals(incoming.getPassword())
                && existing.getFirstName().equals(Objects.requireNonNullElse(incoming.getFirstName(), ""))
                && existing.getLastName().equals(Objects.requireNonNullElse(incoming.getLastName(), ""))
                && Objects.equals(existing.getDateBirth(), incoming.getDateBirth())
                && Objects.equals(existing.getBiography(), incoming.getBiography())
                && existing.getInterests().getSize() == topics.size() && topics.stream().allMatch(existing.getInterests()::contains);
    }

    private static boolean blank(String value) {
        return value == null || value.isBlank();
    }
}
