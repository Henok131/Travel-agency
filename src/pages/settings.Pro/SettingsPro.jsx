// SettingsPro.jsx - Professional SaaS Settings Page
// Redesigned with Stripe/Vercel/Linear aesthetics

import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Search, 
  X, 
  Trash2, 
  RotateCcw, 
  Download, 
  FileText,
  LayoutGrid,
  BarChart3,
  FileText as FileIcon,
  Calendar,
  DollarSign,
  Users,
  Settings as SettingsIcon,
  Moon,
  Sun
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/Toast'
import ConfirmModal from '../../components/ConfirmModal'
import DocsViewer from '../../components/DocsViewer'
import LogoEditor from '../../components/LogoEditor'
import CurrencyExchangeCalculator from '../../components/Documentation/CurrencyExchangeCalculator'
import VATCalculator from '../../components/Documentation/VATCalculator'
import TemplatesList from '../../components/Settings/InvoiceTemplates/TemplatesList'
import InvoiceSettingsForm from '../../components/Settings/InvoiceTemplates/InvoiceSettingsForm'
import TemplateEditor from '../../components/Settings/InvoiceTemplates/TemplateEditor'
import logo from '../../assets/logo.png'
import './SettingsPro.css'

// Translation dictionaries (same as original)
const translations = {
  en: {
    sidebar: {
      mainTable: 'Main Table',
      dashboard: 'Dashboard',
      requests: 'Requests',
      bookings: 'Bookings',
      invoices: 'Invoices',
      expenses: 'Expenses',
      customers: 'Customers',
      bank: 'Bank',
      tax: 'TAX',
      settings: 'Settings',
      footer: '© 2026 LST Travel Agency'
    },
    theme: {
      dark: 'Dark',
      light: 'Light'
    },
    settings: {
      title: 'Settings',
      tabs: {
        recyclingBin: 'Recycling Bin',
        logoManagement: 'Logo',
        documentation: 'Docs',
        calculators: 'Calculators',
        invoiceTemplates: 'Invoice Templates',
        preferences: 'Preferences',
        systemInfo: 'System',
        backup: 'Export',
        support: 'Support'
      },
      recyclingBin: {
        title: 'Recycling Bin',
        description: 'View and restore deleted items',
        empty: 'Recycling bin is empty',
        restore: 'Restore',
        deletePermanently: 'Delete Permanently',
        restoreSuccess: 'Item restored successfully',
        deleteSuccess: 'Item permanently deleted',
        restoreError: 'Failed to restore item',
        deleteError: 'Failed to delete item',
        confirmRestore: 'Are you sure you want to restore this item?',
        confirmDelete: 'Are you sure you want to permanently delete this item? This action cannot be undone.',
        lastDeleted: 'Last deleted',
        type: 'Type',
        name: 'Name'
      },
      logo: {
        title: 'Logo Management',
        description: 'Upload and manage your company logo',
        currentLogo: 'Current Logo',
        uploadNew: 'Upload New Logo',
        remove: 'Remove Logo',
        uploadSuccess: 'Logo uploaded successfully',
        uploadError: 'Failed to upload logo',
        removeSuccess: 'Logo removed successfully',
        removeError: 'Failed to remove logo',
        supportedFormats: 'Supported formats: PNG, JPG, SVG (max 2MB)',
        preview: 'Preview'
      },
      documentation: {
        title: 'System Documentation',
        description: 'Learn how to use the system',
        sections: {
          gettingStarted: 'Getting Started',
          features: 'Features',
          faq: 'Frequently Asked Questions',
          support: 'Support'
        },
        gettingStarted: {
          title: 'Getting Started',
          content: `Welcome to LST Travel Management System!

1. **Create a Request**: Navigate to Requests > Create New Request
2. **Upload Passport**: Use the upload button or paste (Ctrl+V) for OCR extraction
3. **Fill Information**: Complete the form with passenger details
4. **View Main Table**: Check all bookings and financial data in Main Table
5. **Manage Expenses**: Track expenses in the Expenses section`
        },
        features: {
          title: 'Key Features',
          content: `• **OCR Extraction**: Automatically extract data from passport images
• **Excel-like Editing**: Edit data directly in tables
• **Date Filtering**: Filter by date ranges (Today, This Week, This Month, etc.)
• **Search**: Quick search across all fields
• **Invoice Generation**: Generate invoices for bookings
• **Multi-language**: Support for English and German
• **Dark/Light Theme**: Choose your preferred theme`
        },
        faq: {
          title: 'FAQ',
          content: `**Q: How do I restore a deleted item?**
A: Go to Settings > Recycling Bin and click Restore.

**Q: Can I upload a custom logo?**
A: Yes, go to Settings > Logo Management and upload your logo.

**Q: How do I export data?**
A: Use the Backup & Export section in Settings.

**Q: How do I use OCR extraction?**
A: Click "Extract with OCR", then either upload a file or paste an image (Ctrl+V).`
        },
        support: {
          title: 'Support',
          content: `For technical support or questions:
• Email: support@lsttravel.com
• Phone: +49 XXX XXX XXXX
• Office Hours: Monday-Friday, 9:00-18:00`
        }
      },
      preferences: {
        title: 'Preferences',
        description: 'Customize your experience',
        language: 'Language',
        theme: 'Theme',
        autoSave: 'Auto-save changes',
        notifications: 'Enable notifications',
        defaultDateFilter: 'Default Date Filter',
        dateFilters: {
          today: 'Today',
          thisWeek: 'This Week',
          thisMonth: 'This Month',
          thisYear: 'This Year',
          all: 'All Time'
        }
      },
      systemInfo: {
        title: 'System Information',
        description: 'System details and version',
        version: 'Version',
        lastUpdate: 'Last Update',
        database: 'Database',
        storage: 'Storage Used',
        totalUsers: 'Total Users',
        organization: 'Organization'
      },
      backup: {
        title: 'Backup & Export',
        description: 'Export your data',
        exportAll: 'Export All Data',
        exportRequests: 'Export Requests',
        exportBookings: 'Export Bookings',
        exportExpenses: 'Export Expenses',
        exportSuccess: 'Export completed successfully',
        exportError: 'Failed to export data',
        format: 'Format',
        formats: {
          csv: 'CSV',
          excel: 'Excel',
          json: 'JSON'
        }
      },
      support: {
        title: 'Support & Help',
        description: 'Get help and contact support',
        contactSupport: 'Contact Support',
        contactDescription: 'Our team is here to help',
        emailSupport: 'Email Support',
        emailDetail: 'support@asenaytech.com',
        emailMeta: 'Response within 24 hours',
        visitWebsite: 'Visit Website',
        websiteDetail: 'asenaytech.com',
        websiteMeta: 'Documentation & guides',
        quickHelp: 'Quick Help',
        documentation: 'Documentation',
        documentationDesc: 'Complete user guides and tutorials',
        faq: 'FAQ',
        faqDesc: 'Frequently asked questions',
        videoTutorials: 'Video Tutorials',
        videoDesc: 'Step-by-step video guides',
        featureRequest: 'Feature Request',
        featureDesc: 'Suggest new features',
        bugReport: 'Report Bug',
        bugDesc: 'Report technical issues',
        about: 'About',
        company: 'Asenay Tech',
        tagline: 'Travel Management Solutions',
        privacyPolicy: 'Privacy Policy',
        termsOfService: 'Terms of Service',
        contactUs: 'Contact Us',
        copyright: '© 2026 Asenay Tech. All rights reserved.',
        supportInfo: 'Support Information',
        supportEmail: 'Support Email',
        supportEmailDesc: 'For technical assistance',
        website: 'Website',
        websiteDesc: 'Documentation and resources',
        supportHours: 'Support Hours',
        supportHoursDesc: 'Monday - Friday',
        supportHoursValue: '9:00 AM - 6:00 PM CET'
      }
    }
  },
  de: {
    sidebar: {
      mainTable: 'Haupttabelle',
      dashboard: 'Dashboard',
      requests: 'Anfragen',
      bookings: 'Buchungen',
      invoices: 'Rechnungen',
      expenses: 'Ausgaben',
      customers: 'Kunden',
      bank: 'Bank',
      tax: 'Steuern',
      settings: 'Einstellungen',
      footer: '© 2026 LST Reisebüro'
    },
    theme: {
      dark: 'Dunkel',
      light: 'Hell'
    },
    settings: {
      title: 'Einstellungen',
      tabs: {
        recyclingBin: 'Papierkorb',
        logoManagement: 'Logo',
        documentation: 'Dokumentation',
        calculators: 'Rechner',
        invoiceTemplates: 'Rechnungsvorlagen',
        preferences: 'Einstellungen',
        systemInfo: 'System',
        backup: 'Export',
        support: 'Support'
      },
      recyclingBin: {
        title: 'Papierkorb',
        description: 'Gelöschte Elemente anzeigen und wiederherstellen',
        empty: 'Papierkorb ist leer',
        restore: 'Wiederherstellen',
        deletePermanently: 'Endgültig löschen',
        restoreSuccess: 'Element erfolgreich wiederhergestellt',
        deleteSuccess: 'Element endgültig gelöscht',
        restoreError: 'Wiederherstellung fehlgeschlagen',
        deleteError: 'Löschen fehlgeschlagen',
        confirmRestore: 'Möchten Sie dieses Element wirklich wiederherstellen?',
        confirmDelete: 'Möchten Sie dieses Element wirklich endgültig löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
        lastDeleted: 'Zuletzt gelöscht',
        type: 'Typ',
        name: 'Name'
      },
      logo: {
        title: 'Logo-Verwaltung',
        description: 'Laden Sie Ihr Firmenlogo hoch und verwalten Sie es',
        currentLogo: 'Aktuelles Logo',
        uploadNew: 'Neues Logo hochladen',
        remove: 'Logo entfernen',
        uploadSuccess: 'Logo erfolgreich hochgeladen',
        uploadError: 'Logo-Upload fehlgeschlagen',
        removeSuccess: 'Logo erfolgreich entfernt',
        removeError: 'Logo konnte nicht entfernt werden',
        supportedFormats: 'Unterstützte Formate: PNG, JPG, SVG (max. 2MB)',
        preview: 'Vorschau'
      },
      documentation: {
        title: 'Systemdokumentation',
        description: 'Erfahren Sie, wie Sie das System verwenden',
        sections: {
          gettingStarted: 'Erste Schritte',
          features: 'Funktionen',
          faq: 'Häufig gestellte Fragen',
          support: 'Support'
        },
        gettingStarted: {
          title: 'Erste Schritte',
          content: `Willkommen beim LST Travel Management System!

1. **Anfrage erstellen**: Navigieren Sie zu Anfragen > Neue Anfrage erstellen
2. **Pass hochladen**: Verwenden Sie die Upload-Schaltfläche oder fügen Sie (Strg+V) für OCR-Extraktion ein
3. **Informationen ausfüllen**: Vervollständigen Sie das Formular mit Passagierdaten
4. **Haupttabelle anzeigen**: Überprüfen Sie alle Buchungen und Finanzdaten in der Haupttabelle
5. **Ausgaben verwalten**: Verfolgen Sie Ausgaben im Bereich Ausgaben`
        },
        features: {
          title: 'Hauptfunktionen',
          content: `• **OCR-Extraktion**: Automatisches Extrahieren von Daten aus Passbildern
• **Excel-ähnliche Bearbeitung**: Bearbeiten Sie Daten direkt in Tabellen
• **Datumsfilterung**: Filtern nach Datumsbereichen (Heute, Diese Woche, Dieser Monat, etc.)
• **Suche**: Schnellsuche über alle Felder
• **Rechnungserstellung**: Generieren Sie Rechnungen für Buchungen
• **Mehrsprachig**: Unterstützung für Englisch und Deutsch
• **Dunkles/Helles Design**: Wählen Sie Ihr bevorzugtes Design`
        },
        faq: {
          title: 'FAQ',
          content: `**F: Wie stelle ich ein gelöschtes Element wieder her?**
A: Gehen Sie zu Einstellungen > Papierkorb und klicken Sie auf Wiederherstellen.

**F: Kann ich ein benutzerdefiniertes Logo hochladen?**
A: Ja, gehen Sie zu Einstellungen > Logo-Verwaltung und laden Sie Ihr Logo hoch.

**F: Wie exportiere ich Daten?**
A: Verwenden Sie den Bereich Backup & Export in den Einstellungen.

**F: Wie verwende ich die OCR-Extraktion?**
A: Klicken Sie auf "Mit OCR extrahieren", dann laden Sie entweder eine Datei hoch oder fügen Sie ein Bild ein (Strg+V).`
        },
        support: {
          title: 'Support',
          content: `Für technischen Support oder Fragen:
• E-Mail: support@lsttravel.com
• Telefon: +49 XXX XXX XXXX
• Bürozeiten: Montag-Freitag, 9:00-18:00`
        }
      },
      preferences: {
        title: 'Einstellungen',
        description: 'Passen Sie Ihre Erfahrung an',
        language: 'Sprache',
        theme: 'Design',
        autoSave: 'Änderungen automatisch speichern',
        notifications: 'Benachrichtigungen aktivieren',
        defaultDateFilter: 'Standard-Datumsfilter',
        dateFilters: {
          today: 'Heute',
          thisWeek: 'Diese Woche',
          thisMonth: 'Dieser Monat',
          thisYear: 'Dieses Jahr',
          all: 'Alle Zeit'
        }
      },
      systemInfo: {
        title: 'Systeminformationen',
        description: 'Systemdetails und Version',
        version: 'Version',
        lastUpdate: 'Letzte Aktualisierung',
        database: 'Datenbank',
        storage: 'Verwendeter Speicher',
        totalUsers: 'Gesamtbenutzer',
        organization: 'Organisation'
      },
      backup: {
        title: 'Backup & Export',
        description: 'Exportieren Sie Ihre Daten',
        exportAll: 'Alle Daten exportieren',
        exportRequests: 'Anfragen exportieren',
        exportBookings: 'Buchungen exportieren',
        exportExpenses: 'Ausgaben exportieren',
        exportSuccess: 'Export erfolgreich abgeschlossen',
        exportError: 'Datenexport fehlgeschlagen',
        format: 'Format',
        formats: {
          csv: 'CSV',
          excel: 'Excel',
          json: 'JSON'
        }
      },
      support: {
        title: 'Support & Hilfe',
        description: 'Hilfe erhalten und Support kontaktieren',
        contactSupport: 'Support kontaktieren',
        contactDescription: 'Unser Team hilft Ihnen gerne',
        emailSupport: 'E-Mail-Support',
        emailDetail: 'support@asenaytech.com',
        emailMeta: 'Antwort innerhalb von 24 Stunden',
        visitWebsite: 'Website besuchen',
        websiteDetail: 'asenaytech.com',
        websiteMeta: 'Dokumentation & Anleitungen',
        quickHelp: 'Schnelle Hilfe',
        documentation: 'Dokumentation',
        documentationDesc: 'Vollständige Benutzerhandbücher und Tutorials',
        faq: 'FAQ',
        faqDesc: 'Häufig gestellte Fragen',
        videoTutorials: 'Video-Tutorials',
        videoDesc: 'Schritt-für-Schritt-Videoanleitungen',
        featureRequest: 'Funktionsanfrage',
        featureDesc: 'Neue Funktionen vorschlagen',
        bugReport: 'Fehler melden',
        bugDesc: 'Technische Probleme melden',
        about: 'Über',
        company: 'Asenay Tech',
        tagline: 'Travel Management Solutions',
        privacyPolicy: 'Datenschutzerklärung',
        termsOfService: 'Nutzungsbedingungen',
        contactUs: 'Kontakt',
        copyright: '© 2026 Asenay Tech. Alle Rechte vorbehalten.',
        supportInfo: 'Support-Informationen',
        supportEmail: 'Support-E-Mail',
        supportEmailDesc: 'Für technische Unterstützung',
        website: 'Website',
        websiteDesc: 'Dokumentation und Ressourcen',
        supportHours: 'Support-Zeiten',
        supportHoursDesc: 'Montag - Freitag',
        supportHoursValue: '9:00 - 18:00 MEZ'
      }
    }
  }
}

// Documentation Tab Component
function DocumentationTab({ language }) {
  const navigate = useNavigate()
  const [selectedDoc, setSelectedDoc] = useState('quick-start')
  const [searchQuery, setSearchQuery] = useState('')

  const docCategories = [
    {
      id: 'getting-started',
      label: language === 'de' ? 'Erste Schritte' : 'Getting Started',
      docs: [
        { id: 'quick-start', label: language === 'de' ? 'Schnellstart' : 'Quick Start' }
      ]
    },
    {
      id: 'financial',
      label: language === 'de' ? 'Finanzsystem' : 'Financial',
      docs: [
        { id: 'calculations', label: language === 'de' ? 'Berechnungen' : 'Calculations & Formulas' }
      ]
    },
    {
      id: 'tax',
      label: language === 'de' ? 'Steuer' : 'Tax',
      docs: [
        { id: 'vat-calculation', label: language === 'de' ? 'MwSt-Berechnung' : 'VAT Calculation' },
        { id: 'skr03-categories', label: language === 'de' ? 'SKR03-Kategorien' : 'SKR03 Categories' }
      ]
    },
    {
      id: 'faq',
      label: 'FAQ',
      docs: [
        { id: 'common-questions', label: language === 'de' ? 'Häufige Fragen' : 'Common Questions' }
      ]
    }
  ]

  const quickLinks = [
    { id: 'calculations', label: language === 'de' ? 'Formeln' : 'Formulas' },
    { id: 'vat-calculation', label: language === 'de' ? 'MwSt' : 'VAT' },
    { id: 'skr03-categories', label: 'SKR03' }
  ]

  const handleDocSelect = (docId) => {
    setSelectedDoc(docId)
  }

  return (
    <div className="documentation-tab">
      <div className="documentation-header">
        <div>
          <h2 className="settings-pro-section-title">
            {language === 'de' ? 'Dokumentation' : 'Documentation'}
          </h2>
          <p className="settings-pro-section-description">
            {language === 'de' 
              ? 'Vollständige Systemdokumentation und Anleitungen' 
              : 'Complete system documentation and guides'}
          </p>
        </div>
        
        {/* Quick Links */}
        <div className="doc-quick-links">
          {quickLinks.map(link => (
            <button
              key={link.id}
              className={`doc-quick-link ${selectedDoc === link.id ? 'active' : ''}`}
              onClick={() => handleDocSelect(link.id)}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>

      <div className="documentation-layout">
        {/* Category Sidebar */}
        <aside className="doc-category-sidebar">
          <div className="doc-search-bar">
            <Search className="doc-search-icon icon-14" />
            <input
              type="text"
              placeholder={language === 'de' ? 'Dokumentation durchsuchen...' : 'Search documentation...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="doc-search-input"
            />
            {searchQuery && (
              <button
                className="doc-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X className="icon-14" />
              </button>
            )}
          </div>

          <nav className="doc-categories">
            {docCategories.map(category => {
              const filteredDocs = searchQuery
                ? category.docs.filter(doc => 
                    doc.label.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                : category.docs

              if (filteredDocs.length === 0) return null

              return (
                <div key={category.id} className="doc-category">
                  <h3 className="doc-category-title">{category.label}</h3>
                  <ul className="doc-category-list">
                    {filteredDocs.map(doc => (
                      <li key={doc.id}>
                        <button
                          className={`doc-category-item ${selectedDoc === doc.id ? 'active' : ''}`}
                          onClick={() => handleDocSelect(doc.id)}
                        >
                          {doc.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </nav>
        </aside>

        {/* Markdown Viewer */}
        <main className="doc-viewer-container">
          {selectedDoc === 'calculations' ? (
            <CalculationsPage language={language} />
          ) : (
            <DocsViewer docId={selectedDoc} language={language} />
          )}
        </main>
      </div>
    </div>
  )
}

function SettingsPro() {
  const { organization, userProfile } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [language, setLanguage] = useState('en')
  const t = translations[language]
  
  const [theme, setTheme] = useState('dark')
  const [activeTab, setActiveTab] = useState('recyclingBin')
  const [activeCalculator, setActiveCalculator] = useState('currency')
  const [deletedItems, setDeletedItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [logoUrl, setLogoUrl] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, item: null })
  const logoInputRef = useRef(null)

  // Apply theme to HTML element
  useEffect(() => {
    document.documentElement.className = theme
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Load logo from organization
  useEffect(() => {
    if (organization?.logo_url) {
      setLogoUrl(organization.logo_url)
    } else {
      // Try to load from storage
      loadLogoFromStorage()
    }
  }, [organization])

  // Load deleted items (for recycling bin) - filtered by organization
  useEffect(() => {
    loadDeletedItems()
  }, [organization])

  const loadLogoFromStorage = async () => {
    if (!organization?.id) return
    
    try {
      const { data, error } = await supabase.storage
        .from('logos')
        .download(`${organization.id}/logo.png`)
      
      if (!error && data) {
        const url = URL.createObjectURL(data)
        setLogoUrl(url)
      }
    } catch (err) {
      // Logo doesn't exist in storage, that's okay
      console.log('No logo in storage')
    }
  }

  const loadDeletedItems = async () => {
    try {
      // Load deleted items from deleted_items table
      // If organization exists, filter by it; otherwise show all items
      let query = supabase
        .from('deleted_items')
        .select('*')
        .order('deleted_at', { ascending: false })

      // Filter by organization if it exists
      // If no organization, we'll show all items (no filter)
      if (organization?.id) {
        query = query.eq('organization_id', organization.id)
      }
      // If no organization, don't filter - show all deleted items

      const { data, error } = await query

      if (error) {
        console.error('❌ Error loading deleted items:', error)
        // If table doesn't exist, show helpful message
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.error('❌ deleted_items table does not exist!')
          console.error('📋 Please run migration: 005_create_deleted_items.sql in Supabase SQL Editor')
          toast.error('Recycling bin table not found. Please run database migration.')
          setDeletedItems([])
          return
        }
        throw error
      }

      // Transform data to match component expectations
      const deleted = (data || []).map(item => ({
        id: item.id,
        originalId: item.original_id,
        type: item.item_type,
        name: item.item_name,
        deletedAt: item.deleted_at,
        originalTable: item.original_table,
        data: item.item_data
      }))

      console.log('✅ Loaded deleted items:', deleted.length)
      setDeletedItems(deleted)
    } catch (err) {
      console.error('❌ Error loading deleted items:', err)
      setDeletedItems([])
    }
  }

  const handleRestore = async (item) => {
    if (!organization?.id) {
      toast.error('No organization selected')
      return
    }

    setConfirmModal({
      isOpen: true,
      type: 'restore',
      item
    })
  }

  const confirmRestore = async () => {
    const { item } = confirmModal
    setConfirmModal({ isOpen: false, type: null, item: null })

    try {
      setLoading(true)
      
      if (!item.data || !item.originalTable) {
        throw new Error('Invalid item data or original table')
      }

      // Supported tables for restore
      const supportedTables = ['requests', 'main_table', 'expenses', 'bookings', 'invoices']
      
      if (!supportedTables.includes(item.originalTable)) {
        throw new Error(`Restore not supported for table: ${item.originalTable}`)
      }

      // Remove system fields and prepare restore data
      const { id, created_at, updated_at, organization_id, ...restoreData } = item.data
      
      // Restore to the original table with current organization_id
      const { error } = await supabase
        .from(item.originalTable)
        .insert([{ ...restoreData, organization_id: organization.id }])
      
      if (error) throw error
      
      // Remove from deleted_items table
      const { error: deleteError } = await supabase
        .from('deleted_items')
        .delete()
        .eq('id', item.id)
      
      if (deleteError) throw deleteError
      
      toast.success(t.settings.recyclingBin.restoreSuccess)
      loadDeletedItems()
    } catch (err) {
      console.error('Error restoring item:', err)
      toast.error(t.settings.recyclingBin.restoreError + ': ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePermanently = async (item) => {
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      item
    })
  }

  const confirmDelete = async () => {
    const { item } = confirmModal
    setConfirmModal({ isOpen: false, type: null, item: null })

    try {
      setLoading(true)
      
      // Delete from deleted_items table (permanent deletion from recycling bin)
      // item.id is the deleted_items table ID, not the original record ID
      const { error } = await supabase
        .from('deleted_items')
        .delete()
        .eq('id', item.id)
      
      if (error) throw error
      
      toast.success(t.settings.recyclingBin.deleteSuccess)
      loadDeletedItems()
    } catch (err) {
      console.error('Error deleting item permanently:', err)
      toast.error(t.settings.recyclingBin.deleteError + ': ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleLogoSave = async (fileBlob) => {
    if (!fileBlob) return

    if (!organization?.id) {
      toast.error('No organization selected')
      return
    }

    try {
      setLoading(true)
      
      // Upload to Supabase Storage
      const fileName = `${organization.id}/logo.png`
      
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, fileBlob, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName)

      // Update organization logo_url
      const { error: updateError } = await supabase
        .from('organizations')
        .update({ logo_url: urlData.publicUrl })
        .eq('id', organization.id)

      if (updateError) throw updateError

      setLogoUrl(urlData.publicUrl)
      toast.success(t.settings.logo.uploadSuccess)
    } catch (err) {
      console.error('Error uploading logo:', err)
      toast.error(t.settings.logo.uploadError)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoRemove = () => {
    setConfirmModal({
      isOpen: true,
      type: 'removeLogo',
      item: null
    })
  }

  const confirmRemoveLogo = async () => {
    setConfirmModal({ isOpen: false, type: null, item: null })

    if (!organization?.id) {
      toast.error('No organization selected')
      return
    }

    try {
      setLoading(true)
      
      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('logos')
        .remove([`${organization.id}/logo.png`, `${organization.id}/logo.jpg`, `${organization.id}/logo.svg`])

      // Update organization (remove logo_url)
      const { error: updateError } = await supabase
        .from('organizations')
        .update({ logo_url: null })
        .eq('id', organization.id)

      if (updateError) throw updateError

      setLogoUrl(null)
      toast.success(t.settings.logo.removeSuccess)
    } catch (err) {
      console.error('Error removing logo:', err)
      toast.error(t.settings.logo.removeError)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (type, format) => {
    if (!organization?.id) {
      toast.error('No organization selected')
      return
    }

    try {
      setLoading(true)
      
      let data = []
      let filename = ''

      if (type === 'all') {
        const [requests, bookings, expenses] = await Promise.all([
          supabase.from('requests').select('*').eq('organization_id', organization.id),
          supabase.from('main_table').select('*').eq('organization_id', organization.id),
          supabase.from('expenses').select('*').eq('organization_id', organization.id)
        ])
        data = {
          requests: requests.data || [],
          bookings: bookings.data || [],
          expenses: expenses.data || []
        }
        filename = `lst-travel-export-all-${Date.now()}`
      } else if (type === 'requests') {
        const { data: requestsData } = await supabase
          .from('requests')
          .select('*')
          .eq('organization_id', organization.id)
        data = requestsData || []
        filename = `lst-travel-requests-${Date.now()}`
      } else if (type === 'bookings') {
        const { data: bookingsData } = await supabase
          .from('main_table')
          .select('*')
          .eq('organization_id', organization.id)
        data = bookingsData || []
        filename = `lst-travel-bookings-${Date.now()}`
      } else if (type === 'expenses') {
        const { data: expensesData } = await supabase
          .from('expenses')
          .select('*')
          .eq('organization_id', organization.id)
        data = expensesData || []
        filename = `lst-travel-expenses-${Date.now()}`
      }

      // Convert to format and download
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${filename}.json`
        a.click()
        URL.revokeObjectURL(url)
      } else if (format === 'csv') {
        const csv = convertToCSV(data)
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${filename}.csv`
        a.click()
        URL.revokeObjectURL(url)
      }

      toast.success(t.settings.backup.exportSuccess)
    } catch (err) {
      console.error('Error exporting data:', err)
      toast.error(t.settings.backup.exportError)
    } finally {
      setLoading(false)
    }
  }

  const convertToCSV = (data) => {
    if (Array.isArray(data)) {
      if (data.length === 0) return ''
      const headers = Object.keys(data[0])
      const rows = data.map(row => headers.map(header => {
        const value = row[header]
        if (value === null || value === undefined) return ''
        if (typeof value === 'object') return JSON.stringify(value)
        return String(value).replace(/"/g, '""')
      }))
      return [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
    } else {
      return Object.entries(data).map(([key, value]) => {
        return `\n${key}\n${convertToCSV(value)}`
      }).join('\n')
    }
  }

  const tabs = [
    { id: 'recyclingBin', label: t.settings.tabs.recyclingBin },
    { id: 'logoManagement', label: t.settings.tabs.logoManagement },
    { id: 'documentation', label: t.settings.tabs.documentation },
    { id: 'calculators', label: t.settings.tabs.calculators },
    { id: 'invoiceTemplates', label: t.settings.tabs.invoiceTemplates },
    { id: 'preferences', label: t.settings.tabs.preferences },
    { id: 'systemInfo', label: t.settings.tabs.systemInfo },
    { id: 'backup', label: t.settings.tabs.backup },
    { id: 'support', label: t.settings.tabs.support }
  ]

  return (
    <div className="page-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <img src={logoUrl || logo} alt="LST Travel Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          </div>
          <div className="sidebar-brand-text">LST Travel</div>
        </div>

        <div className="sidebar-language">
          <button 
            className={`lang-button ${language === 'de' ? 'active' : ''}`} 
            type="button" 
            onClick={() => setLanguage('de')}
          >
            DE
          </button>
          <button 
            className={`lang-button ${language === 'en' ? 'active' : ''}`} 
            type="button" 
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
        </div>

        <div className="sidebar-theme">
          <button 
            className={`theme-button ${theme === 'dark' ? 'active' : ''}`} 
            type="button" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Moon className="icon-14" />
            ) : (
              <Sun className="icon-14" />
            )}
            {theme === 'dark' ? t.theme.dark : t.theme.light}
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/main" className="nav-item">
            <LayoutGrid className="icon-14" />
            <span>{t.sidebar.mainTable}</span>
          </Link>
          <Link to="/dashboard" className="nav-item">
            <BarChart3 className="icon-14" />
            <span>{t.sidebar.dashboard}</span>
          </Link>
          <Link to="/requests" className="nav-item">
            <FileIcon className="icon-14" />
            <span>{t.sidebar.requests}</span>
          </Link>
          <Link to="/bookings" className="nav-item">
            <Calendar className="icon-14" />
            <span>{t.sidebar.bookings}</span>
          </Link>
          <Link to="/invoices" className="nav-item">
            <FileText className="icon-14" />
            <span>{t.sidebar.invoices}</span>
          </Link>
          <Link to="/expenses" className="nav-item">
            <DollarSign className="icon-14" />
            <span>{t.sidebar.expenses}</span>
          </Link>
          <Link to="/customers" className="nav-item">
            <Users className="icon-14" />
            <span>{t.sidebar.customers}</span>
          </Link>
          <Link to="/bank" className="nav-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <path d="M2 10h20"/>
              <path d="M7 14h.01"/>
              <path d="M11 14h.01"/>
            </svg>
            <span>{t.sidebar.bank}</span>
          </Link>
          <Link to="/tax" className="nav-item">
            <DollarSign className="icon-14" />
            <span>{t.sidebar.tax}</span>
          </Link>
          <Link to="/settings" className="nav-item active">
            <SettingsIcon className="icon-14" />
            <span>{t.sidebar.settings}</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-text">{t.sidebar.footer}</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="settings-pro-page">
          <div className="settings-pro-header">
            <h1 className="settings-pro-title">{t.settings.title}</h1>
            {organization && (
              <div className="settings-pro-org-badge">
                {organization.name}
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="settings-pro-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`settings-pro-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="settings-pro-content">
            {/* Recycling Bin */}
            {activeTab === 'recyclingBin' && (
              <div className="settings-pro-section">
                <h2 className="settings-pro-section-title">{t.settings.recyclingBin.title}</h2>
                <p className="settings-pro-section-description">{t.settings.recyclingBin.description}</p>
                
                {deletedItems.length === 0 ? (
                  <div className="settings-pro-empty-state">
                    <p>{t.settings.recyclingBin.empty}</p>
                  </div>
                ) : (
                  <div className="recycling-bin-list">
                    {deletedItems.map((item) => (
                      <div key={item.id} className="recycling-bin-item">
                        <div className="recycling-bin-item-info">
                          <div className="recycling-bin-item-type">{item.type}</div>
                          <div className="recycling-bin-item-name">{item.name || `ID: ${item.id}`}</div>
                          <div className="recycling-bin-item-date">
                            {t.settings.recyclingBin.lastDeleted}: {new Date(item.deletedAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="recycling-bin-item-actions">
                          <button
                            className="btn btn-secondary btn-small"
                            onClick={() => handleRestore(item)}
                            disabled={loading}
                          >
                            <RotateCcw className="icon-14" />
                            {t.settings.recyclingBin.restore}
                          </button>
                          <button
                            className="btn btn-danger btn-small"
                            onClick={() => handleDeletePermanently(item)}
                            disabled={loading}
                          >
                            <Trash2 className="icon-14" />
                            {t.settings.recyclingBin.deletePermanently}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Logo Management */}
            {activeTab === 'logoManagement' && (
              <div className="settings-pro-section">
                <h2 className="settings-pro-section-title">{t.settings.logo.title}</h2>
                <p className="settings-pro-section-description">{t.settings.logo.description}</p>
                
                <LogoEditor
                  imageUrl={logoUrl}
                  onSave={handleLogoSave}
                  onCancel={() => {}}
                  onRemove={handleLogoRemove}
                  loading={loading}
                />
              </div>
            )}

            {/* Documentation */}
            {activeTab === 'documentation' && (
              <DocumentationTab language={language} />
            )}

            {/* Calculators */}
            {activeTab === 'calculators' && (
              <div className="settings-pro-section">
                <h2 className="settings-pro-section-title">
                  {language === 'de' ? 'Finanzielle Rechner' : 'Financial Calculators'}
                </h2>
                <p className="settings-pro-section-description">
                  {language === 'de' 
                    ? 'Währungsumrechnung und Mehrwertsteuerberechnungen für Buchungen'
                    : 'Currency conversion and VAT calculations for bookings'}
                </p>

                {/* Calculator Selector */}
                <div className="calculator-selector">
                  <button
                    className={`calculator-option ${activeCalculator === 'currency' ? 'active' : ''}`}
                    onClick={() => setActiveCalculator('currency')}
                    type="button"
                  >
                    <div className="calculator-option-content">
                      <h3>{language === 'de' ? 'Währungsumtausch' : 'Currency Exchange'}</h3>
                      <p>{language === 'de' 
                        ? 'Umrechnung zwischen 150+ Währungen mit Live-Kursen'
                        : 'Convert between 150+ currencies with live rates'}</p>
                    </div>
                  </button>

                  <button
                    className={`calculator-option ${activeCalculator === 'vat' ? 'active' : ''}`}
                    onClick={() => setActiveCalculator('vat')}
                    type="button"
                  >
                    <div className="calculator-option-content">
                      <h3>{language === 'de' ? 'MwSt-Rechner' : 'VAT Calculator'}</h3>
                      <p>{language === 'de' 
                        ? 'Berechnen Sie die Mehrwertsteuer aus Brutto- oder Nettobeträgen'
                        : 'Calculate VAT from gross or net amounts'}</p>
                    </div>
                  </button>
                </div>

                {/* Active Calculator */}
                <div className="calculator-container">
                  {activeCalculator === 'currency' && <CurrencyExchangeCalculator />}
                  {activeCalculator === 'vat' && <VATCalculator />}
                </div>
              </div>
            )}

            {/* Invoice Templates */}
            {activeTab === 'invoiceTemplates' && (() => {
              const action = searchParams.get('action')
              
              return action === 'new' || action === 'edit' ? (
                <TemplateEditor />
              ) : (
                <div className="settings-pro-section">
                  <InvoiceSettingsForm />
                  <TemplatesList />
                </div>
              )
            })()}

            {/* Preferences */}
            {activeTab === 'preferences' && (
              <div className="settings-pro-section">
                <h2 className="settings-pro-section-title">{t.settings.preferences.title}</h2>
                <p className="settings-pro-section-description">{t.settings.preferences.description}</p>
                
                <div className="preferences-list">
                  <div className="preference-item">
                    <div className="preference-label">
                      <div className="preference-label-text">{t.settings.preferences.language}</div>
                    </div>
                    <div className="preference-value">
                      <button
                        className={`btn btn-small ${language === 'en' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setLanguage('en')}
                      >
                        English
                      </button>
                      <button
                        className={`btn btn-small ${language === 'de' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setLanguage('de')}
                      >
                        Deutsch
                      </button>
                    </div>
                  </div>
                  
                  <div className="preference-item">
                    <div className="preference-label">
                      <div className="preference-label-text">{t.settings.preferences.theme}</div>
                    </div>
                    <div className="preference-value">
                      <button
                        className={`btn btn-small ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setTheme('dark')}
                      >
                        {t.theme.dark}
                      </button>
                      <button
                        className={`btn btn-small ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setTheme('light')}
                      >
                        {t.theme.light}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Info */}
            {activeTab === 'systemInfo' && (
              <div className="settings-pro-section">
                <h2 className="settings-pro-section-title">{t.settings.systemInfo.title}</h2>
                <p className="settings-pro-section-description">{t.settings.systemInfo.description}</p>
                
                <div className="system-info-list">
                  <div className="info-item">
                    <div className="info-label">{t.settings.systemInfo.version}</div>
                    <div className="info-value">2.0.0 (Pro)</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">{t.settings.systemInfo.lastUpdate}</div>
                    <div className="info-value">{new Date().toLocaleDateString()}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">{t.settings.systemInfo.database}</div>
                    <div className="info-value">Supabase PostgreSQL</div>
                  </div>
                  {organization && (
                    <div className="info-item">
                      <div className="info-label">{t.settings.systemInfo.organization}</div>
                      <div className="info-value">{organization.name}</div>
                    </div>
                  )}
                </div>

                {/* Support Info Card */}
                <div className="settings-card" style={{ marginTop: 'var(--space-5)' }}>
                  <h3 className="card-title">{t.settings.support.supportInfo}</h3>
                  
                  <div className="settings-row">
                    <div className="settings-label">
                      <span>{t.settings.support.supportEmail}</span>
                      <span className="helper-text">{t.settings.support.supportEmailDesc}</span>
                    </div>
                    <a href="mailto:support@asenaytech.com" className="link-text">
                      support@asenaytech.com
                    </a>
                  </div>

                  <div className="settings-row">
                    <div className="settings-label">
                      <span>{t.settings.support.website}</span>
                      <span className="helper-text">{t.settings.support.websiteDesc}</span>
                    </div>
                    <a href="https://asenaytech.com" target="_blank" rel="noopener noreferrer" className="link-text">
                      asenaytech.com
                    </a>
                  </div>

                  <div className="settings-row">
                    <div className="settings-label">
                      <span>{t.settings.support.supportHours}</span>
                      <span className="helper-text">{t.settings.support.supportHoursDesc}</span>
                    </div>
                    <span className="info-text">{t.settings.support.supportHoursValue}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Backup & Export */}
            {activeTab === 'backup' && (
              <div className="settings-pro-section">
                <h2 className="settings-pro-section-title">{t.settings.backup.title}</h2>
                <p className="settings-pro-section-description">{t.settings.backup.description}</p>
                
                <div className="backup-options">
                  <div className="backup-section">
                    <h3>Export Data</h3>
                    <div className="backup-buttons">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleExport('all', 'json')}
                        disabled={loading || !organization}
                      >
                        <Download className="icon-14" />
                        {t.settings.backup.exportAll} (JSON)
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleExport('requests', 'csv')}
                        disabled={loading || !organization}
                      >
                        <FileText className="icon-14" />
                        {t.settings.backup.exportRequests} (CSV)
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleExport('bookings', 'csv')}
                        disabled={loading || !organization}
                      >
                        <FileText className="icon-14" />
                        {t.settings.backup.exportBookings} (CSV)
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleExport('expenses', 'csv')}
                        disabled={loading || !organization}
                      >
                        <FileText className="icon-14" />
                        {t.settings.backup.exportExpenses} (CSV)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Support & Help */}
            {activeTab === 'support' && (
              <div className="settings-pro-section">
                <h2 className="settings-pro-section-title">{t.settings.support.title}</h2>
                <p className="settings-pro-section-description">{t.settings.support.description}</p>

                {/* Contact Support Card */}
                <div className="settings-card">
                  <h3 className="card-title">{t.settings.support.contactSupport}</h3>
                  <p className="card-description">{t.settings.support.contactDescription}</p>
                  
                  <div className="support-options">
                    <a href="mailto:support@asenaytech.com" className="support-card">
                      <div className="support-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </div>
                      <div className="support-content">
                        <div className="support-title">{t.settings.support.emailSupport}</div>
                        <div className="support-detail">{t.settings.support.emailDetail}</div>
                        <div className="support-meta">{t.settings.support.emailMeta}</div>
                      </div>
                    </a>

                    <a href="https://asenaytech.com" target="_blank" rel="noopener noreferrer" className="support-card">
                      <div className="support-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="2" y1="12" x2="22" y2="12"/>
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                      </div>
                      <div className="support-content">
                        <div className="support-title">{t.settings.support.visitWebsite}</div>
                        <div className="support-detail">{t.settings.support.websiteDetail}</div>
                        <div className="support-meta">{t.settings.support.websiteMeta}</div>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Quick Help Card */}
                <div className="settings-card">
                  <h3 className="card-title">{t.settings.support.quickHelp}</h3>
                  
                  <div className="help-list">
                    <a href="https://asenaytech.com/docs" target="_blank" rel="noopener noreferrer" className="help-item">
                      <div className="help-icon">📚</div>
                      <div className="help-content">
                        <div className="help-title">{t.settings.support.documentation}</div>
                        <div className="help-desc">{t.settings.support.documentationDesc}</div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </a>

                    <a href="https://asenaytech.com/faq" target="_blank" rel="noopener noreferrer" className="help-item">
                      <div className="help-icon">❓</div>
                      <div className="help-content">
                        <div className="help-title">{t.settings.support.faq}</div>
                        <div className="help-desc">{t.settings.support.faqDesc}</div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </a>

                    <a href="https://asenaytech.com/video-tutorials" target="_blank" rel="noopener noreferrer" className="help-item">
                      <div className="help-icon">🎥</div>
                      <div className="help-content">
                        <div className="help-title">{t.settings.support.videoTutorials}</div>
                        <div className="help-desc">{t.settings.support.videoDesc}</div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </a>

                    <button className="help-item" type="button" onClick={() => window.open('mailto:support@asenaytech.com?subject=Feature Request')}>
                      <div className="help-icon">💡</div>
                      <div className="help-content">
                        <div className="help-title">{t.settings.support.featureRequest}</div>
                        <div className="help-desc">{t.settings.support.featureDesc}</div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>

                    <button className="help-item" type="button" onClick={() => window.open('mailto:support@asenaytech.com?subject=Bug Report')}>
                      <div className="help-icon">🐛</div>
                      <div className="help-content">
                        <div className="help-title">{t.settings.support.bugReport}</div>
                        <div className="help-desc">{t.settings.support.bugDesc}</div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Company Info Card */}
                <div className="settings-card">
                  <h3 className="card-title">{t.settings.support.about}</h3>
                  
                  <div className="about-content">
                    <div className="about-logo">
                      <img src={logoUrl || logo} alt="Asenay Tech" style={{ height: '32px', width: 'auto' }} />
                    </div>
                    <div className="about-text">
                      <div className="about-company">{t.settings.support.company}</div>
                      <div className="about-tagline">{t.settings.support.tagline}</div>
                    </div>
                  </div>

                  <div className="about-links">
                    <a href="https://asenaytech.com/privacy" target="_blank" rel="noopener noreferrer">{t.settings.support.privacyPolicy}</a>
                    <span className="separator">•</span>
                    <a href="https://asenaytech.com/terms" target="_blank" rel="noopener noreferrer">{t.settings.support.termsOfService}</a>
                    <span className="separator">•</span>
                    <a href="https://asenaytech.com/contact" target="_blank" rel="noopener noreferrer">{t.settings.support.contactUs}</a>
                  </div>

                  <div className="about-copyright">
                    {t.settings.support.copyright}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: null, item: null })}
        onConfirm={() => {
          if (confirmModal.type === 'restore') confirmRestore()
          else if (confirmModal.type === 'delete') confirmDelete()
          else if (confirmModal.type === 'removeLogo') confirmRemoveLogo()
        }}
        title={
          confirmModal.type === 'restore' ? t.settings.recyclingBin.confirmRestore :
          confirmModal.type === 'delete' ? t.settings.recyclingBin.confirmDelete :
          'Remove Logo'
        }
        message={
          confirmModal.type === 'restore' ? t.settings.recyclingBin.confirmRestore :
          confirmModal.type === 'delete' ? t.settings.recyclingBin.confirmDelete :
          'Are you sure you want to remove the logo?'
        }
        confirmText={confirmModal.type === 'delete' || confirmModal.type === 'removeLogo' ? 'Delete' : 'Restore'}
        type={confirmModal.type === 'delete' || confirmModal.type === 'removeLogo' ? 'danger' : 'warning'}
      />
    </div>
  )
}

export default SettingsPro
