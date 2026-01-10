import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { http, HttpResponse, delay } from 'msw'
import { server } from '../mocks/server'
import { AuthProvider } from '../context/AuthContext'
import { LoginPage } from '../pages/LoginPage'

// Helper to render LoginPage with router and auth context
function renderLogin({ route = '/login', initialEntries = ['/login'] }: { route?: string; initialEntries?: string[] } = {}) {
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={initialEntries}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
                    <Route path="/admin" element={<div data-testid="admin-page">Admin</div>} />
                </Routes>
            </MemoryRouter>
        </AuthProvider>
    )
}

// Clear localStorage before each test
beforeEach(() => {
    localStorage.clear()
})

describe('LoginPage', () => {
    // Test 1: 正確渲染登入表單
    it('1. 正確渲染登入表單', () => {
        renderLogin()

        expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
    })

    // Test 2: 輸入框可正確輸入值
    it('2. 輸入框可正確輸入值', async () => {
        const user = userEvent.setup()
        renderLogin()

        const usernameInput = screen.getByLabelText(/username/i)
        const passwordInput = screen.getByLabelText(/password/i)

        await user.type(usernameInput, 'testuser')
        await user.type(passwordInput, 'testpass')

        expect(usernameInput).toHaveValue('testuser')
        expect(passwordInput).toHaveValue('testpass')
    })

    // Test 3: 登入成功後導向 Dashboard
    it('3. 登入成功後導向 Dashboard', async () => {
        const user = userEvent.setup()

        server.use(
            http.post('/api/login', () => {
                return HttpResponse.json({
                    accessToken: 'fake.jwt.token',
                    user: { username: 'admin', role: 'admin' }
                })
            })
        )

        renderLogin()

        await user.type(screen.getByLabelText(/username/i), 'admin')
        await user.type(screen.getByLabelText(/password/i), 'admin123')
        await user.click(screen.getByRole('button', { name: /login/i }))

        await waitFor(() => {
            expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
        })

        // Verify token was stored
        expect(localStorage.getItem('auth_token')).toBe('fake.jwt.token')
    })

    // Test 4: 登入成功後導向原本要訪問的頁面
    it('4. 登入成功後導向原本要訪問的頁面', async () => {
        const user = userEvent.setup()

        server.use(
            http.post('/api/login', () => {
                return HttpResponse.json({
                    accessToken: 'fake.jwt.token',
                    user: { username: 'admin', role: 'admin' }
                })
            })
        )

        // Simulate coming from /admin with state
        render(
            <AuthProvider>
                <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: { pathname: '/admin' } } }]}>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
                        <Route path="/admin" element={<div data-testid="admin-page">Admin</div>} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        )

        await user.type(screen.getByLabelText(/username/i), 'admin')
        await user.type(screen.getByLabelText(/password/i), 'admin123')
        await user.click(screen.getByRole('button', { name: /login/i }))

        await waitFor(() => {
            expect(screen.getByTestId('admin-page')).toBeInTheDocument()
        })
    })

    // Test 5: 登入失敗時顯示錯誤訊息
    it('5. 登入失敗時顯示錯誤訊息', async () => {
        const user = userEvent.setup()

        server.use(
            http.post('/api/login', () => {
                return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
            })
        )

        renderLogin()

        await user.type(screen.getByLabelText(/username/i), 'wrong')
        await user.type(screen.getByLabelText(/password/i), 'wrong')
        await user.click(screen.getByRole('button', { name: /login/i }))

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid credentials')
        })
    })

    // Test 6: 載入中狀態顯示
    it('6. 載入中狀態顯示', async () => {
        const user = userEvent.setup()

        server.use(
            http.post('/api/login', async () => {
                await delay(500)
                return HttpResponse.json({
                    accessToken: 'fake.jwt.token',
                    user: { username: 'admin', role: 'admin' }
                })
            })
        )

        renderLogin()

        await user.type(screen.getByLabelText(/username/i), 'admin')
        await user.type(screen.getByLabelText(/password/i), 'admin123')
        await user.click(screen.getByRole('button', { name: /login/i }))

        // Should see loading state
        expect(screen.getByRole('button', { name: /loading/i })).toBeInTheDocument()
        expect(screen.getByLabelText(/username/i)).toBeDisabled()
        expect(screen.getByLabelText(/password/i)).toBeDisabled()
    })

    // Test 7: Session 過期訊息顯示
    it('7. Session 過期訊息顯示', () => {
        render(
            <AuthProvider>
                <MemoryRouter initialEntries={[{ pathname: '/login', state: { sessionExpired: true } }]}>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        )

        expect(screen.getByTestId('session-expired')).toBeInTheDocument()
    })
})
