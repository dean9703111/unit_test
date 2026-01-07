import { useEffect, useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMe } from '../services/api'

export function DashboardPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user, logout, setUser } = useAuth()
    const navigate = useNavigate()

    const fetchUserData = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const userData = await getMe()
            setUser(userData)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load user data'

            // If token expired or invalid, logout and redirect
            if (message.toLowerCase().includes('expired') || message.toLowerCase().includes('unauthorized')) {
                logout()
                navigate('/login', { state: { sessionExpired: true }, replace: true })
                return
            }

            setError(message)
        } finally {
            setIsLoading(false)
        }
    }, [logout, navigate, setUser])

    useEffect(() => {
        fetchUserData()
    }, [fetchUserData])

    const handleRetry = () => {
        fetchUserData()
    }

    const handleLogout = () => {
        logout()
        navigate('/login', { replace: true })
    }

    if (isLoading) {
        return (
            <div
                data-testid="loading"
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '200px',
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '18px',
                }}
            >
                ⏳ Loading...
            </div>
        )
    }

    if (error) {
        return (
            <div
                style={{
                    maxWidth: '500px',
                    margin: '100px auto',
                    padding: '24px',
                    fontFamily: 'system-ui, sans-serif',
                    textAlign: 'center',
                }}
            >
                <div
                    data-testid="error-message"
                    style={{
                        background: '#f8d7da',
                        color: '#721c24',
                        padding: '16px',
                        borderRadius: '4px',
                        marginBottom: '16px',
                        border: '1px solid #f5c6cb',
                    }}
                >
                    ❌ {error}
                </div>
                <button
                    data-testid="retry-button"
                    onClick={handleRetry}
                    style={{
                        padding: '12px 24px',
                        background: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                    }}
                >
                    🔄 Retry
                </button>
            </div>
        )
    }

    return (
        <div
            style={{
                maxWidth: '600px',
                margin: '50px auto',
                padding: '24px',
                fontFamily: 'system-ui, sans-serif',
            }}
        >
            <h1 data-testid="welcome-message">Welcome, {user?.username}!</h1>

            <div
                style={{
                    background: '#e9ecef',
                    padding: '16px',
                    borderRadius: '8px',
                    marginTop: '24px',
                }}
            >
                <h3 style={{ marginTop: 0 }}>User Info</h3>
                <p>
                    <strong>Username:</strong> {user?.username}
                </p>
                <p>
                    <strong>Role:</strong>{' '}
                    <span
                        style={{
                            background: user?.role === 'admin' ? '#28a745' : '#17a2b8',
                            color: '#fff',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '14px',
                        }}
                    >
                        {user?.role}
                    </span>
                </p>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                {user?.role === 'admin' && (
                    <Link
                        to="/admin"
                        style={{
                            padding: '12px 24px',
                            background: '#6f42c1',
                            color: '#fff',
                            borderRadius: '4px',
                            textDecoration: 'none',
                        }}
                    >
                        🔐 Admin Panel
                    </Link>
                )}
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '12px 24px',
                        background: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Logout
                </button>
            </div>
        </div>
    )
}
