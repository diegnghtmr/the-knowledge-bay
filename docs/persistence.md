# Persistence

SQLite is the durable store for student accounts, interests, publications, help requests, follows, groups, comments, and messages. Only the server opens the database. The Java domain facade delegates writes to repositories; related changes such as registering a student and assigning their interests commit together. Group membership is derived from interests, and group feeds resolve the same posts as the global feed. Feed, affinity graph, and analytics views are built from stored records rather than kept as separate copies.

## Sessions and messages

Spring Security resolves an opaque bearer token to a student or moderator before protected handlers run. Passwords are hashed with BCrypt. SQLite stores only the SHA-256 fingerprint of a session token, together with its actor and expiry. A session survives a restart against the same database unless it has expired or been revoked. Logout revokes the current token; a password change revokes the student's sessions, and a change to the configured moderator email or password revokes moderator sessions on startup.

Chat messages are written to SQLite before they are published to the live stream. Streams themselves are in-process, so HTTP history remains available across reconnects and restarts. See the [API notes](api.md#chat) for reconnect and rate-limit behavior.

## Attachment storage and backups

Resource attachments keep their metadata with the post in SQLite and store their actual bytes in a private upload directory. Signed-in readers can download the bytes from the group feed or their own publications as allowed by the publication's access rules. Legacy name-only posts still display the original text; no file is created for them.

Keep the database and upload directory on persistent, writable storage and back them up together. Keep the upload directory outside Spring's static resource locations. Apply the idempotent schema at startup for existing and new databases. See [configuration](configuration.md#server-environment) for the database and upload paths and the [server persistence contract](../server/docs/persistence-contract.md) for transaction, identity, and read-projection details.
