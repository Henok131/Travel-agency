import { useState, useMemo } from 'react'
import { Swap, Users, CalendarRange, Search, Plane } from 'lucide-react'
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

  const cardStyle = {
    background: '#16213e',
    border: '1px solid #1f2a4d',
    borderRadius: '14px',
    padding: '16px',
    color: '#e5e7eb',
    boxShadow: '0 12px 30px rgba(0,0,0,0.3)'
  }

  const labelStyle = { fontSize: '0.85rem', color: '#9ca3af', marginBottom: 6, display: 'block' }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #24335c',
    background: '#0f172a',
    color: '#e5e7eb'
  }

  const sectionTitleStyle = { fontSize: '0.9rem', fontWeight: 700, color: '#cbd5f5', marginBottom: 10 }

  const counterBtnStyle = (disabled) => ({
    width: 32,
    height: 32,
    borderRadius: 8,
    border: '1px solid #24335c',
    background: disabled ? '#1f2937' : '#1e3a8a',
    color: disabled ? '#6b7280' : '#e5e7eb',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'grid',
    placeItems: 'center'
  })

  const gradientButton = {
    background: 'linear-gradient(90deg, #2563eb, #60a5fa)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 16px',
    width: '100%',
    fontWeight: 700,
    display: 'inline-flex',
    gap: '10px',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 12px 30px rgba(37,99,235,0.35)'
  }

  return (
    <form onSubmit={handleSubmit} style={cardStyle}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {/* Trip type */}
        <div>
          <div style={sectionTitleStyle}>Trip</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {TRIP_TYPES.map((type) => (
              <label key={type.value} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="tripType"
                  value={type.value}
                  checked={tripType === type.value}
                  onChange={() => setTripType(type.value)}
                />
                <span>{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Cabin + direct */}
        <div>
          <div style={sectionTitleStyle}>Cabin & Filters</div>
          <select value={travelClass} onChange={(e) => setTravelClass(e.target.value)} style={inputStyle}>
            {CABIN_CLASSES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={directOnly} onChange={(e) => setDirectOnly(e.target.checked)} />
            <span>Direct flights only</span>
          </label>
        </div>

        {/* Passengers */}
        <div>
          <div style={sectionTitleStyle}>Passengers</div>
          {['adults', 'children', 'infants'].map((key) => {
            const labels = { adults: 'Adults (12+)', children: 'Children (2-11)', infants: 'Infants (<2)' }
            const limits = { adults: { min: 1, max: 9 }, children: { min: 0, max: 8 }, infants: { min: 0, max: 2 } }
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ color: '#cbd5f5', fontSize: '0.9rem' }}>{labels[key]}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button type="button" style={counterBtnStyle(passengers[key] <= limits[key].min)} onClick={() => updatePassengers(key, -1)}>
                    -
                  </button>
                  <div style={{ width: 32, textAlign: 'center' }}>{passengers[key]}</div>
                  <button type="button" style={counterBtnStyle(passengers[key] >= limits[key].max)} onClick={() => updatePassengers(key, 1)}>
                    +
                  </button>
                </div>
              </div>
            )
          })}
          <div style={{ marginTop: 6, color: errors.passengers ? '#f87171' : '#9ca3af', fontSize: '0.85rem' }}>
            <Users size={14} style={{ marginRight: 4 }} />
            Total: {totalPax}
            {errors.passengers ? ` – ${errors.passengers}` : ''}
          </div>
        </div>
      </div>

      {/* Route & dates */}
      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', alignItems: 'end' }}>
        <div>
          <label style={labelStyle}>From</label>
          <AirportAutocomplete
            value={route.from}
            onChange={(val) => setRoute((prev) => ({ ...prev, from: val }))}
            placeholder="City or airport"
          />
          {errors.from && <div style={{ color: '#f87171', fontSize: '0.8rem', marginTop: 4 }}>{errors.from}</div>}
        </div>
        <div>
          <label style={labelStyle}>To</label>
          <AirportAutocomplete
            value={route.to}
            onChange={(val) => setRoute((prev) => ({ ...prev, to: val }))}
            placeholder="City or airport"
          />
          {errors.to && <div style={{ color: '#f87171', fontSize: '0.8rem', marginTop: 4 }}>{errors.to}</div>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={swapRoute} title="Swap" style={{ ...counterBtnStyle(false), width: 44 }}>
            <Swap size={18} />
          </button>
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Departure</label>
          <div style={{ position: 'relative' }}>
            <CalendarRange size={16} style={{ position: 'absolute', top: 10, left: 10, color: '#6b7280' }} />
            <input
              type="date"
              min={todayIso()}
              value={route.departureDate}
              onChange={(e) => setRoute((prev) => ({ ...prev, departureDate: e.target.value }))}
              style={{ ...inputStyle, paddingLeft: 34 }}
            />
          </div>
          {errors.departureDate && <div style={{ color: '#f87171', fontSize: '0.8rem', marginTop: 4 }}>{errors.departureDate}</div>}
        </div>
        {tripType === 'roundtrip' && (
          <div>
            <label style={labelStyle}>Return</label>
            <div style={{ position: 'relative' }}>
              <CalendarRange size={16} style={{ position: 'absolute', top: 10, left: 10, color: '#6b7280' }} />
              <input
                type="date"
                min={route.departureDate || todayIso()}
                value={route.returnDate}
                onChange={(e) => setRoute((prev) => ({ ...prev, returnDate: e.target.value }))}
                style={{ ...inputStyle, paddingLeft: 34 }}
              />
            </div>
            {errors.returnDate && <div style={{ color: '#f87171', fontSize: '0.8rem', marginTop: 4 }}>{errors.returnDate}</div>}
          </div>
        )}
      </div>

      {tripType === 'multicity' && (
        <div style={{ marginTop: 16, background: '#111827', border: '1px dashed #24335c', borderRadius: 10, padding: 12 }}>
          <div style={sectionTitleStyle}>Multi-city legs</div>
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

      <div style={{ marginTop: 18 }}>
        <button type="submit" style={gradientButton}>
          <Search size={18} />
          <span>Search Flights</span>
        </button>
      </div>

      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', fontSize: '0.85rem' }}>
        <Plane size={16} />
        <span>
          Trip: {tripType === 'roundtrip' ? 'Round-trip' : tripType === 'oneway' ? 'One-way' : 'Multi-city'} ·
          {' '}{travelClass.replace('_', ' ')} · {totalPax} pax
          {directOnly ? ' · Direct only' : ''}
        </span>
      </div>
    </form>
  )
}
