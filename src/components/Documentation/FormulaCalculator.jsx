import { useState, useEffect } from 'react'
import { BlockMath, InlineMath } from 'react-katex'
import { motion, AnimatePresence } from 'framer-motion'
import 'katex/dist/katex.min.css'
import './FormulaCalculator.css'

export default function FormulaCalculator({
  title,
  formula,
  inputs,
  calculate,
  resultLabel,
  resultUnit = '€',
  description
}) {
  const [values, setValues] = useState({})
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  // Initialize values with defaults
  useEffect(() => {
    const initialValues = {}
    inputs.forEach(input => {
      initialValues[input.id] = input.defaultValue || ''
    })
    setValues(initialValues)
  }, [inputs])

  // Calculate result whenever values change
  useEffect(() => {
    try {
      const calculatedResult = calculate(values)
      setResult(calculatedResult)
    } catch (error) {
      setResult(null)
    }
  }, [values, calculate])

  // Handle input change
  const handleInputChange = (id, value) => {
    // Validate numeric input
    if (value === '' || value === '-') {
      setValues(prev => ({ ...prev, [id]: value }))
      return
    }

    // Allow decimal numbers
    const numericValue = value.replace(/[^0-9.-]/g, '')
    if (numericValue !== value) return

    setValues(prev => ({ ...prev, [id]: numericValue }))
  }

  // Format currency
  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '—'
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  // Copy result to clipboard
  const handleCopyResult = async () => {
    if (result === null || result === undefined) return
    
    try {
      await navigator.clipboard.writeText(formatCurrency(result))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // Reset all inputs
  const handleReset = () => {
    const resetValues = {}
    inputs.forEach(input => {
      resetValues[input.id] = input.defaultValue || ''
    })
    setValues(resetValues)
    setCopied(false)
  }

  // Check if all required inputs are filled
  const isValid = inputs.every(input => {
    const value = values[input.id]
    return value !== '' && value !== undefined && value !== null && !isNaN(parseFloat(value))
  })

  return (
    <motion.div
      className="formula-calculator"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="formula-calculator-header">
        {title && <h3 className="formula-calculator-title">{title}</h3>}
        {description && <p className="formula-calculator-description">{description}</p>}
      </div>

      {/* Formula Display */}
      <div className="formula-display">
        <BlockMath math={formula} />
      </div>

      {/* Input Fields */}
      <div className="formula-inputs">
        {inputs.map((input, index) => {
          const value = values[input.id] || ''
          const displayValue = value === '' ? '' : parseFloat(value) || value
          
          return (
            <motion.div
              key={input.id}
              className="formula-input-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <label htmlFor={input.id} className="formula-input-label">
                {input.label}
                {input.required && <span className="required">*</span>}
                {input.hint && <span className="input-hint">{input.hint}</span>}
              </label>
              <div className="formula-input-wrapper">
                <input
                  id={input.id}
                  type="text"
                  className="formula-input"
                  placeholder={input.placeholder || '0.00'}
                  value={displayValue}
                  onChange={(e) => handleInputChange(input.id, e.target.value)}
                  onBlur={(e) => {
                    // Format on blur if empty, set to 0
                    if (e.target.value === '' || e.target.value === '-') {
                      setValues(prev => ({ ...prev, [input.id]: '' }))
                    }
                  }}
                />
                {input.unit && <span className="formula-input-unit">{input.unit}</span>}
              </div>
              {input.description && (
                <p className="formula-input-description">{input.description}</p>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Result Display */}
      <AnimatePresence mode="wait">
        {isValid && result !== null && !isNaN(result) && (
          <motion.div
            className="formula-result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="formula-result-label">{resultLabel}</div>
            <div className="formula-result-value">
              {formatCurrency(result)}
            </div>
            <div className="formula-result-actions">
              <button
                className="btn-copy-result"
                onClick={handleCopyResult}
                title="Copy result to clipboard"
              >
                {copied ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
              <button
                className="btn-reset-calculator"
                onClick={handleReset}
                title="Reset all inputs"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                Reset
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!isValid && (
        <div className="formula-empty-state">
          <p>Enter values above to calculate {resultLabel.toLowerCase()}</p>
        </div>
      )}
    </motion.div>
  )
}
