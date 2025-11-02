import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'
import { db, users } from '@udbhav/db';
import { v7 as uuid7 } from 'uuid';


const auth = new Hono()

const sessions = new Map<string, { email: string; name: string; picture: string; exp: number }>()

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this'
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const FRONTEND_URL = process.env.CORS_ORIGIN || 'http://localhost:5173'

interface GoogleTokenPayload {
  email: string
  name: string
  picture: string
  sub: string
  iss: string
  aud: string
  exp: number
  iat: number
}

async function verifyGoogleToken(token: string): Promise<GoogleTokenPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }
    
    const payloadBase64 = parts[1]
    if (!payloadBase64) {
      return null
    }
    
    const payload = JSON.parse(
      Buffer.from(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    )

    const clientId = process.env.GOOGLE_CLIENT_ID
    if (clientId && payload.aud !== clientId) {
      console.error('Token audience mismatch')
      return null
    }

    if (payload.exp * 1000 < Date.now()) {
      console.error('Token expired')
      return null
    }

    return payload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

auth.get('/me', async (c) => {
  try {
    const sessionToken = getCookie(c, 'session')
    
    if (!sessionToken) {
      return c.json({ error: 'Not authenticated' }, 401)
    }

    const payload = await verify(sessionToken, JWT_SECRET)
    
    if (!payload || typeof payload.exp !== 'number' || payload.exp * 1000 < Date.now()) {
      deleteCookie(c, 'session')
      return c.json({ error: 'Session expired' }, 401)
    }

    return c.json({
      user: {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      },
    })
  } catch (error) {
    console.error('Session verification error:', error)
    return c.json({ error: 'Invalid session' }, 401)
  }
})

auth.get('/google', async (c) => {
  const redirectUri = `${new URL(c.req.url).origin}/auth/google/callback`
  
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  googleAuthUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID)
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri)
  googleAuthUrl.searchParams.set('response_type', 'code')
  googleAuthUrl.searchParams.set('scope', 'openid email profile')
  googleAuthUrl.searchParams.set('access_type', 'offline')
  googleAuthUrl.searchParams.set('prompt', 'consent')

  return c.redirect(googleAuthUrl.toString())
})

auth.get('/google/callback', async (c) => {
  try {
    const code = c.req.query('code')
    const error = c.req.query('error')

    if (error) {
      console.error('OAuth error:', error)
      return c.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(error)}`)
    }

    if (!code) {
      return c.redirect(`${FRONTEND_URL}/login?error=no_code`)
    }

    const redirectUri = `${new URL(c.req.url).origin}/auth/google/callback`
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange failed:', errorData)
      return c.redirect(`${FRONTEND_URL}/login?error=token_exchange_failed`)
    }

    const tokens = await tokenResponse.json() as { id_token: string; access_token: string }

    const payload = await verifyGoogleToken(tokens.id_token)

    if (!payload) {
      return c.redirect(`${FRONTEND_URL}/login?error=invalid_token`)
    }
    try{
      await db.insert(users).values({
        id: uuid7(),
        email: payload.email,
        username: payload.name,
      }).onConflictDoNothing().execute()
    }catch(e){}
    const sessionToken = await sign(
      {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      },
      JWT_SECRET
    )

    sessions.set(sessionToken, {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    })

    setCookie(c, 'session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    const origin = new URL(c.req.url).origin
    return c.redirect(`${origin}/dashboard`)
  } catch (error) {
    console.error('OAuth callback error:', error)
    return c.redirect(`${FRONTEND_URL}/login?error=callback_failed`)
  }
})

auth.post('/logout', async (c) => {
  try {
    const sessionToken = getCookie(c, 'session')
    
    if (sessionToken) {
      sessions.delete(sessionToken)
    }
    
    deleteCookie(c, 'session')
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return c.json({ error: 'Logout failed' }, 500)
  }
})

export const jwtMiddleware = async (c: any, next: any) => {
  const sessionToken = getCookie(c, 'session')
  
  if (!sessionToken) {
    return c.json({ error: 'Not authenticated' }, 401)
  }

  const payload = await verify(sessionToken, JWT_SECRET)
  
  if (!payload || typeof payload.exp !== 'number' || payload.exp * 1000 < Date.now()) {
    deleteCookie(c, 'session')
    return c.json({ error: 'Session expired' }, 401)
  }
  await next()
}

export default auth
