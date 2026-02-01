import { useState, useEffect, useRef } from 'react'
import { replaceInvoiceVariables } from '../../../utils/invoiceVariables'
import { Move, Edit2, Trash2, Plus, Minus } from 'lucide-react'

export default function InteractivePreview({ templateData, updateTemplate, bookingData }) {
  const [editableElements, setEditableElements] = useState([])
  const [selectedElement, setSelectedElement] = useState(null)
  const [editingElement, setEditingElement] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const previewRef = useRef(null)
  const dragStateRef = useRef({ isDragging: false, elementId: null, offset: { x: 0, y: 0 } })

  // Sample booking data
  const sampleBooking = bookingData || {
    booking_id: 'ABC123',
    first_name: 'Henok',
    middle_name: 'Asenay',
    last_name: 'Petros',
    passport_number: 'G4576879867',
    nationality: 'Eritrea',
    travel_date: '2026-01-22',
    return_date: '2026-01-31',
    departure_airport: 'FRA, Frankfurt Airport, Frankfurt',
    arrival_airport: 'HHN, Hahn Airport, Berlin',
    airline_name: 'Ethiopian Airlines (ET)',
    pnr: 'TBD',
    total_ticket_price: 12.00,
    tot_visa_fees: 11.00,
    hotel_charges: 0,
    total_amount_due: 23.00,
    cash_paid: 0,
    bank_transfer: 644,
    payment_balance: 'Fully Paid'
  }

  // Initialize editable elements from template
  useEffect(() => {
    const elements = []
    
    // Logo element
    if (templateData.header_logo_url) {
      elements.push({
        id: 'logo',
        type: 'image',
        content: '',
        x: templateData.logo_x || 40,
        y: templateData.logo_y || 20,
        width: templateData.logo_width || 150,
        height: templateData.logo_height || 80,
        imageUrl: templateData.header_logo_url,
        zIndex: 10
      })
    }

    // Company name
    elements.push({
      id: 'company-name',
      type: 'text',
      content: '{{company_name}}',
      x: templateData.company_name_x || (templateData.header_logo_url ? 220 : 40),
      y: templateData.company_name_y || 30,
      fontSize: templateData.header_font_size || 24,
      color: templateData.header_text_color || '#000000',
      align: templateData.header_text_align || 'left',
      fontFamily: templateData.header_font_family || 'Arial, sans-serif',
      bold: true,
      width: 400,
      zIndex: 9
    })

    // Contact info
    elements.push({
      id: 'contact-info',
      type: 'text',
      content: '{{company_contact_person}}\n{{company_address}}\n{{company_postal}}\nEmail: {{company_email}}\nTel: {{company_phone}}',
      x: templateData.contact_info_x || 600,
      y: templateData.contact_info_y || 30,
      fontSize: 12,
      color: '#000000',
      align: 'right',
      fontFamily: 'Arial, sans-serif',
      bold: false,
      width: 300,
      zIndex: 9
    })

    // Invoice number
    elements.push({
      id: 'invoice-number',
      type: 'text',
      content: 'Rechnungsnummer: {{invoice_number}}',
      x: templateData.invoice_number_x || 40,
      y: templateData.invoice_number_y || 150,
      fontSize: 12,
      color: '#000000',
      align: 'left',
      fontFamily: 'Arial, sans-serif',
      bold: false,
      width: 400,
      zIndex: 8
    })

    // Date
    elements.push({
      id: 'invoice-date',
      type: 'text',
      content: 'Datum: {{invoice_date}}',
      x: templateData.invoice_date_x || 40,
      y: templateData.invoice_date_y || 180,
      fontSize: 12,
      color: '#000000',
      align: 'left',
      fontFamily: 'Arial, sans-serif',
      bold: false,
      width: 400,
      zIndex: 8
    })

    // Payment method
    elements.push({
      id: 'payment-method',
      type: 'text',
      content: '{{payment_method}}',
      x: templateData.payment_method_x || 40,
      y: templateData.payment_method_y || 210,
      fontSize: 12,
      color: '#000000',
      align: 'left',
      fontFamily: 'Arial, sans-serif',
      bold: true,
      width: 400,
      zIndex: 8
    })

    // Flight details
    elements.push({
      id: 'flight-details',
      type: 'text',
      content: 'Abflug: {{departure_date}} {{departure_airport}}\nRückflug: {{return_date}} {{destination_airport}}\nFluggesellschaften: {{airlines}}',
      x: templateData.flight_details_x || 40,
      y: templateData.flight_details_y || 240,
      fontSize: 12,
      color: '#000000',
      align: 'left',
      fontFamily: 'Arial, sans-serif',
      bold: false,
      width: 500,
      zIndex: 8
    })

    // Table element
    elements.push({
      id: 'table',
      type: 'table',
      content: 'table',
      x: templateData.table_x || 40,
      y: templateData.table_y || 320,
      width: templateData.table_width || 700,
      height: templateData.table_height || 200,
      zIndex: 7
    })

    // Footer content
    if (templateData.footer_content) {
      const footerHTML = replaceInvoiceVariables(templateData.footer_content || '', sampleBooking)
      elements.push({
        id: 'footer',
        type: 'text',
        content: footerHTML.replace(/<[^>]*>/g, ' ').trim() || '{{company_name}}\n{{tax_id}}\n{{website}}',
        x: templateData.footer_x || 40,
        y: templateData.footer_y || 550,
        fontSize: templateData.footer_font_size || 10,
        color: templateData.footer_text_color || '#000000',
        align: templateData.footer_text_align || 'center',
        fontFamily: templateData.footer_font_family || 'Arial, sans-serif',
        bold: false,
        width: 700,
        zIndex: 6
      })
    }

    // Load custom elements if they exist
    if (templateData.custom_elements && Array.isArray(templateData.custom_elements)) {
      elements.push(...templateData.custom_elements)
    }

    setEditableElements(elements)
  }, [templateData, sampleBooking])

  function handleElementClick(e, element) {
    e.stopPropagation()
    if (editingElement !== element.id) {
      setSelectedElement(element.id)
      setEditingElement(null)
    }
  }

  function handleElementDoubleClick(e, element) {
    if (element.type !== 'image' && element.type !== 'table') {
      e.stopPropagation()
      setEditingElement(element.id)
    }
  }

  function handleDragStart(e, element) {
    if (editingElement === element.id) return
    e.stopPropagation()
    e.preventDefault()
    
    const rect = previewRef.current.getBoundingClientRect()
    dragStateRef.current = {
      isDragging: true,
      elementId: element.id,
      offset: {
        x: e.clientX - rect.left - element.x,
        y: e.clientY - rect.top - element.y
      }
    }
    
    setIsDragging(true)
    setSelectedElement(element.id)
  }

  function handleDrag(e) {
    if (!dragStateRef.current.isDragging || !dragStateRef.current.elementId) return
    
    const rect = previewRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - dragStateRef.current.offset.x
    const y = e.clientY - rect.top - dragStateRef.current.offset.y
    
    // Calculate available space (A4 minus padding)
    const paddingLeft = templateData.page_margin_left || 40
    const paddingRight = templateData.page_margin_right || 40
    const paddingTop = templateData.page_margin_top || 40
    const paddingBottom = templateData.page_margin_bottom || 40
    const availableWidth = rect.width - paddingLeft - paddingRight
    const availableHeight = rect.height - paddingTop - paddingBottom
    
    setEditableElements(prev => prev.map(el => {
      if (el.id === dragStateRef.current.elementId) {
        const elementWidth = el.width || 100
        const elementHeight = el.height || 50
        
        // Constrain to A4 bounds (within padding area)
        const constrainedX = Math.max(
          paddingLeft, 
          Math.min(x, rect.width - paddingRight - elementWidth)
        )
        const constrainedY = Math.max(
          paddingTop, 
          Math.min(y, rect.height - paddingBottom - elementHeight)
        )
        
        return { 
          ...el, 
          x: constrainedX, 
          y: constrainedY 
        }
      }
      return el
    }))
  }

  function handleDragEnd() {
    dragStateRef.current = { isDragging: false, elementId: null, offset: { x: 0, y: 0 } }
    setIsDragging(false)
  }

  function updateElement(id, updates) {
    setEditableElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ))
    
    // Update template data based on element type and position
    if (id === 'logo') {
      if (updates.imageUrl !== undefined) updateTemplate('header_logo_url', updates.imageUrl)
      if (updates.x !== undefined) updateTemplate('logo_x', updates.x)
      if (updates.y !== undefined) updateTemplate('logo_y', updates.y)
      if (updates.width !== undefined) updateTemplate('logo_width', updates.width)
      if (updates.height !== undefined) updateTemplate('logo_height', updates.height)
    } else if (id === 'company-name') {
      if (updates.fontSize !== undefined) updateTemplate('header_font_size', updates.fontSize)
      if (updates.color !== undefined) updateTemplate('header_text_color', updates.color)
      if (updates.align !== undefined) updateTemplate('header_text_align', updates.align)
      if (updates.content !== undefined) updateTemplate('header_content', updates.content)
      if (updates.x !== undefined) updateTemplate('company_name_x', updates.x)
      if (updates.y !== undefined) updateTemplate('company_name_y', updates.y)
    } else if (id === 'contact-info') {
      if (updates.x !== undefined) updateTemplate('contact_info_x', updates.x)
      if (updates.y !== undefined) updateTemplate('contact_info_y', updates.y)
      if (updates.content !== undefined) updateTemplate('contact_info_content', updates.content)
    } else if (id === 'invoice-number') {
      if (updates.x !== undefined) updateTemplate('invoice_number_x', updates.x)
      if (updates.y !== undefined) updateTemplate('invoice_number_y', updates.y)
    } else if (id === 'invoice-date') {
      if (updates.x !== undefined) updateTemplate('invoice_date_x', updates.x)
      if (updates.y !== undefined) updateTemplate('invoice_date_y', updates.y)
    } else if (id === 'payment-method') {
      if (updates.x !== undefined) updateTemplate('payment_method_x', updates.x)
      if (updates.y !== undefined) updateTemplate('payment_method_y', updates.y)
    } else if (id === 'flight-details') {
      if (updates.x !== undefined) updateTemplate('flight_details_x', updates.x)
      if (updates.y !== undefined) updateTemplate('flight_details_y', updates.y)
    } else if (id === 'table') {
      if (updates.x !== undefined) updateTemplate('table_x', updates.x)
      if (updates.y !== undefined) updateTemplate('table_y', updates.y)
      if (updates.width !== undefined) updateTemplate('table_width', updates.width)
      if (updates.height !== undefined) updateTemplate('table_height', updates.height)
    } else if (id === 'footer') {
      if (updates.x !== undefined) updateTemplate('footer_x', updates.x)
      if (updates.y !== undefined) updateTemplate('footer_y', updates.y)
      if (updates.content !== undefined) updateTemplate('footer_content', updates.content)
      if (updates.fontSize !== undefined) updateTemplate('footer_font_size', updates.fontSize)
      if (updates.color !== undefined) updateTemplate('footer_text_color', updates.color)
      if (updates.align !== undefined) updateTemplate('footer_text_align', updates.align)
    } else {
      // Generic text element - save to custom_elements array
      const element = editableElements.find(el => el.id === id)
      if (element) {
        const customElements = templateData.custom_elements || []
        const existingIndex = customElements.findIndex((el: any) => el.id === id)
        const updatedElement = { ...element, ...updates }
        
        if (existingIndex >= 0) {
          customElements[existingIndex] = updatedElement
        } else {
          customElements.push(updatedElement)
        }
        updateTemplate('custom_elements', customElements)
      }
    }
  }

  function deleteElement(id) {
    if (confirm('Delete this element?')) {
      setEditableElements(prev => prev.filter(el => el.id !== id))
      setSelectedElement(null)
      if (id === 'logo') {
        updateTemplate('header_logo_url', null)
      }
    }
  }

  function addTextElement() {
    const newElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'New Text',
      x: 40,
      y: editableElements.length * 60 + 100,
      fontSize: 14,
      color: '#000000',
      align: 'left',
      fontFamily: 'Arial, sans-serif',
      bold: false,
      italic: false,
      width: 300,
      zIndex: editableElements.length + 1
    }
    setEditableElements(prev => [...prev, newElement])
    setSelectedElement(newElement.id)
    setTimeout(() => setEditingElement(newElement.id), 100)
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

  const selectedEl = editableElements.find(el => el.id === selectedElement)
  const editingEl = editableElements.find(el => el.id === editingElement)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Toolbar */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        display: 'flex',
        gap: '8px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '8px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}>
        <button
          onClick={addTextElement}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          title="Add Text"
        >
          <Plus size={14} /> Add Text
        </button>
      </div>

      {/* Interactive Preview */}
      <div
        ref={previewRef}
        className="interactive-preview"
        onClick={(e) => {
          if (e.target === previewRef.current) {
            setSelectedElement(null)
            setEditingElement(null)
          }
        }}
        style={{
          position: 'relative',
          width: '210mm',
          height: '297mm', // Fixed A4 height - exactly one page
          maxHeight: '297mm', // Prevent overflow
          margin: '0 auto',
          background: templateData.body_bg_color || '#ffffff',
          padding: `${templateData.page_margin_top || 40}px ${templateData.page_margin_right || 40}px ${templateData.page_margin_bottom || 40}px ${templateData.page_margin_left || 40}px`,
          boxSizing: 'border-box',
          cursor: isDragging ? 'grabbing' : 'default',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          overflow: 'hidden' // Prevent content from going beyond A4
        }}
      >
        {editableElements.map(element => (
          <div
            key={element.id}
            className={`preview-element ${selectedElement === element.id ? 'selected' : ''} ${editingElement === element.id ? 'editing' : ''}`}
            style={{
              position: 'absolute',
              left: `${element.x}px`,
              top: `${element.y}px`,
              fontSize: element.type !== 'image' ? `${element.fontSize}px` : undefined,
              fontWeight: element.type !== 'image' && element.bold ? '600' : '400',
              fontStyle: element.type !== 'image' && element.italic ? 'italic' : 'normal',
              color: element.type !== 'image' ? element.color : undefined,
              textAlign: element.type !== 'image' ? element.align : undefined,
              fontFamily: element.type !== 'image' ? element.fontFamily : undefined,
              width: element.width ? `${element.width}px` : 'auto',
              height: element.height ? `${element.height}px` : 'auto',
              cursor: editingElement === element.id ? 'text' : 'move',
              padding: element.type === 'image' ? '0' : '6px 10px',
              borderRadius: '4px',
              backgroundColor: selectedElement === element.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              border: selectedElement === element.id ? '2px solid #3b82f6' : '2px solid transparent',
              whiteSpace: element.type === 'image' ? 'normal' : 'pre-wrap',
              wordWrap: 'break-word',
              zIndex: element.zIndex || 1,
              backgroundImage: element.type === 'image' && element.imageUrl ? `url(${element.imageUrl})` : undefined,
              backgroundSize: element.type === 'image' ? 'contain' : undefined,
              backgroundRepeat: element.type === 'image' ? 'no-repeat' : undefined,
              backgroundPosition: element.type === 'image' ? 'center' : undefined,
              minHeight: element.type === 'image' ? `${element.height || 100}px` : undefined
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
              <textarea
                value={element.content}
                onChange={(e) => updateElement(element.id, { content: e.target.value })}
                onBlur={() => setEditingElement(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setEditingElement(null)
                  }
                }}
                autoFocus
                style={{
                  width: '100%',
                  minHeight: '60px',
                  border: '1px solid #3b82f6',
                  outline: 'none',
                  background: 'white',
                  fontSize: `${element.fontSize}px`,
                  fontWeight: element.bold ? '600' : '400',
                  fontStyle: element.italic ? 'italic' : 'normal',
                  color: element.color,
                  fontFamily: element.fontFamily,
                  resize: 'both',
                  overflow: 'auto',
                  padding: '8px',
                  borderRadius: '4px'
                }}
              />
            ) : element.type === 'image' ? (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: element.imageUrl ? 'none' : '2px dashed var(--border-color)',
                borderRadius: '4px',
                background: element.imageUrl ? 'transparent' : 'var(--bg-subtle)',
                minHeight: `${element.height || 100}px`
              }}>
                {element.imageUrl ? '' : 'No Image'}
              </div>
            ) : element.type === 'table' ? (
              <div style={{
                width: '100%',
                border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`,
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: `${templateData.table_font_size || 11}px`
                }}>
                  <thead>
                    <tr style={{ 
                      backgroundColor: templateData.table_header_bg_color || '#000000', 
                      color: templateData.table_header_text_color || '#ffffff' 
                    }}>
                      <th style={{ 
                        padding: `${templateData.table_cell_padding || 10}px`, 
                        border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`, 
                        textAlign: 'left' 
                      }}>
                        Namen des Reisenden
                      </th>
                      <th style={{ 
                        padding: `${templateData.table_cell_padding || 10}px`, 
                        border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`, 
                        textAlign: templateData.table_number_align || 'right' 
                      }}>
                        Ticket
                      </th>
                      <th style={{ 
                        padding: `${templateData.table_cell_padding || 10}px`, 
                        border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`, 
                        textAlign: templateData.table_number_align || 'right' 
                      }}>
                        Visum
                      </th>
                      <th style={{ 
                        padding: `${templateData.table_cell_padding || 10}px`, 
                        border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`, 
                        textAlign: templateData.table_number_align || 'right' 
                      }}>
                        Hotel
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ backgroundColor: templateData.table_row_bg_color || '#ffffff' }}>
                      <td style={{ 
                        padding: `${templateData.table_cell_padding || 10}px`, 
                        border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}` 
                      }}>
                        {replaceInvoiceVariables('{{passenger_full_name}}', sampleBooking)}
                      </td>
                      <td style={{ 
                        padding: `${templateData.table_cell_padding || 10}px`, 
                        border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`, 
                        textAlign: templateData.table_number_align || 'right' 
                      }}>
                        {replaceInvoiceVariables('{{ticket_price}}', sampleBooking)}
                      </td>
                      <td style={{ 
                        padding: `${templateData.table_cell_padding || 10}px`, 
                        border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`, 
                        textAlign: templateData.table_number_align || 'right' 
                      }}>
                        {replaceInvoiceVariables('{{visa_fees}}', sampleBooking)}
                      </td>
                      <td style={{ 
                        padding: `${templateData.table_cell_padding || 10}px`, 
                        border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`, 
                        textAlign: templateData.table_number_align || 'right' 
                      }}>
                        {replaceInvoiceVariables('{{hotel_charges}}', sampleBooking) || '-'}
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
                        <strong>Gesamtbetrag</strong>
                      </td>
                      <td style={{ 
                        padding: `${templateData.table_cell_padding || 10}px`, 
                        border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`, 
                        textAlign: templateData.table_number_align || 'right' 
                      }}>
                        <strong>{replaceInvoiceVariables('{{total_amount}}', sampleBooking)} €</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div 
                style={{ 
                  minHeight: '20px',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word'
                }}
                dangerouslySetInnerHTML={{ 
                  __html: element.content && element.content.includes('{{') 
                    ? replaceInvoiceVariables(element.content, sampleBooking) 
                    : element.content || 'Empty' 
                }}
              />
            )}

            {/* Selection indicator */}
            {selectedElement === element.id && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                left: '-8px',
                background: '#3b82f6',
                color: 'white',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                cursor: 'move'
              }}>
                <Move size={12} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Properties Panel */}
      {selectedEl && (
        <div style={{
          position: 'absolute',
          top: '50px',
          right: '10px',
          width: '280px',
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1001,
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <strong>Edit Element</strong>
            <button
              onClick={() => deleteElement(selectedEl.id)}
              style={{
                padding: '4px 8px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>

          {selectedEl.type !== 'image' && selectedEl.type !== 'table' && (
            <>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                  Font Size: {selectedEl.fontSize}px
                </label>
                <input
                  type="range"
                  min="8"
                  max="48"
                  value={selectedEl.fontSize}
                  onChange={(e) => updateElement(selectedEl.id, { fontSize: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                  Text Color
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={selectedEl.color}
                    onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                    style={{ width: '50px', height: '40px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={selectedEl.color}
                    onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                    style={{ flex: 1, padding: '8px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                  Alignment
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => updateElement(selectedEl.id, { align: 'left' })}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: selectedEl.align === 'left' ? '#3b82f6' : '#f3f4f6',
                      color: selectedEl.align === 'left' ? 'white' : '#000',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Left
                  </button>
                  <button
                    onClick={() => updateElement(selectedEl.id, { align: 'center' })}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: selectedEl.align === 'center' ? '#3b82f6' : '#f3f4f6',
                      color: selectedEl.align === 'center' ? 'white' : '#000',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Center
                  </button>
                  <button
                    onClick={() => updateElement(selectedEl.id, { align: 'right' })}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: selectedEl.align === 'right' ? '#3b82f6' : '#f3f4f6',
                      color: selectedEl.align === 'right' ? 'white' : '#000',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Right
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => updateElement(selectedEl.id, { bold: !selectedEl.bold })}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: selectedEl.bold ? '#3b82f6' : '#f3f4f6',
                    color: selectedEl.bold ? 'white' : '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Bold
                </button>
                <button
                  onClick={() => updateElement(selectedEl.id, { italic: !selectedEl.italic })}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: selectedEl.italic ? '#3b82f6' : '#f3f4f6',
                    color: selectedEl.italic ? 'white' : '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontStyle: 'italic'
                  }}
                >
                  Italic
                </button>
              </div>
            </>
          )}

          {(selectedEl.type === 'image' || selectedEl.type === 'table') && (
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                Width: {selectedEl.width}px
              </label>
              <input
                type="range"
                min="200"
                max="800"
                value={selectedEl.width}
                onChange={(e) => updateElement(selectedEl.id, { width: parseInt(e.target.value) })}
                style={{ width: '100%' }}
              />
              {selectedEl.type === 'image' && (
                <>
                  <label style={{ fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px', marginTop: '12px' }}>
                    Height: {selectedEl.height}px
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="300"
                    value={selectedEl.height}
                    onChange={(e) => updateElement(selectedEl.id, { height: parseInt(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </>
              )}
              {selectedEl.type === 'table' && (
                <>
                  <label style={{ fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px', marginTop: '12px' }}>
                    Height: {selectedEl.height}px
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="500"
                    value={selectedEl.height}
                    onChange={(e) => updateElement(selectedEl.id, { height: parseInt(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </>
              )}
            </div>
          )}

          {selectedEl.type !== 'image' && selectedEl.type !== 'table' && (
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                Width: {selectedEl.width}px
              </label>
              <input
                type="range"
                min="100"
                max="600"
                value={selectedEl.width}
                onChange={(e) => updateElement(selectedEl.id, { width: parseInt(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
