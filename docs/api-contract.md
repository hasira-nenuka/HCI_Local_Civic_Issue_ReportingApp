# Future backend contract

`EXPO_PUBLIC_API_URL` enables API mode. Native JWTs are stored in SecureStore, and requests use an Authorization Bearer header. Responses can return direct objects/arrays or `{user}`, `{report}`, `{reports}`, `{notifications}` wrappers. Errors should return `{message}` with a non-2xx status.

| Action | REST endpoint |
| --- | --- |
| Register | POST /api/auth/register |
| Login | POST /api/auth/login → `{token, user}` |
| Restore profile | GET /api/auth/me |
| Edit profile | PUT /api/auth/me |
| Change password | PUT /api/auth/password |
| Read reports | GET /api/reports |
| Create report | POST /api/reports (multipart) |
| Edit submitted description | PUT /api/reports/:id |
| Cancel submitted report | DELETE /api/reports/:id |
| Read notifications | GET /api/notifications |
| Mark read | PUT /api/notifications/:id/read |
| Delete notification | DELETE /api/notifications/:id |

User: `{name, email, mobile, role}` with role `citizen` or `officer`.

Report: `{id, category, subtype, area, authority, description, photo?, location: {latitude, longitude, address}, status, createdAt, timeline: [{status, at}]}`. Category identifiers: water, road, garbage, streetlight, environment, other. Dates are ISO 8601 strings. IDs are public complaint IDs without the leading #. A server using MongoDB `_id` must map it to this public `id` or expose a separate route identifier and update the client accordingly.

Create report includes string fields category, subtype, area, authority, description, JSON location, and optional binary photo. The server must validate ownership, role, size, content, and transitions. A server photo should be an absolute URL. Local avatar URIs in Edit Profile need a separate server upload implementation before enabling persistent server avatars.

Notification: `{id, title, message, reportId, read, createdAt, tint?}`. Tint is a theme key such as blueTint, orangeTint, greenTint, purpleTint.

This adapter is preparation for a later backend phase. It does not implement server-side authorization, database persistence, push registration, meta/options fetching, server search, or report detail fetching. The present UI filters the fetched report list locally.
