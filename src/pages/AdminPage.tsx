import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminSecret } from '../services/api'

export function AdminPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [secret, setSecret] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchSecret = async () => {
            setIsLoading(true)
            try {
                const data = await getAdminSecret()
                setSecret(data.secret)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load secret')
            } finally {
                setIsLoading(false)
            }
        }

        fetchSecret()
    }, [])

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
                ⏳ Loading admin secret...
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
                <Link
                    to="/dashboard"
                    style={{
                        padding: '12px 24px',
                        background: '#007bff',
                        color: '#fff',
                        borderRadius: '4px',
                        textDecoration: 'none',
                    }}
                >
                    ← Back to Dashboard
                </Link>
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
            <h1>🔐 Admin Panel</h1>

            <div
                data-testid="admin-content"
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '24px',
                    borderRadius: '8px',
                    color: '#fff',
                    marginTop: '24px',
                }}
            >
                <h3 style={{ marginTop: 0 }}>Top Secret Information</h3>
                <p data-testid="secret-content" style={{ fontSize: '18px' }}>
                    {secret}
                </p>
            </div>

            <div style={{ marginTop: '24px' }}>
                <Link
                    to="/dashboard"
                    style={{
                        padding: '12px 24px',
                        background: '#007bff',
                        color: '#fff',
                        borderRadius: '4px',
                        textDecoration: 'none',
                    }}
                >
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    )
}
