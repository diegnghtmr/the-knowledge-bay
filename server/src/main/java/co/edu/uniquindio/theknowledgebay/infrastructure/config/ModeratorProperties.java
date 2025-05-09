package co.edu.uniquindio.theknowledgebay.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "moderator")
public record ModeratorProperties(String name, String email, String password) {

}
