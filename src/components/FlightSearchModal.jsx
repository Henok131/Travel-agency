import React, { useState } from 'react'
import { X, Clock3, ArrowRight, AlertCircle, Briefcase, RefreshCcw, Info, ChevronDown, Check, Backpack, Luggage, ShieldCheck, Ticket } from 'lucide-react'
import { getAirlineName, getAirlineLogo, getBaggageAllowance, getFareRules } from '../lib/airlines'

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

const formatTime = (value) => {
  if (!value) return ''
  if (value.length >= 16) return value.slice(11, 16)
  return value
}

const formatDateTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date).replace(',', '')
}

const durationToMinutes = (iso) => {
  if (!iso || typeof iso !== 'string') return null
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  const h = match?.[1] ? Number(match[1]) : 0
  const m = match?.[2] ? Number(match[2]) : 0
  if (!h && !m) return null
  return h * 60 + m
}

// --- SUB-COMPONENTS ---

const FlightDetailsExpanded = ({ flight, onSelect }) => {
  const offer = flight.offer || flight
  const itineraries = offer.itineraries || []
  const rules = flight.rules
  const totalPrice = Number(flight.price).toFixed(2)

  return (
    <div style={{ marginTop: 0, padding: 24, borderTop: '1px solid #e7e7e7', background: '#fafafa' }}>

      {itineraries.map((itin, itinIdx) => {
        const lastSeg = itin.segments[itin.segments.length - 1]
        const stops = itin.segments.length - 1
        return (
          <div key={itinIdx} style={{ marginBottom: 32 }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>
              Flight to {lastSeg.arrival.iataCode}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#595959', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`}</span>
              <span>·</span>
              <span>{formatDuration(itin.duration)}</span>
            </div>

            <div style={{ position: 'relative', paddingLeft: 12 }}>
              {/* Continuous Vertical Line */}
              <div style={{ position: 'absolute', left: 17, top: 8, bottom: 20, width: 2, background: '#e0e0e0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {itin.segments.map((seg, segIdx) => {
                  const nextSeg = itin.segments[segIdx + 1]
                  const isLast = segIdx === itin.segments.length - 1
                  const layoverTime = nextSeg ? durationToMinutes(nextSeg.departure.at) - durationToMinutes(seg.arrival.at) : 0
                  const airlineLogo = getAirlineLogo(seg.carrierCode)

                  return (
                    <div key={seg.id} style={{ position: 'relative' }}>

                      {/* Segment: Departure */}
                      <div style={{ marginBottom: 20, position: 'relative', display: 'flex', gap: 20 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fff', border: '2px solid #595959', position: 'absolute', left: 0, top: 4, zIndex: 2 }} />
                        <div style={{ minWidth: 20 }} />

                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                          {/* Time & Place */}
                          <div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', display: 'flex', alignItems: 'baseline', gap: 6 }}>
                              <span>{formatTime(seg.departure.at)}</span>
                              <span style={{ fontWeight: 400, color: '#595959' }}>·</span>
                              <span>{seg.departure.iataCode}</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#595959', marginTop: 2 }}>{formatDateTime(seg.departure.at)}</div>
                            <div style={{ fontSize: '0.85rem', color: '#595959' }}>{getAirlineName(seg.carrierCode)} Airport</div>
                          </div>

                          {/* Airline Info */}
                          {(segIdx === 0 || nextSeg?.carrierCode !== seg.carrierCode) && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                              <div style={{ width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img
                                  src={airlineLogo}
                                  alt={seg.carrierCode}
                                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                  onError={(e) => { e.target.style.display = 'none' }}
                                />
                              </div>
                              <div>
                                <div style={{ fontSize: '0.8rem', color: '#595959' }}>Flight {seg.number} · Economy</div>
                                <div style={{ fontSize: '0.8rem', color: '#595959' }}>Flight time {formatDuration(seg.duration)}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Segment: Arrival */}
                      <div style={{ marginBottom: isLast ? 0 : 20, position: 'relative', display: 'flex', gap: 20 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fff', border: '2px solid #595959', position: 'absolute', left: 0, top: 4, zIndex: 2 }} />
                        <div style={{ minWidth: 20 }} />

                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', display: 'flex', alignItems: 'baseline', gap: 6 }}>
                            <span>{formatTime(seg.arrival.at)}</span>
                            <span style={{ fontWeight: 400, color: '#595959' }}>·</span>
                            <span>{seg.arrival.iataCode}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#595959', marginTop: 2 }}>{formatDateTime(seg.arrival.at)}</div>
                          <div style={{ fontSize: '0.85rem', color: '#595959' }}>{getAirlineName(seg.carrierCode)} Airport</div>
                        </div>
                      </div>

                      {/* Layover Separation */}
                      {!isLast && (
                        <div style={{ margin: '16px 0 24px 44px', padding: '6px 12px', background: '#eef3f9', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <Clock3 size={14} color="#595959" />
                          <span style={{ fontSize: '0.85rem', color: '#595959', fontWeight: 500 }}>{Math.floor(layoverTime / 60)}h {layoverTime % 60}m layover</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}

      {/* Footer Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.5fr) 1fr', gap: 40, borderTop: '1px solid #e7e7e7', paddingTop: 24, marginTop: 24 }}>
        {/* Baggage */}
        <div>
          <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 12, color: '#1a1a1a' }}>Baggage</h4>
          <div style={{ fontSize: '0.85rem', color: '#595959', marginBottom: 16 }}>The total baggage included in the price</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <Backpack size={20} color="#444" strokeWidth={1.5} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1a1a' }}>1 personal item</div>
                  <div style={{ fontSize: '0.8rem', color: '#595959' }}>Fits under the seat in front of you</div>
                </div>
              </div>
              <span style={{ color: '#008009', fontWeight: 700, fontSize: '0.85rem' }}>Included</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <Luggage size={20} color="#444" strokeWidth={1.5} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1a1a' }}>1 carry-on bag</div>
                  <div style={{ fontSize: '0.8rem', color: '#595959' }}>Max weight 8 kg</div>
                </div>
              </div>
              <span style={{ color: '#008009', fontWeight: 700, fontSize: '0.85rem' }}>Included</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <Briefcase size={20} color="#444" strokeWidth={1.5} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1a1a' }}>{flight.tickets?.[0]?.baggage?.quantity || 1} checked bag</div>
                  <div style={{ fontSize: '0.8rem', color: '#595959' }}>Max weight 23 kg</div>
                </div>
              </div>
              <span style={{ color: '#008009', fontWeight: 700, fontSize: '0.85rem' }}>Included</span>
            </div>
          </div>
        </div>

        {/* Fare & Extras */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 12, color: '#1a1a1a' }}>Fare rules</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: '0.85rem', color: '#444' }}>
                <Ticket size={16} strokeWidth={1.5} /> <span>Change possible for a fee</span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: '0.85rem', color: '#444' }}>
                <Ticket size={16} strokeWidth={1.5} /> <span>Cancel for a fee</span>
              </div>
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 12, color: '#1a1a1a' }}>Extras you might like</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><RefreshCcw size={18} strokeWidth={1.5} /> Flexible ticket</div>
              <span style={{ fontSize: '0.8rem', color: '#595959' }}>See next steps</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, paddingTop: 16, borderTop: '1px solid #e7e7e7' }}>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>€{totalPrice}</div>
          <div style={{ fontSize: '0.8rem', color: '#595959' }}>Total per person</div>
        </div>
        <button onClick={onSelect} style={{ background: '#006ce4', color: 'white', border: 'none', padding: '12px 32px', borderRadius: 4, fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>
          Select
        </button>
      </div>

    </div>
  )
}

const FlightCard = ({ flight, isSelected, onSelect, onToggle, isExpanded }) => {
  const offer = flight.offer || flight
  const itineraries = offer.itineraries || []
  const price = Number(flight.price).toFixed(2)
  const isCheapest = flight.cheapest
  const isFlexible = true

  return (
    <div style={{ background: '#fff', border: '1px solid #e7e7e7', borderRadius: 8, marginBottom: 16, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      {/* Body */}
      <div style={{ padding: 16 }}>

        {/* Badges - Inline above rows */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          {isCheapest && <span style={{ background: '#008009', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '2px 6px', borderRadius: 2 }}>Cheapest</span>}
          {isFlexible && <span style={{ fontSize: '0.75rem', color: '#008009', fontWeight: 600 }}>Flexible ticket upgrade available</span>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Flight Rows */}
          <div style={{ flex: 1 }}>
            {itineraries.map((itin, idx) => {
              const segments = itin.segments
              const stops = segments.length - 1
              const duration = formatDuration(itin.duration)
              const logoUrl = getAirlineLogo(segments[0].carrierCode)

              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: idx !== itineraries.length - 1 ? 24 : 0 }}>
                  <img src={logoUrl} alt="" style={{ width: 40, height: 40, objectFit: 'contain', marginRight: 16 }} onError={(e) => e.target.style.display = 'none'} />

                  <div style={{ display: 'flex', flexDirection: 'column', width: 220 }}>
                    <div style={{ flexDirection: 'row', display: 'flex', gap: 8, alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a1a' }}>{formatTime(segments[0].departure.at)}</span>
                      <span style={{ color: '#595959', fontSize: '0.9rem' }}>—</span>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a1a' }}>{formatTime(segments[segments.length - 1].arrival.at)}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#595959' }}>
                      {segments[0].departure.iataCode}
                    </div>
                  </div>

                  {/* Duration & Stops - The "O----O" line */}
                  <div style={{ display: 'flex', alignItems: 'center', width: 140, flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.8rem', color: '#595959', marginBottom: 2 }}>{duration}</div>
                    <div style={{ position: 'relative', width: '100%', height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ position: 'absolute', width: '100%', height: 1, background: '#a2a2a2' }}></div>
                      <div style={{ position: 'absolute', left: 0, width: 6, height: 6, borderRadius: '50%', border: '1px solid #595959', background: '#fff' }}></div>
                      <div style={{ position: 'absolute', right: 0, width: 6, height: 6, borderRadius: '50%', border: '1px solid #595959', background: '#fff' }}></div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#595959', marginTop: 2 }}>
                      {stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Side: Price & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', marginLeft: 24, minWidth: 140 }}>

            <div style={{ display: 'flex', gap: 6, marginBottom: 16, alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1a1a1a' }}>Restricted</span>
              <Backpack size={16} color="#444" />
              <Luggage size={16} color="#444" />
              <div style={{ width: 16, height: 16, border: '1px dashed #ccc', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '10px', color: '#ccc' }}>+</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a1a1a', lineHeight: 1, marginBottom: 4 }}>€{price}</div>
              <div style={{ fontSize: '0.8rem', color: '#595959', marginBottom: 8 }}>Total price</div>
              <button
                onClick={() => onToggle(flight.id)}
                style={{
                  background: 'transparent',
                  border: '1px solid #006ce4',
                  color: '#006ce4',
                  padding: '8px 16px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.9rem'
                }}
              >
                {isExpanded ? 'Hide details' : 'View details'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && <FlightDetailsExpanded flight={flight} onSelect={onSelect} />}
    </div>
  )
}

export default function FlightSearchModal({
  open,
  onClose,
  results = [],
  loading,
  error,
  onSelectFlight,
  searchFrom,
  searchTo,
  searchDate,
  searchReturnDate
}) {
  const [expandedId, setExpandedId] = useState(null)

  // -- Sorting/Filtering State --
  const [sortKey, setSortKey] = useState('best')
  const [stopsFilter, setStopsFilter] = useState('any') // 'any', 'direct', 'onestop'
  const [selectedAirlines, setSelectedAirlines] = useState([]) // Empty = all

  if (!open) return null

  // 1. Normalize Results
  const normalizedResults = (results || []).map((flight, idx) => ({
    ...flight,
    // Ensure we have a consistent price number
    priceNum: Number(flight.price),
    // Resolve offer vs flat structure
    offer: flight.offer || flight
  }))

  // 2. Calculate Stats (before filtering, to show counts)
  // Stops Stats
  let stopsStats = {
    any: { count: 0, minPrice: Infinity },
    direct: { count: 0, minPrice: Infinity },
    onestop: { count: 0, minPrice: Infinity }
  }

  // Airlines Stats
  let airlineStats = {}

  normalizedResults.forEach(flight => {
    const price = flight.priceNum
    const segments = flight.offer.itineraries[0].segments
    const stopCount = segments.length - 1
    const carrier = segments[0].carrierCode
    const carrierName = getAirlineName(carrier)

    // Stops logic
    stopsStats.any.count++
    stopsStats.any.minPrice = Math.min(stopsStats.any.minPrice, price)

    if (stopCount === 0) {
      stopsStats.direct.count++
      stopsStats.direct.minPrice = Math.min(stopsStats.direct.minPrice, price)
    }
    if (stopCount <= 1) {
      stopsStats.onestop.count++
      stopsStats.onestop.minPrice = Math.min(stopsStats.onestop.minPrice, price)
    }

    // Airline logic
    if (!airlineStats[carrier]) {
      airlineStats[carrier] = { name: carrierName, code: carrier, count: 0, minPrice: Infinity }
    }
    airlineStats[carrier].count++
    airlineStats[carrier].minPrice = Math.min(airlineStats[carrier].minPrice, price)
  })

  // Convert airlineStats to array
  const airlineList = Object.values(airlineStats).sort((a, b) => b.count - a.count)


  // 3. Apply Filters
  const filteredResults = normalizedResults.filter(flight => {
    const segments = flight.offer.itineraries[0].segments
    const stopCount = segments.length - 1
    const carrier = segments[0].carrierCode

    // Stops
    if (stopsFilter === 'direct' && stopCount > 0) return false
    if (stopsFilter === 'onestop' && stopCount > 1) return false

    // Airlines
    if (selectedAirlines.length > 0 && !selectedAirlines.includes(carrier)) return false

    return true
  })

  // 4. Sort (basic mock sort implementation)
  const finalResults = [...filteredResults].sort((a, b) => {
    if (sortKey === 'cheapest') return a.priceNum - b.priceNum
    if (sortKey === 'fastest') {
      const durA = durationToMinutes(a.offer.itineraries[0].duration) || 0
      const durB = durationToMinutes(b.offer.itineraries[0].duration) || 0
      return durA - durB
    }
    return 0 // 'best' - default
  })

  // Tag "cheapest" for UI badge on the filtered view
  const displayResults = finalResults.map((f, i) => ({
    ...f,
    cheapest: i === 0 && sortKey === 'cheapest'
  }))


  // Handlers
  const toggleAirline = (code) => {
    setSelectedAirlines(prev => {
      if (prev.includes(code)) return prev.filter(c => c !== code)
      return [...prev, code]
    })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', justifyContent: 'center', alignItems: 'start',
      paddingTop: 40, paddingBottom: 40,
      overflowY: 'auto',
      backdropFilter: 'blur(2px)'
    }}>
      <div style={{
        width: '100%', maxWidth: 1000,
        background: '#f2f2f2',
        borderRadius: 8,
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        minHeight: '80vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}>

        {/* Header */}
        <div style={{ background: '#003b95', color: 'white', padding: '16px 24px', borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>Select your flight</h2>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: 4 }}>
              {searchFrom} to {searchTo} · {searchDate} {searchReturnDate ? ` - ${searchReturnDate}` : ''}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start' }}>

          {/* Sidebar Filters */}
          <div style={{ width: 260, padding: 24, borderRight: '1px solid #e7e7e7', background: 'white', minHeight: '80vh' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Filters</h3>
            <div style={{ fontSize: '0.85rem', color: '#595959', marginBottom: 24 }}>Showing {finalResults.length} results</div>

            {/* Stops Filter */}
            <div style={{ marginBottom: 24, borderBottom: '1px solid #e7e7e7', paddingBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12 }}>Stops</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Any */}
                <label style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', opacity: stopsStats.any.count === 0 ? 0.5 : 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <input type="radio" name="stops" checked={stopsFilter === 'any'} onChange={() => setStopsFilter('any')} style={{ marginTop: 3 }} />
                    <div>
                      <div style={{ fontSize: '0.9rem', color: '#1a1a1a' }}>Any</div>
                      <div style={{ fontSize: '0.8rem', color: '#595959', marginTop: 2 }}>From €{stopsStats.any.minPrice !== Infinity ? stopsStats.any.minPrice.toFixed(2) : '--'}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#595959' }}>{stopsStats.any.count}</div>
                </label>

                {/* Direct */}
                <label style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', opacity: stopsStats.direct.count === 0 ? 0.5 : 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <input type="radio" name="stops" checked={stopsFilter === 'direct'} onChange={() => setStopsFilter('direct')} disabled={stopsStats.direct.count === 0} style={{ marginTop: 3 }} />
                    <div>
                      <div style={{ fontSize: '0.9rem', color: '#1a1a1a' }}>Direct only</div>
                      {stopsStats.direct.count > 0 && <div style={{ fontSize: '0.8rem', color: '#595959', marginTop: 2 }}>From €{stopsStats.direct.minPrice.toFixed(2)}</div>}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#595959' }}>{stopsStats.direct.count}</div>
                </label>

                {/* 1 Stop Max */}
                <label style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', opacity: stopsStats.onestop.count === 0 ? 0.5 : 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <input type="radio" name="stops" checked={stopsFilter === 'onestop'} onChange={() => setStopsFilter('onestop')} disabled={stopsStats.onestop.count === 0} style={{ marginTop: 3 }} />
                    <div>
                      <div style={{ fontSize: '0.9rem', color: '#1a1a1a' }}>1 stop max</div>
                      {stopsStats.onestop.count > 0 && <div style={{ fontSize: '0.8rem', color: '#595959', marginTop: 2 }}>From €{stopsStats.onestop.minPrice.toFixed(2)}</div>}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#595959' }}>{stopsStats.onestop.count}</div>
                </label>
              </div>
            </div>

            {/* Airlines Filter */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12 }}>Airlines</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {airlineList.map(item => (
                  <label key={item.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedAirlines.length === 0 || selectedAirlines.includes(item.code)}
                        onChange={() => toggleAirline(item.code)}
                      />
                      <span style={{ fontSize: '0.9rem', color: '#1a1a1a' }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#595959' }}>{item.count}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, padding: 24 }}>

            {/* Tabs */}
            <div style={{ display: 'flex', background: 'white', border: '1px solid #e7e7e7', borderRadius: 4, marginBottom: 24 }}>
              {['Best', 'Cheapest', 'Fastest'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setSortKey(tab.toLowerCase())}
                  style={{
                    flex: 1, padding: '12px', background: 'transparent', border: 'none',
                    borderBottom: sortKey === tab.toLowerCase() ? '3px solid #006ce4' : '3px solid transparent',
                    color: sortKey === tab.toLowerCase() ? '#006ce4' : '#1a1a1a',
                    fontWeight: sortKey === tab.toLowerCase() ? 700 : 400,
                    cursor: 'pointer'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {loading && <div style={{ padding: 40, textAlign: 'center' }}>Searching flights...</div>}

            {!loading && displayResults.map((flight) => (
              <FlightCard
                key={flight.id || flight.offer?.id}
                flight={flight}
                isExpanded={expandedId === (flight.id || flight.offer?.id)}
                onToggle={(id) => setExpandedId(prev => prev === id ? null : id)}
                onSelect={() => onSelectFlight?.(flight)}
              />
            ))}

            {!loading && displayResults.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: '#595959' }}>
                No flights found matching your filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
