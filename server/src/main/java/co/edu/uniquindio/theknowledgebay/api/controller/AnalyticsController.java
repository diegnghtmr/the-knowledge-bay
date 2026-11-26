package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.api.config.ApiFailure;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/analytics")
public class AnalyticsController {
    private final TheKnowledgeBay theKnowledgeBay;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getAnalyticsDashboard() {
        return read("analytics.dashboard", theKnowledgeBay::getFullAnalyticsData);
    }

    @GetMapping("/topic-activity")
    public ResponseEntity<List<Map<String, Object>>> getTopicActivity() {
        return read("analytics.topicActivity", theKnowledgeBay::getTopicActivityData);
    }

    @GetMapping("/participation-levels")
    public ResponseEntity<List<Map<String, Object>>> getParticipationLevels() {
        return read("analytics.participation", theKnowledgeBay::getParticipationLevelsData);
    }

    @GetMapping("/community-detection")
    public ResponseEntity<List<Map<String, Object>>> getCommunityDetection() {
        return read("analytics.community", theKnowledgeBay::getCommunityDetectionData);
    }

    private static <T> ResponseEntity<T> read(String operation, Supplier<T> data) {
        try {
            return ResponseEntity.ok(data.get());
        } catch (RuntimeException e) {
            ApiFailure.report(operation);
            return ResponseEntity.internalServerError().build();
        }
    }
}
