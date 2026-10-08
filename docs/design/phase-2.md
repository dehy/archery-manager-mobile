# Phase 2 design: home, club, members

Scope: `GET /home`, `GET /club`, `GET /club/members`, `GET /licensees/{id}` (+ picture, attachments), plus the
licensee/season switcher from phase 1. Read-only: no write endpoint exists beyond auth.
Contract: `docs/api/openapi.yaml` in `dehy/archery-manager` (pinned copy to be added in `api/openapi.yaml`).

## 1. Principle: one structure, two native skins

Same information architecture and same code paths on both platforms. The platform decides the _chrome_
(tab bar, headers, menus, sheets, pickers, feedback), through native components, never through custom
look-alikes. Anything the native component does well stays native; we only build what the platform lacks.

| Concern                  | iOS                                                                                | Android                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Tab bar                  | `NativeTabs` (UITabBar, Liquid Glass on iOS 26, minimize on scroll)                | `NativeTabs` (Material 3 navigation bar, indicator pill)                                         |
| Tab icons                | SF Symbols (`sf`)                                                                  | Material Symbols (`md`)                                                                          |
| Screen header            | Large title that collapses, translucent bar                                        | Top app bar (small, elevates on scroll)                                                          |
| Header actions           | `Stack.Toolbar` buttons and menus (UIMenu), icon or text                           | `Stack.Toolbar` icon-only (labels are dropped on Android)                                        |
| Search                   | Native search bar in the header (`Stack.SearchBar`), pulls down with the list      | Material search field via the same API; verify rendering on device                               |
| Lists                    | Inset grouped sections, chevrons, separators inset past the avatar                 | Flat full-width rows, no chevrons, dividers optional, ripple on press                            |
| Switch licensee / season | Header menu (`Stack.Toolbar.Menu`, checkmark on current)                           | Same menu in the app bar overflow; season picker as a bottom sheet                               |
| Sheets                   | `formSheet` with detents and grabber                                               | `formSheet` (max 3 detents; title and actions live inside the content)                           |
| Back                     | Edge swipe, back chevron with previous title                                       | System back / predictive back (keep `predictiveBackGestureEnabled` decision in `app.config.ts`)  |
| Feedback                 | Haptics on selection (`expo-haptics`), no ripple                                   | Ripple, no haptics except long-press                                                             |
| Pull to refresh          | System `RefreshControl`                                                            | System `RefreshControl`                                                                          |
| Colors                   | System colors and `PlatformColor` (label, secondaryLabel, systemGroupedBackground) | Material You dynamic color via `PlatformColor('@android:color/system_*')` with a static fallback |
| Type                     | San Francisco, Dynamic Type                                                        | Roboto / system font, font scale                                                                 |
| Dark mode                | Follows system                                                                     | Follows system                                                                                   |

Rules of thumb for the implementation:

- Platform branching lives in a few thin files (`*.ios.tsx` / `*.android.tsx`) or one `Platform.select` at the leaf, never scattered through screens.
- Respect accessibility settings on both platforms (Dynamic Type / font scale up to 200%, VoiceOver / TalkBack labels, reduce motion).
- Brand color comes from the club (`club.primary_color`) and only tints accents (selected chip, avatar fallback, prominent button). Text and surfaces stay on system colors, and a club color failing 4.5:1 contrast on its tint falls back to the app default.
- `NativeTabs`, `Stack.Toolbar` and `Stack.SearchBar` are SDK 57 APIs, `NativeTabs` still under `expo-router/unstable-native-tabs`. Isolate them in `src/ui/nav/` so a rename is a one-file change.

## 2. Navigation

```
Root Stack (auth gate, already built)
├─ (auth)/login
└─ (app)
   ├─ (tabs)  NativeTabs
   │   ├─ Accueil   home/index
   │   ├─ Club      club/index         (overview + group chips + directory + search)
   │   └─ Compte    account/index      (identity, licensee, season, logout)
   ├─ licensee/[id]                    pushed on the Stack above the tabs, reachable from Club and Compte
   └─ licensee/[id]/attachment/[aid]   opens the downloaded file in the system viewer
```

Why three tabs: Home and Club are the daily surfaces, Account holds the context controls. Events (phase 3) and Results (phase 4) will
take the Home tab's "next events" and "last results" sections as their entry points, and then become tabs of their own (4th and 5th
tab is the platform maximum for comfort).

The selected licensee is shown as a subtle subtitle/menu on Home and Club (a family sees whose data it is). Switching licensee or season:
`setState` in the session store, then `queryClient.clear()` (the API says never to keep JSON across contexts), tabs reload.

## 3. Screens

### 3.1 Accueil (`GET /home`, discriminated union on `state`)

| State           | Content                                                                                        | Primary action                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `blank_account` | Illustration-free empty state: "Aucun licencié n'est rattaché à ce compte."                    | Link to the web app to register a licensee (API versions of registration do not exist yet)                                        |
| `no_license`    | Licensee greeting, season, list of club applications with a status chip and the club's message | None (read-only for now)                                                                                                          |
| `dashboard`     | Greeting + season; **Prochains événements** (up to 5) and **Derniers résultats** (up to 5)     | Tap an event or result: no-op in phase 2 (detail comes with phases 3 and 4); rows are rendered non-interactive, not as dead links |

- Event row: title, date/time range (all day aware), address, type chip, participation state, participant count. Participation labels depend on event type (contest vs training); `null` shows "Pas de réponse".
- Result row: event title and date, distance and target (`30 m, trispot 40 cm`), total score right-aligned, tabular figures.
- iOS: large title "Accueil", inset grouped sections with section headers. Android: top app bar, section titles as Material "label large" with full-width list items.
- Pull to refresh, skeleton rows while loading, error state with retry (never raw `message`).

### 3.2 Club (`GET /club` + `GET /club/members`)

- Header block: logo (public, no token), name, city, member count, season. Club color tints the avatar fallback and selected chip.
- Group filter chips in a horizontal scroller: "Tous", each group with its count, "Sans groupe" with `without_group_count`. Source: `filters` of the members page (`/club` only needed for the overview header).
- Search: native header search, 300 ms debounce, sent as `q`. Empty result state quotes the query.
- Directory: infinite list on `page`/`per_page` (30), `total` and `total_in_club` shown ("12 sur 48 membres"). Row: avatar (picture with bearer header, initials fallback on 404), `display_name` exactly as returned, group names, activity labels (French labels from the API).
- iOS: inset grouped list, chevron, large title "Club". Android: flat list, 56 dp avatar rows, ripple.
- 403 `forbidden`: "Aucune licence pour la saison 2026/2027" with a button that opens the season menu.

### 3.3 Profil licencié (`GET /licensees/{id}`)

- Header: picture (large), `full_name` or `display_name` as returned by the API for the viewer (use `display_name` in the nav title, `full_name` only where the API provides it for the viewer), groups, activities.
- Sections: _Licence_ (club, saison, type, catégorie, catégorie d'âge, activités), _Identité_ (sexe, numéro de licence FFTA), _Documents_ (attachments: type, date, file name, size).
- Attachment tap: download with the bearer token to the cache directory (`If-Modified-Since` honored), open in the system viewer (iOS Quick Look / share sheet, Android `ACTION_VIEW` through a content URI). Progress inline in the row; failure toast, 404 shows "Document introuvable".
- 403: full-screen "Vous n'avez pas accès à ce profil." (expected answer, not an error report). 404: "Profil introuvable."
- iOS: push with large-title-free nav bar, inset grouped list. Android: top app bar with back arrow, list sections.

### 3.4 Compte

- Identity (name, email), **Licencié** row opening a menu/sheet when the account has several licensees (iOS: `UIMenu` from the row; Android: bottom sheet with radio list), **Saison** row (same pattern), "Mon profil" row (needs licensee `id`, see §6), **Se déconnecter** (destructive; iOS action sheet, Android dialog).
- App version footer.

## 4. States and copy

Every screen implements: loading (skeleton), empty, error with retry, offline (message + retry; no stale cache shown after a context change), forbidden.
All copy goes through `src/i18n`. Error codes map to French in `errors.*`; `message` is never displayed. Workflow labels owned by the app:

| Code                                                                                | Label                                                                  |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| application `pending` / `validated` / `waiting_list` / `rejected` / `cancelled`     | En attente / Validée / Liste d'attente / Refusée / Annulée             |
| event `contest_official` / `contest_hobby` / `training` / `free_training` / `other` | Concours / Concours loisir / Entraînement / Entraînement libre / Autre |
| participation (contests) `not_going` / `interested` / `registered`                  | Je n'y vais pas / Intéressé / Je suis inscrit                          |
| participation (trainings) `not_going` / `registered`                                | Absent / Présent                                                       |
| participation `null`                                                                | Pas de réponse                                                         |

## 5. Engineering design

1. **Generated client.** The bootstrap doc forbids hand-written payload types. Add `openapi-typescript` generating `src/api/schema.d.ts` from a pinned copy `api/openapi.yaml`; `npm run api:sync` fetches it with `gh api repos/dehy/archery-manager/contents/docs/api/openapi.yaml`; CI regenerates and fails on `git diff`. Keep the existing fetch wrapper (single-flight refresh, typed `ApiError`) and type its helpers with the generated `paths`. Replace `src/api/types.ts`.
2. **Client fixes required by the final contract.**
   - Refresh answering `account_locked` must keep the tokens (today every 401 on refresh wipes them). Only `invalid_refresh_token` ends the session.
   - Retry on 401 only for `invalid_token`; `authentication_required` / `account_locked` on a normal call are not refresh triggers.
   - Send `device_name` (`expo-device`) on login.
   - Paths relative to `/api/v1`; file URLs (`picture_url`, `url`) are host-root paths, prefixed with the API origin and requested with the bearer header.
3. **Context.** `licensee` (persisted in secure/async storage) and `season` in the session store (already wired to `X-Licensee`/`X-Season`). `GET /me` resolves defaults; persist the user's explicit choice only.
4. **Data layer.** One query hook per endpoint under `src/features/{home,club,licensee}/`; query keys include licensee and season; `useInfiniteQuery` for the directory; `queryClient.clear()` on logout and context change.
5. **Images and files.** `expo-image` with `source={{ uri, headers }}`, placeholder on 404, `recyclingKey` per member. Attachments through `expo-file-system`.
6. **Tests.** Contract fixtures validated against the spec (zod or schema check in tests), hook tests with mocked fetch, RNTL tests per state of Home, platform-agnostic logic tested without native modules. Maestro flows arrive with phase 7, but keep `testID`s stable now.

## 6. API requests to raise (contract first, do not work around)

1. `GET /me` `licensees[]` has no `id`, so "Mon profil" for the non-default licensee cannot call `/licensees/{id}`. Add `id`.
2. No endpoint lists the seasons a licensee has a license for, so the season menu can only offer "current" and guesses. Add `seasons` (per licensee) to `/me`, or a dedicated endpoint.
3. `club.logo_url` is documented as "path or URL"; say which (path from host root vs absolute) so the client can build the URL deterministically.
4. Registration / reset password for the app are still missing; the blank-account and login screens link to the web meanwhile.

## 7. Delivery plan

Branch `phase-2-home-club-members`, atomic gitmoji commits:

1. ✨ OpenAPI sync script, generated types, CI drift check; migrate existing auth/me code to generated types.
2. 🐛 Client fixes from §5.2 with tests.
3. ✨ Native navigation shell (`NativeTabs`, tab screens, `src/ui/nav`), i18n additions.
4. ✨ Home (3 states) with tests.
5. ✨ Club overview + directory (search, group filter, pagination, pictures).
6. ✨ Licensee profile + attachments.
7. ✨ Account: licensee and season switchers.
8. 📝 Update README / CLAUDE.md.

Acceptance (from the bootstrap doc): data matches the web for the same fixture account (season 2027), a forbidden profile shows its message, login → switch licensee → logout works on iOS and Android, a revoked session returns to login.

## 8. Deviations from the design while implementing

- **Licensee/season menus in headers**: dropped. `Stack.Toolbar` menus are icon-only on Android and not worth the fragility yet. The licensee picker is a `formSheet` route on both platforms (reached from Compte), not an iOS `UIMenu`.
- **Season**: read-only row in Compte until the API lists a licensee's seasons (request #2).
- **"Mon profil"** uses the licensee id returned by `/home` for the resolved licensee, so request #1 (id in `/me`) is nice to have, not blocking.
- **Documents** open through the system share sheet (`expo-sharing`) after an authenticated download; there is no in-app preview or Quick Look yet.
- **Typed routes** are off (`typedRoutes: false`): the route types are only generated by the dev server, which CI does not run.
- **Android colors** are a static light/dark palette, not Material You dynamic color yet; iOS uses system colors.
