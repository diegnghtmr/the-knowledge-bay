package co.edu.uniquindio.theknowledgebay;

import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.test.json.JsonCompareMode;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@PostgresTestSchema.Isolated
@SpringBootTest(properties = {
        "spring.config.location=optional:classpath:/unit-a-isolated.properties",
        "app.sessions.ttl=PT1H",
        "app.cors.allowed-origins=https://kb-client.example.test"
})
@AutoConfigureMockMvc(print = MockMvcPrint.NONE)
@DirtiesContext
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ExtendWith(OutputCaptureExtension.class)
class SecurityContractTest {
    private static final String FIRST_EMAIL = "student-one@example.test";
    private static final String SECOND_EMAIL = "student-two@example.test";
    private static final String MODERATOR_EMAIL = "moderator@example.test";
    private static final String FIRST_PASSWORD = UUID.randomUUID().toString();
    private static final String SECOND_PASSWORD = UUID.randomUUID().toString();
    private static final String MODERATOR_PASSWORD = UUID.randomUUID().toString();
    private static final String CLIENT_ORIGIN = "https://kb-client.example.test";

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JdbcTemplate jdbc;
    @Autowired TheKnowledgeBay domain;
    @Autowired TestClock clock;

    @DynamicPropertySource
    static void moderatorProperties(DynamicPropertyRegistry properties) {
        properties.add("moderator.name", () -> "contract-moderator");
        properties.add("moderator.email", () -> MODERATOR_EMAIL);
        properties.add("moderator.password", () -> MODERATOR_PASSWORD);
    }

    @BeforeAll
    void seedDatabase() {
        var encoder = new BCryptPasswordEncoder();
        addFixture("101", "student-one", FIRST_EMAIL, encoder.encode(FIRST_PASSWORD));
        addFixture("102", "student-two", SECOND_EMAIL, encoder.encode(SECOND_PASSWORD));
    }

    private void addFixture(String id, String name, String email, String passwordHash) {
        domain.addStudent(Student.builder().id(id).username(name).email(email).password(passwordHash)
                .firstName("Test").lastName("Student").build());
    }

    @Test
    void loginAndSessionIdentifyTheSameStudentAndModerator() throws Exception {
        assertSession(FIRST_EMAIL, FIRST_PASSWORD, "101", "STUDENT");
        assertSession(MODERATOR_EMAIL, MODERATOR_PASSWORD, MODERATOR_EMAIL, "MODERATOR");
    }

    @Test
    void newStudentCanLogInWithThePersistedId() throws Exception {
        String email = "new-student@example.test";
        String password = UUID.randomUUID().toString();
        mvc.perform(post("/api/auth/register").contentType("application/json").content(json.writeValueAsBytes(Map.of(
                        "email", email, "username", "new-student", "password", password,
                        "firstName", "New", "lastName", "Student"))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));
        JsonNode login = login(email, password);
        String id = login.path("userId").asText();
        assertFalse(id.isBlank(), "Registration must make a real ID available to login");
        assertNotEquals(email, id);
        assertEquals(id, jdbc.queryForObject("SELECT id FROM students WHERE email = ?", String.class, email));
        authenticated(get("/api/auth/session"), login.path("token").asText()).andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(id));
    }

    @Test
    void routesEnforceAuthenticationAndModeratorPolicy() throws Exception {
        String student = login(FIRST_EMAIL, FIRST_PASSWORD).path("token").asText();
        String moderator = login(MODERATOR_EMAIL, MODERATOR_PASSWORD).path("token").asText();
        assertAll(
                () -> expectEmpty(get("/api/profile"), null, 401),
                () -> expectEmpty(get("/api/content"), UUID.randomUUID().toString(), 401),
                () -> expectEmpty(get("/api/chat/contacts"), null, 401),
                () -> expectEmpty(get("/api/studygroups"), null, 401),
                () -> expectEmpty(get("/api/admin/users"), null, 401),
                () -> expectEmpty(get("/api/admin/users"), student, 403),
                () -> expectEmpty(delete("/api/admin/content/500"), student, 403),
                () -> expectEmpty(delete("/api/admin/help-requests/500"), student, 403),
                () -> expectEmpty(get("/api/affinity-graph/data"), student, 403),
                () -> expectEmpty(post("/api/affinity-graph/refresh"), student, 403),
                () -> expectEmpty(get("/api/analytics/dashboard"), student, 403),
                () -> expectEmpty(post("/api/interests").contentType("application/json").content("{\"name\":\"Denied\"}"), student, 403),
                () -> expectEmpty(post("/api/help-requests").contentType("application/json").content("{\"urgency\":\"LOW\"}"), moderator, 403),
                () -> expectEmpty(get("/api/not-an-allowlisted-route"), moderator, 403),
                () -> mvc.perform(get("/api/interests")).andExpect(status().isOk()).andExpect(content().json("[]")),
                () -> authenticated(get("/api/admin/users"), moderator).andExpect(status().isOk())
                        .andExpect(jsonPath("$[?(@.id == '101')].email").value(org.hamcrest.Matchers.hasItem(FIRST_EMAIL))),
                () -> authenticated(get("/api/affinity-graph/data"), moderator).andExpect(status().isOk()),
                () -> authenticated(get("/api/analytics/dashboard"), moderator).andExpect(status().isOk()),
                () -> authenticated(get("/api/content"), student).andExpect(status().isOk()).andExpect(content().json("[]")),
                () -> authenticated(get("/api/chat/contacts"), student).andExpect(status().isOk()).andExpect(content().json("[]")),
                () -> authenticated(get("/api/studygroups"), student).andExpect(status().isOk()).andExpect(content().json("[]")));
    }

    @Test
    void fixtureAndImportEndpointsAreOffByDefault() throws Exception {
        String moderator = login(MODERATOR_EMAIL, MODERATOR_PASSWORD).path("token").asText();
        assertAll(
                () -> expectEmpty(post("/api/import").contentType("application/json").content("{}"), moderator, 403),
                () -> expectEmpty(post("/api/test-data/load"), moderator, 403),
                () -> expectEmpty(get("/api/test-data/chats-status"), moderator, 403));
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM interests", Integer.class));
    }

    @Test
    void deniedProfileAndHelpWritesLeaveTheOtherStudentUnchanged() throws Exception {
        String first = login(FIRST_EMAIL, FIRST_PASSWORD).path("token").asText();
        String second = login(SECOND_EMAIL, SECOND_PASSWORD).path("token").asText();
        expectEmpty(put("/api/profile").contentType("application/json").content("{\"firstName\":\"Denied\"}"), null, 401);
        authenticated(get("/api/profile"), first).andExpect(status().isOk()).andExpect(jsonPath("$.firstName").value("Test"));
        authenticated(post("/api/help-requests").contentType("application/json")
                .content("{\"urgency\":\"MEDIUM\",\"information\":\"A contract question\",\"studentId\":\"102\"}"), first)
                .andExpect(status().isOk());
        JsonNode authored = json.readTree(authenticated(get("/api/help-requests/my-requests"), first)
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsByteArray());
        assertEquals(1, authored.size());
        assertEquals("101", authored.get(0).path("studentId").asText());
        authenticated(get("/api/help-requests/my-requests"), second).andExpect(status().isOk()).andExpect(content().json("[]"));
        int id = authored.get(0).path("requestId").asInt();
        authenticated(put("/api/help-requests/{id}/complete", id), second).andExpect(status().isForbidden())
                .andExpect(content().json("{\"success\":false,\"message\":\"No puedes completar esta solicitud de ayuda.\"}", JsonCompareMode.STRICT));
        authenticated(get("/api/help-requests/{id}", id), first).andExpect(status().isOk()).andExpect(jsonPath("$.completed").value(false));
        authenticated(put("/api/help-requests/{id}/complete", id), first).andExpect(status().isOk());
        authenticated(get("/api/help-requests/{id}", id), first).andExpect(status().isOk()).andExpect(jsonPath("$.completed").value(true));
    }

    @Test
    void profileLookupDoesNotCreateAStudent() throws Exception {
        String token = login(FIRST_EMAIL, FIRST_PASSWORD).path("token").asText();
        JsonNode before = json.readTree(authenticated(get("/api/users"), token).andReturn().getResponse().getContentAsByteArray());
        authenticated(get("/api/profile/{userId}", "missing@example.test"), token)
                .andExpect(status().isNotFound()).andExpect(content().string(""));
        JsonNode after = json.readTree(authenticated(get("/api/users"), token).andReturn().getResponse().getContentAsByteArray());
        assertEquals(before, after);
    }

    @Test
    void passwordChangesPersistBcryptAndRevokeSessionsWithoutLoggingSecrets(CapturedOutput output) throws Exception {
        String token = login(SECOND_EMAIL, SECOND_PASSWORD).path("token").asText();
        String anotherSession = login(SECOND_EMAIL, SECOND_PASSWORD).path("token").asText();
        String newPassword = UUID.randomUUID().toString();
        try {
            authenticated(put("/api/profile").contentType("application/json")
                    .content(json.writeValueAsBytes(Map.of("password", newPassword))), token)
                    .andExpect(status().isOk()).andExpect(jsonPath("$.password").doesNotExist());
            String hash = jdbc.queryForObject("SELECT password FROM students WHERE id = ?", String.class, 102);
            assertTrue(new BCryptPasswordEncoder().matches(newPassword, hash), "Only the new BCrypt hash may be stored");
            mvc.perform(loginRequest(SECOND_EMAIL, SECOND_PASSWORD)).andExpect(status().isUnauthorized());
            assertEquals("102", login(SECOND_EMAIL, newPassword).path("userId").asText());
            expectEmpty(get("/api/auth/session"), token, 401);
            expectEmpty(get("/api/auth/session"), anotherSession, 401);
        } finally {
            // Keep the fixture reusable independent of test order without writing passwords to logs.
            if (mvc.perform(loginRequest(SECOND_EMAIL, newPassword)).andReturn().getResponse().getStatus() == 200) {
                String replacement = login(SECOND_EMAIL, newPassword).path("token").asText();
                authenticated(put("/api/profile").contentType("application/json")
                        .content(json.writeValueAsBytes(Map.of("password", SECOND_PASSWORD))), replacement);
            }
        }
        assertFalse(output.getAll().contains(token) || output.getAll().contains(anotherSession)
                || output.getAll().contains(newPassword) || output.getAll().contains(SECOND_PASSWORD), "Authentication secrets appeared in captured output");
    }

    @Test
    void corsAllowsTheConfiguredOriginWithoutCredentials() throws Exception {
        assertAll(
                () -> mvc.perform(preflight(CLIENT_ORIGIN)).andExpect(status().isOk())
                        .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, CLIENT_ORIGIN))
                        .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS))
                        .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS)),
                () -> mvc.perform(preflight("https://other.example.test")).andExpect(status().isForbidden())
                        .andExpect(content().string("Invalid CORS request"))
                        .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN))
                        .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS)));
    }

    @Test
    void loginProfileAndLogoutDoNotLogCredentials(CapturedOutput output) throws Exception {
        String token = login(FIRST_EMAIL, FIRST_PASSWORD).path("token").asText();
        authenticated(get("/api/profile"), token).andExpect(status().isOk());
        authenticated(post("/api/auth/logout"), token).andExpect(status().isOk());
        assertFalse(output.getAll().contains(token) || output.getAll().contains(FIRST_PASSWORD),
                "Authentication secrets appeared in captured output");
    }

    @Test
    void sessionExpiresAtTheBoundaryAndLogoutRevokesOnlyThatToken(CapturedOutput output) throws Exception {
        String expired = login(FIRST_EMAIL, FIRST_PASSWORD).path("token").asText();
        authenticated(get("/api/auth/session"), expired).andExpect(status().isOk());
        clock.advance(Duration.ofHours(1));
        expectEmpty(get("/api/auth/session"), expired, 401);
        expectEmpty(get("/api/admin/users"), expired, 401);
        expectEmpty(get("/api/auth/session"), null, 401);
        expectEmpty(get("/api/auth/session"), UUID.randomUUID().toString(), 401);
        mvc.perform(get("/api/auth/session").header(HttpHeaders.AUTHORIZATION, "Basic unrelated"))
                .andExpect(status().isUnauthorized()).andExpect(content().string(""));
        String first = login(FIRST_EMAIL, FIRST_PASSWORD).path("token").asText();
        String second = login(FIRST_EMAIL, FIRST_PASSWORD).path("token").asText();
        authenticated(post("/api/auth/logout"), first).andExpect(status().isOk())
                .andExpect(content().json("{\"success\":true,\"message\":\"Logged out successfully.\"}", JsonCompareMode.STRICT));
        expectEmpty(get("/api/auth/session"), first, 401);
        expectEmpty(post("/api/auth/logout"), first, 401);
        authenticated(get("/api/auth/session"), second).andExpect(status().isOk());
        assertFalse(output.getAll().contains(first) || output.getAll().contains(second), "Session tokens appeared in captured output");
    }

    private MockHttpServletRequestBuilder preflight(String origin) {
        return options("/api/profile").header(HttpHeaders.ORIGIN, origin)
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, HttpMethod.PUT.name())
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "authorization,content-type");
    }

    private void assertSession(String email, String password, String id, String role) throws Exception {
        JsonNode data = login(email, password);
        assertEquals(id, data.path("userId").asText());
        assertEquals(role, data.path("role").asText());
        assertFalse(data.path("token").asText().isBlank());
        authenticated(get("/api/auth/session"), data.path("token").asText()).andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andExpect(content().json(json.writeValueAsString(Map.of("userId", id, "role", role)), JsonCompareMode.STRICT));
    }

    private MockHttpServletRequestBuilder loginRequest(String email, String password) throws Exception {
        return post("/api/auth/login").contentType("application/json")
                .content(json.writeValueAsBytes(Map.of("email", email, "password", password)));
    }

    private JsonNode login(String email, String password) throws Exception {
        return json.readTree(mvc.perform(loginRequest(email, password)).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsByteArray());
    }

    private void expectEmpty(MockHttpServletRequestBuilder request, String token, int code) throws Exception {
        ResultActions response = authenticated(request, token).andExpect(status().is(code)).andExpect(content().string(""));
        if (code == 401) {
            response.andExpect(header().string(HttpHeaders.WWW_AUTHENTICATE, "Bearer"));
        }
    }

    private ResultActions authenticated(MockHttpServletRequestBuilder request, String token) throws Exception {
        return mvc.perform(token == null ? request : request.header(HttpHeaders.AUTHORIZATION, "Bearer " + token));
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class ClockConfiguration {
        @Bean
        @Primary
        TestClock contractClock() {
            return new TestClock();
        }
    }

    static final class TestClock extends Clock {
        private Instant now = Instant.parse("2026-01-01T00:00:00Z");

        void advance(Duration duration) { now = now.plus(duration); }
        @Override public ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(ZoneId zone) { return Clock.fixed(now, zone); }
        @Override public Instant instant() { return now; }
    }
}
