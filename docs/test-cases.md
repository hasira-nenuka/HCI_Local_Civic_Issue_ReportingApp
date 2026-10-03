# Verification

Automated commands and actual outcomes are recorded in `verification.md`. The following manual tests require a running browser/device and have **not been executed**. They are not claimed as passing.

| ID | Task | Expected |
| --- | --- | --- |
| M01 | Open app | Splash advances to login after about 2 seconds |
| M02 | Fill demo credentials and choose Citizen | Home opens |
| M03 | Use incorrect demo credentials | Error displayed; stay at login |
| M04 | Toggle password eye | Password visibility changes |
| M05 | Choose Officer with demo credentials | Coming-soon screen; logout returns to login |
| M06 | Start report from Home | Six-category selector opens |
| M07 | Select each category | Correct subtype choices appear |
| M08 | Continue without subtype | Next stays disabled |
| M09 | Search area and authority | Matching rows filter live |
| M10 | Navigate back in report flow | Draft choices remain selected |
| M11 | Enter under 10 description characters | Next disabled |
| M12 | Enter 500 description characters | Accepted; counter reflects text |
| M13 | Tap Change on form | Subtype page opens; selected type remains |
| M14 | Select gallery photo | Preview appears |
| M15 | Capture photo on device | Camera permission and preview work |
| M16 | Reject photo permission | Recoverable error appears |
| M17 | Select image over 5 MB | Rejected with error |
| M18 | Remove photo | Placeholder returns |
| M19 | Request GPS on device | Pin and address update |
| M20 | Drag native pin | Coordinates update; reverse geocoding attempted |
| M21 | Deny GPS permission | Error; alternative pin/search available |
| M22 | Confirm location and submit | New ID, Submitted screen, report and notification created |
| M23 | Track new report | Submitted current; later steps pending |
| M24 | Check resolved seeded report | All timeline steps completed; green status |
| M25 | Filter reports and search ID | Matching reports after 400ms delay |
| M26 | Edit submitted description | Updated text saved |
| M27 | Cancel submitted report | Confirmation shown; report removed |
| M28 | Open notification | Marked read and badge decreases |
| M29 | Delete notification | Removed from list |
| M30 | Edit name/email/mobile | Valid values save; invalid values disable button |
| M31 | Change avatar | Selected image appears on profile |
| M32 | Restart app and log in | Demo report/profile/notification changes remain |
| M33 | Open drawer routes | Home/Reports/Profile/Help navigation works |
| M34 | Check 360px phone and tablet | Content fits; keyboard and tabs do not obscure fields |
| M35 | Configure unreachable API | Login/list error visible with recovery or retry |
| M36 | Sign up / change password in demo | Clear backend-required message; no false success |

## Usability session template

Recruit at least 5 participants. Record device, completion, time, errors, and comments; do not suggest the next tap.

T1: Report a pothole with a photo and confirmed location. T2: Find that complaint and explain its current status. T3: Open notifications and identify the latest update and expected next status. Use demonstration data only.

Afterward collect the standard ten SUS responses (1 strongly disagree to 5 strongly agree): use frequently; unnecessarily complex; easy to use; need technical support; functions integrated; inconsistent; learn quickly; cumbersome; confident; need to learn a lot. Score odd items as response minus 1 and even items as 5 minus response, sum and multiply by 2.5. No participant results are fabricated.
