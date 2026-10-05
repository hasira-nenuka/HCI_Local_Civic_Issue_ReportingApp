# File guide for the viva

Read the models first, then validation, local storage, context actions, screens and route files. React components render data; services handle persistence/permissions; context connects them. No component stores passwords in local demo data.

All application paths below are relative to `citizen-connect/`.

| File | Purpose / important logic |
|---|---|
| `App.tsx` | Safe-area provider, shared data provider, mobile-width container, navigation and status bar. |
| `index.ts` | Loads the Expo Router entry point. |
| `navigation/AppNavigator.tsx` | Splash presentation and authenticated/protected Expo Router stack. Admin/assignment routes are gated by role. |
| `navigation/MainTabs.tsx` | Citizen Home/My Reports/Profile or staff Home/Complaints/Progress/Settings. Distinct labelled Settings gear. |
| `navigation/types.ts` | Typed route parameters read by Expo Router screens. |
| `types/models.ts` | Four roles; user, category, complaint, history, draft, notification and contact interfaces. |
| `constants/catalog.ts` | Six prototype categories and issue types, areas, authorities, statuses and issue titles. |
| `constants/theme.ts` | Shared prototype-inspired colors. |
| `components/ui.tsx` | Scrollable screen, card, button, input, radio, chips, badges, rows, hints and validation messages. Accessible control roles/labels. |
| `components/LocationMap.native.tsx` | Native map with tap-to-set and draggable marker. |
| `components/LocationMap.tsx` | Web coordinate preview and guidance when native maps are unavailable. |
| `hooks/AppContext.tsx` | Session and data state; submit/edit/delete, assign/progress/feedback, notifications, profiles and administration actions. Local saves or cloud batches; role guards and busy lock. |
| `utils/complaints.ts` | Draft validation, unique IDs, complaint construction, role/division visibility, forward status transitions and Colombo dates. |
| `services/seed.ts` | Clearly fictional demonstration users, four sample complaints, notification, categories and contacts. |
| `services/localStore.ts` | AsyncStorage data/session keys, initial persistence and local demo profile registration. |
| `services/media.ts` | Photo/camera permission, picker, permanent native copy, browser data URL. |
| `services/firebase.ts` | Reads explicit cloud-mode environment config and initializes Auth/Firestore/Storage. |
| `services/authPersistence.ts` | Browser Auth persistence. |
| `services/authPersistence.native.ts` | React Native Auth persistence with AsyncStorage; isolated SDK type compatibility cast. |
| `services/cloudStore.ts` | Auth/profile operations, scoped collection reads/listeners, batched field changes and image uploads. |
| `screens/auth.tsx` | Login and signup; explicit demo role chooser and cloud email/password flow. |
| `screens/citizen.tsx` | Home, category grid/info, searchable reports, confirmation, details and report edits. |
| `screens/report.tsx` | Five reporting steps, photo preview, GPS/manual coordinates, review, validation and submission. |
| `screens/progress.tsx` | Timeline, assignment, forward status/priority updates and citizen feedback. |
| `screens/account.tsx` | Profile/edit/password/help/about and notification list/detail/read/delete. |
| `screens/admin.tsx` | Dashboard/data-driven chart, analytics, Settings, category/user/officer/GN/contact management. |
| `src/app/_layout.tsx` | File-based root route layout, exports the application providers/stack. |
| `src/app/index.tsx` | Redirects to Login or the role's Home after loading the session. |
| `src/app/Main/_layout.tsx` | Exports the role-aware tab navigator. |
| `src/app/Main/Home.tsx` | Chooses citizen home or staff dashboard according to the authenticated profile. |
| `tests/domain.test.mjs` | Six tests for FR1/FR2/FR4/FR5 validation, ownership, statuses and visibility. |
| `tests/e2e/workflows.spec.ts` | Interactive browser evaluation of reporting/assignment/status/notifications/feedback, admin CRUD and GN restrictions. |
| `tests/serve.cjs` | Path-restricted localhost static server for the exported app during tests. |
| `playwright.config.ts` | Mobile-size browser evaluation using installed Microsoft Edge, one worker, failure traces. |
| `eslint.config.js` | Expo lint configuration; generated build/test output excluded. |
| `firebase/firestore.rules` | Server access controls for active roles, user profiles, scoped complaints, notifications, categories and contacts. |
| `firebase/storage.rules` | Profile-controlled image uploads, image MIME/size checks and owner/staff reads. |
| `firebase.json` | Rules locations and optional emulator ports. |
| `.env.example` | Demo default and six Firebase configuration placeholders; copy to ignored `.env` for cloud setup. |
| `app.json` | App identity, portrait layout, platform identifiers, scheme, icons and permission/router plugins. |
| `app.config.ts` | Adds the Android Maps config plugin when an API key is provided for standalone builds. |
| `eas.json` | APK preview / production build profiles; does not claim a build was produced. |
| `package.json` | Dependency versions and run/check/test/export/format scripts. |
| `package-lock.json` | Reproducible npm dependency installation. |
| `tsconfig.json` | Expo's strict TypeScript configuration. |
| `AGENTS.md` | Starter-generated SDK documentation, Expo Router, build and validation instructions for coding agents. |
| `.gitignore` | Excludes dependencies, environment values, generated bundles and test output. |
| `LICENSE` | Starter-generated license text. |
| `assets/icon.png`, `assets/favicon.png`, `assets/android-icon-foreground.png`, `assets/android-icon-background.png`, `assets/android-icon-monochrome.png`, `assets/splash-icon.png` | Expo starter assets for app metadata/splash configuration. Original brand artwork can replace these later. |

## Every route wrapper

Route wrappers contain a one-line export of an already implemented screen. They give Expo Router separate URLs without duplicating business logic.

| Route file | Exports |
|---|---|
| `src/app/Login.tsx` | LoginScreen |
| `src/app/Register.tsx` | RegisterScreen |
| `src/app/Category.tsx` | CategoryScreen |
| `src/app/CategoryInfo.tsx` | CategoryInfoScreen |
| `src/app/ReportWizard.tsx` | ReportWizardScreen |
| `src/app/Confirmation.tsx` | ConfirmationScreen |
| `src/app/Details.tsx` | DetailsScreen |
| `src/app/Track.tsx` | TrackScreen |
| `src/app/EditReport.tsx` | EditReportScreen |
| `src/app/Notifications.tsx` | NotificationsScreen |
| `src/app/NotificationDetail.tsx` | NotificationDetailScreen |
| `src/app/EditProfile.tsx` | EditProfileScreen |
| `src/app/Password.tsx` | PasswordScreen |
| `src/app/Support.tsx` | SupportScreen |
| `src/app/About.tsx` | AboutScreen |
| `src/app/Assign.tsx` | AssignScreen |
| `src/app/Categories.tsx` | CategoriesScreen |
| `src/app/CategoryEdit.tsx` | CategoryEditScreen |
| `src/app/Users.tsx` | UsersScreen |
| `src/app/UserEdit.tsx` | UserEditScreen |
| `src/app/Contacts.tsx` | ContactsScreen |
| `src/app/ContactEdit.tsx` | ContactEditScreen |
| `src/app/OfficerProfile.tsx` | ProfileScreen |
| `src/app/Main/My Reports.tsx` | ReportsScreen |
| `src/app/Main/Profile.tsx` | ProfileScreen |
| `src/app/Main/Complaints.tsx` | ReportsScreen |
| `src/app/Main/Progress.tsx` | AnalyticsScreen |
| `src/app/Main/Settings.tsx` | SettingsScreen |

## Repository documentation

Root `README.md` explains installation, demo roles, checks and known limits. Root `.gitignore` excludes generated artifacts across the repository. `docs/implementation-guide.md` describes the sequence and architecture; `firebase-setup.md` is the pending cloud setup; `prototype-deviations.md` records fidelity choices; `traceability.md` maps requirements to screens/code/tests; `testing.md` records actual verification and pending cases; `usability-testing.md` supplies five-participant blank sheets; `final-report-outline.md` is the student-authored report scaffold. The three `milestone-*-source.txt` files are extracted references from the supplied PDFs.

`docs/screenshots/README.md` describes the actual browser captures. `citizen-home.png`, `officer-home.png`, `gn-home.png`, `admin-home.png` and `complaint-timeline.png` show the working implementation's role screens and tracking/feedback state.
