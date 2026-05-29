import { defineEventHandler, setResponseHeaders, sendNoContent } from 'h3'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

export default defineEventHandler((event) => {
  setResponseHeaders(event, CORS_HEADERS)

  if (event.method === 'OPTIONS') {
    return sendNoContent(event)
  }
})
