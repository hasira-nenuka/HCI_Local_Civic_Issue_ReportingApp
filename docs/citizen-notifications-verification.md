# Citizen notification verification and interface refresh

Verified on 15 October 2026 (Asia/Colombo).

## Real data flow

- Report wizard -> AppContext.submit -> cloudStore.save -> atomic complaint and notification write.
- Assignment -> AppContext.assign -> complaint history plus citizen notification in one transaction.
- Progress -> AppContext.changeStatus -> changed status/history plus notification in one transaction; repeating a status does not generate another notification.
- cloudStore.load/watch query notifications using the signed-in user's UID. Firestore snapshot updates feed the home summary, bell count and notifications list.
- Opening an update persists `read: true`; direct notification links also mark it read. Deletion persists after confirmation. Failed writes display an error.

## Changes

Newest-first owner-scoped notification ordering, unread filter, bell badge, highlighted unread cards, direct-link read handling and deletion confirmation. Matching blue, mint and amber citizen layouts cover home, categories, report steps, report list/details/editing, tracking, registration, profile, profile editing, password, help, about and notification detail screens. Existing illustrated assets are reused; no new image storage is required. GPS remains optional.

## Verification performed

- Real Firebase client SDK: create notification, receive live unread/read snapshots, sign out and sign back in to verify saved read state, deny another citizen access, delete and confirm absence through the owner's collection query.
- Real Firebase workflow: create a temporary report and submission notification atomically; an officer updates Assigned, In Progress and Resolved with atomic notifications; the citizen listener receives all four events and reads the final status.
- Temporary verification documents were removed. Existing reports and notifications were preserved.
- Browser checks at 320 and 390 pixels: report submission without GPS, notification opening/read/deletion confirmation, unread filter, dashboard options, dark appearance and profile navigation. No page errors or horizontal overflow.
- Domain tests and notification ownership/sorting/count tests, TypeScript and lint.

## Phone verification

1. Restart or reload Expo. Sign in as a citizen and note the bell count.
2. Submit a report with an address, with or without GPS. A submission update should appear under Notifications.
3. Sign in as an officer on another device/browser, assign an active officer and move the report forward.
4. Keep the citizen signed in. New updates should arrive without manually reloading.
5. Open an unread update: the unread count should fall and remain changed after signing in again.
6. Delete an update and confirm; it should remain deleted after signing in again.
7. Check both light and dark mode from the home options menu.

These are persistent in-app notifications. Operating-system push alerts while the app is closed are not implemented. Notifications do not request phone notification permission or use push tokens.
