package co.edu.uniquindio.theknowledgebay;

import co.edu.uniquindio.theknowledgebay.infrastructure.config.ModeratorProperties;
import co.edu.uniquindio.theknowledgebay.infrastructure.persistence.SqliteImport;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(ModeratorProperties.class)
public class App {

	public static void main(String[] args) {
		if (args.length > 0 && "--import-sqlite".equals(args[0])) {
			System.exit(SqliteImport.run(args));
		}
		SpringApplication.run(App.class, args);
	}

}