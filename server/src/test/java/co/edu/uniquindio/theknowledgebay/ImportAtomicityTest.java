package co.edu.uniquindio.theknowledgebay;

import co.edu.uniquindio.theknowledgebay.api.dto.ImportDTO;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.service.ImportService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static co.edu.uniquindio.theknowledgebay.PersistenceContractTest.*;
import static org.junit.jupiter.api.Assertions.*;

class ImportAtomicityTest {
    @RegisterExtension final PostgresTestSchema database = new PostgresTestSchema();

    @Test
    void conflictAfterValidRowsRollsBackWholeImportWithoutChangingExistingIdentity() throws Exception {
        try (var application = open(database)) {
            var domain = application.getBean(TheKnowledgeBay.class);
            var existing = createStudent(application, "401", "existing", null);
            var hash = application.getBean(PasswordEncoder.class).encode(UUID.randomUUID().toString());
            var payload = json("""
                    {"interests":[{"idInterest":"41","name":"Concurrency"}],"students":[
                      {"id":"402","email":"new@example.invalid","username":"new","password":"%s","firstName":"New","lastName":"Student"},
                      {"id":"403","email":"existing@example.invalid","username":"conflict","password":"%s","firstName":"Test","lastName":"Student"}
                    ]}
                    """.formatted(hash, hash));
            assertThrows(RuntimeException.class, () -> application.getBean(ImportService.class).processImport(payload));
            assertEquals(1, domain.getTotalUsersCount());
            assertEquals(existing.getEmail(), domain.getUserById(existing.getId()).getEmail());
            assertNull(domain.getUserById("402"));
            assertEquals(0, domain.getAllInterests().getSize());
        }
        try (var application = open(database)) {
            var domain = application.getBean(TheKnowledgeBay.class);
            assertEquals(1, domain.getTotalUsersCount());
            assertNull(domain.getUserById("402"));
            assertEquals(0, domain.getAllInterests().getSize());
        }
    }

    @Test
    void identicalImportIsIdempotentAndDoesNotReplaceExistingStudents() throws Exception {
        try (var application = open(database)) {
            var domain = application.getBean(TheKnowledgeBay.class);
            createStudent(application, "501", "already-present", null);
            var hash = application.getBean(PasswordEncoder.class).encode(UUID.randomUUID().toString());
            var payload = json("""
                    {"interests":[{"idInterest":"51","name":"Geometry"}],"students":[
                      {"id":"502","email":"imported@example.invalid","username":"imported","password":"%s","firstName":"Test","lastName":"Student"}
                    ]}
                    """.formatted(hash));
            var importer = application.getBean(ImportService.class);
            assertEquals(1, importer.processImport(payload).get("studentsImported"));
            var repeated = importer.processImport(payload);
            assertEquals(0, repeated.get("studentsImported"));
            assertEquals(0, repeated.get("interestsImported"));
            assertEquals(2, domain.getTotalUsersCount());
            assertEquals(1, domain.getAllInterests().getSize());
            assertEquals("already-present", domain.getUserById("501").getUsername());
            assertEquals("imported", domain.getUserById("502").getUsername());
        }
    }

    private static ImportDTO json(String data) throws Exception {
        return new ObjectMapper().readValue(data, ImportDTO.class);
    }
}
