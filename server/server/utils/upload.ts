import { randomUUID } from 'crypto'
import { extname } from 'path'

export const UPLOAD_CONFIG = {
  allowedImageTypes: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  allowedVideoTypes: ['.mp4', '.mov', '.avi'],
  allowedDocTypes: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
  maxImageSize: 5 * 1024 * 1024,
  maxVideoSize: 50 * 1024 * 1024,
  maxDocSize: 10 * 1024 * 1024,
}

export function validateFileType(filename: string, allowedTypes: string[]): boolean {
  const ext = extname(filename).toLowerCase()
  return allowedTypes.includes(ext)
}

export function validateFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize
}

export function generateFilename(originalName: string): string {
  const ext = extname(originalName).toLowerCase()
  const uuid = randomUUID()
  const timestamp = Date.now()
  return `${timestamp}-${uuid}${ext}`
}
