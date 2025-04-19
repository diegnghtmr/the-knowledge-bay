package co.edu.uniquindio.theknowledgebay.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/**") // Apply to all API paths...
                .excludePathPatterns("/api/auth/login", "/api/auth/register"); // Exclude only login and register
        // Add more exclusions if other public endpoints are needed later
    }

    // If global CORS configuration is needed instead of @CrossOrigin,
    // uncomment and configure the following:
    // @Override
    // public void addCorsMappings(CorsRegistry registry) {
    //     registry.addMapping("/**") // Apply to all paths
    //             .allowedOrigins("http://localhost:3000", "http://localhost:8080") // Allowed frontend origins
    //             .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
    //             .allowedHeaders("*")
    //             .allowCredentials(true);
    // }
}