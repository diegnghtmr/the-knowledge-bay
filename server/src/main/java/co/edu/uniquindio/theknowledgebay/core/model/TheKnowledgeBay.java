package co.edu.uniquindio.theknowledgebay.core.model;

import co.edu.uniquindio.theknowledgebay.api.dto.*;
import co.edu.uniquindio.theknowledgebay.api.dto.ProfileResponseDTO;
import co.edu.uniquindio.theknowledgebay.core.model.enums.ContentType;
import co.edu.uniquindio.theknowledgebay.core.model.enums.Urgency;
import co.edu.uniquindio.theknowledgebay.core.factory.UserFactory;
import co.edu.uniquindio.theknowledgebay.core.repository.InterestRepository;
import co.edu.uniquindio.theknowledgebay.core.repository.StudentRepository;
import co.edu.uniquindio.theknowledgebay.infrastructure.config.ModeratorProperties;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.converter.ListToDoublyLinkedList;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.converter.StringListToInterests;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.DoublyLinkedNode;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.queues.PriorityQueue;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.trees.BinarySearchTree;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.graphs.UndirectedGraph;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.GraphVertex;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.Edge;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Scope;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Getter
@Component
@Scope(ConfigurableBeanFactory.SCOPE_SINGLETON)
public class TheKnowledgeBay {

    private static int nextContentId = 1; // Start IDs from 1

    // DataBase connection
    private final StudentRepository studentRepository;
    private final InterestRepository interestRepository;

    // Data storage
    private final UserFactory users = UserFactory.getInstance();
    private BinarySearchTree<Content> contentTree;
    private PriorityQueue<HelpRequest> helpRequestQueue;
    @Getter
    private final DoublyLinkedList<StudyGroup> studyGroups = new DoublyLinkedList<>();
    @Getter
    private final DoublyLinkedList<Chat> chats = new DoublyLinkedList<>();
    private final DoublyLinkedList<Comment> comments = new DoublyLinkedList<>();
    private final DoublyLinkedList<Message> messages = new DoublyLinkedList<>();
    private final DoublyLinkedList<Interest> interests = new DoublyLinkedList<>();
    private UndirectedGraph<String> affinityGraph;

    // Dependencies for Moderator loading
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private ModeratorProperties props;

    @Autowired
    public TheKnowledgeBay(StudentRepository studentRepository, InterestRepository interestRepository) {
        this.studentRepository = studentRepository;
        this.interestRepository = interestRepository;
    }

    public void addStudent(Student student) {
        users.add(student);
        // Comentar temporalmente para datos de prueba para evitar problemas con la DB
        // studentRepository.save(student);
    }

    public boolean addContent(Content content) {
        try {
            if (contentTree == null) {
                contentTree = new BinarySearchTree<>();
            }
            
            // Generate a unique ID for the content
            content.setContentId(generateContentId());
            
            contentTree.insert(content);

            // Associate content with study groups based on topics (Moved from createContent)
            if (content.getTopics() != null && !content.getTopics().isEmpty()) {
                for (int i = 0; i < content.getTopics().getSize(); i++) {
                    Interest topic = content.getTopics().get(i);
                    if (topic != null && topic.getName() != null) {
                        StudyGroup relevantGroup = findStudyGroupByInterestName(topic.getName());
                        if (relevantGroup != null) {
                            if (relevantGroup.getAssociatedContents() == null) {
                                relevantGroup.setAssociatedContents(new DoublyLinkedList<>());
                            }
                            // Ensure content is not added multiple times if logic is ever re-run or content has duplicate topics mapping to same group
                            if (!relevantGroup.getAssociatedContents().contains(content)) { 
                                relevantGroup.getAssociatedContents().addLast(content);
                                System.out.println("Content '" + content.getTitle() + "' with ID '" + content.getContentId() + "' associated with group: " + relevantGroup.getName());
                            }
                        }
                    }
                }
            }
            return true;
        } catch (Exception e) {
            System.err.println("Error adding content: " + e.getMessage());
            return false;
        }
    }

    public DoublyLinkedList<Content> getAllContent() {
        DoublyLinkedList<Content> result = new DoublyLinkedList<>();
        
        if (contentTree == null || contentTree.isEmpty()) {
            return result;
        }
        
        // Perform in-order traversal to get all content
        contentTree.inOrderTraversal(result);
        
        return result;
    }

    public Content getContentById(int id) {
        if (contentTree == null || contentTree.isEmpty()) {
            return null;
        }
        
        // Create a dummy content with the ID for searching
        Content searchContent = Content.builder().contentId(id).build();
        return contentTree.search(searchContent);
    }

    public boolean updateContent(int contentId, ContentResponseDTO updatedContentDTO) {
        if (contentTree == null) {
            return false; // No content to update
        }

        // Create a dummy content object with the ID to find the existing content
        Content contentToFind = Content.builder().contentId(contentId).build();
        Content existingContent = contentTree.search(contentToFind);

        if (existingContent == null) {
            return false; // Content not found
        }

        // Create a new Content object with updated information
        // We keep the original author and date, as these typically don't change on admin edit
        Content updatedContent = Content.builder()
                .contentId(existingContent.getContentId()) // Keep original ID
                .title(updatedContentDTO.getTitle() != null ? updatedContentDTO.getTitle() : existingContent.getTitle())
                .contentType(updatedContentDTO.getContentType() != null ? ContentType.valueOf(updatedContentDTO.getContentType().toUpperCase()) : existingContent.getContentType())
                .information(updatedContentDTO.getInformation() != null ? updatedContentDTO.getInformation() : existingContent.getInformation())
                .author(existingContent.getAuthor()) // Keep original author
                .likedBy(existingContent.getLikedBy()) // Keep original likes
                .likeCount(existingContent.getLikeCount()) // Keep original like count
                .comments(existingContent.getComments()) // Keep original comments
                .date(existingContent.getDate()) // Keep original date
                .build();
        
        // Topics are not directly editable in this DTO, so we keep existing ones
        // If topic editing is needed, the DTO and this logic would need adjustment
        updatedContent.setTopics(existingContent.getTopics());

        // Remove the old content and insert the updated one
        // This is safer for BSTs if the updated fields affect comparison
        boolean removed = contentTree.removeAndCheck(existingContent);
        if (removed) {
            contentTree.insert(updatedContent);
            return true;
        } else {
            // This case should ideally not happen if search found the content
            return false; 
        }
    }

    public boolean likeContent(int contentId, String userId) {
        Content content = getContentById(contentId);
        if (content == null) {
            return false;
        }
        
        Student user = (Student) getUserById(userId);
        if (user == null) {
            return false;
        }
        
        // Check if user already liked this content
        if (content.getLikedBy() != null) {
            for (int i = 0; i < content.getLikedBy().getSize(); i++) {
                if (content.getLikedBy().get(i).getId().equals(userId)) {
                    return false; // Already liked
                }
            }
        } else {
            content.setLikedBy(new DoublyLinkedList<>());
        }
        
        // Add like
        content.getLikedBy().addLast(user);
        content.setLikeCount(content.getLikeCount() + 1);
        
        return true;
    }

    public boolean unlikeContent(int contentId, String userId) {
        Content content = getContentById(contentId);
        if (content == null || content.getLikedBy() == null) {
            return false;
        }
        
        // Find and remove the user from liked list
        for (int i = 0; i < content.getLikedBy().getSize(); i++) {
            if (content.getLikedBy().get(i).getId().equals(userId)) {
                content.getLikedBy().removeAt(i);
                content.setLikeCount(content.getLikeCount() - 1);
                return true;
            }
        }
        
        return false; // User hadn't liked this content
    }

    // Statistics methods
    public int getContentCountByUserId(String userId) {
        int count = 0;
        if (contentTree == null || contentTree.isEmpty() || userId == null) {
            return count;
        }
        
        DoublyLinkedList<Content> allContent = getAllContent();
        for (int i = 0; i < allContent.getSize(); i++) {
            Content content = allContent.get(i);
            if (content != null && content.getAuthor() != null && 
                content.getAuthor().getId() != null && 
                content.getAuthor().getId().equals(userId)) {
                count++;
            }
        }
        return count;
    }

    public int getHelpRequestCountByUserId(String userId) {
        int count = 0;
        System.out.println("TheKnowledgeBay - Contando solicitudes para userId: " + userId);
        
        if (helpRequestQueue == null || helpRequestQueue.isEmpty() || userId == null) {
            System.out.println("TheKnowledgeBay - Cola vacía o userId nulo");
            return count;
        }
        
        DoublyLinkedList<HelpRequest> allRequests = getAllHelpRequests();
        System.out.println("TheKnowledgeBay - Total de solicitudes en cola: " + allRequests.getSize());
        
        for (int i = 0; i < allRequests.getSize(); i++) {
            HelpRequest request = allRequests.get(i);
            if (request != null && request.getStudent() != null) {
                String studentId = request.getStudent().getId();
                System.out.println("TheKnowledgeBay - Solicitud " + i + " - StudentId: '" + studentId + "', buscando: '" + userId + "'");
                
                if (studentId != null && studentId.equals(userId)) {
                    count++;
                    System.out.println("TheKnowledgeBay - ¡Coincidencia encontrada! Count: " + count);
                }
            } else {
                System.out.println("TheKnowledgeBay - Solicitud " + i + " - request o student es null");
            }
        }
        
        System.out.println("TheKnowledgeBay - Total de solicitudes para el usuario: " + count);
        return count;
    }

    // Delete operations
    public boolean deleteContent(int contentId) {
        try {
            if (contentTree == null || contentTree.isEmpty()) {
                return false;
            }
            
            // Create a dummy content with the ID for searching
            Content searchContent = Content.builder().contentId(contentId).build();
            Content found = contentTree.search(searchContent);
            
            if (found != null) {
                contentTree.remove(found);
                return true;
            }
            
            return false;
        } catch (Exception e) {
            System.err.println("Error deleting content: " + e.getMessage());
            return false;
        }
    }

    public boolean deleteHelpRequest(int requestId) {
        try {
            if (helpRequestQueue == null || helpRequestQueue.isEmpty()) {
                return false;
            }
            
            PriorityQueue<HelpRequest> tempQueue = new PriorityQueue<>();
            boolean found = false;
            
            // Search for the request and exclude it from the temp queue
            while (!helpRequestQueue.isEmpty()) {
                HelpRequest request = helpRequestQueue.dequeue();
                if (request.getRequestId() != requestId) {
                    tempQueue.insert(request);
                } else {
                    found = true;
                }
            }
            
            // Restore the queue without the deleted request
            while (!tempQueue.isEmpty()) {
                helpRequestQueue.insert(tempQueue.dequeue());
            }
            
            return found;
        } catch (Exception e) {
            System.err.println("Error deleting help request: " + e.getMessage());
            return false;
        }
    }

    // Helper methods for ID generation
    private int generateHelpRequestId() {
        // Simple ID generation based on current timestamp
        return (int) (System.currentTimeMillis() % Integer.MAX_VALUE);
    }

    private int generateContentId() {
        return nextContentId++; // Use static counter
    }

    public void createAutomaticGroups() {
        // TODO: implement functionality
    }

    // New method: Find a study group by interest name
    private StudyGroup findStudyGroupByInterestName(String interestName) {
        if (interestName == null || interestName.trim().isEmpty()) {
            return null;
        }
        for (int i = 0; i < studyGroups.getSize(); i++) {
            StudyGroup group = studyGroups.get(i);
            if (group.getTopic() != null && interestName.equals(group.getTopic().getName())) {
                return group;
            }
        }
        return null;
    }

    // New method: Generate a unique ID for a study group based on interest
    private String generateStudyGroupId(Interest interest) {
        if (interest == null || interest.getName() == null) {
            return "group_unknown_" + System.currentTimeMillis();
        }
        return interest.getName().toLowerCase().replaceAll("\\s+", "-") + "-group";
    }
    
    // New method: Orchestrates automatic study group creation/joining for a student
    public void updateAutomaticStudyGroupsForStudent(Student student) {
        System.out.println("=== updateAutomaticStudyGroupsForStudent para: " + student.getUsername() + " (ID: " + student.getId() + ") ===");
        
        if (student == null || student.getInterests() == null || student.getInterests().isEmpty()) {
            System.out.println("Estudiante es null o no tiene intereses. Saltando...");
            return;
        }

        DoublyLinkedList<Interest> studentInterests = student.getInterests();
        System.out.println("Estudiante tiene " + studentInterests.getSize() + " intereses");
        
        for (int i = 0; i < studentInterests.getSize(); i++) {
            Interest currentInterest = studentInterests.get(i);
            if (currentInterest == null || currentInterest.getName() == null) {
                System.out.println("Interés " + i + " es null o sin nombre. Saltando...");
                continue;
            }

            System.out.println("Procesando interés: " + currentInterest.getName());
            StudyGroup existingGroup = findStudyGroupByInterestName(currentInterest.getName());

            if (existingGroup != null) {
                System.out.println("Grupo existente encontrado: " + existingGroup.getName());
                // Group already exists, add student if not already a member
                if (!existingGroup.getMembers().contains(student)) {
                    existingGroup.addStudent(student);
                    System.out.println("Estudiante agregado al grupo existente");
                }
                if (student.getStudyGroups() == null) { // Defensive check
                    student.setStudyGroups(new DoublyLinkedList<>());
                }
                if (!student.getStudyGroups().contains(existingGroup)) {
                    student.getStudyGroups().addLast(existingGroup);
                    System.out.println("Grupo agregado a la lista del estudiante");
                }
            } else {
                System.out.println("No existe grupo para el interés: " + currentInterest.getName() + ". Verificando si crear uno nuevo...");
                // Group does not exist, check if we need to create one
                DoublyLinkedList<Student> allStudents = users.getStudents();
                System.out.println("Total de estudiantes en el sistema: " + allStudents.getSize());
                
                DoublyLinkedList<Student> interestedStudentsInThisTopic = new DoublyLinkedList<>();

                for (int j = 0; j < allStudents.getSize(); j++) {
                    Student s = allStudents.get(j);
                    System.out.println("Verificando estudiante: " + s.getUsername() + " (ID: " + s.getId() + ")");
                    
                    if (s.getInterests() != null) {
                        System.out.println("  - Tiene " + s.getInterests().getSize() + " intereses");
                        for (int k = 0; k < s.getInterests().getSize(); k++) {
                            Interest si = s.getInterests().get(k);
                            if (si != null && currentInterest.getName().equals(si.getName())) {
                                System.out.println("  - ¡Coincidencia de interés encontrada! " + si.getName());
                                // Check if this student is already in a group for this interest.
                                // This prevents counting them again if they removed and re-added the interest.
                                boolean alreadyInAGroupForThisInterest = false;
                                if (s.getStudyGroups() != null) {
                                    for(int l=0; l < s.getStudyGroups().getSize(); l++) {
                                        StudyGroup sg = s.getStudyGroups().get(l);
                                        if (sg.getTopic() != null && currentInterest.getName().equals(sg.getTopic().getName())) {
                                            alreadyInAGroupForThisInterest = true;
                                            System.out.println("  - Estudiante ya está en un grupo para este interés");
                                            break;
                                        }
                                    }
                                }
                                if (!alreadyInAGroupForThisInterest) {
                                    interestedStudentsInThisTopic.addLast(s);
                                    System.out.println("  - Estudiante agregado a la lista de interesados");
                                }
                                break; // Student has the interest, no need to check their other interests
                            }
                        }
                    } else {
                        System.out.println("  - No tiene intereses");
                    }
                }
                
                System.out.println("Estudiantes interesados en '" + currentInterest.getName() + "': " + interestedStudentsInThisTopic.getSize());
                
                if (interestedStudentsInThisTopic.getSize() >= 2) {
                    System.out.println("Creando nuevo grupo para el interés: " + currentInterest.getName());
                    // Create new group
                    String newGroupId = generateStudyGroupId(currentInterest);
                    String newGroupName = "Grupo de " + currentInterest.getName();
                    StudyGroup newGroup = StudyGroup.builder()
                            .id(newGroupId)
                            .name(newGroupName)
                            .topic(currentInterest)
                            .hidden(false) // Or based on some logic
                            .build(); // members, associatedContents, etc., will use @Builder.Default

                    // Add all qualifying students to this new group
                    for (int j = 0; j < interestedStudentsInThisTopic.getSize(); j++) {
                        Student member = interestedStudentsInThisTopic.get(j);
                        newGroup.addStudent(member); // addStudent handles duplicates
                        if (member.getStudyGroups() == null) { // Defensive
                            member.setStudyGroups(new DoublyLinkedList<>());
                        }
                         if (!member.getStudyGroups().contains(newGroup)) {
                            member.getStudyGroups().addLast(newGroup);
                        }
                        System.out.println("Miembro agregado al nuevo grupo: " + member.getUsername());
                    }
                    
                    // Also ensure the student who triggered the update is in the group
                    // (if they weren't caught by the interestedStudentsInThisTopic loop due to timing)
                     if (!newGroup.getMembers().contains(student)) {
                        newGroup.addStudent(student);
                        System.out.println("Estudiante que triggereó la actualización agregado al grupo");
                    }
                    if (student.getStudyGroups() == null) { student.setStudyGroups(new DoublyLinkedList<>());} // Defensive
                    if (!student.getStudyGroups().contains(newGroup)) {
                         student.getStudyGroups().addLast(newGroup);
                         System.out.println("Nuevo grupo agregado a la lista del estudiante");
                    }

                    this.studyGroups.addLast(newGroup);
                    System.out.println("Nuevo grupo creado: " + newGroup.getName() + " con " + newGroup.getMembers().getSize() + " miembros.");
                } else {
                    System.out.println("No se puede crear grupo para '" + currentInterest.getName() + "'. Solo " + interestedStudentsInThisTopic.getSize() + " estudiantes interesados (se necesitan al menos 2)");
                }
            }
        }
        System.out.println("=== Fin de updateAutomaticStudyGroupsForStudent para: " + student.getUsername() + " ===\n");
    }

    public DoublyLinkedList<Student> findShortestPath(Student s1, Student s2) {
        // TODO: implement functionality
        return null;
    }

    public void processHelpRequests() {
        // TODO: implement functionality
    }

    @PostConstruct
    public void initialize() {
        // Initialize moderator
        String password = passwordEncoder.encode(props.password());
        users.setModerator(props, password);
        
        // Asignar un ID al moderador (usando su email como ID)
        Moderator mod = users.getModerator();
        if (mod.getId() == null) {
            mod.setId(mod.getEmail());
            System.out.println("ID del moderador establecido a: " + mod.getId());
        }

        // Initialize students
        List<Student> students = studentRepository.findAll();
        for (Student student : students) {
            this.users.add(student);
        }

        // Initialize interests
        List<Interest> interests = interestRepository.findAll();
        for (Interest interest : interests) {
            this.interests.addLast(interest);
        }
        
        // Initialize affinity graph
        System.out.println("Initializing affinity graph...");
        initializeAffinityGraph();
        System.out.println("Affinity graph initialized with " + interests.size() + " interests");
    }

    public void updateData() {
        this.users.clear();

        // Initialize students
        List<Student> students = studentRepository.findAll();
        for (Student student : students) {
            this.users.add(student);
        }

        // Initialize interests
        List<Interest> interests = interestRepository.findAll();
        for (Interest interest : interests) {
            this.interests.addLast(interest);
        }
    }


    public User findOrCreateUserByEmail(String email) {
        System.out.println("Buscando usuario con email: " + email);
        
        // Primero buscar al moderador
        Moderator mod = users.getModerator();
        if (mod.getEmail() != null && mod.getEmail().equals(email)) {
            System.out.println("Usuario encontrado (moderador): " + email);
            return mod;
        }
        
        // Buscar en los estudiantes
        DoublyLinkedNode<Student> current = users.getStudents().getHead();
        while (current != null) {
            Student s = current.getData();
            if (s.getEmail() != null && s.getEmail().equals(email)) {
                System.out.println("Usuario encontrado (estudiante): " + email);
                // Asegurar que el estudiante tenga un ID asignado
                if (s.getId() == null) {
                    s.setId(email);
                    System.out.println("ID asignado al estudiante existente: " + email);
                }
                return s;
            }
            current = current.getNext();
        }
        
        // Si no se encuentra, crear un nuevo estudiante
        System.out.println("Usuario no encontrado, creando nuevo estudiante con email: " + email);
        Student newStudent = Student.builder()
                .id(email) // Usar el email como ID
                .email(email)
                .username(email.split("@")[0])  // Usar la parte antes de @ como nombre de usuario
                .password("defaultPassword")    // Contraseña por defecto
                .firstName("")
                .lastName("")
                .dateBirth(LocalDate.of(1900, 1, 1))
                .biography("[Tu biografía aquí]")
                .build();
        
        addStudent(newStudent);
        System.out.println("Nuevo estudiante creado con ID: " + newStudent.getId());
        return newStudent;
    }
    

    private String generateNewStudentId() {
        // Generar un ID único basado en timestamp
        return "user_" + System.currentTimeMillis();
    }


    public User getUserById(String userId) {
        // Buscar al moderador
        Moderator mod = users.getModerator();
        if (mod.getId() != null && mod.getId().equals(userId)) {
            return mod;
        }
        
        DoublyLinkedNode<Student> current = users.getStudents().getHead();
        while (current != null) {
            Student s = current.getData();
            if (s.getId() != null && s.getId().equals(userId)) {
                if (s.getBiography() == null || s.getBiography().isEmpty()) {
                    s.setBiography("[Tu biografía aquí]");
                }
                if (s.getDateBirth() == null) {
                    s.setDateBirth(LocalDate.of(1900, 1, 1));
                }
                return s;
            }
            current = current.getNext();
        }
            
        if (userId.contains("@")) {
            return findOrCreateUserByEmail(userId);
        }
        
        return null;
    }

    public boolean updateStudent(String userId, ProfileResponseDTO updatedUser) {
        Student studentToUpdate = (Student) getUserById(userId);

        if (studentToUpdate == null) {
            return false; // User not found
        }

        // Update basic fields from ProfileResponseDTO
        if (updatedUser.getUsername() != null) {
            studentToUpdate.setUsername(updatedUser.getUsername());
        }
        if (updatedUser.getEmail() != null) {
            studentToUpdate.setEmail(updatedUser.getEmail());
        }
        if (updatedUser.getFirstName() != null) {
            studentToUpdate.setFirstName(updatedUser.getFirstName());
        }
        if (updatedUser.getLastName() != null) {
            studentToUpdate.setLastName(updatedUser.getLastName());
        }
        if (updatedUser.getDateBirth() != null) {
            studentToUpdate.setDateBirth(updatedUser.getDateBirth());
        }
        if (updatedUser.getBiography() != null) {
            studentToUpdate.setBiography(updatedUser.getBiography());
        }

        // For now, we'll assume the in-memory UserFactory's list is the source of truth
        // and changes to the studentToUpdate object are reflected.
        // If using a persistent database, uncomment and implement:
        studentRepository.update(studentToUpdate);

        return true; // Successfully updated
    }

    public void updateUser(String userId, User updated, List<String> interestNames) {
        // Buscar al moderador
        Moderator mod = users.getModerator();
        if (mod.getId() != null && mod.getId().equals(userId)) {
            if (updated.getUsername() != null) mod.setUsername(updated.getUsername());
            if (updated.getEmail() != null) mod.setEmail(updated.getEmail());
            if (updated.getPassword() != null) mod.setPassword(updated.getPassword());
            return;
        }
        
        DoublyLinkedNode<Student> current = users.getStudents().getHead();
        while (current != null) {
            Student s = current.getData();
            if (s.getId() != null && s.getId().equals(userId)) {
                updateStudentFields(s, updated);
                
                boolean interestsChanged = false;
                if (interestNames != null) {
                    interestsChanged = updateStudentInterests(s, interestNames);
                }
                
                if (interestsChanged) {
                    updateAutomaticStudyGroupsForStudent(s);
                }
                
                return;
            }
            current = current.getNext();
        }
        
        if (userId.contains("@")) {
            current = users.getStudents().getHead();
            while (current != null) {
                Student s = current.getData();
                if (s.getEmail() != null && s.getEmail().equals(userId)) {
                    updateStudentFields(s, updated);
                    
                    if (interestNames != null && !interestNames.isEmpty()) {
                        updateStudentInterests(s, interestNames);
                    }
                    
                    return;
                }
                current = current.getNext();
            }
            
            System.out.println("updateUser: No se encontró el usuario para actualizar, creando uno nuevo");
            User newUser = findOrCreateUserByEmail(userId);
            if (newUser instanceof Student) {
                Student student = (Student)newUser;
                updateStudentFields(student, updated);
                
                if (interestNames != null && !interestNames.isEmpty()) {
                    updateStudentInterests(student, interestNames);
                }
            }
        }
    }

    public void updateUser(String userId, User updated) {
        updateUser(userId, updated, null);
    }
    

    private boolean updateStudentInterests(Student target, List<String> interestNames) {
        boolean changed = false;
        DoublyLinkedList<Interest> newInterests = new DoublyLinkedList<>();
        
        // Keep track of current interest names for comparison
        Set<String> currentInterestNames = new HashSet<>();
        if (target.getInterests() != null) {
            for (int i = 0; i < target.getInterests().getSize(); i++) {
                currentInterestNames.add(target.getInterests().get(i).getName());
            }
        }

        Set<String> newInterestNames = new HashSet<>(interestNames);

        if (!currentInterestNames.equals(newInterestNames)) {
            changed = true;
        }

        for (String name : interestNames) {
            Interest interest = findInterestByName(name);
            if (interest == null) {
                // Optionally create new interest if it doesn't exist globally
                // For now, we only add existing global interests
                System.out.println("Interest not found in global list: " + name + ". It will not be added to student.");
            } else {
                newInterests.addLast(interest);
            }
        }
        target.setInterests(newInterests);
        return changed; // Return true if the list of interests was modified
    }
    
    // Helper method to find an interest by name from the global list
    public Interest findInterestByName(String name) {
        if (name == null || name.trim().isEmpty() || this.interests == null) {
            return null;
        }
        for (int i = 0; i < this.interests.getSize(); i++) {
            Interest interest = this.interests.get(i);
            if (interest.getName() != null && interest.getName().equalsIgnoreCase(name.trim())) {
                return interest;
            }
        }
        return null; // Not found
    }

    private void updateStudentFields(Student target, User updated) {
        // update common fields
        if (updated.getUsername() != null) target.setUsername(updated.getUsername());
        if (updated.getEmail() != null) target.setEmail(updated.getEmail());
        if (updated.getPassword() != null) target.setPassword(updated.getPassword());
        
        // update student-specific fields
        if (updated instanceof Student) {
            Student us = (Student) updated;
            if (us.getFirstName() != null) target.setFirstName(us.getFirstName());
            if (us.getLastName() != null) target.setLastName(us.getLastName());
            if (us.getDateBirth() != null) target.setDateBirth(us.getDateBirth());
            if (us.getBiography() != null) target.setBiography(us.getBiography());
        }
    }

    // Interest management operations
    public boolean addInterest(Interest interest) {
        try {
            if (interest.getName() == null || interest.getName().trim().isEmpty()) {
                return false;
            }
            
            // Use provided ID if available and valid, otherwise generate one.
            if (interest.getIdInterest() == null || interest.getIdInterest().trim().isEmpty()) {
                interest.setIdInterest(generateInterestId());
            }
            // If an ID like UUID was provided by the caller (e.g. TestDataLoaderService),
            // it will be used. Otherwise, the generated one is used.

            interest.setName(interest.getName().trim());
            
            // Prevent adding interest with duplicate name to the in-memory list
            for (int i = 0; i < interests.getSize(); i++) {
                if (interests.get(i).getName().equalsIgnoreCase(interest.getName())) {
                    System.err.println("Interest with name '" + interest.getName() + "' already exists in memory. Not adding.");
                    return false; // Or update existing, depending on desired behavior
                }
            }

            interests.addLast(interest);
            // Note: This does not save to InterestRepository. 
            // That happens separately if needed, e.g. via an admin UI or specific service call.
            return true;
        } catch (Exception e) {
            System.err.println("Error adding interest: " + e.getMessage());
            return false;
        }
    }

    public DoublyLinkedList<Interest> getAllInterests() {
        return interests;
    }

    public Interest getInterestById(String id) {
        if (id == null || interests.isEmpty()) {
            return null;
        }
        
        for (int i = 0; i < interests.getSize(); i++) {
            Interest interest = interests.get(i);
            if (interest.getIdInterest() != null && interest.getIdInterest().equals(id)) {
                return interest;
            }
        }
        return null;
    }

    public boolean updateInterest(String id, String newName) {
        if (id == null || newName == null || newName.trim().isEmpty()) {
            return false;
        }
        
        Interest interest = getInterestById(id);
        if (interest != null) {
            interest.setName(newName.trim());
            return true;
        }
        return false;
    }

    public boolean deleteInterest(String id) {
        if (id == null || interests.isEmpty()) {
            return false;
        }
        
        for (int i = 0; i < interests.getSize(); i++) {
            Interest interest = interests.get(i);
            if (interest.getIdInterest() != null && interest.getIdInterest().equals(id)) {
                interests.removeAt(i);
                return true;
            }
        }
        return false;
    }

    private String generateInterestId() {
        return "interest_" + System.currentTimeMillis();
    }

    // Affinity Graph operations
    public void initializeAffinityGraph() {
        if (affinityGraph == null) {
            affinityGraph = new UndirectedGraph<>();
        }
        
        // Add all students as vertices
        DoublyLinkedNode<Student> current = users.getStudents().getHead();
        while (current != null) {
            Student student = current.getData();
            if (student.getId() != null) {
                affinityGraph.addVertex(student.getId());
            }
            current = current.getNext();
        }
        
        // Create edges based on mutual following in addition to shared interests
        createAffinityConnections();
    }

    private void createAffinityConnections() {
        DoublyLinkedNode<Student> current1 = users.getStudents().getHead();
        System.out.println("[AffinityGraph] Starting createAffinityConnections...");

        while (current1 != null) {
            Student student1 = current1.getData();
            if (student1.getId() == null) {
                current1 = current1.getNext();
                continue;
            }

            DoublyLinkedNode<Student> current2 = current1.getNext();
            
            while (current2 != null) {
                Student student2 = current2.getData();
                if (student2.getId() == null) {
                    current2 = current2.getNext();
                    continue;
                }

                // Updated logic: Edge only if users mutually follow each other.
                boolean mutuallyFollowing = isUserFollowing(student1.getId(), student2.getId()) && isUserFollowing(student2.getId(), student1.getId());

                if (mutuallyFollowing) {
                    try {
                        if (!affinityGraph.edgeExists(student1.getId(), student2.getId())) {
                           affinityGraph.addEdge(student1.getId(), student2.getId());
                        } // else edge already exists, do nothing
                    } catch (Exception e) {
                        System.err.println("Error adding edge to affinity graph for " + student1.getId() + " and " + student2.getId() + ": " + e.getMessage());
                    }
                }
                
                current2 = current2.getNext();
            }
            current1 = current1.getNext();
        }
        System.out.println("[AffinityGraph] Finished createAffinityConnections.");
    }

    private boolean hasSharedInterests(Student student1, Student student2) {
        if (student1.getInterests() == null || student2.getInterests() == null) {
            return false;
        }
        
        // Check if they share at least one interest
        for (int i = 0; i < student1.getInterests().getSize(); i++) {
            Interest interest1 = student1.getInterests().get(i);
            for (int j = 0; j < student2.getInterests().getSize(); j++) {
                Interest interest2 = student2.getInterests().get(j);
                if (interest1.getName().equals(interest2.getName())) {
                    return true;
                }
            }
        }
        return false;
    }

    public List<Map<String, Object>> getAffinityGraphData() {
        List<Map<String, Object>> result = new ArrayList<>();
        
        if (affinityGraph == null) {
            initializeAffinityGraph();
        }
        
        // Add nodes data
        List<Map<String, Object>> nodes = new ArrayList<>();
        List<Map<String, Object>> links = new ArrayList<>();
        
        DoublyLinkedNode<Student> current = users.getStudents().getHead();
        int groupCounter = 0;
        
        while (current != null) {
            Student student = current.getData();
            if (student.getId() != null) {
                Map<String, Object> node = new HashMap<>();
                node.put("id", student.getId());
                node.put("label", student.getUsername() != null ? student.getUsername() : student.getId());
                node.put("group", (groupCounter++) % 4);
                
                // Add interests
                List<String> interestNames = new ArrayList<>();
                if (student.getInterests() != null) {
                    for (int i = 0; i < student.getInterests().getSize(); i++) {
                        interestNames.add(student.getInterests().get(i).getName());
                    }
                }
                node.put("interests", interestNames);
                
                nodes.add(node);
            }
            current = current.getNext();
        }
        
        // Add links based on the graph connections
        GraphVertex<String> vertex = affinityGraph.getVertices();
        while (vertex != null) {
            String sourceId = vertex.getData();
            Edge<String> edge = vertex.getEdgeList();
            
            while (edge != null) {
                String targetId = edge.getAdjacent().getData();
                
                // Only add each edge once (avoid duplicates in undirected graph)
                if (sourceId.compareTo(targetId) < 0) {
                    Map<String, Object> link = new HashMap<>();
                    link.put("source", sourceId);
                    link.put("target", targetId);
                    link.put("weight", 1.0);
                    links.add(link);
                }
                
                edge = edge.getNextEdge();
            }
            vertex = vertex.getNextVertex();
        }
        
        Map<String, Object> graphData = new HashMap<>();
        graphData.put("nodes", nodes);
        graphData.put("links", links);
        
        result.add(graphData);
        return result;
    }

    public List<String> findShortestPathBetweenStudents(String studentId1, String studentId2) {
        if (affinityGraph == null) {
            initializeAffinityGraph();
        }
        
        // Implement BFS for shortest path
        Queue<String> queue = new LinkedList<>();
        Map<String, String> parent = new HashMap<>();
        Set<String> visited = new HashSet<>();
        
        queue.offer(studentId1);
        visited.add(studentId1);
        parent.put(studentId1, null);
        
        while (!queue.isEmpty()) {
            String currentId = queue.poll();
            
            if (currentId.equals(studentId2)) {
                // Reconstruct path
                List<String> path = new ArrayList<>();
                String node = studentId2;
                while (node != null) {
                    path.add(0, node);
                    node = parent.get(node);
                }
                return path;
            }
            
            // Find neighbors
            GraphVertex<String> vertex = findGraphVertex(currentId);
            if (vertex != null) {
                Edge<String> edge = vertex.getEdgeList();
                while (edge != null) {
                    String neighborId = edge.getAdjacent().getData();
                    if (!visited.contains(neighborId)) {
                        visited.add(neighborId);
                        parent.put(neighborId, currentId);
                        queue.offer(neighborId);
                    }
                    edge = edge.getNextEdge();
                }
            }
        }
        
        return new ArrayList<>(); // No path found
    }

    private GraphVertex<String> findGraphVertex(String data) {
        if (affinityGraph == null) return null;
        
        GraphVertex<String> current = affinityGraph.getVertices();
        while (current != null) {
            if (current.getData().equals(data)) {
                return current;
            }
            current = current.getNextVertex();
        }
        return null;
    }

    public void refreshAffinityGraph() {
        affinityGraph = null;
        initializeAffinityGraph();
    }

    // Analytics operations
    public List<Map<String, Object>> getTopicActivityData() {
        List<Map<String, Object>> result = new ArrayList<>();
        Map<String, Integer> interestContentCounts = new HashMap<>();
        Map<String, Integer> interestHelpRequestCounts = new HashMap<>();
        
        System.out.println("Getting topic activity data based on interests...");
        
        // Count content by interests (topics)
        if (contentTree != null && !contentTree.isEmpty()) {
            DoublyLinkedList<Content> allContent = getAllContent();
            System.out.println("Analyzing " + allContent.getSize() + " content items for interest matching");
            
            for (int i = 0; i < allContent.getSize(); i++) {
                Content content = allContent.get(i);
                if (content.getTopics() != null) {
                    for (int j = 0; j < content.getTopics().getSize(); j++) {
                        String topicName = content.getTopics().get(j).getName();
                        // Match with existing interests
                        if (isInterestInSystem(topicName)) {
                            interestContentCounts.put(topicName, interestContentCounts.getOrDefault(topicName, 0) + 1);
                        }
                    }
                }
            }
        }
        
        // Count help requests by interests
        if (helpRequestQueue != null && !helpRequestQueue.isEmpty()) {
            DoublyLinkedList<HelpRequest> allRequests = getAllHelpRequests();
            System.out.println("Analyzing " + allRequests.getSize() + " help requests for interest matching");
            
            for (int i = 0; i < allRequests.getSize(); i++) {
                HelpRequest request = allRequests.get(i);
                if (request.getTopics() != null) {
                    for (int j = 0; j < request.getTopics().getSize(); j++) {
                        String topicName = request.getTopics().get(j).getName();
                        // Match with existing interests
                        if (isInterestInSystem(topicName)) {
                            interestHelpRequestCounts.put(topicName, interestHelpRequestCounts.getOrDefault(topicName, 0) + 1);
                        }
                    }
                }
            }
        }
        
        // Generate activity data based on all interests in the system
        for (int i = 0; i < interests.getSize(); i++) {
            Interest interest = interests.get(i);
            String interestName = interest.getName();
            
            int contentCount = interestContentCounts.getOrDefault(interestName, 0);
            int helpRequestCount = interestHelpRequestCounts.getOrDefault(interestName, 0);
            int totalActivity = contentCount + helpRequestCount;
            
            if (totalActivity > 0) { // Only include interests that have activity
                Map<String, Object> topicData = new HashMap<>();
                topicData.put("topic", interestName);
                topicData.put("contents", totalActivity);
                result.add(topicData);
                System.out.println("Interest '" + interestName + "' has " + totalActivity + " activities (" + contentCount + " content, " + helpRequestCount + " help requests)");
            }
        }
        
        // If no interests have activity, add a message indicating this
        if (result.isEmpty() && interests.getSize() > 0) {
            System.out.println("No activity found for existing interests, showing interests with 0 activity");
            // Show all interests but with 0 activity to indicate they exist but have no content/help requests
            for (int i = 0; i < Math.min(interests.getSize(), 5); i++) {
                Interest interest = interests.get(i);
                Map<String, Object> topicData = new HashMap<>();
                topicData.put("topic", interest.getName());
                topicData.put("contents", 0);
                result.add(topicData);
            }
        }
        
        System.out.println("Topic activity result: " + result.size() + " interests");
        return result;
    }
    
    private boolean isInterestInSystem(String topicName) {
        for (int i = 0; i < interests.getSize(); i++) {
            if (interests.get(i).getName().equals(topicName)) {
                return true;
            }
        }
        return false;
    }

    public List<Map<String, Object>> getParticipationLevelsData() {
        List<Map<String, Object>> result = new ArrayList<>();
        Map<String, Integer> weeklyActivity = new HashMap<>();
        
        System.out.println("Calculating participation levels by week...");
        
        // Calculate activity for the last 4 weeks
        LocalDate now = LocalDate.now();
        
        // Initialize weeks
        for (int i = 3; i >= 0; i--) {
            LocalDate weekStart = now.minusWeeks(i);
            String weekLabel = "Sem " + (4 - i);
            weeklyActivity.put(weekLabel, 0);
        }
        
        // Count content by week
        if (contentTree != null && !contentTree.isEmpty()) {
            DoublyLinkedList<Content> allContent = getAllContent();
            for (int i = 0; i < allContent.getSize(); i++) {
                Content content = allContent.get(i);
                if (content.getDate() != null) {
                    String weekLabel = getWeekLabel(content.getDate(), now);
                    if (weekLabel != null && weeklyActivity.containsKey(weekLabel)) {
                        weeklyActivity.put(weekLabel, weeklyActivity.get(weekLabel) + 1);
                    }
                }
            }
        }
        
        // Count help requests by week
        if (helpRequestQueue != null && !helpRequestQueue.isEmpty()) {
            DoublyLinkedList<HelpRequest> allRequests = getAllHelpRequests();
            for (int i = 0; i < allRequests.getSize(); i++) {
                HelpRequest request = allRequests.get(i);
                if (request.getRequestDate() != null) {
                    String weekLabel = getWeekLabel(request.getRequestDate(), now);
                    if (weekLabel != null && weeklyActivity.containsKey(weekLabel)) {
                        weeklyActivity.put(weekLabel, weeklyActivity.get(weekLabel) + 1);
                    }
                }
            }
        }
        
        // Convert to result format
        for (int i = 1; i <= 4; i++) {
            String weekLabel = "Sem " + i;
            Map<String, Object> weekData = new HashMap<>();
            weekData.put("week", weekLabel);
            weekData.put("activity", weeklyActivity.get(weekLabel));
            result.add(weekData);
            System.out.println(weekLabel + ": " + weeklyActivity.get(weekLabel) + " activities");
        }
        
        return result;
    }
    
    private String getWeekLabel(LocalDate activityDate, LocalDate now) {
        if (activityDate == null) return null;
        
        long weeksAgo = java.time.temporal.ChronoUnit.WEEKS.between(activityDate, now);
        
        if (weeksAgo >= 0 && weeksAgo <= 3) {
            return "Sem " + (4 - (int)weeksAgo);
        }
        return null;
    }

    private int calculateWeeklyActivity(int week) {
        // Simple calculation based on content and help requests
        int contentCount = getTotalContentCount();
        int helpRequestCount = getTotalHelpRequestsCount();
        int userCount = getTotalUsersCount();
        
        // Simulate weekly variation
        int baseActivity = (contentCount + helpRequestCount) * 2;
        return Math.max(baseActivity + (week * 5) + (userCount / 2), 20);
    }

    // Helper methods for counts
    public int getTotalContentCount() {
        DoublyLinkedList<Content> contents = getAllContent();
        return contents != null ? contents.getSize() : 0;
    }

    public int getTotalHelpRequestsCount() {
        DoublyLinkedList<HelpRequest> requests = getAllHelpRequests();
        return requests != null ? requests.getSize() : 0;
    }

    public int getTotalUsersCount() {
        int count = 0;
        DoublyLinkedNode<Student> current = users.getStudents().getHead();
        while (current != null) {
            count++;
            current = current.getNext();
        }
        return count;
    }

    public List<Map<String, Object>> getCommunityDetectionData() {
        List<Map<String, Object>> result = new ArrayList<>();
        Map<String, List<String>> interestGroups = new HashMap<>();
        Map<String, Integer> interestCounts = new HashMap<>();
        
        System.out.println("Getting community detection data based on interests...");
        
        // Group students by ALL their interests (not just primary)
        DoublyLinkedNode<Student> current = users.getStudents().getHead();
        int studentCount = 0;
        while (current != null) {
            Student student = current.getData();
            studentCount++;
            String studentName = student.getUsername() != null ? student.getUsername() : student.getId();
            
            if (student.getInterests() != null && student.getInterests().getSize() > 0) {
                // Add student to all their interest groups
                for (int i = 0; i < student.getInterests().getSize(); i++) {
                    String interestName = student.getInterests().get(i).getName();
                    interestGroups.computeIfAbsent(interestName, k -> new ArrayList<>()).add(studentName);
                    interestCounts.put(interestName, interestCounts.getOrDefault(interestName, 0) + 1);
                }
            }
            current = current.getNext();
        }
        
        System.out.println("Found " + studentCount + " students distributed across " + interestGroups.size() + " interest groups");
        
        // Convert to cluster format based on actual interests in the system
        int clusterId = 1;
        for (int i = 0; i < interests.getSize(); i++) {
            Interest interest = interests.get(i);
            String interestName = interest.getName();
            
            if (interestGroups.containsKey(interestName)) {
                List<String> studentsInInterest = interestGroups.get(interestName);
                // Remove duplicates while preserving order
                List<String> uniqueStudents = new ArrayList<>();
                for (String student : studentsInInterest) {
                    if (!uniqueStudents.contains(student)) {
                        uniqueStudents.add(student);
                    }
                }
                
                if (!uniqueStudents.isEmpty()) {
                    Map<String, Object> cluster = new HashMap<>();
                    cluster.put("id", clusterId++);
                    cluster.put("topic", interestName);
                    cluster.put("students", String.join(", ", uniqueStudents));
                    result.add(cluster);
                    System.out.println("Interest '" + interestName + "' has " + uniqueStudents.size() + " students: " + uniqueStudents);
                }
            } else {
                System.out.println("Interest '" + interestName + "' has no students");
            }
        }
        
        System.out.println("Community detection result: " + result.size() + " communities");
        return result;
    }

    public List<Map<String, Object>> getMostConnectedUsers() {
        List<Map<String, Object>> result = new ArrayList<>();
        Map<String, Integer> userConnections = new HashMap<>();
        
        System.out.println("Calculating most connected users from affinity graph...");
        
        if (affinityGraph == null) {
            initializeAffinityGraph();
        }
        
        // Count connections for each user in the affinity graph
        GraphVertex<String> vertex = affinityGraph.getVertices();
        while (vertex != null) {
            String userId = vertex.getData();
            int connectionCount = 0;
            
            // Count edges for this user
            Edge<String> edge = vertex.getEdgeList();
            while (edge != null) {
                connectionCount++;
                edge = edge.getNextEdge();
            }
            
            userConnections.put(userId, connectionCount);
            vertex = vertex.getNextVertex();
        }
        
        // Convert to list and sort by connection count
        List<Map.Entry<String, Integer>> sortedUsers = new ArrayList<>(userConnections.entrySet());
        sortedUsers.sort((a, b) -> Integer.compare(b.getValue(), a.getValue()));
        
        // Get top 5 most connected users
        int limit = Math.min(5, sortedUsers.size());
        for (int i = 0; i < limit; i++) {
            Map.Entry<String, Integer> entry = sortedUsers.get(i);
            User user = getUserById(entry.getKey()); 
            if (user != null) {
                Map<String, Object> userData = new HashMap<>();
                userData.put("id", user.getId());
                userData.put("username", user.getUsername());
                userData.put("name", (user instanceof Student ? ((Student)user).getFirstName() : "") + " " + (user instanceof Student ? ((Student)user).getLastName() : "")); 
                userData.put("connections", entry.getValue());
                // Generate a generic avatar URL based on username or ID
                String avatarSeed = user.getUsername() != null ? user.getUsername() : user.getId();
                userData.put("avatar", "https://avatar.vercel.sh/" + avatarSeed + ".png?size=40"); 
                result.add(userData);
            }
        }
        return result;
    }

    public Map<String, Object> getFullAnalyticsData() {
        System.out.println("Getting full analytics data...");
        Map<String, Object> analytics = new HashMap<>();
        
        List<Map<String, Object>> topicActivity = getTopicActivityData();
        List<Map<String, Object>> participationLevels = getParticipationLevelsData();
        List<Map<String, Object>> communityClusters = getCommunityDetectionData();
        
        analytics.put("topicActivity", topicActivity);
        analytics.put("participationLevels", participationLevels);
        analytics.put("communityClusters", communityClusters);
        
        System.out.println("Analytics data prepared - topicActivity: " + topicActivity.size() + 
                          ", participationLevels: " + participationLevels.size() + 
                          ", communityClusters: " + communityClusters.size());
        
        return analytics;
    }

    // Follow/Unfollow logic
    public boolean followUser(String followerId, String followedId) {
        User followerUser = getUserById(followerId);
        User followedUser = getUserById(followedId);

        if (followerUser instanceof Student && followedUser instanceof Student) {
            Student follower = (Student) followerUser;
            Student followed = (Student) followedUser;

            if (follower.getId().equals(followed.getId())) {
                 // Cannot follow yourself
                return false;
            }

            follower.addFollowing(followed);
            followed.addFollower(follower);
            // Assuming StudentRepository handles persistence if necessary, or if objects are managed in memory primarily.
            // If explicit save is needed:
            // studentRepository.update(follower);
            // studentRepository.update(followed);
            System.out.println("[UserAction] " + followerId + " now follows " + followedId);
            refreshAffinityGraph(); // Refresh graph after successful follow
            System.out.println("[AffinityGraph] Graph refreshed due to follow action.");
            return true;
        }
        return false;
    }

    public boolean unfollowUser(String followerId, String unfollowedId) {
        User followerUser = getUserById(followerId);
        User unfollowedUser = getUserById(unfollowedId);

        if (followerUser instanceof Student && unfollowedUser instanceof Student) {
            Student follower = (Student) followerUser;
            Student unfollowed = (Student) unfollowedUser;

            boolean success = follower.removeFollowing(unfollowed) && unfollowed.removeFollower(follower);
            if (success) {
                // studentRepository.update(follower); // Potentially update both if needed
                // studentRepository.update(unfollowed);
                System.out.println("[UserAction] " + followerId + " unfollowed " + unfollowedId);
                refreshAffinityGraph(); // Refresh graph after successful unfollow
                System.out.println("[AffinityGraph] Graph refreshed due to unfollow action.");
            }
            return success;
        }
        return false;
    }

    public boolean isUserFollowing(String currentUserId, String targetUserId) {
        if (currentUserId == null || targetUserId == null) {
            return false;
        }
        User currentUser = getUserById(currentUserId);
        User targetUser = getUserById(targetUserId);

        if (currentUser instanceof Student && targetUser instanceof Student) {
            return ((Student) currentUser).isFollowing((Student) targetUser);
        }
        return false;
    }

    public DoublyLinkedList<HelpRequest> getAllHelpRequests() {
        DoublyLinkedList<HelpRequest> result = new DoublyLinkedList<>();
        
        if (helpRequestQueue == null || helpRequestQueue.isEmpty()) {
            return result;
        }
        
        // Create a copy to preserve the original queue
        PriorityQueue<HelpRequest> tempQueue = new PriorityQueue<>();
        
        // Extract all elements from original queue
        while (!helpRequestQueue.isEmpty()) {
            HelpRequest request = helpRequestQueue.dequeue();
            result.addLast(request);
            tempQueue.insert(request);
        }
        
        // Restore the original queue
        while (!tempQueue.isEmpty()) {
            helpRequestQueue.insert(tempQueue.dequeue());
        }
        
        return result;
    }

    public HelpRequest getHelpRequestById(int id) {
        if (helpRequestQueue == null || helpRequestQueue.isEmpty()) {
            return null;
        }
        
        // Create a temporary queue to search through
        PriorityQueue<HelpRequest> tempQueue = new PriorityQueue<>();
        HelpRequest found = null;
        
        // Search for the request with the given ID
        while (!helpRequestQueue.isEmpty()) {
            HelpRequest request = helpRequestQueue.dequeue();
            if (request.getRequestId() == id) {
                found = request;
            }
            tempQueue.insert(request);
        }
        
        // Restore the original queue
        while (!tempQueue.isEmpty()) {
            helpRequestQueue.insert(tempQueue.dequeue());
        }
        
        return found;
    }

    public boolean markHelpRequestAsCompleted(int requestId, String userId) {
        if (helpRequestQueue == null || helpRequestQueue.isEmpty()) {
            return false;
        }
        
        PriorityQueue<HelpRequest> tempQueue = new PriorityQueue<>();
        boolean foundAndUpdated = false;
        
        while (!helpRequestQueue.isEmpty()) {
            HelpRequest request = helpRequestQueue.dequeue();
            if (request.getRequestId() == requestId && request.getStudent().getId().equals(userId)) {
                request.markAsCompleted();
                foundAndUpdated = true;
            }
            tempQueue.insert(request);
        }
        
        // Restore the original queue
        while (!tempQueue.isEmpty()) {
            helpRequestQueue.insert(tempQueue.dequeue());
        }
        
        return foundAndUpdated;
    }

    public boolean updateHelpRequest(int requestId, HelpRequestResponseDTO updatedDto) {
        if (helpRequestQueue == null || helpRequestQueue.isEmpty()) {
            return false;
        }

        HelpRequest existingRequest = null;
        PriorityQueue<HelpRequest> tempQueue = new PriorityQueue<>();

        // Find the request and store others temporarily
        while (!helpRequestQueue.isEmpty()) {
            HelpRequest current = helpRequestQueue.dequeue();
            if (current.getRequestId() == requestId) {
                existingRequest = current;
            } else {
                tempQueue.insert(current);
            }
        }

        // Restore non-matching requests to the main queue
        while (!tempQueue.isEmpty()) {
            helpRequestQueue.insert(tempQueue.dequeue());
        }

        if (existingRequest == null) {
            return false; // Request not found
        }

        // Update the existing request object
        if (updatedDto.getInformation() != null) {
            existingRequest.setInformation(updatedDto.getInformation());
        }
        if (updatedDto.getUrgency() != null) {
            try {
                existingRequest.setUrgency(Urgency.valueOf(updatedDto.getUrgency().toUpperCase()));
            } catch (IllegalArgumentException e) {
                System.err.println("Invalid urgency value provided: " + updatedDto.getUrgency());
            }
        }
        existingRequest.setCompleted(updatedDto.isCompleted());

        helpRequestQueue.insert(existingRequest);
        return true;
    }

    // Method to get the count of study groups a user is part of
    public int getUserStudyGroupCount(String userId) {
        if (userId == null || userId.isEmpty()) {
            return 0;
        }
        int count = 0;
        if (studyGroups != null) {
            for (int i = 0; i < studyGroups.getSize(); i++) {
                StudyGroup group = studyGroups.get(i);
                if (group != null && group.getMembers() != null) {
                    DoublyLinkedList<Student> members = group.getMembers();
                    if (members != null) {
                        for (int j = 0; j < members.getSize(); j++) {
                            User member = members.get(j);
                            if (member != null && userId.equals(member.getId())) {
                                count++;
                                break; // Found in this group, move to the next group
                            }
                        }
                    }
                }
            }
        }
        return count;
    }

    // HelpRequest operations
    public boolean addHelpRequest(HelpRequest helpRequest) {
        try {
            System.out.println("TheKnowledgeBay - Agregando solicitud de ayuda...");
            if (helpRequestQueue == null) {
                helpRequestQueue = new PriorityQueue<>();
                System.out.println("TheKnowledgeBay - Inicializando cola de prioridad");
            }
            
            int requestId = generateHelpRequestId();
            helpRequest.setRequestId(requestId);
            System.out.println("TheKnowledgeBay - ID generado: " + requestId);
            
            helpRequestQueue.insert(helpRequest);
            System.out.println("TheKnowledgeBay - Solicitud insertada en la cola");

            if (helpRequest.getTopics() != null && !helpRequest.getTopics().isEmpty()) {
                for (int i = 0; i < helpRequest.getTopics().getSize(); i++) {
                    Interest topic = helpRequest.getTopics().get(i);
                    if (topic != null && topic.getName() != null) {
                        StudyGroup relevantGroup = findStudyGroupByInterestName(topic.getName());
                        if (relevantGroup != null) {
                            if (relevantGroup.getAssociatedHelpRequests() == null) {
                                relevantGroup.setAssociatedHelpRequests(new DoublyLinkedList<>());
                            }
                            if (!relevantGroup.getAssociatedHelpRequests().contains(helpRequest)) {
                                relevantGroup.getAssociatedHelpRequests().addLast(helpRequest);
                                System.out.println("HelpRequest ID '" + helpRequest.getRequestId() + "' associated with group: " + relevantGroup.getName());
                            }
                        }
                    }
                }
            }
            return true;
        } catch (Exception e) {
            System.err.println("Error adding help request: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}