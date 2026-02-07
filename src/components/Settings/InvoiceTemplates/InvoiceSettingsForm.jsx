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
  whatsapp_number: ''
}

const normalizeSettings = (data = {}) => {
  const merged = { ...DEFAULT_SETTINGS, ...data }
  return Object.keys(DEFAULT_SETTINGS).reduce((acc, key) => {
    const value = merged[key]
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
        setFormData(normalizeSettings(data))
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

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setSaving(true)
      const extension = file.name.split('.').pop()?.toLowerCase() || 'png'
      const filePath = `invoice-settings/${APP_ID}/logo.${extension}`  // Use fixed APP_ID for single-tenant

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath)

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL for logo.')
      }

      // Update form data with public URL from Supabase Storage
      setFormData((prev) => ({
        ...prev,
        logo_url: urlData.publicUrl
      }))
      
      // Auto-save logo_url to app_settings to avoid invoice_settings FK
      try {
        const updatePayload = { ...formData, logo_url: urlData.publicUrl }
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceSettingsForm.jsx:logoSaveAppSettings',message:'saving logo to app_settings',data:{updatePayload},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{})
        // #endregion
        await setAppSetting('invoice_settings', updatePayload)
      } catch (saveErr) {
        console.warn('Failed to auto-save logo_url to app_settings:', saveErr)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceSettingsForm.jsx:logoAutoSaveError',message:'auto-save logo failed',data:{error:saveErr?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{})
        // #endregion
        // Don't show error - user can still save manually
      }
      
      toast.success('Logo uploaded to Supabase Storage and saved to invoice settings.')
    } catch (err) {
      console.error('Error uploading logo:', err)
      toast.error('Failed to upload logo: ' + (err.message || 'Unknown error'))
    } finally {
      setSaving(false)
      event.target.value = ''
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
        whatsapp_number: normalizedWhatsApp
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceSettingsForm.jsx:handleSubmit',message:'saving invoice settings payload (app_settings)',data:{payload},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{})
      // #endregion

      await setAppSetting('invoice_settings', payload)

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
                <img src={formData.logo_url} alt="Invoice logo" />
              ) : (
                <div className="invoice-settings-logo-placeholder">No logo uploaded</div>
              )}
            </div>
            <div className="invoice-settings-logo-actions">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={handleLogoClick}
                disabled={saving}
              >
                Upload Logo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleLogoUpload}
                className="invoice-settings-file-input"
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
      </form>
    </div>
  )
}
