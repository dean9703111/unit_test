// Token management
const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export interface StoredUser {
    username: string
    role: 'admin' | 'user'
}

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY)
}

export function getStoredUser(): StoredUser | null {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
}

export function setStoredUser(user: StoredUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearStoredUser(): void {
    localStorage.removeItem(USER_KEY)
}

export function clearAuth(): void {
    clearToken()
    clearStoredUser()
}

// MSW scenario management (for dev panel)
export function getMswScenario(): string {
    return localStorage.getItem('msw_scenario') || 'success'
}

export function setMswScenario(scenario: string): void {
    localStorage.setItem('msw_scenario', scenario)
}

export function getMswDelay(): number {
    return parseInt(localStorage.getItem('msw_delay') || '0', 10)
}

export function setMswDelay(delay: number): void {
    localStorage.setItem('msw_delay', String(delay))
}
