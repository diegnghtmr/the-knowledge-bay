package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.api.dto.CommentDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.CommentRequest;
import co.edu.uniquindio.theknowledgebay.api.dto.PostDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.StudyGroupDTO;
import co.edu.uniquindio.theknowledgebay.core.service.StudyGroupService;
import co.edu.uniquindio.theknowledgebay.infrastructure.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/studygroups")
public class StudyGroupController {
    private static final int MAX_PAGE_SIZE = 100;
    private final StudyGroupService studyGroupService;

    @GetMapping
    public ResponseEntity<List<StudyGroupDTO>> getAllGroups() {
        return ResponseEntity.ok(studyGroupService.getAllGroups());
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<StudyGroupDTO> getGroupById(@PathVariable String groupId) {
        return ResponseEntity.of(studyGroupService.getGroupById(groupId));
    }

    @GetMapping("/{groupId}/posts")
    public ResponseEntity<List<PostDTO>> getPostsByGroup(
            @AuthenticationPrincipal AuthenticatedUser actor,
            @PathVariable String groupId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (page < 0 || size < 1 || size > MAX_PAGE_SIZE) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(studyGroupService.getPostsByGroupId(groupId, actor.id(), page, size));
    }

    @PostMapping("/{groupId}/posts/{postId}/like")
    public ResponseEntity<PostDTO> likePost(@AuthenticationPrincipal AuthenticatedUser actor,
                                             @PathVariable String groupId, @PathVariable String postId) {
        return ResponseEntity.of(studyGroupService.setLike(groupId, postId, actor.id(), true));
    }

    @DeleteMapping("/{groupId}/posts/{postId}/like")
    public ResponseEntity<PostDTO> unlikePost(@AuthenticationPrincipal AuthenticatedUser actor,
                                               @PathVariable String groupId, @PathVariable String postId) {
        return ResponseEntity.of(studyGroupService.setLike(groupId, postId, actor.id(), false));
    }

    @PostMapping("/{groupId}/posts/{postId}/comments")
    public ResponseEntity<CommentDTO> addComment(@AuthenticationPrincipal AuthenticatedUser actor,
                                                  @PathVariable String groupId, @PathVariable String postId,
                                                  @RequestBody CommentRequest request) {
        String text = request.getText();
        if (text == null || text.isBlank()) return ResponseEntity.badRequest().build();
        return ResponseEntity.of(studyGroupService.addCommentToPost(groupId, postId, actor.id(), text));
    }
}
