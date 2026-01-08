import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './vitest.setup.ts',
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        reporters: ['default', 'html'],
        outputFile: {
            html: './test-reports/index.html',
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            reportsDirectory: './coverage',
        },
    },
})
