import React from 'react'

export default function ColorsEditor({ templateData, updateTemplate }) {
  return (
    <div className="editor-section">
      <h3 className="section-title">Color Scheme</h3>
      <p className="section-description">Global colors used throughout the invoice</p>

      {/* Primary Color */}
      <div className="form-group">
        <label>Primary Color</label>
        <div className="color-picker-group">
          <input 
            type="color" 
            value={templateData.primary_color || '#2563eb'}
            onChange={(e) => updateTemplate('primary_color', e.target.value)} 
          />
          <input 
            type="text" 
            value={templateData.primary_color || '#2563eb'}
            onChange={(e) => updateTemplate('primary_color', e.target.value)}
            placeholder="#2563eb" 
            className="color-text-input" 
          />
        </div>
        <p className="field-hint">Main brand color (buttons, highlights)</p>
      </div>

      {/* Secondary Color */}
      <div className="form-group">
        <label>Secondary Color</label>
        <div className="color-picker-group">
          <input 
            type="color" 
            value={templateData.secondary_color || '#64748b'}
            onChange={(e) => updateTemplate('secondary_color', e.target.value)} 
          />
          <input 
            type="text" 
            value={templateData.secondary_color || '#64748b'}
            onChange={(e) => updateTemplate('secondary_color', e.target.value)}
            placeholder="#64748b" 
            className="color-text-input" 
          />
        </div>
        <p className="field-hint">Secondary elements (labels, muted text)</p>
      </div>

      {/* Border Color */}
      <div className="form-group">
        <label>Border Color</label>
        <div className="color-picker-group">
          <input 
            type="color" 
            value={templateData.border_color || '#e2e8f0'}
            onChange={(e) => updateTemplate('border_color', e.target.value)} 
          />
          <input 
            type="text" 
            value={templateData.border_color || '#e2e8f0'}
            onChange={(e) => updateTemplate('border_color', e.target.value)}
            placeholder="#e2e8f0" 
            className="color-text-input" 
          />
        </div>
        <p className="field-hint">Default border color for sections</p>
      </div>

      {/* Accent Color */}
      <div className="form-group">
        <label>Accent Color</label>
        <div className="color-picker-group">
          <input 
            type="color" 
            value={templateData.accent_color || '#10b981'}
            onChange={(e) => updateTemplate('accent_color', e.target.value)} 
          />
          <input 
            type="text" 
            value={templateData.accent_color || '#10b981'}
            onChange={(e) => updateTemplate('accent_color', e.target.value)}
            placeholder="#10b981" 
            className="color-text-input" 
          />
        </div>
        <p className="field-hint">Accent elements (success states, badges)</p>
      </div>

      {/* Color Swatches Preview */}
      <div className="form-group">
        <label>Color Preview</label>
        <div className="color-swatches">
          <div className="swatch" style={{ backgroundColor: templateData.primary_color || '#2563eb' }}>
            <span>Primary</span>
          </div>
          <div className="swatch" style={{ backgroundColor: templateData.secondary_color || '#64748b' }}>
            <span>Secondary</span>
          </div>
          <div className="swatch" style={{ backgroundColor: templateData.border_color || '#e2e8f0', color: '#000' }}>
            <span>Border</span>
          </div>
          <div className="swatch" style={{ backgroundColor: templateData.accent_color || '#10b981' }}>
            <span>Accent</span>
          </div>
        </div>
      </div>

      {/* Reset */}
      <div className="form-group">
        <button 
          className="btn btn-secondary btn-full" 
          onClick={() => {
            if (confirm('Reset colors?')) {
              updateTemplate('primary_color', '#2563eb')
              updateTemplate('secondary_color', '#64748b')
              updateTemplate('border_color', '#e2e8f0')
              updateTemplate('accent_color', '#10b981')
            }
          }}
          type="button"
        >
          Reset Colors
        </button>
      </div>
    </div>
  )
}
