import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { http, HttpResponse, delay } from 'msw'
import { server } from '../mocks/server'
import { AuthProvider } from '../context/AuthContext'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { DashboardPage } from '../pages/DashboardPage'
import { LoginPage } from '../pages/LoginPage'

// Helper to render DashboardPage with router and auth context
function renderDashboard({ route = '/dashboard' }: { route?: string } = {}) {
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[route]}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        </AuthProvider>
    )
}

// Helper to setup authenticated state
function setupAuth(role: 'admin' | 'user' = 'admin') {
    const username = role === 'admin' ? 'admin' : 'user'
    localStorage.setItem('auth_token', `fake.jwt.token.${role}`)
    localStorage.setItem('auth_user', JSON.stringify({ username, role }))
}

// Clear localStorage before each test
beforeEach(() => {
    localStorage.clear()
})

describe('DashboardPage', () => {
    // Test 1: 載入狀態顯示
    it('1. 載入狀態顯示', async () => {
        setupAuth('admin')

        // Add delay to see loading state
        server.use(
            http.get('/api/me', async () => {
                await delay(500)
                return HttpResponse.json({ username: 'admin', role: 'admin' })
            })
        )

        renderDashboard()

        // Should see loading immediately
        expect(screen.getByTestId('loading')).toBeInTheDocument()
    })

    // Test 2: 成功載入使用者資料
    it('2. 成功載入使用者資料', async () => {
        setupAuth('admin')

        renderDashboard()

        // Wait for welcome message
        await waitFor(() => {
            expect(screen.getByTestId('welcome-message')).toHaveTextContent('Welcome, admin!')
        })

        // User info should be displayed - check for Username and Role labels
        expect(screen.getByText('Username:')).toBeInTheDocument()
        expect(screen.getByText('Role:')).toBeInTheDocument()
        // Verify admin role badge exists (the span containing the role)
        expect(screen.getAllByText('admin').length).toBeGreaterThanOrEqual(2)
    })

    // Test 3: Admin 使用者顯示 Admin Panel 連結
    it('3. Admin 使用者顯示 Admin Panel 連結', async () => {
        setupAuth('admin')

        renderDashboard()

        await waitFor(() => {
            expect(screen.getByTestId('welcome-message')).toBeInTheDocument()
        })

        // Admin Panel link should exist
        const adminLink = screen.getByRole('link', { name: /admin panel/i })
        expect(adminLink).toBeInTheDocument()
        expect(adminLink).toHaveAttribute('href', '/admin')
    })

    // Test 4: 一般使用者不顯示 Admin Panel 連結
    it('4. 一般使用者不顯示 Admin Panel 連結', async () => {
        setupAuth('user')

        renderDashboard()

        await waitFor(() => {
            expect(screen.getByTestId('welcome-message')).toHaveTextContent('Welcome, user!')
        })

        // Admin Panel link should not exist
        expect(screen.queryByRole('link', { name: /admin panel/i })).not.toBeInTheDocument()
    })

    // Test 5: API 錯誤時顯示錯誤訊息
    it('5. API 錯誤時顯示錯誤訊息', async () => {
        setupAuth('admin')

        server.use(
            http.get('/api/me', () => {
                return HttpResponse.json({ message: 'Server error' }, { status: 500 })
            })
        )

        renderDashboard()

        // Should show error message
        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toHaveTextContent('Server error')
        })

        // Retry button should be visible
        expect(screen.getByTestId('retry-button')).toBeInTheDocument()
    })

    // Test 6: 點擊 Retry 按鈕重新載入
    it('6. 點擊 Retry 按鈕重新載入', async () => {
        const user = userEvent.setup()
        let callCount = 0

        setupAuth('admin')

        // First call returns error, second call returns success
        server.use(
            http.get('/api/me', () => {
                callCount++
                if (callCount === 1) {
                    return HttpResponse.json({ message: 'Server error' }, { status: 500 })
                }
                return HttpResponse.json({ username: 'admin', role: 'admin' })
            })
        )

        renderDashboard()

        // Wait for error
        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument()
        })

        // Click retry button
        await user.click(screen.getByTestId('retry-button'))

        // Should now show welcome message
        await waitFor(() => {
            expect(screen.getByTestId('welcome-message')).toHaveTextContent('Welcome, admin!')
        })
    })

    // Test 7: Token 過期時清除登入並導向到 Login 頁面
    it('7. Token 過期時清除登入並導向到 Login 頁面', async () => {
        setupAuth('admin')

        server.use(
            http.get('/api/me', () => {
                return HttpResponse.json({ message: 'Token expired' }, { status: 401 })
            })
        )

        renderDashboard()

        // Should redirect to login with session expired message
        await waitFor(() => {
            expect(screen.getByTestId('session-expired')).toBeInTheDocument()
        })

        // Token should be cleared
        expect(localStorage.getItem('auth_token')).toBeNull()
    })

    // Test 8: Logout 按鈕功能
    it('8. Logout 按鈕功能', async () => {
        const user = userEvent.setup()

        setupAuth('admin')

        renderDashboard()

        // Wait for dashboard to load
        await waitFor(() => {
            expect(screen.getByTestId('welcome-message')).toBeInTheDocument()
        })

        // Click logout button
        const logoutButton = screen.getByRole('button', { name: /logout/i })
        await user.click(logoutButton)

        // Should redirect to login page
        await waitFor(() => {
            expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
        })

        // Token should be cleared
        expect(localStorage.getItem('auth_token')).toBeNull()
    })
})
