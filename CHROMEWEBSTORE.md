# Chrome Web Store Listings

This is a multi-module repository with two separately listed extensions.
Structured listing data for both lives in `app-metadata.json` (the single
source of truth used by CI/CD). Per-extension publishing records:

| Extension | Path | Extension ID | Status | Listing record |
| :--- | :--- | :--- | :--- | :--- |
| Booking Flow Runner | `apps/user-extension` | `nennmopkhanobbppokkcedlebnodlglm` | Draft | [apps/user-extension/CHROMEWEBSTORE.md](apps/user-extension/CHROMEWEBSTORE.md) |
| Booking Flow Admin Recorder | `apps/admin-extension` | `njphibicimnehbegefiflolehakkfeii` | Draft | [apps/admin-extension/CHROMEWEBSTORE.md](apps/admin-extension/CHROMEWEBSTORE.md) |

Both extensions: Manifest V3, category Developer Tools, language `en`,
version `0.2.0`. Build both with `npm run build`; load or package
`dist/user-extension` and `dist/admin-extension`.
