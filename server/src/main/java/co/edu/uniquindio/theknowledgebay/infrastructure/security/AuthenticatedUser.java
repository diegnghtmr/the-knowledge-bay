package co.edu.uniquindio.theknowledgebay.infrastructure.security;

/**
 * The authenticated caller, resolved once per request from the bearer token.
 * Controllers receive it with {@code @AuthenticationPrincipal AuthenticatedUser user}
 * and must never take the acting user's id from the request body or a fallback.
 */
public record AuthenticatedUser(String id, Role role) {

  public enum Role { STUDENT, MODERATOR }

  public boolean isModerator() {
    return role == Role.MODERATOR;
  }
}
