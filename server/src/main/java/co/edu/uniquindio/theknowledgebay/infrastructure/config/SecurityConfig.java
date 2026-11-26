package co.edu.uniquindio.theknowledgebay.infrastructure.config;

import co.edu.uniquindio.theknowledgebay.core.service.SessionManager;
import jakarta.servlet.DispatcherType;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration(proxyBeanMethods = false)
@EnableWebSecurity
@EnableAutoConfiguration(exclude = UserDetailsServiceAutoConfiguration.class)
public class SecurityConfig {
    public static final String DEV_TOOLS_PROFILE = "dev & !prod & !production";
    // Public HTML and Vite assets only. All protected data remains behind the /api allowlist below.
    private static final String[] SPA_PATHS = { "/", "/landing", "/login", "/register", "/register/steps", "/terms",
            "/profile", "/user/{userId}", "/chat", "/study-groups", "/help-request", "/publish-content", "/users-dashboard",
            "/content-dashboard", "/affinity-graph", "/admin/analytics", "/admin/interests", "/admin/help-requests", "/admin/stats",
            "/index.html", "/assets/**", "/img/favicon.ico" };

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, SessionManager sessions, Environment environment,
                                            @Qualifier("corsConfigurationSource") CorsConfigurationSource corsConfigurationSource) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .requestCache(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint((request, response, error) -> {
                            response.setHeader(HttpHeaders.WWW_AUTHENTICATE, "Bearer");
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        })
                        .accessDeniedHandler((request, response, error) -> response.setStatus(HttpServletResponse.SC_FORBIDDEN)))
                .addFilterBefore(new BearerSessionFilter(sessions), AnonymousAuthenticationFilter.class)
                .authorizeHttpRequests(routes -> {
                    routes.dispatcherTypeMatchers(DispatcherType.ASYNC).permitAll()
                            .requestMatchers(request -> request.getDispatcherType() == DispatcherType.ERROR
                                    && "/error".equals(request.getServletPath())).permitAll()
                            .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login").permitAll()
                            .requestMatchers(HttpMethod.GET, SPA_PATHS).permitAll()
                            .requestMatchers(HttpMethod.HEAD, SPA_PATHS).permitAll()
                            .requestMatchers(HttpMethod.GET, "/api/interests").permitAll()
                            .requestMatchers(HttpMethod.GET, "/api/admin/stats", "/api/admin/users", "/api/admin/content", "/api/admin/help-requests",
                                    "/api/affinity-graph/data", "/api/affinity-graph/shortest-path", "/api/analytics/dashboard",
                                    "/api/analytics/topic-activity", "/api/analytics/participation-levels", "/api/analytics/community-detection").hasRole("MODERATOR")
                            .requestMatchers(HttpMethod.POST, "/api/interests", "/api/affinity-graph/refresh").hasRole("MODERATOR")
                            .requestMatchers(HttpMethod.PUT, "/api/admin/users/{userId}", "/api/admin/content/{id}",
                                    "/api/admin/help-requests/{id}", "/api/interests/{id}").hasRole("MODERATOR")
                            .requestMatchers(HttpMethod.DELETE, "/api/admin/content/{id}", "/api/admin/help-requests/{id}",
                                    "/api/interests/{id}").hasRole("MODERATOR");
                    if (environment.acceptsProfiles(Profiles.of(DEV_TOOLS_PROFILE))) {
                        routes.requestMatchers(HttpMethod.POST, "/api/import", "/api/test-data/load").hasRole("MODERATOR")
                                .requestMatchers(HttpMethod.GET, "/api/test-data/chats-status").hasRole("MODERATOR");
                    }
                    routes.requestMatchers(HttpMethod.GET, "/api/auth/session", "/api/profile", "/api/profile/{userId}",
                                    "/api/users", "/api/users/search", "/api/content", "/api/content/{id}", "/api/content/{id}/attachment",
                                    "/api/help-requests", "/api/help-requests/{id}", "/api/studygroups", "/api/studygroups/{id}",
                                    "/api/studygroups/{id}/posts").authenticated()
                            .requestMatchers(HttpMethod.POST, "/api/auth/logout").authenticated()
                            .requestMatchers(HttpMethod.PUT, "/api/profile").authenticated()
                            .requestMatchers(HttpMethod.GET, "/api/chat/contacts", "/api/chat/contacts/search",
                                    "/api/chat/{contactId}/messages", "/api/chat/{contactId}/events").hasRole("STUDENT")
                            .requestMatchers(HttpMethod.POST, "/api/chat/send", "/api/content", "/api/content/{id}/like",
                                    "/api/help-requests", "/api/users/{id}/follow", "/api/studygroups/{groupId}/posts/{postId}/like",
                                    "/api/studygroups/{groupId}/posts/{postId}/comments").hasRole("STUDENT")
                            .requestMatchers(HttpMethod.PUT, "/api/help-requests/{id}/complete").hasRole("STUDENT")
                            .requestMatchers(HttpMethod.DELETE, "/api/content/{id}/like", "/api/users/{id}/follow",
                                    "/api/studygroups/{groupId}/posts/{postId}/like").hasRole("STUDENT")
                            .anyRequest().denyAll();
                });
        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
