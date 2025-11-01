import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'

const auth = new Hono()

// Store for session tokens (in production, use Redis or a database)
const sessions = new Map<string, { email: string; name: string; picture: string; exp: number }>()

// JWT secret - should be in env variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this'

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

// Verify Google ID token
async function verifyGoogleToken(token: string): Promise<GoogleTokenPayload | null> {
  try {
    // Decode JWT without verification (for development)
    // In production, you should verify the signature using Google's public keys
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

    // Basic validation
    const clientId = process.env.GOOGLE_CLIENT_ID
    if (clientId && payload.aud !== clientId) {
      console.error('Token audience mismatch')
      return null
    }

    // Check if token is expired
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

// POST /api/auth/google - Verify Google token and create session
auth.post('/google', async (c) => {
  try {
    const { token } = await c.req.json()
    
    if (!token) {
      return c.json({ error: 'Token required' }, 400)
    }

    // Verify the Google token
    const payload = await verifyGoogleToken(token)
    
    if (!payload) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    // Create session token
    const sessionToken = await sign(
      {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
      },
      JWT_SECRET
    )

    // Store session
    sessions.set(sessionToken, {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    })

    // Set HTTP-only cookie
    setCookie(c, 'session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return c.json({
      success: true,
      user: {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      },
    })
  } catch (error) {
    console.error('Authentication error:', error)
    return c.json({ error: 'Authentication failed' }, 500)
  }
})

// GET /api/auth/me - Get current user
auth.get('/me', async (c) => {
  try {
    const sessionToken = getCookie(c, 'session')
    
    if (!sessionToken) {
      return c.json({ error: 'Not authenticated' }, 401)
    }

    // Verify session token
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

// POST /api/auth/logout - Logout user
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

export default auth
