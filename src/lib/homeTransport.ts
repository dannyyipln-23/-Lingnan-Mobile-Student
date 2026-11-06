/** Shared catalogue + ETA helpers for Home transport preferences. */

export type HomeTransportRouteId =
  | 'mtr-tml-sih'
  | 'k51'
  | 'k58'
  | '67M'
  | '67X'
  | '53'
  | '261'
  | 'A33X'
  | 'NA33'
  | '960A'
  | '960S';

export type HomeTransportProvider = 'MTR' | 'MTR Bus' | 'KMB' | 'Citybus';

export type HomeTransportOption = {
  id: HomeTransportRouteId;
  label: string;
  provider: HomeTransportProvider;
  description: string;
};

export const HOME_TRANSPORT_OPTIONS: HomeTransportOption[] = [
  {
    id: 'k51',
    label: 'Route K51',
    provider: 'MTR Bus',
    description: 'MTR Bus feeder at Lingnan University',
  },
  {
    id: 'k58',
    label: 'Route K58',
    provider: 'MTR Bus',
    description: 'MTR Bus feeder (when ETA feed is available)',
  },
  {
    id: '67M',
    label: 'Route 67M',
    provider: 'KMB',
    description: 'KMB at Lingnan University stop',
  },
  {
    id: '67X',
    label: 'Route 67X',
    provider: 'KMB',
    description: 'KMB at Lingnan University stop',
  },
  {
    id: '53',
    label: 'Route 53',
    provider: 'KMB',
    description: 'KMB at Lingnan University stop',
  },
  {
    id: '261',
    label: 'Route 261',
    provider: 'KMB',
    description: 'KMB at Lingnan University stop',
  },
  {
    id: 'A33X',
    label: 'Route A33X',
    provider: 'Citybus',
    description: 'Citybus airport / NWNT services',
  },
  {
    id: 'NA33',
    label: 'Route NA33',
    provider: 'Citybus',
    description: 'Citybus overnight / NWNT services',
  },
  {
    id: '960A',
    label: 'Route 960A',
    provider: 'Citybus',
    description: 'Citybus at / near campus corridor',
  },
  {
    id: '960S',
    label: 'Route 960S',
    provider: 'Citybus',
    description: 'Citybus at / near campus corridor',
  },
  {
    id: 'mtr-tml-sih',
    label: 'MTR Tuen Ma Line (Siu Hong)',
    provider: 'MTR',
    description: 'Heavy rail arrivals at Siu Hong station',
  },
];

/** Default home preview: campus feeders / KMB — not MTR train. */
export const DEFAULT_HOME_TRANSPORT_ROUTES: HomeTransportRouteId[] = ['k51', '67M', '67X'];

const LU_KMB_STOPS = [
  { code: 'TM290', stopId: 'AA5DA45828958EAE' },
  { code: 'TM291', stopId: 'CC3EF4757AA0964A' },
  { code: 'TM251', stopId: 'E2AE7A37634C8FE5' },
  { code: 'TM252', stopId: '6B3EF5D982B399E6' },
] as const;

const LINGNAN_NAME_PATTERN = /lingnan university|ling nan university|\u5dba\u5357\u5927\u5b78/i;

export type HomeTransportEtaRow = {
  id: HomeTransportRouteId;
  label: string;
  provider: HomeTransportProvider;
  stopHint: string;
  minutes: number[];
  note?: string;
};

const minutesFromEta = (etaTime?: string): number | null => {
  if (!etaTime) return null;
  const ms = new Date(etaTime).getTime() - Date.now();
  const mins = Math.round(ms / 60000);
  return Number.isFinite(mins) ? Math.max(0, mins) : null;
};

const safeFetchJson = async (url: string, init?: RequestInit): Promise<any | null> => {
  try {
    const res = await fetch(url, init);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

const optionById = (id: HomeTransportRouteId): HomeTransportOption =>
  HOME_TRANSPORT_OPTIONS.find((item) => item.id === id)!;

const fetchKmbRouteMinutes = async (route: string): Promise<{ minutes: number[]; stopHint: string }> => {
  const minuteSet = new Set<number>();
  let stopHint = 'Lingnan University';

  await Promise.all(
    LU_KMB_STOPS.map(async (stop) => {
      const etaJson = await safeFetchJson(
        `https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/${stop.stopId}`,
      );
      const rows: Array<{ route?: string; eta?: string }> = etaJson?.data ?? [];
      for (const row of rows) {
        if (row.route !== route) continue;
        const mins = minutesFromEta(row.eta);
        if (mins === null) continue;
        minuteSet.add(mins);
        stopHint = `Lingnan University (${stop.code})`;
      }
    }),
  );

  return {
    minutes: [...minuteSet].sort((a, b) => a - b).slice(0, 3),
    stopHint,
  };
};

const fetchCitybusRouteMinutes = async (
  route: string,
): Promise<{ minutes: number[]; stopHint: string }> => {
  const stopJson = await safeFetchJson('https://rt.data.gov.hk/v2/transport/citybus/stop/CTB');
  const stopMap: Record<string, { name_en?: string; name_tc?: string }> = stopJson?.data ?? {};
  if (!Object.keys(stopMap).length) {
    return { minutes: [], stopHint: 'Lingnan University' };
  }

  const directions = ['inbound', 'outbound'] as const;
  const matchedStopIds: Array<{ stopId: string; stopName: string }> = [];

  await Promise.all(
    directions.map(async (direction) => {
      const routeStopJson = await safeFetchJson(
        `https://rt.data.gov.hk/v2/transport/citybus/route-stop/CTB/${route}/${direction}`,
      );
      const rows: Array<{ stop: string }> = routeStopJson?.data ?? [];
      for (const row of rows) {
        const info = stopMap[row.stop];
        const nameEn = info?.name_en ?? '';
        const nameTc = info?.name_tc ?? '';
        if (LINGNAN_NAME_PATTERN.test(nameEn) || LINGNAN_NAME_PATTERN.test(nameTc)) {
          matchedStopIds.push({
            stopId: row.stop,
            stopName: nameEn || nameTc || 'Lingnan University',
          });
        }
      }
    }),
  );

  const unique = [...new Map(matchedStopIds.map((item) => [item.stopId, item])).values()];
  const minuteSet = new Set<number>();
  let stopHint = 'Lingnan University';

  await Promise.all(
    unique.map(async (stop) => {
      const etaJson = await safeFetchJson(
        `https://rt.data.gov.hk/v2/transport/citybus/eta/CTB/${stop.stopId}/${route}`,
      );
      const rows: Array<{ route?: string; eta?: string }> = etaJson?.data ?? [];
      for (const row of rows) {
        if (row.route && row.route !== route) continue;
        const mins = minutesFromEta(row.eta);
        if (mins === null) continue;
        minuteSet.add(mins);
        stopHint = stop.stopName;
      }
    }),
  );

  return {
    minutes: [...minuteSet].sort((a, b) => a - b).slice(0, 3),
    stopHint,
  };
};

const fetchMtrBusMinutes = async (
  routeName: 'K51' | 'K58',
): Promise<{ minutes: number[]; stopHint: string; note?: string }> => {
  const payload = await safeFetchJson('https://rt.data.gov.hk/v1/transport/mtr/bus/getSchedule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language: 'en', routeName }),
  });

  if (!payload) {
    return { minutes: [], stopHint: 'Lingnan University', note: 'API unavailable' };
  }

  const stops: Array<{
    busStopId?: string;
    bus?: Array<{ departureTimeInSecond?: string | number; arrivalTimeInSecond?: string | number }>;
  }> = payload.busStop ?? [];

  const target = stops.filter((stop) =>
    new Set([`${routeName}-U030`, `${routeName}-D030`, 'K51-U030', 'K51-D030', 'K58-U030', 'K58-D030']).has(
      stop.busStopId ?? '',
    ),
  );

  if (!target.length) {
    return {
      minutes: [],
      stopHint: 'Lingnan University',
      note: payload.routeStatusRemarkTitle || 'No ETA at Lingnan stop',
    };
  }

  const minuteSet = new Set<number>();
  for (const stop of target) {
    for (const bus of stop.bus ?? []) {
      const raw = Number(bus.departureTimeInSecond ?? bus.arrivalTimeInSecond);
      if (!Number.isFinite(raw) || raw >= 86400) continue;
      minuteSet.add(Math.max(0, Math.round(raw / 60)));
    }
  }

  return {
    minutes: [...minuteSet].sort((a, b) => a - b).slice(0, 3),
    stopHint: 'Lingnan University',
  };
};

const fetchMtrTrainMinutes = async (): Promise<{ minutes: number[]; stopHint: string }> => {
  const trainJson = await safeFetchJson(
    'https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=TML&sta=SIH',
  );
  const key = 'TML-SIH';
  const upRows = trainJson?.data?.[key]?.UP ?? [];
  const downRows = trainJson?.data?.[key]?.DOWN ?? [];
  const minutes = [...upRows, ...downRows]
    .map((row: { ttnt?: string }) => Number.parseInt(row?.ttnt ?? '', 10))
    .filter((n: number) => Number.isFinite(n))
    .sort((a: number, b: number) => a - b)
    .slice(0, 3);

  return { minutes, stopHint: 'Siu Hong (TML)' };
};

export const fetchHomeTransportEtas = async (
  routeIds: HomeTransportRouteId[],
): Promise<HomeTransportEtaRow[]> => {
  const rows = await Promise.all(
    routeIds.map(async (id) => {
      const option = optionById(id);

      if (id === 'mtr-tml-sih') {
        const result = await fetchMtrTrainMinutes();
        return {
          id,
          label: option.label,
          provider: option.provider,
          stopHint: result.stopHint,
          minutes: result.minutes,
        } satisfies HomeTransportEtaRow;
      }

      if (id === 'k51' || id === 'k58') {
        const result = await fetchMtrBusMinutes(id === 'k51' ? 'K51' : 'K58');
        return {
          id,
          label: option.label,
          provider: option.provider,
          stopHint: result.stopHint,
          minutes: result.minutes,
          note: result.note,
        } satisfies HomeTransportEtaRow;
      }

      if (option.provider === 'KMB') {
        const result = await fetchKmbRouteMinutes(id);
        return {
          id,
          label: option.label,
          provider: option.provider,
          stopHint: result.stopHint,
          minutes: result.minutes,
        } satisfies HomeTransportEtaRow;
      }

      const result = await fetchCitybusRouteMinutes(id);
      return {
        id,
        label: option.label,
        provider: option.provider,
        stopHint: result.stopHint,
        minutes: result.minutes,
      } satisfies HomeTransportEtaRow;
    }),
  );

  return rows;
};
