import React from 'react'

/**
 * StatusBadge — Color-coded booking status badge
 * Mirrors the lifecycle states from bookingStateMachine.js
 */

const STATUS_CONFIG = {
    DRAFT: { label: 'Draft', color: '#6c757d', bg: 'rgba(108,117,125,0.12)', icon: '📝' },
    HELD: { label: 'Reserved (Held)', color: '#0078d4', bg: 'rgba(0,120,212,0.12)', icon: '⏳' },
    PENDING_PAYMENT: { label: 'Pending Payment', color: '#e67e22', bg: 'rgba(230,126,34,0.12)', icon: '💳' },
    CONFIRMED: { label: 'Confirmed', color: '#27ae60', bg: 'rgba(39,174,96,0.12)', icon: '✅' },
    TICKETED: { label: 'Ticketed', color: '#2980b9', bg: 'rgba(41,128,185,0.12)', icon: '🎫' },
    CANCELLED: { label: 'Cancelled', color: '#e74c3c', bg: 'rgba(231,76,60,0.12)', icon: '❌' },
    EXPIRED: { label: 'Expired', color: '#95a5a6', bg: 'rgba(149,165,166,0.12)', icon: '⏰' },
}

export default function StatusBadge({ status, size = 'default' }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT

    const sizeStyles = {
        small: { fontSize: '0.75rem', padding: '2px 8px' },
        default: { fontSize: '0.875rem', padding: '4px 12px' },
        large: { fontSize: '1.125rem', padding: '8px 20px' },
        banner: { fontSize: '1.5rem', padding: '12px 28px' },
    }

    return (
        <span
            className={`status-badge status-badge--${status?.toLowerCase()}`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
                borderRadius: '6px',
                color: config.color,
                background: config.bg,
                border: `1px solid ${config.color}25`,
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
                ...sizeStyles[size],
            }}
        >
            <span>{config.icon}</span>
            <span>{config.label}</span>
        </span>
    )
}

export { STATUS_CONFIG }
