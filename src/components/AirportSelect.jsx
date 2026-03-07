import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { airports, normalizeAirportValue } from '../data/airports'
import './AirportSelect.css'

/**
 * AirportSelect — Centralized, reusable airport dropdown component.
 *
 * Features:
 *  - Searchable typeahead (filters by city name OR IATA code)
 *  - Large dataset optimized (memoized filtering)
 *  - Dark theme consistent styling
 *  - Controlled component (value + onChange)
 *  - Dropdown max height with scroll
 *  - Keyboard navigation (Arrow keys, Enter, Escape)
 *  - Accessible (ARIA roles)
 *  - Submitted value format: "CityName(IATA)"
 *
 * Props:
 *  @param {string}   value        - Current value
 *  @param {function} onChange      - Called with new value string
 *  @param {function} [onBlur]     - Called when input loses focus
 *  @param {function} [onSelect]   - Called with (formattedValue, airportObject)
 *  @param {function} [onKeyDown]  - Forwarded keydown handler
 *  @param {string}   [placeholder]
 *  @param {string}   [id]
 *  @param {string}   [name]
 *  @param {boolean}  [disabled]
 *  @param {boolean}  [forceIata]  - When true, submits bare IATA code instead of "CityName(IATA)"
 */
export default function AirportSelect({
    value,
    onChange,
    onBlur,
    onSelect,
    onKeyDown,
    placeholder = 'Search airport...',
    id,
    name,
    disabled = false,
    forceIata = false
}) {
    // ─── State ────────────────────────────────────────────────────────────────
    const [inputValue, setInputValue] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const [dropdownStyle, setDropdownStyle] = useState({})

    const wrapperRef = useRef(null)
    const inputRef = useRef(null)
    const listRef = useRef(null)

    // ─── Sync external value → input display ──────────────────────────────────
    useEffect(() => {
        if (forceIata) {
            // In forceIata mode, display the IATA code as uppercase
            setInputValue((value || '').toUpperCase())
        } else {
            setInputValue(value || '')
        }
    }, [value, forceIata])

    // ─── Filter airports (memoized) ───────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = inputValue.trim().toLowerCase()
        if (!q) return airports.slice(0, 40) // Show first 40 when empty

        return airports.filter(a => {
            const label = a.label.toLowerCase()
            // Match against city name or full label
            if (label.includes(q)) return true
            // Match bare IATA code
            const codeMatch = a.label.match(/\(([A-Z]{3})\)$/)
            if (codeMatch && codeMatch[1].toLowerCase().startsWith(q)) return true
            return false
        }).slice(0, 40)
    }, [inputValue])

    // ─── Position dropdown via portal (fixed positioning) ─────────────────────
    const updatePosition = useCallback(() => {
        if (!inputRef.current) return
        const rect = inputRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const dropdownHeight = 340

        const openAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight

        setDropdownStyle({
            position: 'fixed',
            left: rect.left,
            width: Math.max(rect.width, 280),
            zIndex: 2147483647,
            ...(openAbove
                ? { bottom: window.innerHeight - rect.top + 4 }
                : { top: rect.bottom + 4 })
        })
    }, [])

    useEffect(() => {
        if (isOpen) {
            updatePosition()
            window.addEventListener('scroll', updatePosition, true)
            window.addEventListener('resize', updatePosition)
            return () => {
                window.removeEventListener('scroll', updatePosition, true)
                window.removeEventListener('resize', updatePosition)
            }
        }
    }, [isOpen, updatePosition])

    // ─── Close on outside click ───────────────────────────────────────────────
    useEffect(() => {
        const handleOutside = (e) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target) &&
                !e.target.closest('.airport-select-dropdown')
            ) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleOutside)
        return () => document.removeEventListener('mousedown', handleOutside)
    }, [])

    // ─── Scroll highlighted item into view ────────────────────────────────────
    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const item = listRef.current.children[highlightedIndex]
            if (item) item.scrollIntoView({ block: 'nearest' })
        }
    }, [highlightedIndex])

    // ─── Handlers ─────────────────────────────────────────────────────────────
    const handleInputChange = (e) => {
        const val = forceIata ? e.target.value.toUpperCase() : e.target.value
        setInputValue(val)
        setHighlightedIndex(-1)
        if (!isOpen) setIsOpen(true)

        // Fire onChange during typing so parent stays in sync
        onChange(val)
    }

    const handleSelectItem = (airport) => {
        if (forceIata) {
            // Extract bare IATA code for Amadeus API compatibility
            const codeMatch = airport.value.match(/\(([A-Z]{3})\)$/)
            const code = codeMatch ? codeMatch[1] : airport.value
            setInputValue(code)
            onChange(code)
            if (onSelect) onSelect(code, airport)
        } else {
            setInputValue(airport.value)
            onChange(airport.value)
            if (onSelect) onSelect(airport.value, airport)
        }
        setIsOpen(false)
        setHighlightedIndex(-1)
        setTimeout(() => inputRef.current?.blur(), 0)
    }

    const handleBlur = () => {
        // Normalize value on blur
        if (!forceIata && inputValue.trim()) {
            const normalized = normalizeAirportValue(inputValue)
            if (normalized !== inputValue) {
                setInputValue(normalized)
                onChange(normalized)
            }
        }
        onBlur?.()
    }

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            if (!isOpen) {
                setIsOpen(true)
            } else {
                setHighlightedIndex(prev => Math.min(prev + 1, filtered.length - 1))
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setHighlightedIndex(prev => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (isOpen && highlightedIndex >= 0 && filtered[highlightedIndex]) {
                handleSelectItem(filtered[highlightedIndex])
            } else {
                setIsOpen(false)
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false)
            setHighlightedIndex(-1)
        }

        // Forward to parent
        onKeyDown?.(e)
    }

    const handleFocus = () => {
        if (!disabled) setIsOpen(true)
    }

    // ─── Disabled render ──────────────────────────────────────────────────────
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

    // ─── Dropdown (portal) ────────────────────────────────────────────────────
    const dropdown = isOpen && (
        <div
            className="airport-select-dropdown"
            style={dropdownStyle}
            role="listbox"
            aria-label="Airport options"
            ref={listRef}
        >
            {filtered.length === 0 && inputValue.trim() && (
                <div className="airport-select-empty">
                    No airports match "{inputValue}"
                </div>
            )}

            {filtered.map((airport, i) => {
                const isSelected = value === airport.value
                const isHighlighted = i === highlightedIndex

                // Extract IATA code for display badge
                const codeMatch = airport.label.match(/\(([A-Z]{3})\)$/)
                const iataCode = codeMatch ? codeMatch[1] : ''
                const cityName = airport.label.replace(/\([A-Z]{3}\)$/, '')

                return (
                    <div
                        key={airport.value + '-' + i}
                        className={`airport-select-item${isHighlighted ? ' highlighted' : ''}${isSelected ? ' selected' : ''}`}
                        role="option"
                        aria-selected={isSelected}
                        onMouseDown={(e) => {
                            e.preventDefault()
                            handleSelectItem(airport)
                        }}
                        onMouseEnter={() => setHighlightedIndex(i)}
                    >
                        <span className="airport-select-name">{cityName}</span>
                        {iataCode && <span className="airport-select-code">{iataCode}</span>}
                        {isSelected && (
                            <span className="airport-select-check">✓</span>
                        )}
                    </div>
                )
            })}

            {/* Custom entry option */}
            {inputValue.trim() && !filtered.some(a => a.value.toLowerCase() === inputValue.trim().toLowerCase()) && (
                <div
                    className="airport-select-item airport-select-custom"
                    onMouseDown={(e) => {
                        e.preventDefault()
                        setIsOpen(false)
                    }}
                >
                    <span className="airport-select-custom-text">
                        Use custom: "{inputValue}"
                    </span>
                </div>
            )}
        </div>
    )

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <>
            <div className="airport-select" ref={wrapperRef}>
                <input
                    ref={inputRef}
                    id={id}
                    name={name}
                    type="text"
                    value={inputValue}
                    placeholder={placeholder}
                    autoComplete="off"
                    disabled={disabled}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-autocomplete="list"
                />
            </div>

            {/* Portal output */}
            {dropdown && createPortal(dropdown, document.body)}
        </>
    )
}
