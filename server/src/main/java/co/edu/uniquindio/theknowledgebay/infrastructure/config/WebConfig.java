package co.edu.uniquindio.theknowledgebay.infrastructure.config;

import co.edu.uniquindio.theknowledgebay.api.controller.ChatEvents;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.VirtualThreadTaskExecutor;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.AsyncSupportConfigurer;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.Clock;

@Configuration(proxyBeanMethods = false)
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void configureAsyncSupport(AsyncSupportConfigurer configurer) {
        // The chat stream owns a bounded slot; idle connections don't occupy servlet platform threads.
        configurer.setTaskExecutor(new VirtualThreadTaskExecutor("kb-stream-"));
        configurer.setDefaultTimeout(320_000);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override
            public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception error) {
                ChatEvents.cancelUnstarted(request);
            }
        }).addPathPatterns("/api/chat/{contactId}/events");
    }

    @Bean
    Clock sessionClock() {
        return Clock.systemUTC();
    }
}
