package co.edu.uniquindio.theknowledgebay.core.service;

import co.edu.uniquindio.theknowledgebay.api.dto.*;
import co.edu.uniquindio.theknowledgebay.core.model.StudyGroup; // Model class
import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;
import co.edu.uniquindio.theknowledgebay.core.model.Content;
import co.edu.uniquindio.theknowledgebay.core.model.HelpRequest;
import co.edu.uniquindio.theknowledgebay.core.model.User;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import java.time.ZoneId;
import co.edu.uniquindio.theknowledgebay.core.model.Comment;
import java.time.LocalDate;

@Service
public class StudyGroupService {

    private final TheKnowledgeBay theKnowledgeBay;

    // groupPosts will store posts for groups managed by TheKnowledgeBay or manually created ones.
    // The IDs will align if groups are consistently identified (e.g., by the string ID we implemented).
    private final Map<String, List<PostDTO>> groupPosts = new ConcurrentHashMap<>();
    private final AtomicLong postCounter = new AtomicLong(); // For posts within any group
    private final AtomicLong commentCounter = new AtomicLong(); // For comments within any post
    private final AtomicLong manualGroupCounter = new AtomicLong(); // For manually created groups, if any

    @Autowired
    public StudyGroupService(TheKnowledgeBay theKnowledgeBay) {
        this.theKnowledgeBay = theKnowledgeBay;
    }

    private StudyGroupDTO mapToDTO(StudyGroup groupModel) {
        if (groupModel == null) return null;
        return new StudyGroupDTO(
                groupModel.getId(),
                groupModel.getName(),
                groupModel.getTopic() != null ? groupModel.getTopic().getName() : "Unknown",
                groupModel.getMembers() != null ? groupModel.getMembers().getSize() : 0
        );
    }

    public List<StudyGroupDTO> getAllGroups() {
        DoublyLinkedList<StudyGroup> groupsFromCore = theKnowledgeBay.getStudyGroups();
        List<StudyGroupDTO> dtos = new ArrayList<>();
        if (groupsFromCore != null) {
            for (int i = 0; i < groupsFromCore.getSize(); i++) {
                dtos.add(mapToDTO(groupsFromCore.get(i)));
            }
        }
        // If manual groups were also supported and stored elsewhere in this service, merge here.
        // For now, only showing groups from TheKnowledgeBay.
        return dtos;
    }

    public Optional<StudyGroupDTO> getGroupById(String groupId) {
        DoublyLinkedList<StudyGroup> groupsFromCore = theKnowledgeBay.getStudyGroups();
        if (groupsFromCore != null) {
            for (int i = 0; i < groupsFromCore.getSize(); i++) {
                StudyGroup groupModel = groupsFromCore.get(i);
                if (groupModel.getId().equals(groupId)) {
                    // Note: The StudyGroupDTO currently doesn't include posts.
                    // Posts are fetched via getPostsByGroupId.
                    return Optional.ofNullable(mapToDTO(groupModel));
                }
            }
        }
        return Optional.empty();
    }

    public List<PostDTO> getPostsByGroupId(String groupId, int page, int size) {
        StudyGroup groupModel = findStudyGroupModelById(groupId);
        if (groupModel == null) {
            return Collections.emptyList();
        }

        List<PostDTO> allPosts = new ArrayList<>();

        // Map associated content
        DoublyLinkedList<Content> contents = groupModel.getAssociatedContents();
        if (contents != null) {
            for (int i = 0; i < contents.getSize(); i++) {
                Content content = contents.get(i);
                if (content != null) {
                    allPosts.add(mapContentToPostDTO(content));
                }
            }
        }

        // Map associated help requests
        DoublyLinkedList<HelpRequest> helpRequests = groupModel.getAssociatedHelpRequests();
        if (helpRequests != null) {
            for (int i = 0; i < helpRequests.getSize(); i++) {
                HelpRequest hr = helpRequests.get(i);
                if (hr != null) {
                    allPosts.add(mapHelpRequestToPostDTO(hr));
                }
            }
        }
        
        // Sort all posts by timestamp (descending - most recent first)
        // Make sure PostDTO has a getTimestamp() method that returns a comparable type (e.g., String in ISO format or LocalDateTime)
        allPosts.sort((p1, p2) -> {
            LocalDateTime time1 = LocalDateTime.parse(p1.getTimestamp(), DateTimeFormatter.ISO_DATE_TIME);
            LocalDateTime time2 = LocalDateTime.parse(p2.getTimestamp(), DateTimeFormatter.ISO_DATE_TIME);
            return time2.compareTo(time1); // Descending order
        });

        // Apply pagination
        int start = page * size;
        if (start >= allPosts.size()) {
            return Collections.emptyList();
        }
        int end = Math.min(start + size, allPosts.size());
        return allPosts.subList(start, end);
    }

    // Helper method to find the StudyGroup model by ID from TheKnowledgeBay
    private StudyGroup findStudyGroupModelById(String groupId) {
        DoublyLinkedList<StudyGroup> groupsFromCore = theKnowledgeBay.getStudyGroups();
        if (groupsFromCore != null) {
            for (int i = 0; i < groupsFromCore.getSize(); i++) {
                StudyGroup groupModel = groupsFromCore.get(i);
                if (groupModel != null && groupModel.getId().equals(groupId)) {
                    return groupModel;
                }
            }
        }
        return null;
    }

    public Optional<PostDTO> getPostById(String groupId, String postId) {
        return groupPosts.getOrDefault(groupId, Collections.emptyList())
            .stream()
            .filter(p -> p.getId().equals(postId))
            .findFirst();
    }

    public PostDTO likePost(String groupId, String postId, String userId) {
        PostDTO post = getPostById(groupId, postId)
            .orElseThrow(() -> new NoSuchElementException("Post not found: " + postId + " in group " + groupId));
        
        if (post.isLikedByMe()) { 
            post.setLikes(post.getLikes() - 1);
            post.setLikedByMe(false);
        } else {
            post.setLikes(post.getLikes() + 1);
            post.setLikedByMe(true);
        }
        return post;
    }

    public CommentDTO addCommentToPost(String groupId, String postId, String authorId, String authorName, String text) {
        // Extract the actual content ID from the postId (e.g., "content-17" -> 17)
        if (postId.startsWith("content-")) {
            try {
                int contentId = Integer.parseInt(postId.substring(8)); // Remove "content-" prefix
                
                // Get the content directly from TheKnowledgeBay
                Content content = theKnowledgeBay.getContentById(contentId);
                if (content == null) {
                    throw new NoSuchElementException("Content not found: " + contentId);
                }
                
                // Get the author student
                Student author = (Student) theKnowledgeBay.getUserById(authorId);
                if (author == null) {
                    throw new NoSuchElementException("User not found: " + authorId);
                }
                
                // Create a new comment directly in the content model
                Comment newComment = Comment.builder()
                    .commentId((int) commentCounter.incrementAndGet())
                    .text(text)
                    .author(author)
                    .date(LocalDate.now())
                    .build();
                
                // Add the comment to the content's comments list
                if (content.getComments() == null) {
                    content.setComments(new DoublyLinkedList<>());
                }
                content.getComments().addLast(newComment);
                
                // Create and return the CommentDTO
                UserSummary authorSummary = new UserSummary(authorId, authorName);
                String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm, dd MMM yyyy"));
                return new CommentDTO(String.valueOf(newComment.getCommentId()), authorSummary, text, timestamp);
                
            } catch (NumberFormatException e) {
                throw new NoSuchElementException("Invalid content ID format: " + postId);
            }
        } else if (postId.startsWith("helpreq-")) {
            // Handle help request comments if needed
            throw new UnsupportedOperationException("Comments on help requests not yet implemented");
        } else {
            throw new NoSuchElementException("Unsupported post type: " + postId);
        }
    }
    
    // This method is now for MANUAL post creation by an authorized user (e.g. admin/moderator)
    // It assumes the groupId corresponds to a group that exists (either auto or manually created).
    public PostDTO createPost(String groupId, PostDTO postRequest) {
        // Check if group exists in TheKnowledgeBay
        boolean groupExists = false;
        DoublyLinkedList<StudyGroup> coreGroups = theKnowledgeBay.getStudyGroups();
        if (coreGroups != null) {
            for (int i = 0; i < coreGroups.getSize(); i++) {
                StudyGroup sg = coreGroups.get(i);
                if (sg != null && sg.getId() != null && sg.getId().equals(groupId)) {
                    groupExists = true;
                    break;
                }
            }
        }

        if (!groupExists) {
            // And if not a manually tracked group (if we had such a list here - currently we don't explicitly store manual groups in a separate list in this service for this check)
            // For now, we only check TheKnowledgeBay
            throw new NoSuchElementException("Group not found: " + groupId + " for creating post.");
        }

        String postId = "post" + postCounter.incrementAndGet();
        postRequest.setId(postId);
        postRequest.setTimestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm, dd MMM yyyy")));
        if (postRequest.getComments() == null) {
            postRequest.setComments(new ArrayList<>());
        }
        groupPosts.computeIfAbsent(groupId, k -> new ArrayList<>()).add(0, postRequest); 
        return postRequest;
    }

    // This method is for MANUAL group creation by an admin/moderator.
    // It does NOT use TheKnowledgeBay's automatic creation logic.
    // It would need to coordinate with TheKnowledgeBay if we want a unified list of all groups.
    // For now, it's a separate mechanism if ever used.
    public StudyGroupDTO createManualStudyGroup(StudyGroupDTO groupRequest) {
        String groupId = "manual-group-" + manualGroupCounter.incrementAndGet();
        groupRequest.setId(groupId); // Set the generated ID
        // How to store this? For now, it won't appear in getAllGroups unless merged.
        // This implies manual groups would need their own storage if they aren't added to TheKnowledgeBay.studyGroups
        System.out.println("Manual study group creation requested (not added to central list): " + groupRequest.getName());
        // If we wanted to add it to the central list (potentially with checks to avoid conflicts with auto-groups):
        // StudyGroup modelToCreate = new StudyGroup();
        // modelToCreate.setId(groupId);
        // modelToCreate.setName(groupRequest.getName());
        // Interest topic = theKnowledgeBay.findInterestByName(groupRequest.getInterest()); // you'd need this helper in TKB
        // modelToCreate.setTopic(topic);
        // theKnowledgeBay.getStudyGroups().addLast(modelToCreate);
        groupPosts.putIfAbsent(groupId, new ArrayList<>()); 
        return groupRequest;
    }

    private PostDTO mapContentToPostDTO(Content content) {
        if (content == null) return null;

        User authorModel = content.getAuthor();
        UserSummary authorSummary = null;
        if (authorModel != null) {
            // Create proper display name - combine firstName and lastName if available, otherwise use username
            String displayName = authorModel.getUsername(); // fallback
            if (authorModel instanceof Student) {
                Student student = (Student) authorModel;
                if (student.getFirstName() != null && student.getLastName() != null) {
                    displayName = student.getFirstName() + " " + student.getLastName();
                } else if (student.getFirstName() != null) {
                    displayName = student.getFirstName();
                }
            }
            authorSummary = new UserSummary(authorModel.getId(), displayName);
        }

        // Convert LocalDate to String timestamp (ISO_DATE_TIME format for consistency)
        // Content date is just LocalDate, add a default time (e.g., start of day)
        String timestamp = content.getDate() != null ? 
                           content.getDate().atStartOfDay(ZoneId.systemDefault()).format(DateTimeFormatter.ISO_DATE_TIME) :
                           LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME); // Fallback, should not happen

        MarkdownPostDTO dto = new MarkdownPostDTO(
            "content-" + content.getContentId(), // Prefix to distinguish from HR posts if IDs could overlap
            authorSummary,
            timestamp,
            content.getLikeCount(), // Assuming like count is directly on Content model
            content.getTitle(),
            content.getInformation() // Initial content, might be refined below
        );

        // Set actualContentType based on Content's type
        dto.setActualContentType(content.getContentType().name());

        // Parse information for URLs or filenames and refine content
        String mainInformation = content.getInformation();
        String linkUrl = null;
        String videoUrl = null;
        String fileName = null;

        if (content.getInformation() != null) {
            String[] lines = content.getInformation().split("\n");
            StringBuilder contentBody = new StringBuilder();
            for (String line : lines) {
                if (line.startsWith("Enlace: ")) {
                    linkUrl = line.substring(8).trim();
                } else if (line.startsWith("Video: ")) {
                    videoUrl = line.substring(7).trim();
                } else if (line.startsWith("Archivo adjunto: ")) {
                    fileName = line.substring(17).trim();
                } else {
                    if (contentBody.length() > 0) {
                        contentBody.append("\n");
                    }
                    contentBody.append(line);
                }
            }
            mainInformation = contentBody.toString();
        }
        
        dto.setContent(mainInformation); // Set the potentially stripped content
        dto.setVideoUrl(videoUrl);
        dto.setLinkUrl(linkUrl);
        dto.setFileName(fileName);
        
        // Map comments from Content model to DTO
        dto.setComments(mapCommentsToDTO(content.getComments()));

        return dto;
    }

    // Helper method to map comments from DoublyLinkedList<Comment> to List<CommentDTO>
    private List<CommentDTO> mapCommentsToDTO(DoublyLinkedList<Comment> comments) {
        List<CommentDTO> commentDTOs = new ArrayList<>();
        if (comments != null) {
            for (int i = 0; i < comments.getSize(); i++) {
                Comment comment = comments.get(i);
                if (comment != null) {
                    CommentDTO commentDTO = mapCommentToDTO(comment);
                    if (commentDTO != null) {
                        commentDTOs.add(commentDTO);
                    }
                }
            }
        }
        return commentDTOs;
    }
    
    // Helper method to map individual Comment to CommentDTO
    private CommentDTO mapCommentToDTO(Comment comment) {
        if (comment == null) {
            System.out.println("WARNING: Attempted to map null comment to DTO - skipping");
            return null; // Still return null, but add logging
        }
        
        Student author = comment.getAuthor();
        String displayName = "Usuario Desconocido"; // fallback
        String authorId = "unknown_user";
        
        if (author != null) {
            authorId = author.getId();
            // Create proper display name - combine firstName and lastName if available, otherwise use username
            if (author.getFirstName() != null && author.getLastName() != null) {
                displayName = author.getFirstName() + " " + author.getLastName();
            } else if (author.getFirstName() != null) {
                displayName = author.getFirstName();
            } else if (author.getUsername() != null) {
                displayName = author.getUsername();
            }
        }
        
        UserSummary authorSummary = new UserSummary(authorId, displayName);
        
        String timestamp = comment.getDate() != null ? 
                          comment.getDate().atStartOfDay(ZoneId.systemDefault()).format(DateTimeFormatter.ofPattern("HH:mm, dd MMM yyyy")) :
                          LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm, dd MMM yyyy"));
        
        // Ensure commentId is valid (commentId is primitive int, so cannot be null)
        String commentIdStr = String.valueOf(comment.getCommentId());
        
        // Ensure text is not null
        String commentText = comment.getText() != null ? comment.getText() : "";
        
        return new CommentDTO(
            commentIdStr,
            authorSummary,
            commentText,
            timestamp
        );
    }

    private PostDTO mapHelpRequestToPostDTO(HelpRequest helpRequest) {
        if (helpRequest == null) return null;

        Student authorModel = helpRequest.getStudent();
        String displayName = "Unknown Student"; // fallback
        String authorId = "unknown_student";
        
        if (authorModel != null) {
            authorId = authorModel.getId();
            // Create proper display name - combine firstName and lastName if available, otherwise use username
            if (authorModel.getFirstName() != null && authorModel.getLastName() != null) {
                displayName = authorModel.getFirstName() + " " + authorModel.getLastName();
            } else if (authorModel.getFirstName() != null) {
                displayName = authorModel.getFirstName();
            } else {
                displayName = authorModel.getUsername();
            }
        }
        
        UserSummary authorSummary = new UserSummary(authorId, displayName);

        HelpRequestPostDTO postDTO = new HelpRequestPostDTO();
        postDTO.setId("helpreq-" + helpRequest.getRequestId());
        postDTO.setType("helprequest");
        postDTO.setAuthor(authorSummary);
        // Constructing a title for the help request for display uniformity
        String title = "Solicitud de Ayuda";
        if (helpRequest.getTopics() != null && !helpRequest.getTopics().isEmpty() && helpRequest.getTopics().get(0) != null) {
            title += ": " + helpRequest.getTopics().get(0).getName();
        }
        postDTO.setQuestion(title); // Using question field for the main title/topic of help request
        postDTO.setDetails(helpRequest.getInformation());
        postDTO.setUrgency(helpRequest.getUrgency().name()); // Now using the added urgency field
        postDTO.setTimestamp(helpRequest.getRequestDate().atStartOfDay(ZoneId.systemDefault()).format(DateTimeFormatter.ISO_DATE_TIME));
        
        // Map comments from HelpRequest model to DTO
        postDTO.setComments(mapCommentsToDTO(helpRequest.getComments()));
        
        return postDTO;
    }
} 