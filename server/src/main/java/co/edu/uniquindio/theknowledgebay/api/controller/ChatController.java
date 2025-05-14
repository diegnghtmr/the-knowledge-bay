package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.api.dto.ChatContactDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.MessageDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.SendMessageRequestDTO;
import co.edu.uniquindio.theknowledgebay.core.model.Message;
import co.edu.uniquindio.theknowledgebay.core.service.ChatService;
import co.edu.uniquindio.theknowledgebay.core.service.SessionManager;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.DoublyLinkedNode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final SessionManager sessionManager;

    /**
     * Endpoint for sending a message to another user.
     *
     * @param token      Authorization token
     * @param requestDTO The message request containing receiver ID and text
     * @return The created message
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(
            @RequestHeader(value="Authorization", required=false) String token,
            @RequestBody SendMessageRequestDTO requestDTO) {
        
        // Validate token and get current user
        String currentUserEmail = null;
        if (token != null) {
            currentUserEmail = sessionManager.getCurrentUserId(token);
            log.info("Token proporcionado: {}, usuario: {}", token, currentUserEmail);
        } else {
            log.warn("No se proporcionó token de autorización");
            currentUserEmail = "test@example.com";
        }

        // Send message
        Message message = chatService.sendMessage(currentUserEmail, requestDTO.getReceiverId(), requestDTO.getText());
        if (message == null) {
            log.error("Error sending message from {} to {}", currentUserEmail, requestDTO.getReceiverId());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error sending message");
        }

        // Convert message to DTO
        MessageDTO messageDTO = MessageDTO.builder()
                .id(message.getMessageId())
                .senderId(message.getSender().getEmail())
                .text(message.getText())
                .timestamp(message.getTimestamp())
                .build();

        return ResponseEntity.ok(messageDTO);
    }

    /**
     * Endpoint for getting messages between the current user and a contact.
     *
     * @param token     Authorization token
     * @param contactId Contact's ID to get messages with
     * @return List of messages between the users
     */
    @GetMapping("/{contactId}/messages")
    public ResponseEntity<?> getMessages(
            @RequestHeader(value="Authorization", required=false) String token,
            @PathVariable String contactId) {
        
        // Validate token and get current user
        String currentUserEmail = null;
        if (token != null) {
            currentUserEmail = sessionManager.getCurrentUserId(token);
            log.info("Token proporcionado: {}, usuario: {}", token, currentUserEmail);
        } else {
            log.warn("No se proporcionó token de autorización");
            currentUserEmail = "test@example.com";
        }

        DoublyLinkedList<Message> messages = chatService.getMessagesForChat(currentUserEmail, contactId);
        
        List<MessageDTO> messageDTOs = new ArrayList<>();
        DoublyLinkedNode<Message> current = messages.getHead();
        while (current != null) {
            Message message = current.getData();
            MessageDTO messageDTO = MessageDTO.builder()
                    .id(message.getMessageId())
                    .senderId(message.getSender().getEmail())
                    .text(message.getText())
                    .timestamp(message.getTimestamp())
                    .build();
            messageDTOs.add(messageDTO);
            current = current.getNext();
        }

        return ResponseEntity.ok(messageDTOs);
    }

    /**
     * Endpoint for getting all contacts (users with whom the current user has chats).
     *
     * @param token Authorization token
     * @return List of contacts with last message information
     */
    @GetMapping("/contacts")
    public ResponseEntity<?> getContacts(@RequestHeader(value="Authorization", required=false) String token) {
        // Validate token and get current user
        String currentUserEmail = null;
        if (token != null) {
            currentUserEmail = sessionManager.getCurrentUserId(token);
            log.info("Token proporcionado: {}, usuario: {}", token, currentUserEmail);
        } else {
            log.warn("No se proporcionó token de autorización");
            currentUserEmail = "test@example.com";
        }

        DoublyLinkedList<ChatContactDTO> contacts = chatService.getChatContactsWithLastMessage(currentUserEmail);
        
        // Convert to list for JSON serialization
        List<ChatContactDTO> contactsList = new ArrayList<>();
        DoublyLinkedNode<ChatContactDTO> current = contacts.getHead();
        while (current != null) {
            contactsList.add(current.getData());
            current = current.getNext();
        }

        return ResponseEntity.ok(contactsList);
    }
}