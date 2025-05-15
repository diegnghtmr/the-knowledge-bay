package co.edu.uniquindio.theknowledgebay.core.repository;

import co.edu.uniquindio.theknowledgebay.core.model.Student;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public class StudentRepository {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public StudentRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Student> findAll() {
        String sql = "SELECT * FROM students";
        return jdbcTemplate.query(sql, studentRowMapper);
    }

    public Student findById(int id) {
        String sql = "SELECT * FROM students WHERE id = ?";
        return jdbcTemplate.queryForObject(sql, studentRowMapper, id);
    }

    public void save(Student student) {
        String sql = """
                INSERT INTO students (id, username, email, password, first_name, last_name, date_birth, biography)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """;

        jdbcTemplate.update(sql,
                student.getId(),
                student.getUsername(),
                student.getEmail(),
                student.getPassword(),
                student.getFirstName(),
                student.getLastName(),
                student.getDateBirth() == null ? null : student.getDateBirth().toString(),
                student.getBiography()
        );
    }

    private final RowMapper<Student> studentRowMapper = (rs, rowNum) -> {
        Student s = new Student();
            s.setId(rs.getString("id"));
            s.setUsername(rs.getString("username"));
            s.setEmail(rs.getString("email"));
            s.setPassword(rs.getString("password"));
            s.setFirstName(rs.getString("last_name"));
            s.setLastName(rs.getString("last_name"));
            s.setDateBirth(LocalDate.parse(rs.getString("date_birth")));
            s.setBiography(rs.getString("biography"));

        return s;
    };

    public void update(Student student) {
        String sql = """
            UPDATE students SET
                username = ?,
                email = ?,
                password = ?,
                first_name = ?,
                last_name = ?,
                date_birth = ?,
                biography = ?
            WHERE id = ?
            """;

        jdbcTemplate.update(sql,
                student.getUsername(),
                student.getEmail(),
                student.getPassword(),
                student.getFirstName(),
                student.getLastName(),
                student.getDateBirth() == null ? null : student.getDateBirth().toString(),
                student.getBiography(),
                student.getId()
        );
    }

}
