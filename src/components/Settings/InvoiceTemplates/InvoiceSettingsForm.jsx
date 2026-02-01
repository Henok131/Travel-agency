import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../contexts/AuthContext'
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

const LOCAL_SETTINGS_KEY = 'invoice_settings_draft'

const loadLocalSettings = () => {
  try {
    const raw = localStorage.getItem(LOCAL_SETTINGS_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (err) {
    console.warn('Failed to read local invoice settings:', err)
    return null
  }
}

const saveLocalSettings = (settings) => {
  try {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings))
  } catch (err) {
    console.warn('Failed to save local invoice settings:', err)
  }
}

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read file.'))
    reader.readAsDataURL(file)
  })

export default function InvoiceSettingsForm() {
  const { user } = useAuth()
  const toast = useToast()
  const fileInputRef = useRef(null)
  const [settingsId, setSettingsId] = useState(null)
  const [formData, setFormData] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const isDev = import.meta.env?.DEV

  useEffect(() => {
    if (!user?.id) {
      if (isDev) {
        const localSettings = loadLocalSettings()
        setFormData(normalizeSettings(localSettings || DEFAULT_SETTINGS))
      }
      setLoading(false)
      return
    }
    loadSettings()
  }, [user?.id, isDev])

  const loadSettings = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout loading invoice settings.')), 8000)
      })
      const queryPromise = supabase
        .from('invoice_settings')
        .select('*')
        .eq('user_id', user.id)
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

    if (!user?.id) {
      try {
        setSaving(true)
        const dataUrl = await readFileAsDataUrl(file)
        setFormData((prev) => ({
          ...prev,
          logo_url: dataUrl
        }))
        saveLocalSettings({ ...formData, logo_url: dataUrl })
        toast.success('Logo uploaded locally. Remember to save changes.')
      } catch (err) {
        console.error('Error reading logo file:', err)
        toast.error('Failed to read logo file.')
      } finally {
        setSaving(false)
        event.target.value = ''
      }
      return
    }

    try {
      setSaving(true)
      const extension = file.name.split('.').pop()?.toLowerCase() || 'png'
      const filePath = `invoice-settings/${user.id}/logo.${extension}`

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

      setFormData((prev) => ({
        ...prev,
        logo_url: urlData.publicUrl
      }))
      toast.success('Logo uploaded. Remember to save changes.')
    } catch (err) {
      console.error('Error uploading logo:', err)
      toast.error('Failed to upload logo.')
    } finally {
      setSaving(false)
      event.target.value = ''
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!user?.id) {
      if (isDev) {
        saveLocalSettings(formData)
        toast.success('Invoice settings saved locally (dev mode).')
        return
      }
      toast.error('No user session found.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        user_id: user.id,
        logo_url: formData.logo_url || null,
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

      toast.success('Invoice settings saved.')
    } catch (err) {
      console.error('Error saving invoice settings:', err)
      toast.error('Failed to save invoice settings.')
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

  if (!user?.id) {
    if (isDev) {
      return (
        <div className="settings-card invoice-settings-card">
          <div className="invoice-settings-header">
            <div>
              <h3 className="card-title">Company Settings</h3>
              <p className="card-description">
                Dev mode: settings are saved locally until auth is enabled.
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
    return (
      <div className="invoice-settings-loading">
        Sign in to manage invoice settings.
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
