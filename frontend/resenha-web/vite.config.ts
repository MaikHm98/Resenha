/// <reference types="vitest/config" />

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const DEFAULT_LOCAL_API_ORIGIN = 'http://localhost:5276'

function resolveApiProxyTarget(rawBaseUrl: string | undefined): string {
  const normalizedBaseUrl = rawBaseUrl?.trim().replace(/\/+$/, '') ?? ''
  return normalizedBaseUrl || DEFAULT_LOCAL_API_ORIGIN
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxyTarget = resolveApiProxyTarget(env.VITE_API_BASE_URL)

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      setupFiles: './src/tests/setupTests.ts',
    },
  }
})
