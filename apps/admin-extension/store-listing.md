# Store Listing: Booking Flow Admin Recorder

- **Name:** Booking Flow Admin Recorder
- **Summary:** Authoring and recording companion tool to author, inspect, and export versioned booking workflows from live DOM.
- **Category:** Developer Tools
- **Language:** English
- **Privacy policy URL:** https://session-bridge-4.preview.emergentagent.com/privacy

**Description:**
Booking Flow Admin Recorder is a developer and administrative workflow authoring tool. It allows workflow creators to inspect live web page elements, record user action sequences, validate selector resilience, and author structured, versioned workflow definitions directly from the browser.

KEY FEATURES:
• Visual Element Inspector: Highlight and capture robust DOM element selectors in real time.
• Live Action Recording: Capture input, click, and navigation actions to build repeatable workflow sequences.
• Step Validation & Testing: Test individual steps against live DOM elements to verify selector reliability before deployment.
• Structured Export: Export recorded flows into versioned JSON workflows compatible with the Booking Flow Runner engine.
• Local-First Privacy: All authoring and recorded data remains strictly local in your browser.

HOW TO USE:
1. Navigate to the target web application page.
2. Open the Booking Flow Admin Recorder popup.
3. Click "Start Recording" and interact with page elements.
4. Review captured steps, fine-tune selectors, and export the finished workflow definition.

**Single purpose description:**
Booking Flow Admin Recorder provides a browser-based developer authoring environment to record, inspect, and export versioned workflow definitions from live web DOM elements.

## Permissions Justifications:
- **storage** — "Required to persist recorded workflow draft configurations locally during authoring sessions."
- **tabs** — "Required to coordinate DOM inspection and recording with the active target browser tab."
- **activeTab** — "Required to inject temporary recording utilities into the active tab upon user invocation."
- **host_permissions** — "Required to inspect DOM element attributes and author valid action selectors on the target portal."
