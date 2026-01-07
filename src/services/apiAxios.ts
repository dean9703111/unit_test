// Alternative API service using axios
// This file demonstrates the same API with axios for reference
import axios, { AxiosError } from 'axios'
import { getToken } from '../utils/auth'

const API_BASE = '/api'

// Create axios instance with interceptor for auth header
const axiosInstance = axios.create({
    baseURL: API_BASE,
})

// Add auth token to every request
axiosInstance.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

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

export async function loginAxios(
    username: string,
    password: string
): Promise<LoginResponse> {
    try {
        const response = await axiosInstance.post<LoginResponse>('/login', {
            username,
            password,
        })
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>
        throw new Error(axiosError.response?.data?.message || 'Login failed')
    }
}

export async function getMeAxios(): Promise<UserResponse> {
    try {
        const response = await axiosInstance.get<UserResponse>('/me')
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>
        throw new Error(
            axiosError.response?.data?.message || 'Failed to get user info'
        )
    }
}

export async function getAdminSecretAxios(): Promise<AdminSecretResponse> {
    try {
        const response = await axiosInstance.get<AdminSecretResponse>('/admin/secret')
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>
        throw new Error(
            axiosError.response?.data?.message || 'Failed to get admin secret'
        )
    }
}
