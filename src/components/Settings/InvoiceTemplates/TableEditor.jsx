import React from 'react'

export default function TableEditor({ templateData, updateTemplate }) {
  return (
    <div className="editor-section">
      <h3 className="section-title">Table Styling</h3>
      <p className="section-description">
        Customize the appearance of invoice line items table (ticket, visa, total)
      </p>

      {/* Table Header Background */}
      <div className="form-group">
        <label>Header Background Color</label>
        <div className="color-picker-group">
          <input
            type="color"
            value={templateData.table_header_bg_color || '#000000'}
            onChange={(e) => updateTemplate('table_header_bg_color', e.target.value)}
          />
          <input
            type="text"
            value={templateData.table_header_bg_color || '#000000'}
            onChange={(e) => updateTemplate('table_header_bg_color', e.target.value)}
            placeholder="#000000"
            className="color-text-input"
          />
        </div>
        <p className="field-hint">Background color for table headers (Item, Quantity, Price, Total)</p>
      </div>

      {/* Table Header Text Color */}
      <div className="form-group">
        <label>Header Text Color</label>
        <div className="color-picker-group">
          <input
            type="color"
            value={templateData.table_header_text_color || '#ffffff'}
            onChange={(e) => updateTemplate('table_header_text_color', e.target.value)}
          />
          <input
            type="text"
            value={templateData.table_header_text_color || '#ffffff'}
            onChange={(e) => updateTemplate('table_header_text_color', e.target.value)}
            placeholder="#ffffff"
            className="color-text-input"
          />
        </div>
      </div>

      {/* Border Color */}
      <div className="form-group">
        <label>Border Color</label>
        <div className="color-picker-group">
          <input
            type="color"
            value={templateData.table_border_color || '#000000'}
            onChange={(e) => updateTemplate('table_border_color', e.target.value)}
          />
          <input
            type="text"
            value={templateData.table_border_color || '#000000'}
            onChange={(e) => updateTemplate('table_border_color', e.target.value)}
            placeholder="#000000"
            className="color-text-input"
          />
        </div>
        <p className="field-hint">Color for table borders and cell separators</p>
      </div>

      {/* Border Width */}
      <div className="form-group">
        <label>Border Width</label>
        <div className="input-with-unit">
          <input
            type="number"
            value={templateData.table_border_width || 1}
            onChange={(e) => updateTemplate('table_border_width', parseInt(e.target.value) || 1)}
            min="0"
          />
          <span className="unit">px</span>
        </div>
        <p className="field-hint">0 = no borders, 1-3 = typical</p>
      </div>

      {/* Alternate Row Background */}
      <div className="form-group">
        <label>Alternate Row Background</label>
        <div className="color-picker-group">
          <input
            type="color"
            value={templateData.table_row_alternate_bg || '#f8f9fa'}
            onChange={(e) => updateTemplate('table_row_alternate_bg', e.target.value)}
          />
          <input
            type="text"
            value={templateData.table_row_alternate_bg || '#f8f9fa'}
            onChange={(e) => updateTemplate('table_row_alternate_bg', e.target.value)}
            placeholder="#f8f9fa"
            className="color-text-input"
          />
        </div>
        <p className="field-hint">Zebra striping for better readability (use #ffffff for no striping)</p>
      </div>

      {/* Row Background (Regular) */}
      <div className="form-group">
        <label>Regular Row Background</label>
        <div className="color-picker-group">
          <input
            type="color"
            value={templateData.table_row_bg_color || '#ffffff'}
            onChange={(e) => updateTemplate('table_row_bg_color', e.target.value)}
          />
          <input
            type="text"
            value={templateData.table_row_bg_color || '#ffffff'}
            onChange={(e) => updateTemplate('table_row_bg_color', e.target.value)}
            placeholder="#ffffff"
            className="color-text-input"
          />
        </div>
      </div>

      {/* Font Size */}
      <div className="form-group">
        <label>Font Size</label>
        <div className="input-with-unit">
          <input
            type="number"
            value={templateData.table_font_size || 13}
            onChange={(e) => updateTemplate('table_font_size', parseInt(e.target.value) || 13)}
            min="0"
          />
          <span className="unit">px</span>
        </div>
        <p className="field-hint">Font size for table content</p>
      </div>

      {/* Cell Padding */}
      <div className="form-group">
        <label>Cell Padding</label>
        <div className="input-with-unit">
          <input
            type="number"
            value={templateData.table_cell_padding || 10}
            onChange={(e) => updateTemplate('table_cell_padding', parseInt(e.target.value) || 10)}
            min="0"
          />
          <span className="unit">px</span>
        </div>
        <p className="field-hint">Space inside table cells</p>
      </div>

      {/* Header Font Weight */}
      <div className="form-group">
        <label>Header Font Weight</label>
        <select
          value={templateData.table_header_font_weight || '600'}
          onChange={(e) => updateTemplate('table_header_font_weight', e.target.value)}
        >
          <option value="400">Normal (400)</option>
          <option value="500">Medium (500)</option>
          <option value="600">Semi-Bold (600)</option>
          <option value="700">Bold (700)</option>
        </select>
      </div>

      {/* Text Alignment for Numbers */}
      <div className="form-group">
        <label>Number Column Alignment</label>
        <div className="button-group">
          <button
            className={`btn-group-item ${templateData.table_number_align === 'left' ? 'active' : ''}`}
            onClick={() => updateTemplate('table_number_align', 'left')}
            type="button"
          >
            Left
          </button>
          <button
            className={`btn-group-item ${templateData.table_number_align === 'center' ? 'active' : ''}`}
            onClick={() => updateTemplate('table_number_align', 'center')}
            type="button"
          >
            Center
          </button>
          <button
            className={`btn-group-item ${(templateData.table_number_align === 'right' || !templateData.table_number_align) ? 'active' : ''}`}
            onClick={() => updateTemplate('table_number_align', 'right')}
            type="button"
          >
            Right
          </button>
        </div>
        <p className="field-hint">Alignment for price and total columns</p>
      </div>

      {/* Total Row Styling */}
      <div className="form-group">
        <label>Total Row Background</label>
        <div className="color-picker-group">
          <input
            type="color"
            value={templateData.table_total_bg_color || '#f1f5f9'}
            onChange={(e) => updateTemplate('table_total_bg_color', e.target.value)}
          />
          <input
            type="text"
            value={templateData.table_total_bg_color || '#f1f5f9'}
            onChange={(e) => updateTemplate('table_total_bg_color', e.target.value)}
            placeholder="#f1f5f9"
            className="color-text-input"
          />
        </div>
        <p className="field-hint">Highlight color for total/sum row</p>
      </div>

      <div className="form-group">
        <label>Total Row Font Weight</label>
        <select
          value={templateData.table_total_font_weight || '700'}
          onChange={(e) => updateTemplate('table_total_font_weight', e.target.value)}
        >
          <option value="500">Medium (500)</option>
          <option value="600">Semi-Bold (600)</option>
          <option value="700">Bold (700)</option>
        </select>
      </div>

      {/* Divider */}
      <div className="section-divider"></div>

      {/* Preview Table */}
      <div className="form-group">
        <label>Preview</label>
        <div className="table-preview-container">
          <table 
            className="table-preview"
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: `${templateData.table_font_size || 13}px`,
              border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: templateData.table_header_bg_color || '#000000',
                  color: templateData.table_header_text_color || '#ffffff',
                  fontWeight: templateData.table_header_font_weight || '600'
                }}
              >
                <th style={{ 
                  padding: `${templateData.table_cell_padding || 10}px`,
                  border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`,
                  textAlign: 'left'
                }}>
                  Item
                </th>
                <th style={{ 
                  padding: `${templateData.table_cell_padding || 10}px`,
                  border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`,
                  textAlign: templateData.table_number_align || 'right'
                }}>
                  Quantity
                </th>
                <th style={{ 
                  padding: `${templateData.table_cell_padding || 10}px`,
                  border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`,
                  textAlign: templateData.table_number_align || 'right'
                }}>
                  Price
                </th>
                <th style={{ 
                  padding: `${templateData.table_cell_padding || 10}px`,
                  border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`,
                  textAlign: templateData.table_number_align || 'right'
                }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ backgroundColor: templateData.table_row_bg_color || '#ffffff' }}>
                <td style={{ 
                  padding: `${templateData.table_cell_padding || 10}px`,
                  border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`
                }}>
                  Flight Ticket
                </td>
                <td style={{ 
                  padding: `${templateData.table_cell_padding || 10}px`,
                  border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`,
                  textAlign: templateData.table_number_align || 'right'
                }}>
                  1
                </td>
                <td style={{ 
                  padding: `${templateData.table_cell_padding || 10}px`,
                  border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`,
                  textAlign: templateData.table_number_align || 'right'
                }}>
                  12,00
                </td>
                <td style={{ 
                  padding: `${templateData.table_cell_padding || 10}px`,
                  border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`,
                  textAlign: templateData.table_number_align || 'right'
                }}>
                  12,00
                </td>
              </tr>
              <tr style={{ backgroundColor: templateData.table_row_alternate_bg || '#f8f9fa' }}>
                <td style={{ 
                  padding: `${templateData.table_cell_padding || 10}px`,
                  border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`
                }}>
                  Visa Fees
                </td>
                <td style={{ 
                  padding: `${templateData.table_cell_padding || 10}px`,
                  border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`,
                  textAlign: templateData.table_number_align || 'right'
                }}>
                  1
                </td>
                <td style={{ 
                  padding: `${templateData.table_cell_padding || 10}px`,
                  border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`,
                  textAlign: templateData.table_number_align || 'right'
                }}>
                  11,00
                </td>
                <td style={{ 
                  padding: `${templateData.table_cell_padding || 10}px`,
                  border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`,
                  textAlign: templateData.table_number_align || 'right'
                }}>
                  11,00
                </td>
              </tr>
              <tr style={{ 
                backgroundColor: templateData.table_total_bg_color || '#f1f5f9',
                fontWeight: templateData.table_total_font_weight || '700'
              }}>
                <td 
                  colSpan="3" 
                  style={{ 
                    padding: `${templateData.table_cell_padding || 10}px`,
                    border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`,
                    textAlign: 'right'
                  }}
                >
                  <strong>Total Amount</strong>
                </td>
                <td style={{ 
                  padding: `${templateData.table_cell_padding || 10}px`,
                  border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`,
                  textAlign: templateData.table_number_align || 'right'
                }}>
                  <strong>23,00 €</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Button */}
      <div className="form-group">
        <button 
          className="btn btn-secondary btn-full"
          onClick={() => {
            if (confirm('Reset table styling to default?')) {
              updateTemplate('table_header_bg_color', '#000000')
              updateTemplate('table_header_text_color', '#ffffff')
              updateTemplate('table_border_color', '#000000')
              updateTemplate('table_border_width', 1)
              updateTemplate('table_row_alternate_bg', '#f8f9fa')
              updateTemplate('table_row_bg_color', '#ffffff')
              updateTemplate('table_font_size', 13)
              updateTemplate('table_cell_padding', 10)
              updateTemplate('table_header_font_weight', '600')
              updateTemplate('table_number_align', 'right')
              updateTemplate('table_total_bg_color', '#f1f5f9')
              updateTemplate('table_total_font_weight', '700')
            }
          }}
          type="button"
        >
          Reset Table to Default
        </button>
      </div>
    </div>
  )
}
