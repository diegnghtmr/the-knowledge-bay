package co.edu.uniquindio.theknowledgebay.core.service;

import co.edu.uniquindio.theknowledgebay.api.dto.ChatContactDTO;
import co.edu.uniquindio.theknowledgebay.core.model.Message;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final TheKnowledgeBay theKnowledgeBay;

    public Message sendMessage(String actorId, String peerId, String text) {
        return theKnowledgeBay.sendMessage(actorId, peerId, text);
    }

    public boolean canChatWith(String actorId, String peerId) {
        return !actorId.equals(peerId) && theKnowledgeBay.getUserById(peerId) instanceof Student;
    }

    public List<Message> getMessagesForChat(String actorId, String peerId) {
        var messages = theKnowledgeBay.getMessagesForChat(actorId, peerId);
        return StreamSupport.stream(messages.spliterator(), false).toList();
    }

    public List<ChatContactDTO> getChatContactsWithLastMessage(String actorId) {
        return theKnowledgeBay.getChatContacts(actorId).stream().map(chat -> {
            Student peer = actorId.equals(chat.getStudentA().getId()) ? chat.getStudentB() : chat.getStudentA();
            var newest = chat.getMessages().getHead();
            return contact(peer, newest == null ? null : newest.getData());
        }).toList();
    }

    public List<ChatContactDTO> searchStudents(String actorId, String query) {
        String term = query.strip().toLowerCase(Locale.ROOT);
        if (term.isEmpty()) return List.of();

        var matches = new ArrayList<ChatContactDTO>();
        for (Student candidate : theKnowledgeBay.getUsers().getStudents()) {
            if (actorId.equals(candidate.getId())) continue;
            String fullName = String.join(" ", orEmpty(candidate.getFirstName()), orEmpty(candidate.getLastName())).strip();
            if (contains(candidate.getUsername(), term) || contains(fullName, term) || contains(candidate.getEmail(), term)) {
                matches.add(contact(candidate, null));
            }
        }
        return matches;
    }

    private static boolean contains(String value, String term) {
        return orEmpty(value).toLowerCase(Locale.ROOT).contains(term);
    }

    private static String orEmpty(String value) {
        return value == null ? "" : value;
    }

    private static ChatContactDTO contact(Student peer, Message newest) {
        return ChatContactDTO.builder()
                .contactId(peer.getId())
                .username(peer.getUsername())
                .lastMessageText(newest == null ? "" : newest.getText())
                .lastMessageTimestamp(newest == null ? null : newest.getTimestamp())
                .build();
    }
}
