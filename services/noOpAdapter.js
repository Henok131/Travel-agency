/**
 * services/noOpAdapter.js
 *
 * No-Op GDS Adapter — Used when ENV_PROVIDER === 'NONE'.
 * No Amadeus API calls are made. All operations throw or return
 * a consistent "Flight provider temporarily unavailable" response
 * so the backend can return 503 without attempting network calls.
 *
 * All code paths remain intact for easy reactivation via ENV_PROVIDER.
 */

const FLIGHT_PROVIDER_UNAVAILABLE = 'FLIGHT_PROVIDER_UNAVAILABLE'
const MESSAGE = 'Flight provider temporarily unavailable'

/**
 * @param {Error} [err]
 * @returns {Error}
 */
function createUnavailableError(err) {
  const e = err || new Error(MESSAGE)
  e.code = FLIGHT_PROVIDER_UNAVAILABLE
  e.type = FLIGHT_PROVIDER_UNAVAILABLE
  e.statusCode = 503
  return e
}

/**
 * Price an offer — no-op when provider is disabled.
 * @throws {Error} with type FLIGHT_PROVIDER_UNAVAILABLE
 */
export async function priceOffer() {
  throw createUnavailableError()
}

/**
 * Hold a booking — no-op when provider is disabled.
 * @throws {Error} with type FLIGHT_PROVIDER_UNAVAILABLE
 */
export async function holdBooking() {
  throw createUnavailableError()
}

/**
 * Issue tickets — no-op when provider is disabled.
 * @throws {Error} with type FLIGHT_PROVIDER_UNAVAILABLE
 */
export async function issueBooking() {
  throw createUnavailableError()
}

/**
 * Cancel a booking — no-op when provider is disabled.
 * @throws {Error} with type FLIGHT_PROVIDER_UNAVAILABLE
 */
export async function cancelBooking() {
  throw createUnavailableError()
}

/**
 * Classify errors when provider is disabled.
 * Returns a consistent structure so callers can send 503 without throwing.
 * @param {Error} error
 * @returns {{ type: string, statusCode: number, message: string }}
 */
export function classifyError(error) {
  return {
    type: FLIGHT_PROVIDER_UNAVAILABLE,
    statusCode: 503,
    message: error?.message || MESSAGE
  }
}

export { FLIGHT_PROVIDER_UNAVAILABLE, MESSAGE }
