package co.edu.uniquindio.theknowledgebay.core.service;

import co.edu.uniquindio.theknowledgebay.core.model.TheKnowledgeBay;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import co.edu.uniquindio.theknowledgebay.core.model.Interest;
import co.edu.uniquindio.theknowledgebay.core.model.Content;
import co.edu.uniquindio.theknowledgebay.core.model.HelpRequest;
import co.edu.uniquindio.theknowledgebay.core.model.Chat;
import co.edu.uniquindio.theknowledgebay.core.model.Message;
import co.edu.uniquindio.theknowledgebay.core.model.enums.ContentType;
import co.edu.uniquindio.theknowledgebay.core.model.enums.Urgency;
import co.edu.uniquindio.theknowledgebay.core.repository.DomainRepository.PostKind;
import co.edu.uniquindio.theknowledgebay.infrastructure.config.SecurityConfig;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.Month;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;

@Service
@Profile(SecurityConfig.DEV_TOOLS_PROFILE)
public class TestDataLoaderService {

    private final TheKnowledgeBay theKnowledgeBay;
    private final PasswordEncoder passwordEncoder;
    private final Random random = new Random();

    public TestDataLoaderService(TheKnowledgeBay theKnowledgeBay, PasswordEncoder passwordEncoder) {
        this.theKnowledgeBay = theKnowledgeBay;
        this.passwordEncoder = passwordEncoder;
    }

    private LocalDate getRandomDateInMay(int year) {
        int day = random.nextInt(29) + 1; // Days from 1 to 29
        return LocalDate.of(year, Month.MAY, day);
    }

    private LocalDate getRandomBirthDate(int startYear, int endYear) {
        long minDay = LocalDate.of(startYear, 1, 1).toEpochDay();
        long maxDay = LocalDate.of(endYear, 12, 31).toEpochDay();
        long randomDay = ThreadLocalRandom.current().nextLong(minDay, maxDay + 1);
        return LocalDate.ofEpochDay(randomDay);
    }

    public void loadComprehensiveTestData() {
        System.out.println("Iniciando carga de datos de prueba comprehensivos...");
        int currentYear = LocalDate.now().getYear();

        // Crear Intereses (traducidos donde aplique)
        System.out.println("Creando intereses...");
        Interest interest1 = createAndAddInterest("Programación en Java");
        Interest interest2 = createAndAddInterest("Spring Framework"); // Framework name, keep as is
        Interest interest3 = createAndAddInterest("Estructuras de Datos");
        Interest interest4 = createAndAddInterest("Algoritmos");
        Interest interest5 = createAndAddInterest("Aprendizaje Automático"); // Machine Learning

        // Crear Usuarios (Estudiantes)
        System.out.println("Creando estudiantes...");
        List<Student> students = new ArrayList<>();

        Student student1 = createStudent("juan.perez", "juan.perez@example.com", "clave123", "Juan", "Pérez", getRandomBirthDate(2000, 2005), "Biografía de Juan, entusiasta de Java.", createInterestList(interest1, interest3));
        Student student2 = createStudent("maria.lopez", "maria.lopez@example.com", "clave123", "María", "López", getRandomBirthDate(2000, 2005), "Biografía de María, enfocada en algoritmos.", createInterestList(interest2, interest4));
        Student student3 = createStudent("carlos.gomez", "carlos.gomez@example.com", "clave123", "Carlos", "Gómez", getRandomBirthDate(2000, 2005), "Biografía de Carlos, apasionado por el Machine Learning.", createInterestList(interest1, interest2, interest5));
        Student student4 = createStudent("ana.martinez", "ana.martinez@example.com", "clave123", "Ana", "Martínez", getRandomBirthDate(2000, 2005), "Biografía de Ana, experta en estructuras de datos.", createInterestList(interest3, interest4));
        Student student5 = createStudent("luis.fernandez", "luis.fernandez@example.com", "clave123", "Luis", "Fernández", getRandomBirthDate(2000, 2005), "Biografía de Luis, explorando nuevas tecnologías.", createInterestList(interest5));
        Student student6 = createStudent("sofia.rodriguez", "sofia.rodriguez@example.com", "clave123", "Sofía", "Rodríguez", getRandomBirthDate(2000, 2005), "Biografía de Sofía, desarrolladora full-stack.", createInterestList(interest1, interest4, interest2));

        students.add(student1);
        students.add(student2);
        students.add(student3);
        students.add(student4);
        students.add(student5);
        students.add(student6);

        System.out.println("Agregando estudiantes al sistema...");
        students.forEach(student -> {
            theKnowledgeBay.addStudent(student);
            System.out.println("Estudiante agregado: " + student.getUsername() + " con ID: " + student.getId());
        });

        // Verificar que los estudiantes fueron agregados correctamente
        System.out.println("Verificando estudiantes agregados...");
        System.out.println("Total de estudiantes en el sistema: " + theKnowledgeBay.getUsers().getStudents().getSize());

        // Crear Contenido para los usuarios
        System.out.println("Creando contenidos para los estudiantes...");
        List<Content> allContents = new ArrayList<>(); // Lista para almacenar todos los contenidos
        
        // Estudiante 1 (Juan Pérez)
        Content content1_1 = createContentForStudent(student1, "Entendiendo Genéricos en Java", ContentType.ARTICLE, "Explicación detallada de los genéricos en Java.", createInterestList(interest1), getRandomDateInMay(currentYear));
        Content content1_2 = createContentForStudent(student1, "Introducción a Spring Boot", ContentType.ARTICLE, "Primeros pasos con aplicaciones Spring Boot.", createInterestList(interest2), getRandomDateInMay(currentYear));
        Content content1_3 = createContentForStudent(student1, "¿Mejores IDEs para Java en 2024?", ContentType.QUESTION, "Buscando recomendaciones de la comunidad sobre los mejores IDEs de Java para productividad en 2024.", createInterestList(interest1), getRandomDateInMay(currentYear));
        Content content1_4 = createContentForStudent(student1, "Documentación Oficial de Spring Framework", ContentType.LINK, "https://spring.io/docs", createInterestList(interest2), getRandomDateInMay(currentYear));
        allContents.add(content1_1);
        allContents.add(content1_2);
        allContents.add(content1_3);
        allContents.add(content1_4);

        // Estudiante 2 (María López)
        Content content2_1 = createContentForStudent(student2, "Notación Big O Explicada", ContentType.RESOURCE, "Guía comprensiva para entender la notación Big O para análisis de algoritmos y eficiencia.", createInterestList(interest4, interest3), getRandomDateInMay(currentYear));
        Content content2_2 = createContentForStudent(student2, "Quick Sort vs Merge Sort", ContentType.ARTICLE, "Análisis comparativo de los algoritmos Quick Sort y Merge Sort, discutiendo pros, contras y casos de uso.", createInterestList(interest4, interest3), getRandomDateInMay(currentYear));
        Content content2_3 = createContentForStudent(student2, "Visualizando Algoritmos", ContentType.VIDEO, "https://www.youtube.com/watch?v=YfNRggRvFCw - Un sitio genial que visualiza algoritmos de ordenamiento y búsqueda de caminos.", createInterestList(interest4), getRandomDateInMay(currentYear));
        allContents.add(content2_1);
        allContents.add(content2_2);
        allContents.add(content2_3);

        // Estudiante 3 (Carlos Gómez)
        Content content3_1 = createContentForStudent(student3, "Papers de ML Favoritos", ContentType.LINK, "Lista curada de papers influyentes en machine learning. http://example.com/ml-papers", createInterestList(interest5), getRandomDateInMay(currentYear));
        Content content3_2 = createContentForStudent(student3, "Primeros Pasos con TensorFlow", ContentType.ARTICLE, "Tutorial amigable para principiantes sobre cómo configurar TensorFlow y construir tu primera red neuronal.", createInterestList(interest5), getRandomDateInMay(currentYear));
        Content content3_3 = createContentForStudent(student3, "Top 5 Librerías de Machine Learning", ContentType.RESOURCE, "Reseña de las 5 principales librerías de Python para machine learning: Scikit-learn, TensorFlow, Keras, PyTorch y XGBoost.", createInterestList(interest5), getRandomDateInMay(currentYear));
        allContents.add(content3_1);
        allContents.add(content3_2);
        allContents.add(content3_3);

        // Estudiante 4 (Ana Martínez)
        Content content4_1 = createContentForStudent(student4, "Algoritmos de Ordenamiento Visualizados", ContentType.VIDEO, "Video explicativo de algoritmos de ordenamiento comunes como bubble sort, insertion sort y selection sort. https://www.youtube.com/watch?v=pqZ04TT15PQ", createInterestList(interest4), getRandomDateInMay(currentYear));
        Content content4_2 = createContentForStudent(student4, "Errores Comunes en Estructuras de Datos", ContentType.ARTICLE, "Destacando errores frecuentes que los estudiantes cometen al implementar y usar estructuras de datos comunes.", createInterestList(interest3), getRandomDateInMay(currentYear));
        Content content4_3 = createContentForStudent(student4, "Consejo para aprender algoritmos avanzados", ContentType.QUESTION, "Estoy cómodo con algoritmos básicos, ¿qué recursos o caminos recomiendan para aprender temas más avanzados como programación dinámica o teoría de grafos?", createInterestList(interest4), getRandomDateInMay(currentYear));
        allContents.add(content4_1);
        allContents.add(content4_2);
        allContents.add(content4_3);

        // Estudiante 5 (Luis Fernández)
        Content content5_1 = createContentForStudent(student5, "¿Es Python bueno para ML?", ContentType.QUESTION, "Discutiendo los pros y contras de Python en proyectos de Machine Learning comparado con otros lenguajes como R o Java.", createInterestList(interest5), getRandomDateInMay(currentYear));
        Content content5_2 = createContentForStudent(student5, "Reseña de la Especialización en Deep Learning", ContentType.LINK, "http://example.com/deeplearning-review - Mis pensamientos sobre la Especialización en Deep Learning de Coursera por Andrew Ng.", createInterestList(interest5), getRandomDateInMay(currentYear));
        allContents.add(content5_1);
        allContents.add(content5_2);

        // Estudiante 6 (Sofía Rodríguez)
        Content content6_1 = createContentForStudent(student6, "Mejores Prácticas de Concurrencia en Java", ContentType.ARTICLE, "Consejos y patrones para escribir aplicaciones concurrentes robustas, escalables y mantenibles en Java.", createInterestList(interest1), getRandomDateInMay(currentYear));
        Content content6_2 = createContentForStudent(student6, "Tutorial de Microservicios con Spring Boot", ContentType.VIDEO, "https://youtu.be/2sFczigWppk?si=kps-Eh3NxovM4HYm - Guía paso a paso para construir microservicios con Spring Boot y Spring Cloud.", createInterestList(interest2, interest1), getRandomDateInMay(currentYear));
        Content content6_3 = createContentForStudent(student6, "¿Cómo prepararse para una entrevista técnica de Java?", ContentType.QUESTION, "¿Cuáles son las áreas clave en las que enfocarse y las preguntas comunes en las entrevistas técnicas de Java?", createInterestList(interest1, interest4), getRandomDateInMay(currentYear));
        allContents.add(content6_1);
        allContents.add(content6_2);
        allContents.add(content6_3);

        // Crear Solicitudes de Ayuda para los usuarios
        createHelpRequestForStudent(student1, "Necesito ayuda con la configuración de Spring Security.", Urgency.HIGH, createInterestList(interest2), false, getRandomDateInMay(currentYear));
        createHelpRequestForStudent(student2, "Atascado en un problema de algoritmos de grafos.", Urgency.MEDIUM, createInterestList(interest4), true, getRandomDateInMay(currentYear)); // Marcada como completada
        createHelpRequestForStudent(student4, "Entendiendo la recursión para estructuras de datos.", Urgency.LOW, createInterestList(interest3), false, getRandomDateInMay(currentYear));
        createHelpRequestForStudent(student5, "Eligiendo un tema de doctorado en ML.", Urgency.CRITICAL, createInterestList(interest5), false, getRandomDateInMay(currentYear));

        // Establecer relaciones de Seguimiento
        // student1 sigue a student2, student3
        theKnowledgeBay.followUser(student1.getId(), student2.getId());
        theKnowledgeBay.followUser(student1.getId(), student3.getId());

        // student2 sigue a student1
        theKnowledgeBay.followUser(student2.getId(), student1.getId());

        // student3 sigue a student1, student4, student5
        theKnowledgeBay.followUser(student3.getId(), student1.getId());
        theKnowledgeBay.followUser(student3.getId(), student4.getId());
        theKnowledgeBay.followUser(student3.getId(), student5.getId());

        // student4 sigue a student2, student6
        theKnowledgeBay.followUser(student4.getId(), student2.getId());
        theKnowledgeBay.followUser(student4.getId(), student6.getId());
        
        // student5 sigue a student3
        theKnowledgeBay.followUser(student5.getId(), student3.getId());
        
        // student6 sigue a student1, student2, student3, student4
        theKnowledgeBay.followUser(student6.getId(), student1.getId());
        theKnowledgeBay.followUser(student6.getId(), student2.getId());
        theKnowledgeBay.followUser(student6.getId(), student3.getId());
        theKnowledgeBay.followUser(student6.getId(), student4.getId());

        // Verificación final del estado del sistema
        System.out.println("\n=== VERIFICACIÓN FINAL DEL SISTEMA ===");
        System.out.println("Total de usuarios: " + theKnowledgeBay.getUsers().getStudents().getSize());
        System.out.println("Total de grupos de estudio: " + theKnowledgeBay.getStudyGroups().getSize());
        System.out.println("Total de contenido: " + theKnowledgeBay.getAllContent().getSize());
        System.out.println("Total de solicitudes de ayuda: " + theKnowledgeBay.getAllHelpRequests().getSize());
        System.out.println("Total de intereses: " + theKnowledgeBay.getAllInterests().getSize());
        
        // Verificar datos específicos para cada usuario creado
        for (Student student : students) {
            System.out.println("\nUsuario: " + student.getUsername() + " (ID: " + student.getId() + ")");
            System.out.println("  - Contenidos publicados: " + (student.getPublishedContents() != null ? student.getPublishedContents().getSize() : 0));
            System.out.println("  - Solicitudes de ayuda: " + (student.getHelpRequests() != null ? student.getHelpRequests().getSize() : 0));
            System.out.println("  - Grupos de estudio: " + (student.getStudyGroups() != null ? student.getStudyGroups().getSize() : 0));
            System.out.println("  - Intereses: " + (student.getInterests() != null ? student.getInterests().getSize() : 0));
            
            // Verificar estadísticas usando los métodos de TheKnowledgeBay
            int contentCount = theKnowledgeBay.getContentCountByUserId(student.getId());
            int helpRequestCount = theKnowledgeBay.getHelpRequestCountByUserId(student.getId());
            int groupCount = theKnowledgeBay.getUserStudyGroupCount(student.getId());
            System.out.println("  - Estadísticas del sistema:");
            System.out.println("    * Contenidos: " + contentCount);
            System.out.println("    * Solicitudes: " + helpRequestCount);
            System.out.println("    * Grupos: " + groupCount);
        }

        // ===== CREAR LIKES Y COMENTARIOS =====
        System.out.println("\nCreando likes y comentarios para los contenidos...");
        
        // Arrays de comentarios realistas por tipo de contenido
        String[] commentosArticulos = {
            "Excelente explicación, me ayudó mucho a entender el concepto.",
            "¿Podrías agregar un ejemplo práctico?",
            "Muy útil, gracias por compartir.",
            "Gran artículo, lo voy a guardar para referencia.",
            "Esto me aclara muchas dudas que tenía."
        };
        
        String[] commentosPreguntas = {
            "Yo tuve el mismo problema, te recomiendo revisar la documentación oficial.",
            "¿Ya intentaste con esta solución?",
            "Me parece que el problema podría estar en la configuración.",
            "Tengo una experiencia similar, te escribo por privado.",
            "Buena pregunta, también me interesa la respuesta."
        };
        
        String[] commentosVideosLinks = {
            "Gran recurso, lo voy a usar para estudiar.",
            "El video explica muy bien los conceptos.",
            "¿Alguien tiene recursos similares?",
            "Me gustó mucho este contenido.",
            "Muy recomendado, gracias por compartirlo."
        };
        
        // Agregar likes y comentarios de forma realista
        for (Content content : allContents) {
            // Determinar número de likes según el tipo de contenido
            int maxLikes = switch (content.getContentType()) {
                case ARTICLE -> 6; // Artículos suelen tener más likes
                case QUESTION -> 4; // Preguntas menos likes pero más comentarios
                case VIDEO, LINK -> 5; // Videos y links engagement medio
                case RESOURCE -> 4; // Recursos engagement medio
            };
            
            // Agregar likes
            addLikesToContent(content, students, maxLikes);
            
            // Agregar comentarios (no todos los contenidos tendrán comentarios)
            boolean shouldHaveComments = random.nextBoolean(); // 50% chance
            if (shouldHaveComments) {
                int numComments = random.nextInt(3) + 1; // 1-3 comentarios
                
                // Seleccionar array de comentarios según el tipo
                String[] comentariosArray = switch (content.getContentType()) {
                    case ARTICLE, RESOURCE -> commentosArticulos;
                    case QUESTION -> commentosPreguntas;
                    case VIDEO, LINK -> commentosVideosLinks;
                };
                
                // Agregar comentarios de diferentes usuarios
                List<Student> availableCommenters = new ArrayList<>();
                for (Student student : students) {
                    if (!student.getId().equals(content.getAuthor().getId())) {
                        availableCommenters.add(student);
                    }
                }
                
                for (int i = 0; i < Math.min(numComments, availableCommenters.size()); i++) {
                    int randomStudentIndex = random.nextInt(availableCommenters.size());
                    Student commenter = availableCommenters.remove(randomStudentIndex);
                    
                    int randomCommentIndex = random.nextInt(comentariosArray.length);
                    String commentText = comentariosArray[randomCommentIndex];
                    
                    createCommentForContent(content, commenter, commentText);
                }
            }
        }
        
        System.out.println("Likes y comentarios agregados exitosamente.");

        // ===== CREAR CHATS ENTRE ESTUDIANTES =====
        System.out.println("\nCreando chats entre estudiantes...");
        createChatsForStudents(students);
        System.out.println("Chats generados exitosamente.");

        System.out.println("\nDatos de prueba comprensivos cargados en español con fechas aleatorias.");
        System.out.println("=== FIN DE LA CARGA DE DATOS ===\n");
    }

    private Interest createAndAddInterest(String name) {
        Interest interest = Interest.builder().name(name).build();
        return theKnowledgeBay.addInterest(interest) ? interest : theKnowledgeBay.findInterestByName(name);
    }

    private Student createStudent(String username, String email, String rawPassword, String firstName, String lastName, LocalDate dob, String bio, DoublyLinkedList<Interest> interests) {
        return Student.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .firstName(firstName)
                .lastName(lastName)
                .dateBirth(dob)
                .biography(bio)
                .interests(interests)
                .build();
    }

    private Content createContentForStudent(Student author, String title, ContentType type, String information, DoublyLinkedList<Interest> topics, LocalDate date) {
        System.out.println("Creando contenido '" + title + "' para usuario: " + author.getUsername() + " (ID: " + author.getId() + ")");
        
        Content content = Content.builder()
                .title(title)
                .contentType(type)
                .information(information)
                .author(author)
                .topics(topics)
                .likedBy(new DoublyLinkedList<>()) 
                .likeCount(0)
                .comments(new DoublyLinkedList<>()) 
                .date(date)
                .build();
                
        if (!theKnowledgeBay.addContent(content)) throw new IllegalStateException("Fixture publication was not saved.");
        return content;
    }

    private void createCommentForContent(Content content, Student author, String text) {
        for (var group : theKnowledgeBay.getStudyGroups()) {
            if (theKnowledgeBay.addGroupComment(group.getId(), PostKind.CONTENT, content.getContentId(),
                    author.getId(), text) != null) return;
        }
    }
    
    // Método helper para agregar likes de forma realista
    private void addLikesToContent(Content content, List<Student> allStudents, int maxLikes) {
        List<Student> availableStudents = new ArrayList<>();
        
        // Excluir al autor del contenido de dar like a su propio contenido
        for (Student student : allStudents) {
            if (!student.getId().equals(content.getAuthor().getId())) {
                availableStudents.add(student);
            }
        }
        
        // Determinar número aleatorio de likes (0 a maxLikes)
        int numLikes = random.nextInt(maxLikes + 1);
        
        // Seleccionar estudiantes aleatorios para dar like
        for (int i = 0; i < Math.min(numLikes, availableStudents.size()); i++) {
            int randomIndex = random.nextInt(availableStudents.size());
            Student studentToLike = availableStudents.remove(randomIndex);
            
            // Usar el método del sistema para dar like
            boolean liked = theKnowledgeBay.likeContent(content.getContentId(), studentToLike.getId());
            if (liked) {
                System.out.println("Like agregado al contenido '" + content.getTitle() + "' por " + studentToLike.getUsername());
            }
        }
    }

    private void createHelpRequestForStudent(Student student, String information, Urgency urgency, DoublyLinkedList<Interest> topics, boolean isCompleted, LocalDate date) {
        System.out.println("Creando solicitud de ayuda para usuario: " + student.getUsername() + " (ID: " + student.getId() + ")");
        
        HelpRequest helpRequest = HelpRequest.builder()
                .student(student)
                .information(information)
                .urgency(urgency)
                .topics(topics)
                .isCompleted(isCompleted)
                .requestDate(date)
                .comments(new DoublyLinkedList<>()) 
                .build();
                
        if (!theKnowledgeBay.addHelpRequest(helpRequest)) throw new IllegalStateException("Fixture help request was not saved.");
    }

    private DoublyLinkedList<Interest> createInterestList(Interest... interests) {
        DoublyLinkedList<Interest> list = new DoublyLinkedList<>();
        for (Interest interest : interests) {
            list.addLast(interest);
        }
        return list;
    }

    private void createChatsForStudents(List<Student> students) {
        LocalDateTime now = LocalDateTime.now();
        int chatIdCounter = 1;
        int messageIdCounter = 1;
        
        // Crear conversaciones basadas en las relaciones de seguimiento existentes
        
        // CHAT 1: Juan Pérez (1) y María López (2) - Discusión académica sobre algoritmos
        Student juan = students.get(0); // ID: 1
        Student maria = students.get(1); // ID: 2
        
        Chat chat1 = createChat(chatIdCounter++, juan, maria);
        
        // Conversación de hace 2 días sobre algoritmos
        LocalDateTime chat1Base = now.minus(2, ChronoUnit.DAYS).withHour(14).withMinute(30);
        
        addMessageToChat(chat1, messageIdCounter++, juan, "Hola María! Vi tu post sobre Quick Sort vs Merge Sort. Muy interesante análisis 👍", chat1Base);
        addMessageToChat(chat1, messageIdCounter++, maria, "¡Hola Juan! Gracias 😊 Me tomó tiempo investigar las diferencias de rendimiento", chat1Base.plusMinutes(5));
        addMessageToChat(chat1, messageIdCounter++, juan, "¿Has probado implementarlos en Java? Estoy teniendo problemas con la recursión del Merge Sort", chat1Base.plusMinutes(8));
        addMessageToChat(chat1, messageIdCounter++, maria, "Sí, es un poco tricky al principio. Te puedo ayudar si quieres. ¿Tienes tiempo mañana?", chat1Base.plusMinutes(12));
        addMessageToChat(chat1, messageIdCounter++, juan, "¡Perfecto! ¿Te parece bien en la biblioteca a las 3 PM?", chat1Base.plusMinutes(15));
        addMessageToChat(chat1, messageIdCounter++, maria, "Excelente, nos vemos ahí. Lleva tu código para revisarlo juntos", chat1Base.plusMinutes(18));
        
        System.out.println("Chat creado entre " + juan.getUsername() + " y " + maria.getUsername() + " con " + chat1.getMessages().getSize() + " mensajes");
        
        // CHAT 2: Juan Pérez (1) y Carlos Gómez (3) - Machine Learning y Java
        Student carlos = students.get(2); // ID: 3
        
        Chat chat2 = createChat(chatIdCounter++, juan, carlos);
        
        // Conversación de hace 1 día sobre ML
        LocalDateTime chat2Base = now.minus(1, ChronoUnit.DAYS).withHour(16).withMinute(45);
        
        addMessageToChat(chat2, messageIdCounter++, carlos, "Juan, vi que estás muy metido en Java. ¿Has pensado en combinar Java con Machine Learning?", chat2Base);
        addMessageToChat(chat2, messageIdCounter++, juan, "¡Carlos! Sí, me interesa mucho. ¿Qué librerías recomiendas para empezar?", chat2Base.plusMinutes(10));
        addMessageToChat(chat2, messageIdCounter++, carlos, "Weka es genial para empezar, y también está DL4J (Deep Learning for Java). Muy potentes", chat2Base.plusMinutes(15));
        addMessageToChat(chat2, messageIdCounter++, juan, "Suena genial! ¿Tienes algún proyecto de ejemplo que pueda revisar?", chat2Base.plusMinutes(20));
        addMessageToChat(chat2, messageIdCounter++, carlos, "Claro, tengo uno de clasificación de texto. Te lo paso por email", chat2Base.plusMinutes(25));
        
        System.out.println("Chat creado entre " + juan.getUsername() + " y " + carlos.getUsername() + " con " + chat2.getMessages().getSize() + " mensajes");
        
        // CHAT 3: María López (2) y Ana Martínez (4) - Estructuras de datos
        Student ana = students.get(3); // ID: 4
        
        Chat chat3 = createChat(chatIdCounter++, maria, ana);
        
        // Conversación de hace 3 horas sobre estructuras de datos
        LocalDateTime chat3Base = now.minus(3, ChronoUnit.HOURS).withMinute(15);
        
        addMessageToChat(chat3, messageIdCounter++, ana, "María, necesito tu ayuda con las listas enlazadas. No logro entender cómo funciona el doble enlace", chat3Base);
        addMessageToChat(chat3, messageIdCounter++, maria, "¡Hola Ana! Las listas doblemente enlazadas son súper útiles. Cada nodo tiene referencia al anterior Y al siguiente", chat3Base.plusMinutes(8));
        addMessageToChat(chat3, messageIdCounter++, ana, "Ah ok, ¿eso significa que puedo recorrer la lista en ambas direcciones?", chat3Base.plusMinutes(12));
        addMessageToChat(chat3, messageIdCounter++, maria, "¡Exacto! Es muy útil para implementar operaciones como deshacer/rehacer", chat3Base.plusMinutes(15));
        addMessageToChat(chat3, messageIdCounter++, ana, "Genial! ¿Me podrías explicar la implementación del método remove?", chat3Base.plusMinutes(18));
        addMessageToChat(chat3, messageIdCounter++, maria, "Claro, es un poco más complejo porque hay que actualizar tanto el nodo anterior como el siguiente", chat3Base.plusMinutes(22));
        addMessageToChat(chat3, messageIdCounter++, ana, "Perfecto, ¿podemos vernos después de clase para que me expliques con código?", chat3Base.plusMinutes(25));
        addMessageToChat(chat3, messageIdCounter++, maria, "¡Por supuesto! Nos vemos en el laboratorio de sistemas a las 5", chat3Base.plusMinutes(28));
        
        System.out.println("Chat creado entre " + maria.getUsername() + " y " + ana.getUsername() + " con " + chat3.getMessages().getSize() + " mensajes");
        
        // CHAT 4: Carlos Gómez (3) y Luis Fernández (5) - Deep Learning
        Student luis = students.get(4); // ID: 5
        
        Chat chat4 = createChat(chatIdCounter++, carlos, luis);
        
        // Conversación de hace 6 horas sobre deep learning
        LocalDateTime chat4Base = now.minus(6, ChronoUnit.HOURS).withMinute(30);
        
        addMessageToChat(chat4, messageIdCounter++, luis, "Carlos! Vi tu post sobre TensorFlow. ¿Ya tienes experiencia con redes neuronales?", chat4Base);
        addMessageToChat(chat4, messageIdCounter++, carlos, "Hola Luis! Estoy empezando, pero me fascina el tema. ¿Tú qué tal con Python para ML?", chat4Base.plusMinutes(12));
        addMessageToChat(chat4, messageIdCounter++, luis, "Python es genial para esto. Pandas, NumPy, Scikit-learn... El ecosistema es increíble", chat4Base.plusMinutes(18));
        addMessageToChat(chat4, messageIdCounter++, carlos, "Sí, estoy viendo que Python tiene mucha ventaja sobre Java para ML", chat4Base.plusMinutes(25));
        addMessageToChat(chat4, messageIdCounter++, luis, "Aunque Java está mejorando! DL4J y Weka son opciones sólidas", chat4Base.plusMinutes(30));
        addMessageToChat(chat4, messageIdCounter++, carlos, "¿Conoces algún buen dataset para practicar clasificación?", chat4Base.plusMinutes(35));
        addMessageToChat(chat4, messageIdCounter++, luis, "El Iris dataset es clásico para empezar, y MNIST para imágenes. Te paso unos links", chat4Base.plusMinutes(40));
        
        System.out.println("Chat creado entre " + carlos.getUsername() + " y " + luis.getUsername() + " con " + chat4.getMessages().getSize() + " mensajes");
        
        // CHAT 5: Sofía Rodríguez (6) y Juan Pérez (1) - Spring Framework
        Student sofia = students.get(5); // ID: 6
        
        Chat chat5 = createChat(chatIdCounter++, sofia, juan);
        
        // Conversación de hace 30 minutos sobre Spring
        LocalDateTime chat5Base = now.minus(30, ChronoUnit.MINUTES);
        
        addMessageToChat(chat5, messageIdCounter++, sofia, "Juan, vi que trabajaste con Spring Boot. ¿Qué opinas de Spring Security?", chat5Base);
        addMessageToChat(chat5, messageIdCounter++, juan, "¡Sofía! Está muy bueno pero puede ser complejo al principio. ¿Para qué lo necesitas?", chat5Base.plusMinutes(3));
        addMessageToChat(chat5, messageIdCounter++, sofia, "Estoy desarrollando una API REST y necesito autenticación JWT", chat5Base.plusMinutes(6));
        addMessageToChat(chat5, messageIdCounter++, juan, "Ah perfecto! JWT con Spring Security es muy potente. ¿Ya configuraste el SecurityConfig?", chat5Base.plusMinutes(10));
        addMessageToChat(chat5, messageIdCounter++, sofia, "Todavía no, me está costando entender los filtros y la cadena de seguridad", chat5Base.plusMinutes(13));
        addMessageToChat(chat5, messageIdCounter++, juan, "Es normal, es uno de los temas más complejos. ¿Te ayudo a configurarlo?", chat5Base.plusMinutes(16));
        addMessageToChat(chat5, messageIdCounter++, sofia, "¡Sí por favor! ¿Tienes tiempo ahora? Puedo compartir pantalla", chat5Base.plusMinutes(18));
        addMessageToChat(chat5, messageIdCounter++, juan, "Claro! Dame 5 minutos que termino algo y te ayudo", chat5Base.plusMinutes(20));
        
        System.out.println("Chat creado entre " + sofia.getUsername() + " y " + juan.getUsername() + " con " + chat5.getMessages().getSize() + " mensajes");
        
        // CHAT 6: Ana Martínez (4) y Sofía Rodríguez (6) - Entrevistas técnicas
        Chat chat6 = createChat(chatIdCounter++, ana, sofia);
        
        // Conversación de hace 4 horas sobre entrevistas
        LocalDateTime chat6Base = now.minus(4, ChronoUnit.HOURS).withMinute(45);
        
        addMessageToChat(chat6, messageIdCounter++, ana, "Sofía, vi tu pregunta sobre entrevistas técnicas de Java. ¿Ya tienes alguna entrevista programada?", chat6Base);
        addMessageToChat(chat6, messageIdCounter++, sofia, "¡Hola Ana! Sí, tengo una la próxima semana en una startup. Estoy nerviosa 😅", chat6Base.plusMinutes(7));
        addMessageToChat(chat6, messageIdCounter++, ana, "Es normal estar nerviosa! ¿Has practicado algoritmos y estructuras de datos?", chat6Base.plusMinutes(12));
        addMessageToChat(chat6, messageIdCounter++, sofia, "Un poco, pero siento que me falta práctica con problemas de LeetCode", chat6Base.plusMinutes(18));
        addMessageToChat(chat6, messageIdCounter++, ana, "Te recomiendo empezar con problemas Easy y Medium. ¿Quieres que practiquemos juntas?", chat6Base.plusMinutes(25));
        addMessageToChat(chat6, messageIdCounter++, sofia, "¡Me encantaría! ¿Mañana te parece bien? Podemos hacer pair programming", chat6Base.plusMinutes(30));
        addMessageToChat(chat6, messageIdCounter++, ana, "Perfecto! ¿A las 2 PM en el laboratorio? Podemos resolver algunos problemas de arrays y strings", chat6Base.plusMinutes(35));
        
        System.out.println("Chat creado entre " + ana.getUsername() + " y " + sofia.getUsername() + " con " + chat6.getMessages().getSize() + " mensajes");
        
        // Verificación final
        System.out.println("Total de chats creados: " + theKnowledgeBay.getChats().getSize());
        System.out.println("Total de mensajes generados: " + (messageIdCounter - 1));
    }
    
    private Chat createChat(int chatId, Student studentA, Student studentB) {
        return Chat.builder()
                .chatId(chatId)
                .studentA(studentA)
                .studentB(studentB)
                .messages(new DoublyLinkedList<>())
                .build();
    }
    
    private void addMessageToChat(Chat chat, int messageId, Student sender, String text, LocalDateTime timestamp) {
        Student peer = sender.getId().equals(chat.getStudentA().getId()) ? chat.getStudentB() : chat.getStudentA();
        Message message = theKnowledgeBay.sendMessage(sender.getId(), peer.getId(), text);
        if (message == null) throw new IllegalStateException("Fixture message was not saved.");
        chat.getMessages().addLast(message);
    }
} 