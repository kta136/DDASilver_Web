# UI/UX audit fixes — 12 September 2026

Implemented the requested audit fixes while leaving price clarity (F1) unchanged.

- F2: Mobile product overlays keep the enquiry action visible while details scroll, with a smaller gallery.
- F3: Responsive WebP hero variants replace the 1.6 MB PNG in delivery; the largest variant is 88 KB. Above-the-fold images load eagerly.
- F4: Escape returns mobile navigation focus to its menu button.
- F5: Homepage category heading retains its word spacing on phones.
- F6: Mobile filters expand on demand; catalogue and collection introductions use less vertical space.
- F7: Contact actions, address and hours appear immediately below the introduction; phone numbers use the interface font.
- F8: Homepage category image frames have consistent heights.
- F9: Removed customer-facing draft boilerplate, added rates retry/contact actions, and routed unconfigured sign-in to its friendly page.

## Service configuration

Checked OpenBao's DDA_Live_Rates settings. Its generic public URLs point to local development, while COOLIFY_WEB__APP_URL identifies the existing DDAJewels deployment. Restored the two rates endpoint settings in ignored .env.local using that verified origin and the documented paths. Both local snapshot and streaming proxies returned HTTP 200. No secret values were written to this report or committed.

Follow-up: Bao's Oracle_VPS credentials provided read access to the existing Coolify application. Production's client secret and cookie secret are blank, but the application's preview settings contain both. A temporary local configuration successfully generated the sign-in transaction and authorization redirect. DDAJewels rejected the localhost callback (HTTP 400); the same request with the production callback reached its login page (HTTP 307). This identifies a local callback restriction, not missing preview settings. Secret validity at token exchange remains untested without an authenticated user flow. Removed the temporary local auth settings to retain the friendly fallback. No production settings, callback registrations or deployment were changed.

## Validation

- TypeScript, ESLint and production build passed.
- 253 unit tests passed across 50 files.
- 26 browser tests passed; 6 production-only SEO checks skipped by the existing environment guard.
- Recaptured 31 routes at desktop and mobile sizes: all 62 checks returned 200 with no horizontal document overflow, captured page exceptions or broken loaded images.
- Added browser checks for persistent enquiry visibility, menu focus, compact filters, category frame consistency, responsive hero delivery and manual rates retry.

Updated screenshots and route results are stored outside the repository in the task's ui-audit/fixed visualization folder. A separate mobile-rates-connected.png records the restored connection.
