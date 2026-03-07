import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import ActionBar from '../components/ActionBar'
import { useFlightProviderAvailable } from '../hooks/useFlightProviderAvailable'
import './BookingDetail.css'

/**
 * BookingDetail — Full booking detail page at /bookings/:id
 * Fetches booking data from GET /api/bookings/:id
 * Renders: status banner, itinerary, passengers, pricing, action bar, audit log
 */
export default function BookingDetail() {
    const { id } = useParams()
    const { flightProviderAvailable } = useFlightProviderAvailable()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Passenger editing state
    const [editedPassengers, setEditedPassengers] = useState([])
    const [isSaving, setIsSaving] = useState(false)

    // Offer expiration countdown state (must be declared before any conditional returns)
    const [offerCountdown, setOfferCountdown] = useState('')
    const [offerExpired, setOfferExpired] = useState(false)

    const fetchBooking = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const res = await fetch(`/api/bookings/${id}`)
            const json = await res.json()
            if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load booking')
            setData(json.data)
            setEditedPassengers(json.data.passengers || [])
        } catch (err) {
            console.error('BookingDetail fetch error:', err)
            const msg = err?.message || ''
            const isNetworkError = msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Load failed')
            setError(isNetworkError ? 'Unable to load booking. Check that the backend is running and VITE_API_URL is correct.' : msg)
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => { fetchBooking() }, [fetchBooking])

    // After any action, refetch to get updated status
    const handleAction = useCallback((action, result) => {
        fetchBooking()
    }, [fetchBooking])

    // ── Draft session expiration countdown effect ─────────────────────────────
    // Use draft_expires_at (15-minute controlled TTL) instead of lastTicketingDateTime
    // Repricing during HOLD is the source of truth for offer validity
    const draftExpiresAt = data?.booking?.draft_expires_at || null
    const bookingStatus = data?.booking?.status || null

    useEffect(() => {
        // Only show countdown for DRAFT bookings with draft_expires_at
        if (bookingStatus !== 'DRAFT' || !draftExpiresAt) {
            setOfferCountdown('')
            setOfferExpired(false)
            return
        }

        const updateCountdown = () => {
            const now = new Date()
            const expiry = new Date(draftExpiresAt)
            const diff = expiry - now

            if (diff <= 0) {
                setOfferCountdown('EXPIRED')
                setOfferExpired(true)
                return
            }

            const minutes = Math.floor(diff / 60000)
            const seconds = Math.floor((diff % 60000) / 1000)
            setOfferCountdown(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
            setOfferExpired(false)
        }

        updateCountdown()
        const interval = setInterval(updateCountdown, 1000)

        return () => clearInterval(interval)
    }, [draftExpiresAt, bookingStatus])

    // ─── Loading ───
    if (loading) {
        return (
            <div className="booking-detail">
                <div className="booking-detail__loading">
                    <div className="booking-detail__loading-spinner" />
                    <span>Loading booking…</span>
                </div>
            </div>
        )
    }

    // ─── Error ───
    if (error) {
        return (
            <div className="booking-detail">
                <Link to="/bookings" className="booking-detail__back">← Back to Bookings</Link>
                <div className="booking-detail__error">
                    <p>⚠️ {error}</p>
                    <button onClick={fetchBooking} style={{ marginTop: '0.75rem', padding: '6px 16px', cursor: 'pointer' }}>
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    if (!data) return null

    const { booking, passengers, flights, mainTable, offerJson, isEditable } = data

    // ── Extract itinerary data from offer_json (source of truth) ────────────
    let itineraryData = null
    if (offerJson) {
        console.log('📦 [BookingDetail] Using offer_json for itinerary data')
        console.log('📦 [BookingDetail] Offer ID:', offerJson.id)
        
        const firstItinerary = offerJson.itineraries?.[0]
        const firstSegment = firstItinerary?.segments?.[0]
        const lastSegment = firstItinerary?.segments?.[firstItinerary.segments.length - 1]
        
        // Check for return flight
        const returnItinerary = offerJson.itineraries?.[1]
        const returnSegment = returnItinerary?.segments?.[0]
        
        if (firstSegment) {
            itineraryData = {
                origin: firstSegment.departure?.iataCode,
                destination: lastSegment?.arrival?.iataCode || firstSegment.arrival?.iataCode,
                departureDate: firstSegment.departure?.at,
                returnDate: returnSegment?.departure?.at || null,
                airline: firstSegment.carrierCode,
                flightNumber: firstSegment.number,
                cabin: offerJson.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin,
                price: offerJson.price?.total,
                currency: offerJson.price?.currency,
                duration: firstItinerary.duration,
                segments: offerJson.itineraries?.flatMap(itin => itin.segments || []) || []
            }
            
            console.log('📦 [BookingDetail] Extracted itinerary:', {
                origin: itineraryData.origin,
                destination: itineraryData.destination,
                departureDate: itineraryData.departureDate,
                returnDate: itineraryData.returnDate,
                airline: itineraryData.airline
            })
        }
    }

    const formatDate = (d) => {
        if (!d) return '—'
        const dt = new Date(d)
        if (isNaN(dt)) return d
        return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    const formatDateTime = (d) => {
        if (!d) return '—'
        const dt = new Date(d)
        if (isNaN(dt)) return d
        return dt.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    const formatCurrency = (v, currency = 'EUR') => {
        if (!v && v !== 0) return '—'
        const n = parseFloat(v)
        if (isNaN(n)) return v
        if (isNaN(n)) return v
        return `${currency === 'EUR' ? '€' : currency + ' '}${n.toFixed(2)}`
    }

    const handlePassengerChange = (index, field, value) => {
        const updated = [...editedPassengers]
        updated[index] = { ...updated[index], [field]: value }
        setEditedPassengers(updated)
    }

    const savePassengers = async () => {
        try {
            setIsSaving(true)
            const res = await fetch(`/api/bookings/${id}/passengers`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passengers: editedPassengers })
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Update failed')

            await fetchBooking()
            alert('Passengers updated successfully')
        } catch (err) {
            alert(err.message)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="booking-detail">
            {/* Back Link */}
            <Link to="/bookings" className="booking-detail__back">← Back to Bookings</Link>

            {/* ───── Status Banner ───── */}
            <div className="booking-detail__banner">
                <div className="booking-detail__banner-left">
                    <h1 className="booking-detail__banner-title">
                        Booking {booking.gds_pnr || booking.id?.slice(0, 8)}
                    </h1>
                    <div className="booking-detail__banner-meta">
                        <span>Created: {formatDateTime(booking.created_at)}</span>
                        {booking.gds_pnr && <span>PNR: <strong>{booking.gds_pnr}</strong></span>}
                        {booking.gds_order_id && <span>Order: {booking.gds_order_id}</span>}
                    </div>
                </div>
                <StatusBadge status={booking.status} size="banner" />
            </div>

            {/* ───── Draft Session Countdown (DRAFT only) ───── */}
            {booking.status === 'DRAFT' && draftExpiresAt && (
                <div className={`booking-detail__offer-countdown ${offerExpired ? 'booking-detail__offer-countdown--expired' : ''}`}>
                    <span className="booking-detail__offer-countdown-icon">⏱</span>
                    {offerExpired ? (
                        <span><strong>Booking session expired</strong> — Please search for flights again</span>
                    ) : (
                        <span>Session expires in: <strong>{offerCountdown || '—'}</strong></span>
                    )}
                </div>
            )}

            {/* ───── Action Bar ───── */}
            <ActionBar 
                booking={booking} 
                onAction={handleAction}
                offerExpired={offerExpired}
                flightProviderAvailable={flightProviderAvailable}
            />

            {/* ───── Itinerary ───── */}
            <div className="booking-detail__card">
                <div className="booking-detail__card-header">
                    <span>✈️</span>
                    <h2 className="booking-detail__card-title">Itinerary</h2>
                </div>

                {/* Priority 1: Use offer_json (source of truth) */}
                {itineraryData ? (
                    <div className="itinerary-grid">
                        <div className="itinerary-item">
                            <span className="itinerary-label">From</span>
                            <span className="itinerary-value">{itineraryData.origin || '—'}</span>
                        </div>
                        <div className="itinerary-item">
                            <span className="itinerary-label">To</span>
                            <span className="itinerary-value">{itineraryData.destination || '—'}</span>
                        </div>
                        <div className="itinerary-item">
                            <span className="itinerary-label">Travel Date</span>
                            <span className="itinerary-value">{formatDateTime(itineraryData.departureDate)}</span>
                        </div>
                        {itineraryData.returnDate && (
                            <div className="itinerary-item">
                                <span className="itinerary-label">Return Date</span>
                                <span className="itinerary-value">{formatDateTime(itineraryData.returnDate)}</span>
                            </div>
                        )}
                        <div className="itinerary-item">
                            <span className="itinerary-label">Airline</span>
                            <span className="itinerary-value">{itineraryData.airline || '—'}</span>
                        </div>
                        {itineraryData.cabin && (
                            <div className="itinerary-item">
                                <span className="itinerary-label">Cabin</span>
                                <span className="itinerary-value">{itineraryData.cabin}</span>
                            </div>
                        )}
                        {itineraryData.duration && (
                            <div className="itinerary-item">
                                <span className="itinerary-label">Duration</span>
                                <span className="itinerary-value">{itineraryData.duration}</span>
                            </div>
                        )}
                        {/* Render all segments */}
                        {itineraryData.segments.length > 0 && (
                            <div style={{ gridColumn: '1 / -1', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>Flight Segments</h3>
                                {itineraryData.segments.map((seg, idx) => (
                                    <div key={idx} className="flight-segment" style={{ marginBottom: '0.75rem' }}>
                                        <div className="flight-segment__route">
                                            <span>{seg.departure?.iataCode}</span>
                                            <span className="flight-segment__route-arrow">→</span>
                                            <span>{seg.arrival?.iataCode}</span>
                                        </div>
                                        <div className="flight-segment__details">
                                            <span>✈ {seg.carrierCode} {seg.number}</span>
                                            <span>📅 {formatDateTime(seg.departure?.at)}</span>
                                            {seg.duration && <span>⏱ {seg.duration}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : flights.length > 0 ? (
                    /* Priority 2: Use booking_flights (for HELD/TICKETED bookings) */
                    flights.map((f, i) => (
                        <div key={f.id || i} className="flight-segment">
                            <div className="flight-segment__route">
                                <span>{f.departure_iata}</span>
                                <span className="flight-segment__route-arrow">→</span>
                                <span>{f.arrival_iata}</span>
                            </div>
                            <div className="flight-segment__details">
                                <span>✈ {f.carrier_code} {f.flight_number}</span>
                                <span>📅 {formatDateTime(f.departure_at)}</span>
                                {f.duration && <span>⏱ {f.duration}</span>}
                            </div>
                        </div>
                    ))
                ) : (
                    /* Fallback: Show message if no data available */
                    <div className="itinerary-grid">
                        <div className="itinerary-item">
                            <span className="itinerary-label">Status</span>
                            <span className="itinerary-value" style={{ color: 'var(--text-secondary, #888)', fontStyle: 'italic' }}>
                                No itinerary data available. Please select a flight.
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* ───── Passengers ───── */}
            <div className="booking-detail__card">
                <div className="booking-detail__card-header">
                    <span>👥</span>
                    <h2 className="booking-detail__card-title">Passengers</h2>
                    {!isEditable && <span className="booking-detail__lock-icon">🔒</span>}
                </div>

                {!isEditable && (
                    <span className="booking-detail__lock-msg">
                        Passenger data locked after reservation (HELD)
                    </span>
                )}

                {passengers.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="passengers-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>DOB</th>
                                    <th>Gender</th>
                                    <th>Passport</th>
                                    <th>Type</th>
                                    {booking.status === 'TICKETED' && <th>Ticket #</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {editedPassengers.map((p, idx) => (
                                    <tr key={p.id || idx}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            <input
                                                type="text"
                                                value={p.first_name || ''}
                                                disabled={!isEditable}
                                                onChange={(e) => handlePassengerChange(idx, 'first_name', e.target.value)}
                                                placeholder="First name"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                value={p.last_name || ''}
                                                disabled={!isEditable}
                                                onChange={(e) => handlePassengerChange(idx, 'last_name', e.target.value)}
                                                placeholder="Last name"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="date"
                                                value={p.dob || ''}
                                                disabled={!isEditable}
                                                onChange={(e) => handlePassengerChange(idx, 'dob', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                value={p.gender || ''}
                                                disabled={!isEditable}
                                                onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                                                placeholder="M/F"
                                                style={{ width: '60px' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                value={p.passport_number || ''}
                                                disabled={!isEditable}
                                                onChange={(e) => handlePassengerChange(idx, 'passport_number', e.target.value)}
                                                placeholder="Passport #"
                                            />
                                        </td>
                                        <td>{p.passenger_type || 'ADT'}</td>
                                        {booking.status === 'TICKETED' && <td>{p.ticket_number || '—'}</td>}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-secondary, #888)', fontStyle: 'italic' }}>
                        No passengers recorded yet.
                    </p>
                )}
                {isEditable && (
                    <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                        <button
                            onClick={savePassengers}
                            disabled={isSaving}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: isSaving ? 'wait' : 'pointer'
                            }}
                        >
                            {isSaving ? 'Saving...' : 'Save Passenger Changes'}
                        </button>
                    </div>
                )}
            </div>

            {/* ───── Pricing ───── */}
            <div className="booking-detail__card">
                <div className="booking-detail__card-header">
                    <span>💰</span>
                    <h2 className="booking-detail__card-title">Pricing</h2>
                </div>

                <div className="pricing-grid">
                    <div className="pricing-item">
                        <span className="pricing-label">Ticket Price</span>
                        <span className="pricing-value">
                            {formatCurrency(
                                itineraryData?.price || booking.total_price || mainTable?.total_ticket_price,
                                itineraryData?.currency || booking.currency
                            )}
                        </span>
                    </div>
                    {itineraryData?.price && (
                        <div className="pricing-item" style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #888)' }}>
                            <span className="pricing-label">Source</span>
                            <span className="pricing-value">From offer_json</span>
                        </div>
                    )}
                    {/* Service Fee and Total Due managed in Main Table only */}
                </div>

                {booking.price_snapshot_json && (
                    <details style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary, #888)' }}>
                        <summary style={{ cursor: 'pointer' }}>Price snapshot (debug)</summary>
                        <pre style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>
                            {JSON.stringify(booking.price_snapshot_json, null, 2)}
                        </pre>
                    </details>
                )}
            </div>

            {/* ───── Audit Log Placeholder ───── */}
            <div className="booking-detail__card">
                <div className="booking-detail__card-header">
                    <span>📋</span>
                    <h2 className="booking-detail__card-title">Activity Log</h2>
                </div>
                <div className="audit-log-placeholder">
                    Audit log coming soon — will track all status changes, user actions, and timestamps.
                </div>
            </div>
        </div>
    )
}
