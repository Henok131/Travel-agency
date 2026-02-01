import { useState, useEffect, useRef } from 'react'
import { Upload, X, Plus, Trash2, Type, Move, AlignLeft, AlignCenter, AlignRight, Bold, Italic } from 'lucide-react'

// Generate HTML from canvas elements
function generateHeaderHTML(elements) {
  if (!elements || elements.length === 0) {
    return ''
  }
  
  const elementHTML = elements.map(el => {
    const style = `
      position: absolute;
      left: ${el.x}px;
      top: ${el.y}px;
      font-size: ${el.fontSize}px;
      font-weight: ${el.bold ? '600' : '400'};
      font-style: ${el.italic ? 'italic' : 'normal'};
      color: ${el.color};
      text-align: ${el.align};
      font-family: ${el.fontFamily || 'Arial, sans-serif'};
      ${el.width ? `width: ${el.width}px;` : ''}
    `.trim()
    
    const content = el.content || ''
    const tag = el.type === 'heading' ? 'h1' : el.type === 'subheading' ? 'h2' : 'div'
    
    return `<${tag} style="${style}">${content}</${tag}>`
  }).join('\n')
  
  return `<div style="position: relative; width: 100%; height: 100%;">${elementHTML}</div>`
}

export default function HeaderEditor({ templateData, updateTemplate }) {
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [elements, setElements] = useState([])
  const [selectedElement, setSelectedElement] = useState(null)
  const [editingElement, setEditingElement] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const canvasRef = useRef(null)

  // Initialize elements from existing content or create defaults
  useEffect(() => {
    if (templateData.header_content) {
      // Try to parse existing content (simplified - start fresh for now)
      setElements([
        { 
          id: '1', 
          type: 'heading', 
          content: '{{company_name}}', 
          x: 40, 
          y: 20, 
          fontSize: 24, 
          color: '#000000', 
          align: 'left',
          fontFamily: 'Arial, sans-serif',
          bold: true,
          italic: false,
          width: 300
        },
        { 
          id: '2', 
          type: 'text', 
          content: '{{company_contact_person}}\n{{company_address}}\n{{company_postal}}\nEmail: {{company_email}}\nTel: {{company_phone}}', 
          x: 500, 
          y: 20, 
          fontSize: 12, 
          color: '#000000', 
          align: 'right',
          fontFamily: 'Arial, sans-serif',
          bold: false,
          italic: false,
          width: 300
        }
      ])
    } else {
      setElements([
        { 
          id: '1', 
          type: 'heading', 
          content: '{{company_name}}', 
          x: 40, 
          y: 20, 
          fontSize: 24, 
          color: '#000000', 
          align: 'left',
          fontFamily: 'Arial, sans-serif',
          bold: true,
          italic: false,
          width: 300
        },
        { 
          id: '2', 
          type: 'text', 
          content: '{{company_contact_person}}\n{{company_address}}\n{{company_postal}}\nEmail: {{company_email}}\nTel: {{company_phone}}', 
          x: 500, 
          y: 20, 
          fontSize: 12, 
          color: '#000000', 
          align: 'right',
          fontFamily: 'Arial, sans-serif',
          bold: false,
          italic: false,
          width: 300
        }
      ])
    }
  }, [])

  // Generate HTML when elements change
  useEffect(() => {
    const html = generateHeaderHTML(elements)
    if (html) {
      updateTemplate('header_content', html)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements])

  async function handleLogoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }
    
    setUploadingLogo(true)
    
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        updateTemplate('header_logo_url', e.target.result)
        setUploadingLogo(false)
      }
      reader.onerror = () => {
        console.error('Error reading file')
        alert('Failed to read file')
        setUploadingLogo(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Failed to upload logo')
      setUploadingLogo(false)
    }
  }

  function removeLogo() {
    updateTemplate('header_logo_url', null)
  }

  function handleCanvasClick(e) {
    if (e.target === canvasRef.current) {
      setSelectedElement(null)
      setEditingElement(null)
    }
  }

  function handleElementClick(e, element) {
    e.stopPropagation()
    setSelectedElement(element.id)
    setEditingElement(null)
  }

  function handleElementDoubleClick(e, element) {
    e.stopPropagation()
    setEditingElement(element.id)
  }

  const dragStateRef = useRef({ isDragging: false, elementId: null, offset: { x: 0, y: 0 } })

  function handleDragStart(e, element) {
    if (editingElement === element.id) return // Don't drag while editing
    e.stopPropagation()
    e.preventDefault()
    
    dragStateRef.current = {
      isDragging: true,
      elementId: element.id,
      offset: {
        x: e.clientX - element.x,
        y: e.clientY - element.y
      }
    }
    
    setIsDragging(true)
    setSelectedElement(element.id)
  }

  function handleDrag(e) {
    if (!dragStateRef.current.isDragging || !dragStateRef.current.elementId) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - dragStateRef.current.offset.x
    const y = e.clientY - rect.top - dragStateRef.current.offset.y
    
    setElements(prev => prev.map(el => 
      el.id === dragStateRef.current.elementId 
        ? { ...el, x: Math.max(0, Math.min(x, rect.width - (el.width || 100))), y: Math.max(0, y) }
        : el
    ))
  }

  function handleDragEnd() {
    dragStateRef.current = { isDragging: false, elementId: null, offset: { x: 0, y: 0 } }
    setIsDragging(false)
  }

  function updateElement(id, updates) {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ))
  }

  function deleteElement(id) {
    setElements(elements.filter(el => el.id !== id))
    setSelectedElement(null)
  }

  function addElement(type) {
    const newElement = {
      id: Date.now().toString(),
      type: type === 'heading' ? 'heading' : 'text',
      content: type === 'heading' ? '{{company_name}}' : 'Enter text here...',
      x: 40,
      y: elements.length * 60 + 20,
      fontSize: type === 'heading' ? 24 : 14,
      color: '#000000',
      align: 'left',
      fontFamily: templateData.header_font_family || 'Arial, sans-serif',
      bold: type === 'heading',
      italic: false,
      width: 300
    }
    setElements([...elements, newElement])
    setSelectedElement(newElement.id)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDrag)
      document.addEventListener('mouseup', handleDragEnd)
      return () => {
        document.removeEventListener('mousemove', handleDrag)
        document.removeEventListener('mouseup', handleDragEnd)
      }
    }
  }, [isDragging])

  const selectedEl = elements.find(el => el.id === selectedElement)
  const editingEl = elements.find(el => el.id === editingElement)

  return (
    <div className="editor-section">
      <h3 className="section-title">Header Customization</h3>
      <p className="section-description">
        Customize your invoice header with logo and company information
      </p>

      {/* Logo Upload */}
      <div className="form-group">
        <label>Company Logo</label>
        {templateData.header_logo_url ? (
          <div className="logo-preview-container">
            <img 
              src={templateData.header_logo_url} 
              alt="Logo" 
              className="logo-preview"
            />
            <button 
              className="btn-icon-danger"
              onClick={removeLogo}
              title="Remove logo"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label className="file-upload-area">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              style={{ display: 'none' }}
              disabled={uploadingLogo}
            />
            <Upload size={24} />
            <span>{uploadingLogo ? 'Uploading...' : 'Click to upload logo'}</span>
            <span className="upload-hint">PNG, JPG, SVG (max 5MB)</span>
          </label>
        )}
      </div>

      {/* Canvas Area */}
      <div className="form-group">
        <label>Header Content Canvas</label>
        <p className="field-hint">
          Click to select, double-click to edit, drag to move
        </p>
        
        <div 
          ref={canvasRef}
          className="header-canvas"
          onClick={handleCanvasClick}
          style={{
            position: 'relative',
            width: '100%',
            height: `${templateData.header_height ?? 120}px`,
            border: '2px dashed var(--border-color)',
            borderRadius: '6px',
            background: templateData.header_bg_color || '#ffffff',
            padding: `${templateData.header_padding_top || 20}px ${templateData.header_padding_right || 40}px ${templateData.header_padding_bottom || 20}px ${templateData.header_padding_left || 40}px`,
            boxSizing: 'border-box',
            overflow: 'hidden',
            cursor: isDragging ? 'grabbing' : 'default'
          }}
        >
          {elements.map(element => (
            <div
              key={element.id}
              className={`canvas-element ${selectedElement === element.id ? 'selected' : ''}`}
              style={{
                position: 'absolute',
                left: `${element.x}px`,
                top: `${element.y}px`,
                fontSize: `${element.fontSize}px`,
                fontWeight: element.bold ? '600' : '400',
                fontStyle: element.italic ? 'italic' : 'normal',
                color: element.color,
                textAlign: element.align,
                fontFamily: element.fontFamily,
                width: element.width ? `${element.width}px` : 'auto',
                cursor: editingElement === element.id ? 'text' : 'move',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: selectedElement === element.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                border: selectedElement === element.id ? '2px solid #3b82f6' : '2px solid transparent',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word'
              }}
              onClick={(e) => handleElementClick(e, element)}
              onDoubleClick={(e) => handleElementDoubleClick(e, element)}
              onMouseDown={(e) => {
                if (editingElement !== element.id) {
                  handleDragStart(e, element)
                }
              }}
            >
              {editingElement === element.id ? (
                <div>
                  <textarea
                    value={element.content}
                    onChange={(e) => updateElement(element.id, { content: e.target.value })}
                    onBlur={() => setEditingElement(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && e.ctrlKey) {
                        e.preventDefault()
                        setEditingElement(null)
                      }
                      if (e.key === 'Escape') {
                        setEditingElement(null)
                      }
                    }}
                    autoFocus
                    style={{
                      width: '100%',
                      minHeight: '60px',
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontSize: `${element.fontSize}px`,
                      fontWeight: element.bold ? '600' : '400',
                      fontStyle: element.italic ? 'italic' : 'normal',
                      color: element.color,
                      fontFamily: element.fontFamily,
                      resize: 'both',
                      overflow: 'auto'
                    }}
                  />
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '8px', 
                    background: 'rgba(0,0,0,0.05)', 
                    borderRadius: '4px',
                    fontSize: '10px',
                    color: 'var(--text-muted)'
                  }}>
                    <strong>Variables:</strong> {'{{company_name}}'}, {'{{company_phone}}'}, {'{{company_email}}'}, {'{{company_address}}'}, {'{{company_postal}}'}, {'{{company_contact_person}}'}, {'{{company_mobile}}'}
                    <br />
                    <span style={{ fontSize: '9px' }}>Press Ctrl+Enter to finish editing</span>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  minHeight: '20px',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word'
                }}>
                  {element.content || 'Empty'}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Elements */}
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={() => addElement('heading')}
            type="button"
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            <Type size={14} /> Add Heading
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => addElement('text')}
            type="button"
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            <Type size={14} /> Add Text
          </button>
        </div>
      </div>

      {/* Element Properties Panel */}
      {selectedEl && (
        <div className="form-group" style={{ 
          marginTop: '20px', 
          padding: '16px', 
          background: 'var(--bg-subtle)', 
          borderRadius: '6px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <strong>Edit Element</strong>
            <button
              className="btn-icon-small btn-icon-danger"
              onClick={() => deleteElement(selectedEl.id)}
              type="button"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Font Size */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
              Font Size
            </label>
            <div className="input-with-unit">
              <input
                type="number"
                value={selectedEl.fontSize}
                onChange={(e) => updateElement(selectedEl.id, { fontSize: parseInt(e.target.value) || 12 })}
                min="8"
                max="72"
              />
              <span className="unit">px</span>
            </div>
          </div>

          {/* Text Alignment */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
              Alignment
            </label>
            <div className="button-group">
              <button
                className={`btn-group-item ${selectedEl.align === 'left' ? 'active' : ''}`}
                onClick={() => updateElement(selectedEl.id, { align: 'left' })}
                type="button"
              >
                <AlignLeft size={14} />
              </button>
              <button
                className={`btn-group-item ${selectedEl.align === 'center' ? 'active' : ''}`}
                onClick={() => updateElement(selectedEl.id, { align: 'center' })}
                type="button"
              >
                <AlignCenter size={14} />
              </button>
              <button
                className={`btn-group-item ${selectedEl.align === 'right' ? 'active' : ''}`}
                onClick={() => updateElement(selectedEl.id, { align: 'right' })}
                type="button"
              >
                <AlignRight size={14} />
              </button>
            </div>
          </div>

          {/* Bold & Italic */}
          <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
            <button
              className={`btn-group-item ${selectedEl.bold ? 'active' : ''}`}
              onClick={() => updateElement(selectedEl.id, { bold: !selectedEl.bold })}
              type="button"
              style={{ flex: 1 }}
            >
              <Bold size={14} /> Bold
            </button>
            <button
              className={`btn-group-item ${selectedEl.italic ? 'active' : ''}`}
              onClick={() => updateElement(selectedEl.id, { italic: !selectedEl.italic })}
              type="button"
              style={{ flex: 1 }}
            >
              <Italic size={14} /> Italic
            </button>
          </div>

          {/* Text Color */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
              Text Color
            </label>
            <div className="color-picker-group">
              <input
                type="color"
                value={selectedEl.color}
                onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
              />
              <input
                type="text"
                value={selectedEl.color}
                onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                placeholder="#000000"
                className="color-text-input"
              />
            </div>
          </div>

          {/* Font Family */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
              Font Family
            </label>
            <select
              value={selectedEl.fontFamily}
              onChange={(e) => updateElement(selectedEl.id, { fontFamily: e.target.value })}
              style={{ width: '100%' }}
            >
              <option value="Arial, sans-serif">Arial</option>
              <option value="Helvetica, sans-serif">Helvetica</option>
              <option value="Times New Roman, serif">Times New Roman</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Courier New, monospace">Courier New</option>
              <option value="Verdana, sans-serif">Verdana</option>
              <option value="Inter, sans-serif">Inter</option>
              <option value="Roboto, sans-serif">Roboto</option>
            </select>
          </div>

          {/* Width */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
              Width
            </label>
            <div className="input-with-unit">
              <input
                type="number"
                value={selectedEl.width || 300}
                onChange={(e) => updateElement(selectedEl.id, { width: parseInt(e.target.value) || 300 })}
                min="50"
                max="800"
              />
              <span className="unit">px</span>
            </div>
          </div>
        </div>
      )}

      {/* Height */}
      <div className="form-group">
        <label>Header Height</label>
        <div className="input-with-unit">
          <input
            type="number"
            value={templateData.header_height ?? 120}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : parseInt(e.target.value)
              updateTemplate('header_height', isNaN(value) ? 0 : value)
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
            value={templateData.header_bg_color || '#ffffff'}
            onChange={(e) => updateTemplate('header_bg_color', e.target.value)}
          />
          <input
            type="text"
            value={templateData.header_bg_color || '#ffffff'}
            onChange={(e) => updateTemplate('header_bg_color', e.target.value)}
            placeholder="#ffffff"
            className="color-text-input"
          />
        </div>
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
                value={templateData.header_padding_top || 20}
                onChange={(e) => updateTemplate('header_padding_top', parseInt(e.target.value) || 20)}
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
                value={templateData.header_padding_right || 40}
                onChange={(e) => updateTemplate('header_padding_right', parseInt(e.target.value) || 40)}
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
                value={templateData.header_padding_bottom || 20}
                onChange={(e) => updateTemplate('header_padding_bottom', parseInt(e.target.value) || 20)}
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
                value={templateData.header_padding_left || 40}
                onChange={(e) => updateTemplate('header_padding_left', parseInt(e.target.value) || 40)}
                min="0"
              />
              <span className="unit">px</span>
            </div>
          </div>
        </div>
      </div>

      {/* Border Bottom */}
      <div className="form-group">
        <label>Border Bottom</label>
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="header-border-bottom"
            checked={templateData.header_border_bottom || false}
            onChange={(e) => updateTemplate('header_border_bottom', e.target.checked)}
          />
          <label htmlFor="header-border-bottom" className="checkbox-label">
            Show border line below header
          </label>
        </div>
      </div>

      {templateData.header_border_bottom && (
        <>
          <div className="form-group">
            <label>Border Color</label>
            <div className="color-picker-group">
              <input
                type="color"
                value={templateData.header_border_color || '#000000'}
                onChange={(e) => updateTemplate('header_border_color', e.target.value)}
              />
              <input
                type="text"
                value={templateData.header_border_color || '#000000'}
                onChange={(e) => updateTemplate('header_border_color', e.target.value)}
                placeholder="#000000"
                className="color-text-input"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Border Width</label>
            <div className="input-with-unit">
              <input
                type="number"
                value={templateData.header_border_width || 1}
                onChange={(e) => updateTemplate('header_border_width', parseInt(e.target.value) || 1)}
                min="0"
              />
              <span className="unit">px</span>
            </div>
          </div>
        </>
      )}

      {/* Reset Button */}
      <div className="form-group">
        <button 
          className="btn btn-secondary btn-full"
          onClick={() => {
            if (confirm('Reset header to default settings?')) {
              updateTemplate('header_content', '')
              updateTemplate('header_logo_url', null)
              updateTemplate('header_height', 120)
              updateTemplate('header_bg_color', '#ffffff')
              updateTemplate('header_padding_top', 20)
              updateTemplate('header_padding_right', 40)
              updateTemplate('header_padding_bottom', 20)
              updateTemplate('header_padding_left', 40)
              updateTemplate('header_border_bottom', false)
              updateTemplate('header_border_color', '#000000')
              updateTemplate('header_border_width', 1)
              setElements([
                { 
                  id: '1', 
                  type: 'heading', 
                  content: '{{company_name}}', 
                  x: 40, 
                  y: 20, 
                  fontSize: 24, 
                  color: '#000000', 
                  align: 'left',
                  fontFamily: 'Arial, sans-serif',
                  bold: true,
                  italic: false,
                  width: 300
                }
              ])
              setSelectedElement(null)
            }
          }}
          type="button"
        >
          Reset Header to Default
        </button>
      </div>
    </div>
  )
}
