import { describe, it, expect } from 'vitest'
import { encryptIdCard, decryptIdCard, maskIdCard, maskPhone } from '~/server/utils/encryption'

describe('encryptIdCard / decryptIdCard', () => {
  it('should encrypt and decrypt id card correctly', () => {
    const idCard = '110101199003077734'
    const encrypted = encryptIdCard(idCard)
    expect(encrypted).not.toBe(idCard)
    expect(encrypted.split(':').length).toBe(3)
    const decrypted = decryptIdCard(encrypted)
    expect(decrypted).toBe(idCard)
  })

  it('should produce different ciphertext for same input (random IV)', () => {
    const idCard = '110101199003077734'
    const encrypted1 = encryptIdCard(idCard)
    const encrypted2 = encryptIdCard(idCard)
    expect(encrypted1).not.toBe(encrypted2)
  })

  it('should throw for invalid encrypted format on decrypt', () => {
    expect(() => decryptIdCard('invalid')).toThrow('Invalid encrypted data format')
    expect(() => decryptIdCard('a:b')).toThrow('Invalid encrypted data format')
  })

  it('should throw for tampered encrypted data', () => {
    const idCard = '110101199003077734'
    const encrypted = encryptIdCard(idCard)
    const parts = encrypted.split(':')
    parts[2] = parts[2].replace(/./, '0')
    const tampered = parts.join(':')
    expect(() => decryptIdCard(tampered)).toThrow()
  })
})

describe('maskIdCard', () => {
  it('should mask middle part of id card', () => {
    expect(maskIdCard('110101199003077734')).toBe('110****7734')
  })

  it('should handle short strings', () => {
    expect(maskIdCard('1234567')).toBe('123****')
  })

  it('should handle very short strings', () => {
    expect(maskIdCard('123')).toBe('123****')
  })
})

describe('maskPhone', () => {
  it('should mask middle 4 digits of phone', () => {
    expect(maskPhone('13812345678')).toBe('138****5678')
  })

  it('should return as-is for non-11-digit phone', () => {
    expect(maskPhone('123456')).toBe('123456')
  })

  it('should handle empty string', () => {
    expect(maskPhone('')).toBe('')
  })
})
