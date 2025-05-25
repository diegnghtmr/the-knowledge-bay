package co.edu.uniquindio.theknowledgebay.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsDataDTO {
    private List<TopicActivityDTO> topicActivity;
    private List<ParticipationLevelDTO> participationLevels;
    private List<CommunityClusterDTO> communityClusters;
}