package co.edu.uniquindio.theknowledgebay;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.extension.AfterEachCallback;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.test.context.ContextConfiguration;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.UUID;

final class PostgresTestSchema implements AutoCloseable, AfterEachCallback {
    private final String name;
    private final DriverManagerDataSource base;

    PostgresTestSchema() {
        this("kb_test_" + UUID.randomUUID().toString().replace("-", ""), true);
    }

    private PostgresTestSchema(String name, boolean create) {
        if (!name.matches("kb_test_[0-9a-f]{32}")) throw new IllegalArgumentException("Not a test schema");
        this.name = name;
        this.base = new DriverManagerDataSource(required("KB_TEST_DB_URL"),
                required("KB_TEST_DB_USER"), required("KB_TEST_DB_PASSWORD"));
        if (create) new JdbcTemplate(base).execute("CREATE SCHEMA " + name);
    }

    static PostgresTestSchema existing(String name) {
        return new PostgresTestSchema(name, false);
    }

    String name() { return name; }
    String url() { return base.getUrl() + (base.getUrl().contains("?") ? "&" : "?") + "currentSchema=" + name; }
    String user() { return base.getUsername(); }
    String password() { return base.getPassword(); }

    DriverManagerDataSource migrate() {
        var source = new DriverManagerDataSource(url(), user(), password());
        Flyway.configure().dataSource(source).load().migrate();
        return source;
    }

    private static String required(String key) {
        String value = System.getenv(key);
        if (value == null || value.isBlank()) throw new IllegalStateException("Set " + key + " for the disposable PostgreSQL test database");
        return value;
    }

    @Override
    public void afterEach(ExtensionContext context) {
        close();
    }

    @Override
    public void close() {
        new JdbcTemplate(base).execute("DROP SCHEMA " + name + " CASCADE");
    }

    @Target(ElementType.TYPE)
    @Retention(RetentionPolicy.RUNTIME)
    @ContextConfiguration(initializers = Initializer.class)
    @interface Isolated {}

    public static final class Initializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
        @Override
        public void initialize(ConfigurableApplicationContext context) {
            var schema = new PostgresTestSchema();
            var beanFactory = (org.springframework.beans.factory.support.DefaultListableBeanFactory) context.getBeanFactory();
            beanFactory.registerDisposableBean("postgresTestSchema", schema::close);
            TestPropertyValues.of(
                    "spring.datasource.url=" + schema.url(),
                    "spring.datasource.username=" + schema.user(),
                    "spring.datasource.password=" + schema.password(),
                    "spring.datasource.hikari.maximum-pool-size=4",
                    "spring.datasource.hikari.minimum-idle=0",
                    "spring.sql.init.mode=never").applyTo(context);
        }
    }
}
