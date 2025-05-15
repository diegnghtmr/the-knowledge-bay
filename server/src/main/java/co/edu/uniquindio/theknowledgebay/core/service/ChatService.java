package co.edu.uniquindio.theknowledgebay.core.service;

import co.edu.uniquindio.theknowledgebay.api.dto.ChatContactDTO;
import co.edu.uniquindio.theknowledgebay.core.model.Chat;
import co.edu.uniquindio.theknowledgebay.core.model.Message;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.model.User;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.DoublyLinkedNode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final TheKnowledgeBay theKnowledgeBay;
    private static int messageIdCounter = 1;
    private static int chatIdCounter = 1;

    /**
     * Returns a normalized chat key for two users, ensuring the same key
     * regardless of the order of user IDs.
     *
     * @param userId1 First user ID
     * @param userId2 Second user ID
     * @return A normalized key for the chat
     */
    private String getNormalizedChatKey(String userId1, String userId2) {
        String[] ids = {userId1, userId2};
        Arrays.sort(ids);
        return ids[0] + "_" + ids[1];
    }

    /**
     * Finds an existing chat between two users or creates a new one if it doesn't exist.
     *
     * @param user1 First student
     * @param user2 Second student
     * @return The existing or newly created Chat
     */
    private Chat findOrCreateChat(Student user1, Student user2) {
        String chatKey = getNormalizedChatKey(user1.getEmail(), user2.getEmail());
        
        DoublyLinkedNode<Chat> current = theKnowledgeBay.getChats().getHead();
        while (current != null) {
            Chat chat = current.getData();
            String existingChatKey = getNormalizedChatKey(
                    chat.getStudentA().getEmail(),
                    chat.getStudentB().getEmail());
            
            if (chatKey.equals(existingChatKey)) {
                return chat;
            }
            current = current.getNext();
        }
        
        Chat newChat = Chat.builder()
                .chatId(chatIdCounter++)
                .studentA(user1)
                .studentB(user2)
                .messages(new DoublyLinkedList<>())
                .build();
        
        theKnowledgeBay.getChats().addLast(newChat);
        log.info("Created new chat between {} and {}", user1.getEmail(), user2.getEmail());
        
        return newChat;
    }

    /**
     * Sends a message from one user to another.
     *
     * @param senderEmail Email of the sender
     * @param receiverEmail Email of the receiver
     * @param text Message text
     * @return The sent message
     */
    public Message sendMessage(String senderEmail, String receiverEmail, String text) {
        User senderUser = theKnowledgeBay.findOrCreateUserByEmail(senderEmail);
        User receiverUser = theKnowledgeBay.findOrCreateUserByEmail(receiverEmail);
        
        if (!(senderUser instanceof Student) || !(receiverUser instanceof Student)) {
            log.error("Both sender and receiver must be students");
            return null;
        }
        
        Student sender = (Student) senderUser;
        Student receiver = (Student) receiverUser;
        
        Chat chat = findOrCreateChat(sender, receiver);
        
        Message message = Message.builder()
                .messageId(messageIdCounter++)
                .text(text)
                .sender(sender)
                .timestamp(LocalDateTime.now())
                .build();
        
        chat.getMessages().addLast(message);
        log.info("Message sent from {} to {}: {}", senderEmail, receiverEmail, text);
        
        return message;
    }

    /**
     * Gets all messages between two users.
     *
     * @param userEmail1 First user's email
     * @param userEmail2 Second user's email
     * @return List of messages
     */
    public DoublyLinkedList<Message> getMessagesForChat(String userEmail1, String userEmail2) {
        String chatKey = getNormalizedChatKey(userEmail1, userEmail2);
        
        DoublyLinkedNode<Chat> current = theKnowledgeBay.getChats().getHead();
        while (current != null) {
            Chat chat = current.getData();
            String existingChatKey = getNormalizedChatKey(
                    chat.getStudentA().getEmail(),
                    chat.getStudentB().getEmail());
            
            if (chatKey.equals(existingChatKey)) {
                return chat.getMessages();
            }
            current = current.getNext();
        }
        
        return new DoublyLinkedList<>();
    }

    /**
     * Gets all chat contacts for a user with their last message.
     *
     * @param userEmail The user's email
     * @return List of chat contacts with last message info
     */
    public DoublyLinkedList<ChatContactDTO> getChatContactsWithLastMessage(String userEmail) {
        DoublyLinkedList<ChatContactDTO> contacts = new DoublyLinkedList<>();
        
        DoublyLinkedNode<Chat> current = theKnowledgeBay.getChats().getHead();
        while (current != null) {
            Chat chat = current.getData();
            
            // Check if this user is part of this chat
            if (chat.getStudentA().getEmail().equals(userEmail) || 
                chat.getStudentB().getEmail().equals(userEmail)) {
                
                // Get the other student (contact)
                Student contact = chat.getStudentA().getEmail().equals(userEmail) ? 
                        chat.getStudentB() : chat.getStudentA();
                
                // Get the last message (if any)
                Message lastMessage = null;
                if (chat.getMessages() != null && !chat.getMessages().isEmpty()) {
                    DoublyLinkedNode<Message> messageCurrent = chat.getMessages().getHead();
                    while (messageCurrent != null && messageCurrent.getNext() != null) {
                        messageCurrent = messageCurrent.getNext();
                    }
                    
                    if (messageCurrent != null) {
                        lastMessage = messageCurrent.getData();
                    }
                }
                
                ChatContactDTO contactDTO = ChatContactDTO.builder()
                        .contactId(contact.getEmail())
                        .username(contact.getUsername())
                        .lastMessageText(lastMessage != null ? lastMessage.getText() : "")
                        .lastMessageTimestamp(lastMessage != null ? lastMessage.getTimestamp() : null)
                        .build();
                
                contacts.addLast(contactDTO);
            }
            
            current = current.getNext();
        }
        
        return contacts;
    }
}