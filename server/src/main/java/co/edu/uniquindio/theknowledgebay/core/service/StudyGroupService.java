package co.edu.uniquindio.theknowledgebay.core.service;

import co.edu.uniquindio.theknowledgebay.api.dto.*;
import co.edu.uniquindio.theknowledgebay.core.model.Comment;
import co.edu.uniquindio.theknowledgebay.core.model.Content;
import co.edu.uniquindio.theknowledgebay.core.model.HelpRequest;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.model.StudyGroup;
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.model.User;
import co.edu.uniquindio.theknowledgebay.core.repository.DomainRepository.PostKind;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class StudyGroupService {
    private static final DateTimeFormatter COMMENT_TIME = DateTimeFormatter.ofPattern("HH:mm, dd MMM yyyy");
    private final TheKnowledgeBay theKnowledgeBay;

    public List<StudyGroupDTO> getAllGroups() {
        return StreamSupport.stream(theKnowledgeBay.getStudyGroups().spliterator(), false)
                .map(StudyGroupService::groupDto).toList();
    }

    public Optional<StudyGroupDTO> getGroupById(String groupId) {
        return findGroup(groupId).map(StudyGroupService::groupDto);
    }

    public List<PostDTO> getPostsByGroupId(String groupId, String actorId, int page, int size) {
        var group = findGroup(groupId);
        if (group.isEmpty()) return List.of();

        List<PostDTO> posts = new ArrayList<>();
        group.get().getAssociatedContents().forEach(content -> posts.add(contentPost(content, actorId)));
        group.get().getAssociatedHelpRequests().forEach(request -> posts.add(helpPost(request)));
        posts.sort(Comparator.<PostDTO, LocalDateTime>comparing(post ->
                LocalDateTime.parse(post.getTimestamp(), DateTimeFormatter.ISO_DATE_TIME)).reversed());

        long offset = (long) page * size;
        if (offset >= posts.size()) return List.of();
        return posts.subList((int) offset, (int) Math.min(offset + size, posts.size()));
    }

    public Optional<PostDTO> setLike(String groupId, String postId, String actorId, boolean liked) {
        var key = PostKey.parse(postId);
        if (key.isEmpty() || key.get().kind() != PostKind.CONTENT) return Optional.empty();
        int id = key.get().id();
        var original = theKnowledgeBay.getContentById(id);
        if (original == null || (liked && original.getAuthor() != null && actorId.equals(original.getAuthor().getId()))
                || !theKnowledgeBay.setGroupContentLike(groupId, id, actorId, liked)) return Optional.empty();
        return Optional.ofNullable(theKnowledgeBay.getContentById(id)).map(content -> contentPost(content, actorId));
    }

    public Optional<CommentDTO> addCommentToPost(String groupId, String postId, String actorId, String text) {
        return PostKey.parse(postId)
                .map(key -> theKnowledgeBay.addGroupComment(groupId, key.kind(), key.id(), actorId, text))
                .map(StudyGroupService::commentDto);
    }

    private Optional<StudyGroup> findGroup(String groupId) {
        return StreamSupport.stream(theKnowledgeBay.getStudyGroups().spliterator(), false)
                .filter(group -> groupId.equals(group.getId())).findFirst();
    }

    private static StudyGroupDTO groupDto(StudyGroup group) {
        return new StudyGroupDTO(group.getId(), group.getName(),
                group.getTopic() != null ? group.getTopic().getName() : "Unknown", group.getMembers().getSize());
    }

    private static PostDTO contentPost(Content content, String actorId) {
        User author = content.getAuthor();
        var dto = new MarkdownPostDTO("content-" + content.getContentId(),
                author == null ? null : new UserSummary(author.getId(), displayName(author)),
                timestamp(content.getDate(), DateTimeFormatter.ISO_DATE_TIME), content.getLikeCount(),
                content.getTitle(), content.getInformation());
        dto.setActualContentType(content.getContentType().name());
        if (content.getInformation() != null) {
            StringBuilder body = new StringBuilder();
            for (String line : content.getInformation().split("\n")) {
                if (line.startsWith("Enlace: ")) dto.setLinkUrl(line.substring(8).trim());
                else if (line.startsWith("Video: ")) dto.setVideoUrl(line.substring(7).trim());
                else if (line.startsWith("Archivo adjunto: ")) dto.setFileName(line.substring(17).trim());
                else {
                    if (!body.isEmpty()) body.append('\n');
                    body.append(line);
                }
            }
            dto.setContent(body.toString());
        }
        dto.setComments(commentsDto(content.getComments()));
        if (content.getLikedBy() != null) {
            dto.setLikedByMe(StreamSupport.stream(content.getLikedBy().spliterator(), false)
                    .anyMatch(student -> actorId.equals(student.getId())));
        }
        return dto;
    }

    private static PostDTO helpPost(HelpRequest request) {
        var dto = new HelpRequestPostDTO();
        dto.setId("helpreq-" + request.getRequestId());
        dto.setType("helprequest");
        var author = request.getStudent();
        dto.setAuthor(author == null ? new UserSummary("unknown_student", "Unknown Student")
                : new UserSummary(author.getId(), displayName(author)));
        var topics = request.getTopics();
        dto.setQuestion(topics == null || topics.isEmpty() ? "Solicitud de Ayuda"
                : "Solicitud de Ayuda: " + topics.get(0).getName());
        dto.setDetails(request.getInformation());
        dto.setUrgency(request.getUrgency().name());
        dto.setTimestamp(timestamp(request.getRequestDate(), DateTimeFormatter.ISO_DATE_TIME));
        dto.setComments(commentsDto(request.getComments()));
        return dto;
    }

    private static List<CommentDTO> commentsDto(Iterable<Comment> comments) {
        if (comments == null) return List.of();
        return StreamSupport.stream(comments.spliterator(), false).map(StudyGroupService::commentDto).toList();
    }

    private static CommentDTO commentDto(Comment comment) {
        var author = comment.getAuthor();
        var summary = author == null ? new UserSummary("unknown_user", "Usuario Desconocido")
                : new UserSummary(author.getId(), displayName(author));
        return new CommentDTO(Integer.toString(comment.getCommentId()), summary,
                comment.getText() == null ? "" : comment.getText(), timestamp(comment.getDate(), COMMENT_TIME));
    }

    private static String displayName(User author) {
        if (author instanceof Student student) {
            String first = student.getFirstName() == null ? "" : student.getFirstName();
            String last = student.getLastName() == null ? "" : student.getLastName();
            String fullName = (first + " " + last).strip();
            if (!fullName.isEmpty()) return fullName;
        }
        return author.getUsername();
    }

    private static String timestamp(LocalDate date, DateTimeFormatter format) {
        return date == null ? LocalDateTime.now().format(format) : date.atStartOfDay(ZoneId.systemDefault()).format(format);
    }

    private record PostKey(PostKind kind, int id) {
        private static Optional<PostKey> parse(String key) {
            try {
                if (key.startsWith("content-")) return Optional.of(new PostKey(PostKind.CONTENT, Integer.parseInt(key.substring(8))));
                if (key.startsWith("helpreq-")) return Optional.of(new PostKey(PostKind.HELP, Integer.parseInt(key.substring(8))));
            } catch (NumberFormatException ignored) {
                // A malformed post ID cannot refer to a group post.
            }
            return Optional.empty();
        }
    }
}
