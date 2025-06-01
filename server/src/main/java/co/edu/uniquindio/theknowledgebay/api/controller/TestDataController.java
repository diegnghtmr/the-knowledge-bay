package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.core.service.TestDataLoaderService;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test-data")
public class TestDataController {

    private final TestDataLoaderService testDataLoaderService;
    private final TheKnowledgeBay theKnowledgeBay;

    public TestDataController(TestDataLoaderService testDataLoaderService, TheKnowledgeBay theKnowledgeBay) {
        this.testDataLoaderService = testDataLoaderService;
        this.theKnowledgeBay = theKnowledgeBay;
    }

    @PostMapping("/load")
    public ResponseEntity<String> loadTestData() {
        try {
            testDataLoaderService.loadComprehensiveTestData();
            return ResponseEntity.ok("Test data loaded successfully.");
        } catch (Exception e) {
            e.printStackTrace(); // Log the exception
            return ResponseEntity.internalServerError().body("Failed to load test data: " + e.getMessage());
        }
    }
    
    @GetMapping("/chats-status")
    public ResponseEntity<String> getChatsStatus() {
        try {
            int chatCount = theKnowledgeBay.getChats().getSize();
            if (chatCount > 0) {
                StringBuilder response = new StringBuilder();
                response.append("Chats encontrados: ").append(chatCount).append("\n");
                
                for (int i = 0; i < chatCount; i++) {
                    var chat = theKnowledgeBay.getChats().get(i);
                    response.append("Chat ").append(i + 1).append(": ")
                            .append(chat.getStudentA().getUsername()).append(" <-> ")
                            .append(chat.getStudentB().getUsername()).append(" (")
                            .append(chat.getMessages().getSize()).append(" mensajes)\n");
                }
                
                return ResponseEntity.ok(response.toString());
            } else {
                return ResponseEntity.ok("No se encontraron chats.");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error checking chats: " + e.getMessage());
        }
    }
} 