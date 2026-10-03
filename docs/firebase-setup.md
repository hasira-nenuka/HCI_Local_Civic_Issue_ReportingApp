# Connect Firebase after reviewing the demo

The app runs without Firebase. Cloud services cannot be provisioned here because you have not created a project. Do these steps in your own Firebase account.

1. Create a Firebase project, for example `citizen-connect-hci`, and register a **web app** to obtain the JS SDK config. This config also works with the Expo Firebase JS SDK.
2. Enable Authentication → Sign-in method → Email/Password.
3. Create a Cloud Firestore database in **Standard / native mode**. Use production rules; do not leave unrestricted test rules deployed.
4. Create a Storage bucket. Review the billing requirements shown by Firebase before enabling it. The app can submit a report without a photo if Storage is not yet usable, but photo upload testing then remains pending.
5. Publish the contents of `citizen-connect/firebase/firestore.rules` and `citizen-connect/firebase/storage.rules` in their respective rules editors. Storage rules use Firestore profile checks; accept the service permission setup when Firebase asks.
6. Copy `.env.example` to `.env` inside `citizen-connect`. Fill all six `EXPO_PUBLIC_FIREBASE_*` values with the web config. Set `EXPO_PUBLIC_BACKEND=firebase`.
7. Restart using `npm.cmd start -- --clear`. Public Firebase client config is not a service-account key. Access is controlled by rules and Auth. Never put service-account credentials in this app or Git.

## Bootstrap an administrator

Create a user in Authentication → Users. Copy that user's UID. In Firestore create `users/{UID}`, with these fields (the document ID and `id` must be the same UID):

```json
{
  "id": "AUTH_UID_HERE",
  "name": "Your Administrator Name",
  "email": "your-admin-email@example.com",
  "phone": "your-phone",
  "role": "admin",
  "active": true,
  "area": "Colombo 03",
  "division": "Division 03",
  "province": "Western Province"
}
```

This privileged bootstrap is done in Console by the project owner. Citizen sign-up creates a citizen profile only. Sign in as admin and add categories and verified contacts using Settings. Use the six entries in `constants/catalog.ts` as the initial category data; you can add them through the UI. The app never auto-seeds fictional demo records into Firestore.

To provision officers/GN users, create each Auth account and matching `users/{UID}` profile in Console, with role `officer` or `gn`. Set the GN's exact division string. Admin UI then supports reading/updating their names, roles, divisions and active status. It does not create or delete privileged Firebase Auth accounts. Disabling a profile prevents data access via rules; deleting Auth users requires Console.

## Acceptance checks after setup

- Citizen: register/login/logout, restart persistence, wrong password, profile update and password reauthentication.
- Upload a photo; verify Storage URL and image rendering on a second device.
- Submit a complaint; verify the `complaints` and `notifications` documents.
- Officer: assign, prioritize and progress the complaint; citizen receives its in-app notification in real time.
- GN: same-division records are readable; another division's records are denied by Firestore.
- Citizen cannot read another citizen's complaints, change their own role, assign a complaint or edit status.
- Disabled profile cannot access collections or upload files.
- Reject invalid coordinates and backward statuses using the rules emulator or authenticated SDK requests.

These are pending until a real project is configured. Rules should be exercised in Firebase Emulator Suite before external deployment. Firebase emulator ports are supplied in `firebase.json`, but automated emulator rules tests have not been run.

## Known cloud limits

In-app notifications are created atomically with app-driven status changes; there is no background push service or Cloud Function for status changes made directly in Console. Automatic server notifications for external writers need a trusted backend. Photo URLs are Firebase download URLs; treat them as shareable links and use only evaluation photos. Removing a complaint/profile photo currently leaves its stored object until the owner cleans it up in Console. Simultaneous edits to the same complaint need additional conflict handling. Category-in-use deletion checks occur in the UI/service; Firestore cannot query all complaints inside a rule to enforce that constraint.

Official documentation: [Expo Firebase guide](https://docs.expo.dev/guides/using-firebase/), [Firebase setup](https://firebase.google.com/docs/web/setup), [Auth](https://firebase.google.com/docs/auth/web/password-auth), [Firestore rules](https://firebase.google.com/docs/firestore/security/rules-conditions).

## Android APK map setup

Expo Go includes the map setup. For your own Android APK, enable Maps SDK for Android in Google Cloud, create an Android-restricted key for package `lk.citizenconnect.hci` and the build's signing SHA-1, then set `GOOGLE_MAPS_ANDROID_API_KEY` in the build environment. `app.config.ts` adds the native maps plugin when the value is present. Configure it in EAS environment settings before building. iOS uses Apple Maps by default. See [SDK 57 map setup](https://docs.expo.dev/versions/v57.0.0/sdk/map-view/).
