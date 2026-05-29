import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

function getEncryptionKey(): Buffer {
  const config = useRuntimeConfig()
  const key = (config as any).idCardEncryptionKey || process.env.ID_CARD_ENCRYPTION_KEY || ''
  if (!key) {
    throw new Error('ID_CARD_ENCRYPTION_KEY is not configured')
  }
  const keyBuffer = Buffer.from(key.padEnd(32).slice(0, 32), 'utf8')
  return keyBuffer
}

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

export function encryptIdCard(idCard: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(idCard, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
}

export function decryptIdCard(encrypted: string): string {
  const key = getEncryptionKey()
  const parts = encrypted.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format')
  }
  const iv = Buffer.from(parts[0] as string, 'hex')
  const authTag = Buffer.from(parts[1] as string, 'hex')
  const encryptedData = parts[2] as string
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  const decrypted = decipher.update(encryptedData, 'hex', 'utf8') + decipher.final('utf8')
  return decrypted
}

export function maskIdCard(idCard: string): string {
  if (idCard.length <= 7) {
    return idCard.slice(0, 3) + '****'
  }
  return idCard.slice(0, 3) + '****' + idCard.slice(-4)
}

export function maskPhone(phone: string): string {
  if (phone.length !== 11) {
    return phone
  }
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}
