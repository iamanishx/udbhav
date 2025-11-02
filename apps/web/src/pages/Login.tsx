import { useEffect, useState } from 'react'

export default function Login() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for error in URL params
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get('error')
    if (errorParam) {
      setError(`Authentication failed: ${errorParam.replace(/_/g, ' ')}`)
    }
  }, [])

  const handleGoogleLogin = () => {
    // Use the current domain's origin for auth routes
    const origin = window.location.origin
    // Redirect to backend OAuth initiation endpoint
    window.location.href = `${origin}/auth/google`
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

        {error && (
          <div style={{ 
            padding: '12px', 
            marginBottom: '20px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            width: '100%',
            padding: '12px 24px',
            backgroundColor: 'white',
            border: '1px solid #dadce0',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#3c4043',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            fontFamily: 'inherit'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f8f9fa'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'white'
          }}
        >
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Sign in with Google
        </button>

        <p style={{ fontSize: '12px', color: '#999', marginTop: '20px' }}>
          You'll be redirected to Google to sign in
        </p>

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
