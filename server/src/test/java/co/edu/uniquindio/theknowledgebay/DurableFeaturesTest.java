package co.edu.uniquindio.theknowledgebay;

import co.edu.uniquindio.theknowledgebay.core.model.Content;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.model.enums.ContentType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext;
import org.springframework.http.ContentDisposition;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.Socket;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.LocalDate;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

class DurableFeaturesTest {
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final String MOD_EMAIL = "moderator@example.invalid";
    private static final String PASSWORD = UUID.randomUUID().toString();
    private static final String STUDENT = "ada@example.invalid";
    private static final byte[] PNG = Base64.getDecoder().decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jC3sAAAAASUVORK5CYII=");

    @TempDir Path scratch;
    private final HttpClient http = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(5)).build();
    private String origin;

    @Test
    void theSameSessionSurvivesRestartButLogoutAndPasswordChangeRevokeIt() throws Exception {
        Actor student;
        Actor moderator;
        try (var app = launch("PT8H", PASSWORD)) {
            student = register("ada", STUDENT);
            moderator = login(MOD_EMAIL, PASSWORD);
        }
        // Inspect the closed SQLite file at the persistence boundary without depending on a table name.
        var atRest = new String(Files.readAllBytes(scratch.resolve("durable.db")), StandardCharsets.ISO_8859_1);
        assertFalse(atRest.contains(student.token()), "raw student token at rest");
        assertFalse(atRest.contains(moderator.token()), "raw moderator token at rest");
        var rotated = UUID.randomUUID().toString();
        try (var app = launch("PT8H", PASSWORD)) {
            assertSession(student);
            assertSession(moderator);
            var sibling = login(STUDENT, PASSWORD);
            json("POST", "/api/auth/logout", student.token(), null, 200);
            expectEmpty("/api/auth/session", student.token(), 401);
            assertSession(sibling);
            var other = login(STUDENT, PASSWORD);
            json("PUT", "/api/profile", sibling.token(), Map.of("password", rotated), 200);
            expectEmpty("/api/auth/session", sibling.token(), 401);
            expectEmpty("/api/auth/session", other.token(), 401);
            json("POST", "/api/auth/login", null, Map.of("email", STUDENT, "password", PASSWORD), 401);
            assertSession(login(STUDENT, rotated));
        }
        try (var app = launch("PT8H", rotated)) {
            expectEmpty("/api/auth/session", student.token(), 401);
            expectEmpty("/api/auth/session", moderator.token(), 401);
            assertSession(login(MOD_EMAIL, rotated));
        }
    }

    @Test
    void aTokenExpiresAccordingToTheTtlEvenAcrossRestart() throws Exception {
        Actor student;
        try (var app = launch("PT1.5S", PASSWORD)) {
            student = register("ada", STUDENT);
            assertSession(student);
            Thread.sleep(1600);
        }
        try (var app = launch("PT8H", PASSWORD)) {
            expectEmpty("/api/auth/session", student.token(), 401);
            assertSession(login(STUDENT, PASSWORD));
        }
    }

    @Test
    void chatStreamsArePairScopedAndRequireTheBearerHeader() throws Exception {
        try (var app = launch("PT8H", PASSWORD)) {
            var a = register("ada", STUDENT);
            var b = register("bea", "bea@example.invalid");
            var c = register("cy", "cy@example.invalid");
            var mod = login(MOD_EMAIL, PASSWORD);
            var aPath = "/api/chat/" + b.id() + "/events";
            expectEmpty(aPath, null, 401);
            expectEmpty(aPath, mod.token(), 403);
            try (var pool = Executors.newVirtualThreadPerTaskExecutor();
                 var left = stream(aPath, a);
                 var right = stream("/api/chat/" + a.id() + "/events", b);
                 var outside = stream("/api/chat/" + b.id() + "/events", c)) {
                for (var stream : new EventStream[]{left, right, outside}) {
                    assertEquals("event:ready", pool.submit(() -> nextEvent(stream)).get(3, TimeUnit.SECONDS));
                }
                var excluded = pool.submit(() -> nextEvent(outside));
                var sent = json("POST", "/api/chat/send", a.token(), Map.of("receiverId", b.id(), "text", "Solo para la pareja"), 200);
                for (var stream : new EventStream[]{left, right}) {
                    var event = pool.submit(() -> nextEvent(stream)).get(3, TimeUnit.SECONDS);
                    assertEquals("event:message", event);
                    var data = pool.submit(() -> nextData(stream)).get(3, TimeUnit.SECONDS);
                    assertEquals(sent, JSON.readTree(data));
                }
                assertThrows(TimeoutException.class, () -> excluded.get(500, TimeUnit.MILLISECONDS));
                assertTrue(json("GET", "/api/chat/" + b.id() + "/messages", c.token(), null, 200).isEmpty());
                assertEquals(sent, json("GET", "/api/chat/" + b.id() + "/messages", a.token(), null, 200).get(0));
                json("POST", "/api/auth/logout", b.token(), null, 200);
                json("POST", "/api/chat/send", a.token(), Map.of("receiverId", b.id(), "text", "Sesión revocada"), 200);
                assertNull(pool.submit(() -> nextEvent(right)).get(3, TimeUnit.SECONDS));
                expectEmpty("/api/chat/" + a.id() + "/events", b.token(), 401);
            }
        }
    }

    @Test
    void resourceUploadsValidateBeforePublishingAndDownloadAfterRestart() throws Exception {
        int contentId;
        Actor reader;
        try (var app = launch("PT8H", PASSWORD)) {
            var moderator = login(MOD_EMAIL, PASSWORD);
            json("POST", "/api/interests", moderator.token(), Map.of("name", "Pruebas"), 200);
            var author = register("ada", STUDENT);
            reader = register("bea", "bea@example.invalid");
            upload(author, "giant.png", "image/png", new byte[5 * 1024 * 1024 + 1], 413, "El archivo supera el límite de 5 MiB.");
            upload(author, "falso.png", "image/png", "<svg onload='alert(1)'/>".getBytes(UTF_8), 415, "Solo se permiten archivos PDF, PNG o JPEG.");
            upload(author, "../escape.png", "image/png", PNG, 400, "El nombre del archivo no es válido.");
            assertEquals(JSON.readTree("[]"), json("GET", "/api/content", reader.token(), null, 200));
            upload(author, "gráfica.png", "application/octet-stream", PNG, 200, "Contenido publicado exitosamente.");
            var feed = json("GET", "/api/content", reader.token(), null, 200);
            assertEquals(1, feed.size());
            assertEquals(1, feed.get(0).path("contentId").asInt());
            assertEquals("gráfica.png", feed.get(0).path("fileName").asText());
            assertTrue(feed.get(0).path("hasAttachment").asBoolean());
            contentId = feed.get(0).path("contentId").asInt();
        }
        try (var app = launch("PT8H", PASSWORD)) {
            String path = "/api/content/" + contentId + "/attachment";
            expectEmpty(path, null, 401);
            expectEmpty("/api/content/999/attachment", reader.token(), 404);
            var result = http.send(request(path, reader.token()).build(), HttpResponse.BodyHandlers.ofByteArray());
            assertEquals(200, result.statusCode());
            assertEquals("image/png", result.headers().firstValue("Content-Type").orElseThrow());
            assertEquals("nosniff", result.headers().firstValue("X-Content-Type-Options").orElseThrow());
            var disposition = ContentDisposition.parse(result.headers().firstValue("Content-Disposition").orElseThrow());
            assertTrue(disposition.isAttachment());
            assertEquals("gráfica.png", disposition.getFilename());
            assertArrayEquals(PNG, result.body());
        }
    }

    @Test
    void aLegacyNameOnlyResourceRemainsReadableButDoesNotOfferAnAttachment() throws Exception {
        try (var app = launch("PT8H", PASSWORD)) {
            var author = register("ada", STUDENT);
            var domain = app.getBean(TheKnowledgeBay.class);
            var legacy = Content.builder().author((Student) domain.getUserById(author.id()))
                    .title("A legacy resource").information("Notes\n\nArchivo adjunto: manual.pdf")
                    .contentType(ContentType.RESOURCE).date(LocalDate.now()).build();
            assertTrue(domain.addContent(legacy)); // Model a persisted publication from before attachments existed.
            var path = "/api/content/" + legacy.getContentId();
            var dto = json("GET", path, author.token(), null, 200);
            assertEquals("manual.pdf", dto.path("fileName").asText());
            assertFalse(dto.path("hasAttachment").asBoolean());
            expectEmpty(path + "/attachment", author.token(), 404);
        }
    }

    @Test
    void relativeStaticRootDoesNotPreventStartup() throws Exception {
        try (var app = launch("PT8H", PASSWORD,
                "spring.web.resources.static-locations=file:./web/")) {
            assertTrue(json("GET", "/api/interests", null, null, 200).isArray());
        }
    }

    @Test
    void relativeStaticRootStillProtectsTheUploadDirectory() throws Exception {
        var relative = Path.of("").toAbsolutePath().relativize(scratch);
        Files.writeString(scratch.resolve("index.html"), "Static fixture");
        try (var app = launch("PT8H", PASSWORD,
                "spring.web.resources.static-locations=file:" + relative + "/")) {
            var index = http.send(request("/index.html", null).build(), HttpResponse.BodyHandlers.ofString());
            assertEquals(200, index.statusCode());
            assertEquals("Static fixture", index.body());
            var moderator = login(MOD_EMAIL, PASSWORD);
            json("POST", "/api/interests", moderator.token(), Map.of("name", "Pruebas"), 200);
            var student = register("ada", STUDENT);
            upload(student, "blocked.png", "image/png", PNG, 500, "Error al publicar el contenido.");
            assertTrue(json("GET", "/api/content", student.token(), null, 200).isEmpty());
            assertFalse(Files.exists(scratch.resolve("private-uploads")));
        }
    }

    @Test
    void streamLimitIsPerStudentNotPerToken() throws Exception {
        try (var app = launch("PT8H", PASSWORD, "app.chat.max-streams-per-user=1")) {
            var a = register("ada", STUDENT);
            var b = register("bea", "bea@example.invalid");
            var secondToken = login(STUDENT, PASSWORD);
            var path = "/api/chat/" + b.id() + "/events";
            try (var first = stream(path, a)) {
                assertEquals("event:ready", nextEvent(first));
                var port = URI.create(origin).getPort();
                try (var socket = new Socket("127.0.0.1", port)) {
                    socket.setSoTimeout(3000);
                    var raw = "GET " + path + " HTTP/1.1\r\n"
                            + "Host: 127.0.0.1:" + port + "\r\n"
                            + "Accept: text/event-stream\r\nAccept-Encoding: identity\r\n"
                            + "Authorization: Bearer " + secondToken.token() + "\r\n\r\n";
                    socket.getOutputStream().write(raw.getBytes(StandardCharsets.US_ASCII));
                    var reader = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.US_ASCII));
                    var status = reader.readLine();
                    assertNotNull(status, "Excess stream closed before sending an HTTP response");
                    assertTrue(status.startsWith("HTTP/1.1 429"), status);
                }
                var result = http.send(request(path, secondToken.token())
                        .header("Accept", "text/event-stream").build(), HttpResponse.BodyHandlers.ofString());
                assertEquals(429, result.statusCode());
                assertEquals("2", result.headers().firstValue("Retry-After").orElseThrow());
                assertEquals("Too many active chat streams.", result.body());
                try (var other = stream("/api/chat/" + a.id() + "/events", b)) {
                    assertEquals("event:ready", nextEvent(other));
                    json("POST", "/api/auth/logout", a.token(), null, 200);
                    var sent = json("POST", "/api/chat/send", b.token(),
                            Map.of("receiverId", a.id(), "text", "REST sigue activo"), 200);
                    assertNull(nextEvent(first));
                    assertEquals(sent, json("GET", "/api/chat/" + b.id() + "/messages", secondToken.token(), null, 200).get(0));
                    try (var reopened = stream(path, secondToken)) {
                        assertEquals("event:ready", nextEvent(reopened));
                    }
                }
            }
        }
    }

    @Test
    void aSlotIsReleasedWhenMvcCannotStartAsyncProcessing() throws Exception {
        try (var app = launch("PT8H", PASSWORD, "app.chat.max-streams-per-user=1")) {
            var a = register("ada", STUDENT);
            var b = register("bea", "bea@example.invalid");
            var path = "/api/chat/" + b.id() + "/events";
            var mvc = MockMvcBuilders.webAppContextSetup(app).apply(springSecurity()).build();
            var failure = assertThrows(ServletException.class, () -> mvc.perform(get(path)
                    .header("Authorization", "Bearer " + a.token()).accept("text/event-stream")
                    .with(request -> {
                        request.setAsyncSupported(false);
                        return request;
                    })));
            assertInstanceOf(IllegalStateException.class, failure.getCause());
            try (var admitted = stream(path, a)) {
                assertEquals("event:ready", nextEvent(admitted));
            }
        }
    }

    private ServletWebServerApplicationContext launch(String ttl, String moderatorPassword, String... properties) {
        var context = (ServletWebServerApplicationContext) new SpringApplicationBuilder(App.class).properties(properties).run(
                "--spring.config.location=optional:classpath:/durable-test.properties", "--server.port=0",
                "--server.address=127.0.0.1", "--server.shutdown=immediate", "--spring.datasource.driver-class-name=org.sqlite.JDBC",
                "--spring.datasource.url=jdbc:sqlite:" + scratch.resolve("durable.db") + "?foreign_keys=on&busy_timeout=5000",
                "--spring.sql.init.mode=always", "--spring.servlet.multipart.max-file-size=5MB", "--spring.servlet.multipart.max-request-size=6MB",
                "--moderator.name=Moderator", "--moderator.email=" + MOD_EMAIL,
                "--moderator.password=" + moderatorPassword, "--app.sessions.ttl=" + ttl,
                "--app.uploads.dir=" + scratch.resolve("private-uploads"), "--logging.level.root=WARN");
        origin = "http://127.0.0.1:" + context.getWebServer().getPort();
        return context;
    }

    private Actor register(String username, String email) throws Exception {
        json("POST", "/api/auth/register", null, Map.of("username", username, "email", email, "password", PASSWORD), 200);
        return login(email, PASSWORD);
    }

    private Actor login(String email, String password) throws Exception {
        var login = json("POST", "/api/auth/login", null, Map.of("email", email, "password", password), 200);
        return new Actor(login.path("userId").asText(), login.path("token").asText());
    }

    private void assertSession(Actor actor) throws Exception {
        assertEquals(actor.id(), json("GET", "/api/auth/session", actor.token(), null, 200).path("userId").asText());
    }

    private HttpRequest.Builder request(String path, String token) {
        var request = HttpRequest.newBuilder(URI.create(origin + path)).timeout(Duration.ofSeconds(10));
        if (token != null) request.header("Authorization", "Bearer " + token);
        return request;
    }

    private JsonNode json(String method, String path, String token, Object body, int status) throws Exception {
        var result = http.send(request(path, token).header("Content-Type", "application/json").method(method,
                body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofByteArray(JSON.writeValueAsBytes(body)))
                .build(), HttpResponse.BodyHandlers.ofString());
        assertEquals(status, result.statusCode(), method + " " + path);
        return JSON.readTree(result.body());
    }

    private void expectEmpty(String path, String token, int status) throws Exception {
        var result = http.send(request(path, token).build(), HttpResponse.BodyHandlers.ofString());
        assertEquals(status, result.statusCode(), path);
        assertEquals("", result.body());
    }

    private EventStream stream(String path, Actor actor) throws Exception {
        var result = http.send(request(path, actor.token()).header("Accept", "text/event-stream").build(),
                HttpResponse.BodyHandlers.ofInputStream());
        InputStream body = result.body();
        if (result.statusCode() != 200) body.close();
        assertEquals(200, result.statusCode(), path);
        assertTrue(result.headers().firstValue("Content-Type").orElseThrow().startsWith("text/event-stream"));
        return new EventStream(body, new BufferedReader(new InputStreamReader(body, UTF_8)));
    }

    private record EventStream(InputStream body, BufferedReader reader) implements AutoCloseable {
        @Override public void close() throws Exception { body.close(); }
    }

    private static String nextEvent(EventStream stream) throws Exception {
        for (String line; (line = stream.reader().readLine()) != null; ) {
            if (line.startsWith("event:")) return line;
        }
        return null;
    }

    private static String nextData(EventStream stream) throws Exception {
        for (String line; (line = stream.reader().readLine()) != null && !line.isEmpty(); ) {
            if (line.startsWith("data:")) return line.substring(5);
        }
        throw new AssertionError("No data in event");
    }

    private void upload(Actor author, String filename, String type, byte[] data, int status, String message) throws Exception {
        String boundary = "test-boundary";
        String content = JSON.writeValueAsString(Map.of("title", "Adjunto", "body", "Para la clase", "contentType", "RESOURCE",
                "topics", new String[]{"Pruebas"}));
        String prefix = "--" + boundary + "\r\nContent-Disposition: form-data; name=\"content\"\r\nContent-Type: application/json\r\n\r\n"
                + content + "\r\n--" + boundary + "\r\nContent-Disposition: form-data; name=\"file\"; filename=\"" + filename
                + "\"\r\nContent-Type: " + type + "\r\n\r\n";
        var body = HttpRequest.BodyPublishers.ofByteArrays(java.util.List.of(prefix.getBytes(StandardCharsets.UTF_8), data,
                ("\r\n--" + boundary + "--\r\n").getBytes(UTF_8)));
        var result = http.send(request("/api/content", author.token()).header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(body).build(), HttpResponse.BodyHandlers.ofString());
        assertEquals(status, result.statusCode(), filename);
        assertEquals(JSON.valueToTree(Map.of("success", status == 200, "message", message)), JSON.readTree(result.body()));
    }

    private record Actor(String id, String token) {}
}
