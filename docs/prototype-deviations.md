# Prototype fidelity and justified deviations

The supplied images guide the blue primary buttons, pale background, white outlined cards, category grid, compact lists, role tabs, forms and timelines. This is an implemented application; screenshots of the Figma prototype are not embedded as fake interactive screens.

| Prototype | Implementation / justification |
|---|---|
| Illustrated category mascots, splash building and profile portraits | Emoji/category symbols and editable user photos substitute for unavailable original Figma exports. Layout and category meanings are retained. Pixel-exact artwork requires source assets. |
| Small text and touch targets in phone mockups | Larger labels/controls and 46–48px touch areas improve readability and usability. |
| Login as Citizen / Officer | Real cloud login uses the authenticated profile's role. Explicit role buttons are confined to the labelled local demo. Officer/GN/admin roles are provisioned by an administrator. |
| Separate type/area/authority/form/location screens | A five-step wizard preserves the selected Variant A sequence, one purpose at a time, with a progress indicator and previous-step button. Category selection is separate. |
| Bottom tabs visible on every form | Standard navigation keeps tabs on main screens and uses stack back navigation for detail/form screens, reducing accidental draft abandonment. |
| Google Maps promotional placeholder | Native interactive map and draggable marker; browser preview uses coordinate entry and external OpenStreetMap links. No placeholder image pretends to be a working map. |
| Submitted → Received → Under Review → In Progress → Resolved | Uses the four agreed data statuses in the plan: Submitted → Assigned → In Progress → Resolved. Received is represented by submission confirmation; review can be described in assignment notes. |
| All / In Progress / Resolved filters | Adds Submitted/Assigned where useful to expose editability and assignment work. |
| Officer Settings icon ambiguity | Distinct gear icon with the visible Settings tab label applies the report's recommended usability fix. |
| Static dashboard numbers/bars | Counts and chart bars are calculated from records visible to the current role. GN scope is its division. |
| Profile email editing | Email is shown read-only; Firebase email changes need a separate verified-email flow. Name, phone and photo can be updated. |
| Assignment status select in the same form | Assignment sets Assigned; the progress screen handles later status and priority changes. Forward-only transitions prevent accidental reopening. |
| Administration add officer includes password | Demo creates profiles without passwords. Cloud privileged Auth provisioning uses Console and role-controlled Firestore profiles; the client never stores officer passwords. |
| CRUD not shown in static prototype | Adds editing/deletion of submitted complaints, category/contact CRUD and resolved-report feedback to meet actual workflow/assignment needs. |
| Notifications | Durable in-app notifications with read/delete operations. Background OS push remains outside this implementation. |

All four demo roles share one device's data so an evaluator can demonstrate the complete flow. This is not a secure multi-user backend. Firebase mode uses separate collections, authentication and rules. GN staff can see division reports; only officer/admin roles can assign or progress complaints. Officer access covers the evaluation council's complaint dataset; multi-council officer tenancy is not implemented.

No cloud account has been provisioned, APK built, physical-device permission test performed, or five-participant evaluation conducted by this agent. These remain actual final-evaluation tasks.
