import React, { useState, useEffect, useCallback } from 'react'

/**
 * ActionBar — Context-aware lifecycle action buttons for a booking.
 * Renders different buttons depending on booking status.
 * All buttons call placeholder endpoints.
 */

// Frontend mirror of canTransition logic
const VALID_TRANSITIONS = {
    DRAFT: ['HELD', 'CANCELLED'],
    HELD: ['PENDING_PAYMENT', 'EXPIRED', 'CANCELLED'],
    PENDING_PAYMENT: ['CONFIRMED', 'HELD'],
    CONFIRMED: ['TICKETED', 'CANCELLED'],
    TICKETED: [],
    CANCELLED: [],
    EXPIRED: [],
}

function canTransition(from, to) {
    return (VALID_TRANSITIONS[from] || []).includes(to)
}

// Countdown timer hook for HELD state
function useCountdown(targetDate) {
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        if (!targetDate) { setTimeLeft(''); return }

        const calc = () => {
            const diff = new Date(targetDate) - new Date()
            if (diff <= 0) { setTimeLeft('EXPIRED'); return }
            const h = Math.floor(diff / 3600000)
            const m = Math.floor((diff % 3600000) / 60000)
            const s = Math.floor((diff % 60000) / 1000)
            setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
        }

        calc()
        const interval = setInterval(calc, 1000)
        return () => clearInterval(interval)
    }, [targetDate])

    return timeLeft
}

export default function ActionBar({ booking, onAction, offerExpired = false, flightProviderAvailable = true }) {
    const [loading, setLoading] = useState(null) // which action is in progress
    const status = booking?.status || 'DRAFT'
    const countdown = useCountdown(status === 'HELD' ? booking?.hold_expires_at : null)
    const API = import.meta.env.VITE_API_URL || ''

    const handleAction = useCallback(async (action) => {
        setLoading(action)
        try {
            const res = await fetch(`${API}/api/bookings/${booking.id}/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
            const data = await res.json()

            if (!res.ok || !data.success) {
                // Handle structured error types from backend
                const errorType = data?.type
                let message = data?.error || 'Unknown error'

                // Map error types to user-friendly messages
                switch (errorType) {
                    case 'FLIGHT_PROVIDER_UNAVAILABLE':
                        message = 'Flight provider temporarily unavailable.'
                        break
                    case 'EXPIRED':
                        message = 'This fare is no longer available. Please search for flights again and create a new booking.'
                        break
                    case 'PRICE_CHANGED':
                        const oldPrice = data?.oldPrice
                        const newPrice = data?.newPrice
                        message = `Price has changed from ${oldPrice} to ${newPrice}. Please confirm if you want to proceed with the new price.`
                        // TODO: Add confirmation dialog for price change
                        break
                    case 'GDS_DOWN':
                        message = 'Airline system temporarily unavailable. Please try again in a few moments.'
                        break
                    case 'INVALID_STATE':
                        message = 'This action is not allowed in current booking state.'
                        break
                    case 'GDS_ERROR':
                        message = data?.error || 'An error occurred with the airline system. Please try again.'
                        break
                    default:
                        // Fallback for legacy error format
                        if (data?.requiresNewSearch || message.includes('expired') || message.includes('invalid')) {
                            message = `${message}\n\n⚠️ The flight offer has expired. Please search for flights again and create a new booking.`
                        }
                }

                throw new Error(message);
            }

            // Success — trigger re-fetch to update booking state
            onAction?.(action, data)
        } catch (err) {
            alert(`Action failed: ${err.message}`)
        } finally {
            setLoading(null)
        }
    }, [booking?.id, onAction, API])

    const btn = (label, action, variant = 'primary', icon = '', extraDisabled = false) => (
        <button
            key={action}
            className={`action-bar__btn action-bar__btn--${variant}`}
            disabled={loading !== null || extraDisabled}
            onClick={() => handleAction(action)}
        >
            {loading === action ? (
                <span className="action-bar__spinner" />
            ) : icon ? (
                <span>{icon}</span>
            ) : null}
            {label}
        </button>
    )

    // Terminal states
    if (status === 'TICKETED') {
        return (
            <div className="action-bar">
                <button className="action-bar__btn action-bar__btn--outline" onClick={() => alert('E-ticket viewer coming soon')}>
                    🎫 View E-Ticket
                </button>
            </div>
        )
    }

    if (status === 'CANCELLED' || status === 'EXPIRED') {
        return (
            <div className="action-bar action-bar--disabled">
                <span className="action-bar__terminal-label">
                    {status === 'CANCELLED' ? '❌ Booking Cancelled' : '⏰ Booking Expired'} — No actions available
                </span>
            </div>
        )
    }

    const providerDisabled = !flightProviderAvailable

    return (
        <div className="action-bar">
            {providerDisabled && (
                <span className="action-bar__provider-unavailable" style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary, #666)' }}>
                    Flight provider temporarily unavailable
                </span>
            )}
            {/* DRAFT */}
            {status === 'DRAFT' && (
                <>
                    <button
                        className={`action-bar__btn action-bar__btn--primary`}
                        disabled={loading !== null || offerExpired || providerDisabled}
                        onClick={() => handleAction('hold')}
                    >
                        {loading === 'hold' ? (
                            <span className="action-bar__spinner" />
                        ) : (
                            <span>⏳</span>
                        )}
                        {offerExpired ? 'Offer Expired' : 'Reserve ▶'}
                    </button>
                    {btn('Cancel', 'cancel', 'danger', '✕')}
                </>
            )}

            {/* HELD */}
            {status === 'HELD' && (
                <>
                    <button
                        className="action-bar__btn action-bar__btn--primary"
                        disabled={loading !== null || providerDisabled}
                        onClick={() => handleAction('issue')}
                    >
                        {loading === 'issue' ? <span className="action-bar__spinner" /> : <span>🎫</span>}
                        Issue Ticket ▶
                    </button>
                    {btn('Cancel Hold', 'cancel', 'danger', '✕')}
                    {countdown && (
                        <div className={`action-bar__countdown ${countdown === 'EXPIRED' ? 'action-bar__countdown--expired' : ''}`}>
                            <span className="action-bar__countdown-icon">⏱</span>
                            <span>Hold expires in: <strong>{countdown}</strong></span>
                        </div>
                    )}
                </>
            )}

            {/* PENDING_PAYMENT */}
            {status === 'PENDING_PAYMENT' && (
                <>
                    {btn('Confirm Payment ✓', 'confirm-payment', 'success', '✅')}
                    {/* Payment failed goes back to HELD via backend */}
                </>
            )}

            {/* CONFIRMED */}
            {status === 'CONFIRMED' && (
                <>
                    {btn('Issue Ticket ▶', 'ticket', 'primary', '🎫', providerDisabled)}
                </>
            )}
        </div>
    )
}
