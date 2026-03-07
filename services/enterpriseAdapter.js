/**
 * services/enterpriseAdapter.js
 *
 * Enterprise GDS Adapter — Amadeus SOAP Web Services implementation skeleton.
 * This is a placeholder for future Enterprise SOAP integration.
 *
 * All functions currently throw "not implemented" errors.
 * This adapter will be implemented when Enterprise SOAP integration is ready.
 */

import { enterpriseSessionManager } from './enterpriseSessionManager.js'

/**
 * Hold a booking (price + create flight order) via Enterprise SOAP.
 * 
 * @param {Object} booking - Booking object with offer and passenger data
 * @param {Object} config - Configuration object
 * @param {Function} config.soapClient - The SOAP client (future)
 * @param {Object} config.offer - Raw Amadeus offer
 * @param {Array} config.passengers - booking_passengers rows
 * @param {Object} config.contactInfo - { email, phone } override
 * @returns {Object} { pnr, orderId, expiresAt, priceSnapshot, rawResponse }
 */
export async function holdBooking(booking, config) {
  console.log('[EnterpriseAdapter] holdBooking called')
  
  // Ensure authenticated session
  await enterpriseSessionManager.ensureSession()
  
  // Increment sequence number for this request
  const sequence = enterpriseSessionManager.incrementSequence()
  
  // Build session header for SOAP request
  const header = enterpriseSessionManager.buildSessionHeader()
  
  // Log session details for debugging
  console.log('[EnterpriseAdapter] Session header:', JSON.stringify(header))
  console.log('[EnterpriseAdapter] Sequence number:', sequence)
  
  // TODO: Implement real SOAP Air_MultiAvailability or Air_SellFromRecommendation call
  throw new Error('Enterprise hold not implemented yet')
}

/**
 * Issue tickets for a held booking via Enterprise SOAP.
 * 
 * @param {Object} booking - Booking object with gds_order_id
 * @param {Object} config - Configuration object
 * @param {Function} config.soapClient - The SOAP client (future)
 * @param {Array} config.passengers - booking_passengers rows (for ticket mapping)
 * @returns {Object} { ticketMap, rawTicketNumbers, rawResponse }
 */
export async function issueBooking(booking, config) {
  console.log('[EnterpriseAdapter] issueBooking called')
  
  // Ensure authenticated session
  await enterpriseSessionManager.ensureSession()
  
  // Increment sequence number for this request
  const sequence = enterpriseSessionManager.incrementSequence()
  
  // Build session header for SOAP request
  const header = enterpriseSessionManager.buildSessionHeader()
  
  // Log session details for debugging
  console.log('[EnterpriseAdapter] Session header:', JSON.stringify(header))
  console.log('[EnterpriseAdapter] Sequence number:', sequence)
  
  // TODO: Implement real SOAP Ticket_ProcessETicket call
  throw new Error('Enterprise issue not implemented yet')
}

/**
 * Cancel a held booking via Enterprise SOAP.
 * 
 * @param {Object} booking - Booking object
 * @param {Object} config - Configuration object
 * @param {Function} config.soapClient - The SOAP client (future)
 * @returns {Object} Cancellation result
 */
export async function cancelBooking(booking, config) {
  console.log('[EnterpriseAdapter] cancelBooking called')
  
  // Ensure authenticated session
  await enterpriseSessionManager.ensureSession()
  
  // Increment sequence number for this request
  const sequence = enterpriseSessionManager.incrementSequence()
  
  // Build session header for SOAP request
  const header = enterpriseSessionManager.buildSessionHeader()
  
  // Log session details for debugging
  console.log('[EnterpriseAdapter] Session header:', JSON.stringify(header))
  console.log('[EnterpriseAdapter] Sequence number:', sequence)
  
  // TODO: Implement real SOAP Air_Cancel call
  throw new Error('Enterprise cancel not implemented yet')
}

/**
 * Price an offer via Enterprise SOAP.
 * 
 * @param {Object} offer - Raw GDS offer
 * @param {Object} config - Configuration object
 * @param {Function} config.soapClient - The SOAP client (future)
 * @returns {Object} { pricedOffer, pricingResponseId }
 */
export async function priceOffer(offer, config) {
  console.log('[EnterpriseAdapter] Called priceOffer')
  throw new Error('Enterprise adapter not implemented')
}

/**
 * Classify Enterprise SOAP errors into structured error types.
 * 
 * @param {Error} error - The error object from SOAP call
 * @returns {Object} { type: string, statusCode: number, message: string }
 */
export function classifyError(error) {
  console.log('[EnterpriseAdapter] Called classifyError')
  throw new Error('Enterprise adapter not implemented')
}
