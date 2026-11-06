# Useful Hong Kong Government Open Data APIs

Curated API list for **Lingnan University Mobile Student App**.

Official portal help: [DATA.GOV.HK API Specification](https://data.gov.hk/en/help/api-spec)

Portal scale (approx.): 5,800+ datasets · 2,600+ API-enabled datasets  
Categories that matter most for students: transport, weather, holidays, location, recreation, health, immigration.

---

## Design principle

Do **not** integrate open data for the sake of using open data.

Only add datasets that students need **every day** or at **high-stress moments** (typhoon / exam week / first week on campus / visa & admin errands).

### Target users

| Persona | What they need from gov data |
| --- | --- |
| Mainland students | Typhoon / rainstorm rules, HK public holidays vs Mainland calendar, Immigration offices, post offices, commute from NWNT / border |
| Exchange students | Airport → campus commute, weather warnings, nearby services in EN, holidays, clinics / A&E |
| New freshmen | First-week orientation: “how do I get to campus”, nearby facilities, weather, holidays on calendar |
| Local students | Daily commute ETA (Tuen Mun / Yuen Long / Tin Shui Wai), weather alerts for class arrangements, sports / library nearby |

Preferred languages: many APIs support `en` / `tc` / `sc` — use all three where available.

---

## Priority feature modules

### 1. Smart Commute Dashboard — **already in app**

Goal: next bus / MTR to campus, disruptions, routes that serve Lingnan.

Campus context:
- Bus / MTR bus stop name: **嶺南大學 / Lingnan University**
- KMB roadside stop codes used in app: **TM290, TM291, TM251, TM252, TM286** (mapped to KMB hashed stop IDs)
- Nearest heavy rail: **兆康站 Siu Hong (`SIH`)** on **屯馬綫 Tuen Ma Line (`TML`)**
- Useful routes (examples): KMB/LWB `67M`, `67X`, `53`, `261`; Citybus `A33X`, `NA33`, `960*`; MTR Bus `K51`, `K51A`, `K58`; GMB `46`
- MTR Bus ETA uses **POST** `https://rt.data.gov.hk/v1/transport/mtr/bus/getSchedule` with `{ language, routeName }`

| Source | Use | Endpoint / dataset |
| --- | --- | --- |
| KMB / Long Win ETA | Stop list + real-time ETA | `https://data.etabus.gov.hk/v1/transport/kmb/stop` |
| | Route-stop | `https://data.etabus.gov.hk/v1/transport/kmb/route-stop/{route}/{direction}/{service_type}` |
| | Stop ETA | `https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/{stop_id}` |
| | Dataset | [KMB/LWB real-time arrival](https://data.gov.hk/en-data/dataset/hk-td-tis_21-etakmb) |
| Citybus ETA (v2) | Stop index | `https://rt.data.gov.hk/v2/transport/citybus/stop/CTB` |
| | Route-stop | `https://rt.data.gov.hk/v2/transport/citybus/route-stop/CTB/{route}/{direction}` |
| | ETA | `https://rt.data.gov.hk/v2/transport/citybus/eta/CTB/{stop_id}/{route}` |
| MTR Next Train | Siu Hong arrivals | `https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=TML&sta=SIH` |
| MTR Bus | Feeder to campus | `https://rt.data.gov.hk/v1/transport/mtr/bus/getSchedule.php?route_name=K51` |
| Green Minibus (GMB) | Route 46 terminus at campus | [GMB real-time arrival dataset](https://data.gov.hk/en-data/dataset/hk-td-sm_7-real-time-arrival-data-of-gmb) · base host typically `https://data.etagmb.gov.hk/` |

**Student-facing UI ideas**
- Next bus to / from campus
- MTR arrival at Siu Hong + walk / K51 tip
- Optional: diversion / special traffic notice deep-link (see “More APIs” below)

**Status in prototype:** wired in `src/components/ShuttleBusTab.tsx` (KMB, Citybus, MTR; MTR bus probed).

---

### 2. Campus Weather & Typhoon Alerts — **already in app**

Goal: class-arrangement relevant weather, not a full weather hobby app.

| dataType | Meaning | Example |
| --- | --- | --- |
| `rhrread` | Current weather report | temp / humidity / rainfall by place |
| `flw` | Local weather forecast | today’s outlook |
| `fnd` | 9-day forecast | planning week |
| `warnsum` | Warning summary | typhoon / rainstorm / thunderstorm codes |
| `warningInfo` | Warning details | human-readable alert text |
| `swt` | Special weather tips | short tips for push / banner |

Base URL:

```text
https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType={type}&lang={en|tc|sc}
```

Related:
- Hourly rainfall: `https://data.weather.gov.hk/weatherAPI/opendata/hourlyRainfall.php?lang=en`
- Full HKO docs: [HKO Open Data API Documentation (PDF)](https://data.weather.gov.hk/weatherAPI/doc/HKO_Open_Data_API_Documentation.pdf)

**Push / banner copy examples**
- Typhoon Signal No.8 is expected between 2pm–4pm.
- Heavy Rainstorm Warning in force.
- Thunderstorm warning — outdoor activities may be affected.

Prefer **Tuen Mun** / nearby station readings when the payload is place-based.

**Status in prototype:** Home weather card via Vite proxy `/api/hko/...` → `data.weather.gov.hk` (see `HomeTab.tsx`, `vite.config.ts`).

---

### 3. Public Holiday & University Calendar

| Layer | Source | Notes |
| --- | --- | --- |
| HK public holidays | [Hong Kong Public Holidays Data](https://data.gov.hk/en-data/dataset/hk-dpo-statistic-cal) (1823 / DPO) | JSON: `https://www.1823.gov.hk/common/ical/en.json` (proxy `/api/1823/...` in Vite). Used by Calendar to mark public holidays in red. Years e.g. 2025–2027; dictionary: [1823_cal_dictionary.pdf](https://www.1823.gov.hk/datagovhk/statistics/1823_cal_dictionary.pdf) |
| University holidays | Lingnan (provide later) | Merge into same calendar model |
| Examination periods | Lingnan (provide later) | Countdown widgets |
| Academic calendar | Lingnan (provide later) | Term start / add-drop / study break |

**UX**
- Unified calendar: public holiday + university event
- Countdown chips: “3 days to Mid-Autumn Festival”, “Exam week starts in 12 days”
- For Mainland / exchange users: show EN + SC labels; note that HK holidays ≠ Mainland假日

Optional enrichment:
- HKO Gregorian–Lunar conversion API (helpful for Mainland students around CNY / Mid-Autumn) — see HKO docs section 4.

---

### 4. Nearby Government Services

Use location APIs + facility datasets; filter around **Lingnan / Tuen Mun** first.

| Need | Dataset / API | Portal link |
| --- | --- | --- |
| Address search / geocode assist | Address Lookup Service (ALS) | [ALS dataset](https://data.gov.hk/en-data/dataset/hk-dpo-als_01-als) |
| Facilities within ~1 km | LandsD Search Nearby API | [Search Nearby API](https://data.gov.hk/en-data/dataset/hk-landsd-openmap-development-search-nearby-api) |
| Nearest schools (portal helper pattern) | `https://api.data.gov.hk/v1/nearest-schools?lat=...&long=...&max=5` | [API Spec — Find Nearest Facilities](https://data.gov.hk/en/help/api-spec) |
| Post offices | Hongkong Post office info (CSDI / API) | [Post Office Information](https://data.gov.hk/en-data/dataset/hk-hkpo-hkpo_ds01-hkpo-post-office) |
| Immigration offices | IMMD address + working hours + coordinates | [Address and Working Hours of Offices](https://data.gov.hk/en-data/dataset/hk-immd-set2-address-and-working-hours-of-offices) |
| Public libraries | LCSD Libraries | [Libraries](https://data.gov.hk/en-data/dataset/hk-lcsd-csdi-libraries) |
| Sports centres | LCSD Sports Centres | [Sports Centres](https://data.gov.hk/en-data/dataset/hk-lcsd-csdi-sports-centres) |
| Swimming pools | LCSD Swimming Pools | [Swimming Pools](https://data.gov.hk/en-data/dataset/hk-lcsd-csdi-swimming-pools) |

**App list to show near campus**
- Nearby post office
- Immigration office (visa / ID card errands)
- Public libraries
- Sports facilities / pools
- Government / GOC clinics (via Health / DH datasets or Search Nearby — verify current resource before coding)

ALS tip: search with building name or street + number; do not append “Hong Kong Special Administrative Region”.

---

## More APIs recommended for our personas

These are not in the four modules above but score high for daily / first-month value.

### A. Health & safety (everyone, especially exchange / freshmen)

| API / dataset | Why | Link / endpoint |
| --- | --- | --- |
| AQHI by station | Air quality for outdoor sports / hostel windows; use **Tuen Mun** station | [Current AQHI](https://data.gov.hk/en-data/dataset/hk-epd-airteam-current-aqhi-of-individual-air-quality-monitoring-stations) · e.g. `https://dashboard.data.gov.hk/api/aqhi-individual?format=csv` |
| HA A&E waiting time | Emergency orientation — nearest useful HA hospital (e.g. Tuen Mun Hospital) | [A&E Waiting Time](https://data.gov.hk/en-data/dataset/hospital-hadata-ae-waiting-time) (JSON, ~every 15 min) |

### B. Transport extras (commuters + exchange arrivals)

| API / dataset | Why | Notes |
| --- | --- | --- |
| GMB ETA | Route **46** ends at Lingnan — often missed if only KMB/CTB/MTR | [GMB ETA dataset](https://data.gov.hk/en-data/dataset/hk-td-sm_7-real-time-arrival-data-of-gmb) |
| TD special traffic / incident feeds | Disruptions on Tuen Mun Road / NWNT corridors | Search `transport` category on data.gov.hk; deep-link official notices if raw ETA is not enough |
| Airport Authority open data | Exchange / returning students: flight / airport transport context | Provider ID `aahk` on portal |

### C. Admin life (Mainland + exchange + freshmen)

| API / dataset | Why |
| --- | --- |
| IMMD offices | Student visa, extension, ID card collection points + opening hours |
| Hongkong Post | Mail documents / parcels home; pay bills / collect parcels |
| ALS + Search Nearby | “Where is X near campus?” in EN/TC/SC |

### D. Campus life / recreation (local + hostel students)

| API / dataset | Why |
| --- | --- |
| LCSD libraries / sports / pools | After-class options outside campus when facilities are full |
| Recreation & culture category | Occasional event discovery — keep secondary to campus EMS events |

### E. Calendar culture (Mainland students)

| API | Why |
| --- | --- |
| HKO lunar calendar conversion | Explain Mid-Autumn / CNY timing vs Gregorian academic calendar |

---

## Platform helper APIs (DATA.GOV.HK)

Useful when building tooling or discovery — not always needed in the mobile UI.

| Helper | Endpoint | Use |
| --- | --- | --- |
| Historical file list | `https://app.data.gov.hk/v1/historical-archive/list-files` | List files by `start`/`end` (`YYYYMMDD`), optional `category` / `provider` |
| Historical file download | `https://app.data.gov.hk/v1/historical-archive/get-file` | Fetch a past version of a resource URL |
| Data filter API | `https://api.data.gov.hk/v2/filter?q={urlencoded JSON}` | Filter CSV/JSON/XML resources without downloading full files |
| Nearest schools | `https://api.data.gov.hk/v1/nearest-schools?lat=&long=&max=` | Example of nearest-facility pattern |
| CKAN metadata | `https://data.gov.hk/en-data/api/3/action/package_show?id={dataset_id}` | Discover resource URLs programmatically ([CKAN guide](https://data.gov.hk/en/help/ckan-api-development-guide)) |

Common `category` IDs: `transport`, `climate-and-weather`, `recreation-and-culture`, `health`, `law-and-security`, `city-management`, `education`.

Useful `provider` IDs: `hk-hko`, `hk-td`, `mtr`, `ctb`, `hk-dpo`, `hk-immd`, `hk-hkpo`, `hk-lcsd`, `hk-epd`, `hospital`, `aahk`.

---

## Suggested product priority

| Priority | Feature | Users helped most | Effort vs value |
| --- | --- | --- | --- |
| P0 | Smart commute (incl. GMB 46 if missing) | Local, Mainland, freshmen | High value — partly done |
| P0 | Weather + typhoon / rainstorm push | All (class arrangements) | High value — partly done |
| P1 | HK public holidays → calendar + countdown | All; Mainland especially | Medium |
| P1 | Nearby IMMD + Post Office + LCSD | Mainland, exchange, freshmen | Medium |
| P2 | AQHI (Tuen Mun) + A&E wait | All; exchange/freshmen | Low–medium |
| P2 | University calendar / exam merge | All | Depends on LU data |
| P3 | Lunar conversion, airport extras | Mainland, exchange | Nice-to-have |

---

## Implementation notes

1. **CORS:** Browser prototypes may need a same-origin proxy (already used for HKO). Native apps can call endpoints directly subject to operator ToS.
2. **Rate & freshness:** Bus/GMB ETA ~1 min; A&E ~15 min; AQHI hourly; holidays yearly.
3. **Attribution:** Follow each dataset’s terms on data.gov.hk; keep provider names visible where required.
4. **Do not hardcode fragile stop IDs only:** resolve Lingnan stop by name from route-stop indexes, then cache IDs with a refresh strategy.
5. **i18n:** Prefer APIs with `lang=en|tc|sc` for exchange + Mainland users.
6. **University data stays authoritative** for class suspension — HKO warns; Lingnan announces. Show both, never invent suspension policy from weather alone.

---

## Related project docs

- App transport wiring: `README.md` → Data Sources / Shuttle
- Prototype commute UI: `src/components/ShuttleBusTab.tsx`
- Prototype weather UI: `src/components/HomeTab.tsx`
- Internal student/staff APIs: `docs/API_GROUPED_REFERENCE.md`
- Rough route notes (workspace): `transpot.txt`

---

## Quick links

- [API Specification](https://data.gov.hk/en/help/api-spec)
- [DATA.GOV.HK home](https://data.gov.hk/en/)
- [HKO Open Data API PDF](https://data.weather.gov.hk/weatherAPI/doc/HKO_Open_Data_API_Documentation.pdf)
- [CKAN API Development Guide](https://data.gov.hk/en/help/ckan-api-development-guide)
