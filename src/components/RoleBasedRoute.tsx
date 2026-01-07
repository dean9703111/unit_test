import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface RoleBasedRouteProps {
    children: React.ReactNode
    requiredRole: 'admin' | 'user'
}

export function RoleBasedRoute({ children, requiredRole }: RoleBasedRouteProps) {
    const { user } = useAuth()

    // If user doesn't exist or role is insufficient, redirect to 403
    if (!user) {
        return <Navigate to="/403" replace />
    }

    // Admin can access everything, user can only access user routes
    if (requiredRole === 'admin' && user.role !== 'admin') {
        return <Navigate to="/403" replace />
    }

    return <>{children}</>
}
