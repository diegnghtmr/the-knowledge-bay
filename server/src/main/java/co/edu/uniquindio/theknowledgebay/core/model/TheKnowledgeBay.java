package co.edu.uniquindio.theknowledgebay.core.model;

import co.edu.uniquindio.theknowledgebay.core.factory.UserFactory;
import co.edu.uniquindio.theknowledgebay.core.repository.StudentRepository;
import co.edu.uniquindio.theknowledgebay.infrastructure.config.ModeratorProperties;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.queues.PriorityQueue;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.trees.BinarySearchTree;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.nodes.DoublyLinkedNode;
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

        // Initialize students
        List<Student> students = studentRepository.findAll();
        for (Student student : students) {
            this.users.add(student);
        }
    }

    /**
     * Busca un usuario por email. Si no existe, crea uno automáticamente.
     * @param email el email del usuario
     * @return el usuario encontrado o creado
     */
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
                return s;
            }
            current = current.getNext();
        }
        
        // Si no se encuentra, crear un nuevo estudiante
        System.out.println("Usuario no encontrado, creando nuevo estudiante con email: " + email);
        Student newStudent = Student.builder()
                .id(generateNewStudentId())
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
    
    /**
     * Genera un nuevo ID único para estudiantes
     * @return el nuevo ID
     */
    private Integer generateNewStudentId() {
        // Encontrar el ID más alto y sumar 1
        int maxId = 0;
        DoublyLinkedNode<Student> current = users.getStudents().getHead();
        while (current != null) {
            Student s = current.getData();
            if (s.getId() != null && s.getId() > maxId) {
                maxId = s.getId();
            }
            current = current.getNext();
        }
        return maxId + 1;
    }

    /**
     * Retrieves a User by ID or email, applying defaults for Student fields.
     * @param userId the user ID as String or email
     * @return the User or null if not found
     */
    public User getUserById(String userId) {
        // Primero intentar buscar por ID numérico
        try {
            int id = Integer.parseInt(userId);
            
            // check moderator
            Moderator mod = users.getModerator();
            if (mod.getId() != null && mod.getId().equals(id)) {
                return mod;
            }
            
            // search students
            DoublyLinkedNode<Student> current = users.getStudents().getHead();
            while (current != null) {
                Student s = current.getData();
                if (s.getId() != null && s.getId().equals(id)) {
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
            return null;
            
        } catch (NumberFormatException e) {
            // Si no es un ID numérico, intentar buscar por email
            System.out.println("El ID no es numérico, buscando como email: " + userId);
            
            // Si parece ser un email (contiene @), buscar o crear usuario
            if (userId.contains("@")) {
                return findOrCreateUserByEmail(userId);
            }
            
            return null;
        }
    }

    /**
     * Merges non-null fields from an updated User into the existing one.
     * @param userId the user ID as String or email
     * @param updated the User with updated values
     */
    public void updateUser(String userId, User updated) {
        // Primero intentar actualizar por ID numérico
        try {
            int id = Integer.parseInt(userId);
            
            // update moderator
            Moderator mod = users.getModerator();
            if (mod.getId() != null && mod.getId().equals(id)) {
                if (updated.getUsername() != null) mod.setUsername(updated.getUsername());
                if (updated.getEmail() != null) mod.setEmail(updated.getEmail());
                if (updated.getPassword() != null) mod.setPassword(updated.getPassword());
                return;
            }
            
            // search students
            DoublyLinkedNode<Student> current = users.getStudents().getHead();
            while (current != null) {
                Student s = current.getData();
                if (s.getId() != null && s.getId().equals(id)) {
                    updateStudentFields(s, updated);
                    return;
                }
                current = current.getNext();
            }
            
        } catch (NumberFormatException e) {
            // Si no es un ID numérico, intentar actualizar por email
            System.out.println("updateUser: El ID no es numérico, buscando como email: " + userId);
            
            if (userId.contains("@")) {
                // Buscar por email
                DoublyLinkedNode<Student> current = users.getStudents().getHead();
                while (current != null) {
                    Student s = current.getData();
                    if (s.getEmail() != null && s.getEmail().equals(userId)) {
                        updateStudentFields(s, updated);
                        return;
                    }
                    current = current.getNext();
                }
                
                // Si no existe, crear un nuevo estudiante con este email
                System.out.println("updateUser: No se encontró el usuario para actualizar, creando uno nuevo");
                User newUser = findOrCreateUserByEmail(userId);
                if (newUser instanceof Student) {
                    updateStudentFields((Student)newUser, updated);
                }
            }
        }
    }
    
    /**
     * Helper method to update student fields
     */
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