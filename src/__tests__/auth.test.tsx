import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { http, HttpResponse, delay } from 'msw'
import { server } from '../mocks/server'
import { AuthProvider } from '../context/AuthContext'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { RoleBasedRoute } from '../components/RoleBasedRoute'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'
import { AdminPage } from '../pages/AdminPage'
import { ForbiddenPage } from '../pages/ForbiddenPage'

// Helper to render app with router
function renderWithRouter(
    ui: React.ReactElement,
    { route = '/' }: { route?: string } = {}
) {
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[route]}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/403" element={<ForbiddenPage />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <RoleBasedRoute requiredRole="admin">
                                    <AdminPage />
                                </RoleBasedRoute>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
                {ui}
            </MemoryRouter>
        </AuthProvider>
    )
}

// Clear localStorage before each test
beforeEach(() => {
    localStorage.clear()
})

describe('Authentication Flow', () => {
    // Test 1: 登入成功後導向 Dashboard 並顯示歡迎訊息
    it('1. 登入成功後導向 Dashboard 並顯示歡迎訊息', async () => {
        const user = userEvent.setup()

        renderWithRouter(<></>, { route: '/login' })

        // Fill in login form
        await user.type(screen.getByLabelText(/username/i), 'admin')
        await user.type(screen.getByLabelText(/password/i), 'admin123')
        await user.click(screen.getByRole('button', { name: /login/i }))

        // Wait for redirect and welcome message
        await waitFor(() => {
            expect(screen.getByTestId('welcome-message')).toHaveTextContent(
                'Welcome, admin!'
            )
        })
    })

    // Test 2: 登入失敗時顯示錯誤訊息且不儲存 Token
    it('2. 登入失敗時顯示錯誤訊息且不儲存 Token', async () => {
        const user = userEvent.setup()

        // Override handler to return 401
        server.use(
            http.post('/api/login', () => {
                return HttpResponse.json(
                    { message: 'Invalid credentials' },
                    { status: 401 }
                )
            })
        )

        renderWithRouter(<></>, { route: '/login' })

        await user.type(screen.getByLabelText(/username/i), 'wrong')
        await user.type(screen.getByLabelText(/password/i), 'wrongpass')
        await user.click(screen.getByRole('button', { name: /login/i }))

        // Should show error message
        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toHaveTextContent(
                'Invalid credentials'
            )
        })

        // Token should not exist
        expect(localStorage.getItem('auth_token')).toBeNull()
    })

    // Test 3: 未認證訪問受保護頁面時導向登入頁
    it('3. 未認證訪問受保護頁面時導向登入頁', async () => {
        renderWithRouter(<></>, { route: '/dashboard' })

        // Should see login page
        await waitFor(() => {
            expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
        })
    })

    // Test 4: Token 過期時清除 Token 並顯示 Session 過期提示
    it('4. Token 過期時清除 Token 並顯示 Session 過期提示', async () => {
        // Set a token first
        localStorage.setItem('auth_token', 'fake.jwt.token.admin')
        localStorage.setItem(
            'auth_user',
            JSON.stringify({ username: 'admin', role: 'admin' })
        )

        // Override /api/me to return token expired
        server.use(
            http.get('/api/me', () => {
                return HttpResponse.json({ message: 'Token expired' }, { status: 401 })
            })
        )

        renderWithRouter(<></>, { route: '/dashboard' })

        // Should see session expired message on login page
        await waitFor(() => {
            expect(screen.getByTestId('session-expired')).toBeInTheDocument()
        })

        // Token should be cleared
        expect(localStorage.getItem('auth_token')).toBeNull()
    })

    // Test 5: 一般使用者訪問 Admin 頁面時顯示 403 Forbidden
    it('5. 一般使用者訪問 Admin 頁面時顯示 403 Forbidden', async () => {
        // Login as user (not admin)
        localStorage.setItem('auth_token', 'fake.jwt.token.user')
        localStorage.setItem(
            'auth_user',
            JSON.stringify({ username: 'user', role: 'user' })
        )

        renderWithRouter(<></>, { route: '/admin' })

        // Should see forbidden page
        await waitFor(() => {
            expect(screen.getByTestId('forbidden-title')).toHaveTextContent(
                '403 - Forbidden'
            )
        })
    })

    // Test 6: Admin 使用者可正常訪問 Admin 頁面
    it('6. Admin 使用者可正常訪問 Admin 頁面', async () => {
        // Login as admin
        localStorage.setItem('auth_token', 'fake.jwt.token.admin')
        localStorage.setItem(
            'auth_user',
            JSON.stringify({ username: 'admin', role: 'admin' })
        )

        renderWithRouter(<></>, { route: '/admin' })

        // Should see admin content with secret
        await waitFor(() => {
            expect(screen.getByTestId('admin-content')).toBeInTheDocument()
            expect(screen.getByTestId('secret-content')).toHaveTextContent(
                'This is the admin secret'
            )
        })
    })

    // Test 7: API 延遲時先顯示 Loading 狀態再顯示資料
    it('7. API 延遲時先顯示 Loading 狀態再顯示資料', async () => {
        // Login as admin
        localStorage.setItem('auth_token', 'fake.jwt.token.admin')
        localStorage.setItem(
            'auth_user',
            JSON.stringify({ username: 'admin', role: 'admin' })
        )

        // Override handler with delay
        server.use(
            http.get('/api/me', async () => {
                await delay(1000) // 1 second delay for test (shorter than 3000ms)
                return HttpResponse.json({ username: 'admin', role: 'admin' })
            })
        )

        renderWithRouter(<></>, { route: '/dashboard' })

        // Should see loading immediately
        expect(screen.getByTestId('loading')).toBeInTheDocument()

        // Should eventually show welcome message
        await waitFor(
            () => {
                expect(screen.getByTestId('welcome-message')).toHaveTextContent(
                    'Welcome, admin!'
                )
            },
            { timeout: 3000 }
        )
    })

    // Test 8: 伺服器錯誤時顯示錯誤訊息，Retry 後成功
    it('8. 伺服器錯誤時顯示錯誤訊息，Retry 後成功', async () => {
        const user = userEvent.setup()
        let callCount = 0

        // Login as admin
        localStorage.setItem('auth_token', 'fake.jwt.token.admin')
        localStorage.setItem(
            'auth_user',
            JSON.stringify({ username: 'admin', role: 'admin' })
        )

        // Override handler: first call returns 500, second returns success
        server.use(
            http.get('/api/me', () => {
                callCount++
                if (callCount === 1) {
                    return HttpResponse.json({ message: 'Server error' }, { status: 500 })
                }
                return HttpResponse.json({ username: 'admin', role: 'admin' })
            })
        )

        renderWithRouter(<></>, { route: '/dashboard' })

        // Should see error message first
        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toHaveTextContent(
                'Server error'
            )
        })

        // Click retry button
        await user.click(screen.getByTestId('retry-button'))

        // Should now show welcome message
        await waitFor(() => {
            expect(screen.getByTestId('welcome-message')).toHaveTextContent(
                'Welcome, admin!'
            )
        })
    })
})
