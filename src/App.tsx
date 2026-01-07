import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RoleBasedRoute } from './components/RoleBasedRoute'
import { DevPanel } from './components/DevPanel'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { AdminPage } from './pages/AdminPage'
import { ForbiddenPage } from './pages/ForbiddenPage'

const isDev = import.meta.env.DEV || import.meta.env.VITE_USE_MSW === 'true'

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/403" element={<ForbiddenPage />} />

                    {/* Protected routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Protected + Role-based routes */}
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

                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>

                {/* Dev panel - only visible in development mode */}
                {isDev && <DevPanel />}
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
