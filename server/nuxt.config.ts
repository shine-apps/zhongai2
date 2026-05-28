export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  dir: {
    app: 'app',
  },

  modules: ['@element-plus/nuxt'],

  elementPlus: {
    importStyle: 'css',
  },

  runtimeConfig: {
    jwtSecret: '',
    wechatAppId: '',
    wechatAppSecret: '',
    idCardEncryptionKey: '',
    databaseUrl: '',
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
