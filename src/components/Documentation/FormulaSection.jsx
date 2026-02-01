import { useState } from 'react'
import { BlockMath } from 'react-katex'
import { motion, AnimatePresence } from 'framer-motion'
import FormulaCalculator from './FormulaCalculator'
import 'katex/dist/katex.min.css'
import './FormulaSection.css'

export default function FormulaSection({
  title,
  formula,
  description,
  components,
  example,
  calculatorConfig,
  expanded = false
}) {
  const [isExpanded, setIsExpanded] = useState(expanded)

  return (
    <motion.div
      className="formula-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Title */}
      <div className="formula-section-header">
        <h3 className="formula-section-title">{title}</h3>
        <button
          className={`formula-expand-btn ${isExpanded ? 'expanded' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* KaTeX Formula Display - Center */}
      <div className="formula-katex-display">
        <BlockMath math={formula} />
      </div>

      {/* Main Content Grid */}
      <div className="formula-content-grid">
        {/* Left: Description */}
        <div className="formula-description-column">
          <div className="formula-description">
            <h4 className="formula-subtitle">Description</h4>
            <div className="formula-description-content">
              {description}
            </div>

            {components && (
              <div className="formula-components">
                <h4 className="formula-subtitle">Components</h4>
                <ul className="formula-components-list">
                  {components.map((component, index) => (
                    <li key={index}>
                      <code className="formula-component-code">{component.name}</code>
                      <span className="formula-component-desc">: {component.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {example && (
              <div className="formula-example">
                <h4 className="formula-subtitle">Example</h4>
                <div className="formula-example-content">
                  {example}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Interactive Calculator */}
        <div className="formula-calculator-column">
          {calculatorConfig && (
            <FormulaCalculator
              title={calculatorConfig.title || title}
              formula={formula}
              inputs={calculatorConfig.inputs}
              calculate={calculatorConfig.calculate}
              resultLabel={calculatorConfig.resultLabel}
              resultUnit={calculatorConfig.resultUnit || '€'}
              description={calculatorConfig.description}
            />
          )}
        </div>
      </div>

      {/* Collapsible Detailed Explanation */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="formula-detailed-explanation"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="formula-detailed-content">
              {components && (
                <div className="formula-detailed-section">
                  <h4>Calculation Logic</h4>
                  <ul>
                    <li>✅ Real-time calculation during editing</li>
                    <li>✅ Auto-saves to database when components change</li>
                    <li>✅ Displays with 2 decimal places</li>
                    <li>✅ Shows `-` if result = 0</li>
                  </ul>
                </div>
              )}

              {example && (
                <div className="formula-detailed-section">
                  <h4>Real-World Scenario</h4>
                  <p>{example}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
