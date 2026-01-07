import { useState, useEffect } from 'react'
import {
    getMswScenario,
    setMswScenario,
    getMswDelay,
    setMswDelay,
    clearAuth,
} from '../utils/auth'

const scenarios = [
    { value: 'success', label: '✅ Success' },
    { value: 'invalid_password', label: '🔐 Invalid Password (401)' },
    { value: 'token_expired', label: '⏰ Token Expired (401)' },
    { value: 'forbidden', label: '🚫 Forbidden (403)' },
    { value: 'server_error', label: '💥 Server Error (500)' },
]

const delays = [
    { value: 0, label: '0ms (instant)' },
    { value: 1500, label: '1500ms' },
    { value: 3000, label: '3000ms' },
]

export function DevPanel() {
    const [isOpen, setIsOpen] = useState(false)
    const [scenario, setScenarioState] = useState(getMswScenario())
    const [delayMs, setDelayState] = useState(getMswDelay())

    useEffect(() => {
        setMswScenario(scenario)
    }, [scenario])

    useEffect(() => {
        setMswDelay(delayMs)
    }, [delayMs])

    const handleClearToken = () => {
        clearAuth()
        alert('Token cleared! Refresh the page to see the effect.')
    }

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 9999,
                fontFamily: 'monospace',
            }}
        >
            {/* Toggle button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: '#333',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                }}
            >
                {isOpen ? '✕ Close' : '🛠 Dev Panel'}
            </button>

            {/* Panel */}
            {isOpen && (
                <div
                    style={{
                        background: '#1a1a1a',
                        color: '#fff',
                        padding: '16px',
                        borderRadius: '8px',
                        marginTop: '8px',
                        minWidth: '280px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }}
                >
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
                        🧪 MSW Dev Panel
                    </h4>

                    {/* Scenario selector */}
                    <div style={{ marginBottom: '12px' }}>
                        <label
                            style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}
                        >
                            Scenario:
                        </label>
                        <select
                            value={scenario}
                            onChange={(e) => setScenarioState(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '6px',
                                borderRadius: '4px',
                                border: '1px solid #444',
                                background: '#333',
                                color: '#fff',
                                fontSize: '12px',
                            }}
                        >
                            {scenarios.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Delay selector */}
                    <div style={{ marginBottom: '12px' }}>
                        <label
                            style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}
                        >
                            Delay:
                        </label>
                        <select
                            value={delayMs}
                            onChange={(e) => setDelayState(Number(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '6px',
                                borderRadius: '4px',
                                border: '1px solid #444',
                                background: '#333',
                                color: '#fff',
                                fontSize: '12px',
                            }}
                        >
                            {delays.map((d) => (
                                <option key={d.value} value={d.value}>
                                    {d.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Clear token button */}
                    <button
                        onClick={handleClearToken}
                        style={{
                            width: '100%',
                            padding: '8px',
                            background: '#c0392b',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                        }}
                    >
                        🗑 Clear Token & Reload Prompt
                    </button>

                    {/* Current state display */}
                    <div
                        style={{
                            marginTop: '12px',
                            padding: '8px',
                            background: '#333',
                            borderRadius: '4px',
                            fontSize: '10px',
                        }}
                    >
                        <div>📍 Scenario: {scenario}</div>
                        <div>⏱ Delay: {delayMs}ms</div>
                    </div>
                </div>
            )}
        </div>
    )
}
