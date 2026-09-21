# Implementation Log

## Scope completed

This log records the recent implementation work requested for Events and Shuttle modules.

## 1. Events Page: switch to testing JSON template

### What changed

- Added local template dataset to public assets:
  - `public/event_api.json`
- Updated Events API call:
  - from live EMS URL
  - to local path `/event_api.json`
- Updated copy text in Events header to indicate template mode.
- Updated error message to indicate local test data loading failure.

### Why

- UI/template development should not depend on external EMS uptime.
- Faster and deterministic testing while iterating design and behavior.

### Files touched

- `public/event_api.json`
- `src/components/EventsTab.tsx`

## 2. Shuttle Page: reduce API call volume and improve flow

### What changed

- Added reusable `safeFetchJson` helper.
- KMB flow refactored to:
  - fetch stop index once
  - fetch route-stop combinations in parallel
  - dedupe ETA fetch by stop ID
- Citybus flow refactored to:
  - fetch stop index once
  - fetch route-stop combinations in parallel
  - dedupe ETA fetch by stop+route key
- MTR bus probe changed to single startup endpoint test.
- Auto-refresh interval changed from 60s to 120s.

### Why

- Previous pattern called many APIs one by one.
- Requested goal: reduce unnecessary API calls.
- Parallelized and deduped flow lowers request count and latency.

### Files touched

- `src/components/ShuttleBusTab.tsx`

## 3. Validation

### Checks run

- `npm run lint` (`tsc --noEmit`)

### Result

- Passed.
- No TypeScript errors in modified files.

## 4. Known behavior notes

- Shuttle UI can still show empty results if provider routes do not currently publish Lingnan-matching stops or ETA at query time.
- MTR bus section currently reports endpoint reachability status text, not full bus schedule cards.

## 5. Suggested next steps

1. Add Events source toggle (local JSON vs live EMS API).
2. Add lightweight in-memory cache with TTL per endpoint.
3. Move route lists to config file for easier operational updates.
4. Add API error diagnostics panel for quick transport feed debugging.
