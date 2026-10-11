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

Answered by the API (PR #153, synced 2026-10-11):

- ~~Directory → profile dead end~~: `can_view_profile` on directory, participant and contest result rows;
  the app makes those rows tappable only when it is true.
- ~~`participants_count` differs between endpoints~~: now recorded answers only, everywhere.
- ~~All-day end~~: documented as **inclusive** (a Saturday–Sunday contest ends on Sunday's date); the app
  reads it that way.
- ~~Fixtures~~: `make fixtures` now loads results (two formats in one season) and an advice with an attachment.
- ~~Licensee ids and seasons in `/me`~~ (phase 2): `X-Licensee` takes the licensee id, `/me` lists each
  licensee's seasons; the app sends ids and has a season picker.

Still open:

1. **Club logo path**: `club.logo_url` is `/uploads/les-archers-de-guyenne.svg` (`404`) while the file is
   served at `/uploads/clubs/les-archers-de-guyenne.svg` (`200`). `ClubPresenter` builds it with
   `UploaderHelper::asset($club, 'logo')`, so the Vich mapping's URI prefix likely lacks `/clubs`. The app
   resolves the path against the API host and shows no logo while it 404s.
