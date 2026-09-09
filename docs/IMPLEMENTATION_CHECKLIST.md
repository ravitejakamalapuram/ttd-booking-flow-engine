# Booking Flow Engine — Implementation Checklist

This document is the source-of-truth implementation plan for Codex and future contributors. Work through the features in order unless a dependency requires otherwise. Keep the engine generic; TTD is the first concrete flow, not the architecture boundary.

## How to use this checklist

- [ ] Pick the next incomplete feature and implement it end-to-end.
- [ ] Add/extend automated tests for the feature.
- [ ] Run `npm test`, `npm run typecheck`, and `npm run build`.
- [ ] Update this document when a feature is completed, including implementation notes and any known limitations.
- [ ] Do not enable a production flow until its live selectors and sequence have been captured and verified.
- [ ] Never implement CAPTCHA, OTP, payment-authentication, or server-side queue bypasses.

---

## Phase 0 — Foundation / already implemented

### [x] 0.1 Generic, data-driven architecture
**Target:** The booking behavior must live in versioned `FlowDefinition` JSON rather than being hardcoded into the extension. The runtime must remain reusable for other booking websites.

**Implemented:** flow schema, selector resolver, runtime, storage, telemetry, user extension, admin recorder, and TTD flow directory.

### [x] 0.2 Versioned flow model
**Target:** A flow has stable identity, platform, name, version, enabled state, URL matching, variables, steps and safety policy. Profiles/groups/booking strategies are separate from the flow so flow updates do not overwrite user data.

**Implemented:** `FlowDefinition`, `PilgrimProfile`, `ProfileGroup`, `BookingStrategy`, and `BookingSession` in `packages/flow-schema`.

### [x] 0.3 Resilient runtime
**Target:** Execute declarative actions with selector fallback, waits, retries, interpolation, verification, skip/manual failure modes, telemetry hooks and session IDs.

**Implemented:** `packages/flow-runtime`.

### [x] 0.4 Selector abstraction
**Target:** Support multiple selector kinds and deterministic priority so DOM changes can be handled by fallback selectors rather than a single brittle CSS path.

**Implemented:** CSS, XPath, id, text, role and name resolution plus element description/discovery.

### [x] 0.5 Admin recorder MVP
**Target:** Record clicks/inputs/changes on a supported site, capture useful DOM metadata and generate a reviewable FlowDefinition rather than blindly publishing recorded events.

**Implemented:** admin extension recorder and flow generation UI. Generated flows default to disabled and stop before payment.

### [x] 0.6 User extension MVP
**Target:** Load published flow metadata from GitHub, allow the user to select a flow, execute it in-page, show execution status, expose manual takeover/resume, and retain the last session locally.

**Implemented:** user MV3 extension and remote flow-index loading.

### [x] 0.7 TTD starter flow
**Target:** Establish the TTD flow namespace and safety boundary without pretending selectors are production-ready.

**Implemented:** `flows/ttd/special-entry-darshan-v0.json`, disabled by default, with manual fallback and `stopBeforePayment: true`.

---

## Phase 1 — Flow authoring and validation

### [ ] 1.1 Production-grade recorder
**Target:** Turn the MVP recorder into a reliable authoring tool.

Requirements:
- Start/stop recording cleanly and remove event listeners on stop.
- Capture navigation/page transitions relevant to the recorded flow.
- Capture stable selector candidates and their priority.
- Capture element type, labels, nearby text, name/id/aria attributes and useful attributes.
- Capture select options, checkbox/radio state and input metadata.
- Avoid recording sensitive values such as OTPs, passwords, card data and payment credentials.
- Debounce noisy input events so one logical field interaction becomes one authoring event.
- Make recordings deterministic and editable before generation.

**Done when:** a normal booking interaction can be recorded repeatedly without duplicate/noisy events and produces a reviewable flow draft.

### [ ] 1.2 Flow editor
**Target:** Let an admin inspect and edit generated steps before saving/publishing.

Requirements:
- Edit step/action IDs and names.
- Edit selectors and selector priority.
- Edit action type, value/variable, events, waits, retry policy and failure mode.
- Reorder, duplicate and delete steps.
- Add explicit verification/manual checkpoints.
- Show warnings for fragile selectors and sensitive actions.
- Import an existing FlowDefinition JSON and export the edited definition.

**Done when:** a recorder-generated flow can be corrected entirely in the admin UI without manually editing repository files.

### [ ] 1.3 Flow schema validation
**Target:** Reject malformed flows before save, publish or execution.

Requirements:
- Validate required top-level fields and supported schema version.
- Validate action/condition enums and required properties.
- Validate selector definitions.
- Validate retry/timeouts/failure modes.
- Validate unique step IDs and action IDs where applicable.
- Validate variable references.
- Validate safety policy.
- Return actionable validation errors with step/action paths.
- Keep validation platform-neutral.

**Done when:** invalid flow JSON cannot be executed or published and errors identify exactly what needs fixing.

### [ ] 1.4 Flow compatibility/migration
**Target:** Support future schema versions without breaking existing published flows.

Requirements:
- Add explicit `schemaVersion` handling.
- Provide migrations for compatible older flow definitions.
- Reject unsupported future schema versions safely.
- Preserve flow version separately from schema version.

**Done when:** an older flow can be loaded and migrated deterministically, while an unknown future schema is blocked with a clear message.

---

## Phase 2 — User profiles and booking configuration

### [ ] 2.1 Profile manager
**Target:** Store reusable pilgrim/customer profiles locally and securely enough for the intended extension use case.

Profile fields should be extensible but initially cover common booking identity fields such as name, age/date of birth where required, gender, ID type and ID number.

Requirements:
- Create/edit/delete profiles.
- Validate required fields by flow/booking type.
- Never expose profiles to a remote service by default.
- Do not store passwords, OTPs or payment credentials in profiles.
- Make profile fields available as flow variables at execution time.
- Clearly warn users that local browser storage is not a secure vault.

**Done when:** a user can maintain a reusable set of profiles and select them for a booking without retyping every field.

### [ ] 2.2 Profile groups
**Target:** Select an ordered group of profiles for a booking session.

Requirements:
- Create/edit/delete groups.
- Add/remove/reorder profiles.
- Preserve profile references rather than duplicating profile data.
- Validate group size against the selected flow's constraints when known.

**Done when:** one saved group can be reused across different booking sessions and flow versions.

### [ ] 2.3 Booking strategy model
**Target:** Separate booking intent/strategy from website mechanics.

A strategy should be able to express things such as booking type, preferred date, preferred slot/time window, number of attempts, selection preferences and manual checkpoints without embedding website-specific selectors.

**Done when:** `Flow + Profile Group + Booking Strategy` produces a complete `BookingSession` configuration.

### [ ] 2.4 Session builder UI
**Target:** Provide a clear pre-run configuration screen.

Requirements:
- Select flow.
- Select profile group.
- Select booking strategy.
- Resolve/display variables that will be passed into the flow.
- Validate the configuration before Run.
- Clearly show what remains manual.

**Done when:** a user can create a valid booking session without editing JSON.

---

## Phase 3 — Runtime robustness

### [ ] 3.1 Navigation-aware runtime
**Target:** Make the runtime robust across redirects, SPA route changes and page transitions.

Requirements:
- Detect URL changes.
- Support flow checkpoints across pages/routes.
- Re-acquire DOM elements after navigation.
- Preserve session state safely.
- Avoid rerunning completed destructive actions after a page transition.

### [ ] 3.2 Better selector fallback and scoring
**Target:** Make selector resolution resilient to minor website DOM changes.

Requirements:
- Rank stable selectors above generated positional selectors.
- Prefer id/name/aria/role/label-like selectors when stable.
- Detect ambiguous matches and fail/manual-takeover rather than clicking the wrong element.
- Record which selector actually matched for telemetry/debugging.

### [ ] 3.3 Action-level verification
**Target:** Never assume an action succeeded merely because it executed.

Requirements:
- Verify expected element state/text/URL after actions.
- Support action-specific success conditions.
- Capture before/after state where useful.
- Escalate to manual takeover when verification fails.

### [ ] 3.4 Retry policy
**Target:** Make retries safe and intentional.

Requirements:
- Per-action retry count/delay.
- Retry only retryable failures.
- Avoid repeating actions that could create duplicate bookings/submissions.
- Use idempotency-aware semantics where possible.
- Record retry attempts in telemetry.

### [ ] 3.5 Manual takeover UX
**Target:** The user can safely take over at any uncertain or human-only step and resume afterward.

Requirements:
- Clear reason for takeover.
- Pause runtime without losing session state.
- Resume from the correct checkpoint.
- Support mandatory manual checkpoints before sensitive steps.
- Stop before payment unless explicitly redesigned and still human-controlled.

### [ ] 3.6 Safety guardrails
**Target:** Enforce the project's safety boundary in code, not only documentation.

Must block/avoid:
- CAPTCHA solving/bypass.
- OTP interception/automation/bypass.
- Payment authentication bypass.
- Server-side virtual queue bypass or manipulation.
- Credential theft or hidden submission.

The extension may optimize legitimate page interactions, autofill, selector handling, waiting, verification and manual handoff.

**Done when:** runtime tests prove protected action categories cannot be silently automated.

---

## Phase 4 — TTD Special Entry Darshan implementation

### [ ] 4.1 Capture the real current TTD flow
**Target:** Use the admin recorder against the live official TTD portal to capture the actual current booking sequence and DOM metadata.

Important: the web research environment cannot substitute for a real browser recording because the official portal is JavaScript-heavy. Do not invent selectors from static assumptions.

Capture, where applicable:
- entry to booking area;
- date/month selection;
- Special Entry Darshan selection;
- slot/time selection;
- pilgrim count/profile form;
- form validation;
- review/confirmation screens;
- queue/wait states;
- CAPTCHA/OTP/payment checkpoints as manual checkpoints only.

### [ ] 4.2 Build TTD production flow v1
**Target:** Convert the verified recording into a clean, declarative TTD flow.

Requirements:
- Stable selector fallbacks.
- Explicit waits and route/page checkpoints.
- Explicit verification after important selections.
- Variables for booking date/slot and pilgrim data.
- Manual checkpoint for CAPTCHA/OTP and any other human authentication.
- Stop before payment.
- Keep the flow disabled until tested end-to-end.

### [ ] 4.3 TTD flow validation against live portal
**Target:** Run the flow through non-payment stages and confirm it survives normal portal behavior.

Test cases:
- normal successful path;
- slow network/page load;
- queue/wait state;
- selector variation where known;
- invalid/expired slot;
- unavailable date/slot;
- unexpected page/route;
- manual CAPTCHA/OTP handoff;
- user cancellation.

Do not claim production readiness until the live tests pass.

### [ ] 4.4 TTD timing/slot constraints
**Target:** Model the fact that the booking system can expose availability/queue timing and that a booked Special Entry Darshan ticket is tied to its allotted time.

The engine should wait for legitimate UI states rather than attempting to manipulate server-side queue state. Slot selection must be treated as a verified state transition.

### [ ] 4.5 TTD flow release
**Target:** Publish only verified flow versions through the flow registry.

Requirements:
- Semantic flow versioning.
- Changelog/release notes.
- Enabled flag controlled by validation/release process.
- Rollback to previous known-good flow.
- User extension cache invalidation/update behavior.

---

## Phase 5 — Flow distribution and lifecycle

### [ ] 5.1 Remote flow registry
**Target:** User extension can discover published flows without rebuilding the extension.

Current MVP uses GitHub raw content. Harden it.

Requirements:
- Registry metadata with schema version and flow versions.
- Enabled/disabled state.
- Compatibility metadata.
- Published timestamp/commit/version.
- Clear distinction between draft and production flows.

### [ ] 5.2 Flow caching and rollback
**Target:** Keep the last known-good compatible flow locally and recover gracefully if remote content is unavailable.

Requirements:
- Cache successful downloads.
- Validate before activation.
- Never replace a valid cached flow with invalid JSON.
- Roll back to previous version when a release is withdrawn.

### [ ] 5.3 Secure distribution
**Target:** Prevent arbitrary remote flow JSON from gaining more privileges than intended.

Requirements:
- Validate schema and allowed actions.
- Restrict host/origin matching.
- Enforce safety policy at runtime.
- Consider integrity/signature verification if the distribution model requires it.
- Avoid remotely executable JavaScript; flows remain data.

### [ ] 5.4 Admin publishing workflow
**Target:** Move from local JSON generation to an intentional draft → review → publish lifecycle.

Suggested states:
`draft → validated → tested → approved → published → disabled/rolled-back`.

---

## Phase 6 — Telemetry, diagnostics and supportability

### [ ] 6.1 Structured execution telemetry
**Target:** Make every session diagnosable without collecting sensitive personal data.

Capture:
- session ID;
- flow/version;
- step/action IDs;
- timestamps/duration;
- success/failure;
- retry count;
- selector used (not sensitive field values);
- manual takeover events;
- final session status/error code.

Do not capture OTPs, passwords, payment data or unnecessary identity values.

### [ ] 6.2 Local diagnostics UI
**Target:** User/admin can inspect why a flow stopped.

Requirements:
- Last session summary.
- Step timeline.
- Error reason.
- Manual checkpoint history.
- Export sanitized diagnostics for support.

### [ ] 6.3 Metrics and reliability reporting
**Target:** Track flow health by version without compromising user privacy.

Useful metrics:
- completion rate to each checkpoint;
- selector fallback frequency;
- average action duration;
- manual takeover frequency;
- failure categories;
- flow-version regression rate.

Keep telemetry local by default unless a future explicit backend/consent model is designed.

---

## Phase 7 — Testing and quality

### [ ] 7.1 Unit tests
**Target:** Comprehensive tests for schema validation, selector ranking/resolution, interpolation, action execution, retry behavior and safety guards.

### [ ] 7.2 Runtime DOM fixture tests
**Target:** Execute flows against deterministic HTML fixtures representing important page states.

Include:
- stable DOM;
- changed IDs/classes with fallback selectors;
- slow element appearance;
- missing/ambiguous elements;
- select/checkbox/input controls;
- verification failures;
- manual checkpoints.

### [ ] 7.3 Flow contract tests
**Target:** Every published flow must pass schema, safety and host-match validation before release.

### [ ] 7.4 End-to-end browser tests
**Target:** Use a browser automation test environment against controlled fixtures/staging where possible. Do not automate real CAPTCHA/OTP/payment authentication.

### [ ] 7.5 Regression suite
**Target:** Every flow version and runtime change should run the full regression suite in CI.

---

## Phase 8 — CI/CD and repository engineering

### [ ] 8.1 Shared workflow integration
**Target:** Integrate this repository with `ravitejakamalapuram/.github-workflows-shared` wherever the shared workflows are applicable.

Requirements:
- Inspect the shared-workflows repository before integration.
- Prefer reusable workflows over duplicating standard CI logic.
- Verify workflow inputs/permissions and Node/npm compatibility.
- Do not blindly copy a broken shared workflow.
- If the shared repository contains a genuine bug that blocks safe integration, fix it in a separate PR there and document the dependency here.

### [ ] 8.2 CI baseline
**Target:** Every push/PR runs install, test, typecheck and build.

Current workflow exists in `.github/workflows/ci.yml`; verify it remains green after every change.

### [ ] 8.3 Build artifacts
**Target:** CI produces versioned user/admin extension artifacts suitable for manual installation/release.

Requirements:
- Build both extensions.
- Validate MV3 manifests.
- Package each extension as a ZIP artifact.
- Include flow registry/definitions where appropriate.
- Keep secrets out of artifacts.

### [ ] 8.4 Release automation
**Target:** A tagged/reviewed release publishes extension artifacts and the approved flow version with release notes.

Do not automatically enable an unverified TTD flow merely because code was merged.

### [ ] 8.5 Dependency/reproducibility hygiene
**Target:** Reproducible installs and predictable CI.

Requirements:
- Commit `package-lock.json` or deliberately document the package-manager policy.
- Pin/standardize Node version.
- Keep dependencies minimal.
- Add dependency/security checks where appropriate.

### [ ] 8.6 Static quality checks
**Target:** Catch JavaScript/JSON/manifest errors before runtime.

Consider:
- ESLint or equivalent;
- JSON/schema validation;
- extension manifest validation;
- formatting/checks;
- forbidden-pattern checks for unsafe automation.

---

## Phase 9 — Security and privacy hardening

### [ ] 9.1 Data minimization
**Target:** Store only data necessary for local booking assistance.

### [ ] 9.2 Storage protection
**Target:** Document the limitations of browser extension storage and avoid treating it as a secure credential vault.

### [ ] 9.3 Permission minimization
**Target:** Keep extension permissions narrowly scoped to supported booking hosts and required distribution endpoints.

### [ ] 9.4 Threat model
**Target:** Document threats including malicious flow definitions, compromised distribution, DOM spoofing, accidental wrong-person selection, duplicate submission and sensitive-data leakage.

### [ ] 9.5 Wrong-target protection
**Target:** Before filling/submitting, verify the intended site/origin and, where possible, visible booking context. Ambiguity must stop execution rather than guess.

---

## Phase 10 — UX and operational polish

### [ ] 10.1 Clear run state
**Target:** User always knows whether the engine is idle, waiting, running, paused for manual action, completed or failed.

### [ ] 10.2 Preflight checklist
**Target:** Before starting, show required profile fields, selected date/slot, flow version, supported site and manual checkpoints.

### [ ] 10.3 Failure recovery
**Target:** Provide restart/resume/reset semantics without accidentally repeating irreversible actions.

### [ ] 10.4 Accessibility
**Target:** Extension UI and manual takeover controls are keyboard accessible and understandable.

### [ ] 10.5 Documentation
**Target:** Maintain architecture, flow-authoring, local development, release and troubleshooting docs.

---

# Non-negotiable product decisions

1. **Generic engine first.** TTD is the first adapter/flow, not a collection of TTD-specific hardcoded code paths.
2. **Data-driven flows.** Website behavior is represented by versioned JSON and interpreted by the runtime.
3. **Profiles are separate from flows.** Flow updates must not overwrite user profile data.
4. **Booking strategy is separate from website mechanics.** The same profile group can be used with different booking strategies and flow versions.
5. **Remote flow updates must not require rebuilding the user extension.**
6. **Generated flows are reviewable.** Recording does not equal publishing.
7. **Disabled until verified.** The current TTD starter flow remains disabled until real selectors and sequence are captured and tested.
8. **Human-only security steps stay human.** CAPTCHA, OTP, payment authentication and server-side queue controls are not bypassed.
9. **Payment remains human-controlled.**
10. **Manual takeover is a first-class runtime feature, not an error workaround.**
11. **Safety is enforced in code and validated in CI.**
12. **Local-first privacy.** No unnecessary remote collection of identity or execution data.
13. **Flow releases are versioned and rollbackable.**
14. **CI/CD should use the shared workflow repository where appropriate, but broken shared workflows must be fixed rather than copied around.**
15. **Do not claim a live TTD flow works until it has been captured and validated against the current portal.**

# Definition of Done for the overall project

- [ ] Generic flow engine is stable and tested.
- [ ] Admin can record, edit, validate and publish a flow.
- [ ] User can manage profiles/groups and create a booking session.
- [ ] User extension can safely fetch, validate, cache and execute published flows.
- [ ] Manual takeover works for CAPTCHA/OTP/payment/security checkpoints.
- [ ] TTD SED flow is captured from the real current portal, tested, versioned and only then enabled.
- [ ] CI/CD is green and integrated with shared workflows where appropriate.
- [ ] Extension artifacts can be built/released reproducibly.
- [ ] Diagnostics can explain failures without leaking sensitive data.
- [ ] Safety/security tests prevent prohibited automation and unsafe flow execution.
- [ ] Documentation is sufficient for Codex/another engineer to continue feature-by-feature without reconstructing project history from chat.
