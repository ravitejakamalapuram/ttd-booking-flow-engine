# Codex Handoff — Booking Flow Engine

You are taking over implementation of this repository. The project history was discussed extensively before this handoff. Do not reconstruct requirements from chat; use the repository documents as the source of truth.

## Start here

1. Read `README.md`.
2. Read `docs/IMPLEMENTATION_CHECKLIST.md` completely.
3. Inspect the current source tree before changing anything.
4. Check the latest GitHub Actions status for the current default branch.
5. Inspect `ravitejakamalapuram/.github-workflows-shared` before changing CI/CD.

## Mission

Build a generic, data-driven browser booking-flow platform. TTD Special Entry Darshan is the first supported flow, but TTD-specific mechanics must not leak into the generic runtime. The architecture is:

`Flow + Profile Group + Booking Strategy = Booking Session`

Flows are versioned data. Profiles/groups are user data. Booking strategy expresses user intent. The runtime interprets flows.

## Execution order

Follow `docs/IMPLEMENTATION_CHECKLIST.md` from top to bottom, respecting dependencies. The first major unfinished work is Phase 1 (production-grade recorder, flow editor, validation/migration). Then move through profiles/session builder, runtime robustness, TTD live-flow capture/validation, distribution lifecycle, telemetry/diagnostics, testing, CI/CD, security/privacy and UX polish.

For every feature:

- Implement the complete feature, not a placeholder.
- Keep APIs/types generic and reusable.
- Add automated tests.
- Run `npm test`.
- Run `npm run typecheck`.
- Run `npm run build`.
- Inspect the resulting diff for accidental scope creep.
- Update `docs/IMPLEMENTATION_CHECKLIST.md` from `[ ]` to `[x]` only when the feature's Definition of Done is genuinely met.
- Document important implementation decisions/limitations in the repository.

## Current state

The repository already contains:

- generic flow schema;
- selector resolver/discovery helpers;
- resilient flow runtime with retry, waits, verification and manual takeover;
- storage abstraction;
- local telemetry;
- admin MV3 recorder MVP;
- user MV3 runner MVP;
- GitHub-based published flow index loading;
- TTD Special Entry Darshan starter flow;
- CI for test/typecheck/build;
- source-of-truth implementation checklist.

The TTD starter flow is intentionally disabled because its real selectors/sequence have not yet been captured and verified against the live current portal.

## Critical safety/product constraints

These are non-negotiable:

- Never bypass or solve CAPTCHA.
- Never intercept, bypass or automate OTP authentication.
- Never bypass payment authentication.
- Never manipulate/bypass a server-side virtual queue.
- Payment remains human-controlled.
- Manual takeover is a first-class feature for human/security checkpoints.
- Do not silently submit sensitive or irreversible actions.
- Do not collect/store unnecessary identity, OTP, password or payment data.
- Do not treat browser storage as a secure credential vault.
- Remote flows are data, not remotely executable JavaScript.
- Validate a remote flow before activation.
- Do not enable the TTD production flow until it has been captured and live-tested.

The system may optimize legitimate browser interactions: waiting for UI state, filling ordinary form fields from user-selected profiles, selecting options, clicking normal UI controls, verifying state, handling selector fallbacks, telemetry and handing control back to the user.

## TTD-specific constraint

The official TTD portal is JavaScript-heavy. Static web research is not sufficient to invent production selectors. Use the admin recorder in a real browser session to capture the current flow. Treat CAPTCHA/OTP/payment/queue states as manual checkpoints. Do not claim a live flow works until it has been tested.

## Coding principles

- Prefer small composable modules.
- Keep flow definitions declarative.
- Avoid hardcoded TTD selectors in generic runtime code.
- Prefer stable selectors and ambiguity detection over positional guessing.
- Make retries safe and idempotency-aware.
- Never retry irreversible operations blindly.
- Preserve session/checkpoint state across navigation.
- Keep telemetry sanitized.
- Fail closed when site/origin/action intent is ambiguous.
- Maintain backward compatibility for published flow versions where practical.

## CI/CD

The project has an existing CI workflow. The target is to integrate the user's shared workflows repository where appropriate rather than duplicating standard workflow logic. Inspect the shared repository first. If it has a real defect blocking safe integration, fix it in that repository through a separate PR and document why. Do not blindly copy broken workflows.

CI should eventually cover tests, typecheck, build, extension packaging, flow validation and release safeguards. Never make CI automatically enable an unverified TTD flow.

## Git workflow

Work feature-by-feature. Keep commits focused and descriptive. Prefer PRs for substantial changes when the repository workflow supports them. Never overwrite unrelated work. Before reporting completion, verify the actual branch contents and CI status rather than assuming a successful local result means GitHub CI passed.

## Handoff completion condition

Continue until the checklist is complete or a genuinely external blocker is reached. If blocked by the live TTD portal, credentials, CAPTCHA/OTP, or unavailable external access, implement everything that can be safely verified locally and leave an explicit checklist item describing exactly what human action is required next.
