package co.edu.uniquindio.theknowledgebay;

import co.edu.uniquindio.theknowledgebay.api.controller.ContentController;
import co.edu.uniquindio.theknowledgebay.core.model.Interest;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.infrastructure.security.AuthenticatedUser;
import co.edu.uniquindio.theknowledgebay.infrastructure.security.AuthenticatedUser.Role;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static org.junit.jupiter.params.provider.Arguments.arguments;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

class ContentGroupContractTest {
    private static final String TEST_AUTHORIZATION = "Bearer fixture-session";
    private static final AuthenticatedUser STUDENT = new AuthenticatedUser("101", Role.STUDENT);
    private static final AuthenticatedUser MODERATOR = new AuthenticatedUser("moderator@example.invalid", Role.MODERATOR);
    private static final ObjectMapper JSON = new ObjectMapper();

    @TempDir Path scratch;
    private AnnotationConfigApplicationContext application;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        application = PersistenceContractTest.open(scratch.resolve("content.db"));
        var domain = application.getBean(TheKnowledgeBay.class);
        var topic = new Interest("11", "Álgebra");
        domain.addInterest(topic);
        PersistenceContractTest.createStudent(application, STUDENT.id(), "alfa", PersistenceContractTest.topics(topic));
        mvc = standaloneSetup(new ContentController(domain, new co.edu.uniquindio.theknowledgebay.core.service.AttachmentStorage(
                scratch.resolve("uploads").toString(), new org.springframework.core.env.StandardEnvironment())))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .build();
    }

    @AfterEach
    void closeFixture() {
        SecurityContextHolder.clearContext();
        if (application != null) application.close();
    }

    @Test
    void studentPublishesUnicodeArticleUnderPrincipalIdentity() throws Exception {
        setActor(STUDENT);
        Map<String, Object> payload = validArticle();
        payload.put("title", "á".repeat(150));
        payload.put("authorId", MODERATOR.id());

        submit(payload, false)
                .andExpect(status().isOk())
                .andExpect(content().json(envelope(true, "Contenido publicado exitosamente.")));
        mvc.perform(get("/api/content"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("á".repeat(150)))
                .andExpect(jsonPath("$[0].information").value("Explicación con ñ y símbolos ¿?"))
                .andExpect(jsonPath("$[0].contentType").value("ARTICLE"))
                .andExpect(jsonPath("$[0].topics[0]").value("Álgebra"))
                .andExpect(jsonPath("$[0].authorId").value(STUDENT.id()))
                .andExpect(jsonPath("$[0].likeCount").value(0))
                .andExpect(jsonPath("$[0].commentCount").value(0));
    }

    @Test
    void existingLinkPublicationKeepsItsLink() throws Exception {
        setActor(STUDENT);
        Map<String, Object> payload = validArticle();
        payload.put("contentType", "link");
        payload.put("linkUrl", "https://example.org/algebra");
        submit(payload, true)
                .andExpect(status().isOk())
                .andExpect(content().json(envelope(true, "Contenido publicado exitosamente.")));
        mvc.perform(get("/api/content"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].linkUrl").value("https://example.org/algebra"));
    }

    @Test
    void moderatorCannotPublishEvenWithAValidArticle() throws Exception {
        setActor(MODERATOR);
        submit(validArticle(), true)
                .andExpect(status().isForbidden())
                .andExpect(content().json(envelope(false, "Solo los estudiantes pueden publicar contenido.")));
        assertEmptyFeed();
    }

    @Test
    void anonymousCannotPublish() throws Exception {
        submit(validArticle(), false)
                .andExpect(status().isUnauthorized())
                .andExpect(content().json(envelope(false, "Token de autorización requerido.")));
        assertEmptyFeed();
    }

    @ParameterizedTest(name = "rejects invalid {0}, case {index}")
    @MethodSource("invalidPublicationFields")
    void invalidPublicationDoesNotChangeTheFeed(String field, Object value, String type, String message) throws Exception {
        setActor(STUDENT);
        submit(validArticle(), true).andExpect(status().isOk());
        String previousFeed = mvc.perform(get("/api/content")).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Map<String, Object> payload = validArticle();
        payload.put("contentType", type);
        payload.put(field, value);
        submit(payload, true)
                .andExpect(status().isBadRequest())
                .andExpect(content().json(envelope(false, message)));
        mvc.perform(get("/api/content"))
                .andExpect(status().isOk())
                .andExpect(content().string(previousFeed));
    }

    private void setActor(AuthenticatedUser actor) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(actor, null, List.of()));
    }

    private static Map<String, Object> validArticle() {
        return new LinkedHashMap<>(Map.of(
                "title", "Lección de álgebra", "contentType", "article",
                "body", "Explicación con ñ y símbolos ¿?", "topics", List.of("Álgebra")));
    }

    private static Stream<Arguments> invalidPublicationFields() {
        return Stream.of(
                arguments("contentType", null, "ARTICLE", "Tipo de contenido inválido."),
                arguments("contentType", "unknown", "ARTICLE", "Tipo de contenido inválido."),
                arguments("title", null, "ARTICLE", "El título es obligatorio."),
                arguments("title", "  ", "ARTICLE", "El título es obligatorio."),
                arguments("title", "a".repeat(151), "ARTICLE", "El título no puede exceder los 150 caracteres."),
                arguments("body", null, "ARTICLE", "La descripción del contenido es obligatoria."),
                arguments("body", "  ", "ARTICLE", "La descripción del contenido es obligatoria."),
                arguments("body", "a".repeat(20_001), "ARTICLE", "La descripción no puede exceder los 20000 caracteres."),
                arguments("topics", List.of(), "ARTICLE", "Selecciona al menos un tema para tu publicación."),
                arguments("topics", List.of("No registrado"), "ARTICLE", "El tema seleccionado no existe."),
                arguments("linkUrl", "ftp://example.org", "LINK", "Por favor, introduce una URL válida (http/https)."),
                arguments("videoUrl", null, "VIDEO", "Por favor, introduce una URL válida (http/https)."),
                arguments("contentType", "RESOURCE", "RESOURCE", "Debes adjuntar un archivo."));
    }

    private ResultActions submit(Map<String, Object> payload, boolean authenticate) throws Exception {
        var request = multipart("/api/content").file(new MockMultipartFile(
                "content", "content.json", "application/json", JSON.writeValueAsBytes(payload)));
        if (authenticate) {
            request.header("Authorization", TEST_AUTHORIZATION);
        }
        return mvc.perform(request);
    }

    private void assertEmptyFeed() throws Exception {
        setActor(STUDENT);
        mvc.perform(get("/api/content")).andExpect(status().isOk()).andExpect(content().json("[]"));
    }

    private static String envelope(boolean success, String message) throws Exception {
        return JSON.writeValueAsString(Map.of("success", success, "message", message));
    }
}
