import { vi } from 'vitest'

globalThis.useRuntimeConfig = vi.fn(() => ({
  jwtSecret: 'test-jwt-secret-key-for-testing-only',
  wechatAppId: 'test-app-id',
  wechatAppSecret: 'test-app-secret',
  idCardEncryptionKey: 'test-encryption-key-32chars!!',
  databaseUrl: 'postgresql://test:test@localhost:5432/test',
}))

globalThis.createError = vi.fn((opts: any) => {
  const err = new Error(opts.statusMessage || opts.message || 'Error')
  ;(err as any).statusCode = opts.statusCode
  ;(err as any).data = opts.data
  return err
})
