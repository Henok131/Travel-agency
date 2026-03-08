import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { APP_ID } from '@/lib/appConfig'
import { useToast } from '../../Toast'
import { getAppSetting, setAppSetting } from '@/lib/appSettings'

const DEFAULT_SETTINGS = {
  logo_url: '',
  company_name: 'LST Travel Agency',
  contact_person: 'Yodli Hagos Mebratu',
  address: 'Düsseldorfer Straße 14',
  postal: '60329 Frankfurt a/M',
  email: 'info@lst-travel.de',
  phone: '069/75848875',
  mobile: '0160/2371650',
  tax_id: 'DE340914297',
  website: 'www.lsttravel.de',
  bank_name: 'Commerzbank AG',
  iban: 'DE28 5134 0013 0185 3597 00',
  bic: 'COBADEFFXXX',
  whatsapp_number: '',
  include_qr: true,
  ticket_platform_text: 'Ticketbuchungsplattformen:- IATA',
  confirmation_paragraph: 'Ich/Wir bestätigen, dass die Angaben auf meiner/unserer Buchung korrekt sind, einschließlich Namen, Datum und weiterer Details. Zudem wurde ich/wurden wir über die Visumspflichten, Stornierungs- und Umbuchungsgebühren und alle Flugreisedetails umfassend aufgeklärt. Ich/Wir habe(n) die Bedingungen für die Buchung zur Kenntnis genommen und vollumfänglich verstanden und buche(n) verbindlich.',
  tax_paragraph: 'Steuerfreie Vermittlungsleistung gemäß § 3a Abs.2 UStG',
  signature_label: 'Unterschrift:'
}

const normalizeSettings = (data = {}) => {
  const merged = { ...DEFAULT_SETTINGS, ...data }
  // Include all fields from DEFAULT_SETTINGS plus any additional fields from data
  const allKeys = new Set([...Object.keys(DEFAULT_SETTINGS), ...Object.keys(data)])
  return Array.from(allKeys).reduce((acc, key) => {
    const value = merged[key]
    // Use default if value is null/undefined, otherwise use the value (even if empty string)
    acc[key] = value === null || value === undefined ? DEFAULT_SETTINGS[key] : value
    return acc
  }, {})
}

// Removed localStorage - all settings now persist in Supabase invoice_settings table

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read file.'))
    reader.readAsDataURL(file)
  })

export default function InvoiceSettingsForm() {
  const toast = useToast()
  const fileInputRef = useRef(null)
  const [settingsId, setSettingsId] = useState(null)
  const [formData, setFormData] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [logoKey, setLogoKey] = useState(0) // Force image re-render on logo change

  // Load settings on mount - use fixed APP_ID for single-tenant app
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    setLoadError('')
    try {
      // Single-tenant app: use fixed APP_ID instead of user_id
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout loading invoice settings.')), 8000)
      })
      const queryPromise = supabase
        .from('invoice_settings')
        .select('*')
        .limit(1)
        .maybeSingle()

      const result = await Promise.race([queryPromise, timeoutPromise])
      const { data, error } = result || {}

      if (error) throw error

      if (data) {
        setSettingsId(data.id)
        const normalized = normalizeSettings(data)
        // Add cache-busting to logo URL when loading to prevent stale cache
        if (normalized.logo_url) {
          // Remove any existing cache-busting parameter and add a new one
          const baseUrl = normalized.logo_url.split('?')[0]
          normalized.logo_url = `${baseUrl}?t=${Date.now()}`
        }
        setFormData(normalized)
      } else {
        setFormData(DEFAULT_SETTINGS)
      }
    } catch (err) {
      console.error('Error loading invoice settings:', err)
      setLoadError(err.message || 'Failed to load invoice settings.')
      toast.error('Failed to load invoice settings.')
    } finally {
      setLoading(false)
    }
  }

  // Attempt to find an existing user id to satisfy NOT NULL + FK
  const getFallbackUserId = async () => {
    try {
      const { data } = await supabase
        .from('invoice_settings')
        .select('user_id')
        .limit(1)
        .maybeSingle()
      if (data?.user_id) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceSettingsForm.jsx:getFallbackUserId',message:'using existing invoice_settings user_id',data:{user_id:data.user_id},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{})
        // #endregion
        return data.user_id
      }
    } catch (e) {
      // ignore
    }
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1)
        .maybeSingle()
      if (data?.id) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceSettingsForm.jsx:getFallbackUserId',message:'using user_profiles id as user_id',data:{user_id:data.id},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{})
        // #endregion
        return data.id
      }
    } catch (e) {
      // ignore
    }
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceSettingsForm.jsx:getFallbackUserId',message:'falling back to APP_ID',data:{user_id:APP_ID},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{})
    // #endregion
    return APP_ID
  }

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handleToggle = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.checked
    }))
  }

  const handleLogoClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveLogo = async () => {
    if (!confirm('Are you sure you want to remove the logo?')) {
      return
    }

    try {
      setSaving(true)
      
      // Update form data immediately
      const updatedFormData = {
        ...formData,
        logo_url: null
      }
      setFormData(updatedFormData)
      // Force image element to re-render
      setLogoKey(prev => prev + 1)
      
      // Delete logo from Supabase Storage if it exists
      if (formData.logo_url) {
        try {
          // Extract file path from URL (remove cache-busting parameter if present)
          const baseUrl = formData.logo_url.split('?')[0]
          const urlParts = baseUrl.split('/')
          const fileName = urlParts[urlParts.length - 1]
          const filePath = `invoice-settings/${APP_ID}/${fileName}`
          
          const { error: deleteError } = await supabase.storage
            .from('logos')
            .remove([filePath])
          
          if (deleteError) {
            console.warn('Failed to delete logo from storage:', deleteError)
            // Continue anyway - we'll update the database
          }
        } catch (storageErr) {
          console.warn('Error deleting logo from storage:', storageErr)
          // Continue anyway
        }
      }
      
      // Update database
      try {
        // Save to app_settings
        await setAppSetting('invoice_settings', updatedFormData)
        
        // Update invoice_settings table
        const userId = await getFallbackUserId()
        const logoUpdatePayload = {
          user_id: userId,
          logo_url: null
        }
        
        if (settingsId) {
          const { error: updateError } = await supabase
            .from('invoice_settings')
            .update(logoUpdatePayload)
            .eq('id', settingsId)
          
          if (updateError) {
            console.warn('Failed to remove logo in invoice_settings:', updateError)
          }
        } else {
          // Try to find existing record
          const { data: existingSettings } = await supabase
            .from('invoice_settings')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle()
          
          if (existingSettings?.id) {
            setSettingsId(existingSettings.id)
            const { error: updateError } = await supabase
              .from('invoice_settings')
              .update(logoUpdatePayload)
              .eq('id', existingSettings.id)
            
            if (updateError) {
              console.warn('Failed to remove logo in invoice_settings:', updateError)
            }
          }
        }
      } catch (saveErr) {
        console.warn('Failed to save logo removal:', saveErr)
      }
      
      toast.success('Logo removed successfully.')
    } catch (err) {
      console.error('Error removing logo:', err)
      toast.error('Failed to remove logo: ' + (err.message || 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      // Reset file input even if no file selected
      if (event.target) {
        event.target.value = ''
      }
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, or SVG)')
      if (event.target) {
        event.target.value = ''
      }
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      if (event.target) {
        event.target.value = ''
      }
      return
    }

    try {
      setSaving(true)
      const extension = file.name.split('.').pop()?.toLowerCase() || 'png'
      const filePath = `invoice-settings/${APP_ID}/logo.${extension}`  // Use fixed APP_ID for single-tenant

      // Clean up ALL old logo files (different extensions) before uploading new one
      if (formData.logo_url) {
        try {
          // Remove cache-busting parameter to get base URL
          const baseUrl = formData.logo_url.split('?')[0]
          const urlParts = baseUrl.split('/')
          const oldFileName = urlParts[urlParts.length - 1]
          
          // List all possible logo extensions and remove them
          const extensionsToCheck = ['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp']
          const filesToRemove = []
          
          for (const ext of extensionsToCheck) {
            const oldFilePath = `invoice-settings/${APP_ID}/logo.${ext}`
            filesToRemove.push(oldFilePath)
          }
          
          // Remove all old logo files
          if (filesToRemove.length > 0) {
            await supabase.storage
              .from('logos')
              .remove(filesToRemove)
            // Don't throw on error - just log it
          }
        } catch (cleanupErr) {
          console.warn('Failed to cleanup old logo files:', cleanupErr)
          // Continue with upload anyway
        }
      }

      // Upload to Supabase Storage (upsert will overwrite existing file)
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true, cacheControl: '3600' })

      if (uploadError) throw uploadError

      // Get public URL - add a small delay to ensure file is available
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath)

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL for logo.')
      }

      // Add cache-busting parameter to force browser to reload the new image
      const timestamp = Date.now()
      const logoUrlWithCacheBust = `${urlData.publicUrl}?v=${timestamp}`

      // Update form data with public URL from Supabase Storage immediately
      const updatedFormData = {
        ...formData,
        logo_url: logoUrlWithCacheBust
      }
      
      // Update state immediately for UI
      setFormData(updatedFormData)
      // Force image element to re-render by changing key
      setLogoKey(timestamp)
      
      // Auto-save logo_url to both app_settings and invoice_settings
      try {
        // Save to app_settings (for backward compatibility)
        await setAppSetting('invoice_settings', updatedFormData)
        
        // Also save to invoice_settings table
        // Save the base URL without cache-busting parameter for database storage
        const userId = await getFallbackUserId()
        const logoUpdatePayload = {
          user_id: userId,
          logo_url: urlData.publicUrl  // Store base URL without cache-busting
        }
        
        if (settingsId) {
          // Update existing record - only update logo_url to avoid schema issues
          const { error: updateError } = await supabase
            .from('invoice_settings')
            .update(logoUpdatePayload)
            .eq('id', settingsId)
          
          if (updateError) {
            console.warn('Failed to update logo in invoice_settings:', updateError)
          }
        } else {
          // If no settingsId, try to find existing record or create one
          const { data: existingSettings } = await supabase
            .from('invoice_settings')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle()
          
          if (existingSettings?.id) {
            setSettingsId(existingSettings.id)
            const { error: updateError } = await supabase
              .from('invoice_settings')
              .update(logoUpdatePayload)
              .eq('id', existingSettings.id)
            
            if (updateError) {
              console.warn('Failed to update logo in invoice_settings:', updateError)
            }
          } else {
            // Create new record with minimal data
            const { data: insertedData, error: insertError } = await supabase
              .from('invoice_settings')
              .insert({
                user_id: userId,
                logo_url: urlData.publicUrl,
                company_name: updatedFormData.company_name || DEFAULT_SETTINGS.company_name
              })
              .select('id')
              .single()
            
            if (!insertError && insertedData?.id) {
              setSettingsId(insertedData.id)
            } else if (insertError) {
              console.warn('Failed to create invoice_settings record:', insertError)
            }
          }
        }
      } catch (saveErr) {
        console.warn('Failed to auto-save logo_url:', saveErr)
        // Don't show error - user can still save manually
      }
      
      toast.success('Logo uploaded and saved successfully.')
    } catch (err) {
      console.error('Error uploading logo:', err)
      toast.error('Failed to upload logo: ' + (err.message || 'Unknown error'))
    } finally {
      setSaving(false)
      // Always reset file input to allow selecting the same file again
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setSaving(true)
    try {
      const normalizedWhatsApp = (formData.whatsapp_number || '').trim()
      if (normalizedWhatsApp) {
        const valid = /^\+\d+$/.test(normalizedWhatsApp)
        if (!valid) {
          toast.error('WhatsApp number must start with + and contain digits only.')
          setSaving(false)
          return
        }
      }

      const payload = {
        logo_url: formData.logo_url || null,  // Ensure logo_url is saved from formData
        company_name: formData.company_name,
        contact_person: formData.contact_person,
        address: formData.address,
        postal: formData.postal,
        email: formData.email,
        phone: formData.phone,
        mobile: formData.mobile,
        tax_id: formData.tax_id,
        website: formData.website,
        bank_name: formData.bank_name,
        iban: formData.iban,
        bic: formData.bic,
        whatsapp_number: normalizedWhatsApp,
        include_qr: formData.include_qr ?? true,
        ticket_platform_text: formData.ticket_platform_text || null,
        confirmation_paragraph: formData.confirmation_paragraph || null,
        tax_paragraph: formData.tax_paragraph || null,
        signature_label: formData.signature_label || null
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceSettingsForm.jsx:handleSubmit',message:'saving invoice settings payload (app_settings and invoice_settings)',data:{payload},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{})
      // #endregion

      // Save to app_settings (for backward compatibility)
      await setAppSetting('invoice_settings', payload)

      // Also save to invoice_settings table (for invoice generation)
      const userId = await getFallbackUserId()
      const invoiceSettingsPayload = {
        user_id: userId,
        ...payload
      }

      if (settingsId) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('invoice_settings')
          .update(invoiceSettingsPayload)
          .eq('id', settingsId)
        
        if (updateError) throw updateError
      } else {
        // Insert new record
        const { data: insertedData, error: insertError } = await supabase
          .from('invoice_settings')
          .insert(invoiceSettingsPayload)
          .select('id')
          .single()
        
        if (insertError) throw insertError
        if (insertedData?.id) {
          setSettingsId(insertedData.id)
        }
      }

      toast.success('Invoice settings saved.')
    } catch (err) {
      console.error('Error saving invoice settings:', err)
      toast.error('Failed to save invoice settings: ' + (err.message || 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="invoice-settings-loading">
        Loading invoice settings...
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="invoice-settings-loading">
        {loadError}
      </div>
    )
  }

  return (
    <div className="settings-card invoice-settings-card">
      <div className="invoice-settings-header">
        <div>
          <h3 className="card-title">Company Settings</h3>
          <p className="card-description">
            Manage the company header and footer details used in invoices.
          </p>
        </div>
        <button
          className="btn btn-primary"
          type="submit"
          form="invoice-settings-form"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <form id="invoice-settings-form" className="invoice-settings-form" onSubmit={handleSubmit}>
        <div className="invoice-settings-section">
          <h4>Logo</h4>
          <div className="invoice-settings-logo">
            <div className="invoice-settings-logo-preview">
              {formData.logo_url ? (
                <img 
                  src={formData.logo_url} 
                  alt="Invoice logo" 
                  key={`logo-${logoKey}`}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%', 
                    objectFit: 'contain',
                    display: 'block'
                  }}
                  onError={(e) => {
                    // If image fails to load, try with fresh cache-busting
                    const baseUrl = formData.logo_url.split('?')[0].split('&')[0]
                    const newUrl = `${baseUrl}?v=${Date.now()}`
                    if (e.target.src !== newUrl) {
                      e.target.src = newUrl
                    }
                  }}
                  onLoad={() => {
                    // Image loaded successfully
                    console.log('Logo image loaded successfully')
                  }}
                />
              ) : (
                <div className="invoice-settings-logo-placeholder">No logo uploaded</div>
              )}
            </div>
            <div className="invoice-settings-logo-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={handleLogoClick}
                disabled={saving}
              >
                {formData.logo_url ? 'Replace Logo' : 'Upload Logo'}
              </button>
              {formData.logo_url && (
                <button
                  className="btn btn-danger"
                  type="button"
                  onClick={handleRemoveLogo}
                  disabled={saving}
                  style={{ backgroundColor: '#dc2626', color: 'white', border: 'none' }}
                >
                  Remove Logo
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/gif,image/webp"
                onChange={handleLogoUpload}
                className="invoice-settings-file-input"
                disabled={saving}
              />
            </div>
          </div>
        </div>

        <div className="invoice-settings-section">
          <h4>Header Contact</h4>
          <div className="invoice-settings-grid">
            <label>
              Company Name
              <input value={formData.company_name} onChange={handleChange('company_name')} />
            </label>
            <label>
              Contact Person
              <input value={formData.contact_person} onChange={handleChange('contact_person')} />
            </label>
            <label>
              Address
              <input value={formData.address} onChange={handleChange('address')} />
            </label>
            <label>
              Postal
              <input value={formData.postal} onChange={handleChange('postal')} />
            </label>
            <label>
              Email
              <input value={formData.email} onChange={handleChange('email')} />
            </label>
            <label>
              Phone
              <input value={formData.phone} onChange={handleChange('phone')} />
            </label>
            <label>
              Mobile
              <input value={formData.mobile} onChange={handleChange('mobile')} />
            </label>
            <label>
              WhatsApp Number
              <input
                value={formData.whatsapp_number}
                onChange={handleChange('whatsapp_number')}
                placeholder="+491234567890"
              />
              <small>Use international format. Start with + and digits only.</small>
            </label>
          </div>
        </div>

        <div className="invoice-settings-section">
          <h4>Footer Bank</h4>
          <div className="invoice-settings-grid">
            <label>
              Tax ID
              <input value={formData.tax_id} onChange={handleChange('tax_id')} />
            </label>
            <label>
              Website
              <input value={formData.website} onChange={handleChange('website')} />
            </label>
            <label>
              Bank Name
              <input value={formData.bank_name} onChange={handleChange('bank_name')} />
            </label>
            <label>
              IBAN
              <input value={formData.iban} onChange={handleChange('iban')} />
            </label>
            <label>
              BIC
              <input value={formData.bic} onChange={handleChange('bic')} />
            </label>
          </div>
        </div>

        <div className="invoice-settings-section">
          <h4>Invoice Options</h4>
          <div className="invoice-settings-grid">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.include_qr ?? true}
                onChange={handleToggle('include_qr')}
                style={{ width: 'auto', cursor: 'pointer' }}
              />
              <span>Include QR Code on Invoices</span>
            </label>
            <small style={{ gridColumn: '1 / -1', color: '#666', marginTop: '-8px' }}>
              When enabled, a QR code will be added to generated invoices for verification
            </small>
          </div>
        </div>

        <div className="invoice-settings-section">
          <h4>Invoice Text Content</h4>
          <p className="card-description" style={{ marginBottom: '20px', fontSize: '14px' }}>
            Customize the legal text blocks used in generated invoices.
          </p>
          
          <div className="invoice-settings-grid" style={{ gridTemplateColumns: '1fr' }}>
            <label>
              Ticket Platform Text
              <textarea
                value={formData.ticket_platform_text || ''}
                onChange={handleChange('ticket_platform_text')}
                placeholder="e.g., Ticket booking platforms:- IATA"
                rows="2"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', fontFamily: 'inherit' }}
              />
              <small>Text describing the ticket booking platform</small>
            </label>
            
            <label>
              Confirmation Paragraph
              <textarea
                value={formData.confirmation_paragraph || ''}
                onChange={handleChange('confirmation_paragraph')}
                placeholder="I/We confirm that the details in my/our booking are correct..."
                rows="6"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', fontFamily: 'inherit' }}
              />
              <small>Legal confirmation text about booking details, visa requirements, cancellation fees, etc.</small>
            </label>
            
            <label>
              Tax Paragraph
              <textarea
                value={formData.tax_paragraph || ''}
                onChange={handleChange('tax_paragraph')}
                placeholder="e.g., Tax-exempt brokerage service pursuant to § 3a para.2 UStG"
                rows="3"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', fontFamily: 'inherit' }}
              />
              <small>Tax exemption or legal text</small>
            </label>
            
            <label>
              Signature Label
              <input
                value={formData.signature_label || ''}
                onChange={handleChange('signature_label')}
                placeholder="e.g., Signature: or Unterschrift:"
              />
              <small>Label text for the signature line</small>
            </label>
          </div>
        </div>
      </form>
    </div>
  )
}
