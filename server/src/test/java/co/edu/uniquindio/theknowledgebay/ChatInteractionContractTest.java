package co.edu.uniquindio.theknowledgebay;

import co.edu.uniquindio.theknowledgebay.api.controller.ChatController;
import co.edu.uniquindio.theknowledgebay.api.controller.ChatEvents;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.service.ChatService;
import co.edu.uniquindio.theknowledgebay.infrastructure.security.AuthenticatedUser;
import co.edu.uniquindio.theknowledgebay.infrastructure.security.AuthenticatedUser.Role;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.nio.file.Path;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(OutputCaptureExtension.class)
class ChatInteractionContractTest {
    private static final String CONTACTS = "/api/chat/contacts";
    private static final String SEND = "/api/chat/send";
    private static final AuthenticatedUser ANN = new AuthenticatedUser("101", Role.STUDENT);
    private static final AuthenticatedUser BEN = new AuthenticatedUser("102", Role.STUDENT);
    private static final AuthenticatedUser CY = new AuthenticatedUser("103", Role.STUDENT);
    private static final ObjectMapper JSON = new ObjectMapper();

    @TempDir Path scratch;
    private AnnotationConfigApplicationContext application;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        open();
        PersistenceContractTest.createStudent(application, ANN.id(), "ann", null);
        var passwordHash = application.getBean(PasswordEncoder.class).encode(UUID.randomUUID().toString());
        var ben = PersistenceContractTest.student("ben", passwordHash);
        ben.setId(BEN.id());
        ben.setFirstName("Benoît");
        ben.setLastName("Cano");
        application.getBean(TheKnowledgeBay.class).addStudent(ben);
        PersistenceContractTest.createStudent(application, CY.id(), "cy", null);
    }

    private void open() {
        application = PersistenceContractTest.open(scratch.resolve("chat.db"));
        application.registerBean(ObjectMapper.class, () -> JSON);
        application.register(ChatService.class, ChatController.class, ChatEvents.class);
        // Resolve the same principal as the production controller without depending on unit A's filter.
        mvc = MockMvcBuilders.standaloneSetup(application.getBean(ChatController.class))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver()).build();
    }

    @AfterEach
    void close() {
        application.close();
    }

    @Test
    void discoversStudentsByNameOrEmailBeforeTheFirstSend() throws Exception {
        perform(ANN, get(CONTACTS)).andExpectAll(status().isOk(), content().json("[]", true));
        for (String query : List.of(" BENOÎT CAN ", "ben@EXAMPLE.invalid", "BEN")) {
            perform(ANN, get(CONTACTS + "/search").param("query", query)).andExpectAll(
                    status().isOk(), jsonPath("$.length()").value(1), jsonPath("$[0].contactId").value(BEN.id()),
                    jsonPath("$[0].username").value("ben"), jsonPath("$[0].email").doesNotHaveJsonPath());
        }
        for (String query : List.of("ann@", "moderator", "   ", "does-not-exist")) {
            perform(ANN, get(CONTACTS + "/search").param("query", query))
                    .andExpectAll(status().isOk(), content().json("[]", true));
        }
        perform(ANN, get(thread(BEN))).andExpectAll(status().isOk(), content().json("[]", true));
        perform(ANN, get(CONTACTS)).andExpectAll(status().isOk(), content().json("[]", true));
        send(ANN, BEN.id(), "first message").andExpectAll(status().isOk(), jsonPath("$.senderId").value(ANN.id()));
        perform(BEN, get(CONTACTS)).andExpectAll(status().isOk(), jsonPath("$.length()").value(1),
                jsonPath("$[0].contactId").value(ANN.id()), jsonPath("$[0].lastMessageText").value("first message"));
    }

    @Test
    void usesOnlyThePrincipalForSendsAndOwnerScopedThreadReads(CapturedOutput output) throws Exception {
        var moderator = new AuthenticatedUser("moderator@example.invalid", Role.MODERATOR);
        for (MockHttpServletRequestBuilder request : List.of(get(CONTACTS), get(CONTACTS + "/search").param("query", "ben"),
                get(thread(BEN)), sendRequest(BEN.id(), "unauthorized"))) {
            perform(null, request).andExpectAll(status().isUnauthorized(), content().string(""));
            perform(moderator, request).andExpectAll(status().isForbidden(), content().string(""));
        }
        perform(ANN, post(SEND).contentType(MediaType.APPLICATION_JSON).content("""
                {"receiverId":"102","senderId":"103","text":"private test message"}
                """)).andExpectAll(status().isOk(), jsonPath("$.senderId").value(ANN.id()));
        perform(BEN, get(thread(ANN))).andExpectAll(status().isOk(), jsonPath("$.length()").value(1),
                jsonPath("$[0].text").value("private test message"));
        perform(CY, get(CONTACTS)).andExpectAll(status().isOk(), content().json("[]", true));
        perform(CY, get(thread(BEN)).param("actorId", ANN.id())).andExpectAll(status().isOk(), content().json("[]", true));
        perform(ANN, get(thread(BEN))).andExpectAll(status().isOk(), jsonPath("$.length()").value(1));
        assertFalse(output.getAll().contains("private test message"), "chat bodies must not appear in application logs");
    }

    @Test
    void rejectsInvalidSendsWithoutCreatingAConversation() throws Exception {
        for (var peer : List.of(ANN.id(), "999", "0102", "moderator@example.invalid", "")) {
            send(ANN, peer, "valid text").andExpectAll(status().isBadRequest(), content().string("Error sending message"));
        }
        send(ANN, BEN.id(), "   ").andExpectAll(status().isBadRequest(), content().string("Error sending message"));
        perform(ANN, post(SEND).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpectAll(status().isBadRequest(), content().string("Error sending message"));
        perform(ANN, get(CONTACTS)).andExpectAll(status().isOk(), content().json("[]", true));
        perform(BEN, get(CONTACTS)).andExpectAll(status().isOk(), content().json("[]", true));
        perform(ANN, get(thread(BEN))).andExpectAll(status().isOk(), content().json("[]", true));
    }

    @Test
    void storesSimultaneousIdenticalMessagesWithDifferentIdsAndReloadsThem() throws Exception {
        var ready = new CountDownLatch(2);
        var start = new CountDownLatch(1);
        int first;
        int second;
        try (var pool = Executors.newFixedThreadPool(2)) {
            var one = pool.submit(() -> sendAfterBarrier(ANN, BEN, ready, start));
            var two = pool.submit(() -> sendAfterBarrier(BEN, ANN, ready, start));
            assertTrue(ready.await(5, TimeUnit.SECONDS));
            start.countDown();
            first = one.get(10, TimeUnit.SECONDS);
            second = two.get(10, TimeUnit.SECONDS);
        }
        assertNotEquals(first, second);
        application.close();
        open();
        var response = perform(ANN, get(thread(BEN))).andExpectAll(status().isOk(), jsonPath("$.length()").value(2),
                jsonPath("$[0].text").value("same text"), jsonPath("$[1].text").value("same text")).andReturn().getResponse();
        var messages = JSON.readTree(response.getContentAsString());
        assertEquals(Math.min(first, second), messages.get(0).get("id").asInt());
        assertEquals(Math.max(first, second), messages.get(1).get("id").asInt());
        perform(BEN, get(thread(ANN))).andExpectAll(status().isOk(), content().json(response.getContentAsString(), true));
        perform(ANN, get(CONTACTS)).andExpectAll(status().isOk(), jsonPath("$.length()").value(1));
    }

    private int sendAfterBarrier(AuthenticatedUser actor, AuthenticatedUser peer, CountDownLatch ready, CountDownLatch start)
            throws Exception {
        ready.countDown();
        assertTrue(start.await(5, TimeUnit.SECONDS));
        var response = send(actor, peer.id(), "same text").andExpectAll(status().isOk(), jsonPath("$.senderId").value(actor.id()))
                .andReturn().getResponse();
        return JSON.readTree(response.getContentAsString()).get("id").asInt();
    }

    private static String thread(AuthenticatedUser peer) {
        return "/api/chat/" + peer.id() + "/messages";
    }

    private static MockHttpServletRequestBuilder sendRequest(String peer, String text) {
        var body = JSON.createObjectNode().put("receiverId", peer).put("text", text);
        return post(SEND).contentType(MediaType.APPLICATION_JSON).content(body.toString());
    }

    private ResultActions send(AuthenticatedUser actor, String peer, String text) throws Exception {
        return perform(actor, sendRequest(peer, text));
    }

    private ResultActions perform(AuthenticatedUser actor, MockHttpServletRequestBuilder request) throws Exception {
        var context = SecurityContextHolder.createEmptyContext();
        if (actor != null) context.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(actor, null, List.of()));
        SecurityContextHolder.setContext(context);
        try {
            return mvc.perform(request);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}
