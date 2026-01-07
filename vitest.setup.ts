import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import { server } from './src/mocks/server.ts'

// Mock localStorage for jsdom environment
const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value
        },
        removeItem: (key: string) => {
            delete store[key]
        },
        clear: () => {
            store = {}
        },
        get length() {
            return Object.keys(store).length
        },
        key: (index: number) => Object.keys(store)[index] || null,
    }
})()

Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true,
})

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

beforeEach(() => {
    localStorage.clear()
})

afterEach(() => server.resetHandlers())
afterAll(() => server.close())
