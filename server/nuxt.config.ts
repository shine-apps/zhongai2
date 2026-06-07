export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  devServer: {
    host: '0.0.0.0',
  },

  nitro: {
    devProxy: {},
    routeRules: {
      '/**': {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      },
    },
  },

  dir: {
    app: 'app',
    server: 'server',
  },

  modules: ['@element-plus/nuxt'],

  alias: {
    '~/server': './server',
  },

  elementPlus: {
    importStyle: 'css',
  },

  // Nitro auto-maps NUXT_* env vars at runtime (e.g., NUXT_JWT_SECRET → jwtSecret)
  runtimeConfig: {
    jwtSecret: '',
    wechatAppId: '',
    wechatAppSecret: '',
    idCardEncryptionKey: '',
  },

  routeRules: {
    '/admin/**': {
      ssr: false,
    },
  },

  typescript: {
    strict: false,
    typeCheck: false,
  },

  vite: {
    optimizeDeps: {
      include: ['dayjs', 'dayjs/plugin/*.js'],
    },
  },

  compatibilityDate: '2026-05-26',
})
