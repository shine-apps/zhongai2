export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
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

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || '',
    wechatAppId: process.env.WECHAT_APP_ID || '',
    wechatAppSecret: process.env.WECHAT_APP_SECRET || '',
    idCardEncryptionKey: process.env.ID_CARD_ENCRYPTION_KEY || '',
    databaseUrl: process.env.DATABASE_URL || '',
  },

  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    },
    '/admin/**': {
      ssr: true,
    },
  },

  typescript: {
    strict: false,
    typeCheck: false,
  },

  compatibilityDate: '2026-05-26',
})
