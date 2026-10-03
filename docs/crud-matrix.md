# Mobile operations

| Screen | Member | Working demo operations | Future endpoint |
| --- | --- | --- | --- |
| Login / Sign Up | Shared | Demo login; registration requires API | POST auth/login, auth/register |
| Report flow | K.D.S.S. Ranathunga IT23699762 | Create report, select metadata | POST reports |
| My Reports / Track | I.N. Chinthana IT23699526 | List/read reports and timeline | GET reports |
| Report Details | I.N. Chinthana IT23699526 | Read, update description, delete submitted report | GET/PUT/DELETE reports/:id |
| Notifications | I.N. Chinthana IT23699526 | Read list, mark read | GET notifications, PUT notifications/:id/read |
| Notification Details | I.N. Chinthana IT23699526 | Read, delete | DELETE notifications/:id |
| Profile / Edit Profile | I.N. Chinthana IT23699526 | Read/update local profile | GET/PUT auth/me |
| Change Password | I.N. Chinthana IT23699526 | Requires API | PUT auth/password |

Paths are prefixed by `/api/`. This phase does not meet the original full-stack prompt's “two API CRUD operations per screen” requirement; that requirement belongs to the deferred backend integration.
