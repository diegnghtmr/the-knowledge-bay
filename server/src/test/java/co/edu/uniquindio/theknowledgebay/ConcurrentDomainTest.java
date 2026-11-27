package co.edu.uniquindio.theknowledgebay;

import co.edu.uniquindio.theknowledgebay.core.model.Interest;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.stream.StreamSupport;

import static co.edu.uniquindio.theknowledgebay.PersistenceContractTest.*;
import static org.junit.jupiter.api.Assertions.*;

class ConcurrentDomainTest {
    @RegisterExtension final PostgresTestSchema database = new PostgresTestSchema();

    @Test
    void concurrentCreationReadsLikesAndMessagesPreserveExactCounts() throws Exception {
        try (var application = open(database)) {
            var domain = application.getBean(TheKnowledgeBay.class);
            var interest = new Interest("21", "Databases");
            assertTrue(domain.addInterest(interest));
            var topics = topics(interest);
            var author = createStudent(application, "201", "publisher", topics);
            var reader = createStudent(application, "202", "reviewer", topics);
            var initial = content(author, topics);
            assertTrue(domain.addContent(initial));
            var initialHelp = help(author, topics);
            assertTrue(domain.addHelpRequest(initialHelp));
            final int workers = 12;
            var start = new CyclicBarrier(workers);
            var ids = new HashSet<Integer>();
            var helpIds = new HashSet<Integer>();
            var messageIds = new HashSet<Integer>();
            int newLikes = 0;
            try (var executor = Executors.newFixedThreadPool(workers)) {
                var results = new ArrayList<Future<Operation>>();
                for (int i = 0; i < workers; i++) {
                    final boolean reverse = i % 2 == 0;
                    results.add(executor.submit(() -> {
                        var article = content(author, topics);
                        var request = help(author, topics);
                        start.await(15, TimeUnit.SECONDS);
                        assertTrue(domain.addContent(article));
                        assertTrue(domain.addHelpRequest(request));
                        assertNotNull(domain.getHelpRequestById(initialHelp.getRequestId()));
                        assertTrue(StreamSupport.stream(domain.getAllHelpRequests().spliterator(), false)
                                .anyMatch(item -> item.getRequestId() == initialHelp.getRequestId()));
                        boolean liked = domain.likeContent(initial.getContentId(), reader.getId());
                        var sender = reverse ? author : reader;
                        var recipient = reverse ? reader : author;
                        var message = domain.sendMessage(sender.getId(), recipient.getId(), "same text");
                        assertNotNull(message);
                        return new Operation(article.getContentId(), request.getRequestId(), message.getMessageId(), liked);
                    }));
                }
                for (var result : results) {
                    var operation = result.get(20, TimeUnit.SECONDS);
                    ids.add(operation.contentId());
                    helpIds.add(operation.helpId());
                    messageIds.add(operation.messageId());
                    if (operation.liked()) newLikes++;
                }
            }
            assertEquals(workers, ids.size());
            assertEquals(workers, helpIds.size());
            assertEquals(workers, messageIds.size());
            assertEquals(1, newLikes);
            assertEquals(1, domain.getContentById(initial.getContentId()).getLikeCount());
            assertEquals(workers + 1, domain.getTotalContentCount());
            assertEquals(workers + 1, domain.getTotalHelpRequestsCount());
            var group = domain.getStudyGroups().get(0);
            assertEquals(workers + 1, group.getAssociatedContents().getSize());
            assertEquals(workers + 1, group.getAssociatedHelpRequests().getSize());
            assertEquals(1, domain.getChats().getSize());
            assertEquals(workers, domain.getMessagesForChat(author.getId(), reader.getId()).getSize());
        }
    }

    @Test
    void sortedContentCanBeInsertedTraversedAndLookedUpWithoutRecursiveDepth() {
        try (var application = open(database)) {
            var domain = application.getBean(TheKnowledgeBay.class);
            var author = createStudent(application, "301", "many-publications", null);
            int previous = 0;
            for (int i = 0; i < 16_000; i++) {
                var publication = content(author, null);
                assertTrue(domain.addContent(publication));
                assertTrue(publication.getContentId() > previous);
                previous = publication.getContentId();
            }
            assertEquals(16_000, domain.getAllContent().getSize());
            assertEquals(previous, domain.getContentById(previous).getContentId());
            var page = domain.getContentPage(15_900, 100);
            assertEquals(100, page.size());
            assertEquals(previous - 99, page.getFirst().getContentId());
            assertEquals(previous, page.getLast().getContentId());
            assertTrue(domain.getContentPage(16_000, 100).isEmpty());
            assertThrows(IllegalArgumentException.class, () -> domain.getContentPage(-1, 1));
            assertThrows(IllegalArgumentException.class, () -> domain.getContentPage(0, 0));
            assertThrows(IllegalArgumentException.class, () -> domain.getContentPage(0, 101));
        }
    }

    private record Operation(int contentId, int helpId, int messageId, boolean liked) {}
}
