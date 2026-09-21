# System Spec and Workflow

## 1. Purpose

This prototype provides a mobile-style student interface with tab-based modules:

- Home
- Student ID
- Timetable
- Campus
- Shuttle
- Events

## 2. Runtime Architecture

- Frontend-only React app served by Vite.
- No backend service in current runtime path for Events/Shuttle tabs.
- External public APIs are called directly from browser for transport data.
- Event data is currently sourced from local test JSON for template stability.

## 3. Navigation and Module Wiring

`src/App.tsx` controls active tab state and conditional rendering.

Flow:

1. User taps tab in `NavigationBottomBar`.
2. `onChangeTab(tab)` updates `activeTab` in `App.tsx`.
3. Relevant module component is rendered.

## 4. Events Module Spec

Source: `src/components/EventsTab.tsx`

### Data Contract (current)

The component expects:

```ts
type EventItem = {
  event_id: number;
  event_title?: string;
  event_mb_image?: string;
  venue?: string;
  global_start_datetime?: string;
  global_end_datetime?: string;
  event_host?: string;
  organiserDisplay?: string;
  availability_status?: string;
  total_available_spots?: number | null;
};
```

It fetches from:

- `/event_api.json` (served from `public/event_api.json`)

### Rendering Workflow

1. Component mount triggers `loadEvents()`.
2. `fetch('/event_api.json')`.
3. Parse `payload.items`.
4. Render cards with fallback handling:
   - fallback image if `event_mb_image` missing
   - host fallback: `organiserDisplay` -> `event_host` -> "Lingnan University"
5. Set `lastUpdated` timestamp.

### Error Handling

- Non-2xx or parsing failure:
  - show error banner
  - clear `events`

## 5. Shuttle Module Spec

Source: `src/components/ShuttleBusTab.tsx`

### 5.1 Main Goals

- Display MTR train ETA for SIH station.
- Display KMB/Citybus ETA for configured routes where stop name matches Lingnan pattern.
- Keep API load lower via batching + deduping.

### 5.2 Core Route Config

- KMB routes: `67M`, `67X`, `53`, `261`
- Citybus routes: `A33X`, `NA33`, `960A`, `960S`

Stop matching regex:

- `/lingnan university|ling nan university|嶺南大學/i`

### 5.3 API Endpoints

KMB:

- stop index: `GET /v1/transport/kmb/stop`
- route-stop: `GET /v1/transport/kmb/route-stop/{route}/{direction}/1`
- ETA by stop: `GET /v1/transport/kmb/stop-eta/{stopId}`

Citybus:

- stop index: `GET /v2/transport/citybus/stop/CTB`
- route-stop: `GET /v2/transport/citybus/route-stop/CTB/{route}/{direction}`
- ETA by stop-route: `GET /v2/transport/citybus/eta/CTB/{stopId}/{route}`

MTR:

- train: `GET /v1/transport/mtr/getSchedule.php?line=TML&sta=SIH`
- bus probe: `GET /v1/transport/mtr/bus/getSchedule.php?route_name=K51`

### 5.4 Shuttle Data Workflow (optimized)

#### KMB pipeline

1. Fetch KMB stop index once.
2. Fetch all route-stop combinations in parallel.
3. Match first Lingnan stop per route+direction from indexed stop names.
4. Deduplicate matched stop IDs.
5. Fetch ETA once per unique stop ID in parallel.
6. Filter ETA rows by route + bound, map to minute list, sort, keep top 3.

#### Citybus pipeline

1. Fetch Citybus stop index once.
2. Fetch route-stop combinations in parallel.
3. Match first Lingnan stop per route+direction.
4. Deduplicate by `{stopId}__{route}`.
5. Fetch ETA once per deduped key in parallel.
6. Filter by route + dir, map to minute list, sort, keep top 3.

#### MTR pipeline

- Train ETA fetched on each `loadAll()`.
- Bus probe fetched once on mount for status text.

### 5.5 Refresh Policy

- Manual refresh button: immediate `loadAll()`.
- Auto refresh: every 120 seconds.

### 5.6 Failure Strategy

- `safeFetchJson` returns `null` for network/HTTP failures.
- Partial feed failure does not crash UI.
- Overall `loadAll` catch sets user-facing error banner.

## 6. Performance Notes

### Before optimization

- High call count due to sequential per-stop lookups and repeated endpoint probing.

### After optimization

- Stop metadata lookup reduced using index endpoints.
- ETA calls deduplicated.
- Parallelized route-stop and ETA requests.
- MTR bus endpoint probing reduced to one startup check.

## 7. Extension Points

- Add Events source toggle: local template vs live EMS API.
- Add request caching TTL to reduce repeated calls within refresh window.
- Add route config from env or JSON settings file.
- Add telemetry counters for API latency and success rates.
