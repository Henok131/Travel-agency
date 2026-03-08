import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { APP_ID } from '@/lib/appConfig'
import { Save, X } from 'lucide-react'
import { DEFAULT_INVOICE_TEMPLATE } from '@/utils/defaultInvoiceTemplate'
import InvoicePreview from './InvoicePreview'

export default function TemplateEditor() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const templateId = searchParams.get('id')
  const action = searchParams.get('action')
  
  const [templateName, setTemplateName] = useState('New Template')
  const [templateData, setTemplateData] = useState(DEFAULT_INVOICE_TEMPLATE)
  const [loading, setLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Fallback booking data for preview
  const fallbackBooking = {
    id: 'abc123-def456-ghi789',
    booking_ref: 'ABC123',
    first_name: 'Henok',
    middle_name: 'Asenay',
    last_name: 'Petros',
    passport_number: 'G4576879867',
    nationality: 'Eritrea',
    travel_date: '2026-01-22',
    return_date: '2026-01-31',
    departure_airport: 'FRA, Frankfurt Airport, Frankfurt',
    destination_airport: 'HHN, Hahn Airport, Berlin',
    airlines: 'Ethiopian Airlines (ET)',
    total_ticket_price: 12.00,
    tot_visa_fees: 11.00,
    hotel_charges: 0,
    total_amount_due: 23.00,
    cash_paid: 0,
    bank_transfer: 644,
    payment_balance: 'Fully Paid',
    created_at: new Date().toISOString()
  }
  const [previewBooking, setPreviewBooking] = useState(fallbackBooking)

  useEffect(() => {
    let isActive = true
    
    async function loadPreviewBooking() {
      try {
        const { data, error } = await supabase
          .from('main_table')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (!error && data && isActive) {
          setPreviewBooking(data)
        }
      } catch (err) {
        console.error('Error loading preview booking:', err)
      }
    }

    loadPreviewBooking()
    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (action === 'edit' && templateId) {
      loadTemplate()
    }
  }, [templateId, action])

  async function loadTemplate() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('invoice_templates')
        .select('*')
        .eq('id', templateId)
        .single()
      
      if (error) throw error
      if (data) {
        setTemplateName(data.template_name)
        // Merge with defaults to ensure all fields exist, but preserve existing values
        setTemplateData({
          ...DEFAULT_INVOICE_TEMPLATE,
          ...data,
          // Ensure text fields have values
          invoice_title: data.invoice_title || DEFAULT_INVOICE_TEMPLATE.invoice_title,
          ticket_platform_text: data.ticket_platform_text || DEFAULT_INVOICE_TEMPLATE.ticket_platform_text,
          confirmation_paragraph: data.confirmation_paragraph || DEFAULT_INVOICE_TEMPLATE.confirmation_paragraph,
          tax_paragraph: data.tax_paragraph || DEFAULT_INVOICE_TEMPLATE.tax_paragraph,
          signature_label: data.signature_label || DEFAULT_INVOICE_TEMPLATE.signature_label
        })
        setHasChanges(false)
      }
    } catch (error) {
      console.error('Error loading template:', error)
      alert('Failed to load template')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!templateName.trim()) {
      alert('Please enter a template name')
      return
    }
    
    setLoading(true)
    try {
      // Only save the text content fields plus required fields
      const templateToSave = {
        template_name: templateName.trim(),
        user_id: APP_ID,
        updated_at: new Date().toISOString(),
        // Only include text content fields
        invoice_title: templateData.invoice_title || null,
        ticket_platform_text: templateData.ticket_platform_text || null,
        confirmation_paragraph: templateData.confirmation_paragraph || null,
        tax_paragraph: templateData.tax_paragraph || null,
        signature_label: templateData.signature_label || null
      }
      
      if (action === 'edit' && templateId) {
        // Update existing - only update text fields, preserve all other fields
        const { error } = await supabase
          .from('invoice_templates')
          .update({
            template_name: templateToSave.template_name,
            updated_at: templateToSave.updated_at,
            invoice_title: templateToSave.invoice_title,
            ticket_platform_text: templateToSave.ticket_platform_text,
            confirmation_paragraph: templateToSave.confirmation_paragraph,
            tax_paragraph: templateToSave.tax_paragraph,
            signature_label: templateToSave.signature_label
          })
          .eq('id', templateId)
        
        if (error) throw error
      } else {
        // Create new - merge with defaults for other fields
        const newTemplate = {
          ...DEFAULT_INVOICE_TEMPLATE,
          ...templateToSave,
          is_default: false
        }
        const { error } = await supabase
          .from('invoice_templates')
          .insert(newTemplate)
        
        if (error) throw error
      }
      
      setHasChanges(false)
      alert('Template saved successfully!')
      navigate('/settings?tab=invoiceTemplates')
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Failed to save template: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    if (hasChanges) {
      if (!confirm('You have unsaved changes. Are you sure you want to leave?')) {
        return
      }
    }
    navigate('/settings?tab=invoiceTemplates')
  }

  function updateTemplate(field, value) {
    setTemplateData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }


  if (loading && action === 'edit') {
    return (
      <div className="template-editor-loading">
        <div>Loading template...</div>
      </div>
    )
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <h1>Invoice Template</h1>
          <p>Customize the text content used in your invoices</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleSave}
          disabled={loading}
          type="button"
        >
          <Save size={16} />
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        {/* Left Side - Form */}
        <div className="settings-card">
          <h2 style={{ marginBottom: '20px' }}>Template Details</h2>
          
          {/* Template Name */}
          <div className="form-group">
            <label htmlFor="template_name">Template Name</label>
            <input
              id="template_name"
              type="text"
              value={templateName}
              onChange={(e) => {
                setTemplateName(e.target.value)
                setHasChanges(true)
              }}
              placeholder="e.g., Default Invoice Template"
              className="form-input"
            />
          </div>

          {/* Invoice Title */}
          <div className="form-group">
            <label htmlFor="invoice_title">Invoice Title</label>
            <input
              id="invoice_title"
              type="text"
              value={templateData.invoice_title || ''}
              onChange={(e) => updateTemplate('invoice_title', e.target.value)}
              placeholder="e.g., BANKÜBERWEISUNG or BANK TRANSFER"
              className="form-input"
            />
            <p className="field-hint">Main title displayed at the top of the invoice</p>
          </div>

          {/* Ticket Platform Text */}
          <div className="form-group">
            <label htmlFor="ticket_platform_text">Ticket Platform Text</label>
            <textarea
              id="ticket_platform_text"
              value={templateData.ticket_platform_text || ''}
              onChange={(e) => updateTemplate('ticket_platform_text', e.target.value)}
              placeholder="e.g., Ticket booking platforms:- IATA"
              className="form-textarea"
              rows="2"
            />
            <p className="field-hint">Text describing the ticket booking platform</p>
          </div>

          {/* Confirmation Paragraph */}
          <div className="form-group">
            <label htmlFor="confirmation_paragraph">Confirmation Paragraph</label>
            <textarea
              id="confirmation_paragraph"
              value={templateData.confirmation_paragraph || ''}
              onChange={(e) => updateTemplate('confirmation_paragraph', e.target.value)}
              placeholder="I/We confirm that the details in my/our booking are correct..."
              className="form-textarea"
              rows="6"
            />
            <p className="field-hint">Legal confirmation text about booking details, visa requirements, cancellation fees, etc.</p>
          </div>

          {/* Tax Paragraph */}
          <div className="form-group">
            <label htmlFor="tax_paragraph">Tax Paragraph</label>
            <textarea
              id="tax_paragraph"
              value={templateData.tax_paragraph || ''}
              onChange={(e) => updateTemplate('tax_paragraph', e.target.value)}
              placeholder="e.g., Tax-exempt brokerage service pursuant to § 3a para.2 UStG"
              className="form-textarea"
              rows="3"
            />
            <p className="field-hint">Tax exemption or legal text</p>
          </div>

          {/* Signature Label */}
          <div className="form-group">
            <label htmlFor="signature_label">Signature Label</label>
            <input
              id="signature_label"
              type="text"
              value={templateData.signature_label || ''}
              onChange={(e) => updateTemplate('signature_label', e.target.value)}
              placeholder="e.g., Signature: or Unterschrift:"
              className="form-input"
            />
            <p className="field-hint">Label text for the signature line</p>
          </div>

          {/* Cancel Button */}
          <div className="form-group" style={{ marginTop: '30px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={handleCancel} 
              type="button"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>

        {/* Right Side - Preview */}
        <div className="settings-card">
          <h2 style={{ marginBottom: '20px' }}>Preview</h2>
          <div style={{ border: '1px solid var(--border-color, rgba(255, 255, 255, 0.2))', borderRadius: '8px', padding: '20px', backgroundColor: 'var(--bg-subtle, rgba(0, 0, 0, 0.3))' }}>
            <InvoicePreview 
              templateData={templateData} 
              bookingData={previewBooking}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
