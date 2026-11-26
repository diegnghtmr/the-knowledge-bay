package co.edu.uniquindio.theknowledgebay.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration(proxyBeanMethods = false)
public class WebConfig {
    @Bean
    Clock sessionClock() {
        return Clock.systemUTC();
    }
}
