import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Enable MSW in development mode only (controlled by VITE_USE_MSW env var)
async function enableMocking() {
    const useMsw = import.meta.env.VITE_USE_MSW === 'true' || import.meta.env.DEV

    if (!useMsw) {
        return
    }

    const { worker } = await import('./mocks/browser')

    // Start the worker with onUnhandledRequest set to bypass for non-API requests
    return worker.start({
        onUnhandledRequest: 'bypass',
    })
}

enableMocking().then(() => {
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <App />
        </StrictMode>
    )
})
