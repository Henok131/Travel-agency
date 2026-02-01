import React from 'react'
import { FileText, Printer, Download, Settings } from 'lucide-react'

export default function AdvancedEditor({ templateData, updateTemplate }) {
  return (
    <div className="editor-section">
      <h3 className="section-title">Advanced Settings</h3>
      <p className="section-description">
        Fine-tune page layout, print options, and export settings
      </p>

      {/* Page Settings */}
      <div className="form-group">
        <label>
          <FileText size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
          Page Settings
        </label>
        
        <div className="form-group-row" style={{ marginTop: '12px' }}>
          <label style={{ minWidth: '140px' }}>Page Size</label>
          <select
            value={templateData.page_size || 'A4'}
            onChange={(e) => updateTemplate('page_size', e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="A4">A4 (210 × 297 mm)</option>
            <option value="Letter">Letter (8.5 × 11 in)</option>
            <option value="Legal">Legal (8.5 × 14 in)</option>
            <option value="A3">A3 (297 × 420 mm)</option>
          </select>
        </div>

        <div className="form-group-row" style={{ marginTop: '12px' }}>
          <label style={{ minWidth: '140px' }}>Page Orientation</label>
          <div className="button-group" style={{ flex: 1 }}>
            <button
              className={`btn-group-item ${templateData.page_orientation === 'portrait' ? 'active' : ''}`}
              onClick={() => updateTemplate('page_orientation', 'portrait')}
              type="button"
            >
              Portrait
            </button>
            <button
              className={`btn-group-item ${templateData.page_orientation === 'landscape' ? 'active' : ''}`}
              onClick={() => updateTemplate('page_orientation', 'landscape')}
              type="button"
            >
              Landscape
            </button>
          </div>
        </div>
      </div>

      {/* Print Options */}
      <div className="form-group">
        <label>
          <Printer size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
          Print Options
        </label>

        <div className="form-group-row" style={{ marginTop: '12px' }}>
          <label style={{ minWidth: '140px' }}>Show Page Numbers</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="show_page_numbers"
              checked={templateData.show_page_numbers !== false}
              onChange={(e) => updateTemplate('show_page_numbers', e.target.checked)}
            />
            <label htmlFor="show_page_numbers" className="toggle-label"></label>
          </div>
        </div>

        <div className="form-group-row" style={{ marginTop: '12px' }}>
          <label style={{ minWidth: '140px' }}>Show Watermark</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="show_watermark"
              checked={templateData.show_watermark === true}
              onChange={(e) => updateTemplate('show_watermark', e.target.checked)}
            />
            <label htmlFor="show_watermark" className="toggle-label"></label>
          </div>
        </div>

        {templateData.show_watermark && (
          <div className="form-group-row" style={{ marginTop: '12px', marginLeft: '140px' }}>
            <label style={{ minWidth: '100px' }}>Watermark Text</label>
            <input
              type="text"
              value={templateData.watermark_text || 'DRAFT'}
              onChange={(e) => updateTemplate('watermark_text', e.target.value)}
              placeholder="DRAFT"
              style={{ flex: 1 }}
            />
          </div>
        )}
      </div>

      {/* Export Settings */}
      <div className="form-group">
        <label>
          <Download size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
          Export Settings
        </label>

        <div className="form-group-row" style={{ marginTop: '12px' }}>
          <label style={{ minWidth: '140px' }}>PDF Quality</label>
          <select
            value={templateData.pdf_quality || 'high'}
            onChange={(e) => updateTemplate('pdf_quality', e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="low">Low (Smaller file size)</option>
            <option value="medium">Medium (Balanced)</option>
            <option value="high">High (Best quality)</option>
          </select>
        </div>

        <div className="form-group-row" style={{ marginTop: '12px' }}>
          <label style={{ minWidth: '140px' }}>Include Background Colors</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="include_bg_colors"
              checked={templateData.include_bg_colors !== false}
              onChange={(e) => updateTemplate('include_bg_colors', e.target.checked)}
            />
            <label htmlFor="include_bg_colors" className="toggle-label"></label>
          </div>
        </div>
      </div>

      {/* Visual Effects */}
      <div className="form-group">
        <label>
          <Settings size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
          Visual Effects
        </label>

        <div className="form-group-row" style={{ marginTop: '12px' }}>
          <label style={{ minWidth: '140px' }}>Border Style</label>
          <select
            value={templateData.border_style || 'solid'}
            onChange={(e) => updateTemplate('border_style', e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="none">None</option>
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </div>

        <div className="form-group-row" style={{ marginTop: '12px' }}>
          <label style={{ minWidth: '140px' }}>Border Width</label>
          <div className="input-with-unit" style={{ flex: 1 }}>
            <input
              type="number"
              value={templateData.border_width || 1}
              onChange={(e) => updateTemplate('border_width', parseInt(e.target.value) || 1)}
              min="0"
              max="5"
            />
            <span className="unit">px</span>
          </div>
        </div>

        <div className="form-group-row" style={{ marginTop: '12px' }}>
          <label style={{ minWidth: '140px' }}>Show Shadow</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="show_shadow"
              checked={templateData.show_shadow === true}
              onChange={(e) => updateTemplate('show_shadow', e.target.checked)}
            />
            <label htmlFor="show_shadow" className="toggle-label"></label>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="form-group" style={{ marginTop: '32px' }}>
        <button 
          className="btn btn-secondary btn-full" 
          onClick={() => {
            if (confirm('Reset all advanced settings to default?')) {
              updateTemplate('page_size', 'A4')
              updateTemplate('page_orientation', 'portrait')
              updateTemplate('show_page_numbers', true)
              updateTemplate('show_watermark', false)
              updateTemplate('watermark_text', 'DRAFT')
              updateTemplate('pdf_quality', 'high')
              updateTemplate('include_bg_colors', true)
              updateTemplate('border_style', 'solid')
              updateTemplate('border_width', 1)
              updateTemplate('show_shadow', false)
            }
          }}
          type="button"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}
