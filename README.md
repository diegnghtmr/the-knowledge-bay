# The Knowledge Bay

The Knowledge Bay is a Spanish-language social learning app. Students share articles, links, videos and questions; request help; follow other students; and start private conversations. Study groups are generated from shared interests and pull posts from the same records as the global content API. Moderators manage users, content, interests and help requests, and can explore the affinity graph and activity dashboards.

Resource publications record the attachment name, not the uploaded bytes; there is no download API. Chat uses HTTP requests rather than a live WebSocket connection.

## Architecture

- `client/`: React 19, React Router, Vite and Tailwind CSS. The browser calls `/api` on the same origin; routes for chat, profiles and moderation are loaded on demand.
- `server/`: Java 21, Spring Boot and Spring Security. A bearer filter resolves an opaque, expiring session token to a student or moderator. Passwords are hashed with BCrypt. Session tokens are process-local; sign in again after a server restart.
- SQLite is the durable store for student accounts, interests, publications, help requests, follows, groups, comments and messages. The domain facade provides repository-backed writes and projections for the feed and analytics. See the [persistence contract](server/docs/persistence-contract.md).

## Local development

Install **Node.js 22**, **npm** and **JDK 21**. The checked-in Maven wrapper supplies Maven; no separate database service is needed. From the repository root:

```sh
(cd client && npm ci)
(cd server && ./mvnw -B verify)
```

Supply the moderator settings in the server process environment. Use a private password (do not commit it or pass it as a command-line argument). Create a writable directory for the database, for example `mkdir -p data`.

```sh
export MODERATOR_NAME='Local Moderator'
export MODERATOR_EMAIL='moderator@example.invalid'
# Supply MODERATOR_PASSWORD from your shell or secret manager before starting the server.
export SPRING_DATASOURCE_URL="jdbc:sqlite:$PWD/data/knowledge-bay.sqlite?foreign_keys=on&busy_timeout=5000"
export SPRING_SQL_INIT_MODE=always
export SERVER_ADDRESS=127.0.0.1
export SERVER_PORT=8080
java -jar server/target/server-0.0.1-SNAPSHOT.jar
```

In a separate terminal run `cd client && npm run dev`. Open `http://127.0.0.1:3000`; Vite proxies `/api` to the local server. Sign in as the configured moderator to add interests before registering students who want to join a group.

| Server variable | Purpose |
| --- | --- |
| `MODERATOR_NAME`, `MODERATOR_EMAIL`, `MODERATOR_PASSWORD` | Supply the deployment's moderator identity and password. Use a nonblank password of at most 72 UTF-8 bytes. |
| `SPRING_DATASOURCE_URL` | SQLite JDBC URL. Use a file on a persistent, writable volume to retain data across restarts. |
| `SPRING_SQL_INIT_MODE` | Use `always` to apply the idempotent schema at startup. |
| `APP_SESSIONS_TTL` | Positive session lifetime, default `PT8H`. |
| `APP_CORS_ALLOWED_ORIGINS` | Comma-separated allowed browser origins for cross-origin requests. Defaults to `http://localhost:3000,http://127.0.0.1:3000`; same-origin deployment needs no additional origin. |
| `SPRING_PROFILES_ACTIVE` | Import and synthetic fixture routes require `dev` and moderator authorization; `prod` or `production` disables them. Only seed a disposable development database. |

## Deployment: one origin, served by Spring

Build the React application and package the Java server from the repository root:

```sh
(cd client && npm ci && npm run build)
(cd server && ./mvnw -B verify)
```

Ship `client/dist/` and `server/target/server-0.0.1-SNAPSHOT.jar`. Do not set `VITE_API_BASE_URL` for this topology. Set the server variables above with a persistent database and non-development profile. Point Spring at the built client directory using an absolute `file:` URI with a trailing slash:

```sh
export SPRING_PROFILES_ACTIVE=prod
export SPRING_WEB_RESOURCES_STATIC_LOCATIONS="file:$PWD/client/dist/"
java -jar server/target/server-0.0.1-SNAPSHOT.jar
```

Open `http://127.0.0.1:8080` for a local smoke test. Spring serves the compiled assets and returns the SPA shell for client routes such as `/user/123` and `/admin/interests`. React handles redirects; Spring still authenticates and authorizes `/api/**` independently. In production, keep the server private behind a TLS reverse proxy and back up the SQLite database.

## API notes

Register and sign in with `POST /api/auth/register` and `POST /api/auth/login`. The login response contains the session token, role and persisted `userId`. Send `Authorization: Bearer <token>` to protected endpoints. Use `GET /api/auth/session` to check the session and `POST /api/auth/logout` to revoke it.

- **Chat:** `GET /api/chat/contacts/search?query=<term>` searches other students (not just existing conversations) by username, name or email. `GET /api/chat/contacts` lists existing conversations. Send with `POST /api/chat/send` (`receiverId`, `text`) and read a thread with `GET /api/chat/{contactId}/messages`.
- **Groups:** `GET /api/studygroups/{groupId}/posts?page=0&size=10` returns the group's canonical posts (`page >= 0`, `1 <= size <= 100`). Group members can post comments and use `POST`/`DELETE` on `/api/studygroups/{groupId}/posts/{postId}/like` for content. The bearer session supplies the actor; comment bodies only need `text`.

## Tests

```sh
(cd server && ./mvnw -B test)
(cd client && npx playwright install chromium)
(cd client && npm run lint && npm test && npm run build)
```

Maven tests use isolated SQLite databases and need no moderator or datasource overrides. They cover restart persistence, concurrent writes, bearer authorization, role gates and integrated API contracts. Client tests use Vitest and Playwright Chromium with local HTTP fixtures. Set `CHROMIUM_PATH` to use a specific local Chromium executable.

After building the client and packaging the server, run the same packaged browser check as CI:

```sh
node client/tests/production-audit.mjs
```

It starts the JAR on loopback with the production profile, disposable SQLite and generated accounts, exercises the real API and bearer filter in Chromium, then stops the server and removes the test database. No moderator credentials, database settings, or running development server are needed. The portfolio audit can also pass `--shots` to capture the 40 states at both viewports in `../shots-final/` for comparison with its separately stored baseline.

## Team and license

Built at Universidad del Quindío by [Diego Flores](https://github.com/diegnghtmr), [Jorge Acosta](https://github.com/Jorge-ivan-aa) and [July Cartagena](https://github.com/tatianacartagena).

Released under the [MIT License](LICENSE.md).
