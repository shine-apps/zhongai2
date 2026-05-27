import { describe, it, expect } from 'vitest'
import { signAccessToken, signRefreshToken, verifyToken } from '~/server/utils/jwt'

describe('JWT Utilities', () => {
  describe('signAccessToken', () => {
    it('should_sign_access_token_when_user_id_and_role_provided', async () => {
      const token = await signAccessToken('user-123', 'admin')
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3)
    })
  })

  describe('signRefreshToken', () => {
    it('should_sign_refresh_token_when_user_id_and_role_provided', async () => {
      const token = await signRefreshToken('user-123', 'admin')
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
    })
  })

  describe('verifyToken', () => {
    it('should_verify_successfully_when_valid_access_token', async () => {
      const token = await signAccessToken('user-123', 'volunteer')
      const payload = await verifyToken(token)
      expect(payload.sub).toBe('user-123')
      expect(payload.role).toBe('volunteer')
      expect(payload.type).toBe('access')
    })

    it('should_verify_successfully_when_valid_refresh_token', async () => {
      const token = await signRefreshToken('user-456', 'leader')
      const payload = await verifyToken(token)
      expect(payload.sub).toBe('user-456')
      expect(payload.role).toBe('leader')
      expect(payload.type).toBe('refresh')
    })

    it('should_reject_token_when_invalid', async () => {
      await expect(verifyToken('invalid-token')).rejects.toThrow()
    })

    it('should_reject_token_when_signed_with_wrong_secret', async () => {
      const { SignJWT } = await import('jose')
      const wrongSecret = new TextEncoder().encode('wrong-secret')
      const token = await new SignJWT({ sub: 'user', role: 'admin', type: 'access' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(wrongSecret)
      await expect(verifyToken(token)).rejects.toThrow()
    })
  })

  describe('token differentiation', () => {
    it('should_differentiate_tokens_when_access_and_refresh_compared', async () => {
      const accessToken = await signAccessToken('user-1', 'admin')
      const refreshToken = await signRefreshToken('user-1', 'admin')
      const accessPayload = await verifyToken(accessToken)
      const refreshPayload = await verifyToken(refreshToken)
      expect(accessPayload.type).toBe('access')
      expect(refreshPayload.type).toBe('refresh')
    })
  })
})
