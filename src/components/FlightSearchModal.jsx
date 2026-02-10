import { useMemo, useState, useEffect } from 'react'
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

const durationToMinutes = (iso) => {
  if (!iso || typeof iso !== 'string') return null
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  const h = match?.[1] ? Number(match[1]) : 0
  const m = match?.[2] ? Number(match[2]) : 0
  if (!h && !m) return null
  return h * 60 + m
}

const countStops = (offer) => {
  const segments = offer?.itineraries?.[0]?.segments || []
  return Math.max(0, segments.length - 1)
}

const bestScore = (flight, minPrice, maxPrice, maxDuration) => {
  const price = Number(flight.price) || maxPrice || 0
  const duration = flight.durationMinutes || maxDuration || 0
  const stops = flight.stops ?? 0

  const priceNorm = maxPrice && maxPrice !== minPrice ? (price - minPrice) / (maxPrice - minPrice) : 0
  const durationNorm = maxDuration ? duration / maxDuration : 0
  const stopsNorm = Math.min(stops / 2, 1) // 0 direct, 0.5 one stop, 1 multi

  // Lower is better, so invert
  const score = (priceNorm * 0.5 + durationNorm * 0.3 + stopsNorm * 0.2)
  return score
}

const FlightCard = ({ flight, isSelected, onSelect, onHold }) => {
  const offer = flight?.offer || {}
  const itineraries = offer?.itineraries || []
  const firstItin = itineraries[0]
  const firstSeg = firstItin?.segments?.[0]
  const lastItin = itineraries[itineraries.length - 1]
  const lastSeg = lastItin?.segments?.[lastItin?.segments?.length - 1]
  const departTime = formatTime(firstSeg?.departure?.at)
  const arriveTime = formatTime(lastSeg?.arrival?.at)
  const departAirport = firstSeg?.departure?.iataCode || ''
  const arriveAirport = lastSeg?.arrival?.iataCode || ''
  const duration = formatDuration(firstItin?.duration)
  const stops = Math.max(0, (firstItin?.segments?.length || 1) - 1)

  const carrierCodes = Array.from(
    new Set(
      itineraries.flatMap((it) => (it.segments || []).map((seg) => seg.carrierCode).filter(Boolean))
    )
  )
  const stopsInfo = getStopsLabel(offer)

  return (
    <div
      onClick={onSelect}
      style={{
        background: '#111a2c',
        border: isSelected ? '1px solid #2563eb' : '1px solid #1f2a4d',
        borderRadius: 14,
        padding: '16px 18px',
        color: '#e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        cursor: 'pointer',
        boxShadow: isSelected ? '0 16px 32px rgba(37,99,235,0.25)' : '0 12px 28px rgba(0,0,0,0.25)',
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
      {/* Header: price + actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {carrierCodes.map((code) => (
            <div key={code} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: '#0f172a', borderRadius: 8, border: '1px solid #1f2a4d' }}>
              <img
                src={`https://content.airhex.com/content/logos/airlines_${code}_200_200_s.png?proportions=keep`}
                alt={code}
                style={{ width: 28, height: 28, objectFit: 'contain' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <span style={{ color: '#d1d5db', fontSize: '0.9rem', fontWeight: 600 }}>{code}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {flight?.currency || 'EUR'} {parseFloat(flight?.price || 0).toFixed(0)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>per person</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
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
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onHold()
              }}
              className="button button-secondary"
              style={{ whiteSpace: 'nowrap' }}
            >
              Hold / Reserve
            </button>
          </div>
        </div>
      </div>

      {/* Route row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontWeight: 800, fontSize: '1.4rem' }}>{departAirport || '---'}</div>
          <div style={{ fontSize: '0.95rem', color: '#9ca3af' }}>{departTime || '--:--'}</div>
        </div>
        <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <span style={{ height: 1, flex: 1, background: '#24335c' }} />
            {stops === 0 ? (
              <span style={{ padding: '4px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 700 }}>Direct</span>
            ) : (
              <span style={{ padding: '4px 10px', borderRadius: 20, background: 'rgba(251,191,36,0.15)', color: '#fbbf24', fontWeight: 700 }}>
                {stops} stop{stops > 1 ? 's' : ''}
              </span>
            )}
            <span style={{ height: 1, flex: 1, background: '#24335c' }} />
          </div>
          <div style={{ marginTop: 6 }}>
            <Clock3 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            <span>{duration || '—'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
          <div style={{ fontWeight: 800, fontSize: '1.4rem' }}>{arriveAirport || '---'}</div>
          <div style={{ fontSize: '0.95rem', color: '#9ca3af' }}>{arriveTime || '--:--'}</div>
        </div>
      </div>

      {/* Date + metadata */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', color: '#9ca3af', fontSize: '0.9rem' }}>
        <div>{formatDate(firstSeg?.departure?.at) || formatDate(flight?.date)}</div>
        {offer?.price?.grandTotal && (
          <div>Offer total: {flight?.currency || offer?.price?.currency || 'EUR'} {offer?.price?.grandTotal}</div>
        )}
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
  searchReturnDate,
  onHold
}) {
  const [selectedId, setSelectedId] = useState(null)
  const [sortKey, setSortKey] = useState('best')
  const [stopsFilter, setStopsFilter] = useState('any') // any | direct | onestop
  const [airlineFilter, setAirlineFilter] = useState([])
  const [priceRange, setPriceRange] = useState([0, 0])
  const [durationLimit, setDurationLimit] = useState(null)

  const headerLabel = useMemo(() => {
    const datePart = searchReturnDate ? `${searchDate} → ${searchReturnDate}` : searchDate
    return `${searchFrom || ''} → ${searchTo || ''} • ${datePart || ''}`
  }, [searchFrom, searchTo, searchDate, searchReturnDate])

  const enrichedResults = useMemo(() => {
    return (results || []).map((flight) => {
      const offer = flight.offer || {}
      const durationMinutes = flight.durationMinutes || durationToMinutes(offer?.itineraries?.[0]?.duration)
      const stops = flight.stops ?? countStops(offer)
      const price = Number(flight.price) || Number(offer?.price?.total) || 0
      const airline = flight.airline || offer?.itineraries?.[0]?.segments?.[0]?.carrierCode || 'Unknown'
      return { ...flight, durationMinutes, stops, price, airline }
    })
  }, [results])

  const minPrice = useMemo(() => enrichedResults.reduce((min, f) => f.price < min ? f.price : min, Number.POSITIVE_INFINITY), [enrichedResults]) || 0
  const maxPrice = useMemo(() => enrichedResults.reduce((max, f) => f.price > max ? f.price : max, 0), [enrichedResults]) || 0
  const maxDuration = useMemo(() => enrichedResults.reduce((max, f) => f.durationMinutes && f.durationMinutes > max ? f.durationMinutes : max, 0), [enrichedResults]) || 0
  const airlines = useMemo(() => Array.from(new Set(enrichedResults.map(f => f.airline || 'Unknown'))).sort(), [enrichedResults])

  useEffect(() => {
    // initialize ranges when results change
    if (enrichedResults.length > 0) {
      setPriceRange([minPrice || 0, maxPrice || 0])
      setDurationLimit(maxDuration || null)
    }
  }, [enrichedResults, minPrice, maxPrice, maxDuration])

  const filteredSorted = useMemo(() => {
    let list = enrichedResults

    // stops filter
    if (stopsFilter === 'direct') list = list.filter((f) => (f.stops ?? 0) === 0)
    if (stopsFilter === 'onestop') list = list.filter((f) => (f.stops ?? 0) <= 1)

    // airline filter
    if (airlineFilter.length > 0) {
      const set = new Set(airlineFilter)
      list = list.filter((f) => set.has(f.airline))
    }

    // price filter
    const [minP, maxP] = priceRange
    list = list.filter((f) => (f.price ?? 0) >= (minP ?? 0) && (f.price ?? 0) <= (maxP ?? Number.POSITIVE_INFINITY))

    // duration filter
    if (durationLimit) {
      list = list.filter((f) => !f.durationMinutes || f.durationMinutes <= durationLimit)
    }

    // sort
    if (sortKey === 'cheapest') {
      list = [...list].sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (sortKey === 'fastest') {
      list = [...list].sort((a, b) => (a.durationMinutes || Number.MAX_VALUE) - (b.durationMinutes || Number.MAX_VALUE))
    } else {
      // best
      list = [...list].sort((a, b) => bestScore(a, minPrice, maxPrice, maxDuration) - bestScore(b, minPrice, maxPrice, maxDuration))
    }

    return list
  }, [enrichedResults, sortKey, stopsFilter, airlineFilter, priceRange, durationLimit, minPrice, maxPrice, maxDuration])

  const toggleAirline = (code) => {
    setAirlineFilter((prev) => prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code])
  }

  const handlePriceChange = (which, value) => {
    setPriceRange((prev) => {
      const next = [...prev]
      next[which === 'min' ? 0 : 1] = Number(value)
      return next
    })
  }

  const handleDurationChange = (value) => {
    setDurationLimit(Number(value))
  }

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
          {/* Top filter bar */}
          {!loading && !error && enrichedResults.length > 0 && (
            <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {['best', 'cheapest', 'fastest'].map((key) => {
                const labels = { best: 'Best', cheapest: 'Cheapest', fastest: 'Fastest' }
                const active = sortKey === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSortKey(key)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: active ? '1px solid #2563eb' : '1px solid #1f2a4d',
                      background: active ? 'rgba(37,99,235,0.15)' : '#111827',
                      color: '#e5e7eb',
                      cursor: 'pointer'
                    }}
                  >
                    {labels[key]}
                  </button>
                )
              })}
            </div>
          )}

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

          {!loading && !error && enrichedResults.length > 0 && (
            <div style={{ display: 'flex', gap: 16 }}>
              {/* Side filters */}
              <div style={{ width: 240, minWidth: 200, background: '#111827', border: '1px solid #1f2a4d', borderRadius: 10, padding: 10, color: '#e5e7eb' }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Filters</div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Stops</div>
                  {[
                    { key: 'any', label: 'Any' },
                    { key: 'direct', label: 'Direct only' },
                    { key: 'onestop', label: '1 stop max' }
                  ].map((opt) => (
                    <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="stops"
                        value={opt.key}
                        checked={stopsFilter === opt.key}
                        onChange={() => setStopsFilter(opt.key)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Airlines</div>
                  {airlines.map((air) => (
                    <label key={air} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={airlineFilter.includes(air)}
                        onChange={() => toggleAirline(air)}
                      />
                      {air}
                    </label>
                  ))}
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Price range</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="number"
                      value={priceRange[0] ?? 0}
                      onChange={(e) => handlePriceChange('min', e.target.value)}
                      style={{ flex: 1, background: '#0f172a', color: '#e5e7eb', border: '1px solid #1f2a4d', borderRadius: 6, padding: 6 }}
                    />
                    <input
                      type="number"
                      value={priceRange[1] ?? 0}
                      onChange={(e) => handlePriceChange('max', e.target.value)}
                      style={{ flex: 1, background: '#0f172a', color: '#e5e7eb', border: '1px solid #1f2a4d', borderRadius: 6, padding: 6 }}
                    />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: 4 }}>
                    Min: {minPrice || 0} · Max: {maxPrice || 0}
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Duration (max minutes)</div>
                  <input
                    type="number"
                    value={durationLimit || ''}
                    placeholder={maxDuration ? String(maxDuration) : ''}
                    onChange={(e) => handleDurationChange(e.target.value || maxDuration)}
                    style={{ width: '100%', background: '#0f172a', color: '#e5e7eb', border: '1px solid #1f2a4d', borderRadius: 6, padding: 6 }}
                  />
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: 4 }}>
                    Current max: {durationLimit || maxDuration || '—'} min
                  </div>
                </div>
              </div>

              {/* Results list */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredSorted.map((flight) => (
                  <FlightCard
                    key={flight.id || flight.offer?.id}
                    flight={flight}
                    isSelected={selectedId === (flight.id || flight.offer?.id)}
                    onSelect={() => {
                      setSelectedId(flight.id || flight.offer?.id || null)
                      onSelectFlight?.(flight)
                    }}
                    onHold={() => {
                      setSelectedId(flight.id || flight.offer?.id || null)
                      onHold?.(flight)
                    }}
                  />
                ))}
                {filteredSorted.length === 0 && (
                  <div style={{ color: '#9ca3af', textAlign: 'center', padding: 20 }}>No flights match the selected filters.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
