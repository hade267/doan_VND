import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const buildSecurityHeaders = () => ({
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'same-origin',
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';

  return {
    plugins: [react()],
    envPrefix: 'VITE_',
    server: {
      port: Number(env.VITE_DEV_PORT || 5173),
      strictPort: true,
      cors: false,
      headers: buildSecurityHeaders(),
    },
    preview: {
      port: Number(env.VITE_PREVIEW_PORT || 4173),
      strictPort: true,
      headers: buildSecurityHeaders(),
    },
    build: {
      sourcemap: env.VITE_ENABLE_SOURCEMAP === 'true',
      target: 'es2019',
      reportCompressedSize: false,
      minify: 'esbuild',
      cssCodeSplit: true,
      chunkSizeWarningLimit: Number(env.VITE_CHUNK_WARNING_LIMIT || 700),
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            charts: ['chart.js', 'react-chartjs-2'],
          },
        },
      },
    },
    esbuild: {
      legalComments: 'none',
      drop: isProduction ? ['console', 'debugger'] : [],
    },
    define: {
      __APP_VERSION__: JSON.stringify(env.npm_package_version ?? 'dev'),
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
      css: true,
    },
  };
});
