import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bus, TrainFront, RefreshCw, MapPin, Clock3 } from 'lucide-react';

type ArrivalCard = {
  route: string;
  provider: 'KMB' | 'Citybus' | 'MTR Bus';
  direction: string;
  stopName: string;
  stopCode?: string;
  minutes: number[];
};

type TrainState = {
  up: number[];
  down: number[];
};

/** Official roadside codes for Lingnan University / nearby campus stops. */
const LU_STOP_CODES = ['TM290', 'TM291', 'TM251', 'TM252', 'TM286'] as const;

/**
 * KMB Open Data uses hashed stop IDs; roadside codes appear in the stop name
 * e.g. "LINGNAN UNIVERSITY (TM290)".
 */
const KMB_STOP_BY_CODE: Record<(typeof LU_STOP_CODES)[number], { stopId: string; label: string }> = {
  TM290: { stopId: 'AA5DA45828958EAE', label: 'Lingnan University (TM290)' },
  TM291: { stopId: 'CC3EF4757AA0964A', label: 'Lingnan University (TM291)' },
  TM251: { stopId: 'E2AE7A37634C8FE5', label: 'Lingnan University (TM251)' },
  TM252: { stopId: '6B3EF5D982B399E6', label: 'Lingnan University (TM252)' },
  TM286: { stopId: 'F1D1F84A466543BE', label: 'Fu Tai Estate (TM286)' },
};

const CITYBUS_ROUTES = ['A33X', 'NA33', 'B3A', '960A', '960S'];
const MTR_BUS_ROUTES = ['K51', 'K58'] as const;
const LINGNAN_NAME_PATTERN = /lingnan university|ling nan university|\u5dba\u5357\u5927\u5b78/i;
const FU_TAI_NAME_PATTERN = /fu\s*tai(\s*estate)?|\u5bcc\u6cf0\u90b8/i;

const citybusStopPatternForRoute = (route: string): RegExp =>
  route === 'B3A' ? FU_TAI_NAME_PATTERN : LINGNAN_NAME_PATTERN;

const minutesFromEta = (etaTime?: string): number | null => {
  if (!etaTime) {
    return null;
  }

  const ms = new Date(etaTime).getTime() - Date.now();
  const mins = Math.round(ms / 60000);
  return Number.isFinite(mins) ? Math.max(0, mins) : null;
};

const providerCardClass = (provider: ArrivalCard['provider']) => {
  if (provider === 'KMB') return 'bus-card bus-card--kmb';
  if (provider === 'Citybus') return 'bus-card bus-card--citybus';
  return 'bus-card bus-card--mtr';
};

const safeFetchJson = async (url: string, init?: RequestInit): Promise<any | null> => {
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch {
    return null;
  }
};

const directionLabel = (dir?: string): string => {
  if (!dir) return 'service';
  if (dir === 'O' || dir.toLowerCase() === 'outbound') return 'outbound';
  if (dir === 'I' || dir.toLowerCase() === 'inbound') return 'inbound';
  return dir;
};

export const ShuttleBusTab: React.FC = () => {
  const [kmbArrivals, setKmbArrivals] = useState<ArrivalCard[]>([]);
  const [citybusArrivals, setCitybusArrivals] = useState<ArrivalCard[]>([]);
  const [mtrBusArrivals, setMtrBusArrivals] = useState<ArrivalCard[]>([]);
  const [trainData, setTrainData] = useState<TrainState>({ up: [], down: [] });
  const [mtrBusStatus, setMtrBusStatus] = useState<string>('Loading...');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadKmb = useCallback(async (): Promise<ArrivalCard[]> => {
    const etaRows = await Promise.all(
      LU_STOP_CODES.map(async (code) => {
        const meta = KMB_STOP_BY_CODE[code];
        const etaJson = await safeFetchJson(
          `https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/${meta.stopId}`,
        );
        return {
          code,
          label: meta.label,
          rows: (etaJson?.data ?? []) as Array<{
            route?: string;
            dir?: string;
            eta?: string;
            dest_en?: string;
          }>,
        };
      }),
    );

    const cards: ArrivalCard[] = [];

    for (const stop of etaRows) {
      const byRouteDir = new Map<string, number[]>();

      for (const row of stop.rows) {
        if (!row.route) continue;

        const mins = minutesFromEta(row.eta);
        if (mins === null) continue;

        const key = `${row.route}__${row.dir ?? ''}`;
        const list = byRouteDir.get(key) ?? [];
        list.push(mins);
        byRouteDir.set(key, list);
      }

      for (const [key, minutes] of byRouteDir.entries()) {
        const [route, dir] = key.split('__');
        cards.push({
          route,
          provider: 'KMB',
          direction: directionLabel(dir),
          stopName: stop.label,
          stopCode: stop.code,
          minutes: [...new Set(minutes)].sort((a, b) => a - b).slice(0, 3),
        });
      }
    }

    return cards.sort((a, b) => a.route.localeCompare(b.route) || a.stopCode!.localeCompare(b.stopCode!));
  }, []);

  const loadCitybus = useCallback(async (): Promise<ArrivalCard[]> => {
    const routeStopRows = await Promise.all(
      CITYBUS_ROUTES.flatMap((route) =>
        ['inbound', 'outbound'].map(async (direction) => {
          const routeStopJson = await safeFetchJson(
            `https://rt.data.gov.hk/v2/transport/citybus/route-stop/CTB/${route}/${direction}`,
          );

          return {
            route,
            direction,
            rows: (routeStopJson?.data ?? []) as Array<{ stop: string; dir: string }>,
          };
        }),
      ),
    );

    const stopIds = [
      ...new Set(routeStopRows.flatMap(({ rows }) => rows.map((row) => row.stop).filter(Boolean))),
    ];
    const stopMap: Record<string, { name_en?: string; name_tc?: string }> = {};
    await Promise.all(
      stopIds.map(async (stopId) => {
        const stopJson = await safeFetchJson(
          `https://rt.data.gov.hk/v2/transport/citybus/stop/${stopId}`,
        );
        if (stopJson?.data) {
          stopMap[stopId] = stopJson.data;
        }
      }),
    );

    const matchedRoutes = routeStopRows
      .map(({ route, direction, rows }) => {
        const stopPattern = citybusStopPatternForRoute(route);
        const defaultName = route === 'B3A' ? 'Fu Tai Estate' : 'Lingnan University';
        const matched = rows.find((row) => {
          const stopInfo = stopMap[row.stop];
          const stopNameEn = stopInfo?.name_en ?? '';
          const stopNameTc = stopInfo?.name_tc ?? '';
          return stopPattern.test(stopNameEn) || stopPattern.test(stopNameTc);
        });

        if (!matched) {
          return null;
        }

        const stopInfo = stopMap[matched.stop];
        return {
          route,
          direction,
          stopId: matched.stop,
          dirCode: matched.dir,
          stopName: stopInfo?.name_en || stopInfo?.name_tc || defaultName,
        };
      })
      .filter(
        (x): x is { route: string; direction: string; stopId: string; dirCode: string; stopName: string } =>
          x !== null,
      );

    const etaByStopRoute = new Map<string, any[]>();
    const uniqueEtaKeys = [...new Set(matchedRoutes.map((item) => `${item.stopId}__${item.route}`))];

    await Promise.all(
      uniqueEtaKeys.map(async (key) => {
        const [stopId, route] = key.split('__');
        const etaJson = await safeFetchJson(
          `https://rt.data.gov.hk/v2/transport/citybus/eta/CTB/${stopId}/${route}`,
        );
        etaByStopRoute.set(key, etaJson?.data ?? []);
      }),
    );

    return matchedRoutes.map((item) => {
      const minuteList = (etaByStopRoute.get(`${item.stopId}__${item.route}`) ?? [])
        .filter((row: any) => row?.route === item.route && (!item.dirCode || row?.dir === item.dirCode))
        .map((row: any) => minutesFromEta(row?.eta))
        .filter((x: number | null): x is number => x !== null)
        .sort((a: number, b: number) => a - b)
        .slice(0, 3);

      return {
        route: item.route,
        provider: 'Citybus' as const,
        direction: item.direction,
        stopName: item.stopName,
        minutes: minuteList,
      };
    });
  }, []);

  const loadMtrTrain = useCallback(async (): Promise<TrainState> => {
    try {
      const trainRes = await fetch(
        'https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=TML&sta=SIH',
      );
      if (!trainRes.ok) {
        return { up: [], down: [] };
      }

      const trainJson = await trainRes.json();
      const key = 'TML-SIH';
      const upRows = trainJson?.data?.[key]?.UP ?? [];
      const downRows = trainJson?.data?.[key]?.DOWN ?? [];

      const up = upRows
        .map((row: any) => Number.parseInt(row?.ttnt, 10))
        .filter((n: number) => Number.isFinite(n))
        .slice(0, 3);
      const down = downRows
        .map((row: any) => Number.parseInt(row?.ttnt, 10))
        .filter((n: number) => Number.isFinite(n))
        .slice(0, 3);

      return { up, down };
    } catch {
      return { up: [], down: [] };
    }
  }, []);

  const loadMtrBus = useCallback(async (): Promise<{ cards: ArrivalCard[]; status: string }> => {
    const cards: ArrivalCard[] = [];
    const notes: string[] = [];

    for (const routeName of MTR_BUS_ROUTES) {
      const payload = await safeFetchJson('https://rt.data.gov.hk/v1/transport/mtr/bus/getSchedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: 'en', routeName }),
      });

      if (!payload) {
        notes.push(`${routeName}: API unavailable`);
        continue;
      }

      const stops: Array<{
        busStopId?: string;
        busStopStatusRemarkTitle?: string | null;
        bus?: Array<{
          departureTimeInSecond?: string | number;
          departureTimeText?: string;
          arrivalTimeInSecond?: string | number;
        }>;
      }> = payload.busStop ?? [];

      // Known Lingnan University stop IDs on MTR Bus feeder routes (U/D = bound).
      const lingnanStopIds = new Set([
        `${routeName}-U030`,
        `${routeName}-D030`,
        'K51-U030',
        'K51-D030',
        'K58-U030',
        'K58-D030',
      ]);
      const targetStops = stops.filter((stop) => lingnanStopIds.has(stop.busStopId ?? ''));

      if (!targetStops.length) {
        const remark = payload.routeStatusRemarkTitle || payload.footerRemarks || 'no Lingnan stop ETA';
        notes.push(`${routeName}: ${remark}`);
        continue;
      }

      for (const stop of targetStops) {
        const minutes = (stop.bus ?? [])
          .map((bus) => {
            const raw = Number(bus.departureTimeInSecond ?? bus.arrivalTimeInSecond);
            if (!Number.isFinite(raw) || raw >= 86400) return null;
            return Math.max(0, Math.round(raw / 60));
          })
          .filter((n): n is number => n !== null)
          .sort((a, b) => a - b)
          .slice(0, 3);

        const bound = (stop.busStopId ?? '').includes('-U') ? 'outbound' : 'inbound';
        cards.push({
          route: routeName,
          provider: 'MTR Bus',
          direction: bound,
          stopName: `Lingnan University (${stop.busStopId})`,
          minutes,
        });
      }

      notes.push(`${routeName}: OK`);
    }

    return {
      cards,
      status: notes.join(' · '),
    };
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [kmb, citybus, trains, mtrBus] = await Promise.all([
        loadKmb(),
        loadCitybus(),
        loadMtrTrain(),
        loadMtrBus(),
      ]);

      setKmbArrivals(kmb);
      setCitybusArrivals(citybus);
      setTrainData(trains);
      setMtrBusArrivals(mtrBus.cards);
      setMtrBusStatus(mtrBus.status);
      setLastUpdated(
        new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
    } catch {
      setError('Failed to fetch one or more transport feeds. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [loadCitybus, loadKmb, loadMtrBus, loadMtrTrain]);

  useEffect(() => {
    void loadAll();

    const timer = setInterval(() => {
      void loadAll();
    }, 120000);

    return () => clearInterval(timer);
  }, [loadAll]);

  const allBusCards = useMemo(
    () => [...kmbArrivals, ...citybusArrivals, ...mtrBusArrivals],
    [citybusArrivals, kmbArrivals, mtrBusArrivals],
  );

  return (
    <div className="bus-page">
      <div className="bus-header">
        <div>
        </div>
        <button
          type="button"
          onClick={() => void loadAll()}
          className="bus-refresh"
        >
          <RefreshCw className={`bus-refresh__icon${loading ? ' is-spinning' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && <div className="bus-error">{error}</div>}

      <div className="bus-panel">
        <div className="bus-panel__head">
          <TrainFront className="bus-panel__icon bus-panel__icon--train" />
          <h3 className="bus-panel__title">MTR Tuen Ma Line (Siu Hong)</h3>
        </div>
        <div className="bus-eta-grid">
          <div className="bus-eta-box">
            <span className="bus-eta-box__label">Toward Tuen Mun (UP)</span>
            <div className="bus-card__etas bus-eta-box__etas">
              <Clock3 className="bus-card__clock" />
              {trainData.up.length > 0 ? (
                trainData.up.slice(0, 3).map((mins, index) => (
                  <span
                    key={`train-up-${mins}-${index}`}
                    className={index === 0 ? 'bus-card__eta bus-card__eta--next' : 'bus-card__eta'}
                  >
                    {mins}
                    <span className="bus-card__eta-unit">min</span>
                  </span>
                ))
              ) : (
                <span className="bus-card__eta--empty">Not available</span>
              )}
            </div>
          </div>
          <div className="bus-eta-box">
            <span className="bus-eta-box__label">Toward Wu Kai Sha (DOWN)</span>
            <div className="bus-card__etas bus-eta-box__etas">
              <Clock3 className="bus-card__clock" />
              {trainData.down.length > 0 ? (
                trainData.down.slice(0, 3).map((mins, index) => (
                  <span
                    key={`train-down-${mins}-${index}`}
                    className={index === 0 ? 'bus-card__eta bus-card__eta--next' : 'bus-card__eta'}
                  >
                    {mins}
                    <span className="bus-card__eta-unit">min</span>
                  </span>
                ))
              ) : (
                <span className="bus-card__eta--empty">Not available</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bus-panel">
        <div className="bus-panel__head">
          <Bus className="bus-panel__icon bus-panel__icon--bus" />
          <h3 className="bus-panel__title">Bus</h3>
        </div>

        {!loading && allBusCards.length === 0 && (
          <div className="bus-empty">
            No ETA returned for LU stops ({LU_STOP_CODES.join(', ')}).
          </div>
        )}

        <div className="bus-card-list">
          {allBusCards.map((card) => (
            <div
              key={`${card.provider}-${card.route}-${card.direction}-${card.stopCode ?? card.stopName}`}
              className={providerCardClass(card.provider)}
            >
              <div className="bus-card__top">
                <div className="bus-card__identity">
                  <span className="bus-card__provider">{card.provider}</span>
                  <span className="bus-card__route">{card.route}</span>
                </div>
                <span className="bus-card__dir">{card.direction}</span>
              </div>

              <div className="bus-card__meta">
                <div className="bus-card__row">
                  <MapPin className="bus-card__pin" />
                  <span>{card.stopName}</span>
                </div>
                <div className="bus-card__etas">
                  <Clock3 className="bus-card__clock" />
                  {card.minutes.length > 0 ? (
                    card.minutes.slice(0, 3).map((mins, index) => (
                      <span
                        key={`${card.provider}-${card.route}-${card.direction}-${mins}-${index}`}
                        className={
                          index === 0 ? 'bus-card__eta bus-card__eta--next' : 'bus-card__eta'
                        }
                      >
                        {mins}
                        <span className="bus-card__eta-unit">min</span>
                      </span>
                    ))
                  ) : (
                    <span className="bus-card__eta--empty">Not available</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* <div className="bus-status">
        <p className="bus-status__title">MTR Bus (K51 / K58)</p>
        <p className="bus-status__body">{mtrBusStatus}</p>
      </div> */}

      <div className="bus-footer">Last updated: {lastUpdated || '--:--:--'}</div>
    </div>
  );
};
