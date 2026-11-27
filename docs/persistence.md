# Persistence

PostgreSQL 17 is the durable store for accounts, interests, publications, help requests, follows, groups, comments, chats, sessions, and attachment metadata. Flyway applies [versioned migrations](../server/src/main/resources/db/migration/) at startup. The Java domain facade delegates writes to repositories; related changes such as registering a student and assigning their interests commit together even when several app instances use the same database. Group membership is derived from interests, and group feeds resolve the same posts as the global feed.

## Sessions and messages

Spring Security authenticates protected requests using opaque bearer tokens. Passwords are hashed with BCrypt. PostgreSQL stores only the SHA-256 fingerprint of a session token, together with its actor and expiry. Sessions survive server restarts and work on any instance. Logout revokes the current token, a password change revokes the student's sessions, and changing the configured moderator email or password revokes moderator sessions on startup.

Chat writes and the ID-only PostgreSQL notification commit together. Every instance listens to notifications and reloads the message for the authorized conversation before sending it to its connected participants. Logout and other student session deletions wake streams to recheck authentication. A database lease limits concurrent streams per student across all instances; active streams renew the lease and abandoned leases expire after 45 seconds. HTTP history is the source of truth when a stream disconnects or a notification is missed. See the [API notes](api.md#chat).

## Copy an existing SQLite database once

1. Stop the old application and take a consistent backup of its SQLite database and private upload directory. If SQLite uses WAL, use SQLite's backup mechanism or take a complete, offline snapshot; do not copy only the main file while there are uncheckpointed writes.
2. Provision an **empty PostgreSQL 17 database** and set `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD` as in [configuration](configuration.md#server-environment). The role must be able to migrate and write the target schema. Do not start the new application before the copy.
3. Run the packaged server in offline copy mode from a deployment shell:

   ```sh
   java -jar server/target/server-0.0.1-SNAPSHOT.jar --import-sqlite /absolute/path/to/sqlite-backup.sqlite
   ```

   The command opens SQLite read-only, applies any pending Flyway migrations, and copies the application data in one PostgreSQL transaction. It preserves IDs, their allocation high-water marks, relationship order, attachment metadata, and the existing session fingerprints and expiry times. It refuses a nonempty target. If a source row violates a PostgreSQL constraint, no rows from the copy are committed; migrations may already be applied. The old database is not altered.
4. Copy the **contents** of the backed-up private upload directory to `APP_UPLOADS_DIR`, keeping filenames and permissions. The database copy does not move attachment files. Use the same moderator email and password if existing moderator sessions should remain valid. Start the new server, check login, history and an existing attachment, and keep both backups until cutover is verified.

## Attachment storage and backups

Resource attachments keep their metadata with the post in PostgreSQL and store their bytes in a private upload directory. Signed-in readers can download them only under the post's access rules. Legacy name-only posts still display the original text; no file is created for them.

All instances must use the same private persistent upload directory, outside all static resource locations. Back up the database and upload directory together; quiesce writes when taking a coordinated backup. See the [server persistence contract](../server/docs/persistence-contract.md) for transaction, identity, and read-projection details.
