package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.api.dto.CommentDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.PostDTO;
import co.edu.uniquindio.theknowledgebay.api.dto.StudyGroupDTO;
// Assuming CommentRequest will be a top-level DTO in the correct package
import co.edu.uniquindio.theknowledgebay.api.dto.CommentRequest;
import co.edu.uniquindio.theknowledgebay.core.service.StudyGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/studygroups")
public class StudyGroupController {

    private final StudyGroupService studyGroupService;

    @Autowired
    public StudyGroupController(StudyGroupService studyGroupService) {
        this.studyGroupService = studyGroupService;
    }

    @GetMapping
    public ResponseEntity<List<StudyGroupDTO>> getAllGroups() {
        return ResponseEntity.ok(studyGroupService.getAllGroups());
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<StudyGroupDTO> getGroupById(@PathVariable String groupId) {
        return studyGroupService.getGroupById(groupId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{groupId}/posts")
    public ResponseEntity<List<PostDTO>> getPostsByGroup(
        @PathVariable String groupId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(studyGroupService.getPostsByGroupId(groupId, page, size));
    }

    @PostMapping("/{groupId}/posts/{postId}/like")
    public ResponseEntity<PostDTO> likePost(
        @PathVariable String groupId, 
        @PathVariable String postId,
        @RequestBody Map<String, String> payload) { // Simple payload for userId
        String userId = payload.get("userId"); // In a real app, get from SecurityContext
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            return ResponseEntity.ok(studyGroupService.likePost(groupId, postId, userId));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{groupId}/posts/{postId}/comments")
    public ResponseEntity<CommentDTO> addComment(
        @PathVariable String groupId, 
        @PathVariable String postId,
        @RequestBody CommentRequest commentRequest) {
        // In a real app, authorId and authorName would come from authenticated user context
        String authorId = commentRequest.getAuthorId() != null ? commentRequest.getAuthorId() : "defaultUser";
        String authorName = commentRequest.getAuthorName() != null ? commentRequest.getAuthorName() : "Default User";
        try {
            CommentDTO newComment = studyGroupService.addCommentToPost(groupId, postId, authorId, authorName, commentRequest.getText());
            return ResponseEntity.ok(newComment);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }
    // The inner class CommentRequest has been moved to its own DTO file.
} 