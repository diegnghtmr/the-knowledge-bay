package co.edu.uniquindio.theknowledgebay.core.repository;

import co.edu.uniquindio.theknowledgebay.core.model.Interest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Locale;

@Repository
public class InterestRepository {
    private static final RowMapper<Interest> INTEREST = (row, number) ->
            new Interest(row.getString("id_interest"), row.getString("name"));
    private final JdbcTemplate jdbc;

    public InterestRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Interest> findAll() {
        return jdbc.query("SELECT * FROM interests ORDER BY id_interest", INTEREST);
    }

    public Interest findById(int id) {
        return findById(Integer.toString(id));
    }

    public Interest findById(String id) {
        if (!StudentRepository.isCanonicalId(id)) return null;
        return jdbc.query("SELECT * FROM interests WHERE id_interest = ?", INTEREST, StudentRepository.numericId(id))
                .stream().findFirst().orElse(null);
    }

    public List<Interest> findByName(String name) {
        if (name == null || name.isBlank()) return List.of();
        String key = normalizeName(name);
        return findAll().stream().filter(interest -> normalizeName(interest.getName()).equals(key)).toList();
    }

    public static String normalizeName(String name) {
        return name.strip().toLowerCase(Locale.ROOT);
    }

    public int save(Interest interest) {
        String name = interest.getName().strip();
        Long id = StudentRepository.numericId(interest.getIdInterest());
        if (id != null) {
            jdbc.update("INSERT INTO interests(id_interest, name) VALUES (?, ?)", id, name);
            ExplicitIdentity.INTEREST.advance(jdbc, id);
        } else {
            interest.setIdInterest(jdbc.queryForObject("INSERT INTO interests(name) VALUES (?) RETURNING id_interest",
                    String.class, name));
        }
        interest.setName(name);
        return 1;
    }

    public int update(Interest interest) {
        return jdbc.update("UPDATE interests SET name = ? WHERE id_interest = ?", interest.getName(), StudentRepository.numericId(interest.getIdInterest()));
    }

    public int deleteById(int id) {
        return deleteById(Integer.toString(id));
    }

    public int deleteById(String id) {
        return jdbc.update("DELETE FROM interests WHERE id_interest = ?", StudentRepository.numericId(id));
    }
}
