package co.edu.uniquindio.theknowledgebay;

import co.edu.uniquindio.theknowledgebay.infrastructure.config.ModeratorProperties;
import co.edu.uniquindio.theknowledgebay.infrastructure.persistence.SqliteImport;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationEnvironmentPreparedEvent;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.context.ApplicationListener;

@SpringBootApplication
@EnableConfigurationProperties(ModeratorProperties.class)
public class App {

	public static void main(String[] args) {
		if (args.length > 0 && "--import-sqlite".equals(args[0])) {
			System.exit(SqliteImport.run(args));
		}
		var application = new SpringApplication(App.class);
		// Read the resolved configuration before Spring prints its banner or creates any beans.
		application.addListeners((ApplicationListener<ApplicationEnvironmentPreparedEvent>) event -> {
			var password = Binder.get(event.getEnvironment()).bind("moderator.password", String.class).orElse("");
			if (password.isBlank()) {
				System.err.println("MODERATOR_PASSWORD is required: set it to the moderator account password.");
				System.exit(1);
			}
		});
		application.run(args);
	}

}