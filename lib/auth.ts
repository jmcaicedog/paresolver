import crypto from 'node:crypto'
import { NextResponse } from 'next/server'

export const SESSION_COOKIE_NAME = 'paresolver_admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 12
const SESSION_SECRET = process.env.SESSION_SECRET

export type SessionPayload = {
  userId: string
  exp: number
}

function encodeBase64Url(value: string) {
  return Buffer.from(value).toString('base64url')
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

export function signSession(userId: string) {
  if (!SESSION_SECRET) {
    throw new Error('SESSION_SECRET no está configurado en las variables de entorno.')
  }

  const payload: SessionPayload = {
    userId,
    exp: Date.now() + SESSION_TTL_MS,
  }

  const encoded = encodeBase64Url(JSON.stringify(payload))
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('hex')

  return `${encoded}.${signature}`
}

export function verifySession(token?: string): SessionPayload | null {
  if (!token || !SESSION_SECRET) {
    return null
  }

  const [encoded, signature] = token.split('.')
  if (!encoded || !signature) {
    return null
  }

  const expectedSignature = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('hex')
  if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature)) === false) {
    return null
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(encoded)) as SessionPayload
    if (!parsed.userId || parsed.exp <= Date.now()) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function setSessionCookie(response: NextResponse, userId: string) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: signSession(userId),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
  })
}
