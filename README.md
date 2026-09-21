# Lingnan Mobile Student (Web Prototype)

This project is a Vite + React web prototype that simulates a mobile student app experience for Lingnan University.

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Lucide React icons

## Quick Start

```bash
npm install
npm run dev
```

- Dev URL: http://localhost:3000
- Type-check only: `npm run lint`

## App Structure

Main entry points:

- `src/App.tsx`: tab routing and modal wiring
- `src/components/NavigationBottomBar.tsx`: bottom tab navigation
- `src/components/HomeTab.tsx`: home dashboard
- `src/components/StudentCardTab.tsx`: student card
- `src/components/TimetableTab.tsx`: timetable/task UI
- `src/components/CampusLifeTab.tsx`: campus life widgets
- `src/components/ShuttleBusTab.tsx`: transport API integrations
- `src/components/EventsTab.tsx`: events list template rendering

## Data Sources

### Events (current mode)

- Local template file for testing UI:
  - `public/event_api.json`
- Consumer:
  - `src/components/EventsTab.tsx`

This removes dependency on live EMS endpoint while iterating UI/template behavior.

### Shuttle / Transport

Used by `src/components/ShuttleBusTab.tsx`:

- KMB stop index: `https://data.etabus.gov.hk/v1/transport/kmb/stop`
- KMB route-stop: `https://data.etabus.gov.hk/v1/transport/kmb/route-stop/{route}/{direction}/1`
- KMB stop ETA: `https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/{stopId}`

- Citybus stop index: `https://rt.data.gov.hk/v2/transport/citybus/stop/CTB`
- Citybus route-stop: `https://rt.data.gov.hk/v2/transport/citybus/route-stop/CTB/{route}/{direction}`
- Citybus ETA: `https://rt.data.gov.hk/v2/transport/citybus/eta/CTB/{stopId}/{route}`

- MTR train schedule: `https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=TML&sta=SIH`
- MTR bus reachability probe: `https://rt.data.gov.hk/v1/transport/mtr/bus/getSchedule.php?route_name=K51`

## Key Workflow Summary

- Events tab loads and renders `items[]` from local JSON template.
- Shuttle tab resolves Lingnan stop matches by stop name pattern, then resolves ETA for matched stop/route combinations.
- Shuttle auto-refresh runs every 120 seconds.
- MTR bus endpoint probe runs once on mount for status display.

## Detailed Docs

- System spec/workflow: `docs/SYSTEM_SPEC.md`
- Implementation log: `docs/IMPLEMENTATION_LOG.md`
- Fast onboarding guide: `SKILLS.md`
