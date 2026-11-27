# Configuration

Set the server variables in the process environment before starting the JAR. See the [quick start](../README.md#quick-start) for a working local configuration and [deployment](deployment.md) for the packaged topology.

## Server environment

| Variable | Purpose | Default |
| --- | --- | --- |
| `MODERATOR_NAME` | Display name of the deployment moderator. | Override for your deployment |
| `MODERATOR_EMAIL` | Sign-in email of the deployment moderator. | Override for your deployment |
| `MODERATOR_PASSWORD` | Private password of the deployment moderator; it must be nonblank and at most 72 UTF-8 bytes. Supply it through the process environment, not a command-line argument or a file committed to Git. | Required |
| `SPRING_DATASOURCE_URL` | PostgreSQL 17 JDBC URL, e.g. `jdbc:postgresql://db.example.invalid:5432/knowledge_bay`. Use the same database and schema on all instances. Do not put credentials in the URL. | Required |
| `SPRING_DATASOURCE_USERNAME` | PostgreSQL role with permission to run Flyway migrations and use the application schema. | Required |
| `SPRING_DATASOURCE_PASSWORD` | PostgreSQL password. Supply it through the process environment or your deployment's secret manager. | Required for password authentication |
| `APP_SESSIONS_TTL` | Positive lifetime for newly issued sessions, expressed as a duration. The expiry is recorded at login. | `PT8H` |
| `APP_CHAT_MAX_STREAMS_PER_USER` | Positive concurrent SSE connection limit per student across all instances, tokens and tabs; use the same value on every instance. Spring property `app.chat.max-streams-per-user`. | `3` |
| `APP_UPLOADS_DIR` | Private directory for uploaded bytes. Create it before starting the server. Use the same persistent, writable storage on all instances, outside all static resource roots. | `./data/uploads`, relative to the server working directory |
| `APP_CORS_ALLOWED_ORIGINS` | Comma-separated browser origins allowed to make cross-origin requests. A same-origin deployment needs no additional origin. | `http://localhost:3000,http://127.0.0.1:3000` |
| `SPRING_PROFILES_ACTIVE` | Import and synthetic fixture routes require `dev` and moderator authorization. Either `prod` or `production` disables them, even if `dev` is also active. Seed only a disposable development database. | No explicit profile |
| `SPRING_WEB_RESOURCES_STATIC_LOCATIONS` | Directory from which Spring serves the built SPA. For the packaged deployment, supply an absolute `file:` URI with a trailing slash. | `classpath:/invalid-path/` (no packaged SPA served by default) |
| `SERVER_ADDRESS` | Server bind address. Use `127.0.0.1` for local development and smoke tests. | Not set by the app |
| `SERVER_PORT` | Server HTTP port. The development proxy targets `127.0.0.1:8080`. | `8080` |

There is no default `MODERATOR_PASSWORD`. If it is unset, empty, or only whitespace, the server exits with code `1` and prints `MODERATOR_PASSWORD is required: set it to the moderator account password.` before starting.

If the attachments directory is missing, not writable by the server, or inside a static resource directory, the server exits with code `1` and prints `APP_UPLOADS_DIR must point to an existing, writable attachments directory.` before starting.

Changing the configured moderator email or password revokes moderator sessions on the next startup. See [persistence](persistence.md) for the session and storage model.

## Disposable PostgreSQL for tests

Create a disposable PostgreSQL 17 database, or use one database for Maven and another for the packaged audit. Each runner creates and removes only its own isolated test schemas; the supplied role needs permission to create schemas. Never point either runner at production data.

| Variable | Purpose |
| --- | --- |
| `KB_TEST_DB_URL`, `KB_TEST_DB_USER`, `KB_TEST_DB_PASSWORD` | Maven integration-test connection. |
| `KB_SMOKE_DB_URL`, `KB_SMOKE_DB_USER`, `KB_SMOKE_DB_PASSWORD` | Packaged browser audit connection, used by both Spring and `psql`. |

Set each URL to a credential-free PostgreSQL JDBC URL to the disposable database (no `currentSchema`), and supply the password separately.

## Client and browser tests

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Optional API origin used by the client build. Leave it unset for the Vite development proxy and the same-origin Spring deployment. | Unset; the client uses same-origin `/api` |
| `CHROMIUM_PATH` | Path to a specific local Chromium executable for browser tests and the packaged audit. | Unset; the audit uses Playwright's Chromium, and client tests can also use `/usr/bin/chromium` locally |
