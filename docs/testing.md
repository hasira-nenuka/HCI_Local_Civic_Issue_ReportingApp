# Functional evaluation record

Run from `citizen-connect`. Record actual date, platform, inputs, expected/actual result, screenshots and tester. Tests with “pending” have not been claimed as passed.

## Automated checks

| Check | Command | Result |
|---|---|---|
| Report validation, ownership, category/type | `npm.cmd test` — tests 1–3 | Passed, 3 tests, 3 October 2026 |
| Assignment, forward statuses, history, repeated status | `npm.cmd test` — tests 4–5 | Passed, 2 tests, 3 October 2026 |
| Citizen and GN visibility | `npm.cmd test` — test 6 | Passed, 1 test, 3 October 2026 |
| TypeScript | `npm.cmd run typecheck` | Passed, 3 October 2026 |
| Lint / formatting | `npm.cmd run lint`, `npm.cmd run format:check` | Passed, 3 October 2026 |
| Expo dependency versions | `EXPO_OFFLINE=1 npx.cmd expo install --check` | Up to date against bundled SDK metadata; offline validation limitation reported by Expo |
| Web bundle | `npm.cmd run export:web` | Passed, 3 October 2026 |
| Android Hermes bundle | `npm.cmd run export:android` | Passed, 3 October 2026; not an APK or device execution |
| Interactive web workflows | `npm.cmd run test:e2e` | Passed, 5 tests, Microsoft Edge, 390×844 viewport, 3 October 2026 |
| Firebase rules/Auth/Storage | Configured Firebase/emulators | Pending — no project configured |

## Manual / device cases

| ID | Requirement | Action | Expected result | Result |
|---|---|---|---|---|
| FT01 | FR1 | Submit road/pothole report with area, authority, description and GPS | Unique reference; Submitted status; owned report saved | Web submission with manual coordinates passed; GPS/photo device tests pending |
| FT02 | FR1 | Try next without option; description under 10 chars; invalid coordinates | Clear validation; no invalid report | Domain validation and UI missing-option validation passed; remaining device inputs pending |
| FT03 | FR1 | Choose image/camera, cancel, deny permission | Preview valid photo; cancellation retains form; denial gives fallback | Physical device pending |
| FT04 | FR1 | Deny GPS and enter coordinates/address manually | Submission succeeds with confirmed valid manual location | Web manual coordinates passed; permission denial/device pending |
| FT05 | FR2 | Search reference and filter statuses | Correct report matches; empty state if none | Web reference search/empty state passed; report-status filter device check pending |
| FT06 | FR1/CRUD | Edit then delete your Submitted report | Changes persist; deletion requires confirmation; removed after restart | Passed in web workflow, including cancel/confirm deletion and restart |
| FT07 | FR2 | Try to edit assigned report / another citizen's report | Edit control unavailable and operation rejected | Resolved report edit hidden in web; domain visibility passed; cloud authorization pending |
| FT08 | FR4 | Officer assigns report to active officer/division with note | Assigned history, note, notification saved | Passed in web workflow |
| FT09 | FR2/FR4 | Set In Progress then Resolved; attempt backward transition | Updated timeline and counts; backward move rejected | Domain and web progression/priority/backward rejection passed; dashboard count device check pending |
| FT10 | FR3 | Citizen opens notification after officer status update | Correct reference/body; marked read; complaint opens | Passed in web workflow |
| FT11 | FR3/NFR5 | Delete notification and restart | Notification stays deleted; report remains | Passed in web workflow |
| FT12 | CRUD | Admin creates/edits/deletes unused category; tries used category deletion | Catalog changes persist; used category deletion rejected | Unused category CRUD passed in web; in-use deletion check pending manual evaluation |
| FT13 | CRUD | Admin creates/edits/deletes contact; opens phone/email | Changes persist; device opens supported handler | Contact CRUD passed in web; native phone/email handlers pending |
| FT14 | FR4 | Admin adds demo officer/GN, edits division, disables/enables | Lists/search/filters update; disabled login blocked | Officer create/disable/enable/filter and own-admin-disable safeguard passed; GN creation/division edits/disabled login pending |
| FT15 | CRUD | Edit profile name/phone/photo, logout/login/restart | Saved profile renders; session restored appropriately | Name/phone edit, role logout/login and restart persistence passed; device photo pending |
| FT16 | FR5 | GN with Division 03 views dataset containing Division 04 report | Only Division 03 report/detail/count visible | Domain and web division visibility/read-only assignment/progress checks passed; cloud pending |
| FT17 | NFR1 | Test small screen, keyboard, back navigation and Settings tab | Readable controls, scrollable forms, labelled gear, recoverable back | 390×844 web workflows passed; native keyboard/accessibility/usability participants pending |
| FT18 | NFR2 | Time list load/save on target Android device and Firebase | Record measured times; decide acceptance threshold | Pending |
| FT19 | NFR3 | Firebase login, wrong password, register, password update, disabled account | Correct auth behavior; passwords not stored in profile | Pending |
| FT20 | NFR3/FR5 | SDK/emulator tries role escalation, cross-citizen/division read, unauthorized status write | Firestore/Storage rejects prohibited operations | Pending |
| FT21 | NFR4 | Restart demo offline; try Firebase mode without network | Local records persist; cloud failures visible, no false success | Pending |
| FT22 | CRUD | Citizen rates resolved complaint then updates feedback | Rating/comment saved; officer sees feedback | Feedback create/read and Update Feedback availability passed in web; second edit/staff view pending manual evaluation |

## Issues found and fixed during implementation

| Issue | Evidence | Fix | Retest |
|---|---|---|---|
| Sample dates for single-digit days rendered Invalid Date | Browser workflow snapshot | Zero-padded ISO day in seed data | Correct sample dates in final running-app screenshots |
| Radio accessible names included decorative icon glyphs | Reporting test could not locate text-only radio choice; accessibility snapshot confirmed glyph | Explicit `accessibilityLabel` on radio controls | Complete reporting/assignment workflow passed |
| Bottom tab labels close to browser viewport edge | Screenshot inspection | Increased bar spacing with native safe-area insets | Final screenshots regenerated; all workflows passed |
| Firebase native persistence export missing in browser-first public declarations | TypeScript compilation | Platform-specific persistence adapter with isolated SDK compatibility type | TypeScript, web and Android bundles passed; actual cloud login still pending |
| Filesystem dependency was only implicit | TypeScript unresolved module | Explicit SDK-compatible FileSystem dependency | TypeScript and both bundles passed |

Initial browser test failures caused by overly strict accessible-name selectors and a selected-attribute assumption were corrected in the tests. They are not claimed as business-logic defects. Final browser run: five passed tests in approximately 1.1 minutes. This duration measures the whole automation run, not user task time or app response latency.

Actual exported-app screenshots are in [screenshots](screenshots/README.md). These are browser screenshots of this implementation, not the supplied Figma images and not physical-device evidence.

## Defects / risks to investigate

- No physical Android/iOS device or emulator has yet verified maps, camera, GPS and keyboard behavior.
- Cloud security rules have not been exercised against Firebase Emulator Suite. Client-side visibility tests do not prove server security.
- No live Firebase project exists; multi-device consistency, Auth provisioning, Storage rules and notification delivery remain to be verified.
- Same-document concurrent status changes need additional conflict handling.
- Photo removal does not clean up persisted files/Storage objects automatically.
- OS push notifications and cross-council officer tenancy are not implemented.

Use actual findings in the final report and distinguish passed automated checks from pending device/usability/cloud work.
