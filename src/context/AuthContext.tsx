import {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
    useEffect,
} from 'react'
import {
    getToken,
    setToken,
    clearAuth,
    getStoredUser,
    setStoredUser,
    StoredUser,
} from '../utils/auth'

interface AuthContextType {
    token: string | null
    user: StoredUser | null
    isAuthenticated: boolean
    login: (token: string, user: StoredUser) => void
    logout: () => void
    setUser: (user: StoredUser) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setTokenState] = useState<string | null>(() => getToken())
    const [user, setUserState] = useState<StoredUser | null>(() => getStoredUser())

    // Sync with localStorage on mount
    useEffect(() => {
        const storedToken = getToken()
        const storedUser = getStoredUser()
        if (storedToken !== token) setTokenState(storedToken)
        if (JSON.stringify(storedUser) !== JSON.stringify(user)) setUserState(storedUser)
    }, [])

    const login = useCallback((newToken: string, newUser: StoredUser) => {
        setToken(newToken)
        setStoredUser(newUser)
        setTokenState(newToken)
        setUserState(newUser)
    }, [])

    const logout = useCallback(() => {
        clearAuth()
        setTokenState(null)
        setUserState(null)
    }, [])

    const setUser = useCallback((newUser: StoredUser) => {
        setStoredUser(newUser)
        setUserState(newUser)
    }, [])

    const value: AuthContextType = {
        token,
        user,
        isAuthenticated: !!token,
        login,
        logout,
        setUser,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
