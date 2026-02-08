import { useMemo, useState } from 'react'
import { X, Clock3, MapPin, ArrowRight, AlertCircle } from 'lucide-react'

const formatDuration = (iso) => {
  if (!iso || typeof iso !== 'string') return ''
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  const h = match?.[1] ? Number(match[1]) : 0
  const m = match?.[2] ? Number(match[2]) : 0
  if (!h && !m) return ''
  if (h && m) return `${h}h ${m}m`
  if (h) return `${h}h`
  return `${m}m`
}

const getStopsLabel = (offer) => {
  const segments = offer?.itineraries?.[0]?.segments || []
  const stops = Math.max(0, segments.length - 1)
  if (stops === 0) return { label: 'Direct', tone: 'success' }
  if (stops === 1) return { label: '1 stop', tone: 'warn' }
  return { label: `${stops} stops`, tone: 'warn' }
}

const formatTime = (value) => {
  if (!value) return ''
  if (value.length >= 16) return value.slice(11, 16) // 2026-02-10T08:30:00 => 08:30
  return value
}

const formatDate = (value) => {
  if (!value) return ''
  return value.slice(0, 10)
}

const FlightCard = ({ flight, isSelected, onSelect }) => {
  const offer = flight?.offer || {}
  const firstSeg = offer?.itineraries?.[0]?.segments?.[0]
  const lastItin = offer?.itineraries?.[offer?.itineraries?.length - 1]
  const lastSeg = lastItin?.segments?.[lastItin?.segments?.length - 1]
  const departTime = flight?.depart || formatTime(firstSeg?.departure?.at)
  const arriveTime = flight?.arrive || formatTime(lastSeg?.arrival?.at)
  const departAirport = flight?.from || firstSeg?.departure?.iataCode
  const arriveAirport = flight?.to || lastSeg?.arrival?.iataCode
  const duration = flight?.duration || formatDuration(offer?.itineraries?.[0]?.duration)
  const stopsInfo = getStopsLabel(offer)

  return (
    <div
      onClick={onSelect}
      style={{
        background: '#16213e',
        border: isSelected ? '1px solid #2563eb' : '1px solid #1f2a4d',
        borderRadius: 12,
        padding: '14px',
        color: '#e5e7eb',
        display: 'grid',
        gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr',
        gap: '12px',
        alignItems: 'center',
        cursor: 'pointer',
        boxShadow: isSelected ? '0 12px 30px rgba(37,99,235,0.25)' : '0 8px 20px rgba(0,0,0,0.25)',
        transition: 'border 0.2s ease, transform 0.2s ease',
        transform: isSelected ? 'translateY(-2px)' : 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#2563eb'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isSelected ? '#2563eb' : '#1f2a4d'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: '#111827',
            display: 'grid',
            placeItems: 'center',
            color: '#60a5fa',
            fontWeight: 700
          }}
        >
          {(flight?.airline || '').slice(0, 2) || 'A'}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            {flight?.airline || 'Airline'} {flight?.flightNumber || offer?.id || ''}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
            {formatDate(firstSeg?.departure?.at) || formatDate(flight?.date)}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div>
          <div style={{ fontWeight: 700 }}>{departTime || '--:--'}</div>
          <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>{departAirport || '---'}</div>
        </div>
        <ArrowRight size={16} color="#9ca3af" />
        <div>
          <div style={{ fontWeight: 700 }}>{arriveTime || '--:--'}</div>
          <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>{arriveAirport || '---'}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af' }}>
        <Clock3 size={16} />
        <span>{duration || '—'}</span>
      </div>

      <div
        style={{
          padding: '6px 10px',
          borderRadius: 20,
          fontWeight: 600,
          color: stopsInfo.tone === 'success' ? '#10b981' : '#fbbf24',
          background: stopsInfo.tone === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(251,191,36,0.12)',
          justifySelf: 'flex-start'
        }}
      >
        {stopsInfo.label}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
        <div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
            {flight?.currency || 'EUR'} {parseFloat(flight?.price || 0).toFixed(0)}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>per person</div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
          className="button button-primary"
          style={{ whiteSpace: 'nowrap' }}
        >
          Select Flight
        </button>
      </div>
    </div>
  )
}

export default function FlightSearchModal({
  open,
  onClose,
  results = [],
  loading,
  error,
  onRetry,
  onSelectFlight,
  searchFrom,
  searchTo,
  searchDate,
  searchReturnDate
}) {
  const [selectedId, setSelectedId] = useState(null)

  const headerLabel = useMemo(() => {
    const datePart = searchReturnDate ? `${searchDate} → ${searchReturnDate}` : searchDate
    return `${searchFrom || ''} → ${searchTo || ''} • ${datePart || ''}`
  }, [searchFrom, searchTo, searchDate, searchReturnDate])

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(1200px, 95vw)',
          maxHeight: '85vh',
          background: '#1a1a2e',
          border: '1px solid #1f2a4d',
          borderRadius: 14,
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid #1f2a4d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#e5e7eb'
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>Flight offers</div>
            <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>{headerLabel}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '14px', overflowY: 'auto', flex: 1, background: '#0f172a' }}>
          {loading && (
            <div style={{ textAlign: 'center', color: '#e5e7eb', padding: '30px 0' }}>
              <div className="spinner" style={{ marginBottom: 12 }} />
              Searching flights...
            </div>
          )}

          {!loading && error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.35)',
                color: '#fecdd3',
                borderRadius: 10,
                padding: 12,
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <AlertCircle size={18} />
              <span style={{ flex: 1 }}>Search failed: {error}</span>
              {onRetry && (
                <button type="button" className="button button-secondary" onClick={onRetry}>
                  Retry
                </button>
              )}
            </div>
          )}

          {!loading && !error && (!results || results.length === 0) && (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '30px 0' }}>No flights found</div>
          )}

          {!loading && !error && results && results.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {results.map((flight) => (
                <FlightCard
                  key={flight.id || flight.offer?.id}
                  flight={flight}
                  isSelected={selectedId === (flight.id || flight.offer?.id)}
                  onSelect={() => {
                    setSelectedId(flight.id || flight.offer?.id || null)
                    onSelectFlight?.(flight)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
