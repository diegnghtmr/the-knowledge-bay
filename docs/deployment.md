# Deployment: one origin, served by Spring

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
java -jar server/target/server-0.0.1-SNAPSHOT.jar
```

For a local smoke test with `SERVER_ADDRESS=127.0.0.1` and `SERVER_PORT=8080`, open `http://127.0.0.1:8080`. Spring serves the compiled assets and returns the SPA shell for client routes such as `/user/123` and `/admin/interests`. React handles redirects; Spring authenticates and authorizes `/api/**` independently.

## Reverse proxy and storage

- Keep the server private behind a TLS reverse proxy. Do not log `Authorization` headers.
- Disable response buffering for `/api/chat/*/events` and allow more than 15 seconds without data; the server sends a heartbeat every 15 seconds.
- All instances must use the same PostgreSQL database and schema, moderator credentials, per-student chat limit, and private upload storage. Sticky HTTP routing is not required. Each instance holds one PostgreSQL connection from its pool for `LISTEN`; keep at least two connections per pool. Use direct connections or session-mode pooling, not transaction-mode pooling. Size the PostgreSQL connection budget for all instances.
- Keep the upload directory outside every static resource root. Back up PostgreSQL and the upload directory together: the database holds metadata, not the uploaded bytes. See [persistence](persistence.md) for the one-time SQLite cutover.

To exercise the packaged app with disposable data before deployment, see the [browser audit instructions](../README.md#testing).
