import { useEffect, useMemo, useState, useRef } from 'react'
import { loadCountryNames } from '../lib/airports'

/**
 * Lightweight country autocomplete.
 * - Fetches country names (ISO code -> name) via loadCountryNames.
 * - Filters by code or name as the user types.
 * - Returns the chosen display label (e.g., "Germany") via onChange.
 */
export default function CountryAutocomplete({
  id = 'country',
  value,
  onChange,
  placeholder = 'Enter country',
  disabled = false
}) {
  const [countries, setCountries] = useState([])
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value || '')
  const containerRef = useRef(null)

  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  useEffect(() => {
    let mounted = true
    loadCountryNames()
      .then((map) => {
        if (!mounted) return
        const entries = Object.entries(map || {}).map(([code, name]) => ({
          code,
          name: name || code,
          label: name ? `${name} (${code})` : code
        }))
        setCountries(entries)
      })
      .catch(() => {
        if (mounted) setCountries([])
      })
    return () => {
      mounted = false
    }
  }, [])

  const suggestions = useMemo(() => {
    const term = (inputValue || '').toLowerCase().trim()
    if (!term) return countries.slice(0, 8)
    return countries
      .filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.code.toLowerCase().includes(term)
      )
      .slice(0, 8)
  }, [countries, inputValue])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (item) => {
    setInputValue(item.name)
    setOpen(false)
    onChange?.(item.name)
  }

  return (
    <div
      ref={containerRef}
      className="country-autocomplete"
      style={{ position: 'relative' }}
    >
      <input
        id={id}
        type="text"
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setInputValue(e.target.value)
          onChange?.(e.target.value)
          setOpen(true)
        }}
        className="country-autocomplete-input"
      />
      {open && suggestions.length > 0 && (
        <div className="country-autocomplete-list">
          {suggestions.map((item) => (
            <button
              key={item.code}
              type="button"
              className="country-autocomplete-item"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(item)}
            >
              <span className="country-autocomplete-name">{item.name}</span>
              <span className="country-autocomplete-code">{item.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
