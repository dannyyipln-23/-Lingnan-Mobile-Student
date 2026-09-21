# SKILLS: Fast Context Guide for Contributors and AI Agents

This file is optimized to help new contributors (human or AI) understand the system quickly and make safe edits.

## 1. Project identity

- Type: frontend web prototype
- Framework: React + TypeScript + Vite
- Main UX model: mobile-style tab app

## 2. High-value files to read first

1. `src/App.tsx`
2. `src/components/NavigationBottomBar.tsx`
3. `src/components/EventsTab.tsx`
4. `src/components/ShuttleBusTab.tsx`
5. `docs/SYSTEM_SPEC.md`
6. `docs/IMPLEMENTATION_LOG.md`

## 3. Module ownership map

- Events data/rendering: `src/components/EventsTab.tsx`
- Shuttle transport API orchestration: `src/components/ShuttleBusTab.tsx`
- Tab registration and routing: `src/App.tsx`
- Tab labels/icons/highlight behavior: `src/components/NavigationBottomBar.tsx`

## 4. Current operational decisions

- Events uses local test JSON at `public/event_api.json`.
- Shuttle calls live public APIs (KMB/Citybus/MTR).
- Shuttle auto-refresh period is 120 seconds.
- MTR bus is currently a one-time endpoint reachability check.

## 5. Edit patterns that are considered safe

- UI text/style tweaks inside tab components.
- Local template adjustments to `public/event_api.json`.
- Shuttle route list updates (KMB/Citybus arrays).
- Non-breaking helper additions in `ShuttleBusTab.tsx`.

## 6. Edit patterns requiring extra care

- Any change to stop matching regex in shuttle flow.
- Any change to API endpoint paths or response assumptions.
- Global state flow changes in `App.tsx`.
- Dependency upgrades in `package.json` (Node compatibility impact).

## 7. API response assumptions (important)

- Events payload shape: `{ items: EventItem[] }`.
- KMB stop index: `data[]` with `stop`, `name_en`, `name_tc`.
- KMB route-stop: `data[]` with `stop`, `bound`.
- KMB ETA: `data[]` with `route`, `dir`, `eta`.
- Citybus stop index: `data` map keyed by stopId.
- Citybus route-stop: `data[]` with `stop`, `dir`.
- Citybus ETA: `data[]` with `route`, `dir`, `eta`.
- MTR train schedule: `data['TML-SIH'].UP|DOWN[]` with `ttnt`.

## 8. Quality checklist before merge

1. Run: `npm run lint`
2. Verify Events tab renders from local JSON.
3. Verify Shuttle tab manual refresh works.
4. Verify no runtime crash when one feed fails.
5. Verify Last updated timestamp still updates.

## 9. Recommended next improvements

1. Add configurable data source switch for Events (local/live).
2. Add in-memory cache per endpoint with TTL.
3. Add retry/backoff for transient API failures.
4. Add simple telemetry counters for request success/failure.
