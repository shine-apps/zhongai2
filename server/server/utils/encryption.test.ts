import { describe, it, expect } from 'vitest'
import { encryptIdCard, decryptIdCard, maskIdCard, maskPhone } from '~/server/utils/encryption'

describe('encryptIdCard / decryptIdCard', () => {
  it('should_encrypt_and_decrypt_correctly_when_valid_id_card', () => {
    const idCard = '110101199003077734'
    const encrypted = encryptIdCard(idCard)
    expect(encrypted).not.toBe(idCard)
    expect(encrypted.split(':').length).toBe(3)
    const decrypted = decryptIdCard(encrypted)
    expect(decrypted).toBe(idCard)
  })

  it('should_produce_different_ciphertext_when_same_input_encrypted_twice', () => {
    const idCard = '110101199003077734'
    const encrypted1 = encryptIdCard(idCard)
    const encrypted2 = encryptIdCard(idCard)
    expect(encrypted1).not.toBe(encrypted2)
  })

  it('should_throw_error_when_invalid_encrypted_format_on_decrypt', () => {
    expect(() => decryptIdCard('invalid')).toThrow('Invalid encrypted data format')
    expect(() => decryptIdCard('a:b')).toThrow('Invalid encrypted data format')
  })

  it('should_throw_error_when_tampered_encrypted_data', () => {
    const idCard = '110101199003077734'
    const encrypted = encryptIdCard(idCard)
    const parts = encrypted.split(':')
    parts[2] = parts[2].replace(/./, '0')
    const tampered = parts.join(':')
    expect(() => decryptIdCard(tampered)).toThrow()
  })
})

describe('maskIdCard', () => {
  it('should_mask_middle_part_when_id_card_provided', () => {
    expect(maskIdCard('110101199003077734')).toBe('110****7734')
  })

  it('should_handle_short_strings_when_input_is_short', () => {
    expect(maskIdCard('1234567')).toBe('123****')
  })

  it('should_handle_very_short_strings_when_input_is_very_short', () => {
    expect(maskIdCard('123')).toBe('123****')
  })
})

describe('maskPhone', () => {
  it('should_mask_middle_4_digits_when_phone_provided', () => {
    expect(maskPhone('13812345678')).toBe('138****5678')
  })

  it('should_return_as_is_when_phone_not_11_digits', () => {
    expect(maskPhone('123456')).toBe('123456')
  })

  it('should_handle_empty_string_when_input_is_empty', () => {
    expect(maskPhone('')).toBe('')
  })
})
