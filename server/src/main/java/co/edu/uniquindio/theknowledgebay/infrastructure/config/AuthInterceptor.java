package co.edu.uniquindio.theknowledgebay.infrastructure.config;

import co.edu.uniquindio.theknowledgebay.core.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.util.Optional;

@Component
@Slf4j
public class AuthInterceptor implements HandlerInterceptor {

    @Autowired
    private AuthService authService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            log.debug("Permitting OPTIONS request for CORS preflight: {}", request.getRequestURI());
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        if (token == null) {
            log.warn("Missing or invalid Authorization header for request: {}", request.getRequestURI());
            sendUnauthorized(response, "Missing or invalid Authorization token.");
            return false;
        }

        Optional<String> userEmailOpt = authService.validateToken(token);

        if (userEmailOpt.isEmpty()) {
            log.warn("Invalid session token received: {}", token);
            sendUnauthorized(response, "Invalid session token.");
            return false;
        }

        // Token is valid, add user email to request attribute for potential use downstream
        request.setAttribute("userEmail", userEmailOpt.get());
        log.debug("Authenticated user {} for request: {}", userEmailOpt.get(), request.getRequestURI());
        return true; // Proceed with the request
    }

    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        // Simple JSON error response
        response.getWriter().write(String.format("{\"success\": false, \"message\": \"%s\"}", message));
    }
}