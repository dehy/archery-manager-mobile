# Quiver (codename) — Archery Manager mobile

Expo (SDK 57, managed + EAS) / React Native / strict TypeScript. Backend lives in the sibling repo
`../archery-manager` (Symfony, mobile API under `/api/v1`, see `src/Controller/Api/V1` and
`src/Security/Api` there). Members-only scope.

Expo APIs change every SDK: check https://docs.expo.dev/llms.txt before using an Expo/RN API from memory.
Install Expo-aware packages with `npx expo install`.

## Layout
- `src/app/` Expo Router routes (`(auth)` signed-out, `(app)` signed-in, gated in `_layout.tsx`)
- `src/api/` fetch client (bearer, single-flight refresh, typed `ApiError`), config, types
- `src/auth/` secure token storage and the zustand session store (`api` singleton lives in `session.ts`)
- `src/ui/` theme and primitives; `src/i18n/` French-first strings (no hardcoded UI text)

## Conventions
- Server state with TanStack Query, client state with zustand, forms with react-hook-form + zod.
- Path alias `@/*` → `src/*`. Prettier: single quotes, width 100.
- Before finishing: `npm run typecheck && npm run lint && npm test`.
- Never commit `ios/` or `android/`.
