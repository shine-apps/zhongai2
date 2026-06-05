import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  try {
    const html = await readFile(
      join(process.cwd(), '..', 'public', 'h5', 'index.html'),
      'utf-8'
    )
    setHeader(event, 'Content-Type', 'text/html; charset=utf-8')
    return html
  } catch {
    throw createError({
      statusCode: 404,
      message: 'H5 app not found. Make sure the miniapp has been built.',
    })
  }
})
