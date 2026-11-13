/**
 * Local Vite proxies `/api/hko` and `/api/1823` avoid CORS in dev.
 * Production (e.g. Google AI Studio) has no proxy — call upstream hosts directly.
 */
const isDev = import.meta.env.DEV;

export const hkoUrl = (pathAndQuery: string): string => {
  const path = pathAndQuery.startsWith('/') ? pathAndQuery : `/${pathAndQuery}`;
  if (isDev) {
    return `/api/hko${path}`;
  }
  return `https://data.weather.gov.hk${path}`;
};

export const gov1823Url = (pathAndQuery: string): string => {
  const path = pathAndQuery.startsWith('/') ? pathAndQuery : `/${pathAndQuery}`;
  if (isDev) {
    return `/api/1823${path}`;
  }
  return `https://www.1823.gov.hk${path}`;
};
