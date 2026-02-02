import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { APP_ID } from '@/lib/appConfig'
import { useToast } from '../../Toast'

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
  include_qr: true
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
        .eq('user_id', APP_ID)  // Use fixed APP_ID for single-tenant
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
      
      // Auto-save logo_url to invoice_settings immediately after upload
      // This ensures logo_url is persisted even if user doesn't click "Save"
      try {
        const updatePayload = { logo_url: urlData.publicUrl }
        
        if (settingsId) {
          // Update existing settings
          await supabase
            .from('invoice_settings')
            .update(updatePayload)
            .eq('id', settingsId)
        } else {
          // Create new settings record with logo_url
          const { data: newSettings } = await supabase
            .from('invoice_settings')
            .insert({
              user_id: APP_ID,  // Use fixed APP_ID for single-tenant
              logo_url: urlData.publicUrl,
              ...DEFAULT_SETTINGS
            })
            .select('id')
            .single()
          
          if (newSettings?.id) {
            setSettingsId(newSettings.id)
          }
        }
      } catch (saveErr) {
        console.warn('Failed to auto-save logo_url to invoice_settings:', saveErr)
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
      // Single-tenant app: use fixed APP_ID instead of user_id
      const payload = {
        user_id: APP_ID,  // Use fixed APP_ID for single-tenant
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
        include_qr: formData.include_qr
      }

      if (settingsId) {
        const { error } = await supabase
          .from('invoice_settings')
          .update(payload)
          .eq('id', settingsId)

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('invoice_settings')
          .insert(payload)
          .select('id')
          .single()

        if (error) throw error
        setSettingsId(data?.id || null)
      }

      toast.success('Invoice settings saved to database.')
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
            <label>
              Include QR Code
              <input
                type="checkbox"
                checked={Boolean(formData.include_qr)}
                onChange={handleToggle('include_qr')}
              />
            </label>
          </div>
        </div>
      </form>
    </div>
  )
}
