package co.edu.uniquindio.theknowledgebay.api.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {
    // Keep this allowlist in sync with the public shell routes in SecurityConfig and client/src/App.jsx.
    @GetMapping({ "/", "/landing", "/login", "/register", "/register/steps", "/terms", "/profile", "/user/{userId}",
            "/chat", "/study-groups", "/help-request", "/publish-content", "/users-dashboard", "/content-dashboard",
            "/affinity-graph", "/admin/analytics", "/admin/interests", "/admin/help-requests", "/admin/stats" })
    public String forward() {
        return "forward:/index.html";
    }
}