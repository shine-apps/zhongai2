import { defineEventHandler, getRequestIP, createError } from 'h3'

interface RateLimitConfig {
  max: number
  window: number
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000)

export function rateLimit(event: any, config: RateLimitConfig = { max: 100, window: 60 }) {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const key = `rate_limit:${ip}`
  const now = Date.now()

  let record = rateLimitStore.get(key)

  if (!record || record.resetTime < now) {
    record = {
      count: 0,
      resetTime: now + config.window * 1000,
    }
    rateLimitStore.set(key, record)
  }

  record.count++

  if (record.count > config.max) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000)
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: `请求过于频繁，请在 ${retryAfter} 秒后重试`,
      data: {
        code: 429,
        message: 'Rate limit exceeded',
        retryAfter,
      },
    })
  }

  event.context.rateLimit = {
    remaining: config.max - record.count,
    reset: record.resetTime,
  }
}

export function getRateLimitInfo(event: any) {
  return event.context.rateLimit || { remaining: -1, reset: 0 }
}
