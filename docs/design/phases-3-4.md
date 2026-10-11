# Phases 3 and 4: events, RSVP, results, practice advice, calendar feed

Contract: `api/openapi.yaml` synced from `dehy/archery-manager@main` (API phases 3 and 4).
Same principle as phase 2: one structure, native chrome per platform (see `phase-2.md` §1).

## Navigation

```
(tabs)  Accueil · Événements · Club · Compte          each tab has its own URL: / /events /club /account
Pushed above the tabs (reachable from several tabs):
  event/[id]                 detail + RSVP
  event/[id]/participants
  event/[id]/results         contest results
  results                    my results, by season
  advice, advice/[id]        practice advice
  calendar                   personal calendar feed
  licensee/[id], licensee-picker (phase 2)
```

Entry points: Home event rows → event; Home result rows → contest results, plus "Tous mes résultats";
Compte → "Mon activité" (Mes résultats, Conseils, Abonnement calendrier).

## Decisions

- **Events tab**: one month at a time (`GET /events?from&to`, well under the 100-day limit), grouped by
  the club's calendar day read from the ISO string, so a device in another timezone does not move events.
  Restricted events (`can_participate: false`) say so in the row and in the form.
- **RSVP**: chips for the answer, activity (only when the license has several), target face and departure
  (contests only, from `participation_options`). The whole answer is sent with `PUT`; contest-only fields are
  never sent for other events. Saving is allowed when something changed or when the current answer is an
  unrecorded default (`is_default`). The response becomes the cached event; lists and home are refetched.
  `event_restricted` and `validation_failed` have their own French messages.
- **Results**: the history is shown one season at a time (chips), with a progression chart of the season's
  most frequent format (discipline, distance, target face and size). Totals of different formats are never
  charted together. The chart is drawn with Views (no native chart module, no dev-client rebuild) and is one
  sentence for screen readers.
- **Practice advice**: the API sends `advice_markdown` (what the coach typed; older advice may hold HTML) and
  `advice_html` (converted with GitHub-flavored Markdown, then sanitized with Symfony's safe elements,
  https/mailto links and https images). The app renders `advice_html` natively (`src/ui/html/HtmlContent.tsx`,
  on `htmlparser2`): headings, inline styles, lists, quotes, code, tables; any other block is a plain container
  so nothing the sanitizer keeps is dropped. Links other than https/mailto are never opened (defence in depth).
  `react-native-render-html` was rejected: unmaintained since 2022 and relies on APIs removed in React 19.
- **Calendar feed**: the URL is the credential. It is never shown in full (host and last characters only);
  "Ajouter à mon calendrier" opens it as `webcal://`, "Partager" uses the system share sheet (no clipboard
  module, so no native rebuild). Regenerating and revoking ask for confirmation.
- **Documents** (licensee, event, advice) share one download-and-share flow (`src/features/files`).

## API findings and requests

1. **Directory → profile dead end.** An ordinary member gets `403` on every other member's profile, but the
   directory cannot know that before the tap. Request: a flag such as `can_view_profile` on `MemberSummary`
   (or the viewer's roles in `/me`), so rows are only tappable when the profile will open.
2. **`participants_count` differs between endpoints.** `EventSummary` (home) documents it as including members
   without an answer yet; `/events` documents it as recorded answers other than `not_going`. Please align the
   definition or document the difference, since both appear side by side in the app.
3. **All-day events end at midnight of the next day** (exclusive end, e.g. `2026-10-10T00:00` →
   `2026-10-11T00:00`). The app handles it; documenting it in `EventSummary.ends_at` would help other clients.
4. **Fixtures**: no account has results or practice advice, so these screens are only covered by unit tests
   on the contract shapes. Fixtures with a few results (two formats in one season) and an advice with an
   attachment would allow checking them against real data.
5. **Club logo**: `/uploads/les-archers-de-guyenne.svg` answers `404` locally (fixture file missing, or a
   wrong path); the app shows no logo in that case.
6. Still open from phase 2: licensee ids in `/me`, and the list of a licensee's seasons.
