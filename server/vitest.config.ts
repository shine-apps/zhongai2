import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['server/**/*.test.ts'],
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '~/server': path.resolve(__dirname, 'server'),
    },
  },
})
