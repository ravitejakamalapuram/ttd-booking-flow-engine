# Chrome Web Store Listing & Publishing Record

*Last Updated: 2026-09-21*

---

## 1. Extension Information
- **Name**: Booking Flow Admin Recorder
- **Extension ID**: `PENDING_REGISTRATION`
- **Publisher ID**: `PENDING_CONFIGURATION`
- **Version**: `0.2.0`
- **Manifest Version**: `MV3`
- **Language**: `English`
- **Category**: `Developer Tools`

---

## 2. Store Listing Copy

### Short Description (max 132 characters)
> Authoring and recording companion tool to author, inspect, and export versioned booking workflows from live DOM.

### Detailed Description
```markdown
Booking Flow Admin Recorder is a developer and administrative workflow authoring tool. It allows workflow creators to inspect live web page elements, record user action sequences, validate selector resilience, and author structured, versioned workflow definitions directly from the browser.
```

---

## 3. Permissions Justifications (Required for Review)

Google review requires specific plain-English justification for each declared permission:

| Permission | Used in Code? | Sample Evidence | Required? | Risk | Plain-English Review Justification |
| :--- | :---: | :--- | :---: | :---: | :--- |
| `activeTab` | Yes | popup.js:2 | Yes | LOW | Required to inject temporary recording utilities into the active tab upon user invocation. |
| `storage` | Yes | popup.js:7 | Yes | LOW | Required to persist recorded workflow draft configurations locally during authoring sessions. |
| `tabs` | Yes | popup.js:2 | Yes | MEDIUM | Required to coordinate DOM inspection and recording with the active target browser tab. |
| `host_permissions` | Yes | https://ttdevasthanams.ap.gov.in/* | Yes | HIGH | Required to inspect DOM element attributes and author valid action selectors on the target portal. |

---

## 4. Privacy & Data Use Disclosure

- **Data Flow**:
  User Interaction
  ⬇
  Extension Frontend (Popup / Side Panel / Content Scripts)
  ⬇
  Local Browser Storage (chrome.storage.local / session)

- **Data Handling Summary**:
  - **User Preference & Session State**: Collected: Yes | Stored: Local | Purpose: Store application configuration, theme preferences, and local document state.
  - **Web Page Data & Content**: Collected: Yes | Stored: No | Purpose: Parse and visualize JSON or user-requested data directly within the browser context.
  - **Analytics & Telemetry**: Collected: No | Stored: No | Purpose: None collected.

- **Privacy Policy URL**: https://session-bridge-4.preview.emergentagent.com/privacy

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
| `0.2.0` | 2026-09-21 | Draft / Ready | `chrome-store/builds/booking-flow-admin-recorder-v0.2.0.zip` | Automated build & verification passed |
