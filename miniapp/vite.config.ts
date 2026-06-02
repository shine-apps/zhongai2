import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  base: '/h5/',
  server: {
    port: 8000,
    strictPort: true,
    allowedHosts: ['za.shone.xin'],
    hmr: {
      protocol: 'wss',
      clientPort: 443,
    },
  },
})
