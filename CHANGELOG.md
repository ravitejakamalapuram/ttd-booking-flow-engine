# Changelog

All notable changes to this project are documented here. Both extensions
(`apps/user-extension` and `apps/admin-extension`) share one version number.

## [0.2.0] - 2026-09-21

### Added
- Booking Flow Runner (user extension): runs versioned, published flows with
  step verification, resumable manual takeover, and local timing telemetry.
- Booking Flow Admin Recorder (admin extension): DOM-aware recorder that
  generates a reviewable `FlowDefinition` from a recording.
- Shared packages: versioned flow schema, resilient selector resolution,
  state-machine flow runtime, browser storage abstraction, local telemetry.
- Published flow index and the TTD special-entry darshan starter flow.
- Build script that packages and validates both MV3 extensions into `dist/`.
- Shared CI/CD onboarding, Chrome Web Store listing copy and store assets.

### Fixed
- Valid Chrome host match pattern for the booking portal.
- Host permission to retrieve published flow definitions.
