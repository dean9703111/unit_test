// API service using fetch
import { getToken } from '../utils/auth'

const API_BASE = '/api'

interface LoginResponse {
    accessToken: string
    user: {
        username: string
        role: 'admin' | 'user'
    }
}

interface UserResponse {
    username: string
    role: 'admin' | 'user'
}

interface AdminSecretResponse {
    secret: string
}

interface ErrorResponse {
    message: string
}

function getAuthHeaders(): HeadersInit {
    const token = getToken()
    return token
        ? {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        }
        : {
            'Content-Type': 'application/json',
        }
}

export async function login(
    username: string,
    password: string
): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
        const error: ErrorResponse = await response.json()
        throw new Error(error.message || 'Login failed')
    }

    return response.json()
}

export async function getMe(): Promise<UserResponse> {
    const response = await fetch(`${API_BASE}/me`, {
        method: 'GET',
        headers: getAuthHeaders(),
    })

    if (!response.ok) {
        const error: ErrorResponse = await response.json()
        throw new Error(error.message || 'Failed to get user info')
    }

    return response.json()
}

export async function getAdminSecret(): Promise<AdminSecretResponse> {
    const response = await fetch(`${API_BASE}/admin/secret`, {
        method: 'GET',
        headers: getAuthHeaders(),
    })

    if (!response.ok) {
        const error: ErrorResponse = await response.json()
        throw new Error(error.message || 'Failed to get admin secret')
    }

    return response.json()
}
