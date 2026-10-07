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

## Scripts

`npm run typecheck` · `npm run lint` · `npm test` · `npm run format`

## Backend contract

Bearer-token API under `/api/v1`: `POST /auth/login`, `/auth/refresh`, `/auth/logout`, `GET /me`, `GET /health`.
Errors are `{ "error": "<code>", "message": "..." }`. Context headers: `X-Licensee`, `X-Season`.
