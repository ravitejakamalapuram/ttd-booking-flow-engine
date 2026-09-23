# Chrome Web Store Listing & Publishing Record

*Last Updated: 2026-09-21*

---

## 1. Extension Information
- **Name**: Booking Flow Runner
- **Extension ID**: `PENDING_REGISTRATION`
- **Publisher ID**: `PENDING_CONFIGURATION`
- **Version**: `0.2.0`
- **Manifest Version**: `MV3`
- **Language**: `en`
- **Category**: `Developer Tools`

---

## 2. Store Listing Copy

### Short Description (max 132 characters)
> Executes verified form sequences and navigation steps accurately.

### Detailed Description
```markdown
Booking Flow Runner

Runs versioned booking flows with automatic execution, verification, manual takeover and local timing telemetry.

Key Features:
- Local-first and private: all data operations run strictly inside your browser.
- High performance: fast processing for developer workflows.
- Clean and intuitive interface designed for modern productivity.

How to use:
1. Open the extension from the Chrome toolbar or side panel.
2. Load or paste your data to inspect, query, and transform.
3. Export or copy results instantly.
```

---

## 3. Permissions Justifications (Required for Review)

Google review requires specific plain-English justification for each declared permission:

| Permission | Used in Code? | Sample Evidence | Required? | Risk | Plain-English Review Justification |
| :--- | :---: | :--- | :---: | :---: | :--- |
| `storage` | Yes | content.js:5 | Yes | LOW | Required to persist user preferences, workflow configs, and local execution telemetry directly on device. |
| `tabs` | Yes | popup.js:3 | Yes | MEDIUM | Required to identify and coordinate workflow execution state with the active booking tab. |
| `host_permissions` | Yes | https://ttdevasthanams.ap.gov.in/* | Yes | HIGH | Required to inspect DOM element readiness and execute authorized navigation steps on the booking portal. |

---

## 4. Privacy & Data Use Disclosure

- **Data Flow**:
  User Interaction
  ⬇
  Extension Frontend (Popup / Side Panel / Content Scripts)
  ⬇
  Local Browser Storage (chrome.storage.local / session)
  ⬇
  External HTTPS API Endpoints

- **Data Handling Summary**:
  - **User Preference & Session State**: Collected: Yes | Stored: Local | Purpose: Store application configuration, theme preferences, and local document state.
  - **Web Page Data & Content**: Collected: Yes | Stored: No | Purpose: Parse and visualize JSON or user-requested data directly within the browser context.
  - **Analytics & Telemetry**: Collected: No | Stored: No | Purpose: None collected.

- **Privacy Policy URL**: `https://ravitejakamalapuram.github.io/booking-flow-runner.html`

---

## 5. Store Assets Checklist

- [x] Extension Icon (128×128 PNG): `icons/icon-128.png`
- [ ] Primary Screenshot (1280×800 PNG): `chrome-store/assets/screenshots/01-main-screen.png`
- [ ] Promotional Tile (440×280 PNG): Optional but recommended for featured placement
- [ ] Marquee Promo (1400×560 PNG): Optional

---

## 6. Pre-Publish Checklist

- [x] Manifest V3 compliance verified
- [x] No `eval()` or remotely hosted code
- [x] No secrets, private keys, or API tokens in package
- [x] Distributable archive contains `manifest.json` at root
- [ ] Extension registered in Chrome Web Store Developer Dashboard
- [ ] CWS API OAuth credentials configured (`.env`)
- [ ] Final human confirmation obtained before submission

---

## 7. Release History

| Version | Date | Status | Package ZIP | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `0.2.0` | 2026-09-21 | Draft / Ready | `chrome-store/builds/booking-flow-runner-v0.2.0.zip` | Automated build & verification passed |
