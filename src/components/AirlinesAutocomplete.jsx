import { useState, useEffect, useRef } from 'react'
import { loadAirlines, filterAirlines, formatAirline, formatAirlineCompact } from '../lib/airlines'
import './AirlinesAutocomplete.css'

export default function AirlinesAutocomplete({ value, onChange, onBlur, onSelect, onKeyDown, placeholder, id, name }) {
  const [inputValue, setInputValue] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [airlines, setAirlines] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [dropdownStyle, setDropdownStyle] = useState({})
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  // Load airlines data on mount
  useEffect(() => {
    loadAirlines()
      .then(data => {
        setAirlines(data)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Failed to load airlines:', error)
        setIsLoading(false)
      })
  }, [])

  // Sync input value with prop
  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim().length > 0 && airlines.length > 0) {
      filterAirlines(airlines, inputValue)
        .then(filtered => {
          setSuggestions(filtered)
          setIsOpen(filtered.length > 0)
        })
        .catch(error => {
          console.error('Error filtering airlines:', error)
          setSuggestions([])
          setIsOpen(false)
        })
    } else {
      setSuggestions([])
      setIsOpen(false)
    }
  }, [inputValue, airlines])

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

  const handleSelect = (airline) => {
    const formatted = formatAirlineCompact(airline)
    setInputValue(formatted)
    onChange(formatted)
    setIsOpen(false)
    // Trigger onSelect callback if provided (for auto-save)
    if (onSelect) {
      onSelect(formatted, airline)
    }
    // Small delay before blur to ensure value is set
    setTimeout(() => {
      inputRef.current?.blur()
    }, 50)
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
    // Pass other key events to parent (for Tab, Enter navigation)
    if (onKeyDown) {
      onKeyDown(e)
    }
  }

  const handleCustomEntry = () => {
    // Keep the current input value as-is (already set via handleInputChange)
    setIsOpen(false)
    inputRef.current?.focus()
  }

  // Normalize input to a full airline name + code on blur if possible
  const handleBlur = () => {
    const raw = inputValue.trim()
    if (raw && airlines.length > 0) {
      const term = raw.toLowerCase()
      // Prefer exact IATA code match
      let best =
        airlines.find(a => a.iata && a.iata.toLowerCase() === term) ||
        // Then IATA starts-with
        airlines.find(a => a.iata && a.iata.toLowerCase().startsWith(term)) ||
        // Then name starts-with
        airlines.find(a => a.name.toLowerCase().startsWith(term))

      if (best) {
        const formatted = formatAirlineCompact(best) // e.g. "Ethiopian Airlines (ET)"
        if (formatted !== inputValue) {
          setInputValue(formatted)
          onChange(formatted)
        }
      }
    }

    if (onBlur) {
      onBlur()
    }
  }

  // Calculate dropdown position for fixed positioning
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const inputRect = inputRef.current.getBoundingClientRect()
      setDropdownStyle({
        position: 'fixed',
        top: `${inputRect.bottom + window.scrollY + 2}px`,
        left: `${inputRect.left + window.scrollX}px`,
        width: `${inputRect.width}px`
      })
    }
  }, [isOpen, suggestions, inputValue])

  return (
    <div className="airlines-autocomplete" ref={wrapperRef}>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
      />
      {isOpen && (suggestions.length > 0 || inputValue.trim().length > 0) && (
        <div className="airlines-autocomplete-dropdown" style={dropdownStyle}>
          {suggestions.map((airline, index) => (
            <div
              key={`${airline.id}-${index}`}
              className="airlines-autocomplete-item"
              onClick={() => handleSelect(airline)}
            >
              <div className="airlines-autocomplete-main">
                <span className="airlines-autocomplete-name">{formatAirlineCompact(airline)}</span>
                <div className="airlines-autocomplete-details">
                  {airline.country && <span>{airline.country}</span>}
                </div>
              </div>
            </div>
          ))}
          {inputValue.trim().length > 0 && (
            <div
              className="airlines-autocomplete-item airlines-autocomplete-custom"
              onClick={handleCustomEntry}
            >
              <span className="airlines-autocomplete-custom-text">
                Use custom: "{inputValue}"
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
