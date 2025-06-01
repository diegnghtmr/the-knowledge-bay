package co.edu.uniquindio.theknowledgebay.infrastructure.config;

import java.util.Arrays;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults()) // Apply CORS configuration
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests((authorize) -> authorize
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                        .requestMatchers("/api/auth/**").permitAll() // Permit other auth requests under /api/auth/**
                        .requestMatchers("/api/interests/**").permitAll() // Permit interests API for frontend
                        .requestMatchers(HttpMethod.GET, "/api/profile").permitAll()  // Permit GET profile
                        .requestMatchers(HttpMethod.PUT, "/api/profile").permitAll()  // Permit PUT profile
                        .requestMatchers("/api/profile/**").permitAll() // Permit profile API for frontend
                        .requestMatchers("/api/chat/**").permitAll() // Permit chat endpoints
                        .requestMatchers("/api/help-requests/**").permitAll() // Permit help request endpoints
                        .requestMatchers("/api/content/**").permitAll() // Permit content endpoints
                        .requestMatchers("/api/admin/**").permitAll() // Permit admin endpoints for development
                        .requestMatchers("/api/test-data/load").permitAll() // Permit test data loading endpoint
                        .requestMatchers("/api/users/**").permitAll() // Permit user endpoints
                        .requestMatchers("/api/interests/**").permitAll() // Permit interest management endpoints
                        .requestMatchers("/api/affinity-graph/**").permitAll() // Permit affinity graph endpoints
                        .requestMatchers("/api/analytics/**").permitAll() // Permit analytics endpoints
                        .requestMatchers("/api/import/**").permitAll() // Permit import endpoint
                        .requestMatchers("/api/studygroups/**").permitAll() // Permit study groups endpoints
                        .anyRequest().authenticated() // Secure other endpoints
                );
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*")); // Allow all origins for development
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*")); // Allow all headers
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // Define the PasswordEncoder bean here
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
