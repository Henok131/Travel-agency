import { useState, useRef, useEffect } from 'react'
import { BlockMath, InlineMath } from 'react-katex'
import { motion, AnimatePresence } from 'framer-motion'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'
import 'katex/dist/katex.min.css'
import './FormulaDisplay.css'

// Variable definitions for tooltips
const VARIABLE_DEFINITIONS = {
  'Total Ticket Price': 'The total cost of a flight ticket including base price and service fee',
  'Airlines Price': 'Base price charged by the airline company',
  'Service Ticket': 'Additional fee charged by LST for booking services',
  'Service Fee': 'Service Ticket', // Legacy support
  'Total Visa Fees': 'Total cost of visa processing including base visa price and service fee',
  'Visa Price': 'Base visa application fee',
  'Service Visa': 'Service fee charged by LST for visa processing',
  'Total Customer Payment': 'Total amount paid by the customer through all payment methods',
  'Cash Paid': 'Amount paid in cash',
  'Bank Transfer': 'Amount paid via bank transfer',
  'Total Amount Due': 'Total amount the customer needs to pay',
  'Payment Balance': 'Difference between customer payment and amount due',
  'LST Profit': 'Net profit for LST after all fees and commissions',
  'Commission': 'Commission received from airlines',
  'Loan Fee': 'Fee deducted for loans or advances',
  'Gross Amount': 'Amount including VAT',
  'Net Amount': 'Amount excluding VAT',
  'VAT Rate': 'Value Added Tax rate percentage',
  'VAT Amount': 'Amount of VAT included in the price'
}

// Extract variables from LaTeX formula
const extractVariables = (formula) => {
  const variables = []
  const matches = formula.match(/\\text\{([^}]+)\}/g)
  if (matches) {
    matches.forEach(match => {
      const varName = match.replace(/\\text\{|\}/g, '')
      if (VARIABLE_DEFINITIONS[varName]) {
        variables.push({
          name: varName,
          definition: VARIABLE_DEFINITIONS[varName]
        })
      }
    })
  }
  return variables
}

export default function FormulaDisplay({
  formula,
  mode = 'block', // 'block' or 'inline'
  notationStyle = 'standard', // 'standard', 'compact', 'verbose'
  showLaTeX = false,
  showVariables = true,
  copyable = true,
  className = ''
}) {
  const [copied, setCopied] = useState(false)
  const [hoveredVariable, setHoveredVariable] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const formulaRef = useRef(null)
  const tooltipRef = useRef(null)

  // Transform formula based on notation style
  const transformFormula = (formula, style) => {
    if (style === 'compact') {
      // Replace verbose text with shorter versions
      return formula
        .replace(/\\text\{Total Ticket Price\}/g, 'T_{ticket}')
        .replace(/\\text\{Airlines Price\}/g, 'P_{airline}')
        .replace(/\\text\{Service Ticket\}/g, 'F_{service}')
        .replace(/\\text\{Service Fee\}/g, 'F_{service}') // Legacy support
        .replace(/\\text\{Total Visa Fees\}/g, 'V_{total}')
        .replace(/\\text\{Visa Price\}/g, 'P_{visa}')
        .replace(/\\text\{Service Visa\}/g, 'F_{visa}')
        .replace(/\\text\{Total Customer Payment\}/g, 'P_{customer}')
        .replace(/\\text\{Cash Paid\}/g, 'C_{cash}')
        .replace(/\\text\{Bank Transfer\}/g, 'B_{transfer}')
        .replace(/\\text\{Total Amount Due\}/g, 'D_{due}')
        .replace(/\\text\{Payment Balance\}/g, 'B_{balance}')
        .replace(/\\text\{LST Profit\}/g, '\\Pi_{LST}')
        .replace(/\\text\{Commission\}/g, 'C_{comm}')
        .replace(/\\text\{Loan Fee\}/g, 'F_{loan}')
        .replace(/\\text\{Gross Amount\}/g, 'G')
        .replace(/\\text\{Net Amount\}/g, 'N')
        .replace(/\\text\{VAT Rate\}/g, 'r_{VAT}')
        .replace(/\\text\{VAT Amount\}/g, 'V_{VAT}')
    } else if (style === 'verbose') {
      // Keep verbose, add more descriptive text
      return formula
    }
    return formula // standard style
  }

  const transformedFormula = transformFormula(formula, notationStyle)
  const variables = extractVariables(formula)

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formula)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy formula:', error)
    }
  }

  // Handle mouse move for tooltip positioning
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (hoveredVariable && tooltipRef.current) {
        const tooltip = tooltipRef.current
        const tooltipWidth = tooltip.offsetWidth || 300
        const tooltipHeight = tooltip.offsetHeight || 100
        const x = e.clientX - tooltipWidth / 2
        const y = e.clientY - tooltipHeight - 15
        
        // Keep tooltip within viewport
        const maxX = window.innerWidth - tooltipWidth - 10
        const minX = 10
        const adjustedX = Math.max(minX, Math.min(maxX, x))
        
        setTooltipPosition({ x: adjustedX, y })
      }
    }

    if (hoveredVariable) {
      window.addEventListener('mousemove', handleMouseMove)
      return () => window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [hoveredVariable])

  // Render formula with variable highlighting
  const renderFormulaWithTooltips = () => {
    if (!showVariables || variables.length === 0) {
      return mode === 'block' ? (
        <BlockMath math={transformedFormula} />
      ) : (
        <InlineMath math={transformedFormula} />
      )
    }

    // For now, render standard KaTeX and add tooltips via CSS/data attributes
    // This is a simplified approach - full variable highlighting would require custom parsing
    return mode === 'block' ? (
      <BlockMath math={transformedFormula} />
    ) : (
      <InlineMath math={transformedFormula} />
    )
  }

  return (
    <div className={`formula-display ${mode} ${className}`} ref={formulaRef}>
      {/* Formula Container */}
      <div className="formula-container">
        <div className="formula-math-wrapper">
          {renderFormulaWithTooltips()}
        </div>

        {/* Copy Button */}
        {copyable && (
          <motion.button
            className="formula-copy-btn"
            onClick={handleCopy}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Copy formula"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.svg
                  key="check"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </motion.svg>
              ) : (
                <motion.svg
                  key="copy"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </motion.svg>
              )}
            </AnimatePresence>
            <span className="formula-copy-text">{copied ? 'Copied!' : 'Copy'}</span>
          </motion.button>
        )}
      </div>

      {/* Variable List with Tooltips */}
      {showVariables && variables.length > 0 && (
        <div className="formula-variables">
          <div className="formula-variables-title">Variables:</div>
          <div className="formula-variables-list">
            {variables.map((variable, index) => (
              <div
                key={index}
                className="formula-variable-item"
                onMouseEnter={() => setHoveredVariable(variable.name)}
                onMouseLeave={() => setHoveredVariable(null)}
              >
                <code className="formula-variable-name">{variable.name}</code>
                <span className="formula-variable-separator">:</span>
                <span className="formula-variable-desc">{variable.definition}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredVariable && VARIABLE_DEFINITIONS[hoveredVariable] && (
          <motion.div
            ref={tooltipRef}
            className="formula-tooltip"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`
            }}
          >
            <div className="formula-tooltip-title">{hoveredVariable}</div>
            <div className="formula-tooltip-content">
              {VARIABLE_DEFINITIONS[hoveredVariable]}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LaTeX Source Code */}
      {showLaTeX && (
        <motion.div
          className="formula-latex-source"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="formula-latex-title">LaTeX Source:</div>
          <SyntaxHighlighter
            language="latex"
            style={document.documentElement.classList.contains('dark') ? vscDarkPlus : vs}
            customStyle={{
              margin: 0,
              borderRadius: '6px',
              fontSize: '0.85rem',
              padding: '1rem'
            }}
          >
            {formula}
          </SyntaxHighlighter>
        </motion.div>
      )}

      {/* Notation Style Selector */}
      {notationStyle !== 'standard' && (
        <div className="formula-notation-info">
          <span className="formula-notation-label">Notation:</span>
          <span className="formula-notation-value">{notationStyle}</span>
        </div>
      )}
    </div>
  )
}

// Preset formula components for common formulas
export const TotalTicketPriceFormula = ({ mode = 'block', ...props }) => (
  <FormulaDisplay
    formula="\\text{Total Ticket Price} = \\text{Airlines Price} + \\text{Service Ticket}"
    mode={mode}
    {...props}
  />
)

export const NetFromGrossFormula = ({ mode = 'block', ...props }) => (
  <FormulaDisplay
    formula="\\text{Net Amount} = \\frac{\\text{Gross Amount}}{1 + \\frac{\\text{VAT Rate}}{100}}"
    mode={mode}
    {...props}
  />
)

export const GrossFromNetFormula = ({ mode = 'block', ...props }) => (
  <FormulaDisplay
    formula="\\text{Gross Amount} = \\text{Net Amount} \\times \\left(1 + \\frac{\\text{VAT Rate}}{100}\\right)"
    mode={mode}
    {...props}
  />
)

export const LSTProfitFormula = ({ mode = 'block', ...props }) => (
  <FormulaDisplay
    formula="\\text{LST Profit} = \\text{Service Ticket} + \\text{Service Visa} + \\text{Commission} - \\text{Loan Fee}"
    mode={mode}
    {...props}
  />
)

export const PaymentBalanceFormula = ({ mode = 'block', ...props }) => (
  <FormulaDisplay
    formula="\\text{Payment Balance} = \\text{Total Customer Payment} - \\text{Total Amount Due}"
    mode={mode}
    {...props}
  />
)

export const TotalAmountDueFormula = ({ mode = 'block', ...props }) => (
  <FormulaDisplay
    formula="\\text{Total Amount Due} = \\text{Total Ticket Price} + \\text{Total Visa Fees}"
    mode={mode}
    {...props}
  />
)
