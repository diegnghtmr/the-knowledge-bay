package co.edu.uniquindio.theknowledgebay.core.model;

import co.edu.uniquindio.theknowledgebay.core.factory.UserFactory;
import co.edu.uniquindio.theknowledgebay.core.repository.StudentRepository;
import co.edu.uniquindio.theknowledgebay.infrastructure.config.ModeratorProperties;
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
    private UndirectedGraph<String> affinityGraph;

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
        
        // Initialize affinity graph
        System.out.println("Initializing affinity graph...");
        initializeAffinityGraph();
        System.out.println("Affinity graph initialized with " + interests.getSize() + " interests");
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

    // Interest management operations
    public boolean addInterest(Interest interest) {
        try {
            if (interest.getName() == null || interest.getName().trim().isEmpty()) {
                return false;
            }
            
            // Generate unique ID for the interest
            interest.setIdInterest(generateInterestId());
            interest.setName(interest.getName().trim());
            
            interests.addLast(interest);
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
        
        // Create edges based on shared interests
        createAffinityConnections();
    }

    private void createAffinityConnections() {
        DoublyLinkedNode<Student> current1 = users.getStudents().getHead();
        
        while (current1 != null) {
            Student student1 = current1.getData();
            DoublyLinkedNode<Student> current2 = current1.getNext();
            
            while (current2 != null) {
                Student student2 = current2.getData();
                
                // Calculate affinity based on shared interests
                if (hasSharedInterests(student1, student2)) {
                    try {
                        affinityGraph.addEdge(student1.getId(), student2.getId());
                    } catch (Exception e) {
                        // Edge already exists or other error, continue
                    }
                }
                
                current2 = current2.getNext();
            }
            current1 = current1.getNext();
        }
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
        Map<String, Integer> userGroups = new HashMap<>();
        
        while (current != null) {
            Student student = current.getData();
            if (student.getId() != null) {
                // Assign group based on primary interest
                int group = getGroupForStudent(student, userGroups, groupCounter++);
                
                Map<String, Object> node = new HashMap<>();
                node.put("id", student.getId());
                node.put("label", student.getUsername() != null ? student.getUsername() : student.getId());
                node.put("group", group % 4); // Limit to 4 groups for colors
                
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

    private int getGroupForStudent(Student student, Map<String, Integer> userGroups, int defaultGroup) {
        if (student.getInterests() != null && student.getInterests().getSize() > 0) {
            String primaryInterest = student.getInterests().get(0).getName();
            return userGroups.computeIfAbsent(primaryInterest, k -> defaultGroup % 4);
        }
        return defaultGroup % 4;
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
        List<Map.Entry<String, Integer>> sortedUsers = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : userConnections.entrySet()) {
            sortedUsers.add(entry);
        }
        sortedUsers.sort((a, b) -> Integer.compare(b.getValue(), a.getValue()));
        
        // Get top 5 most connected users
        int limit = Math.min(5, sortedUsers.size());
        for (int i = 0; i < limit; i++) {
            Map.Entry<String, Integer> entry = sortedUsers.get(i);
            String userId = entry.getKey();
            int connections = entry.getValue();
            
            User user = getUserById(userId);
            if (user != null) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", userId);
                item.put("username", user.getUsername() != null ? user.getUsername() : userId);
                item.put("email", user.getEmail());
                item.put("connections", connections);
                result.add(item);
                System.out.println("User " + user.getUsername() + " has " + connections + " connections");
            }
        }
        
        System.out.println("Most connected users result: " + result.size() + " users");
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
}