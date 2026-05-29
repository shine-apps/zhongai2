import { defineEventHandler, getRequestHeader, getMethod, createError } from 'h3'
import { verifyToken } from '../utils/jwt'

const PUBLIC_PATHS = ['/api/auth/login', '/api/auth/admin-login', '/api/auth/refresh']

// These paths allow unauthenticated GET requests (public read access)
const PUBLIC_GET_PREFIXES = ['/api/activities', '/api/banners']

export default defineEventHandler(async (event) => {
  const path = event.path

  if (!path.startsWith('/api/')) {
    return
  }

  if (event.method === 'OPTIONS') {
    return
  }

  if (PUBLIC_PATHS.some((p) => path === p)) {
    return
  }

  // Allow public GET access for listed prefixes
  if (getMethod(event) === 'GET' && PUBLIC_GET_PREFIXES.some((p) => path.startsWith(p))) {
    return
  }

  const authHeader = getRequestHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing or invalid authorization header',
    })
  }

  const token = authHeader.slice(7)
  try {
    const payload = await verifyToken(token)
    if (payload.type !== 'access') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token type',
      })
    }
    event.context.auth = {
      userId: payload.sub,
      role: payload.role,
    }
  } catch (err: any) {
    if (err.statusCode) throw err
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token',
    })
  }
})
