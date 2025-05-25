package co.edu.uniquindio.theknowledgebay.core.model;

import co.edu.uniquindio.theknowledgebay.core.factory.UserFactory;
import co.edu.uniquindio.theknowledgebay.core.repository.StudentRepository;
import co.edu.uniquindio.theknowledgebay.infrastructure.config.ModeratorProperties;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.DoublyLinkedNode;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.queues.PriorityQueue;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.trees.BinarySearchTree;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Scope;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import java.time.LocalDate;
import java.util.List;

@Getter
@Component
@Scope(ConfigurableBeanFactory.SCOPE_SINGLETON)
public class TheKnowledgeBay {

    // DataBase connection
    @Autowired
    private final StudentRepository studentRepository;

    // Data storage
    private final UserFactory users = UserFactory.getInstance();
    private BinarySearchTree<Content> contentTree;
    private PriorityQueue<HelpRequest> helpRequestQueue;
    private final DoublyLinkedList<StudyGroup> studyGroups = new DoublyLinkedList<>();
    private final DoublyLinkedList<Chat> chats = new DoublyLinkedList<>();
    private final DoublyLinkedList<Comment> comments = new DoublyLinkedList<>();
    private final DoublyLinkedList<Message> messages = new DoublyLinkedList<>();
    private final DoublyLinkedList<Interest> interests = new DoublyLinkedList<>();

    // Dependencies for Moderator loading
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ModeratorProperties props;

    @Autowired
    public TheKnowledgeBay(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public void addStudent(Student student) {
        users.add(student);
        studentRepository.save(student);
    }

    public void createContent(Content c) {
        if (contentTree == null) {
            contentTree = new BinarySearchTree<>();
        }
        contentTree.insert(c);
    }

    // HelpRequest operations
    public boolean addHelpRequest(HelpRequest helpRequest) {
        try {
            System.out.println("TheKnowledgeBay - Agregando solicitud de ayuda...");
            if (helpRequestQueue == null) {
                helpRequestQueue = new PriorityQueue<>();
                System.out.println("TheKnowledgeBay - Inicializando cola de prioridad");
            }
            
            // Generate a unique ID for the help request
            int requestId = generateHelpRequestId();
            helpRequest.setRequestId(requestId);
            System.out.println("TheKnowledgeBay - ID generado: " + requestId);
            
            helpRequestQueue.insert(helpRequest);
            System.out.println("TheKnowledgeBay - Solicitud insertada en la cola");
            return true;
        } catch (Exception e) {
            System.err.println("Error adding help request: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
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
        boolean found = false;
        
        while (!helpRequestQueue.isEmpty()) {
            HelpRequest request = helpRequestQueue.dequeue();
            if (request.getRequestId() == requestId && request.getStudent().getId().equals(userId)) {
                request.markAsCompleted();
                found = true;
            }
            tempQueue.insert(request);
        }
        
        // Restore the original queue
        while (!tempQueue.isEmpty()) {
            helpRequestQueue.insert(tempQueue.dequeue());
        }
        
        return found;
    }

    // Content operations
    public boolean addContent(Content content) {
        try {
            if (contentTree == null) {
                contentTree = new BinarySearchTree<>();
            }
            
            // Generate a unique ID for the content
            content.setContentId(generateContentId());
            
            contentTree.insert(content);
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
        // Simple ID generation based on current timestamp
        return (int) (System.currentTimeMillis() % Integer.MAX_VALUE);
    }

    public void createAutomaticGroups() {
        // TODO: implement functionality
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
                
                if (interestNames != null && !interestNames.isEmpty()) {
                    updateStudentInterests(s, interestNames);
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
    

    private void updateStudentInterests(Student target, List<String> interestNames) {
        System.out.println("Actualizando intereses del estudiante: " + interestNames);
        
        DoublyLinkedList<Interest> newInterests = new DoublyLinkedList<>();
        
        for (String name : interestNames) {
            Interest interest = new Interest();
            interest.setName(name);
            newInterests.addLast(interest);
        }
        
        target.setInterests(newInterests);
        System.out.println("Intereses actualizados correctamente.");
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
}