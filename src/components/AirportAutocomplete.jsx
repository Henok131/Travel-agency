import { useEffect, useRef, useState } from 'react'
import { searchAirports, getAirportName, formatAirportLabel } from '../lib/iataLookup'
import './AirportAutocomplete.css'

export default function AirportAutocomplete({
  value,
  onChange,
  onBlur,
  placeholder,
  id,
  name,
  disabled = false,
  forceIata = false
}) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sync display label from the current value using cached lookups
  useEffect(() => {
    let active = true
    const syncLabel = async () => {
      if (!value) {
        if (active) setInputValue('')
        return
      }
      if (forceIata) {
        if (active) setInputValue((value || '').toUpperCase())
        return
      }
      try {
        const label = await getAirportName(value)
        if (active) setInputValue(label || value)
      } catch (_) {
        if (active) setInputValue(value)
      }
    }
    syncLabel()
    return () => {
      active = false
    }
  }, [value, forceIata])

  // Debounced search to Amadeus
  useEffect(() => {
    const term = inputValue.trim()
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    if (!term) {
      setSuggestions([])
      setIsOpen(false)
      setError(null)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const results = await searchAirports(term)
        setSuggestions(results)
        setIsOpen(results.length > 0)
        setError(null)
      } catch (err) {
        setSuggestions([])
        setIsOpen(false)
        setError(err.message || 'Search failed')
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [inputValue])

  const handleInputChange = (e) => {
    const newValueRaw = e.target.value
    const newValue = forceIata ? newValueRaw.toUpperCase() : newValueRaw
    setInputValue(newValue)
    onChange?.(newValue) // store typed value (IATA uppercased when forced)
    setError(null)
  }

  const handleSelect = (airport) => {
    const label = formatAirportLabel(airport)
    const code = airport?.iataCode || airport?.iata || label
    setInputValue(forceIata ? code : label)
    onChange?.(code) // store IATA code in state
    setIsOpen(false)
    setError(null)
    inputRef.current?.focus()
  }

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 100)
    onBlur?.()
  }

  // If disabled, render a simple read-only input
  if (disabled) {
    return (
      <input
        id={id}
        name={name}
        type="text"
        value={value || ''}
        placeholder={placeholder}
        disabled
        style={{ opacity: 0.6, cursor: 'not-allowed' }}
      />
    )
  }

  return (
    <div className="airport-autocomplete" ref={wrapperRef}>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete="off"
      />
      {isOpen && (suggestions.length > 0 || inputValue.trim().length > 0) && (
        <div className="airport-autocomplete-dropdown">
          {isLoading && (
            <div className="airport-autocomplete-item airport-autocomplete-status">
              Searching...
            </div>
          )}
          {error && (
            <div className="airport-autocomplete-item airport-autocomplete-status error">
              {error} — you can still type an IATA code manually.
            </div>
          )}
          {suggestions.map((airport, index) => (
            <div
              key={`${airport.iataCode || airport.name || 'airport'}-${index}`}
              className="airport-autocomplete-item"
              onClick={() => handleSelect(airport)}
            >
              <div className="airport-autocomplete-main">
                <span className="airport-autocomplete-name">{formatAirportLabel(airport)}</span>
              </div>
            </div>
          ))}
          {!isLoading && suggestions.length === 0 && inputValue.trim().length > 0 && (
            <div className="airport-autocomplete-item airport-autocomplete-status">
              No matches — press Enter to keep "{inputValue}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}
