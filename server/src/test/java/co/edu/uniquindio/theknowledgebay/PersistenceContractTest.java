package co.edu.uniquindio.theknowledgebay;

import co.edu.uniquindio.theknowledgebay.api.dto.ContentResponseDTO;
import co.edu.uniquindio.theknowledgebay.core.model.*;
import co.edu.uniquindio.theknowledgebay.core.model.enums.ContentType;
import co.edu.uniquindio.theknowledgebay.core.model.enums.Urgency;
import co.edu.uniquindio.theknowledgebay.core.repository.ChatRepository;
import co.edu.uniquindio.theknowledgebay.core.repository.DomainRepository;
import co.edu.uniquindio.theknowledgebay.core.repository.InterestRepository;
import co.edu.uniquindio.theknowledgebay.core.repository.StudentRepository;
import co.edu.uniquindio.theknowledgebay.core.service.AuthService;
import co.edu.uniquindio.theknowledgebay.core.service.ImportService;
import co.edu.uniquindio.theknowledgebay.core.service.SessionManager;
import co.edu.uniquindio.theknowledgebay.infrastructure.config.ModeratorProperties;
import co.edu.uniquindio.theknowledgebay.infrastructure.config.WebConfig;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import com.zaxxer.hikari.HikariDataSource;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.boot.convert.ApplicationConversionService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

class PersistenceContractTest {
    @TempDir Path scratch;
    @RegisterExtension final PostgresTestSchema database = new PostgresTestSchema();
    static final LocalDate DATE = LocalDate.of(2025, 1, 1);

    @Test
    void registrationsReturnStableIdsAndLoginAfterRestart() throws Exception {
        String fixturePassword = UUID.randomUUID().toString();
        runProcess("accounts-write", fixturePassword);
        runProcess("accounts-read", fixturePassword);
    }

    @Test
    void resourcesAndRelationshipsSurviveRestart() throws Exception {
        runProcess("resources-write", null);
        runProcess("resources-read", null);
    }

    private void runProcess(String phase, String fixturePassword) throws Exception {
        var java = Path.of(System.getProperty("java.home"), "bin", "java");
        var diagnostics = scratch.resolve(phase + ".stderr");
        var command = new ProcessBuilder(java.toString(), "-cp",
                System.getProperty("surefire.test.class.path", System.getProperty("java.class.path")),
                PersistenceContractTest.class.getName(), phase, scratch.toString(), database.name())
                .redirectOutput(ProcessBuilder.Redirect.DISCARD).redirectError(diagnostics.toFile());
        if (fixturePassword != null) command.environment().put("KB_TEST_FIXTURE_PASSWORD", fixturePassword);
        var process = command.start();
        try {
            assertTrue(process.waitFor(25, TimeUnit.SECONDS), "Persistence process did not exit: " + phase);
            assertEquals(0, process.exitValue(), () -> phase + ": " + readDiagnostics(diagnostics));
        } finally {
            if (process.isAlive()) {
                process.destroyForcibly();
                process.waitFor(5, TimeUnit.SECONDS);
            }
        }
    }

    private static String readDiagnostics(Path diagnostics) {
        try {
            return Files.readString(diagnostics);
        } catch (java.io.IOException ignored) {
            return "Unable to read child process diagnostics";
        }
    }

    public static void main(String[] args) throws Exception {
        Path scratch = Path.of(args[1]);
        var database = PostgresTestSchema.existing(args[2]);
        String fixturePassword = System.getenv("KB_TEST_FIXTURE_PASSWORD");
        switch (args[0]) {
            case "accounts-write" -> writeAccounts(scratch, database, fixturePassword);
            case "accounts-read" -> verifyAccounts(scratch, database, fixturePassword);
            case "resources-write" -> writeResources(scratch, database);
            case "resources-read" -> verifyResources(scratch, database);
            default -> throw new IllegalArgumentException("Unknown persistence test phase");
        }
    }

    private static void writeAccounts(Path scratch, PostgresTestSchema database, String fixturePassword) throws Exception {
        Student account = student("registration", fixturePassword);
        Student direct = student("direct", new BCryptPasswordEncoder(4).encode(fixturePassword));
        try (var application = open(database)) {
            assertEquals("true", application.getBean(AuthService.class).registerStudent(account)[0]);
            application.getBean(TheKnowledgeBay.class).addStudent(direct);
            assertAll(() -> assertNotNull(account.getId()), () -> assertNotNull(direct.getId()));
            assertFalse(account.getId().isBlank());
            assertFalse(direct.getId().isBlank());
            assertNotEquals(account.getId(), direct.getId());
        }
        Files.write(scratch.resolve("account-ids"), List.of(account.getId(), direct.getId()));
    }

    private static void verifyAccounts(Path scratch, PostgresTestSchema database, String fixturePassword) throws Exception {
        var ids = Files.readAllLines(scratch.resolve("account-ids"));
        try (var application = open(database)) {
            var auth = application.getBean(AuthService.class);
            var domain = application.getBean(TheKnowledgeBay.class);
            String email = "registration@example.invalid";
            assertEquals(ids.get(0), auth.findUserByEmail(email).orElseThrow().getId());
            assertEquals(ids.get(1), auth.findUserByEmail("direct@example.invalid").orElseThrow().getId());
            assertTrue(auth.login(email, fixturePassword).isPresent());
            assertNull(domain.getUserById("unknown@example.invalid"));
            assertEquals(2, domain.getTotalUsersCount());
        }
    }

    private static void writeResources(Path scratch, PostgresTestSchema database) throws Exception {
        Student author = student("author", null);
        author.setId("101");
        Student peer = student("peer", null);
        peer.setId("102");
        var interest = new Interest("11", "Data structures");
        var topics = topics(interest);
        Content publication = content(author, topics);
        HelpRequest request = help(author, topics);
        try (var application = open(database)) {
            var domain = application.getBean(TheKnowledgeBay.class);
            author.setPassword(application.getBean(PasswordEncoder.class).encode(UUID.randomUUID().toString()));
            peer.setPassword(author.getPassword());
            assertTrue(domain.addInterest(interest));
            author.setInterests(topics);
            peer.setInterests(topics);
            domain.addStudent(author);
            domain.addStudent(peer);
            domain.updateAutomaticStudyGroupsForStudent(peer);
            assertTrue(domain.addContent(publication));
            assertTrue(domain.addHelpRequest(request));
            assertTrue(domain.likeContent(publication.getContentId(), peer.getId()));
            assertTrue(domain.followUser(author.getId(), peer.getId()));
            assertFalse(domain.markHelpRequestAsCompleted(request.getRequestId(), peer.getId()));
            assertTrue(domain.markHelpRequestAsCompleted(request.getRequestId(), author.getId()));
            assertNotNull(domain.sendMessage(author.getId(), peer.getId(), "same text"));
        }
        Files.write(scratch.resolve("post-ids"), List.of(Integer.toString(publication.getContentId()), Integer.toString(request.getRequestId())));
    }

    private static void verifyResources(Path scratch, PostgresTestSchema database) throws Exception {
        var ids = Files.readAllLines(scratch.resolve("post-ids"));
        try (var application = open(database)) {
            var domain = application.getBean(TheKnowledgeBay.class);
            assertAll(
                () -> assertEquals(2, domain.getTotalUsersCount()),
                () -> assertEquals(1, domain.getAllInterests().getSize()),
                () -> assertEquals(1, domain.getTotalContentCount()),
                () -> assertEquals(1, domain.getTotalHelpRequestsCount()),
                () -> assertEquals(1, domain.getStudyGroups().getSize()),
                () -> assertEquals(1, domain.getChats().getSize()),
                () -> assertTrue(domain.isUserFollowing("101", "102")));
            var group = domain.getStudyGroups().get(0);
            assertEquals(2, group.getMembers().getSize());
            assertEquals(Integer.parseInt(ids.get(0)), group.getAssociatedContents().get(0).getContentId());
            assertEquals(Integer.parseInt(ids.get(1)), group.getAssociatedHelpRequests().get(0).getRequestId());
            assertTrue(group.getAssociatedHelpRequests().get(0).isCompleted());
            assertEquals(1, group.getAssociatedContents().get(0).getLikeCount());
            assertEquals("same text", domain.getChats().get(0).getMessages().get(0).getText());
            assertEquals(1, ((Student) domain.getUserById("101")).getFollowingCount());
            assertEquals(1, ((Student) domain.getUserById("102")).getFollowersCount());
        }
    }

    @Test
    void groupViewsResolveTheSameEditsAndDeletionsAsGlobalViews() {
        try (var application = open(database)) {
            var domain = application.getBean(TheKnowledgeBay.class);
            var topic = new Interest("12", "Algorithms");
            assertTrue(domain.addInterest(topic));
            var author = createStudent(application, "102", "writer", topics(topic));
            createStudent(application, "103", "reader", topics(topic));
            var publication = content(author, topics(topic));
            var request = help(author, topics(topic));
            assertTrue(domain.addContent(publication));
            assertTrue(domain.addHelpRequest(request));
            var edited = new ContentResponseDTO();
            edited.setTitle("Revised");
            assertTrue(domain.updateContent(publication.getContentId(), edited));
            assertEquals("Revised", domain.getContentById(publication.getContentId()).getTitle());
            assertEquals("Revised", domain.getStudyGroups().get(0).getAssociatedContents().get(0).getTitle());
            assertTrue(domain.deleteContent(publication.getContentId()));
            assertTrue(domain.deleteHelpRequest(request.getRequestId()));
            var group = domain.getStudyGroups().get(0);
            assertTrue(group.getAssociatedContents().isEmpty());
            assertTrue(group.getAssociatedHelpRequests().isEmpty());
            assertEquals(0, domain.getTotalContentCount());
            assertEquals(0, domain.getTotalHelpRequestsCount());
        }
    }

    static AnnotationConfigApplicationContext open(PostgresTestSchema database) {
        database.migrate();
        var application = new AnnotationConfigApplicationContext();
        application.getBeanFactory().setConversionService(ApplicationConversionService.getSharedInstance());
        application.registerBean(HikariDataSource.class, () -> {
            var source = new HikariDataSource();
            source.setJdbcUrl(database.url());
            source.setUsername(database.user());
            source.setPassword(database.password());
            source.setMaximumPoolSize(6);
            source.setMinimumIdle(0);
            return source;
        }, definition -> ((org.springframework.beans.factory.support.AbstractBeanDefinition) definition).setDestroyMethodName("close"));
        application.registerBean(JdbcTemplate.class, () -> new JdbcTemplate(application.getBean(HikariDataSource.class)));
        application.registerBean(PasswordEncoder.class, () -> new BCryptPasswordEncoder(4));
        application.registerBean(ModeratorProperties.class,
                () -> new ModeratorProperties("moderator", "moderator@example.invalid", UUID.randomUUID().toString()));
        application.register(StudentRepository.class, InterestRepository.class, DomainRepository.class, ChatRepository.class,
                TheKnowledgeBay.class, AuthService.class, SessionManager.class, ImportService.class, WebConfig.class);
        application.refresh();
        return application;
    }

    static Student student(String name, String password) {
        return Student.builder().username(name).email(name + "@example.invalid").password(password)
                .firstName("Test").lastName("Student").build();
    }

    static Student createStudent(AnnotationConfigApplicationContext application, String id, String name,
                                 DoublyLinkedList<Interest> interests) {
        var student = student(name, application.getBean(PasswordEncoder.class).encode(UUID.randomUUID().toString()));
        student.setId(id);
        student.setInterests(interests);
        var domain = application.getBean(TheKnowledgeBay.class);
        domain.addStudent(student);
        domain.updateAutomaticStudyGroupsForStudent(student);
        return student;
    }

    static DoublyLinkedList<Interest> topics(Interest topic) {
        var topics = new DoublyLinkedList<Interest>();
        topics.addLast(topic);
        return topics;
    }

    static Content content(Student author, DoublyLinkedList<Interest> topics) {
        return Content.builder().title("Article").information("Notes").contentType(ContentType.ARTICLE)
                .date(DATE).author(author).topics(topics).build();
    }

    static HelpRequest help(Student author, DoublyLinkedList<Interest> topics) {
        return HelpRequest.builder().information("Question").student(author).requestDate(DATE)
                .urgency(Urgency.HIGH).topics(topics).build();
    }
}
