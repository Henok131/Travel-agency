import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { airlines, normalizeAirlineValue } from '../data/airlines'
import './AirlineSelect.css'

/**
 * AirlineSelect — Centralized, reusable airline dropdown component.
 *
 * Features:
 *  - Searchable typeahead (filters by name OR IATA code)
 *  - Large dataset optimized (memoized filtering)
 *  - Dark theme consistent styling
 *  - Controlled component (value + onChange)
 *  - Single select (default) or multi-select mode
 *  - Dropdown max height with scroll
 *  - Keyboard navigation (Arrow keys, Enter, Escape)
 *  - Accessible (ARIA roles)
 *  - Submitted value format: "Airline Name (IATA)"
 *
 * Props:
 *  @param {string|string[]} value       - Current value(s)
 *  @param {function}        onChange     - Called with new value (string or string[])
 *  @param {function}        [onBlur]    - Called when input loses focus
 *  @param {function}        [onSelect]  - Called with (formattedValue, airlineObject)
 *  @param {function}        [onKeyDown] - Forwarded keydown handler
 *  @param {string}          [placeholder]
 *  @param {string}          [id]
 *  @param {string}          [name]
 *  @param {boolean}         [multi]     - Enable multi-select mode
 *  @param {boolean}         [disabled]
 */
export default function AirlineSelect({
    value,
    onChange,
    onBlur,
    onSelect,
    onKeyDown,
    placeholder = 'Search airline...',
    id,
    name,
    multi = false,
    disabled = false
}) {
    // ---------------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------------
    const [inputValue, setInputValue] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const [dropdownStyle, setDropdownStyle] = useState({})

    const wrapperRef = useRef(null)
    const inputRef = useRef(null)
    const listRef = useRef(null)

    // ---------------------------------------------------------------------------
    // Sync external value → input display
    // ---------------------------------------------------------------------------
    useEffect(() => {
        if (!multi) {
            setInputValue(value || '')
        }
    }, [value, multi])

    // ---------------------------------------------------------------------------
    // Filter airlines (memoized — no re-creation of list)
    // ---------------------------------------------------------------------------
    const filtered = useMemo(() => {
        const q = inputValue.trim().toLowerCase()
        if (!q) return airlines.slice(0, 30) // Show first 30 when empty

        return airlines.filter(a => {
            const label = a.label.toLowerCase()
            // Match against full label, airline name portion, or IATA code portion
            if (label.includes(q)) return true
            // Match IATA code in parentheses
            const codeMatch = a.label.match(/\(([A-Z0-9]{2,3})\)$/i)
            if (codeMatch && codeMatch[1].toLowerCase().startsWith(q)) return true
            return false
        }).slice(0, 30)
    }, [inputValue])

    // ---------------------------------------------------------------------------
    // Position dropdown via portal (fixed positioning)
    // ---------------------------------------------------------------------------
    const updatePosition = useCallback(() => {
        if (!inputRef.current) return
        const rect = inputRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const dropdownHeight = 320

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

    // ---------------------------------------------------------------------------
    // Close on outside click
    // ---------------------------------------------------------------------------
    useEffect(() => {
        const handleOutside = (e) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target) &&
                !e.target.closest('.airline-select-dropdown')
            ) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleOutside)
        return () => document.removeEventListener('mousedown', handleOutside)
    }, [])

    // ---------------------------------------------------------------------------
    // Scroll highlighted item into view
    // ---------------------------------------------------------------------------
    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const item = listRef.current.children[highlightedIndex]
            if (item) item.scrollIntoView({ block: 'nearest' })
        }
    }, [highlightedIndex])

    // ---------------------------------------------------------------------------
    // Handlers
    // ---------------------------------------------------------------------------
    const handleInputChange = (e) => {
        const val = e.target.value
        setInputValue(val)
        setHighlightedIndex(-1)
        if (!isOpen) setIsOpen(true)

        // In single-select: also fire onChange during typing so parent stays in sync
        if (!multi) {
            onChange(val)
        }
    }

    const handleSelectItem = (airline) => {
        if (multi) {
            const current = Array.isArray(value) ? [...value] : []
            const idx = current.indexOf(airline.value)
            let next
            if (idx >= 0) {
                next = current.filter(v => v !== airline.value)
            } else {
                next = [...current, airline.value]
            }
            onChange(next)
            setInputValue('')
            if (onSelect) onSelect(next, airline)
        } else {
            setInputValue(airline.value)
            onChange(airline.value)
            setIsOpen(false)
            if (onSelect) onSelect(airline.value, airline)
            setTimeout(() => inputRef.current?.blur(), 0)
        }
        setHighlightedIndex(-1)
    }

    const handleBlur = () => {
        // Normalize value on blur (auto-correct known codes/names)
        if (!multi && inputValue.trim()) {
            const normalized = normalizeAirlineValue(inputValue)
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

    // ---------------------------------------------------------------------------
    // Multi-select chip display
    // ---------------------------------------------------------------------------
    const multiValues = multi && Array.isArray(value) ? value : []

    // ---------------------------------------------------------------------------
    // Dropdown rendering (portal)
    // ---------------------------------------------------------------------------
    const dropdown = isOpen && (
        <div
            className="airline-select-dropdown"
            style={dropdownStyle}
            role="listbox"
            aria-label="Airline options"
            ref={listRef}
        >
            {filtered.length === 0 && inputValue.trim() && (
                <div className="airline-select-empty">
                    No airlines match "{inputValue}"
                </div>
            )}

            {filtered.map((airline, i) => {
                const isSelected = multi
                    ? multiValues.includes(airline.value)
                    : value === airline.value
                const isHighlighted = i === highlightedIndex

                // Extract IATA code for display badge
                const codeMatch = airline.label.match(/\(([A-Z0-9]{2,3})\)$/i)
                const iataCode = codeMatch ? codeMatch[1] : ''
                const airlineName = airline.label.replace(/\s*\([A-Z0-9]{2,3}\)$/i, '')

                return (
                    <div
                        key={airline.value + '-' + i}
                        className={`airline-select-item${isHighlighted ? ' highlighted' : ''}${isSelected ? ' selected' : ''}`}
                        role="option"
                        aria-selected={isSelected}
                        onMouseDown={(e) => {
                            e.preventDefault()
                            handleSelectItem(airline)
                        }}
                        onMouseEnter={() => setHighlightedIndex(i)}
                    >
                        <span className="airline-select-name">{airlineName}</span>
                        {iataCode && <span className="airline-select-code">{iataCode}</span>}
                        {isSelected && (
                            <span className="airline-select-check">✓</span>
                        )}
                    </div>
                )
            })}

            {/* Custom entry option */}
            {inputValue.trim() && !multi && !filtered.some(a => a.value.toLowerCase() === inputValue.trim().toLowerCase()) && (
                <div
                    className="airline-select-item airline-select-custom"
                    onMouseDown={(e) => {
                        e.preventDefault()
                        setIsOpen(false)
                    }}
                >
                    <span className="airline-select-custom-text">
                        Use custom: "{inputValue}"
                    </span>
                </div>
            )}
        </div>
    )

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------
    return (
        <>
            <div className="airline-select" ref={wrapperRef}>
                {/* Multi-select chips */}
                {multi && multiValues.length > 0 && (
                    <div className="airline-select-chips">
                        {multiValues.map(v => (
                            <span key={v} className="airline-select-chip">
                                {v}
                                <button
                                    type="button"
                                    className="airline-select-chip-remove"
                                    onClick={() => {
                                        const next = multiValues.filter(x => x !== v)
                                        onChange(next)
                                    }}
                                    aria-label={`Remove ${v}`}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                <input
                    ref={inputRef}
                    id={id}
                    name={name}
                    type="text"
                    value={inputValue}
                    placeholder={multi && multiValues.length > 0 ? 'Add more...' : placeholder}
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
