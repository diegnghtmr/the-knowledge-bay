package co.edu.uniquindio.theknowledgebay;

import co.edu.uniquindio.theknowledgebay.api.config.CorsWebConfig;
import co.edu.uniquindio.theknowledgebay.api.controller.ImportController;
import co.edu.uniquindio.theknowledgebay.api.controller.TestDataController;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.service.ImportService;
import co.edu.uniquindio.theknowledgebay.core.service.SessionManager;
import co.edu.uniquindio.theknowledgebay.core.service.TestDataLoaderService;
import co.edu.uniquindio.theknowledgebay.infrastructure.config.SecurityConfig;
import co.edu.uniquindio.theknowledgebay.infrastructure.config.WebConfig;
import co.edu.uniquindio.theknowledgebay.infrastructure.security.AuthenticatedUser;
import co.edu.uniquindio.theknowledgebay.infrastructure.security.AuthenticatedUser.Role;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.core.io.ClassPathResource;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.json.JsonCompareMode;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = {ImportController.class, TestDataController.class},
        properties = "spring.config.location=optional:classpath:/unit-a-isolated.properties")
@Import({SecurityConfig.class, SessionManager.class, WebConfig.class, CorsWebConfig.class, SessionContractTest.SessionDatabase.class})
@ActiveProfiles("dev")
@AutoConfigureMockMvc(print = MockMvcPrint.NONE)
@ExtendWith(OutputCaptureExtension.class)
class SessionContractTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired SessionManager sessions;
    @MockitoBean ImportService importer;
    @MockitoBean TestDataLoaderService fixtures;
    @MockitoBean TheKnowledgeBay domain;

    @Test
    void devToolsRequireModeratorAndPreserveAuthorizedWorkflows() throws Exception {
        mvc.perform(post("/api/test-data/load")).andExpect(status().isUnauthorized()).andExpect(content().string(""));
        mvc.perform(as(Role.STUDENT, post("/api/test-data/load"))).andExpect(status().isForbidden()).andExpect(content().string(""));
        mvc.perform(as(Role.STUDENT, post("/api/import").contentType("application/json").content("{}")))
                .andExpect(status().isForbidden()).andExpect(content().string(""));
        verifyNoInteractions(fixtures, importer);

        mvc.perform(as(Role.MODERATOR, post("/api/test-data/load")))
                .andExpect(status().isOk()).andExpect(content().string("Test data loaded successfully."));
        verify(fixtures).loadComprehensiveTestData();
        when(importer.processImport(any())).thenReturn(Map.of("studentsImported", 1));
        String hash = new BCryptPasswordEncoder().encode(UUID.randomUUID().toString());
        mvc.perform(as(Role.MODERATOR, importStudent(hash)))
                .andExpect(status().isOk()).andExpect(content().json("{\"studentsImported\":1}", JsonCompareMode.STRICT));
        verify(importer).processImport(any());
    }

    @Test
    void devImportRejectsPlaintextWithoutCallingTheWriter() throws Exception {
        mvc.perform(as(Role.MODERATOR, importStudent(UUID.randomUUID().toString())))
                .andExpect(status().isBadRequest())
                .andExpect(content().json("{\"error\":\"Imported students must have supported BCrypt password hashes.\"}", JsonCompareMode.STRICT));
        verifyNoInteractions(importer);
    }

    @Test
    void fixtureFailureReturnsSafeDetailsAndLogsARequestId(CapturedOutput output) throws Exception {
        String privateDetail = UUID.randomUUID().toString();
        doThrow(new IllegalStateException(privateDetail)).when(fixtures).loadComprehensiveTestData();
        String requestId = mvc.perform(as(Role.MODERATOR, post("/api/test-data/load")))
                .andExpect(status().isInternalServerError()).andExpect(content().string("Failed to load test data."))
                .andExpect(header().exists("X-Request-Id")).andReturn().getResponse().getHeader("X-Request-Id");
        assertTrue(output.getAll().contains("operation=fixtures.load, requestId=" + requestId));
        assertFalse(output.getAll().contains(privateDetail), "An internal error detail appeared in captured output");
    }

    private MockHttpServletRequestBuilder importStudent(String password) throws Exception {
        return post("/api/import").contentType("application/json").content(json.writeValueAsBytes(Map.of("students", List.of(
                Map.of("id", "103", "username", "imported", "email", "imported@example.test", "password", password)))));
    }

    @TestConfiguration
    static class SessionDatabase {
        @Bean JdbcTemplate sessionJdbc() throws Exception {
            // The MVC slice excludes datasource auto-configuration.
            var file = java.nio.file.Files.createTempFile("kb-dev-session-", ".sqlite").toFile();
            file.deleteOnExit();
            var source = new DriverManagerDataSource("jdbc:sqlite:" + file);
            new ResourceDatabasePopulator(new ClassPathResource("schema.sql")).execute(source);
            return new JdbcTemplate(source);
        }
    }

    private MockHttpServletRequestBuilder as(Role role, MockHttpServletRequestBuilder request) {
        String token = sessions.createSession(new AuthenticatedUser("fixture-" + role.name(), role));
        return request.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
    }
}
