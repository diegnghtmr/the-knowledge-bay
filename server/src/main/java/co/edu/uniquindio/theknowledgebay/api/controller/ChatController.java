package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.api.dto.MessageDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.SendMessageRequestDTO;
import co.edu.uniquindio.theknowledgebay.core.model.Message;
import co.edu.uniquindio.theknowledgebay.core.service.ChatService;
import co.edu.uniquindio.theknowledgebay.infrastructure.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {
    private final ChatService chatService;

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@AuthenticationPrincipal AuthenticatedUser actor,
                                         @RequestBody SendMessageRequestDTO request) {
        var denied = accessDenied(actor);
        if (denied != null) return denied;

        Message message = chatService.sendMessage(actor.id(), request.getReceiverId(), request.getText());
        if (message == null) return ResponseEntity.badRequest().body("Error sending message");
        return ResponseEntity.ok(toDto(message));
    }

    @GetMapping("/{contactId}/messages")
    public ResponseEntity<?> getMessages(@AuthenticationPrincipal AuthenticatedUser actor,
                                         @PathVariable String contactId) {
        var denied = accessDenied(actor);
        if (denied != null) return denied;

        var messages = chatService.getMessagesForChat(actor.id(), contactId);
        return ResponseEntity.ok(messages.stream().map(ChatController::toDto).toList());
    }

    @GetMapping("/contacts")
    public ResponseEntity<?> getContacts(@AuthenticationPrincipal AuthenticatedUser actor) {
        var denied = accessDenied(actor);
        if (denied != null) return denied;
        return ResponseEntity.ok(chatService.getChatContactsWithLastMessage(actor.id()));
    }

    @GetMapping("/contacts/search")
    public ResponseEntity<?> searchStudents(@AuthenticationPrincipal AuthenticatedUser actor,
                                            @RequestParam(defaultValue = "") String query) {
        var denied = accessDenied(actor);
        if (denied != null) return denied;
        return ResponseEntity.ok(chatService.searchStudents(actor.id(), query));
    }

    private static ResponseEntity<Void> accessDenied(AuthenticatedUser actor) {
        if (actor == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (actor.role() != AuthenticatedUser.Role.STUDENT) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return null;
    }

    private static MessageDTO toDto(Message message) {
        return MessageDTO.builder()
                .id(message.getMessageId())
                .senderId(message.getSender().getId())
                .text(message.getText())
                .timestamp(message.getTimestamp())
                .build();
    }
}
