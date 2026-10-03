# Design and scope notes

The supplied chat screenshots are the visual reference. Original PNG exports and grayscale wireframes are absent; the PDFs are assignment context, not additional commands to execute. This phase follows the user's request to build the mobile screens and leave the remaining parts for later.

## Tokens and files

Approximate reference palette: primary `#1969DF`, background `#F7F8FC`, text `#202936`, border `#E0E5EC`, white cards; Inter regular/medium/bold. Colors cannot be represented as exact pixel samples without the source PNG files. Tokens live in `mobile/src/theme/`. Cards use 14px corners; primary buttons are at least 48px tall. Content is centered and limited to 560px on wide screens. The floating-style bottom bar sits within safe-area layout so it does not cover form fields.

| Reference | Implemented file |
| --- | --- |
| Splash, login (duplicate screenshots consolidated), sign up | screens/auth/AuthScreens.js |
| Home, category | screens/report/HomeScreen.js |
| Water, road, garbage, street light, environment, other issue types | screens/report/ReportScreens.js: Subtype |
| Area, local authority | screens/report/ReportScreens.js: Selection |
| Photo and description | screens/report/ReportScreens.js: ComplaintForm |
| Location, success | screens/report/ReportScreens.js: ConfirmLocation, Submitted |
| Reports, tracking, details | screens/tracking/TrackingScreens.js |
| Notifications, notification details | screens/tracking/TrackingScreens.js |
| Profile, edit profile, password, help/about | screens/profile/ProfileScreens.js |

Paths in the table are relative to `mobile/src/`. Related screens share modules to make the first mobile phase easy to follow; the original full server repository structure is deferred.

## Intentional changes

1. Consistent status palette: Submitted gray; Received and In Progress blue; Under Review orange; Resolved green.
2. Tracking header and timeline use the same report status. The current step is orange, preceding steps green, future steps outlined. A resolved report has all steps completed.
3. Shared login uses “Welcome back”; splash uses community wording instead of officer-only wording.
4. Complaint heading always uses the chosen subtype. There is no inconsistent hard-coded “Blocked Drain”.
5. Category tile uses “Cleanliness”; other references use “Garbage / Cleanliness”.
6. Local vector icons replace 3D cartoons, building art, celebration art, and the photo avatar. No remote image dependencies or invented crop assets are used. A user can choose a profile image in Edit Profile.
7. No fake device bezel, clock, Dynamic Island, or home indicator: the actual device supplies its system chrome.
8. Category, environment subtype, location, sign up, notification details, help/about, password, and report details use matching tokens because their complete reference exports were not provided.
9. Search/filter is expandable within My Reports; Category Info is omitted in this phase because the supplied screen sequence enters the subtype directly.
10. The local demo stores reports and profile data using AsyncStorage. It is not a real authority service. Registration and password changes require a future API; demo credentials are fixed. Only submitted report descriptions can currently be edited or cancelled. Subtype editing after submission is deferred.
11. Native maps use react-native-maps and Expo geocoding. Web uses a coordinate form, with location permission support. Standalone Android builds need a maps API key. Device testing and build credentials are still required.
12. Notifications in demo mode are seeded and created on report submission; there is no automatic remote status change or push delivery in this mobile-only phase.
13. API responses must follow the documented contract. The adapter has not been tested against a live backend; MongoDB, server CRUD, role administration, and API-driven search belong to the next phase.
