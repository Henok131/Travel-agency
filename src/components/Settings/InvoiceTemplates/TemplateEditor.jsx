import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { APP_ID } from '@/lib/appConfig'
import { Save, X } from 'lucide-react'
import { DEFAULT_INVOICE_TEMPLATE } from '@/utils/defaultInvoiceTemplate'

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
        setTemplateData(data)
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
      const templateToSave = {
        ...templateData,
        template_name: templateName.trim(),
        user_id: APP_ID,
        updated_at: new Date().toISOString()
      }
      
      if (action === 'edit' && templateId) {
        // Update existing
        const { error } = await supabase
          .from('invoice_templates')
          .update(templateToSave)
          .eq('id', templateId)
        
        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase
          .from('invoice_templates')
          .insert(templateToSave)
        
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
    <div className="template-editor">
      {/* Top Bar */}
      <div className="editor-topbar">
        <div className="topbar-left">
          <input
            type="text"
            className="template-name-input"
            value={templateName}
            onChange={(e) => {
              setTemplateName(e.target.value)
              setHasChanges(true)
            }}
            placeholder="Template Name"
          />
          {hasChanges && <span className="unsaved-badge">Unsaved changes</span>}
        </div>
        
        <div className="topbar-actions">
          <button className="btn btn-secondary" onClick={handleCancel} type="button">
            <X size={16} />
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={loading}
            type="button"
          >
            <Save size={16} />
            {loading ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>

      {/* Editor removed per request */}
      <div className="editor-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
        <div className="settings-card">
          The invoice editor has been removed as requested.
        </div>
      </div>
    </div>
  )
}
