# API notes

## Authentication

Register with `POST /api/auth/register` and sign in with `POST /api/auth/login`. The login response contains the session token, role, and persisted `userId`. Send `Authorization: Bearer <token>` to protected endpoints; do not put tokens in URLs or logs.

Use `GET /api/auth/session` to check the session and `POST /api/auth/logout` to revoke that token. Changing a student's password revokes all of that student's sessions. Changing the moderator email or password in deployment configuration revokes moderator sessions on startup.

## Chat

| Endpoint | Behavior |
| --- | --- |
| `GET /api/chat/contacts/search?query=<term>` | Search other students by username, name, or email, not just existing conversations. |
| `GET /api/chat/contacts` | List existing conversations. |
| `POST /api/chat/send` | Persist a message from the caller using `receiverId` and `text`. |
| `GET /api/chat/{contactId}/messages` | Read saved messages for the caller's thread with that peer. |
| `GET /api/chat/{contactId}/events` | Stream server-sent events (SSE) for the signed-in student's thread with that peer. |

The browser authenticates the stream with the bearer header, reconnects with backoff, and reconciles against HTTP history by message ID so repeated events do not duplicate messages. A request above the per-student or server-wide stream limit returns HTTP `429 Too Many Requests` with `Retry-After: 2` before opening a stream. The browser waits at least that long before retrying and continues to use HTTP history. Configure the student limit in [server environment variables](configuration.md#server-environment).

## Attachments

`POST /api/content` accepts a multipart request with a JSON `content` part and, for a `RESOURCE` publication, a required `file` part. The limit is **5 MiB per file** and **6 MiB per multipart request**. Accepted formats are PDF, PNG, and JPEG. The server checks the file signature/trailer and matching extension, not the submitted MIME type.

`GET /api/content/{id}/attachment` requires the same signed-in access as the publication. It serves the file as a download (`Content-Disposition: attachment` and `X-Content-Type-Options: nosniff`), not inline. Legacy posts that only stored an attachment name remain readable but have no download.

## Study groups

`GET /api/studygroups/{groupId}/posts?page=0&size=10` returns the group's canonical posts. `page` must be at least `0` and `size` must be between `1` and `100`, inclusive.

Group members can post comments with `POST /api/studygroups/{groupId}/posts/{postId}/comments` and add or remove a like on content with `POST` or `DELETE` on `/api/studygroups/{groupId}/posts/{postId}/like`. The bearer session supplies the actor; comment bodies only need `text`.
