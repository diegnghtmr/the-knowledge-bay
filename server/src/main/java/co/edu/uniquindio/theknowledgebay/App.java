package co.edu.uniquindio.theknowledgebay;

import co.edu.uniquindio.theknowledgebay.infrastructure.config.ModeratorProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(ModeratorProperties.class)
public class App {

	public static void main(String[] args) {
		SpringApplication.run(App.class, args);
	}

}