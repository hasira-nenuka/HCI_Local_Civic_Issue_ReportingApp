# Citizen Connect visual assets

## Admin workspace upgrade

New locally bundled assets: `citizen-connect/assets/illustrations/admin-operations.png` and `citizen-connect/assets/illustrations/admin-team.png`. Generated using the built-in imagegen tool, then visually inspected. The illustrations use the same reduced-motion-aware floating animation as the welcome screen.

Operations prompt: Square polished 3D clay illustration for Citizen Connect municipal admin dashboard. A miniature blue civic building beside a white tablet showing a simple blue bar chart and mint checkmark, tiny road and green trees, a small amber street lamp, floating map pin. No people. Clean sophisticated product illustration, saturated royal blue #1769df with mint teal, warm amber and lavender accents on very pale blue #edf4ff background. Airy uncluttered composition, main objects centered and fill 80 percent frame. No text no letters no numbers no watermark.

Team prompt: Square polished 3D clay illustration for municipal staff management mobile interface. Three friendly diverse Sri Lankan civic staff busts arranged around a small white contact directory board with blue profile circles and a mint shield checkmark. Elegant abstract teamwork scene, royal blue #1769df, teal mint and subtle warm amber on pale lavender #f1efff background. Clean professional inviting product illustration, cohesive smooth rounded shapes, main objects centered generous margins. No text no letters no numbers no watermark.

Design choices: primary actions remain blue; amber highlights new submissions, violet indicates ongoing work, and mint indicates resolution. Text labels accompany every status and count so meaning does not rely on color. Management pages share illustrated headers and grouped actions. Directory avatars use profile images or initials; category editing uses labeled icon and accent-color pickers. Statistics and charts derive from existing application data. Animation is decorative and never required to operate the app. Firebase operations and authorization rules are unchanged.

The original royal blue theme (#1769df), pale background (#f7f9fe), and existing green/red status colors are retained. Mint and amber provide supporting accents.

Images are bundled locally under `citizen-connect/assets/illustrations/`. The welcome illustration floats gently using React Native Animated. Animation stops on unmount and respects the device's reduced-motion preference. These are animated still illustrations, rather than GIFs or videos.

Generated with the built-in imagegen tool. No external image URLs or image-generation API keys are required by the app.

## Community illustration prompt

Create a polished square mobile app illustration for Citizen Connect civic issue reporting. Soft 3D clay illustration, friendly Sri Lankan neighborhood, central blue municipal building, two small diverse citizens holding a phone, tiny green trees, blue water droplet and street light, neat road, floating blue map pin. Main palette royal blue #1769df, pale background #f7f9fe, restrained mint and warm amber accents. Airy generous margins, charming professional public service visual, clean crisp shapes. No text, no letters, no watermark. Single cohesive scene suitable as onboarding hero.

## Submission illustration prompt

Square illustration for successful report submission in blue civic mobile app Citizen Connect. Soft polished 3D clay artwork, central white smartphone with large royal blue checkmark badge and small blue municipal building at its base, tasteful mint leaves, few warm amber confetti shapes, friendly clean professional composition. Background pale #f7f9fe, main blue #1769df. Generous clear margins. No text, no lettering, no watermark.

Category and navigation illustrations use the existing Ionicons vector font in soft color tiles. Unknown categories get a grid icon. Stored category emoji values remain compatible with the app; they are translated to vector icons when displayed.
