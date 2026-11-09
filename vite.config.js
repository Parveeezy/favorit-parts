import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import priceHandler from './api/price.js'

// Локально /api/price обслуживает тот же обработчик, что и на Vercel.
// Ключ берётся из .env без префикса VITE_, поэтому в бандл клиента не попадает.
function apiPriceDev() {
  return {
    name: 'api-price-dev',
    configureServer(server) {
      server.middlewares.use('/api/price', priceHandler)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/price', priceHandler)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (env.FAVORIT_API_KEY) process.env.FAVORIT_API_KEY = env.FAVORIT_API_KEY

  return {
    plugins: [react(), apiPriceDev()],
  }
})
