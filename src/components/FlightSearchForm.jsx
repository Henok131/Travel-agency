import { useState, useMemo, useRef, useEffect } from 'react'
import { ArrowLeftRight, Users, CalendarRange, Search, Plane } from 'lucide-react'
import AirportAutocomplete from './AirportAutocomplete'

const todayIso = () => new Date().toISOString().slice(0, 10)

const TRIP_TYPES = [
  { value: 'roundtrip', label: 'Round-trip' },
  { value: 'oneway', label: 'One-way' },
  { value: 'multicity', label: 'Multi-city' }
]

const CABIN_CLASSES = [
  { value: 'ECONOMY', label: 'Economy' },
  { value: 'PREMIUM_ECONOMY', label: 'Premium Economy' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'FIRST', label: 'First' }
]

const buildLeg = () => ({
  from: '',
  to: '',
  date: todayIso()
})

export default function FlightSearchForm({ onSearch }) {
  const [tripType, setTripType] = useState('roundtrip')
  const [travelClass, setTravelClass] = useState('ECONOMY')
  const [directOnly, setDirectOnly] = useState(false)
  const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 })
  const [route, setRoute] = useState({
    from: 'MUC',
    to: 'IST',
    departureDate: todayIso(),
    returnDate: ''
  })
  const [legs, setLegs] = useState([buildLeg(), buildLeg()])
  const totalPax = useMemo(() => passengers.adults + passengers.children + passengers.infants, [passengers])
  const [errors, setErrors] = useState({})

  const updatePassengers = (key, delta) => {
    setPassengers((prev) => {
      const limits = {
        adults: { min: 1, max: 9 },
        children: { min: 0, max: 8 },
        infants: { min: 0, max: 2 }
      }
      const next = Math.min(Math.max((prev[key] || 0) + delta, limits[key].min), limits[key].max)
      const updated = { ...prev, [key]: next }
      if (key === 'adults' && updated.infants > next) {
        updated.infants = next
      }
      return updated
    })
  }

  const swapRoute = () => {
    setRoute((prev) => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }))
  }

  const updateLegField = (index, field, value) => {
    setLegs((prev) => prev.map((leg, i) => (i === index ? { ...leg, [field]: value } : leg)))
  }

  const addLeg = () => {
    setLegs((prev) => (prev.length >= 4 ? prev : [...prev, buildLeg()]))
  }

  const removeLeg = (index) => {
    setLegs((prev) => prev.filter((_, i) => i !== index))
  }

  const validate = () => {
    const nextErrors = {}
    if (!route.from) nextErrors.from = 'From is required'
    if (!route.to) nextErrors.to = 'To is required'
    if (!route.departureDate) nextErrors.departureDate = 'Departure date is required'
    if (tripType === 'roundtrip' && !route.returnDate) nextErrors.returnDate = 'Return date is required'
    if (tripType === 'roundtrip' && route.returnDate && route.returnDate < route.departureDate) {
      nextErrors.returnDate = 'Return must be after departure'
    }
    if (passengers.infants > passengers.adults) {
      nextErrors.passengers = 'Infants cannot exceed adults'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      originLocationCode: route.from,
      destinationLocationCode: route.to,
      departureDate: route.departureDate,
      returnDate: tripType === 'roundtrip' ? route.returnDate : undefined,
      travelClass,
      nonStop: directOnly,
      adults: passengers.adults,
      children: passengers.children,
      infants: passengers.infants,
      currencyCode: 'EUR',
      tripType,
      legs: tripType === 'multicity' ? legs : undefined
    }

    onSearch?.(payload)
  }

  const labelStyle = { fontSize: '0.8rem', color: '#fff', marginBottom: 4, display: 'block' }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #24335c',
    background: '#0f172a',
    color: '#e5e7eb'
  }

  const counterBtnStyle = (disabled) => ({
    width: 28,
    height: 28,
    borderRadius: 8,
    border: '1px solid #24335c',
    background: disabled ? '#1f2937' : '#1e3a8a',
    color: disabled ? '#6b7280' : '#e5e7eb',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'grid',
    placeItems: 'center'
  })

  const gradientButton = {
    background: '#0071c2',
    color: '#fff',
    border: '1px solid #005b99',
    borderRadius: '6px',
    padding: '12px 18px',
    width: 160,
    fontWeight: 700,
    display: 'inline-flex',
    gap: '10px',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(0,113,194,0.35)'
  }

  const [paxOpen, setPaxOpen] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const paxRef = useRef(null)

  const radioStyle = {
    width: 18,
    height: 18,
    accentColor: '#0071c2',
    background: '#fff',
    borderRadius: '50%',
    border: '1px solid #d1d5db'
  }

  const checkboxStyle = {
    width: 18,
    height: 18,
    accentColor: '#0071c2',
    background: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: 4
  }

  const paxSummary = `${passengers.adults} Adult${passengers.adults > 1 ? 's' : ''}${passengers.children ? `, ${passengers.children} Child` : ''}${passengers.infants ? `, ${passengers.infants} Infant` : ''} · ${CABIN_CLASSES.find((c) => c.value === travelClass)?.label || 'Economy'}`

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!paxRef.current) return
      if (!paxRef.current.contains(e.target)) {
        setPaxOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: '#0f172a',
        border: '1px solid #febb02',
        borderRadius: 8,
        padding: '10px 10px 6px',
        color: '#e5e7eb',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)'
      }}
    >
      {/* Row 1: controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {TRIP_TYPES.map((type) => (
            <label key={type.value} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.9rem', color: '#fff' }}>
              <input
                type="radio"
                name="tripType"
                value={type.value}
                checked={tripType === type.value}
                onChange={() => setTripType(type.value)}
                style={radioStyle}
              />
              {type.label}
            </label>
          ))}
        </div>

        <div>
          <select
            value={travelClass}
            onChange={(e) => setTravelClass(e.target.value)}
            style={{
              ...inputStyle,
              height: 40,
              padding: '8px 10px',
              minWidth: 140
            }}
          >
            {CABIN_CLASSES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.9rem', color: '#fff' }}>
          <input type="checkbox" checked={directOnly} onChange={(e) => setDirectOnly(e.target.checked)} style={checkboxStyle} />
          Direct flights only
        </label>
      </div>

      {/* Row 2: search bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'stretch',
          background: '#111827',
          border: '1px solid #febb02',
          borderRadius: 8,
          padding: 6
        }}
      >
        <div style={{ flex: '2 1 460px', minWidth: 420, width: '100%' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 48px 1fr',
              alignItems: 'center',
              gap: 8,
              width: '100%'
            }}
          >
            <div>
              <label style={labelStyle}>Leaving from</label>
              <AirportAutocomplete
                value={route.from}
                onChange={(val) => setRoute((prev) => ({ ...prev, from: val }))}
                placeholder="City or airport"
              />
              {errors.from && <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: 4 }}>{errors.from}</div>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>
              <button
                type="button"
                onClick={swapRoute}
                title="Swap"
                style={{ ...counterBtnStyle(false), width: 38, height: 38, marginBottom: 0, alignSelf: 'center' }}
              >
                <ArrowLeftRight size={18} />
              </button>
            </div>

            <div>
              <label style={labelStyle}>Going to</label>
              <AirportAutocomplete
                value={route.to}
                onChange={(val) => setRoute((prev) => ({ ...prev, to: val }))}
                placeholder="City or airport"
              />
              {errors.to && <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: 4 }}>{errors.to}</div>}
            </div>
          </div>
        </div>

        <div style={{ flex: '1 1 220px', minWidth: 200 }}>
          <label style={labelStyle}>{tripType === 'oneway' ? 'Travel date' : 'Travel dates'}</label>
          <div style={{ position: 'relative' }}>
            <CalendarRange size={16} style={{ position: 'absolute', top: 10, left: 10, color: '#e5e7eb' }} />
            <input
              type="date"
              min={todayIso()}
              value={route.departureDate}
              onChange={(e) => setRoute((prev) => ({ ...prev, departureDate: e.target.value }))}
              style={{ ...inputStyle, paddingLeft: 34 }}
            />
          </div>
          {tripType === 'roundtrip' && (
            <div style={{ marginTop: 6 }}>
              <input
                type="date"
                min={route.departureDate || todayIso()}
                value={route.returnDate}
                onChange={(e) => setRoute((prev) => ({ ...prev, returnDate: e.target.value }))}
                style={{ ...inputStyle, height: 40, paddingLeft: 12 }}
              />
            </div>
          )}
          {errors.departureDate && <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: 4 }}>{errors.departureDate}</div>}
          {errors.returnDate && <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: 4 }}>{errors.returnDate}</div>}
        </div>

        <div style={{ position: 'relative', minWidth: 180 }} ref={paxRef}>
          <label style={labelStyle}>Travelers</label>
          <button
            type="button"
            onClick={() => setPaxOpen((o) => !o)}
            style={{
              ...inputStyle,
              height: 44,
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>{paxSummary}</span>
            <Users size={16} />
          </button>
          {paxOpen && (
            <div
              style={{
                position: 'absolute',
                zIndex: 30,
                top: 'calc(100% + 6px)',
                right: 0,
                background: '#0f172a',
                border: '1px solid #24335c',
                borderRadius: 10,
                padding: 10,
                minWidth: 260,
                boxShadow: '0 12px 30px rgba(0,0,0,0.35)'
              }}
            >
              {['adults', 'children', 'infants'].map((key) => {
                const labels = { adults: 'Adults (12+)', children: 'Children (2-11)', infants: 'Infants (<2)' }
                const limits = { adults: { min: 1, max: 9 }, children: { min: 0, max: 8 }, infants: { min: 0, max: 2 } }
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>{labels[key]}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button type="button" style={counterBtnStyle(passengers[key] <= limits[key].min)} onClick={() => updatePassengers(key, -1)}>
                        -
                      </button>
                      <div style={{ width: 28, textAlign: 'center' }}>{passengers[key]}</div>
                      <button type="button" style={counterBtnStyle(passengers[key] >= limits[key].max)} onClick={() => updatePassengers(key, 1)}>
                        +
                      </button>
                    </div>
                  </div>
                )
              })}
              <div style={{ marginBottom: 8 }}>
                <label style={{ ...labelStyle, marginBottom: 4 }}>Cabin</label>
                <select value={travelClass} onChange={(e) => setTravelClass(e.target.value)} style={inputStyle}>
                  {CABIN_CLASSES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#fff', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={directOnly} onChange={(e) => setDirectOnly(e.target.checked)} style={checkboxStyle} />
                Direct flights only
              </label>
              {errors.passengers && <div style={{ color: '#f87171', fontSize: '0.8rem', marginTop: 6 }}>{errors.passengers}</div>}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', marginLeft: 'auto' }}>
          <button type="submit" style={gradientButton}>
            <Search size={18} />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Advanced toggle */}
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          className="button button-secondary"
          onClick={() => setAdvancedOpen((o) => !o)}
          style={{ padding: '6px 10px' }}
        >
          {advancedOpen ? 'Hide advanced options' : 'Advanced options'}
        </button>
        <div style={{ color: '#fff', fontSize: '0.85rem' }}>
          <Plane size={14} style={{ marginRight: 6 }} />
          {paxSummary}{directOnly ? ' · Direct only' : ''}
        </div>
      </div>

      {advancedOpen && (
        <div
          style={{
            marginTop: 8,
            padding: 12,
            borderRadius: 10,
            border: '1px solid #24335c',
            background: '#16213e',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 10
          }}
        >
          <div>
            <label style={labelStyle}>Fare family</label>
            <input style={inputStyle} placeholder="e.g., Light / Classic / Flex" />
          </div>
          <div>
            <label style={labelStyle}>Additional baggage</label>
            <input style={inputStyle} placeholder="Add baggage notes" />
          </div>
          <div>
            <label style={labelStyle}>Seat preference</label>
            <input style={inputStyle} placeholder="Aisle / Window / Exit" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 22 }}>
            <input type="checkbox" id="refundableOnly" />
            <label htmlFor="refundableOnly" style={{ color: '#fff' }}>Refundable only</label>
          </div>
        </div>
      )}

      {tripType === 'multicity' && (
        <div style={{ marginTop: 10, background: '#111827', border: '1px dashed #24335c', borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#cbd5f5', marginBottom: 10 }}>Multi-city legs</div>
          {legs.map((leg, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, alignItems: 'end', marginBottom: 8 }}>
              <div>
                <label style={labelStyle}>From</label>
                <AirportAutocomplete value={leg.from} onChange={(val) => updateLegField(idx, 'from', val)} placeholder="City or airport" />
              </div>
              <div>
                <label style={labelStyle}>To</label>
                <AirportAutocomplete value={leg.to} onChange={(val) => updateLegField(idx, 'to', val)} placeholder="City or airport" />
              </div>
              <div>
                <label style={labelStyle}>Date</label>
                <input
                  type="date"
                  min={todayIso()}
                  value={leg.date}
                  onChange={(e) => updateLegField(idx, 'date', e.target.value)}
                  style={inputStyle}
                />
              </div>
              {legs.length > 1 && (
                <button type="button" onClick={() => removeLeg(idx)} className="button button-secondary" style={{ marginTop: 4 }}>
                  Remove
                </button>
              )}
            </div>
          ))}
          {legs.length < 4 && (
            <button type="button" onClick={addLeg} className="button button-secondary">
              + Add leg
            </button>
          )}
        </div>
      )}
    </form>
  )
}
