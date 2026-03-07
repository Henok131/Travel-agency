import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plane, Clock, ArrowRight, Luggage } from 'lucide-react'
import FlightSearchForm from '../components/FlightSearchForm'
import { useFlightProviderAvailable } from '../hooks/useFlightProviderAvailable'
import './Search.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(iso) {
    if (!iso) return '—'
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
    if (!match) return iso
    const h = match[1] || '0'
    const m = match[2] || '0'
    return `${h}h ${m}m`
}

function formatTime(isoDateTime) {
    if (!isoDateTime) return '—'
    const d = new Date(isoDateTime)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatDate(isoDateTime) {
    if (!isoDateTime) return ''
    const d = new Date(isoDateTime)
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' })
}

function stopsLabel(segments) {
    const stops = (segments?.length || 1) - 1
    if (stops === 0) return { text: 'Direct', cls: 'direct' }
    return { text: `${stops} stop${stops > 1 ? 's' : ''}`, cls: '' }
}

// ── Segment row ──────────────────────────────────────────────────────────────

function SegmentRow({ seg }) {
    return (
        <div className="offer-segment">
            <span className="seg-carrier">{seg.carrierCode}{seg.number}</span>
            <span className="seg-time">{formatTime(seg.departure?.at)}</span>
            <span className="offer-arrow">→</span>
            <span className="seg-time">{formatTime(seg.arrival?.at)}</span>
            <span>{seg.departure?.iataCode} → {seg.arrival?.iataCode}</span>
            <span>{formatDuration(seg.duration)}</span>
        </div>
    )
}

// ── Offer Card ───────────────────────────────────────────────────────────────

function OfferCard({ offer, rawOffer, onSelect, selecting }) {
    const itins = rawOffer?.itineraries || []
    const outbound = itins[0]
    const outSegs = outbound?.segments || []
    const firstSeg = outSegs[0] || {}
    const lastSeg = outSegs[outSegs.length - 1] || {}
    const stops = stopsLabel(outSegs)

    return (
        <div className="offer-card">
            <div className="offer-main">
                {/* Route headline */}
                <div className="offer-route">
                    <span className="offer-airline">{offer.airline || firstSeg.carrierCode || '??'}</span>
                    <span className="offer-airports">
                        {firstSeg.departure?.iataCode || '???'}
                    </span>
                    <span className="offer-arrow">→</span>
                    <span className="offer-airports">
                        {lastSeg.arrival?.iataCode || '???'}
                    </span>
                    <span className={`offer-stops ${stops.cls}`}>{stops.text}</span>
                </div>

                {/* Meta row */}
                <div className="offer-meta">
                    <span><Clock size={14} /> {formatDuration(outbound?.duration)}</span>
                    <span>{formatTime(firstSeg.departure?.at)} – {formatTime(lastSeg.arrival?.at)}</span>
                    <span>{formatDate(firstSeg.departure?.at)}</span>
                </div>

                {/* Segments detail */}
                {itins.map((itin, idx) => (
                    <div key={idx}>
                        {itins.length > 1 && (
                            <div className="itin-label">{idx === 0 ? 'Outbound' : 'Return'}</div>
                        )}
                        <div className="offer-segments">
                            {(itin.segments || []).map((seg, sIdx) => (
                                <SegmentRow key={sIdx} seg={seg} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Price + select */}
            <div className="offer-action">
                <div className="offer-price">
                    {Number(offer.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    <span className="currency">{offer.currency || 'EUR'}</span>
                </div>
                <button
                    className="offer-select-btn"
                    onClick={() => onSelect(rawOffer)}
                    disabled={selecting}
                >
                    {selecting ? 'Creating…' : 'Select'}
                </button>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEARCH PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function Search() {
    const navigate = useNavigate()
    const { flightProviderAvailable, loaded } = useFlightProviderAvailable()
    const [offers, setOffers] = useState([])
    const [rawOffers, setRawOffers] = useState([])
    const [loading, setLoading] = useState(false)
    const [selecting, setSelecting] = useState(false)
    const [error, setError] = useState(null)
    const [searched, setSearched] = useState(false)

    // ── Search handler (called by FlightSearchForm) ────────────────────────
    const handleSearch = useCallback(async (payload) => {
        if (!flightProviderAvailable) return
        setLoading(true)
        setError(null)
        setOffers([])
        setRawOffers([])
        setSearched(true)

        try {
            const res = await fetch(`${API}/api/amadeus/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const json = await res.json()
            if (!res.ok || !json.success) {
                throw new Error(json.error || `Search failed (${res.status})`)
            }
            if (json.message === 'Flight provider temporarily unavailable') {
                setError('Flight provider temporarily unavailable')
                setOffers([])
                setRawOffers([])
                return
            }

            const normalized = json.data?.offers || []
            setOffers(normalized)
            setRawOffers(normalized.map(o => o.offer))
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [flightProviderAvailable])

    // ── Select handler → create DRAFT booking → redirect ──────────────────
    const handleSelect = useCallback(async (rawOffer) => {
        setSelecting(true)
        setError(null)

        try {
            const res = await fetch(`${API}/api/search/select`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offer: rawOffer })
            })

            const json = await res.json()
            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to create booking')
            }

            // Redirect to booking detail page
            navigate(json.redirect || `/bookings/${json.bookingId}`)
        } catch (err) {
            setError(err.message)
            setSelecting(false)
        }
    }, [navigate])

    return (
        <div className="search-page">
            <h1>✈️ Flight Search</h1>
            <p className="subtitle">Find and compare flight offers</p>

            {/* Amadeus functionality disabled - no API keys configured */}
            <div className="search-error" role="alert" style={{ 
                marginBottom: '1rem', 
                padding: '1rem', 
                background: '#fee', 
                border: '1px solid #fcc',
                borderRadius: '8px'
            }}>
                ⚠️ Flight search is currently disabled. Amadeus API keys are not configured.
            </div>

            {/* FlightSearchForm disabled - Amadeus API keys not configured */}
            {/* <FlightSearchForm onSearch={handleSearch} disabled={!flightProviderAvailable} /> */}

            {/* Error banner */}
            {error && (
                <div className="search-error">
                    ⚠️ {error}
                </div>
            )}

            {/* Loading state */}
            {loading && (
                <div className="search-loading">
                    <div className="spinner" />
                    <span>Searching flights…</span>
                </div>
            )}

            {/* Results */}
            {!loading && searched && offers.length === 0 && !error && (
                <div className="search-status">
                    No flights found for your search. Try different dates or airports.
                </div>
            )}

            {!loading && offers.length > 0 && (
                <div>
                    <div className="search-status count">
                        {offers.length} offer{offers.length !== 1 ? 's' : ''} found
                    </div>
                    <div className="offers-grid">
                        {offers.map((offer, idx) => (
                            <OfferCard
                                key={offer.id || idx}
                                offer={offer}
                                rawOffer={rawOffers[idx]}
                                onSelect={handleSelect}
                                selecting={selecting}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
