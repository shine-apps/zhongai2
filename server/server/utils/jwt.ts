import { SignJWT, jwtVerify } from 'jose'

function getSecret() {
  const config = useRuntimeConfig()
  return new TextEncoder().encode(config.jwtSecret)
}

export async function signAccessToken(userId: string, role: string): Promise<string> {
  const secret = getSecret()
  return new SignJWT({ sub: userId, role, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function signRefreshToken(userId: string, role: string): Promise<string> {
  const secret = getSecret()
  return new SignJWT({ sub: userId, role, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<{ sub: string; role: string; type: string }> {
  const secret = getSecret()
  const { payload } = await jwtVerify(token, secret)
  return {
    sub: payload.sub as string,
    role: payload.role as string,
    type: payload.type as string,
  }
}
