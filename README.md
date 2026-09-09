# Booking Flow Engine

Data-driven Chrome extensions for fast, resilient booking workflows. TTD is the first target; the runtime is platform-neutral.

## Architecture

- `packages/flow-schema` — versioned workflow model, profiles, groups and booking strategies.
- `packages/selectors` — deterministic DOM selector resolution and discovery helpers.
- `packages/flow-runtime` — state-machine execution, verification, retry and manual takeover.
- `packages/storage` — browser storage abstraction.
- `packages/telemetry` — local session timing and execution events.
- `apps/user-extension` — end-user MV3 extension.
- `apps/admin-extension` — admin recorder/flow authoring extension.
- `flows/ttd` — published TTD flow definitions.

## Safety boundary

The runner does not bypass CAPTCHA, OTP, payment authentication, or server-side queue controls. Payment remains human-controlled.

## Development

```bash
npm install
npm test
npm run typecheck
npm run build
```

Load `dist/user-extension` or `dist/admin-extension` as an unpacked Chrome extension.

## Booking model

`Flow + Profile Group + Booking Strategy = Booking Session`

The same pilgrim group can use different booking types, while flow changes can be published independently of user profile data.
