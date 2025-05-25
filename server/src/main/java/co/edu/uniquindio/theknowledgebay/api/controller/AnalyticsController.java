package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.service.SessionManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final TheKnowledgeBay theKnowledgeBay;
    private final SessionManager sessionManager;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getAnalyticsDashboard(
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            // For development, allow access without strict authentication
            String currentUserId = sessionManager.getCurrentUserId(token);
            if (currentUserId == null) {
                currentUserId = "admin"; // Default admin user for development
            }

            Map<String, Object> analyticsData = theKnowledgeBay.getFullAnalyticsData();
            return ResponseEntity.ok(analyticsData);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/topic-activity")
    public ResponseEntity<List<Map<String, Object>>> getTopicActivity(
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            List<Map<String, Object>> topicActivity = theKnowledgeBay.getTopicActivityData();
            return ResponseEntity.ok(topicActivity);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/participation-levels")
    public ResponseEntity<List<Map<String, Object>>> getParticipationLevels(
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            List<Map<String, Object>> participationLevels = theKnowledgeBay.getParticipationLevelsData();
            return ResponseEntity.ok(participationLevels);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/community-detection")
    public ResponseEntity<List<Map<String, Object>>> getCommunityDetection(
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            List<Map<String, Object>> communityData = theKnowledgeBay.getCommunityDetectionData();
            return ResponseEntity.ok(communityData);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}