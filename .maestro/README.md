# Maestro flows

End-to-end flows for the iOS simulator (dev build), against the local API with its fixtures.

Prerequisites: API running with `make fixtures` loaded (`../archery-manager`), Metro on port 8081,
the dev build installed on a booted simulator (`npx expo run:ios`).

```sh
maestro --udid <simulator> test .maestro --test-output-dir maestro-output     # every flow
maestro --udid <simulator> test .maestro/events.yaml --test-output-dir maestro-output
maestro test .maestro --include-tags smoke -e EMAIL=user2@ladg.com              # another account
```

Rules:
- Each flow is self-contained: `subflows/start.yaml` resets the app and loads it from Metro,
  `subflows/login.yaml` logs in. Flows never rely on what a previous flow left on screen.
- One Maestro driver at a time: do not run the CLI while the Maestro MCP (or another run) drives
  the same simulator.
- iOS has no `back`: tap `id: "BackButton"`, after `waitForAnimationToEnd` (taps during a push or pop
  animation are dropped). Rows with multi-line labels are matched by `testID`
  patterns (`event-.*`, `member-.*`, `result-.*`) since fixture ids change at every load.
- The flows write data (an RSVP, a calendar link created then revoked): run them on fixtures only.
