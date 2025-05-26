package co.edu.uniquindio.theknowledgebay.core.repository;

import co.edu.uniquindio.theknowledgebay.core.model.Interest;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.converter.ListToDoublyLinkedList;
import co.edu.uniquindio.theknowledgebay.infrastructure.util.datastructures.lists.DoublyLinkedList;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class InterestRepository {

    private final JdbcTemplate jdbcTemplate;

    public InterestRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // RowMapper para convertir filas de la base de datos en objetos Interest
    private static class InterestRowMapper implements RowMapper<Interest> {
        @Override
        public Interest mapRow(ResultSet rs, int rowNum) throws SQLException {
            Interest interest = new Interest();
            interest.setIdInterest(String.valueOf(rs.getInt("id_interest")));
            interest.setName(rs.getString("name"));
            return interest;
        }
    }

    public DoublyLinkedList<Interest> findAll() {
        String sql = "SELECT * FROM interests";
        return ListToDoublyLinkedList.convert(jdbcTemplate.query(sql, new InterestRowMapper()));
    }

    public Interest findById(int id) {
        String sql = "SELECT * FROM interests WHERE id_interest = ?";
        return jdbcTemplate.queryForObject(sql, new InterestRowMapper(), id);
    }

    public DoublyLinkedList<Interest> findByName(String name) {
        String sql = "SELECT * FROM interests WHERE name = ?";
        return ListToDoublyLinkedList.convert(jdbcTemplate.query(sql, new InterestRowMapper(), name));
    }

    public int save(Interest interest) {
        String sql = "INSERT INTO interests(name) VALUES(?)";
        return jdbcTemplate.update(sql, interest.getName());
    }

    // Actualizar un interés existente
    public int update(Interest interest) {
        String sql = "UPDATE interests SET name = ? WHERE id_interest = ?";
        return jdbcTemplate.update(sql, interest.getName(), interest.getIdInterest());
    }

    // Eliminar por ID
    public int deleteById(int id) {
        String sql = "DELETE FROM interests WHERE id_interest = ?";
        return jdbcTemplate.update(sql, id);
    }
}
