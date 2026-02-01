import { useState, useEffect, useRef } from 'react'
import { loadAirports, filterAirports, formatAirport } from '../lib/airports'
import './AirportAutocomplete.css'

export default function AirportAutocomplete({ value, onChange, placeholder, id, name, disabled = false }) {
  const [inputValue, setInputValue] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [airports, setAirports] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  // Load airports data on mount
  useEffect(() => {
    loadAirports()
      .then(data => {
        setAirports(data)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Failed to load airports:', error)
        setIsLoading(false)
      })
  }, [])

  // Sync input value with prop
  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim().length > 0 && airports.length > 0) {
      filterAirports(airports, inputValue)
        .then(filtered => {
          setSuggestions(filtered)
          setIsOpen(filtered.length > 0)
        })
        .catch(error => {
          console.error('Error filtering airports:', error)
          setSuggestions([])
          setIsOpen(false)
        })
    } else {
      setSuggestions([])
      setIsOpen(false)
    }
  }, [inputValue, airports])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
  }

  const handleSelect = (airport) => {
    const formatted = formatAirport(airport)
    setInputValue(formatted)
    onChange(formatted)
    setIsOpen(false)
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

  const handleCustomEntry = () => {
    // Keep the current input value as-is (already set via handleInputChange)
    setIsOpen(false)
    inputRef.current?.focus()
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
        placeholder={placeholder}
        autoComplete="off"
      />
      {isOpen && (suggestions.length > 0 || inputValue.trim().length > 0) && (
        <div className="airport-autocomplete-dropdown">
          {suggestions.map((airport, index) => (
            <div
              key={`${airport.id}-${index}`}
              className="airport-autocomplete-item"
              onClick={() => handleSelect(airport)}
            >
              <div className="airport-autocomplete-main">
                <span className="airport-autocomplete-name">{formatAirport(airport)}</span>
              </div>
            </div>
          ))}
          {inputValue.trim().length > 0 && (
            <div
              className="airport-autocomplete-item airport-autocomplete-custom"
              onClick={handleCustomEntry}
            >
              <span className="airport-autocomplete-custom-text">
                Use custom: "{inputValue}"
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
