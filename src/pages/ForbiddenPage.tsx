import { Link } from 'react-router-dom'

export function ForbiddenPage() {
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
                style={{
                    fontSize: '72px',
                    marginBottom: '16px',
                }}
            >
                🚫
            </div>

            <h1 data-testid="forbidden-title" style={{ color: '#dc3545' }}>
                403 - Forbidden
            </h1>

            <p style={{ color: '#6c757d', marginBottom: '24px' }}>
                You don't have permission to access this page.
            </p>

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
