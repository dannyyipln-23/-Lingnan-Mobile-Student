import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bus, TrainFront, RefreshCw, MapPin, Clock3 } from 'lucide-react';

type ArrivalCard = {
  route: string;
  provider: 'KMB' | 'Citybus';
  direction: string;
  stopName: string;
  minutes: number[];
};

type TrainState = {
  up: number[];
  down: number[];
};

const KMB_ROUTES = ['67M', '67X', '53', '261'];
const CITYBUS_ROUTES = ['A33X', 'NA33', '960A', '960S'];
const LINGNAN_NAME_PATTERN = /lingnan university|ling nan university|\u5dba\u5357\u5927\u5b78/i;

const minutesFromEta = (etaTime?: string): number | null => {
  if (!etaTime) {
    return null;
  }

  const ms = new Date(etaTime).getTime() - Date.now();
  const mins = Math.round(ms / 60000);
  return Number.isFinite(mins) ? Math.max(0, mins) : null;
};

const formatMins = (minutes: number[]): string => {
  if (!minutes.length) {
    return 'No upcoming ETA';
  }

  return minutes.slice(0, 3).map((m) => `${m} min`).join('  |  ');
};

const providerCardClass = (provider: 'KMB' | 'Citybus') =>
  provider === 'KMB'
    ? 'border-red-200 bg-red-50/30'
    : 'border-blue-200 bg-blue-50/30';

const safeFetchJson = async (url: string): Promise<any | null> => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch {
    return null;
  }
};

export const ShuttleBusTab: React.FC = () => {
  const [kmbArrivals, setKmbArrivals] = useState<ArrivalCard[]>([]);
  const [citybusArrivals, setCitybusArrivals] = useState<ArrivalCard[]>([]);
  const [trainData, setTrainData] = useState<TrainState>({ up: [], down: [] });
  const [mtrBusStatus, setMtrBusStatus] = useState<string>('Loading...');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadKmb = useCallback(async (): Promise<ArrivalCard[]> => {
    const [kmbStopsJson, routeStopRows] = await Promise.all([
      safeFetchJson('https://data.etabus.gov.hk/v1/transport/kmb/stop'),
      Promise.all(
        KMB_ROUTES.flatMap((route) =>
          ['inbound', 'outbound'].map(async (direction) => {
            const routeStopJson = await safeFetchJson(
              `https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${route}/${direction}/1`,
            );

            return {
              route,
              direction,
              rows: (routeStopJson?.data ?? []) as Array<{ stop: string; bound: string }>,
            };
          }),
        ),
      ),
    ]);

    const stopNameById = new Map<string, { en: string; tc: string }>();
    const kmbStops: Array<{ stop: string; name_en?: string; name_tc?: string }> = kmbStopsJson?.data ?? [];
    for (const stop of kmbStops) {
      if (!stop?.stop) {
        continue;
      }

      stopNameById.set(stop.stop, {
        en: stop.name_en ?? '',
        tc: stop.name_tc ?? '',
      });
    }

    const matchedRoutes = routeStopRows
      .map(({ route, direction, rows }) => {
        const matched = rows.find((row) => {
          const stopInfo = stopNameById.get(row.stop);
          const stopNameEn = stopInfo?.en ?? '';
          const stopNameTc = stopInfo?.tc ?? '';
          return LINGNAN_NAME_PATTERN.test(stopNameEn) || LINGNAN_NAME_PATTERN.test(stopNameTc);
        });

        if (!matched) {
          return null;
        }

        const stopInfo = stopNameById.get(matched.stop);
        return {
          route,
          direction,
          stopId: matched.stop,
          boundCode: matched.bound,
          stopName: stopInfo?.en || stopInfo?.tc || 'Lingnan University',
        };
      })
      .filter((x): x is { route: string; direction: string; stopId: string; boundCode: string; stopName: string } => x !== null);

    const uniqueStopIds = [...new Set(matchedRoutes.map((item) => item.stopId))];
    const etaByStop = new Map<string, any[]>();

    await Promise.all(
      uniqueStopIds.map(async (stopId) => {
        const etaJson = await safeFetchJson(`https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/${stopId}`);
        etaByStop.set(stopId, etaJson?.data ?? []);
      }),
    );

    return matchedRoutes.map((item) => {
      const minuteList = (etaByStop.get(item.stopId) ?? [])
        .filter((row: any) => row?.route === item.route && row?.dir === item.boundCode)
        .map((row: any) => minutesFromEta(row?.eta))
        .filter((x: number | null): x is number => x !== null)
        .sort((a: number, b: number) => a - b)
        .slice(0, 3);

      return {
        route: item.route,
        provider: 'KMB' as const,
        direction: item.direction,
        stopName: item.stopName,
        minutes: minuteList,
      };
    });
  }, []);

  const loadCitybus = useCallback(async (): Promise<ArrivalCard[]> => {
    const stopJson = await safeFetchJson('https://rt.data.gov.hk/v2/transport/citybus/stop/CTB');
    const stopMap: Record<string, { name_en?: string; name_tc?: string }> = stopJson?.data ?? {};
    if (!Object.keys(stopMap).length) {
      return [];
    }

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

    const matchedRoutes = routeStopRows
      .map(({ route, direction, rows }) => {
        const matched = rows.find((row) => {
          const stopInfo = stopMap[row.stop];
          const stopNameEn = stopInfo?.name_en ?? '';
          const stopNameTc = stopInfo?.name_tc ?? '';
          return LINGNAN_NAME_PATTERN.test(stopNameEn) || LINGNAN_NAME_PATTERN.test(stopNameTc);
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
          stopName: stopInfo?.name_en || stopInfo?.name_tc || 'Lingnan University',
        };
      })
      .filter((x): x is { route: string; direction: string; stopId: string; dirCode: string; stopName: string } => x !== null);

    const etaByStopRoute = new Map<string, any[]>();
    const uniqueEtaKeys = [...new Set(matchedRoutes.map((item) => `${item.stopId}__${item.route}`))];

    await Promise.all(
      uniqueEtaKeys.map(async (key) => {
        const [stopId, route] = key.split('__');
        const etaJson = await safeFetchJson(`https://rt.data.gov.hk/v2/transport/citybus/eta/CTB/${stopId}/${route}`);
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
      const trainRes = await fetch('https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=TML&sta=SIH');
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

  const loadMtrBus = useCallback(async (): Promise<string> => {
    const payload = await safeFetchJson('https://rt.data.gov.hk/v1/transport/mtr/bus/getSchedule.php?route_name=K51');
    if (payload) {
      return 'MTR bus API reachable (K51 test endpoint).';
    }

    return 'MTR bus API endpoint is currently unavailable from this app. Please check data.gov.hk endpoint updates.';
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [kmb, citybus, trains] = await Promise.all([
        loadKmb(),
        loadCitybus(),
        loadMtrTrain(),
      ]);

      setKmbArrivals(kmb);
      setCitybusArrivals(citybus);
      setTrainData(trains);
      setLastUpdated(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch {
      setError('Failed to fetch one or more transport feeds. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [loadCitybus, loadKmb, loadMtrTrain]);

  useEffect(() => {
    void loadAll();

    void (async () => {
      const mtrBus = await loadMtrBus();
      setMtrBusStatus(mtrBus);
    })();

    const timer = setInterval(() => {
      void loadAll();
    }, 120000);

    return () => clearInterval(timer);
  }, [loadAll, loadMtrBus]);

  const allBusCards = useMemo(() => [...kmbArrivals, ...citybusArrivals], [citybusArrivals, kmbArrivals]);

  return (
    <div className="space-y-4 pb-24 text-slate-800">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Shuttle & Public Transport</h2>
          <p className="text-xs text-slate-500">Live ETA to Lingnan University from KMB, Citybus and MTR feeds</p>
        </div>
        <button
          type="button"
          onClick={() => void loadAll()}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{error}</div>
      )}

      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm space-y-2.5">
        <div className="flex items-center space-x-2">
          <TrainFront className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-900">MTR Tuen Ma Line (SIH - Siu Hong)</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
            <span className="font-semibold text-slate-700">Toward Tuen Mun (UP)</span>
            <p className="mt-1.5 font-mono text-slate-800">{formatMins(trainData.up)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
            <span className="font-semibold text-slate-700">Toward Wu Kai Sha (DOWN)</span>
            <p className="mt-1.5 font-mono text-slate-800">{formatMins(trainData.down)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm space-y-2.5">
        <div className="flex items-center space-x-2">
          <Bus className="w-4 h-4 text-amber-700" />
          <h3 className="text-sm font-bold text-slate-900">Bus ETA at Lingnan University Stop</h3>
        </div>

        {!loading && allBusCards.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            No matching Lingnan University ETA was returned for configured routes ({KMB_ROUTES.join(', ')} / {CITYBUS_ROUTES.join(', ')}).
          </div>
        )}

        <div className="space-y-2">
          {allBusCards.map((card) => (
            <div
              key={`${card.provider}-${card.route}-${card.direction}`}
              className={`rounded-xl border p-3 ${providerCardClass(card.provider)}`}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="inline-flex items-center space-x-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 font-bold text-slate-700">{card.provider}</span>
                  <span className="font-black text-slate-900">Route {card.route}</span>
                </div>
                <span className="text-slate-500 capitalize">{card.direction}</span>
              </div>

              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="inline-flex items-center space-x-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  <span>{card.stopName}</span>
                </div>
                <div className="inline-flex items-center space-x-1.5 text-slate-700 font-mono">
                  <Clock3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{formatMins(card.minutes)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
        <p className="font-semibold text-slate-800">MTR Bus (K51 / K58)</p>
        <p className="mt-1">{mtrBusStatus}</p>
      </div>

      <div className="text-[11px] text-slate-500 px-1">
        Last updated: {lastUpdated || '--:--:--'}
      </div>
    </div>
  );
};
