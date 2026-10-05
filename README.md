# Citizen Connect — Local Civic-Issue Reporting App

IT3060 Human–Computer Interaction · Group 2026-WE-156.

An Expo / React Native / TypeScript mobile application implementing the citizen, Pradeshiya Sabha officer, Grama Niladhari and admin flows in the supplied Milestone 02 report and prototype images.

## Run locally

Requires Node.js 22.19 or later and npm. In PowerShell, use `npm.cmd` / `npx.cmd` if script execution is disabled.

```powershell
cd citizen-connect
npm.cmd ci
npm.cmd start
```

Scan the Expo QR code with an SDK-compatible Expo Go installation. For an Android emulator use `npm.cmd run android`. For browser preview use `npm.cmd run web`. Native iOS builds require macOS or EAS; Expo Go can run on an iPhone. The browser preview uses React Native Web; the native draggable map is replaced by coordinate entry on web.

## Demo and Firebase

With no `.env`, the app uses a labelled local demo with fictional sample records. On Login select citizen, officer, gn or admin, then press **Continue as …**. No demo password is needed. Reports, assignments, notifications, profiles and administration changes persist on that device/browser. Switch roles by logging out through Profile (officers: Settings → My Profile). A local demo profile is also available through Sign Up.

Demo mode is for evaluation, not secure multi-user deployment. Firebase mode uses real email/password authentication, Firestore collections and Storage. Follow [Firebase setup](docs/firebase-setup.md), copy `citizen-connect/.env.example` to `.env`, fill your project configuration, set `EXPO_PUBLIC_BACKEND=firebase`, and restart Expo. Cloud mode does not import demo records or permit demo logins. Firebase configuration and external deployment have not been completed because no project was supplied.

## Features

- Citizen category → type → area → authority → photo/description → confirmed location → submission.
- Persistent complaint create/read/update/delete; editing/deleting is allowed while Submitted.
- Complaint search, status filters, details, tracking timeline, resolved-complaint feedback.
- Assignment, priority and forward status updates; automatic in-app status notifications.
- Division-scoped GN monitoring and dashboard counts.
- Admin category, contact and user/profile management; officer and GN activation/deactivation.
- Profile editing, photo changes, support, contact finder and Firebase password changes.

Notifications are in-app records. Background OS push notifications are not implemented. Cloud Auth account provisioning uses Firebase Console; the client cannot create privileged Auth accounts. See documented [prototype deviations and limits](docs/prototype-deviations.md).

## Validate and build

```powershell
cd citizen-connect
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run export:web
npm.cmd run test:e2e
npm.cmd run export:android
```

An Android JavaScript export is a compilation check, not an APK. `eas.json` includes an APK preview profile. When you have an Expo account and Android build setup, run `npx.cmd eas-cli build --platform android --profile preview`. This uses an external build service; no APK has been generated in this workspace.

Verified on 3 October 2026: TypeScript, lint, formatting, six domain tests, five browser workflow tests, and web/Android Hermes exports. Browser tests use installed Microsoft Edge; install Edge or change the Playwright browser channel on another machine. [Working-app screenshots](docs/screenshots/README.md) and the [test record](docs/testing.md) distinguish these checks from pending Firebase/device/usability testing.

## Understand and evaluate the work

- [Architecture and step-by-step implementation](docs/implementation-guide.md)
- [File guide for the viva](docs/file-guide.md)
- [Requirement → prototype → implementation → test traceability](docs/traceability.md)
- [Functional checks and test execution record](docs/testing.md)
- [Five-participant usability plan and blank recording sheets](docs/usability-testing.md)
- [Final report outline](docs/final-report-outline.md)

The supplied documents guide implementation; their embedded example prompts are planning material. They are not separate user commands. No usability participants, individual contributions, screenshots, APK, or cloud test results are claimed without evidence. Group members must review and explain their own assigned work and write the final report from their actual implementation and evaluation.

## Repository layout

```text
citizen-connect/
  App.tsx                 Application entry and providers
  src/app/                File-based Expo Router routes
  navigation/             Protected stack and role-specific tabs
  screens/                Citizen, account, reporting and administration screens
  components/             Shared accessible controls and platform maps
  hooks/                  App state, session and business operations
  types/                  User, complaint and administrative models
  constants/              Prototype categories, areas, statuses and colors
  services/               Local persistence, Firebase, media and sample data
  utils/                  Complaint validation, visibility and status transitions
  firebase/               Firestore and Storage rules
  tests/                  Requirement-based automated checks
docs/                     Setup, traceability, testing and viva notes
```

GitHub remote: https://github.com/hasira-nenuka/HCI_Local_Civic_Issue_ReportingApp. Local implementation checkpoints can be reviewed with `git log --oneline`. Push when ready with `git push origin HEAD`.
