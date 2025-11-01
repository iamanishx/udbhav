import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface GoogleProfile {
  email: string
  name: string
  picture: string
  sub: string
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void
          renderButton: (element: HTMLElement | null, config: { theme: string; size: string; text?: string }) => void
          prompt: () => void
          cancel: () => void
          disableAutoSelect: () => void
        }
      }
    }
  }
}

function decodeJwt(token: string): GoogleProfile | null {
  if (!token) return null
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error('Failed to decode JWT', e)
    return null
  }
}

export default function Login() {
  const [user, setUser] = useState<GoogleProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
    if (!clientId) {
      console.warn('VITE_GOOGLE_CLIENT_ID not set. See apps/web/.env.example')
      return
    }

    const loadGoogleScript = () => {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      document.body.appendChild(script)
      script.onload = () => initializeGoogleSignIn(clientId)
    }

    const initializeGoogleSignIn = (clientId: string) => {
      if (!window.google) return

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      })

      const buttonDiv = document.getElementById('g_id_signin')
      if (buttonDiv) {
        window.google.accounts.id.renderButton(buttonDiv, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
        })
      }

      // Show One Tap prompt
      window.google.accounts.id.prompt()
    }

    const handleCredentialResponse = async (response: { credential: string }) => {
      setLoading(true)
      try {
        const profile = decodeJwt(response.credential)
        
        // Send token to backend for verification
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
        const res = await fetch(`${apiUrl}/api/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: response.credential }),
          credentials: 'include', // Important for cookies
        })

        if (!res.ok) {
          throw new Error('Authentication failed')
        }

        const data = await res.json()
        console.log('Authentication successful:', data)
        
        setUser(profile)
        
        // Redirect to home after successful login
        setTimeout(() => {
          navigate('/')
        }, 1500)
      } catch (error) {
        console.error('Login failed:', error)
        alert('Login failed. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (!window.google) {
      loadGoogleScript()
    } else {
      initializeGoogleSignIn(clientId)
    }

    return () => {
      try {
        window.google?.accounts?.id?.cancel()
      } catch {
        // Ignore cleanup errors
      }
    }
  }, [navigate])

  const handleSignOut = () => {
    setUser(null)
    try {
      window.google?.accounts?.id?.disableAutoSelect()
    } catch {
      // Ignore errors
    }
    // Clear session on backend
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    fetch(`${apiUrl}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(console.error)
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ marginBottom: '10px', fontSize: '28px', fontWeight: 'bold' }}>
          Welcome
        </h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Sign in with your Google account to continue
        </p>

        {loading && (
          <div style={{ padding: '20px' }}>
            <p>Authenticating...</p>
          </div>
        )}

        {!user && !loading && (
          <>
            <div id="g_id_signin" style={{ 
              display: 'flex', 
              justifyContent: 'center',
              marginBottom: '20px' 
            }} />
            <p style={{ fontSize: '12px', color: '#999', marginTop: '20px' }}>
              Make sure VITE_GOOGLE_CLIENT_ID is set in your .env file
            </p>
          </>
        )}

        {user && !loading && (
          <div style={{ marginTop: '20px' }}>
            <img
              src={user.picture}
              alt={user.name}
              style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%',
                marginBottom: '15px'
              }}
            />
            <h3 style={{ margin: '10px 0', fontSize: '20px' }}>{user.name}</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>{user.email}</p>
            <p style={{ color: '#4CAF50', marginBottom: '15px', fontWeight: 'bold' }}>
              ✓ Logged in successfully!
            </p>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              Redirecting to home...
            </p>
            <button
              onClick={handleSignOut}
              style={{
                padding: '10px 24px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Sign Out
            </button>
          </div>
        )}

        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
          <a 
            href="/"
            style={{ 
              color: '#1976d2', 
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
