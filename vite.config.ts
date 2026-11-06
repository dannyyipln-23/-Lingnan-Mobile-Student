import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        // Browser -> Vite (same-origin) -> HKO, avoids CORS on localhost.
        '/api/hko': {
          target: 'https://data.weather.gov.hk',
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/api\/hko/, ''),
        },
        // 1823 Hong Kong Public Holidays JSON (data.gov.hk / 1823).
        '/api/1823': {
          target: 'https://www.1823.gov.hk',
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/api\/1823/, ''),
        },
      },
    },
  };
});
