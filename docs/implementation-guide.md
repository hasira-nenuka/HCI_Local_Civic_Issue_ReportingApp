# Implementation guide

## Source requirements

Both supplied copies of Assignment 02 were read. They have different file hashes but the same FR1–FR5 and NFR1–NFR5; changes are primarily wording/layout. `milestone-02-source.txt`, `milestone-02-download-source.txt` and `milestone-03-source.txt` are extracted source references, not newly authored report text. The 14 prototype images supplied in chat define the layout and journeys.

Assignment 3 requires a runnable mobile app, source control, at least two working CRUD operations per assigned interface, prototype deviations, a traceability matrix, functional evaluation, five usability participants, and a consolidated report of at most 35 pages (excluding references/appendices). Static splash/login/navigation screens naturally do not expose two database operations: explain their supporting authentication/read operations and confirm your workload mapping with your lecturer rather than adding meaningless CRUD.

## Steps completed in order

1. Inspected the repository: only README and existing `.git`; retained its existing GitHub remote.
2. Read reports, assignment and implementation plan; distinguished requirements from embedded sample prompts.
3. Generated the blank Expo TypeScript project. Primary npm registry returned 403; the public npm mirror installed the dependencies. The project selected stable Expo SDK 57, React 19 and React Native 0.86.
4. Defined a small architecture before features: models, constants, services, shared controls, screens, navigation and hooks.
5. Defined `User`, `Complaint`, category, notification, history and contact models. Timestamps use ISO strings to round-trip through JSON and Firestore. UI dates use Asia/Colombo.
6. Created the authenticated stack and role-based bottom tabs. Final navigation uses file-based Expo Router routes, protected layouts, `useRouter` and `useLocalSearchParams` as required by the starter's AGENTS.md.
7. Implemented citizen home, category cards and information, then the reporting wizard and confirmation.
8. Added reports, details, timeline, editing/deletion, notifications, feedback and profile screens.
9. Added dashboard, assignment, progress, category management, users/officers/GN and contacts.
10. Connected device persistence and implemented validated business operations. Demo role switching is explicit; it is not real authentication.
11. Added an optional Firebase adapter and security rules after the UI/data flows. It is disabled until a project is configured.
12. Prepared setup, test, traceability, deviation, usability and viva documentation.

Verification evidence and remaining checks are recorded in `testing.md`; this sequence does not imply every device/cloud test has already been run.

## Technology choices

Expo gives the group one TypeScript codebase for Android/iOS plus a browser preview. Expo Router provides file-based URLs, protected layouts, native back behavior, stacks and bottom tabs. Context owns application state without introducing another state library. AsyncStorage persists demonstration data. Expo ImagePicker and Location use OS permission prompts. React Native Maps supplies the native draggable pin. Firebase JS SDK is supported by Expo and supplies Auth, Firestore and Storage when configured.

References: [Expo SDK compatibility](https://docs.expo.dev/versions/latest/), [Firebase in Expo](https://docs.expo.dev/guides/using-firebase/), [Firebase password authentication](https://firebase.google.com/docs/auth/web/password-auth), [Firestore rules conditions](https://firebase.google.com/docs/firestore/security/rules-conditions).

## Data flow to explain in the viva

Screen input → context action → validation/role guard → local save or Firestore batch → new context data → screen renders updated results. Submitting a complaint writes its initial timeline and notification together. Assignment writes officer/division/note, updates the status when first assigned, and creates a notification. Progress updates cannot go backwards. GN visibility filters by division; Firestore queries and rules enforce this again in cloud mode.

Cloud writes update changed fields rather than replacing every collection. Status/assignment history still needs concurrent multi-device validation; this implementation is aimed at a small university evaluation and does not claim production concurrency guarantees.

## Group ownership

The Milestone 02 report names IT23699526 / I.N. Chinthana, IT23699762 / K.D.S.S. Ranathunga, IT23698604 / H.N. Kodippiliarachchi and IT23713512 / K.M.P.H. Dilruwan. Citizen-side and officer/admin-side prototype contributions are recorded there. The group must assign and record actual Milestone 03 implementation/review/test ownership; no individual implementation contribution is invented here.
