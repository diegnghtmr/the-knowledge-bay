package co.edu.uniquindio.theknowledgebay.core.service;

import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Scope(ConfigurableBeanFactory.SCOPE_SINGLETON)
public class SessionManager {

    // Using ConcurrentHashMap for thread safety, although less critical in this simple setup
    private final Map<String, String> activeSessions = new ConcurrentHashMap<>(); // Token -> UserIdentifier (Email)

    /**
     * Creates a new session for the given user identifier.
     * Generates a unique token, stores the mapping, and returns the token.
     *
     * @param userIdentifier The identifier of the user (e.g., email).
     * @return The generated session token.
     */
    public String createSession(String userIdentifier) {
        String token = UUID.randomUUID().toString();
        activeSessions.put(token, userIdentifier);
        System.out.println("Session created: Token " + token + " for user " + userIdentifier); // Logging for debug
        return token;
    }

    /**
     * Checks if the given session token is currently valid (exists in the map).
     *
     * @param token The session token to validate.
     * @return true if the token is valid, false otherwise.
     */
    public boolean isTokenValid(String token) {
        boolean isValid = token != null && activeSessions.containsKey(token);
        // System.out.println("Validating token " + token + ": " + isValid); // Optional: Debug logging
        return isValid;
    }

    /**
     * Retrieves the user identifier associated with the given session token.
     *
     * @param token The session token.
     * @return The user identifier (e.g., email) if the token is valid, null otherwise.
     */
    public String getUserIdentifier(String token) {
        return activeSessions.get(token);
    }

    /**
     * Removes a session, effectively logging the user out from the server's perspective.
     *
     * @param token The session token to remove.
     */
    public void removeSession(String token) {
        if (token != null) {
            String removedUser = activeSessions.remove(token);
            if (removedUser != null) {
                System.out.println("Session removed: Token " + token + " for user " + removedUser); // Logging for debug
            }
        }
    }
}