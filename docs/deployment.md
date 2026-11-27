# Deployment: one origin, served by Spring

## Docker Compose quick start

From the repository root, use Docker with the Compose plugin. The build uses Node.js 22 and JDK 21; the resulting image contains the built client, the Spring Boot JAR, and a JRE 21. The app runs as UID/GID `10001:10001`; no separate web server or Node.js runtime is needed.

Inject passwords through the process environment or enter them at these Bash prompts. Use a separate password for each account and do not commit either value.

```bash
read -r -s -p 'Moderator password: ' MODERATOR_PASSWORD
printf '\n'
read -r -s -p 'PostgreSQL password: ' POSTGRES_PASSWORD
printf '\n'
export MODERATOR_PASSWORD POSTGRES_PASSWORD
export MODERATOR_EMAIL='moderator@example.invalid'
export COMPOSE_DISABLE_ENV_FILE=1
docker compose up -d --build --wait
```

Open `http://127.0.0.1:8080` and sign in with the configured moderator email and password. Set `KB_APP_PORT` to change the loopback port. PostgreSQL is reachable only on the Compose network. The app waits for PostgreSQL to accept TCP connections and reports readiness through `GET /api/interests` (no sign-in required).

### Volumes and backups

- `pgdata` stores the PostgreSQL 17 cluster at `/var/lib/postgresql/data`. `POSTGRES_PASSWORD` sets the initial role password; changing the environment variable alone does not rotate it in an existing cluster.
- `uploads` stores attachment bytes at `/var/lib/knowledge-bay/uploads`. If you substitute an existing volume or a bind mount, make sure the directory exists and is writable by UID/GID `10001:10001`. Keep it outside the static client tree.
- Restarts and `docker compose down` preserve both named volumes. **Do not use `docker compose down -v` on data you want to keep.** Quiesce writes and back up PostgreSQL and the attachments together. See [persistence](persistence.md) for backups and SQLite cutover.

### Run more than one instance

On one Docker engine, replicas share both the `db` service and the `uploads` volume. To try two replicas locally, give Compose two free loopback ports:

```sh
export KB_APP_PORT=18080-18081
docker compose up -d --scale app=2 --wait
docker compose port --index 1 app 8080
docker compose port --index 2 app 8080
```

Compose chooses a free port from the range for each replica, so check the mapping again after a restart. For deployment, put both instances behind the same TLS reverse proxy and follow the [storage and routing requirements](#reverse-proxy-and-storage) below. A default local named volume is not shared across Docker hosts; use a shared persistent filesystem and the same database and schema for replicas on different hosts.

## Run the packaged JAR without Docker

Build the React application and package the Java server from the repository root. Set the [disposable PostgreSQL test connection](configuration.md#disposable-postgresql-for-tests) before running Maven verification:

```sh
(cd client && npm ci && npm run build)
(cd server && ./mvnw -B verify)
```

Ship both `client/dist/` and `server/target/server-0.0.1-SNAPSHOT.jar`. Leave `VITE_API_BASE_URL` unset at build time for this topology. Supply the [server environment variables](configuration.md#server-environment), including a persistent PostgreSQL 17 database and a private persistent upload directory. Inject `MODERATOR_PASSWORD` from your deployment's secret manager on every instance. It has no default: an unset, empty, or whitespace-only value prevents the server from starting. Flyway migrates the database on startup. Use a non-development profile.

From the directory containing both artifacts in the paths above, start the server. The static resource location must be an absolute `file:` URI with a trailing slash:

```sh
export SPRING_PROFILES_ACTIVE=prod
export SPRING_WEB_RESOURCES_STATIC_LOCATIONS="file:$PWD/client/dist/"
export APP_UPLOADS_DIR="$PWD/data/uploads"
install -d -m 0700 "$APP_UPLOADS_DIR"
java -jar server/target/server-0.0.1-SNAPSHOT.jar
```

For a local smoke test with `SERVER_ADDRESS=127.0.0.1` and `SERVER_PORT=8080`, open `http://127.0.0.1:8080`. Spring serves the compiled assets and returns the SPA shell for client routes such as `/user/123` and `/admin/interests`. React handles redirects; Spring authenticates and authorizes `/api/**` independently.

## Reverse proxy and storage

- Keep the server private behind a TLS reverse proxy. Do not log `Authorization` headers.
- Disable response buffering for `/api/chat/*/events` and allow more than 15 seconds without data; the server sends a heartbeat every 15 seconds.
- All instances must use the same PostgreSQL database and schema, moderator credentials, per-student chat limit, and private upload storage. Sticky HTTP routing is not required. Each instance holds one PostgreSQL connection from its pool for `LISTEN`; keep at least two connections per pool. Use direct connections or session-mode pooling, not transaction-mode pooling. Size the PostgreSQL connection budget for all instances.
- Keep the upload directory outside every static resource root. Back up PostgreSQL and the upload directory together: the database holds metadata, not the uploaded bytes. See [persistence](persistence.md) for the one-time SQLite cutover.

To exercise the packaged app with disposable data before deployment, see the [browser audit instructions](../README.md#testing).
