import React from 'react'

export default function FooterEditor({ templateData, updateTemplate }) {
  return (
    <div className="editor-section">
      <h3 className="section-title">Footer Customization</h3>
      <p className="section-description">
        Customize your invoice footer with company details, bank info, and legal text
      </p>

      {/* Footer Content */}
      <div className="form-group">
        <label>Footer Content</label>
        <p className="field-hint">
          Add bank details, tax ID, terms. Use variables like {'{{bank_iban}}'}, {'{{tax_id}}'}
        </p>
        <textarea
          value={templateData.footer_content || ''}
          onChange={(e) => updateTemplate('footer_content', e.target.value)}
          rows={10}
          placeholder="Enter footer content with bank details, terms, etc..."
        />
      </div>

      {/* Height */}
      <div className="form-group">
        <label>Footer Height</label>
        <div className="input-with-unit">
          <input
            type="number"
            value={templateData.footer_height ?? 80}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : parseInt(e.target.value)
              updateTemplate('footer_height', isNaN(value) ? 0 : value)
            }}
            min="0"
          />
          <span className="unit">px</span>
        </div>
        <p className="field-hint">Any value including 0 - adjust to fit your content</p>
      </div>

      {/* Background Color */}
      <div className="form-group">
        <label>Background Color</label>
        <div className="color-picker-group">
          <input
            type="color"
            value={templateData.footer_bg_color || '#f8f9fa'}
            onChange={(e) => updateTemplate('footer_bg_color', e.target.value)}
          />
          <input
            type="text"
            value={templateData.footer_bg_color || '#f8f9fa'}
            onChange={(e) => updateTemplate('footer_bg_color', e.target.value)}
            placeholder="#f8f9fa"
            className="color-text-input"
          />
        </div>
        <p className="field-hint">Often light gray or white for footers</p>
      </div>

      {/* Padding - 4 inputs */}
      <div className="form-group">
        <label>Padding</label>
        <div className="padding-grid">
          <div className="padding-input">
            <label className="small-label">Top</label>
            <div className="input-with-unit">
              <input
                type="number"
                value={templateData.footer_padding_top || 15}
                onChange={(e) => updateTemplate('footer_padding_top', parseInt(e.target.value) || 15)}
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
                value={templateData.footer_padding_right || 40}
                onChange={(e) => updateTemplate('footer_padding_right', parseInt(e.target.value) || 40)}
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
                value={templateData.footer_padding_bottom || 15}
                onChange={(e) => updateTemplate('footer_padding_bottom', parseInt(e.target.value) || 15)}
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
                value={templateData.footer_padding_left || 40}
                onChange={(e) => updateTemplate('footer_padding_left', parseInt(e.target.value) || 40)}
                min="0"
              />
              <span className="unit">px</span>
            </div>
          </div>
        </div>
      </div>

      {/* Font Family */}
      <div className="form-group">
        <label>Font Family</label>
        <select
          value={templateData.footer_font_family || 'Arial'}
          onChange={(e) => updateTemplate('footer_font_family', e.target.value)}
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
        </select>
      </div>

      {/* Font Size */}
      <div className="form-group">
        <label>Font Size</label>
        <div className="input-with-unit">
          <input
            type="number"
            value={templateData.footer_font_size || 11}
            onChange={(e) => updateTemplate('footer_font_size', parseInt(e.target.value) || 11)}
            min="0"
          />
          <span className="unit">px</span>
        </div>
        <p className="field-hint">Usually smaller than body text (9-12px)</p>
      </div>

      {/* Text Color */}
      <div className="form-group">
        <label>Text Color</label>
        <div className="color-picker-group">
          <input
            type="color"
            value={templateData.footer_text_color || '#64748b'}
            onChange={(e) => updateTemplate('footer_text_color', e.target.value)}
          />
          <input
            type="text"
            value={templateData.footer_text_color || '#64748b'}
            onChange={(e) => updateTemplate('footer_text_color', e.target.value)}
            placeholder="#64748b"
            className="color-text-input"
          />
        </div>
        <p className="field-hint">Often gray or muted colors for footers</p>
      </div>

      {/* Text Alignment */}
      <div className="form-group">
        <label>Text Alignment</label>
        <div className="button-group">
          <button
            className={`btn-group-item ${templateData.footer_text_align === 'left' ? 'active' : ''}`}
            onClick={() => updateTemplate('footer_text_align', 'left')}
            type="button"
          >
            Left
          </button>
          <button
            className={`btn-group-item ${templateData.footer_text_align === 'center' ? 'active' : ''}`}
            onClick={() => updateTemplate('footer_text_align', 'center')}
            type="button"
          >
            Center
          </button>
          <button
            className={`btn-group-item ${templateData.footer_text_align === 'right' ? 'active' : ''}`}
            onClick={() => updateTemplate('footer_text_align', 'right')}
            type="button"
          >
            Right
          </button>
        </div>
      </div>

      {/* Font Weight */}
      <div className="form-group">
        <label>Font Weight</label>
        <select
          value={templateData.footer_font_weight || '400'}
          onChange={(e) => updateTemplate('footer_font_weight', e.target.value)}
        >
          <option value="300">Light (300)</option>
          <option value="400">Normal (400)</option>
          <option value="500">Medium (500)</option>
          <option value="600">Semi-Bold (600)</option>
          <option value="700">Bold (700)</option>
        </select>
      </div>

      {/* Line Height */}
      <div className="form-group">
        <label>Line Height</label>
        <div className="input-with-unit">
          <input
            type="number"
            step="0.1"
            value={templateData.footer_line_height || 1.6}
            onChange={(e) => updateTemplate('footer_line_height', parseFloat(e.target.value) || 1.6)}
            min="0"
          />
          <span className="unit">em</span>
        </div>
        <p className="field-hint">1.0 = tight, 1.5 = normal, 2.0 = loose</p>
      </div>

      {/* Border Top */}
      <div className="form-group">
        <label>Top Border Line</label>
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="footer-border-top"
            checked={templateData.footer_border_top || false}
            onChange={(e) => updateTemplate('footer_border_top', e.target.checked)}
          />
          <label htmlFor="footer-border-top" className="checkbox-label">
            Show border line above footer
          </label>
        </div>
      </div>

      {templateData.footer_border_top && (
        <>
          <div className="form-group">
            <label>Border Color</label>
            <div className="color-picker-group">
              <input
                type="color"
                value={templateData.footer_border_color || '#e2e8f0'}
                onChange={(e) => updateTemplate('footer_border_color', e.target.value)}
              />
              <input
                type="text"
                value={templateData.footer_border_color || '#e2e8f0'}
                onChange={(e) => updateTemplate('footer_border_color', e.target.value)}
                placeholder="#e2e8f0"
                className="color-text-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Border Width</label>
            <div className="input-with-unit">
              <input
                type="number"
                value={templateData.footer_border_width || 1}
                onChange={(e) => updateTemplate('footer_border_width', parseInt(e.target.value) || 1)}
                min="0"
              />
              <span className="unit">px</span>
            </div>
          </div>
        </>
      )}

      {/* Divider */}
      <div className="section-divider"></div>

      {/* Preview */}
      <div className="form-group">
        <label>Preview</label>
        <div 
          className="footer-preview"
          style={{
            fontFamily: templateData.footer_font_family || 'Arial',
            fontSize: `${templateData.footer_font_size || 11}px`,
            color: templateData.footer_text_color || '#64748b',
            backgroundColor: templateData.footer_bg_color || '#f8f9fa',
            padding: '15px 20px',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            textAlign: templateData.footer_text_align || 'center',
            fontWeight: templateData.footer_font_weight || '400',
            lineHeight: templateData.footer_line_height || 1.6,
            borderTop: templateData.footer_border_top 
              ? `${templateData.footer_border_width || 1}px solid ${templateData.footer_border_color || '#e2e8f0'}`
              : 'none'
          }}
        >
          <div><strong>LST Travel Agency</strong></div>
          <div>UST-ID DE300414297 | www.lst-travel.de</div>
          <div style={{ marginTop: '8px' }}>
            <strong>Geschäftskonto</strong><br/>
            Commerzbank AG | IBAN DE28 5134 0013 0185 3597 00
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="form-group">
        <button 
          className="btn btn-secondary btn-full"
          onClick={() => {
            if (confirm('Reset footer to default settings?')) {
              updateTemplate('footer_content', '')
              updateTemplate('footer_height', 80)
              updateTemplate('footer_bg_color', '#f8f9fa')
              updateTemplate('footer_padding_top', 15)
              updateTemplate('footer_padding_right', 40)
              updateTemplate('footer_padding_bottom', 15)
              updateTemplate('footer_padding_left', 40)
              updateTemplate('footer_font_family', 'Arial')
              updateTemplate('footer_font_size', 11)
              updateTemplate('footer_text_color', '#64748b')
              updateTemplate('footer_text_align', 'center')
              updateTemplate('footer_font_weight', '400')
              updateTemplate('footer_line_height', 1.6)
              updateTemplate('footer_border_top', false)
              updateTemplate('footer_border_color', '#e2e8f0')
              updateTemplate('footer_border_width', 1)
            }
          }}
          type="button"
        >
          Reset Footer to Default
        </button>
      </div>
    </div>
  )
}
