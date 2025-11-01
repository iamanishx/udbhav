import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'
import '../App.css'

interface UserInfo {
  email: string
  name: string
}

export default function Home() {
  const [count, setCount] = useState(0)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
        const res = await fetch(`${apiUrl}/api/auth/me`, {
          credentials: 'include',
        })
        
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <>
      {!loading && (
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {user ? (
            <>
              <span style={{ fontSize: '14px' }}>
                Welcome, {user.name}!
              </span>
              <button 
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link 
              to="/login"
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #1976d2',
                backgroundColor: '#1976d2',
                color: 'white',
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      )}

      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}
