import React from 'react'

export default function BodyEditor({ templateData, updateTemplate }) {
  return (
    <div className="editor-section">
      <h3 className="section-title">Body Customization</h3>
      <p className="section-description">
        Customize fonts, colors, spacing for invoice body content
      </p>

      {/* Font Family */}
      <div className="form-group">
        <label>Font Family</label>
        <select
          value={templateData.body_font_family || 'Arial'}
          onChange={(e) => updateTemplate('body_font_family', e.target.value)}
        >
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
          <option value="Inter">Inter (Modern)</option>
          <option value="Roboto">Roboto</option>
          <option value="Open Sans">Open Sans</option>
          <option value="Lato">Lato</option>
          <option value="Montserrat">Montserrat</option>
          <option value="Playfair Display">Playfair Display (Formal)</option>
          <option value="Source Sans Pro">Source Sans Pro</option>
        </select>
      </div>

      {/* Font Size */}
      <div className="form-group">
        <label>Font Size</label>
        <div className="input-with-unit">
          <input
            type="number"
            value={templateData.body_font_size || 14}
            onChange={(e) => updateTemplate('body_font_size', parseInt(e.target.value) || 14)}
            min="0"
          />
          <span className="unit">px</span>
        </div>
        <p className="field-hint">Any value - typically 10-16px for invoices</p>
      </div>

      {/* Line Height */}
      <div className="form-group">
        <label>Line Height</label>
        <div className="input-with-unit">
          <input
            type="number"
            step="0.1"
            value={templateData.body_line_height || 1.6}
            onChange={(e) => updateTemplate('body_line_height', parseFloat(e.target.value) || 1.6)}
            min="0"
          />
          <span className="unit">em</span>
        </div>
        <p className="field-hint">1.0 = tight, 1.5 = normal, 2.0 = loose</p>
      </div>

      {/* Text Color */}
      <div className="form-group">
        <label>Text Color</label>
        <div className="color-picker-group">
          <input
            type="color"
            value={templateData.body_text_color || '#000000'}
            onChange={(e) => updateTemplate('body_text_color', e.target.value)}
          />
          <input
            type="text"
            value={templateData.body_text_color || '#000000'}
            onChange={(e) => updateTemplate('body_text_color', e.target.value)}
            placeholder="#000000"
            className="color-text-input"
          />
        </div>
      </div>

      {/* Background Color */}
      <div className="form-group">
        <label>Background Color</label>
        <div className="color-picker-group">
          <input
            type="color"
            value={templateData.body_bg_color || '#ffffff'}
            onChange={(e) => updateTemplate('body_bg_color', e.target.value)}
          />
          <input
            type="text"
            value={templateData.body_bg_color || '#ffffff'}
            onChange={(e) => updateTemplate('body_bg_color', e.target.value)}
            placeholder="#ffffff"
            className="color-text-input"
          />
        </div>
        <p className="field-hint">Usually white (#ffffff) or light colors</p>
      </div>

      {/* Padding - 4 inputs */}
      <div className="form-group">
        <label>Padding</label>
        <p className="field-hint">Space around body content</p>
        <div className="padding-grid">
          <div className="padding-input">
            <label className="small-label">Top</label>
            <div className="input-with-unit">
              <input
                type="number"
                value={templateData.body_padding_top || 30}
                onChange={(e) => updateTemplate('body_padding_top', parseInt(e.target.value) || 30)}
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
                value={templateData.body_padding_right || 40}
                onChange={(e) => updateTemplate('body_padding_right', parseInt(e.target.value) || 40)}
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
                value={templateData.body_padding_bottom || 30}
                onChange={(e) => updateTemplate('body_padding_bottom', parseInt(e.target.value) || 30)}
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
                value={templateData.body_padding_left || 40}
                onChange={(e) => updateTemplate('body_padding_left', parseInt(e.target.value) || 40)}
                min="0"
              />
              <span className="unit">px</span>
            </div>
          </div>
        </div>
      </div>

      {/* Font Weight (Optional - extra control) */}
      <div className="form-group">
        <label>Font Weight</label>
        <select
          value={templateData.body_font_weight || '400'}
          onChange={(e) => updateTemplate('body_font_weight', e.target.value)}
        >
          <option value="300">Light (300)</option>
          <option value="400">Normal (400)</option>
          <option value="500">Medium (500)</option>
          <option value="600">Semi-Bold (600)</option>
          <option value="700">Bold (700)</option>
        </select>
      </div>

      {/* Letter Spacing (Optional - extra control) */}
      <div className="form-group">
        <label>Letter Spacing</label>
        <div className="input-with-unit">
          <input
            type="number"
            step="0.1"
            value={templateData.body_letter_spacing || 0}
            onChange={(e) => updateTemplate('body_letter_spacing', parseFloat(e.target.value) || 0)}
          />
          <span className="unit">px</span>
        </div>
        <p className="field-hint">0 = normal, negative = tighter, positive = looser</p>
      </div>

      {/* Divider */}
      <div className="section-divider"></div>

      {/* Preview Text */}
      <div className="form-group">
        <label>Preview</label>
        <div 
          className="body-preview"
          style={{
            fontFamily: templateData.body_font_family || 'Arial',
            fontSize: `${templateData.body_font_size || 14}px`,
            lineHeight: templateData.body_line_height || 1.6,
            color: templateData.body_text_color || '#000000',
            backgroundColor: templateData.body_bg_color || '#ffffff',
            padding: '20px',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            fontWeight: templateData.body_font_weight || '400',
            letterSpacing: `${templateData.body_letter_spacing || 0}px`
          }}
        >
          <p><strong>Invoice #INV-2026-1234</strong></p>
          <p>Date: 25. Januar 26</p>
          <p>Passenger: Henok Asenay Petros</p>
          <p>Travel Date: 22. Januar 26 (Berlin - Hahn)</p>
          <p>This is a preview of how your body text will appear in the invoice.</p>
        </div>
      </div>

      {/* Reset Button */}
      <div className="form-group">
        <button 
          className="btn btn-secondary btn-full"
          onClick={() => {
            if (confirm('Reset body styling to default?')) {
              updateTemplate('body_font_family', 'Arial')
              updateTemplate('body_font_size', 14)
              updateTemplate('body_line_height', 1.6)
              updateTemplate('body_text_color', '#000000')
              updateTemplate('body_bg_color', '#ffffff')
              updateTemplate('body_padding_top', 30)
              updateTemplate('body_padding_right', 40)
              updateTemplate('body_padding_bottom', 30)
              updateTemplate('body_padding_left', 40)
              updateTemplate('body_font_weight', '400')
              updateTemplate('body_letter_spacing', 0)
            }
          }}
          type="button"
        >
          Reset Body to Default
        </button>
      </div>
    </div>
  )
}
