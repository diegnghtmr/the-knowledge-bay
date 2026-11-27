package co.edu.uniquindio.theknowledgebay;

import co.edu.uniquindio.theknowledgebay.core.service.AttachmentStorage;
import co.edu.uniquindio.theknowledgebay.infrastructure.config.ModeratorProperties;
import co.edu.uniquindio.theknowledgebay.infrastructure.persistence.SqliteImport;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationEnvironmentPreparedEvent;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.context.ApplicationListener;

import java.io.IOException;
import java.nio.file.InvalidPathException;

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
			var environment = event.getEnvironment();
			var binder = Binder.get(environment);
			var password = binder.bind("moderator.password", String.class).orElse("");
			if (password.isBlank()) {
				System.err.println("MODERATOR_PASSWORD is required: set it to the moderator account password.");
				System.exit(1);
			}
			var directory = binder.bind("app.uploads.dir", String.class).orElse(AttachmentStorage.DEFAULT_DIRECTORY);
			try {
				new AttachmentStorage(directory, environment).verifyWritableDirectory();
			} catch (IOException | InvalidPathException | SecurityException e) {
				System.err.println("APP_UPLOADS_DIR must point to an existing, writable attachments directory.");
				System.exit(1);
			}
		});
		application.run(args);
	}

}