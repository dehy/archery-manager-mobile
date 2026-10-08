# Quiver (codename) — Archery Manager mobile

Member-facing React Native app (Expo) for [Archery Manager](../archery-manager). Club-admin features stay on the web app.
The name, slug, scheme and bundle identifiers are temporary and live in `app.config.ts`.

## Setup

```sh
npm install
# Backend (other repo): make start, then http://localhost:8080
npm run ios        # or: npm run android
```

`ios/` and `android/` are generated (continuous native generation) and git-ignored.

### API URL

`EXPO_PUBLIC_API_URL` (default `http://localhost:8080`). On the Android emulator `localhost` is
rewritten to `10.0.2.2`. EAS profiles set it per environment in `eas.json`.

## API contract

`api/openapi.yaml` is a pinned copy of the backend's contract. `npm run api:sync` refreshes it (needs `gh`) and
regenerates `src/api/schema.d.ts`; `npm run api:check` fails when the generated file is out of date.

## Scripts

`npm run typecheck` · `npm run lint` · `npm test` · `npm run format` · `npm run api:sync` · `npm run api:check`

## Backend contract

Bearer-token API under `/api/v1`: auth (`/auth/login|refresh|logout`), `/me`, `/home`, `/club`, `/club/members`, `/licensees/{id}` (+ picture, attachments), `/health`.
Errors are `{ "error": "<code>", "message": "..." }`. Context headers: `X-Licensee`, `X-Season`.
