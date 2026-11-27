package co.edu.uniquindio.theknowledgebay.core.repository;

import co.edu.uniquindio.theknowledgebay.core.model.Interest;
import co.edu.uniquindio.theknowledgebay.core.model.Student;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Repository
public class StudentRepository {
    private static final Pattern BCRYPT = Pattern.compile("\\$2[aby]\\$(?:0[4-9]|[12][0-9]|3[01])\\$[./A-Za-z0-9]{53}");
    private final JdbcTemplate jdbc;

    public StudentRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Student> findAll() {
        var profiles = profilesById();
        jdbc.query("""
                SELECT si.student_id, i.id_interest, i.name FROM students_interests si
                JOIN interests i ON i.id_interest = si.interest_id ORDER BY si.ordinal
                """, row -> {
            var student = profiles.get(row.getString(1));
            if (student != null) student.getInterests().addLast(new Interest(row.getString(2), row.getString(3)));
        });
        jdbc.query("SELECT follower_id, followed_id FROM follows ORDER BY ordinal", row -> {
            var follower = profiles.get(row.getString(1));
            var followed = profiles.get(row.getString(2));
            if (follower != null && followed != null) {
                follower.getFollowing().addLast(summary(followed));
                followed.getFollowers().addLast(summary(follower));
            }
        });
        return List.copyOf(profiles.values());
    }

    Map<String, Student> profilesById() {
        var result = new LinkedHashMap<String, Student>();
        jdbc.query("SELECT * FROM students ORDER BY id", row -> {
            var student = PROFILE.mapRow(row, 0);
            result.put(student.getId(), student);
        });
        return result;
    }

    public Student findById(int id) {
        return findById(Integer.toString(id));
    }

    public Student findById(String id) {
        var student = findProfile(id);
        if (student == null) return null;
        jdbc.query("""
                SELECT i.id_interest, i.name FROM students_interests si
                JOIN interests i ON i.id_interest = si.interest_id WHERE si.student_id = ? ORDER BY si.ordinal
                """, row -> {
            student.getInterests().addLast(new Interest(row.getString(1), row.getString(2)));
        }, numericId(id));
        jdbc.query("""
                SELECT s.* FROM follows f JOIN students s ON s.id = f.followed_id
                WHERE f.follower_id = ? ORDER BY f.ordinal
                """, PROFILE, numericId(id)).forEach(student.getFollowing()::addLast);
        jdbc.query("""
                SELECT s.* FROM follows f JOIN students s ON s.id = f.follower_id
                WHERE f.followed_id = ? ORDER BY f.ordinal
                """, PROFILE, numericId(id)).forEach(student.getFollowers()::addLast);
        return student;
    }

    public Student findByEmail(String email) {
        return jdbc.query("""
                SELECT * FROM students WHERE lower(email COLLATE "C") = lower(CAST(? AS text) COLLATE "C") ORDER BY id LIMIT 1
                """, PROFILE, email)
                .stream().findFirst().orElse(null);
    }

    public Student findByUsername(String username) {
        // Keep Java's existing case-insensitive behavior for non-ASCII usernames.
        return jdbc.query("SELECT * FROM students ORDER BY id", PROFILE).stream()
                .filter(student -> student.getUsername().equalsIgnoreCase(username)).findFirst().orElse(null);
    }

    public int count() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM students", Integer.class);
    }

    private static Student summary(Student student) {
        return Student.builder().id(student.getId()).username(student.getUsername())
                .firstName(student.getFirstName()).lastName(student.getLastName()).build();
    }

    Student findProfile(String id) {
        if (!isCanonicalId(id)) return null;
        return jdbc.query("SELECT * FROM students WHERE id = ?", PROFILE, numericId(id)).stream().findFirst().orElse(null);
    }

    public void save(Student student) {
        requirePasswordHash(student.getPassword());
        String id = student.getId();
        if (id == null || id.isBlank()) {
            student.setId(jdbc.queryForObject("""
                    INSERT INTO students (username, email, password, first_name, last_name, date_birth, biography)
                    VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id
                    """, String.class, student.getUsername(), student.getEmail(), student.getPassword(),
                    blankIfNull(student.getFirstName()), blankIfNull(student.getLastName()),
                    student.getDateBirth(), student.getBiography()));
        } else {
            Long number = numericId(id);
            if (number == null) throw new IllegalArgumentException("Invalid student ID");
            jdbc.update("""
                    INSERT INTO students (id, username, email, password, first_name, last_name, date_birth, biography)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, number, student.getUsername(), student.getEmail(), student.getPassword(),
                    blankIfNull(student.getFirstName()), blankIfNull(student.getLastName()),
                    student.getDateBirth(), student.getBiography());
            ExplicitIdentity.STUDENT.advance(jdbc, number);
        }
    }

    public void update(Student student) {
        requirePasswordHash(student.getPassword());
        jdbc.update("""
                UPDATE students SET username = ?, email = ?, password = ?, first_name = ?, last_name = ?,
                    date_birth = ?, biography = ? WHERE id = ?
                """, student.getUsername(), student.getEmail(), student.getPassword(),
                blankIfNull(student.getFirstName()), blankIfNull(student.getLastName()),
                student.getDateBirth(), student.getBiography(), numericId(student.getId()));
    }

    public static boolean isCanonicalId(String id) {
        return numericId(id) != null;
    }

    static Long numericId(String id) {
        if (id == null) return null;
        try {
            long number = Long.parseLong(id);
            return number > 0 && Long.toString(number).equals(id) ? number : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public static void requirePasswordHash(String value) {
        if (value == null || !BCRYPT.matcher(value).matches()) {
            throw new IllegalArgumentException("A BCrypt password hash is required");
        }
    }

    private static String blankIfNull(String value) {
        return value == null ? "" : value;
    }

    private static final RowMapper<Student> PROFILE = (row, number) -> {
        return Student.builder().id(row.getString("id")).username(row.getString("username"))
                .email(row.getString("email")).password(row.getString("password"))
                .firstName(row.getString("first_name")).lastName(row.getString("last_name"))
                .dateBirth(row.getObject("date_birth", LocalDate.class))
                .biography(row.getString("biography")).build();
    };
}
