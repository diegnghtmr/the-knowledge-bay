package co.edu.uniquindio.theknowledgebay.core.service;

import co.edu.uniquindio.theknowledgebay.core.model.User;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {
    private final Map<String, User> users = new HashMap<>();

    public boolean registerUser(User user) {
        if (users.containsKey(user.getName())) {
            return false;
        }
        users.put(user.getName(), user);
        return true;
    }

    public Optional<User> loginUser(String username, String password) {
        User user = users.get(username);
        if (user != null && user.getPassword().equals(password)) {
            return Optional.of(user);
        }
        return Optional.empty();
    }

    public boolean isEmailTaken(String email) {
        return users.values().stream()
                .anyMatch(user -> user.getEmail().equals(email));
    }
}