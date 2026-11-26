package co.edu.uniquindio.theknowledgebay;

import co.edu.uniquindio.theknowledgebay.infrastructure.config.ModeratorProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("dev")
@AutoConfigureMockMvc(print = MockMvcPrint.NONE)
class DevFixturesContractTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired ModeratorProperties moderator;

    @Test
    void moderatorCanLoadDurableDevFixturesWithoutCollidingWithAnExistingStudent() throws Exception {
        mvc.perform(post("/api/auth/register").contentType("application/json").content(json.writeValueAsBytes(Map.of(
                        "username", "existing", "email", "existing@example.invalid", "password", java.util.UUID.randomUUID().toString()))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));
        var login = mvc.perform(post("/api/auth/login").contentType("application/json").content(json.writeValueAsBytes(Map.of(
                        "email", moderator.email(), "password", moderator.password()))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsByteArray();
        String bearer = "Bearer " + json.readTree(login).path("token").asText();
        mvc.perform(post("/api/test-data/load").header(HttpHeaders.AUTHORIZATION, bearer))
                .andExpect(status().isOk()).andExpect(content().string("Test data loaded successfully."));
        mvc.perform(get("/api/admin/users").header(HttpHeaders.AUTHORIZATION, bearer)).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(7));
        mvc.perform(get("/api/interests")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(5));
        mvc.perform(get("/api/test-data/chats-status").header(HttpHeaders.AUTHORIZATION, bearer))
                .andExpect(status().isOk()).andExpect(content().string(startsWith("Chats encontrados: 6\n")));
    }
}
