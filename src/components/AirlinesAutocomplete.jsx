import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  loadAirlines,
  filterAirlines,
  formatAirlineCompact
} from '../lib/airlines'
import './AirlinesAutocomplete.css'

export default function AirlinesAutocomplete({
  value,
  onChange,
  onBlur,
  onSelect,
  onKeyDown,
  placeholder,
  id,
  name
}) {
  const [inputValue, setInputValue] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [airlines, setAirlines] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [dropdownStyle, setDropdownStyle] = useState({})

  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  /* --------------------------------------------------------
     Load airlines once
  -------------------------------------------------------- */
  useEffect(() => {
    loadAirlines()
      .then(data => {
        setAirlines(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Failed to load airlines:', err)
        setIsLoading(false)
      })
  }, [])

  /* --------------------------------------------------------
     Sync external value
  -------------------------------------------------------- */
  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  /* --------------------------------------------------------
     Filter suggestions
  -------------------------------------------------------- */
  useEffect(() => {
    if (!inputValue.trim() || airlines.length === 0) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    filterAirlines(airlines, inputValue)
      .then(filtered => {
        setSuggestions(filtered)
        setIsOpen(filtered.length > 0)
      })
      .catch(() => {
        setSuggestions([])
        setIsOpen(false)
      })
  }, [inputValue, airlines])

  /* --------------------------------------------------------
     Close on outside click
  -------------------------------------------------------- */
  useEffect(() => {
    const handleOutside = e => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  /* --------------------------------------------------------
     Position dropdown (FIXED + PORTAL)
  -------------------------------------------------------- */
  useEffect(() => {
    if (!isOpen || !inputRef.current) return

    const rect = inputRef.current.getBoundingClientRect()
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width,
      zIndex: 2147483647
    })
  }, [isOpen, inputValue, suggestions])

  /* --------------------------------------------------------
     Handlers
  -------------------------------------------------------- */
  const handleInputChange = e => {
    setInputValue(e.target.value)
    onChange(e.target.value)
  }

  const handleSelect = airline => {
    const formatted = formatAirlineCompact(airline)
    setInputValue(formatted)
    onChange(formatted)
    setIsOpen(false)

    if (onSelect) onSelect(formatted, airline)

    setTimeout(() => inputRef.current?.blur(), 0)
  }

  const handleBlur = () => {
    const raw = inputValue.trim().toLowerCase()
    if (!raw || airlines.length === 0) return onBlur?.()

    const match =
      airlines.find(a => a.iata?.toLowerCase() === raw) ||
      airlines.find(a => a.iata?.toLowerCase().startsWith(raw)) ||
      airlines.find(a => a.name.toLowerCase().startsWith(raw))

    if (match) {
      const formatted = formatAirlineCompact(match)
      if (formatted !== inputValue) {
        setInputValue(formatted)
        onChange(formatted)
      }
    }

    onBlur?.()
  }

  const handleKeyDownInternal = e => {
    if (e.key === 'Escape') setIsOpen(false)
    onKeyDown?.(e)
  }

  /* --------------------------------------------------------
     DROPDOWN (PORTAL — OUTSIDE TABLE)
  -------------------------------------------------------- */
  const dropdown = isOpen && (suggestions.length > 0 || inputValue.trim()) && (
    <div
      className="airlines-autocomplete-dropdown"
      style={dropdownStyle}
      role="listbox"
    >
      {suggestions.map((airline, i) => (
        <div
          key={`${airline.id}-${i}`}
          className="airlines-autocomplete-item"
          onMouseDown={() => handleSelect(airline)}
        >
          <div className="airlines-autocomplete-main">
            <span className="airlines-autocomplete-name">
              {formatAirlineCompact(airline)}
            </span>
            {airline.country && (
              <span className="airlines-autocomplete-details">
                {airline.country}
              </span>
            )}
          </div>
        </div>
      ))}

      {inputValue.trim() && (
        <div
          className="airlines-autocomplete-item airlines-autocomplete-custom"
          onMouseDown={() => setIsOpen(false)}
        >
          <span className="airlines-autocomplete-custom-text">
            Use custom: "{inputValue}"
          </span>
        </div>
      )}
    </div>
  )

  /* --------------------------------------------------------
     RENDER
  -------------------------------------------------------- */
  return (
    <>
      <div className="airlines-autocomplete" ref={wrapperRef}>
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={inputValue}
          placeholder={placeholder}
          autoComplete="off"
          onChange={handleInputChange}
          onFocus={() => suggestions.length && setIsOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDownInternal}
        />
      </div>

      {/* PORTAL OUTPUT */}
      {dropdown && createPortal(dropdown, document.body)}
    </>
  )
}
