import React from 'react'

export default function LayoutEditor({ templateData, updateTemplate }) {
  return (
    <div className="editor-section">
      <h3 className="section-title">Layout & Spacing</h3>
      <p className="section-description">Control page margins and section spacing</p>

      {/* Page Margins - 4 inputs */}
      <div className="form-group">
        <label>Page Margins</label>
        <div className="padding-grid">
          <div className="padding-input">
            <label className="small-label">Top</label>
            <div className="input-with-unit">
              <input 
                type="number" 
                value={templateData.page_margin_top || 40} 
                onChange={(e) => updateTemplate('page_margin_top', parseInt(e.target.value) || 40)} 
                min="0" 
              />
              <span className="unit">px</span>
            </div>
          </div>
          <div className="padding-input">
            <label className="small-label">Right</label>
            <div className="input-with-unit">
              <input 
                type="number" 
                value={templateData.page_margin_right || 40}
                onChange={(e) => updateTemplate('page_margin_right', parseInt(e.target.value) || 40)} 
                min="0" 
              />
              <span className="unit">px</span>
            </div>
          </div>
          <div className="padding-input">
            <label className="small-label">Bottom</label>
            <div className="input-with-unit">
              <input 
                type="number" 
                value={templateData.page_margin_bottom || 40}
                onChange={(e) => updateTemplate('page_margin_bottom', parseInt(e.target.value) || 40)} 
                min="0" 
              />
              <span className="unit">px</span>
            </div>
          </div>
          <div className="padding-input">
            <label className="small-label">Left</label>
            <div className="input-with-unit">
              <input 
                type="number" 
                value={templateData.page_margin_left || 40}
                onChange={(e) => updateTemplate('page_margin_left', parseInt(e.target.value) || 40)} 
                min="0" 
              />
              <span className="unit">px</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Spacing */}
      <div className="form-group">
        <label>Section Spacing</label>
        <div className="input-with-unit">
          <input 
            type="number" 
            value={templateData.section_spacing || 20}
            onChange={(e) => updateTemplate('section_spacing', parseInt(e.target.value) || 20)} 
            min="0" 
          />
          <span className="unit">px</span>
        </div>
        <p className="field-hint">Space between invoice sections</p>
      </div>

      {/* Border Radius */}
      <div className="form-group">
        <label>Border Radius</label>
        <div className="input-with-unit">
          <input 
            type="number" 
            value={templateData.border_radius || 0}
            onChange={(e) => updateTemplate('border_radius', parseInt(e.target.value) || 0)} 
            min="0" 
          />
          <span className="unit">px</span>
        </div>
        <p className="field-hint">Rounded corners (0 = sharp, 6 = slightly rounded)</p>
      </div>

      {/* Reset */}
      <div className="form-group">
        <button 
          className="btn btn-secondary btn-full" 
          onClick={() => {
            if (confirm('Reset layout?')) {
              updateTemplate('page_margin_top', 40)
              updateTemplate('page_margin_right', 40)
              updateTemplate('page_margin_bottom', 40)
              updateTemplate('page_margin_left', 40)
              updateTemplate('section_spacing', 20)
              updateTemplate('border_radius', 0)
            }
          }}
          type="button"
        >
          Reset Layout
        </button>
      </div>
    </div>
  )
}
