# SQLite persistence contract

`TheKnowledgeBay` is the domain facade. Pass the actor's `AuthenticatedUser.id()` from the controller; input DTOs identify targets, not actors. Returned entities, lists, and graphs are detached snapshots. Editing a snapshot never writes to SQLite; use a facade command.

## A — accounts, interests and import

- `addStudent(Student)` inserts a student and their known interests in one transaction. On success the supplied model has a nonblank persisted `String` ID, allocated by SQLite when absent. Existing imported IDs are kept. Student and interest IDs are opaque strings at the API boundary, backed by positive SQLite integer keys; moderator identity remains deployment-configured. `findUserByEmail(String)` and `getUserById(String)` are lookups, never synthetic account creation. A fresh session after a restart resolves the same student ID. Session tokens are not persisted.
- `findUserByUsername(String)` and `getUsers()` remain available. Registering a duplicate identity can throw `DuplicateKeyException` even after a successful preflight check. `addStudent` and password-changing `updateUser` require an already encoded BCrypt hash. `updateStudent` does not change passwords. The legacy `updateAutomaticStudyGroupsForStudent` call is unnecessary; creating or updating student interests handles group creation atomically.
- Use `getAllInterests`, `findInterestByName`, `addInterest`, `updateInterest` and `deleteInterest`. Interest names are trimmed and compared case-insensitively. Automatic groups use stable IDs and derive their current members from stored interests. Renaming an interest does not change the group's ID.
- `ImportService.processImport(ImportDTO)` is add-only and atomic. It accepts interests and student profiles with stable IDs, valid BCrypt hashes and references to interests already present or in the same batch. Repeating identical rows reports zero inserts; colliding or invalid data aborts the whole batch. Map input errors to a safe client error. Do not log submitted records or raw SQL exceptions.

## D — content, help requests and study groups

- `addContent` and `addHelpRequest` set database-generated integer IDs after success. Two legitimate submissions of the same text are separate writes; duplicate submit prevention is per client intent, not by matching post text. Update/delete/like commands change the canonical records. `getContentPage(offset, limit)` serves an ascending, stable page; `offset >= 0`, `1 <= limit <= 100`. `getAllContent()` remains for compatibility and analytics.
- `getStudyGroups()` resolves group posts by topic and existing stored links, not by copies of post objects. `isStudyGroupMember(groupId, actorId)` tests the requesting student; `setGroupContentLike(groupId, contentId, actorId, liked)` changes the same likes as the global feed and returns `false` for missing membership/association or an unchanged like. Compute `likedByMe` from the canonical content snapshot and the request's actor ID. `addGroupComment(groupId, PostKind.CONTENT | PostKind.HELP, postId, actorId, text)` writes a durable comment or returns `null` for an invalid target, actor or text. `PostKind` is `DomainRepository.PostKind`. Help likes are not supported. `markHelpRequestAsCompleted` only changes a request owned by the supplied student ID.

## E — chat

- `sendMessage(actorId, peerId, text)` persists a message and, if necessary, creates the unordered conversation in the same transaction. Returns the saved `Message` or `null` for an invalid pair, unknown/non-student participant, self-chat, or blank message. Distinct sends get distinct integer IDs even with identical text.
- `getMessagesForChat(actorId, peerId)` returns the pair's messages in ID order, or an empty list. `getChatContacts(actorId)` returns only that student's conversations, each containing at most its newest message. `getChats()` is an administrative snapshot, never a mutation API.

Apply `schema.sql` on startup for existing databases as well as new ones. The schema adds tables and indexes without replacing existing tables. Like totals come from stored like rows, group projections join canonical posts by ID, and writes spanning multiple rows share a transaction. Fixture loaders must use the mutation methods rather than append to lists returned by getters.
