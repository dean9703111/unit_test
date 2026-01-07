import { useState, FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login } from '../services/api'

interface LocationState {
    from?: { pathname: string }
    sessionExpired?: boolean
}

export function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const navigate = useNavigate()
    const location = useLocation()
    const { login: authLogin } = useAuth()

    const state = location.state as LocationState | null
    const sessionExpired = state?.sessionExpired

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const response = await login(username, password)
            authLogin(response.accessToken, response.user)

            // Redirect to the page they tried to visit, or dashboard
            const from = state?.from?.pathname || '/dashboard'
            navigate(from, { replace: true })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div
            style={{
                maxWidth: '400px',
                margin: '100px auto',
                padding: '24px',
                fontFamily: 'system-ui, sans-serif',
            }}
        >
            <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>Login</h1>

            {sessionExpired && (
                <div
                    data-testid="session-expired"
                    style={{
                        background: '#fff3cd',
                        color: '#856404',
                        padding: '12px',
                        borderRadius: '4px',
                        marginBottom: '16px',
                        border: '1px solid #ffc107',
                    }}
                >
                    ⏰ Session expired. Please login again.
                </div>
            )}

            {error && (
                <div
                    data-testid="error-message"
                    style={{
                        background: '#f8d7da',
                        color: '#721c24',
                        padding: '12px',
                        borderRadius: '4px',
                        marginBottom: '16px',
                        border: '1px solid #f5c6cb',
                    }}
                >
                    ❌ {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                    <label
                        htmlFor="username"
                        style={{ display: 'block', marginBottom: '4px' }}
                    >
                        Username:
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin or user"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            boxSizing: 'border-box',
                        }}
                    />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label
                        htmlFor="password"
                        style={{ display: 'block', marginBottom: '4px' }}
                    >
                        Password:
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="admin123 or user123"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            boxSizing: 'border-box',
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: isLoading ? '#6c757d' : '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                    }}
                >
                    {isLoading ? '⏳ Loading...' : 'Login'}
                </button>
            </form>

            <div
                style={{
                    marginTop: '24px',
                    padding: '16px',
                    background: '#e9ecef',
                    borderRadius: '4px',
                    fontSize: '14px',
                }}
            >
                <strong>Test credentials:</strong>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                    <li>Admin: admin / admin123</li>
                    <li>User: user / user123</li>
                </ul>
            </div>
        </div>
    )
}
