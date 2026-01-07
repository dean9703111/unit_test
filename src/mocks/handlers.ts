// MSW handlers with scenario support
import { http, HttpResponse, delay } from 'msw'

// Get scenario and delay from localStorage (set by DevPanel)
function getScenario(): string {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('msw_scenario') || 'success'
    }
    return 'success'
}

function getDelayMs(): number {
    if (typeof window !== 'undefined') {
        return parseInt(localStorage.getItem('msw_delay') || '0', 10)
    }
    return 0
}

// Simulated "database" of users
const users = {
    admin: { username: 'admin', role: 'admin' as const, password: 'admin123' },
    user: { username: 'user', role: 'user' as const, password: 'user123' },
}

// Token to user mapping (simple simulation)
const tokenUserMap: Record<string, { username: string; role: 'admin' | 'user' }> = {
    'fake.jwt.token.admin': { username: 'admin', role: 'admin' },
    'fake.jwt.token.user': { username: 'user', role: 'user' },
}

export const handlers = [
    // POST /api/login
    http.post('/api/login', async ({ request }) => {
        const delayMs = getDelayMs()
        if (delayMs > 0) {
            await delay(delayMs)
        }

        const scenario = getScenario()

        // Handle different scenarios
        if (scenario === 'server_error') {
            return HttpResponse.json({ message: 'Server error' }, { status: 500 })
        }

        if (scenario === 'invalid_password') {
            return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
        }

        // Success scenario
        const body = (await request.json()) as { username: string; password: string }
        const { username, password } = body

        // Find user
        const userEntry = Object.values(users).find(
            (u) => u.username === username && u.password === password
        )

        if (!userEntry) {
            return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
        }

        const token = `fake.jwt.token.${userEntry.role}`
        return HttpResponse.json({
            accessToken: token,
            user: {
                username: userEntry.username,
                role: userEntry.role,
            },
        })
    }),

    // GET /api/me
    http.get('/api/me', async ({ request }) => {
        const delayMs = getDelayMs()
        if (delayMs > 0) {
            await delay(delayMs)
        }

        const scenario = getScenario()

        // Check authorization header
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        // Handle token_expired scenario
        if (scenario === 'token_expired') {
            return HttpResponse.json({ message: 'Token expired' }, { status: 401 })
        }

        if (scenario === 'server_error') {
            return HttpResponse.json({ message: 'Server error' }, { status: 500 })
        }

        // Extract token and find user
        const token = authHeader.replace('Bearer ', '')
        const user = tokenUserMap[token]

        if (!user) {
            return HttpResponse.json({ message: 'Invalid token' }, { status: 401 })
        }

        return HttpResponse.json({
            username: user.username,
            role: user.role,
        })
    }),

    // GET /api/admin/secret
    http.get('/api/admin/secret', async ({ request }) => {
        const delayMs = getDelayMs()
        if (delayMs > 0) {
            await delay(delayMs)
        }

        const scenario = getScenario()

        // Check authorization header
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        if (scenario === 'server_error') {
            return HttpResponse.json({ message: 'Server error' }, { status: 500 })
        }

        // Extract token and find user
        const token = authHeader.replace('Bearer ', '')
        const user = tokenUserMap[token]

        if (!user) {
            return HttpResponse.json({ message: 'Invalid token' }, { status: 401 })
        }

        // Handle forbidden scenario or non-admin role
        if (scenario === 'forbidden' || user.role !== 'admin') {
            return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        return HttpResponse.json({
            secret: '🔐 This is the admin secret! Only admins can see this.',
        })
    }),
]
