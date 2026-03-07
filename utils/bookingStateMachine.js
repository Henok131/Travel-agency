// =============================================================================
// Booking Lifecycle State Machine
// =============================================================================
//
// Pure logic layer — no database calls, no side effects.
// Enforces valid status transitions for the booking orchestration layer.
//
// IMPORTANT: bookings.status is the ONLY lifecycle authority.
//            main_table.booking_status is legacy/financial metadata only.
//
// Usage:
//   import { assertTransition, canTransition } from './utils/bookingStateMachine.js'
//
//   // In an Express route:
//   assertTransition(booking.status, 'HELD')  // throws if invalid
//
// Enum (matches booking_status_enum in PostgreSQL):
//   DRAFT → HELD → TICKETED
//          ↘ CANCELLED
//                    ↘ CANCELLED
//                    ↘ EXPIRED
//                    ↘ CANCELLED
// =============================================================================

/**
 * All valid booking statuses.
 * Matches `booking_status_enum` in PostgreSQL exactly.
 */
export const STATUSES = Object.freeze({
    DRAFT: 'DRAFT',
    HELD: 'HELD',
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    CONFIRMED: 'CONFIRMED',
    TICKETED: 'TICKETED',
    CANCELLED: 'CANCELLED',
    EXPIRED: 'EXPIRED'
})

/**
 * Valid transitions map.
 * Key = current status, Value = array of statuses it can move to.
 * Terminal states (TICKETED, CANCELLED, EXPIRED) have empty arrays.
 */
export const VALID_TRANSITIONS = Object.freeze({
    [STATUSES.DRAFT]: [STATUSES.HELD, STATUSES.CANCELLED],
    [STATUSES.HELD]: [STATUSES.TICKETED, STATUSES.EXPIRED, STATUSES.CANCELLED],
    [STATUSES.TICKETED]: [],
    [STATUSES.CANCELLED]: [],
    [STATUSES.EXPIRED]: [],
    // Legacy statuses (kept for backward compatibility but not in main flow)
    [STATUSES.PENDING_PAYMENT]: [STATUSES.CONFIRMED, STATUSES.HELD],
    [STATUSES.CONFIRMED]: [STATUSES.TICKETED, STATUSES.CANCELLED]
})

/**
 * Human-readable labels for each status (useful for UI display).
 */
export const STATUS_LABELS = Object.freeze({
    [STATUSES.DRAFT]: 'Draft',
    [STATUSES.HELD]: 'Reserved (Held)',
    [STATUSES.PENDING_PAYMENT]: 'Pending Payment',
    [STATUSES.CONFIRMED]: 'Payment Confirmed',
    [STATUSES.TICKETED]: 'Ticketed',
    [STATUSES.CANCELLED]: 'Cancelled',
    [STATUSES.EXPIRED]: 'Expired'
})

// =============================================================================
// Core Functions
// =============================================================================

/**
 * Check if a status value is a known booking status.
 * @param {string} status
 * @returns {boolean}
 */
export function isValidStatus(status) {
    return Object.values(STATUSES).includes(status)
}

/**
 * Check if a transition from `fromStatus` to `toStatus` is allowed.
 * Returns false for unknown statuses (never throws).
 *
 * @param {string} fromStatus - Current booking status
 * @param {string} toStatus   - Desired target status
 * @returns {boolean}
 *
 * @example
 *   canTransition('DRAFT', 'HELD')      // true
 *   canTransition('DRAFT', 'TICKETED')  // false
 *   canTransition('TICKETED', 'DRAFT')  // false (terminal)
 */
export function canTransition(fromStatus, toStatus) {
    const allowed = VALID_TRANSITIONS[fromStatus]
    if (!allowed) return false
    return allowed.includes(toStatus)
}

/**
 * Assert that a transition is valid. Throws an Error if not.
 * Use this in Express route handlers to guard status changes.
 *
 * @param {string} fromStatus - Current booking status
 * @param {string} toStatus   - Desired target status
 * @throws {Error} with descriptive message including both statuses
 *
 * @example
 *   // In an Express route:
 *   app.post('/api/bookings/:id/hold', async (req, res) => {
 *     const booking = await getBooking(req.params.id)
 *     try {
 *       assertTransition(booking.status, 'HELD')
 *     } catch (err) {
 *       return res.status(409).json({ success: false, error: err.message })
 *     }
 *     // ... proceed with HOLD logic
 *   })
 */
export function assertTransition(fromStatus, toStatus) {
    // Validate that both statuses are known
    if (!isValidStatus(fromStatus)) {
        throw new Error(`Unknown booking status: "${fromStatus}"`)
    }
    if (!isValidStatus(toStatus)) {
        throw new Error(`Unknown target status: "${toStatus}"`)
    }

    // Check if transition is allowed
    if (!canTransition(fromStatus, toStatus)) {
        const available = getAvailableTransitions(fromStatus)
        const hint = available.length > 0
            ? `Allowed transitions from ${fromStatus}: [${available.join(', ')}]`
            : `${fromStatus} is a terminal state — no transitions allowed`

        throw new Error(
            `Invalid status transition: ${fromStatus} → ${toStatus}. ${hint}`
        )
    }
}

/**
 * Check if a status is terminal (no outbound transitions).
 * Terminal states: TICKETED, CANCELLED, EXPIRED
 *
 * @param {string} status
 * @returns {boolean}
 *
 * @example
 *   isTerminal('TICKETED')   // true
 *   isTerminal('CANCELLED')  // true
 *   isTerminal('DRAFT')      // false
 */
export function isTerminal(status) {
    const allowed = VALID_TRANSITIONS[status]
    if (!allowed) return false // unknown status treated as non-terminal
    return allowed.length === 0
}

/**
 * Get the list of statuses that a booking can transition to from its current status.
 * Returns an empty array for terminal states or unknown statuses.
 *
 * @param {string} status - Current booking status
 * @returns {string[]} Array of valid target statuses
 *
 * @example
 *   getAvailableTransitions('DRAFT')     // ['HELD', 'CANCELLED']
 *   getAvailableTransitions('HELD')      // ['PENDING_PAYMENT', 'EXPIRED', 'CANCELLED']
 *   getAvailableTransitions('TICKETED')  // []
 */
export function getAvailableTransitions(status) {
    return VALID_TRANSITIONS[status] || []
}

/**
 * Get a human-readable label for a status.
 *
 * @param {string} status
 * @returns {string} Label or the raw status if unknown
 */
export function getStatusLabel(status) {
    return STATUS_LABELS[status] || status
}

/**
 * Check if editing passenger/itinerary data is allowed for the given status.
 * Only DRAFT bookings allow data modifications.
 *
 * @param {string} status
 * @returns {boolean}
 *
 * @example
 *   isEditable('DRAFT')     // true
 *   isEditable('HELD')      // false
 *   isEditable('CANCELLED') // false
 */
export function isEditable(status) {
    return status === STATUSES.DRAFT || status === STATUSES.HELD
}
