# Citizen Connect

Expo / React Native citizen mobile app for local civic issue reporting in Sri Lanka. This phase implements the supplied screens and navigation with a **persistent local demo**. A backend, real authority delivery, push notifications, and officer administration remain for a later phase.

## Run

Requires Node.js 20+ and npm.

```sh
cd mobile
npm install
npm start
```

On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.
Scan the QR code with a compatible Expo Go client or use an Android emulator (`npm run android`). This project deliberately uses the requested **Expo SDK 52**; a newer Expo Go client may require an SDK 52 Android client from https://expo.dev/go or a development build. iOS physical devices may require a development build for this older SDK.

For a browser preview: `npm run web`. Native interactive maps and address lookup are replaced by a coordinate form in the browser; GPS, camera, and maps should be tested on a device.

Demo login: **citizen@demo.lk / Citizen123**. Fill these with the button on Login. Either role button works with these demo credentials; Officer shows the requested coming-soon screen. Demo reports, notifications, and profile edits persist on the device. Demo registration/password changes display an explanatory error because no account server exists yet. Do not enter sensitive information in the demo.

## Screen order

Splash → Login → Home → Category → Issue Type → Area → Local Authority → Complaint Form → Confirm Location → Submitted → Track Complaint.

Bottom tabs: Home, My Reports, Profile. The tab bar remains visible throughout reporting. Additional routes: Notifications → Notification Details, Report Details, Edit Profile, Change Password, Sign Up, Help & Support, About App. A hamburger drawer provides shortcuts.

## API integration for the next phase

Copy `mobile/.env.example` to `mobile/.env` and set `EXPO_PUBLIC_API_URL=http://YOUR_LAPTOP_WIFI_IP:5000`. Restart Expo after changing environment variables. Leave blank for local demo. The client expects the REST paths in the supplied prompt, with report/notification `id` fields and ISO date strings. See [API contract](docs/api-contract.md).

The API URL is public app configuration. Never put MongoDB credentials or a JWT signing secret in mobile environment variables. Native session tokens use SecureStore. Web tokens are memory-only. No MongoDB or server is included in this mobile phase.

## Check and build

```sh
cd mobile
npm test
npm run check
npx expo export --platform web
```

For an Android APK after configuring an Expo/EAS account and native maps credentials:

```sh
npx eas-cli build -p android --profile preview
```

Configure a Google Maps Android API key in the Expo Android configuration before a standalone build. EAS build, publishing, and GitHub pushes are not performed by this phase.

Source overview: `src/theme` controls appearance, `components/UI.js` provides reusable elements, `screens` holds screen groups, `navigation` defines drawer/tabs/stacks, and `context/AppContext.js` handles demo persistence and the future API adapter. [Design notes](docs/deviations.md) explain differences and limitations. [Manual checks](docs/test-cases.md) describe device verification.
