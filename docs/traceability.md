# Requirements → prototype → implementation → evaluation

IDs come from the supplied Milestone 02 report's recap of Milestone 01. Test identifiers below refer to `testing.md` and `usability-testing.md`.

| Requirement | Prototype screens | Implementation | Functional evidence / planned checks | Usability task |
|---|---|---|---|---|
| FR1: report description, photo and GPS | Category, type, area, authority, form, location, confirmation | `screens/report.tsx`, `screens/citizen.tsx`, `services/media.ts`, `utils/complaints.ts` | Automated domain tests 1–3; FT01–FT04, FT06 | UT1 |
| FR2: track from submission to resolution | My Reports, Report Details, Track Complaint | `screens/citizen.tsx`, `screens/progress.tsx`, `hooks/AppContext.tsx` | Domain tests 4–5; FT05, FT07–FT09 | UT2 |
| FR3: automatic status notifications | Notifications, Notification Details | Context submit/assign/changeStatus; account notification screens; cloud batches | FT10–FT11; live cloud notification check pending | UT3 |
| FR4: officer dashboard, prioritization and management | Dashboard, Complaints, Details, Assign, Progress, Settings | `screens/admin.tsx`, `screens/progress.tsx`, role navigation | Domain test 4; FT08–FT09, FT12–FT15 | UT4 |
| FR5: GN division monitoring and coordination | GN management, dashboard/summary (GN view added) | `visibleComplaints`, GN dashboard, division-scoped Firestore query/rules, contact finder | Domain test 6; FT16, FT20 | UT5 |
| NFR1: easy-to-use interface | Structured Variant A, consistent tabs, refined Settings | Shared controls, labelled gear tab, form validation, progress indicator | FT17; five-participant completion/time/error measures pending | All |
| NFR2: fast response | Short single-purpose steps and summary | Local in-memory rendering, persistent saves; cloud snapshots | FT18; device/cloud latency measurements pending | All |
| NFR3: secure user data | Auth and role-specific management | Firebase Auth, locked roles, scoped queries and rules, password reauthentication | Domain test 6; FT19–FT20 and emulator checks pending | UT6 |
| NFR4: 24/7 availability | Login and reporting journey | Local demo needs no backend; optional Firebase managed backend | FT21; no uptime guarantee proven | UT1 |
| NFR5: reliable notifications | Notification list/details | Persisted in-app notification records; Firestore atomic write batches | FT10–FT11; background push not implemented | UT3 |

## CRUD evidence by feature

| Feature / interface group | Create | Read | Update | Delete |
|---|---|---|---|---|
| Citizen report journey | Submit report | Confirmation/detail | Edit submitted report | Delete submitted report |
| My Reports/detail/tracking | — | Search, filter, view timeline | Report edits; resolved feedback | Delete submitted report |
| Notifications | Automatic submit/assign/status record | List/detail | Mark read | Delete notification |
| Profile | Citizen signup/demo profile | View profile | Name, phone, photo; cloud password | Logout is session removal, not profile deletion |
| Officer complaints/assignment | Assignment history/notification | Dashboard/list/detail | Assignment, division, priority, status | Report deletion is reserved for citizen before assignment |
| Service categories | Add category | List/detail | Edit types/priority | Delete unused category |
| User/officer/GN management | Demo profiles; cloud Auth via Console | Search/filter/sort | Role/division/profile/active status | Deactivation replaces destructive account deletion |
| Contacts | Add department | Find/call/email | Edit contact | Delete contact |

The assignment's “at least 2 CRUD operations per interface” needs honest workload mapping. Splash/category selection/login are not database CRUD interfaces by themselves. Group members should explain the complete journeys they own and confirm expected interpretation with their lecturer; do not claim four operations on every static screen.
