# Four-week Citizen Connect sample dataset

The dataset is prepared and locally validated. It is **not imported into your Firebase project until the Admin SDK importer completes successfully**. The public Firebase settings in `.env` identify the project but do not authorize administrative imports.

## Included records

| Record | Count |
| --- | ---: |
| Citizens with Sri Lankan names and Sinhala display names | 15 |
| Officers | 8 |
| GN officers | 6 |
| Service categories | 6 |
| Complaints over approximately four weeks | 90 |
| Submitted / Assigned / In Progress / Resolved | 15 / 15 / 30 / 30 |
| Citizen feedback entries | 15 |
| Department contacts | 12 |
| Notifications, with one existing active admin | 438 |

There are 24 active and 5 disabled sample accounts to populate both directory filters. Active sample citizens each have six complaints spanning all four statuses. Officers and GN staff have relevant assignments/division records. Existing active administrators receive sample activity notifications; the importer does not create a new privileged administrator.

Category volumes vary: water 22, road 20, garbage/cleanliness 18, street lights 14, park/environment 10, other 6. Histories have ordered timestamps and assignment notes. Thirty reports omit GPS coordinates. Every record is linked to valid sample users, categories and complaint IDs.

Names, contact details, scenarios and portraits are fictional. Records use `sampleDataset: "cc-showcase-v1"`, and complaint references begin with `SMP-`. Phone numbers are non-working placeholders and email addresses use `.example`. Sample contact call/email buttons are disabled. Four generated portrait styles are reused across the fictional profiles. Illustrations are category artwork, not photographic evidence of real incidents.

## 1. Preview without Firebase access

From the repository root:

```powershell
node --experimental-strip-types tools/sample-data/run.mjs --preview
```

This makes no Firebase requests. Open `tools/sample-data/.local/dataset-preview.json` to inspect every proposed record. The existing `.env` is preserved.

The SDK dependencies are installed separately in `tools/sample-data`, never in the mobile application. On another computer, install them with:

```powershell
cd tools/sample-data
npm.cmd ci
cd ../..
```

## 2. Configure local Firebase Admin access

1. Open [the project service-account settings](https://console.firebase.google.com/project/citizen-connect-12345/settings/serviceaccounts/adminsdk).
2. Confirm the selected project is **citizen-connect-12345**.
3. In **Firebase Admin SDK**, choose **Generate new private key** and confirm.
4. Save the downloaded JSON outside this repository, for example `C:\Users\hasir\FirebaseKeys\citizen-connect-admin.json`.
5. Keep that JSON on your computer. Do not paste its contents into chat, add it to `.env`, or place it in the mobile app.

This is the server credential described in the [official Firebase Admin setup instructions](https://firebase.google.com/docs/admin/setup). Alternatively, developers who already use Google Cloud CLI can configure Application Default Credentials with `gcloud auth application-default login`; no service-account file is then required.

## 3. Import into the real project

From the repository root, adjusting the key-file path:

```powershell
node --experimental-strip-types tools/sample-data/run.mjs --project citizen-connect-12345 --apply --credentials "C:\Users\hasir\FirebaseKeys\citizen-connect-admin.json"
```

The importer checks the project, existing categories, administrator UID/email matches, and ID collisions before any remote mutation. It reuses existing matching categories and their current names, types and priorities. It creates missing categories, Authentication accounts with matching Firestore profiles, contacts, complaints, history, feedback and notifications.

Existing records and passwords are not overwritten. Existing categories are not silently renamed or changed. Consequently a category you previously customized will retain its current definition. The app can still select the matching bundled illustration from the category ID or name.

New sample-account passwords are random and saved only in **`tools/sample-data/.local/credentials.json`**, which Git ignores. Passwords are never placed in Firestore, application source or console logs. These are real email/password Authentication accounts; see the [Firebase user-management documentation](https://firebase.google.com/docs/auth/admin/manage-users).

The importer reads the new records back from Firestore and Authentication before printing **Import complete**. The manifest at `tools/sample-data/.local/import-manifest.json` records the result. Authentication and several Firestore batches cannot form one global transaction; an interrupted import can be resumed by rerunning the same command. Stable IDs prevent duplicates. If someone has changed a sample account's role or enabled/disabled state, the importer stops for review rather than resetting it.

## 4. Confirm in Firebase Console and the app

1. In **Authentication → Users**, find `sample.citizen01@citizenconnect.example`, `sample.officer01@citizenconnect.example`, and `sample.gn01@citizenconnect.example`. Verify their UIDs match their `users` document IDs.
2. In **Firestore → Data**, check `users`, `categories`, `complaints`, `notifications`, and `contacts`. Existing records remain; counts increase by the created records reported by the importer.
3. Log in with your existing admin account. The dashboard, complaints, progress, service categories, user/officer/GN directories, contacts and notifications should contain the new sample activity.
4. Open a resolved sample complaint and check its four dated history entries, assigned officer and feedback where present.
5. Use an **active sample citizen** from the local credentials file to see that citizen's six reports and notifications. Existing real citizens are not given fictional reports under their own identity.
6. Use an active sample officer or GN account and verify the appropriate reports and notifications appear. Inactive sample profiles are deliberately refused by the app until an administrator re-enables them. Authentication accounts remain enabled so the existing in-app Active/Disabled control can manage access normally.
7. Close and reopen the app and confirm the records remain. Keep `EXPO_PUBLIC_BACKEND=firebase` for this verification.

No Firestore security-rule changes or Firebase Storage setup are required. The illustrations are bundled with the app; Firestore stores only artwork/portrait keys.

## Demo mode and existing local data

Fresh, explicitly selected demo sessions use the same rich sample dataset plus the existing demo admin account. Existing AsyncStorage demo records are not replaced automatically. The real Firebase app never silently switches to demo data. No source change can import records into a remote project without authorized administrative credentials.
