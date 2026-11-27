package co.edu.uniquindio.theknowledgebay;

import co.edu.uniquindio.theknowledgebay.infrastructure.config.ModeratorProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@PostgresTestSchema.Isolated
@SpringBootTest
@AutoConfigureMockMvc(print = MockMvcPrint.NONE)
class IntegratedApiContractTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired ModeratorProperties moderatorProperties;

    @Test
    void newStudentsCanFindAPeerAndStartAChatThroughTheBearerFilter() throws Exception {
        var sender = register("chat-sender");
        var recipient = register("chat-recipient");
        var moderator = login(moderatorProperties.email(), moderatorProperties.password());
        String search = "/api/chat/contacts/search?query=chat-recipient";
        mvc.perform(get(search)).andExpect(status().isUnauthorized()).andExpect(content().string(""));
        as(moderator, get(search)).andExpect(status().isForbidden()).andExpect(content().string(""));
        as(sender, get("/api/chat/contacts")).andExpect(status().isOk()).andExpect(content().json("[]"));
        as(sender, get(search)).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].contactId").value(recipient.id()));
        as(recipient, get(search)).andExpect(status().isOk()).andExpect(content().json("[]"));
        as(sender, withJson(post("/api/chat/send"), Map.of("receiverId", recipient.id(), "text", "Hello from integration")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.senderId").value(sender.id()));
        as(recipient, get("/api/chat/{id}/messages", sender.id())).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1)).andExpect(jsonPath("$[0].text").value("Hello from integration"));
    }

    @Test
    void ownContentUsesTheStoredStudentIdAndKeepsTheGlobalFeedReadable() throws Exception {
        var moderator = login(moderatorProperties.email(), moderatorProperties.password());
        createTopic(moderator, "My content topic");
        var author = register("my-content-author");
        var reader = register("my-content-reader");
        int id = publish(author, "My content topic", "Own content");
        assertNotEquals(author.id(), reader.id());
        mvc.perform(get("/api/content/my-content")).andExpect(status().isUnauthorized()).andExpect(content().string(""));
        as(author, get("/api/content/my-content")).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1)).andExpect(jsonPath("$[0].authorId").value(author.id()));
        as(reader, get("/api/content/my-content")).andExpect(status().isOk()).andExpect(content().json("[]"));
        as(reader, get("/api/content/{id}", id)).andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Own content")).andExpect(jsonPath("$.authorId").value(author.id()));
    }

    @Test
    void groupInteractionsUseTheSignedInMemberAndTheSamePostsAsTheGlobalFeed() throws Exception {
        String topic = "Group interaction topic";
        var moderator = login(moderatorProperties.email(), moderatorProperties.password());
        createTopic(moderator, topic);
        var author = register("group-author", topic);
        var member = register("group-member", topic);
        var outsider = register("group-outsider");
        int id = publish(author, topic, "Original group title");
        String groupId = read(as(member, get("/api/studygroups"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1))).get(0).path("id").asText();
        String feed = "/api/studygroups/" + groupId + "/posts";
        String like = feed + "/content-" + id + "/like";
        String comment = feed + "/content-" + id + "/comments";
        as(outsider, withJson(post(comment), Map.of("text", "Rejected", "authorId", member.id())))
                .andExpect(status().isNotFound()).andExpect(content().string(""));
        as(member, get(feed)).andExpect(status().isOk()).andExpect(jsonPath("$[0].comments").isEmpty());
        as(member, withJson(post(comment), Map.of("text", "Member comment", "authorId", author.id(), "authorName", "Ignored")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.author.id").value(member.id()))
                .andExpect(jsonPath("$.author.name").value("group-member"));
        as(member, post(like)).andExpect(status().isOk()).andExpect(jsonPath("$.likedByMe").value(true));
        as(member, get(feed)).andExpect(status().isOk()).andExpect(jsonPath("$[0].likedByMe").value(true))
                .andExpect(jsonPath("$[0].comments[0].text").value("Member comment"));
        as(author, get(feed)).andExpect(status().isOk()).andExpect(jsonPath("$[0].likedByMe").value(false));
        as(member, get("/api/content/{id}", id)).andExpect(status().isOk())
                .andExpect(jsonPath("$.likeCount").value(1)).andExpect(jsonPath("$.hasLiked").value(true));
        as(member, delete(like)).andExpect(status().isOk()).andExpect(jsonPath("$.likedByMe").value(false));
        as(member, get("/api/content/{id}", id)).andExpect(status().isOk()).andExpect(jsonPath("$.likeCount").value(0));
        as(moderator, withJson(put("/api/admin/content/{id}", id), Map.of("title", "Updated group title")))
                .andExpect(status().isOk());
        as(member, get(feed)).andExpect(status().isOk()).andExpect(jsonPath("$[0].title").value("Updated group title"));
        as(member, get("/api/content/{id}", id)).andExpect(status().isOk()).andExpect(jsonPath("$.title").value("Updated group title"));
        as(moderator, delete("/api/admin/content/{id}", id)).andExpect(status().isOk());
        as(member, get(feed)).andExpect(status().isOk()).andExpect(content().json("[]"));
        as(member, get("/api/content/{id}", id)).andExpect(status().isNotFound()).andExpect(content().string(""));
    }

    @Test
    void groupPaginationRejectsInvalidRangesBeforeReadingTheFeed() throws Exception {
        var actor = register("pagination-reader");
        for (String parameters : List.of("page=-1", "size=0", "size=101")) {
            as(actor, get("/api/studygroups/unused/posts?" + parameters))
                    .andExpect(status().isBadRequest()).andExpect(content().string(""));
        }
        as(actor, get("/api/studygroups/unused/posts?page=2147483647&size=100"))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
    }

    @Test
    void springServesTheSpaOnDeepLinksWithoutForwardingApiRequests() throws Exception {
        for (String path : List.of("/", "/landing", "/login", "/register", "/register/steps", "/terms", "/profile",
                "/user/123", "/chat", "/study-groups", "/help-request", "/publish-content", "/users-dashboard",
                "/content-dashboard", "/affinity-graph", "/admin/analytics", "/admin/interests", "/admin/help-requests", "/admin/stats")) {
            mvc.perform(get(path)).andExpect(status().isOk()).andExpect(forwardedUrl("/index.html"));
        }
        mvc.perform(get("/index.html")).andExpect(status().isOk()).andExpect(content().string(
                org.hamcrest.Matchers.containsString("SPA fixture")));
        mvc.perform(get("/assets/fixture.js")).andExpect(status().isOk()).andExpect(content().string("export {};\n"));
        mvc.perform(head("/assets/fixture.js")).andExpect(status().isOk()).andExpect(content().string(""));
        mvc.perform(get("/api/auth/session")).andExpect(status().isUnauthorized()).andExpect(content().string(""));
        mvc.perform(get("/api/missing")).andExpect(status().isUnauthorized()).andExpect(content().string(""));
        mvc.perform(post("/chat")).andExpect(status().isUnauthorized()).andExpect(content().string(""));
    }

    private void createTopic(Actor moderator, String topic) throws Exception {
        as(moderator, withJson(post("/api/interests"), Map.of("name", topic)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));
    }

    private int publish(Actor author, String topic, String title) throws Exception {
        as(author, multipart("/api/content").file(new MockMultipartFile("content", "content.json", "application/json",
                json.writeValueAsBytes(Map.of("title", title, "body", "Notes", "contentType", "ARTICLE", "topics", List.of(topic))))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));
        for (var entry : read(as(author, get("/api/content")).andExpect(status().isOk()))) {
            if (title.equals(entry.path("title").asText())) return entry.path("contentId").asInt();
        }
        throw new AssertionError("Published article was absent from the global feed");
    }

    private Actor register(String username, String... interests) throws Exception {
        String email = username + "@example.invalid";
        String password = UUID.randomUUID().toString();
        mvc.perform(withJson(post("/api/auth/register"), Map.of("username", username, "email", email,
                        "password", password, "interests", List.of(interests))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));
        var actor = login(email, password);
        assertNotEquals(email, actor.id());
        as(actor, get("/api/auth/session")).andExpect(status().isOk()).andExpect(jsonPath("$.userId").value(actor.id()));
        return actor;
    }

    private Actor login(String email, String password) throws Exception {
        var result = read(mvc.perform(withJson(post("/api/auth/login"), Map.of("email", email, "password", password)))
                .andExpect(status().isOk()));
        var actor = new Actor(result.path("userId").asText(), result.path("token").asText());
        assertFalse(actor.id().isBlank());
        assertFalse(actor.token().isBlank());
        return actor;
    }

    private JsonNode read(ResultActions result) throws Exception {
        return json.readTree(result.andReturn().getResponse().getContentAsByteArray());
    }

    private MockHttpServletRequestBuilder withJson(MockHttpServletRequestBuilder request, Map<String, ?> body) throws Exception {
        return request.contentType("application/json").content(json.writeValueAsBytes(body));
    }

    private ResultActions as(Actor actor, MockHttpServletRequestBuilder request) throws Exception {
        return mvc.perform(request.header(HttpHeaders.AUTHORIZATION, "Bearer " + actor.token()));
    }

    private record Actor(String id, String token) {}
}
