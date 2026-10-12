# Karkwa — Archery Manager mobile

Expo (SDK 57, managed + EAS) / React Native / strict TypeScript. Backend lives in the sibling repo
`../archery-manager` (Symfony, mobile API under `/api/v1`, see `src/Controller/Api/V1` and
`src/Security/Api` there). Members-only scope.

Expo APIs change every SDK: check https://docs.expo.dev/llms.txt before using an Expo/RN API from memory.
Install Expo-aware packages with `npx expo install`.

## Contract

- Source of truth: `api/openapi.yaml` (pinned copy of `docs/api/openapi.yaml` in the backend repo). Refresh with `npm run api:sync [ref]`; types land in `src/api/schema.d.ts` (generated, never edit). CI runs `npm run api:check` and fails on drift.
- Never hand-write API payload types: alias the generated ones in `src/api/types.ts`. If the app needs a field or endpoint the API lacks, write an API request in `docs/design/` instead of working around it.
- Errors are `{ error, message }`: branch on `error`, show French copy from `src/i18n`, never the `message`.

## Layout

- `src/app/` Expo Router routes (`(auth)` signed-out, `(app)` signed-in, gated in `_layout.tsx`)
- `src/api/` fetch client (bearer, single-flight refresh, typed `ApiError`), config, types
- `src/auth/` secure token storage and the zustand session store (`api` singleton lives in `session.ts`)
- `src/features/<name>/` queries, formatting and content components per area (home, club, licensee, account, events, results, advice, calendar, files)
- `src/ui/` theme, list primitives (`Section`/`Row`/`Chip`), native controls (`controls.tsx`: `Segmented`, `PickerRow`, on `@expo/ui`), `Icon`/`RowIcon` (SF Symbols / Material Symbols via `expo-symbols`, names mapped in `Icon.tsx`), `Avatar`, `BarChart`, `html/` (native renderer for the API's sanitized HTML), `nav/` (isolates unstable Expo Router APIs); `src/i18n/` French-first strings (no hardcoded UI text)

## Conventions

- Server state with TanStack Query, client state with zustand, forms with react-hook-form + zod.
- Path alias `@/*` → `src/*`. Prettier: single quotes, width 100.
- Before finishing: `npm run typecheck && npm run lint && npm test`.
- Never commit `ios/` or `android/`.

## Platform idioms

Same screens, native chrome: `NativeTabs`, native stack headers with large titles (iOS), `Stack.SearchBar`, `formSheet` for pickers.
iOS uses system colors and inset grouped lists; Android flat lists with ripple. Branch on `isIOS` from `@/ui` at the leaf, not in screens.
Club tint: the selected licensee's `Club.primary_color` (`useBrand`, persisted by the session) is the iOS tint (contrast-fitted, `DynamicColorIOS`) and the seed of a Material 3 fidelity scheme on Android (`src/ui/clubColor.ts`); take colors from `useTheme()`, and header/tab colors from `useStackColors`/`useTabBarColors` in `@/ui/nav`.
Design notes and decisions: `docs/design/phase-2.md`, `docs/design/phases-3-4.md`.

## Testing notes

- Jest pins `TZ=Europe/Paris` (`jest.config.js`); dates from the API are read in the club's own offset.
- ESM-only packages must be added to the transform allow-list in `jest.config.js` (it extends jest-expo's list).
- Run `npx tsc --noEmit` and read the whole output: the first error is often the real one.
