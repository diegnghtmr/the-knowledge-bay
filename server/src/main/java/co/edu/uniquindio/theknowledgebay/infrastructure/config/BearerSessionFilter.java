package co.edu.uniquindio.theknowledgebay.infrastructure.config;

import co.edu.uniquindio.theknowledgebay.api.config.ApiFailure;
import co.edu.uniquindio.theknowledgebay.core.service.SessionManager;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public final class BearerSessionFilter extends OncePerRequestFilter {
    public static final String SESSION_TOKEN_ATTRIBUTE = "knowledgeBay.bearerSessionToken";
    private static final String PREFIX = "Bearer ";
    private final SessionManager sessions;

    BearerSessionFilter(SessionManager sessions) {
        this.sessions = sessions;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        var headers = request.getHeaders(HttpHeaders.AUTHORIZATION);
        if (headers.hasMoreElements()) {
            String header = headers.nextElement();
            if (!headers.hasMoreElements() && header.length() == PREFIX.length() + 36
                    && header.regionMatches(true, 0, PREFIX, 0, PREFIX.length())) {
                String token = header.substring(PREFIX.length());
                sessions.authenticate(token).ifPresent(user -> {
                    var context = SecurityContextHolder.createEmptyContext();
                    context.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(user, null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + user.role().name()))));
                    SecurityContextHolder.setContext(context);
                    request.setAttribute(SESSION_TOKEN_ATTRIBUTE, token);
                });
            }
        }
        String requestId = UUID.randomUUID().toString();
        response.setHeader("X-Request-Id", requestId);
        try (var ignored = MDC.putCloseable(ApiFailure.REQUEST_ID, requestId)) {
            chain.doFilter(request, response);
        } finally {
            request.removeAttribute(SESSION_TOKEN_ATTRIBUTE);
        }
    }
}
