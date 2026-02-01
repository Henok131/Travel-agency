import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../contexts/StoreContext'
import AirportAutocomplete from '../components/AirportAutocomplete'
import * as pdfjsLib from 'pdfjs-dist'
import logo from '../assets/logo.png'
import taxLogo from '../assets/tax-logo.png'
import './CreateRequest.css'

// Configure PDF.js worker - use unpkg CDN (more reliable)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

// Translation dictionaries
const translations = {
  en: {
    // Sidebar
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
      footer: '© 2026 LST Travel Agency'
    },
    // Theme
    theme: {
      dark: 'Dark',
      light: 'Light'
    },
    // Passport upload
    passport: {
      uploadText: 'Upload passport (PDF or image) to begin, or paste with Ctrl+V',
      uploadTextOCR: 'Upload passport for OCR extraction, or paste with Ctrl+V',
      chooseFile: 'Choose File',
      extractOCR: 'Extract with OCR',
      extracting: 'Extracting...',
      ocrSuccess: 'Data extracted successfully!',
      ocrError: 'Failed to extract data. Please try again.',
      retry: 'Retry',
      left: 'left',
      remove: 'Remove passport',
      zoomOut: 'Zoom out (Ctrl + -)',
      zoomIn: 'Zoom in (Ctrl + +)',
      resetZoom: 'Reset zoom (Ctrl + 0)',
      rotateLeft: 'Rotate left (90°)',
      rotateRight: 'Rotate right (90°)',
      ocrOptionsTitle: 'Choose upload method',
      ocrManualUpload: 'Manual Upload',
      ocrPaste: 'Paste (Ctrl+V)',
      ocrPasteHint: 'Press Ctrl+V to paste image',
      pasteWaitingTitle: 'Paste Here for Extraction',
      pasteWaitingText: 'Press Ctrl+V to paste your ID image from clipboard',
      pasteWaitingSubtext: 'Waiting for paste...'
    },
    // Form sections
    sections: {
      passengerInformation: 'PASSENGER INFORMATION',
      passportInformation: 'PASSPORT / DOCUMENT INFORMATION',
      travelInformation: 'TRAVEL INFORMATION',
      requestType: 'REQUEST TYPE * (SELECT MULTIPLE)'
    },
    // Form fields
    fields: {
      lastName: 'Last Name',
      firstName: 'First Name',
      middleName: 'Middle Name(s)',
      dateOfBirth: 'Date of Birth',
      gender: 'Gender',
      nationality: 'Nationality (Document Nationality)',
      passportNumber: 'Passport Number',
      travelDate: 'Travel Date',
      returnDate: 'Return Date',
      departureAirport: 'Departure Airport (From)',
      destinationAirport: 'Destination Airport',
      requestTypes: {
        flight: 'Flight',
        visa: 'Visa (€)',
        package: 'Package',
        other: 'Other'
      }
    },
    // Placeholders
    placeholders: {
      lastName: 'Enter last name as shown on passport',
      firstName: 'Enter first name as shown on passport',
      middleName: 'Enter middle name(s) as shown on passport (optional)',
      dateOfBirth: 'DD-MM-YYYY',
      travelDate: 'DD-MM-YYYY',
      returnDate: 'DD-MM-YYYY',
      gender: 'Select...',
      nationality: 'Enter nationality/country',
      passportNumber: 'Enter passport number',
      departureAirport: 'Enter departure airport',
      destinationAirport: 'Enter destination airport'
    },
    // Gender options
    gender: {
      select: 'Select...',
      male: 'Male',
      female: 'Female',
      other: 'Other'
    },
    // Buttons
    buttons: {
      cancel: 'Cancel',
      createRequest: 'Create Request'
    },
    // Messages
    messages: {
      requestCreated: 'Request created successfully!',
      requestFailed: 'Failed to create request. Please try again.'
    }
  },
  de: {
    // Sidebar
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
      footer: '© 2026 LST Reisebüro'
    },
    // Theme
    theme: {
      dark: 'Dunkel',
      light: 'Hell'
    },
    // Passport upload
    passport: {
      uploadText: 'Pass zur Ansicht hochladen (PDF oder Bild) oder mit Strg+V einfügen',
      chooseFile: 'Datei auswählen',
      remove: 'Pass entfernen',
      zoomOut: 'Verkleinern (Strg + -)',
      zoomIn: 'Vergrößern (Strg + +)',
      resetZoom: 'Zoom zurücksetzen (Strg + 0)',
      rotateLeft: 'Nach links drehen (90°)',
      rotateRight: 'Nach rechts drehen (90°)',
      extractOCR: 'Mit OCR extrahieren',
      extracting: 'Wird extrahiert...',
      ocrSuccess: 'Daten erfolgreich extrahiert!',
      ocrError: 'Daten konnten nicht extrahiert werden. Bitte versuchen Sie es erneut.',
      retry: 'Wiederholen',
      left: 'übrig',
      ocrOptionsTitle: 'Upload-Methode wählen',
      ocrManualUpload: 'Manueller Upload',
      ocrPaste: 'Einfügen (Strg+V)',
      ocrPasteHint: 'Drücken Sie Strg+V zum Einfügen',
      pasteWaitingTitle: 'Hier zum Extrahieren einfügen',
      pasteWaitingText: 'Drücken Sie Strg+V, um Ihr Ausweisbild aus der Zwischenablage einzufügen',
      pasteWaitingSubtext: 'Warten auf Einfügen...'
    },
    // Form sections
    sections: {
      passengerInformation: 'REISENDENINFORMATIONEN',
      passportInformation: 'PASS- / DOKUMENTENINFORMATIONEN',
      travelInformation: 'REISEINFORMATIONEN',
      requestType: 'ANFRAGETYP * (MEHRFACH AUSWÄHLEN)'
    },
    // Form fields
    fields: {
      lastName: 'Nachname',
      firstName: 'Vorname',
      middleName: 'Zweiter Vorname(n)',
      dateOfBirth: 'Geburtsdatum',
      gender: 'Geschlecht',
      nationality: 'Staatsangehörigkeit (Dokumenten-Staatsangehörigkeit)',
      passportNumber: 'Passnummer',
      travelDate: 'Reisedatum',
      returnDate: 'Rückreisedatum',
      departureAirport: 'Abflughafen (Von)',
      destinationAirport: 'Zielflughafen',
      requestTypes: {
        flight: 'Flug',
        visa: 'Visum (€)',
        package: 'Paket',
        other: 'Sonstiges'
      }
    },
    // Placeholders
    placeholders: {
      lastName: 'Nachname wie im Pass angegeben eingeben',
      firstName: 'Vorname wie im Pass angegeben eingeben',
      middleName: 'Zweiter Vorname(n) wie im Pass angegeben eingeben (optional)',
      dateOfBirth: 'TT-MM-JJJJ',
      travelDate: 'TT-MM-JJJJ',
      returnDate: 'TT-MM-JJJJ',
      gender: 'Auswählen...',
      nationality: 'Staatsangehörigkeit/Land eingeben',
      passportNumber: 'Passnummer eingeben',
      departureAirport: 'Abflughafen eingeben',
      destinationAirport: 'Zielflughafen eingeben'
    },
    // Gender options
    gender: {
      select: 'Auswählen...',
      male: 'Männlich',
      female: 'Weiblich',
      other: 'Andere'
    },
    // Buttons
    buttons: {
      cancel: 'Abbrechen',
      createRequest: 'Anfrage erstellen'
    },
    // Messages
    messages: {
      requestCreated: 'Anfrage erfolgreich erstellt!',
      requestFailed: 'Anfrage konnte nicht erstellt werden. Bitte versuchen Sie es erneut.'
    }
  }
}

function CreateRequest() {
  const navigate = useNavigate()
  const { store } = useStore()
  
  // Language state - default to English
  const [language, setLanguage] = useState('en')
  const t = translations[language] // Translation function
  
  // Theme state - default to dark mode
  const [theme, setTheme] = useState('dark') // 'light' or 'dark'

  // Handle theme change and apply to HTML element
  const handleThemeChange = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  // Apply theme to HTML element
  useEffect(() => {
    document.documentElement.className = theme
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Load Flatpickr assets (JS + CSS) once (versioned) and expose a ready promise
  useEffect(() => {
    const ensureFlatpickrAssets = () => {
      // CSS (idempotent)
      if (!document.getElementById('flatpickr-style')) {
        const link = document.createElement('link')
        link.id = 'flatpickr-style'
        link.rel = 'stylesheet'
        link.href = 'https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.css'
        document.head.appendChild(link)
      }

      // JS (idempotent, with promise for readiness)
      if (!window.__flatpickrReadyPromise) {
        window.__flatpickrReadyPromise = new Promise((resolve, reject) => {
          // If already available, resolve immediately
          if (typeof window.flatpickr !== 'undefined') {
            resolve(window.flatpickr)
            return
          }

          let script = document.getElementById('flatpickr-script')
          if (!script) {
            script = document.createElement('script')
            script.id = 'flatpickr-script'
            script.src = 'https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.js'
            script.defer = true
            script.onload = () => resolve(window.flatpickr)
            script.onerror = (e) => reject(e)
            document.body.appendChild(script)
          } else {
            // If script tag exists but flatpickr not ready yet, hook into onload
            const onLoad = () => resolve(window.flatpickr)
            script.addEventListener('load', onLoad, { once: true })
            script.addEventListener('error', reject, { once: true })
          }
        })
      }
    }

    ensureFlatpickrAssets()
  }, [])

  // Passport file state - stored in browser memory only
  // File lifecycle: Upload → Create Object URL → Preview → Destroy ONLY after successful database insert
  // IMPORTANT: Files are NOT sent to Supabase Storage - they exist only in browser memory
  const [passportFile, setPassportFile] = useState(null)
  const [passportPreviewUrl, setPassportPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)
  const viewerRef = useRef(null)
  const imageRef = useRef(null)
  
  // OCR file state - independent from Choose File
  const [ocrFile, setOcrFile] = useState(null)
  const [ocrPreviewUrl, setOcrPreviewUrl] = useState(null)
  const ocrFileInputRef = useRef(null)
  const ocrViewerRef = useRef(null)
  const ocrImageRef = useRef(null)
  const [ocrImageZoom, setOcrImageZoom] = useState(1)
  const [ocrImageRotation, setOcrImageRotation] = useState(0)
  const [ocrImageNaturalSize, setOcrImageNaturalSize] = useState({ width: 0, height: 0 })
  const [ocrImageDisplaySize, setOcrImageDisplaySize] = useState({ width: 0, height: 0 })
  
  // Date input refs for Flatpickr
  const dateOfBirthRef = useRef(null)
  const travelDateRef = useRef(null)
  const returnDateRef = useRef(null)
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState(null)
  const [submitError, setSubmitError] = useState(false)
  
  // OCR state
  const [isExtractingOCR, setIsExtractingOCR] = useState(false)
  const [ocrRetryCount, setOcrRetryCount] = useState(0)
  const [ocrExtractedFields, setOcrExtractedFields] = useState([])
  const [ocrMode, setOcrMode] = useState(false) // Track if we're in OCR mode for Ctrl+V paste
  const [showOCROptions, setShowOCROptions] = useState(false) // Show OCR upload options modal
  const maxRetries = 3

  // Image zoom and rotation state (for zoom gestures and rotation)
  const [imageZoom, setImageZoom] = useState(1)
  const [imageRotation, setImageRotation] = useState(0) // Rotation in degrees (0, 90, 180, 270)
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 }) // Natural image dimensions
  const [imageDisplaySize, setImageDisplaySize] = useState({ width: 0, height: 0 }) // Displayed size at zoom 1 (used for both images and PDFs)
  
  // Trackpad pinch detection state (for preventing page zoom)
  const [isPinching, setIsPinching] = useState(false)
  const [pinchStartDistance, setPinchStartDistance] = useState(0)
  const [pinchStartZoom, setPinchStartZoom] = useState(1)
  

  // Form state - all fields editable at all times (manual-first workflow)
  const [formData, setFormData] = useState({
    // Passenger Information
    lastName: '',
    firstName: '',
    middleName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    
    // Document Information
    passportNumber: '',
    
    // Travel Information
    travelDate: '',
    returnDate: '',
    departureAirport: '',
    destinationAirport: '',
    bookingRef: '', // PNR/RFN field
    
    // Request Types (multi-select checkboxes)
    requestTypes: {
      flight: false,
      visa: false,
      package: false,
      other: false
    }
  })

  // Family workflow state
  const [requestMode, setRequestMode] = useState(null) // null, 'single', or 'family'
  const [familyMembers, setFamilyMembers] = useState([]) // Array of family member data
  const [currentFamilyIndex, setCurrentFamilyIndex] = useState(0) // Track which family member is being edited
  const [sharedTravelInfo, setSharedTravelInfo] = useState(null) // Store travel info from first person
  const [sharedBookingRef, setSharedBookingRef] = useState('') // Shared PNR/RFN

  // NOTE: Booking reference (PNR/RFN) is provided manually by the agency (Amadeus).
  // No auto-generation; use the user-entered value.

  // Convert PDF first page to image data URL
  // Browser PDF iframes cannot guarantee correct scrolling at high zoom
  // Rendering PDFs as images ensures identical behavior to image uploads
  const convertPdfToImage = async (file) => {
    try {
      console.log('Reading PDF file...')
      const arrayBuffer = await file.arrayBuffer()
      console.log('PDF file read, size:', arrayBuffer.byteLength)
      
      console.log('Loading PDF document...')
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      console.log('PDF loaded, pages:', pdf.numPages)
      
      console.log('Getting first page...')
      const page = await pdf.getPage(1) // First page only
      console.log('Page loaded')
      
      const viewport = page.getViewport({ scale: 2.0 }) // Higher scale for better quality
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width
      
      console.log('Rendering page to canvas...')
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise
      console.log('Page rendered')
      
      const dataUrl = canvas.toDataURL('image/png')
      console.log('Canvas converted to data URL')
      return dataUrl
    } catch (error) {
      console.error('Error converting PDF to image:', error)
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      throw error
    }
  }

  // Handle passport file processing (shared logic for upload and paste)
  // Stores file in browser memory only - NO backend upload
  const processPassportFile = useCallback(async (file) => {
    if (!file) {
      console.log('processPassportFile: No file provided')
      return
    }

    console.log('processPassportFile: Processing file', file.name)
    
    // Clear form data when new file is uploaded to avoid mixing data from different documents
    setFormData({
      lastName: '',
      firstName: '',
      middleName: '',
      dateOfBirth: '',
      gender: '',
      nationality: '',
      passportNumber: '',
      travelDate: '',
      returnDate: '',
      departureAirport: '',
      destinationAirport: '',
      requestTypes: {
        flight: false,
        visa: false,
        package: false,
        other: false
      }
    })
    
    // Store file in component state (browser memory) - accept any file type
    setPassportFile(file)

    // Reset zoom and rotation when new file is uploaded
    setImageZoom(1)
    setImageRotation(0)
    setImageNaturalSize({ width: 0, height: 0 })
    setImageDisplaySize({ width: 0, height: 0 })

    // For PDFs: Convert first page to image so it uses the same rendering logic as images
    // This ensures identical zoom/pan/scroll behavior (browser PDF iframes have scroll issues at high zoom)
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      try {
        console.log('Converting PDF to image...')
        const imageDataUrl = await convertPdfToImage(file)
        console.log('PDF converted successfully, data URL length:', imageDataUrl.length)
        setPassportPreviewUrl(imageDataUrl)
      } catch (error) {
        console.error('Failed to convert PDF to image:', error)
        alert(`Failed to load PDF: ${error.message}. Please check the browser console for details.`)
        // Fallback: clear preview on error
        setPassportPreviewUrl(null)
        setPassportFile(null)
      }
    } else {
      // For images: Create preview URL from file blob (unchanged - existing image logic)
      console.log('processPassportFile: Creating object URL for image')
      const objectUrl = URL.createObjectURL(file)
      console.log('processPassportFile: Object URL created:', objectUrl.substring(0, 50) + '...')
      setPassportPreviewUrl(objectUrl)
      console.log('processPassportFile: passportPreviewUrl set')
    }
  }, []) // State setters are stable

  // Handle passport file upload
  // Stores file in browser memory only - NO backend upload
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      console.log('No file selected')
      return
    }
    console.log('File selected:', file.name, file.type, file.size)
    try {
      await processPassportFile(file)
      console.log('File processed successfully')
      // Force a small delay to ensure state is updated
      setTimeout(() => {
        console.log('State check - passportFile:', !!passportFile, 'passportPreviewUrl:', !!passportPreviewUrl)
      }, 100)
    } catch (error) {
      console.error('Error processing file:', error)
      alert('Failed to process file: ' + error.message)
    }
  }

  // Handle OCR file upload - independent from Choose File
  const handleOCRFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      console.log('OCR: No file selected')
      return
    }
    console.log('OCR: File selected:', file.name, file.type, file.size)
    try {
      await processOCRFile(file)
      console.log('OCR: File processed successfully')
    } catch (error) {
      console.error('OCR: Error processing file:', error)
      alert('Failed to process file: ' + error.message)
    }
  }

  // Process OCR file - reuse the same display as Choose File
  const processOCRFile = useCallback(async (file) => {
    if (!file) {
      console.log('processOCRFile: No file provided')
      return
    }

    console.log('processOCRFile: Processing OCR file', file.name)
    
    // Clear form data when new OCR file is uploaded to avoid mixing data from different documents
    setFormData({
      lastName: '',
      firstName: '',
      middleName: '',
      dateOfBirth: '',
      gender: '',
      nationality: '',
      passportNumber: '',
      travelDate: '',
      returnDate: '',
      departureAirport: '',
      destinationAirport: '',
      requestTypes: {
        flight: false,
        visa: false,
        package: false,
        other: false
      }
    })
    
    // Store OCR file separately but display in same area
    setOcrFile(file)
    
    // Reuse the same preview area - set passport preview to show OCR file
    // This way both systems share the same display
    await processPassportFile(file)
  }, [processPassportFile])

  // Extract passport data using OpenAI OCR with retry functionality
  const handleExtractOCR = async (isRetry = false) => {
    // Use OCR file or passport file (both can use the same display)
    const fileToProcess = ocrFile || passportFile || ocrFileInputRef.current?.files?.[0] || fileInputRef.current?.files?.[0]
    
    console.log('OCR: File check - ocrFile:', !!ocrFile, 'passportFile:', !!passportFile, 'passportPreviewUrl:', !!passportPreviewUrl)
    
    if (!fileToProcess) {
      console.error('OCR: No file detected')
      setIsExtractingOCR(false)
      return
    }
    
    console.log('OCR: Starting extraction with file:', fileToProcess.name, fileToProcess.type)

    setIsExtractingOCR(true)
    setSubmitMessage(null)
    setSubmitError(false)

    try {
      // Get OpenAI API key from environment
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY
      console.log('API Key check:', apiKey ? 'Found (length: ' + apiKey.length + ', starts with: ' + apiKey.substring(0, 7) + '...)' : 'NOT FOUND')
      
      if (!apiKey || apiKey.trim() === '') {
        const errorMsg = 'OpenAI API key not found!\n\nPlease:\n1. Create a .env file in the project root\n2. Add: VITE_OPENAI_API_KEY=your_api_key_here\n3. Restart the dev server (npm run dev)'
        console.error(errorMsg)
        alert(errorMsg)
        setIsExtractingOCR(false)
        return
      }

      // Convert image to base64 - use fileToProcess instead of passportFile
      let base64Image = ''
      
      if (fileToProcess.type === 'application/pdf' || fileToProcess.name.toLowerCase().endsWith('.pdf')) {
        // For PDFs, use the preview URL if available, otherwise convert
        if (passportPreviewUrl && passportPreviewUrl.includes('base64,')) {
          base64Image = passportPreviewUrl.split(',')[1] // Remove data:image/png;base64, prefix
          console.log('OCR: Using PDF preview URL')
        } else {
          // Convert PDF to image first
          console.log('OCR: Converting PDF to image for OCR')
          const imageDataUrl = await convertPdfToImage(fileToProcess)
          base64Image = imageDataUrl.split(',')[1]
        }
      } else {
        // For images, convert file to base64
        console.log('OCR: Converting image to base64')
        const reader = new FileReader()
        base64Image = await new Promise((resolve, reject) => {
          reader.onloadend = () => {
            const result = reader.result
            if (typeof result === 'string') {
              resolve(result.split(',')[1]) // Remove data URL prefix
            } else {
              reject(new Error('Failed to read image'))
            }
          }
          reader.onerror = reject
          reader.readAsDataURL(fileToProcess)
        })
      }
      
      console.log('OCR: Base64 image length:', base64Image.length)

      // Enhanced prompt for better extraction
      const ocrPrompt = `Extract passport or ID document information from this image. This is attempt ${ocrRetryCount + 1} of ${maxRetries}.

Carefully analyze the document and extract the following fields:
- firstName: First name (given name) - extract exactly as shown
- lastName: Last name (surname/family name) - extract exactly as shown
- middleName: Middle name(s) if present, otherwise empty string ""
- dateOfBirth: Date of birth in DD-MM-YYYY format (e.g., "15-03-1990")
- gender: Gender code - "M" for Male, "F" for Female, "Other" for other/unspecified
- nationality: Nationality/country code (e.g., "DE" for Germany, "US" for United States, "GB" for United Kingdom, "FR" for France)
- passportNumber: Passport number or document number - extract exactly as shown

IMPORTANT:
- Return ONLY valid JSON, no markdown, no code blocks, no explanations
- Extract text exactly as it appears on the document
- If a field is not visible or unclear, use null for that field
- For dates, ensure DD-MM-YYYY format with leading zeros
- For gender, use only "M", "F", or "Other"
- For nationality, use standard 2-letter country codes

Return format:
{
  "firstName": "John",
  "lastName": "Smith",
  "middleName": "Michael",
  "dateOfBirth": "15-03-1990",
  "gender": "M",
  "nationality": "US",
  "passportNumber": "123456789"
}`

      // Call OpenAI Vision API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: ocrPrompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/png;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 800,
          temperature: 0.1
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('No content received from API')
      }

      // Parse JSON response
      let extractedData
      try {
        // Remove markdown code blocks if present
        let jsonString = content.trim()
        
        // Try to extract JSON from markdown code blocks
        const jsonMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/) || 
                         jsonString.match(/```\s*([\s\S]*?)\s*```/) ||
                         jsonString.match(/\{[\s\S]*\}/)
        
        if (jsonMatch) {
          jsonString = jsonMatch[1] || jsonMatch[0]
        }
        
        // Clean up the JSON string
        jsonString = jsonString.trim()
        if (jsonString.startsWith('```')) {
          jsonString = jsonString.replace(/```json?/g, '').replace(/```/g, '').trim()
        }
        
        extractedData = JSON.parse(jsonString)
      } catch (parseError) {
        console.error('Failed to parse OCR response:', content)
        throw new Error('Failed to parse extracted data. The document may be unclear. Please try again.')
      }

      // Validate extracted data
      if (!extractedData || typeof extractedData !== 'object') {
        throw new Error('Invalid data format received. Please try again.')
      }

      // Track which fields were successfully extracted
      const extractedFields = []
      const updates = {}

      if (extractedData.firstName) {
        updates.firstName = extractedData.firstName.trim()
        extractedFields.push('firstName')
      }
      if (extractedData.lastName) {
        updates.lastName = extractedData.lastName.trim()
        extractedFields.push('lastName')
      }
      if (extractedData.middleName) {
        updates.middleName = extractedData.middleName.trim()
        extractedFields.push('middleName')
      }
      if (extractedData.dateOfBirth) {
        // Validate date format DD-MM-YYYY
        const datePattern = /^\d{2}-\d{2}-\d{4}$/
        if (datePattern.test(extractedData.dateOfBirth)) {
          updates.dateOfBirth = extractedData.dateOfBirth
          extractedFields.push('dateOfBirth')
        }
      }
      if (extractedData.gender) {
        const genderUpper = extractedData.gender.toUpperCase()
        if (['M', 'F', 'OTHER'].includes(genderUpper)) {
          updates.gender = genderUpper === 'OTHER' ? 'Other' : genderUpper
          extractedFields.push('gender')
        }
      }
      if (extractedData.nationality) {
        updates.nationality = extractedData.nationality.trim().toUpperCase()
        extractedFields.push('nationality')
      }
      if (extractedData.passportNumber) {
        updates.passportNumber = extractedData.passportNumber.trim()
        extractedFields.push('passportNumber')
      }

      // Update form data with extracted information (only update non-empty fields)
      if (Object.keys(updates).length > 0) {
        setFormData(prev => ({
          ...prev,
          ...updates
        }))

        // Update Flatpickr if date of birth was extracted
        if (updates.dateOfBirth && dateOfBirthRef.current?._flatpickr) {
          // Convert DD-MM-YYYY to Date object for Flatpickr
          const [day, month, year] = updates.dateOfBirth.split('-')
          if (day && month && year) {
            const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
            if (!isNaN(dateObj.getTime())) {
              dateOfBirthRef.current._flatpickr.setDate(dateObj, false)
            }
          }
        }

        setOcrExtractedFields(extractedFields)
        
        // Check if critical fields were extracted
        const criticalFields = ['firstName', 'lastName', 'passportNumber']
        const extractedCriticalFields = criticalFields.filter(field => extractedFields.includes(field))
        
        if (extractedCriticalFields.length >= 2) {
          // Success - at least 2 critical fields extracted
          setSubmitMessage(`${t.passport.ocrSuccess} Extracted: ${extractedFields.length} fields. You can edit any field if needed.`)
          setSubmitError(false)
          setOcrRetryCount(0) // Reset retry count on success
        } else if (ocrRetryCount < maxRetries - 1) {
          // Partial success but can retry
          setSubmitMessage(`Partially extracted (${extractedFields.length} fields). Some fields may be unclear. You can retry or edit manually.`)
          setSubmitError(false)
        } else {
          // Last attempt - show what was extracted
          setSubmitMessage(`Extracted ${extractedFields.length} fields. Some fields may be unclear - please review and edit manually.`)
          setSubmitError(false)
        }
      } else {
        // No fields extracted
        if (ocrRetryCount < maxRetries - 1) {
          throw new Error(`No data could be extracted. Attempt ${ocrRetryCount + 1} of ${maxRetries}. Please ensure the document is clear and try again.`)
        } else {
          throw new Error('Unable to extract data from this document. Please enter the information manually.')
        }
      }

    } catch (error) {
      console.error('OCR extraction error:', error)
      
      if (ocrRetryCount < maxRetries - 1) {
        // Allow retry
        const remainingRetries = maxRetries - ocrRetryCount - 1
        setSubmitMessage(`${error.message} (${remainingRetries} retry${remainingRetries > 1 ? 'ies' : ''} remaining)`)
        setSubmitError(true)
      } else {
        // No more retries
        setSubmitMessage(error.message || t.passport.ocrError)
        setSubmitError(true)
        setOcrRetryCount(0) // Reset for next attempt
      }
    } finally {
      setIsExtractingOCR(false)
    }
  }

  // Handle OCR retry
  const handleOCRRetry = () => {
    if (ocrRetryCount < maxRetries - 1) {
      setOcrRetryCount(prev => prev + 1)
      handleExtractOCR(true)
    }
  }

  // Handle paste from clipboard (Ctrl+V)
  const handlePaste = useCallback(async (event) => {
    // Don't interfere if user is typing in a form field
    const isInputFocused = event.target.tagName === 'INPUT' || 
                          event.target.tagName === 'TEXTAREA' || 
                          event.target.tagName === 'SELECT' ||
                          event.target.isContentEditable
    
    if (isInputFocused) return // Let normal paste behavior work in form fields

    const clipboardData = event.clipboardData || window.clipboardData
    if (!clipboardData) return

    const items = clipboardData.items
    if (!items) return

    // Look for image or file in clipboard
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      // Check if it's an image
      if (item.type.indexOf('image') !== -1) {
        event.preventDefault() // Prevent default paste behavior
        
        const file = item.getAsFile()
        if (file) {
          // When pasting (Ctrl+V), automatically process for OCR extraction
          // This is useful when copying images from WhatsApp and pasting them
          console.log('Pasting image for OCR extraction (Ctrl+V)')
          await processOCRFile(file)
          
          // Disable OCR mode after paste
          setOcrMode(false)
          
          // Automatically trigger OCR extraction after a short delay to ensure preview is ready
          setTimeout(() => {
            setOcrRetryCount(0)
            handleExtractOCR(false)
          }, 500) // Small delay to ensure image preview is loaded
          return
        }
      }
      
      // Check if it's a file (PDF, etc.)
      if (item.kind === 'file') {
        event.preventDefault() // Prevent default paste behavior
        
        const file = item.getAsFile()
        if (file) {
          // When pasting (Ctrl+V), automatically process for OCR extraction
          console.log('Pasting file for OCR extraction (Ctrl+V)')
          await processOCRFile(file)
          
          // Disable OCR mode after paste
          setOcrMode(false)
          
          // Automatically trigger OCR extraction after a short delay to ensure preview is ready
          setTimeout(() => {
            setOcrRetryCount(0)
            handleExtractOCR(false)
          }, 500) // Small delay to ensure file preview is loaded
          return
        }
      }
    }
  }, [processOCRFile, handleExtractOCR])

  // Handle image load to capture natural and displayed dimensions
  const handleImageLoad = (e) => {
    const img = e.target
    if (img && viewerRef.current) {
      // Store natural image dimensions
      setImageNaturalSize({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
      
      // Calculate displayed size (fitting in container, maintaining aspect ratio)
      const container = viewerRef.current
      const containerRect = container.getBoundingClientRect()
      const containerWidth = containerRect.width
      const containerHeight = containerRect.height
      
      const naturalAspect = img.naturalWidth / img.naturalHeight
      const containerAspect = containerWidth / containerHeight
      
      let displayWidth, displayHeight
      if (naturalAspect > containerAspect) {
        // Image is wider - fit to width
        displayWidth = containerWidth
        displayHeight = containerWidth / naturalAspect
      } else {
        // Image is taller - fit to height
        displayHeight = containerHeight
        displayWidth = containerHeight * naturalAspect
      }
      
      setImageDisplaySize({
        width: displayWidth,
        height: displayHeight
      })
    }
  }


  // Handle wheel zoom (Ctrl+Wheel) - works for both images and PDFs
  const handleWheelZoom = (e) => {
    const isInsideViewer = viewerRef.current?.contains(e.target) || viewerRef.current === e.target
    if (!isInsideViewer) return
    
    // Zoom with Ctrl+Wheel
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1
      const newZoom = Math.max(0.5, Math.min(20, imageZoom + zoomDelta))
      setImageZoom(newZoom)
    }
    // Regular wheel = browser scrolling (native behavior)
  }

  // Zoom controls (buttons) - works for both images and PDFs
  const handleZoomIn = () => {
    const newZoom = Math.min(20, imageZoom + 0.1)
    setImageZoom(newZoom)
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(0.5, imageZoom - 0.1)
    setImageZoom(newZoom)
  }

  const handleResetZoom = () => {
    setImageZoom(1)
    // Only reset rotation for images
    if (passportFile?.type?.startsWith('image/')) {
      setImageRotation(0)
    }
  }

  // Rotation controls (90° steps, images only)
  const handleRotateLeft = () => {
    if (!passportFile?.type?.startsWith('image/')) return // Only images rotate
    setImageRotation((prev) => (prev - 90 + 360) % 360)
  }

  const handleRotateRight = () => {
    if (!passportFile?.type?.startsWith('image/')) return // Only images rotate
    setImageRotation((prev) => (prev + 90) % 360)
  }

  // Handle touch/pinch zoom - works for both images and PDFs
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Two-finger pinch start
      setIsPinching(true)
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      setPinchStartDistance(distance)
      setPinchStartZoom(imageZoom)
    }
    // Single finger touches - let browser handle scrolling naturally
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && isPinching) {
      // Two-finger pinch - calculate zoom
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      
      if (pinchStartDistance > 0) {
        const ratio = distance / pinchStartDistance
        const newZoom = Math.max(0.5, Math.min(20, pinchStartZoom * ratio))
        setImageZoom(newZoom)
      }
    }
    // Single finger touches - let browser handle scrolling naturally
  }

  const handleTouchEnd = (e) => {
    setIsPinching(false)
    setPinchStartDistance(0)
  }


  // Keyboard shortcuts for zoom (Ctrl + +, Ctrl + -, Ctrl + 0)
  // Only works when passport is uploaded and user is not typing in form fields
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle shortcuts when passport is uploaded and user is not typing in a form field
      if (!passportPreviewUrl) return
      
      const isInputFocused = e.target.tagName === 'INPUT' || 
                            e.target.tagName === 'TEXTAREA' || 
                            e.target.tagName === 'SELECT' ||
                            e.target.isContentEditable
      
      if (isInputFocused) return // Don't interfere with form typing
      
      // Zoom in: Ctrl + + or Ctrl + =
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault()
        const newZoom = Math.min(20, imageZoom + 0.1)
        setImageZoom(newZoom)
      }
      
      // Zoom out: Ctrl + -
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault()
        const newZoom = Math.max(0.5, imageZoom - 0.1)
        setImageZoom(newZoom)
      }
      
      // Reset zoom: Ctrl + 0
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        setImageZoom(1)
        // Only reset rotation for images
        if (passportFile?.type?.startsWith('image/')) {
          setImageRotation(0)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [passportPreviewUrl, passportFile])

  // Handle paste from clipboard (Ctrl+V) for document upload
  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [handlePaste])

  // Prevent page zoom - allow only container zoom (works for all file types)
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !passportPreviewUrl) return

    // Prevent page zoom on wheel events (Ctrl+Wheel, trackpad pinch)
    const handleWheelNative = (e) => {
      // Only prevent if Ctrl/Meta is pressed (zoom gesture)
      if (e.ctrlKey || e.metaKey) {
        // This is a zoom gesture - prevent page zoom, let React handler handle container zoom
        e.preventDefault()
        // Don't stop propagation - let React handler receive the event
      }
    }

    // Prevent page zoom on touch pinch gestures
    const handleTouchStartNative = (e) => {
      if (e.touches.length === 2) {
        // Two-finger pinch - prevent browser's default page zoom
        e.preventDefault()
        // Don't stop propagation - let React handler receive the event
      }
    }

    const handleTouchMoveNative = (e) => {
      if (e.touches.length === 2) {
        // Two-finger pinch - prevent browser's default page zoom
        e.preventDefault()
        // Don't stop propagation - let React handler receive the event
      }
    }

    // Attach native listeners directly to viewer container with capture phase
    // This intercepts events before they bubble up to document/body
    viewer.addEventListener('wheel', handleWheelNative, { passive: false, capture: true })
    viewer.addEventListener('touchstart', handleTouchStartNative, { passive: false, capture: true })
    viewer.addEventListener('touchmove', handleTouchMoveNative, { passive: false, capture: true })
    
    return () => {
      viewer.removeEventListener('wheel', handleWheelNative, { passive: false, capture: true })
      viewer.removeEventListener('touchstart', handleTouchStartNative, { passive: false, capture: true })
      viewer.removeEventListener('touchmove', handleTouchMoveNative, { passive: false, capture: true })
    }
  }, [passportFile, passportPreviewUrl])

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Initialize Flatpickr date pickers
  useEffect(() => {
    let cancelled = false

    const initializeDatePickers = () => {
      if (typeof window.flatpickr === 'undefined') {
        // If assets are still loading, try again shortly
        setTimeout(initializeDatePickers, 100)
        return
      }

      if (cancelled) return

      const locale = language === 'de' 
        ? (window.flatpickr?.l10ns?.de || {
            firstDayOfWeek: 1,
            weekdays: {
              shorthand: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
              longhand: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
            },
            months: {
              shorthand: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
              longhand: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
            }
          })
        : (window.flatpickr?.l10ns?.en || {
            firstDayOfWeek: 1,
            weekdays: {
              shorthand: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
              longhand: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            },
            months: {
              shorthand: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              longhand: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            }
          })

      const currentYear = new Date().getFullYear()
      const minYear = currentYear - 100
      const maxYear = currentYear + 20

      // Shared function to create year dropdown - accessible from all callbacks
      const createYearDropdown = (instance) => {
        if (!instance || !instance.calendarContainer) return null
        
        // Remove any existing custom dropdown first
        const existing = instance.calendarContainer.querySelector('.flatpickr-yearDropdown-custom')
        if (existing) {
          existing.remove()
        }

        // Create new year dropdown
        const yearSelect = document.createElement('select')
        yearSelect.className = 'flatpickr-yearDropdown-custom'
        yearSelect.setAttribute('aria-label', 'Year')
        yearSelect.setAttribute('id', `year-select-${instance.input.id}-${Date.now()}`)

        const currentYear = instance.currentYear
        const startYear = minYear
        const endYear = maxYear

        // Populate years
        for (let y = startYear; y <= endYear; y++) {
          const option = document.createElement('option')
          option.value = y
          option.textContent = y
          if (y === currentYear) {
            option.selected = true
          }
          yearSelect.appendChild(option)
        }

        // Sync with Flatpickr when year changes
        yearSelect.addEventListener('change', (e) => {
          const newYear = parseInt(e.target.value, 10)
          if (!isNaN(newYear)) {
            instance.changeYear(newYear)
          }
        })

        // Find insertion point - MUST be in .flatpickr-current-month
        const currentMonth = instance.calendarContainer.querySelector('.flatpickr-current-month')
        if (currentMonth) {
          // Try to insert after month dropdown
          const monthSelect = currentMonth.querySelector('.flatpickr-monthDropdown-months')
          if (monthSelect) {
            monthSelect.insertAdjacentElement('afterend', yearSelect)
          } else {
            // Insert at the beginning of current-month
            currentMonth.insertBefore(yearSelect, currentMonth.firstChild)
          }
        }

        // Apply ALL styles immediately
        Object.assign(yearSelect.style, {
          display: 'inline-block',
          visibility: 'visible',
          opacity: '1',
          pointerEvents: 'auto',
          minWidth: '80px',
          width: 'auto',
          fontSize: '0.9375rem',
          fontWeight: '600',
          padding: '0.25rem 1.5rem 0.25rem 0.5rem',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          marginLeft: '0.5rem',
          verticalAlign: 'middle',
          position: 'relative',
          zIndex: '9999',
          height: '34px',
          lineHeight: '34px'
        })

        // Sync when Flatpickr changes year
        const updateYear = () => {
          if (yearSelect && yearSelect.value !== String(instance.currentYear)) {
            yearSelect.value = instance.currentYear
          }
        }

        // Hook into year changes
        if (!yearSelect._synced) {
          const originalChangeYear = instance.changeYear
          instance.changeYear = function(year) {
            const result = originalChangeYear.call(this, year)
            setTimeout(updateYear, 0)
            return result
          }
          yearSelect._synced = true
        }

        console.log('✅ Year dropdown created:', {
          element: yearSelect,
          parent: yearSelect.parentElement,
          isInDOM: document.body.contains(yearSelect) || instance.calendarContainer.contains(yearSelect),
          display: window.getComputedStyle(yearSelect).display
        })

        return yearSelect
      }

      const dateConfig = {
        locale: locale,
        dateFormat: 'd-m-Y',
        altInput: false,
        allowInput: true,
        clickOpens: true,
        enableTime: false,
        animate: true,
        closeOnSelect: true,
        monthSelectorType: 'dropdown',
        yearSelectorType: 'dropdown',
        // REMOVED yearSelectorType: 'dropdown' - we'll use custom select instead
        minDate: new Date(minYear, 0, 1),
        maxDate: new Date(maxYear, 11, 31),
        static: false,
        onOpen: (selectedDates, dateStr, instance) => {
          // Force calendar to open below the input (remove arrowTop class if present)
          if (instance.calendarContainer) {
            instance.calendarContainer.classList.remove('arrowTop')
            instance.calendarContainer.classList.add('arrowBottom')
            
            // Ensure custom year dropdown exists and is visible when calendar opens
            setTimeout(() => {
              let yearSelect = instance.calendarContainer?.querySelector('.flatpickr-yearDropdown-custom')
              
              if (!yearSelect) {
                // Create it using the shared function
                yearSelect = createYearDropdown(instance)
              } else {
                // Ensure it's visible
                Object.assign(yearSelect.style, {
                  display: 'inline-block',
                  visibility: 'visible',
                  opacity: '1',
                  pointerEvents: 'auto'
                })
              }
            }, 100)
            
            // Ensure calendar has enough space below for year dropdown to open downward
            // Scroll the calendar container into view if needed
            setTimeout(() => {
              const rect = instance.calendarContainer.getBoundingClientRect()
              const viewportHeight = window.innerHeight
              const spaceBelow = viewportHeight - rect.bottom
              
              // If there's less than 300px below, scroll the calendar into view
              if (spaceBelow < 300 && rect.bottom < viewportHeight - 50) {
                instance.calendarContainer.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'nearest',
                  inline: 'nearest'
                })
              }
            }, 50)
          }
        },
        onReady: (selectedDates, dateStr, instance) => {
          // Force calendar to open below the input (remove arrowTop class if present)
          if (instance.calendarContainer) {
            instance.calendarContainer.classList.remove('arrowTop')
            instance.calendarContainer.classList.add('arrowBottom')
          }

          // Create year dropdown IMMEDIATELY - don't wait
          const createYearDropdown = () => {
            // Remove any existing custom dropdown first
            const existing = instance.calendarContainer?.querySelector('.flatpickr-yearDropdown-custom')
            if (existing) {
              existing.remove()
            }

            // Create new year dropdown
            const yearSelect = document.createElement('select')
            yearSelect.className = 'flatpickr-yearDropdown-custom'
            yearSelect.setAttribute('aria-label', 'Year')
            yearSelect.setAttribute('id', `year-select-${Date.now()}`)

            const currentYear = instance.currentYear
            const startYear = minYear
            const endYear = maxYear

            // Populate years
            for (let y = startYear; y <= endYear; y++) {
              const option = document.createElement('option')
              option.value = y
              option.textContent = y
              if (y === currentYear) {
                option.selected = true
              }
              yearSelect.appendChild(option)
            }

            // Sync with Flatpickr when year changes
            yearSelect.addEventListener('change', (e) => {
              const newYear = parseInt(e.target.value, 10)
              if (!isNaN(newYear)) {
                instance.changeYear(newYear)
              }
            })

            // Find insertion point - MUST be in .flatpickr-current-month
            const currentMonth = instance.calendarContainer?.querySelector('.flatpickr-current-month')
            if (currentMonth) {
              // Try to insert after month dropdown
              const monthSelect = currentMonth.querySelector('.flatpickr-monthDropdown-months')
              if (monthSelect) {
                monthSelect.insertAdjacentElement('afterend', yearSelect)
              } else {
                // Insert at the beginning of current-month
                currentMonth.insertBefore(yearSelect, currentMonth.firstChild)
              }
            }

            // Apply ALL styles immediately
            Object.assign(yearSelect.style, {
              display: 'inline-block',
              visibility: 'visible',
              opacity: '1',
              pointerEvents: 'auto',
              minWidth: '80px',
              width: 'auto',
              fontSize: '0.9375rem',
              fontWeight: '600',
              padding: '0.25rem 1.5rem 0.25rem 0.5rem',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              marginLeft: '0.5rem',
              verticalAlign: 'middle',
              position: 'relative',
              zIndex: '9999',
              height: '34px',
              lineHeight: '34px'
            })

            // Sync when Flatpickr changes year
            const updateYear = () => {
              if (yearSelect && yearSelect.value !== String(instance.currentYear)) {
                yearSelect.value = instance.currentYear
              }
            }

            // Hook into year changes
            if (!yearSelect._synced) {
              const originalChangeYear = instance.changeYear
              instance.changeYear = function(year) {
                const result = originalChangeYear.call(this, year)
                setTimeout(updateYear, 0)
                return result
              }
              yearSelect._synced = true
            }

            return yearSelect
          }

          // Create immediately
          const createdDropdown = createYearDropdown()
          console.log('Year dropdown created in onReady:', {
            element: createdDropdown,
            parent: createdDropdown?.parentElement,
            isInDOM: createdDropdown ? document.body.contains(createdDropdown) || instance.calendarContainer?.contains(createdDropdown) : false
          })

          // Use setTimeout to ensure DOM is fully ready
          setTimeout(() => {
            // Ensure month dropdown is visible, functional, and properly styled
            const monthInput = instance.calendarContainer?.querySelector('.flatpickr-monthDropdown-months')
            if (monthInput) {
              monthInput.style.display = ''
              monthInput.style.visibility = 'visible'
              monthInput.style.opacity = '1'
              monthInput.style.pointerEvents = 'auto'
              if (monthInput.disabled !== undefined) {
                monthInput.disabled = false
              }
              monthInput.removeAttribute('disabled')
            }

            // Hide ALL Flatpickr year selectors FIRST (they're unreliable) - comprehensive hiding
            const hideAllFlatpickrYearSelectors = () => {
              // Hide Flatpickr's year dropdown select
              const flatpickrYearSelect = instance.calendarContainer?.querySelector('.flatpickr-monthDropdown-years')
              if (flatpickrYearSelect) {
                flatpickrYearSelect.style.display = 'none'
                flatpickrYearSelect.style.visibility = 'hidden'
                flatpickrYearSelect.style.opacity = '0'
                flatpickrYearSelect.style.position = 'absolute'
                flatpickrYearSelect.style.left = '-9999px'
              }
              
              // Hide Flatpickr's year input (currentYearElement)
              const yearInput = instance.currentYearElement
              if (yearInput) {
                yearInput.style.display = 'none'
                yearInput.style.visibility = 'hidden'
                yearInput.style.opacity = '0'
                yearInput.style.position = 'absolute'
                yearInput.style.left = '-9999px'
              }
              
              // Hide any year input wrappers (numInputWrapper)
              const yearInputWrappers = instance.calendarContainer?.querySelectorAll('.numInputWrapper')
              yearInputWrappers?.forEach(wrapper => {
                const numInput = wrapper.querySelector('input[type="number"]')
                if (numInput) {
                  // Check if it's a year input (has year-like value or is in year position)
                  const value = parseInt(numInput.value)
                  const isYearInput = (value > 1900 && value < 2100) || 
                                     numInput.classList.contains('cur-year') ||
                                     numInput.getAttribute('aria-label')?.toLowerCase().includes('year')
                  
                  if (isYearInput) {
                    wrapper.style.display = 'none'
                    wrapper.style.visibility = 'hidden'
                    wrapper.style.opacity = '0'
                    wrapper.style.position = 'absolute'
                    wrapper.style.left = '-9999px'
                    numInput.style.display = 'none'
                  }
                }
              })
              
              // Hide any other year-related inputs in the calendar header
              const currentMonth = instance.calendarContainer?.querySelector('.flatpickr-current-month')
              if (currentMonth) {
                const allInputs = currentMonth.querySelectorAll('input')
                allInputs.forEach(input => {
                  if (input.type === 'number') {
                    const value = parseInt(input.value)
                    if (value > 1900 && value < 2100) {
                      input.style.display = 'none'
                      input.style.visibility = 'hidden'
                      input.style.opacity = '0'
                      input.style.position = 'absolute'
                      input.style.left = '-9999px'
                    }
                  }
                })
              }
            }
            
            // Hide Flatpickr year selectors
            hideAllFlatpickrYearSelectors()
            
            // Also hide after a short delay to catch any late-rendered elements
            setTimeout(hideAllFlatpickrYearSelectors, 10)
            setTimeout(hideAllFlatpickrYearSelectors, 100)

            // Create custom year dropdown if it doesn't exist
            if (!yearSelect) {
              yearSelect = document.createElement('select')
              yearSelect.className = 'flatpickr-yearDropdown-custom'
              yearSelect.setAttribute('aria-label', 'Year')

              const currentYear = instance.currentYear
              const startYear = minYear
              const endYear = maxYear

              // Populate years
              for (let y = startYear; y <= endYear; y++) {
                const option = document.createElement('option')
                option.value = y
                option.textContent = y
                if (y === currentYear) {
                  option.selected = true
                }
                yearSelect.appendChild(option)
              }

              // Sync with Flatpickr when year changes from dropdown
              yearSelect.addEventListener('change', (e) => {
                const newYear = parseInt(e.target.value, 10)
                instance.changeYear(newYear)
              })

              // Insert the select in the calendar header - try multiple insertion strategies
              const currentMonth = instance.calendarContainer?.querySelector('.flatpickr-current-month')
              const monthSelect = instance.calendarContainer?.querySelector('.flatpickr-monthDropdown-months')
              
              if (currentMonth) {
                // Strategy 1: Insert after month dropdown if it exists
                if (monthSelect && monthSelect.parentNode) {
                  // Insert right after the month select
                  monthSelect.parentNode.insertBefore(yearSelect, monthSelect.nextSibling)
                } else if (monthSelect) {
                  // Insert after month select element
                  monthSelect.after(yearSelect)
                } else {
                  // Strategy 2: Find the month text and insert after it
                  const monthText = currentMonth.querySelector('.flatpickr-month')
                  if (monthText) {
                    monthText.after(yearSelect)
                  } else {
                    // Strategy 3: Insert at the end of current-month container
                    currentMonth.appendChild(yearSelect)
                  }
                }
              } else {
                // Fallback: Insert in calendar container
                const calendarHeader = instance.calendarContainer?.querySelector('.flatpickr-months')
                if (calendarHeader) {
                  calendarHeader.appendChild(yearSelect)
                }
              }
            }

            // Always ensure the custom year dropdown is visible and styled
            if (yearSelect) {
              // Force visibility with inline styles
              yearSelect.style.display = 'inline-block'
              yearSelect.style.visibility = 'visible'
              yearSelect.style.opacity = '1'
              yearSelect.style.pointerEvents = 'auto'
              yearSelect.style.minWidth = '80px'
              yearSelect.style.width = 'auto'
              yearSelect.style.fontSize = '0.9375rem'
              yearSelect.style.fontWeight = '600'
              yearSelect.style.padding = '0.25rem 1.5rem 0.25rem 0.5rem'
              yearSelect.style.border = '1px solid var(--border-color)'
              yearSelect.style.borderRadius = '6px'
              yearSelect.style.backgroundColor = 'var(--bg-primary)'
              yearSelect.style.color = 'var(--text-primary)'
              yearSelect.style.cursor = 'pointer'
              yearSelect.style.marginLeft = '0.5rem'
              yearSelect.style.verticalAlign = 'middle'
              yearSelect.style.position = 'relative'
              yearSelect.style.zIndex = '10'
              
              // Ensure it's not hidden by any parent
              if (yearSelect.parentElement) {
                yearSelect.parentElement.style.overflow = 'visible'
              }
              
              // Update selected year if it changed
              if (yearSelect.value !== String(instance.currentYear)) {
                yearSelect.value = instance.currentYear
              }
              
              // Verify it's actually in the DOM and visible
              const isInDOM = document.body.contains(yearSelect) || instance.calendarContainer?.contains(yearSelect)
              if (!isInDOM) {
                console.warn('Year dropdown not in DOM, attempting to re-insert')
                const currentMonth = instance.calendarContainer?.querySelector('.flatpickr-current-month')
                if (currentMonth) {
                  currentMonth.appendChild(yearSelect)
                }
              }

              // Sync year select when Flatpickr changes year internally
              const updateYearSelect = () => {
                if (yearSelect && yearSelect.value !== String(instance.currentYear)) {
                  yearSelect.value = instance.currentYear
                }
              }

              // Hook into Flatpickr's year change events
              if (!yearSelect._yearSyncAttached) {
                const originalChangeYear = instance.changeYear
                instance.changeYear = function(year) {
                  const result = originalChangeYear.call(this, year)
                  setTimeout(updateYearSelect, 0)
                  return result
                }

                // Update on month navigation
                instance.calendarContainer?.addEventListener('click', (e) => {
                  if (e.target.classList.contains('flatpickr-prev-month') || 
                      e.target.classList.contains('flatpickr-next-month') ||
                      e.target.closest('.flatpickr-prev-month') ||
                      e.target.closest('.flatpickr-next-month')) {
                    setTimeout(updateYearSelect, 50)
                  }
                })
                
                yearSelect._yearSyncAttached = true
              }
            }
          }, 100)
          
          // Final check after longer delay - ensure year dropdown exists and is visible
          setTimeout(() => {
            let yearSelect = instance.calendarContainer?.querySelector('.flatpickr-yearDropdown-custom')
            
            if (!yearSelect) {
              // Create it if still missing
              const currentMonth = instance.calendarContainer?.querySelector('.flatpickr-current-month')
              if (currentMonth) {
                yearSelect = document.createElement('select')
                yearSelect.className = 'flatpickr-yearDropdown-custom'
                yearSelect.setAttribute('aria-label', 'Year')
                
                const currentYear = instance.currentYear
                const startYear = minYear
                const endYear = maxYear
                
                for (let y = startYear; y <= endYear; y++) {
                  const option = document.createElement('option')
                  option.value = y
                  option.textContent = y
                  if (y === currentYear) {
                    option.selected = true
                  }
                  yearSelect.appendChild(option)
                }
                
                yearSelect.addEventListener('change', (e) => {
                  const newYear = parseInt(e.target.value, 10)
                  instance.changeYear(newYear)
                })
                
                const monthSelect = currentMonth.querySelector('.flatpickr-monthDropdown-months')
                if (monthSelect) {
                  monthSelect.after(yearSelect)
                } else {
                  currentMonth.appendChild(yearSelect)
                }
              }
            }
            
            // Ensure it's visible
            if (yearSelect) {
              yearSelect.style.display = 'inline-block'
              yearSelect.style.visibility = 'visible'
              yearSelect.style.opacity = '1'
              yearSelect.style.pointerEvents = 'auto'
              yearSelect.style.minWidth = '80px'
              yearSelect.style.width = 'auto'
              yearSelect.style.fontSize = '0.9375rem'
              yearSelect.style.fontWeight = '600'
              yearSelect.style.padding = '0.25rem 1.5rem 0.25rem 0.5rem'
              yearSelect.style.border = '1px solid var(--border-color)'
              yearSelect.style.borderRadius = '6px'
              yearSelect.style.backgroundColor = 'var(--bg-primary)'
              yearSelect.style.color = 'var(--text-primary)'
              yearSelect.style.cursor = 'pointer'
              yearSelect.style.marginLeft = '0.5rem'
              yearSelect.style.verticalAlign = 'middle'
              yearSelect.style.position = 'relative'
              yearSelect.style.zIndex = '10'
            }
          }, 200)
        },
        onChange: (selectedDates, dateStr, instance) => {
          const value = dateStr || instance?.input?.value || ''
          if (!value) return
          const fieldName = instance?.input?.id
          if (fieldName === 'dateOfBirth') {
            setFormData(prev => ({ ...prev, dateOfBirth: value }))
          } else if (fieldName === 'travelDate') {
            setFormData(prev => ({ ...prev, travelDate: value }))
          } else if (fieldName === 'returnDate') {
            setFormData(prev => ({ ...prev, returnDate: value }))
          }
        },
        onClose: (selectedDates, dateStr, instance) => {
          const value = dateStr || instance?.input?.value || ''
          if (!value) return
          const fieldName = instance?.input?.id
          if (fieldName === 'dateOfBirth') {
            setFormData(prev => ({ ...prev, dateOfBirth: value }))
          } else if (fieldName === 'travelDate') {
            setFormData(prev => ({ ...prev, travelDate: value }))
          } else if (fieldName === 'returnDate') {
            setFormData(prev => ({ ...prev, returnDate: value }))
          }
        },
        onValueUpdate: (selectedDates, dateStr, instance) => {
          const value = dateStr || instance?.input?.value || ''
          if (!value) return
          const fieldName = instance?.input?.id
          if (fieldName === 'dateOfBirth') {
            setFormData(prev => ({ ...prev, dateOfBirth: value }))
          } else if (fieldName === 'travelDate') {
            setFormData(prev => ({ ...prev, travelDate: value }))
          } else if (fieldName === 'returnDate') {
            setFormData(prev => ({ ...prev, returnDate: value }))
          }
        }
      }

      if (dateOfBirthRef.current && !dateOfBirthRef.current._flatpickr) {
        window.flatpickr(dateOfBirthRef.current, dateConfig)
      }

      if (travelDateRef.current && !travelDateRef.current._flatpickr) {
        const fp = window.flatpickr(travelDateRef.current, dateConfig)
        if (formData.travelDate) {
          fp.setDate(formData.travelDate, true)
        }
      }

      if (returnDateRef.current && !returnDateRef.current._flatpickr) {
        const fp = window.flatpickr(returnDateRef.current, dateConfig)
        if (formData.returnDate) {
          fp.setDate(formData.returnDate, true)
        }
      }
    }

    const start = async () => {
      try {
        if (window.__flatpickrReadyPromise) {
          await window.__flatpickrReadyPromise
        }
      } catch (e) {
        console.error('Flatpickr failed to load', e)
      }
      if (!cancelled) {
        initializeDatePickers()
      }
    }

    start()

    return () => {
      cancelled = true
      if (dateOfBirthRef.current?._flatpickr) {
        dateOfBirthRef.current._flatpickr.destroy()
        delete dateOfBirthRef.current._flatpickr
      }
      if (travelDateRef.current?._flatpickr) {
        travelDateRef.current._flatpickr.destroy()
        delete travelDateRef.current._flatpickr
      }
      if (returnDateRef.current?._flatpickr) {
        returnDateRef.current._flatpickr.destroy()
        delete returnDateRef.current._flatpickr
      }
    }
  }, [language])

  // Keep flatpickr in sync if formData changes programmatically
  useEffect(() => {
    if (travelDateRef.current?._flatpickr) {
      travelDateRef.current._flatpickr.setDate(formData.travelDate || null, false)
    }
    if (returnDateRef.current?._flatpickr) {
      returnDateRef.current._flatpickr.setDate(formData.returnDate || null, false)
    }
    if (dateOfBirthRef.current?._flatpickr) {
      dateOfBirthRef.current._flatpickr.setDate(formData.dateOfBirth || null, false)
    }
  }, [formData.travelDate, formData.returnDate, formData.dateOfBirth])

  // Handle date input with auto-formatting (DD-MM-YYYY)
  const handleDateInputChange = (fieldName, e) => {
    const value = e.target.value
    const cursorPosition = e.target.selectionStart || 0
    const oldValue = formData[fieldName] || ''
    
    // Remove all non-numeric characters
    const digits = value.replace(/\D/g, '')
    
    // Limit to 8 digits (DDMMYYYY)
    const limitedDigits = digits.slice(0, 8)
    
    // Build formatted string with auto-inserted hyphens
    let formatted = ''
    for (let i = 0; i < limitedDigits.length; i++) {
      formatted += limitedDigits[i]
      // Add hyphen after 2nd digit (DD-)
      if (i === 1 && limitedDigits.length >= 2) {
        formatted += '-'
      }
      // Add hyphen after 4th digit (DD-MM-)
      if (i === 3 && limitedDigits.length >= 4) {
        formatted += '-'
      }
    }
    
    // Calculate new cursor position
    const oldDigits = oldValue.replace(/\D/g, '').length
    const newDigits = limitedDigits.length
    let newCursorPosition = cursorPosition
    
    // If digits increased, adjust cursor position
    if (newDigits > oldDigits) {
      if (newDigits === 2 && oldDigits === 1) {
        // Just completed DD - move past hyphen
        newCursorPosition = 3
      } else if (newDigits === 4 && oldDigits === 3) {
        // Just completed MM - move past hyphen
        newCursorPosition = 6
      } else {
        // Count digits before cursor to determine new position
        const digitsBeforeCursor = value.substring(0, cursorPosition).replace(/\D/g, '').length
        if (digitsBeforeCursor <= 2) {
          newCursorPosition = digitsBeforeCursor
        } else if (digitsBeforeCursor <= 4) {
          newCursorPosition = digitsBeforeCursor + 1 // +1 for first hyphen
        } else {
          newCursorPosition = digitsBeforeCursor + 2 // +2 for both hyphens
        }
      }
    } else {
      // Digits decreased or stayed same - maintain relative position
      const digitsBeforeCursor = value.substring(0, cursorPosition).replace(/\D/g, '').length
      if (digitsBeforeCursor <= 2) {
        newCursorPosition = digitsBeforeCursor
      } else if (digitsBeforeCursor <= 4) {
        newCursorPosition = digitsBeforeCursor + 1
      } else {
        newCursorPosition = digitsBeforeCursor + 2
      }
    }
    
    // Update form state
    setFormData(prev => ({
      ...prev,
      [fieldName]: formatted
    }))
    
    // Set cursor position after state update
    setTimeout(() => {
      if (e.target && document.activeElement === e.target) {
        const clampedPos = Math.min(Math.max(0, newCursorPosition), formatted.length)
        e.target.setSelectionRange(clampedPos, clampedPos)
      }
    }, 0)
  }

  // Handle checkbox changes (request types)
  const handleCheckboxChange = (type, checked) => {
    setFormData(prev => ({
      ...prev,
      requestTypes: {
        ...prev.requestTypes,
        [type]: checked
      }
    }))
  }


  // Convert date from DD-MM-YYYY to YYYY-MM-DD format for PostgreSQL
  const convertDateToISO = (dateStr) => {
    if (!dateStr) return null
    const value = typeof dateStr === 'string' ? dateStr.trim() : dateStr

    // Accept Date objects
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value.toISOString().slice(0, 10)
    }

    if (typeof value !== 'string' || value === '') return null
    
    // DD-MM-YYYY
    const ddmmyyyyPattern = /^(\d{2})-(\d{2})-(\d{4})$/
    const match = value.match(ddmmyyyyPattern)
    
    if (match) {
      const [, day, month, year] = match
      const dayNum = parseInt(day, 10)
      const monthNum = parseInt(month, 10)
      const yearNum = parseInt(year, 10)
      if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 1900 || yearNum > 2100) {
        return value // keep original so it's not lost
      }
      return `${year}-${month}-${day}`
    }
    
    // YYYY-MM-DD
    const yyyymmddPattern = /^\d{4}-\d{2}-\d{2}$/
    if (value.match(yyyymmddPattern)) {
      return value
    }
    
    // Fallback: keep original string (better than null so it persists)
    return value
  }

  // Family member management functions
  const handleSaveFamilyMember = () => {
    // Validate personal info (firstName, lastName required)
    if (!formData.firstName || !formData.lastName) {
      setSubmitMessage(language === 'de' ? 'Vorname und Nachname sind erforderlich' : 'First name and last name are required')
      setSubmitError(true)
      setTimeout(() => setSubmitMessage(null), 3000)
      return
    }

    // If this is the first person, save travel info
    if (currentFamilyIndex === 0) {
      setSharedTravelInfo({
        travelDate: formData.travelDate,
        returnDate: formData.returnDate,
        departureAirport: formData.departureAirport,
        destinationAirport: formData.destinationAirport
      })
      setSharedBookingRef(formData.bookingRef || sharedBookingRef || '')
    }

    // Add current person to family members array
    const newMember = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      middleName: formData.middleName,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      nationality: formData.nationality,
      passportNumber: formData.passportNumber
    }

    setFamilyMembers(prev => [...prev, newMember])
    
    // Clear only personal info fields (keep travel info for display)
    setFormData(prev => ({
      ...prev,
      lastName: '',
      firstName: '',
      middleName: '',
      dateOfBirth: '',
      gender: '',
      nationality: '',
      passportNumber: ''
    }))

    // Increment index for next person
    setCurrentFamilyIndex(prev => prev + 1)

    // Clear passport preview for next person
    if (passportPreviewUrl && passportPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(passportPreviewUrl)
    }
    setPassportPreviewUrl(null)
    setPassportFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    // Show success message
    setSubmitMessage(language === 'de' ? 'Familienmitglied hinzugefügt' : 'Family member added')
    setSubmitError(false)
    setTimeout(() => setSubmitMessage(null), 2000)
  }

  const handleRemoveFamilyMember = (index) => {
    setFamilyMembers(prev => prev.filter((_, i) => i !== index))
    // If removing the first member, reset travel info
    if (index === 0 && familyMembers.length > 0) {
      setSharedTravelInfo(null)
      setSharedBookingRef('')
      setCurrentFamilyIndex(0)
      // Re-enable travel fields
      setFormData(prev => ({
        ...prev,
        travelDate: '',
        returnDate: '',
        departureAirport: '',
        destinationAirport: '',
        bookingRef: ''
      }))
    }
  }

  // Handle "Create Request" button click
  // Inserts text data into Supabase requests table
  // IMPORTANT: Files are NOT uploaded to Supabase - only text fields are saved
  // Passport preview is destroyed ONLY after successful database insert
  const handleCreateRequest = async () => {
    // Clear any previous messages
    setSubmitMessage(null)
    setSubmitError(false)
    setIsSubmitting(true)

    try {
      // Prepare request types array from checkbox state
      // Convert to JSONB array format for database
      const selectedRequestTypes = Object.entries(formData.requestTypes)
        .filter(([_, checked]) => checked)
        .map(([type, _]) => type)

      // Handle family mode vs single mode
      if (requestMode === 'family') {
        // Validate that at least one family member exists
        let membersToInsert = [...familyMembers]
        
        // If no members saved yet, include current form as first member
        if (membersToInsert.length === 0) {
          if (!formData.firstName || !formData.lastName) {
            throw new Error(language === 'de' ? 'Mindestens ein Familienmitglied ist erforderlich' : 'At least one family member is required')
          }
          // Add current person to the array
          membersToInsert.push({
            firstName: formData.firstName,
            lastName: formData.lastName,
            middleName: formData.middleName,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            nationality: formData.nationality,
            passportNumber: formData.passportNumber
          })
          // Use current form's travel info if sharedTravelInfo is not set
          const travelInfo = sharedTravelInfo || {
            travelDate: formData.travelDate,
            returnDate: formData.returnDate,
            departureAirport: formData.departureAirport,
            destinationAirport: formData.destinationAirport
          }
          const bookingRef = sharedBookingRef || formData.bookingRef || null
          
          // Prepare array of database records for all family members
          const familyDataArray = membersToInsert.map(member => ({
            first_name: member.firstName || null,
            middle_name: member.middleName || null,
            last_name: member.lastName || null,
            date_of_birth: convertDateToISO(member.dateOfBirth),
            gender: member.gender || null,
            nationality: member.nationality || null,
            passport_number: member.passportNumber || null,
            departure_airport: travelInfo.departureAirport || null,
            destination_airport: travelInfo.destinationAirport || null,
            travel_date: convertDateToISO(travelInfo.travelDate),
            return_date: convertDateToISO(travelInfo.returnDate),
            request_types: selectedRequestTypes,
            status: 'draft',
            is_demo: false,
            ocr_source: null,
            ocr_confidence: null
          }))

          // Insert all family members into mock store
          const result = store.requests.createMultiple(familyDataArray)
          
          if (result.error) {
            throw result.error
          }

          const data = result.data

          // Update main_table with booking_ref if provided
          if (bookingRef && data && data.length > 0) {
            data.forEach(item => {
              if (bookingRef) {
                store.mainTable.update(item.id, { booking_ref: bookingRef })
              }
            })
          }
        } else {
          // Family members already saved - use shared travel info
          if (!sharedTravelInfo) {
            throw new Error(language === 'de' ? 'Reiseinformationen fehlen' : 'Travel information is missing')
          }
          
          // If current form has a person filled in, include them too
          if (formData.firstName && formData.lastName) {
            membersToInsert.push({
              firstName: formData.firstName,
              lastName: formData.lastName,
              middleName: formData.middleName,
              dateOfBirth: formData.dateOfBirth,
              gender: formData.gender,
              nationality: formData.nationality,
              passportNumber: formData.passportNumber
            })
          }
          
          // Prepare array of database records for all family members
          const familyDataArray = membersToInsert.map(member => ({
          first_name: member.firstName || null,
          middle_name: member.middleName || null,
          last_name: member.lastName || null,
          date_of_birth: convertDateToISO(member.dateOfBirth),
          gender: member.gender || null,
          nationality: member.nationality || null,
          passport_number: member.passportNumber || null,
          departure_airport: sharedTravelInfo?.departureAirport || null,
          destination_airport: sharedTravelInfo?.destinationAirport || null,
          travel_date: convertDateToISO(sharedTravelInfo?.travelDate),
          return_date: convertDateToISO(sharedTravelInfo?.returnDate),
          request_types: selectedRequestTypes, // Shared request types
          status: 'draft',
          is_demo: false,
          ocr_source: null,
          ocr_confidence: null
        }))

        // Insert all family members into mock store
        const bookingRef = sharedBookingRef || formData.bookingRef || null
        const result = store.requests.createMultiple(familyDataArray)
        
        if (result.error) {
          throw result.error
        }

        const data = result.data

        // Update main_table with booking_ref if provided
        if (bookingRef && data && data.length > 0) {
          data.forEach(item => {
            if (bookingRef) {
              store.mainTable.update(item.id, { booking_ref: bookingRef })
            }
          })
        }
      }
    } else {
        // Single mode - use existing logic (no changes)
        const bookingRefSingle = formData.bookingRef || null
        // Map form data to database columns exactly
        // Empty strings are converted to null for nullable fields
        // Convert dates from DD-MM-YYYY to YYYY-MM-DD format for PostgreSQL
        const dbData = {
          first_name: formData.firstName || null,
          middle_name: formData.middleName || null,
          last_name: formData.lastName || null,
          date_of_birth: convertDateToISO(formData.dateOfBirth),
          gender: formData.gender || null,
          nationality: formData.nationality || null,
          passport_number: formData.passportNumber || null,
          departure_airport: formData.departureAirport || null,
          destination_airport: formData.destinationAirport || null,
          travel_date: convertDateToISO(formData.travelDate),
          return_date: convertDateToISO(formData.returnDate),
          request_types: selectedRequestTypes, // JSONB array
          status: 'draft', // Always insert as 'draft'
          is_demo: false, // Always false
          ocr_source: null, // NULL - no OCR yet
          ocr_confidence: null // NULL - no OCR yet
        }

        // Insert directly into mock store
        const result = store.requests.create(dbData)
        
        if (result.error) {
          throw result.error
        }

        const data = result.data

        // Update main_table with booking_ref if provided
        if (bookingRefSingle && data && data.length > 0) {
          store.mainTable.update(data[0].id, { booking_ref: bookingRefSingle })
        }
      }

      // SUCCESS: Insert succeeded
      // Only now do we destroy the passport preview and clear form
      // This ensures user's work is preserved if insert fails
      
      // Destroy passport preview object URL (only for blob URLs, not data URLs)
      // This is safe now because data is saved - file was never sent to Supabase
      if (passportPreviewUrl && passportPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(passportPreviewUrl)
      }
      setPassportPreviewUrl(null)
      setPassportFile(null)

      // Clear form state
      setFormData({
        lastName: '',
        firstName: '',
        middleName: '',
        dateOfBirth: '',
        gender: '',
        nationality: '',
        passportNumber: '',
        travelDate: '',
        returnDate: '',
        departureAirport: '',
        destinationAirport: '',
        bookingRef: '',
        requestTypes: {
          flight: false,
          visa: false,
          package: false,
          other: false
        }
      })

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Clear family mode state if in family mode
      if (requestMode === 'family') {
        setFamilyMembers([])
        setCurrentFamilyIndex(0)
        setSharedTravelInfo(null)
        setSharedBookingRef('')
        setRequestMode(null)
      }

      // Show success message briefly, then redirect to requests list
      const successMsg = requestMode === 'family' 
        ? (language === 'de' 
          ? `${data.length} Familienmitglieder erfolgreich erstellt` 
          : `${data.length} family members created successfully`)
        : t.messages.requestCreated
      setSubmitMessage(successMsg)
      setSubmitError(false)

      // Redirect to requests list after 1 second (so user sees success message)
      setTimeout(() => {
        navigate('/requests')
      }, 1000)

    } catch (error) {
      // ERROR: Insert failed
      // DO NOT clear passport preview or form - preserve user's work
      console.error('Error creating request:', error)
      setSubmitMessage(error.message || t.messages.requestFailed)
      setSubmitError(true)

      // Clear error message after 8 seconds (longer for errors)
      setTimeout(() => {
        setSubmitMessage(null)
      }, 8000)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle "Cancel" button click
  const handleCancel = () => {
    // Clean up passport preview (only for blob URLs, not data URLs)
    if (passportPreviewUrl && passportPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(passportPreviewUrl)
    }
    setPassportPreviewUrl(null)
    setPassportFile(null)

    // Clear form
    setFormData({
      lastName: '',
      firstName: '',
      middleName: '',
      dateOfBirth: '',
      gender: '',
      nationality: '',
      passportNumber: '',
      travelDate: '',
      returnDate: '',
      departureAirport: '',
      destinationAirport: '',
      bookingRef: '',
      requestTypes: {
        flight: false,
        visa: false,
        package: false,
        other: false
      }
    })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    // Reset family mode state
    setFamilyMembers([])
    setCurrentFamilyIndex(0)
    setSharedTravelInfo(null)
    setSharedBookingRef('')
    setRequestMode(null)
  }

  return (
    <div className="page-layout">
      {/* FOUNDATION SIDEBAR - Fixed left navigation */}
      <aside className="sidebar">
        {/* Brand Section */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <img src={logo} alt="LST Travel Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          </div>
          <div className="sidebar-brand-text">LST Travel</div>
        </div>

        {/* Language Switcher */}
        <div className="sidebar-language">
          <button 
            className={`lang-button ${language === 'de' ? 'active' : ''}`} 
            type="button" 
            title="Deutsch"
            onClick={() => setLanguage('de')}
          >
            DE
          </button>
          <button 
            className={`lang-button ${language === 'en' ? 'active' : ''}`} 
            type="button" 
            title="English"
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
        </div>

        {/* Theme Toggle */}
        <div className="sidebar-theme">
          <button 
            className={`theme-button ${theme === 'dark' ? 'active' : ''}`} 
            type="button" 
            title={theme === 'dark' ? t.theme.dark : t.theme.light}
            onClick={handleThemeChange}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {theme === 'dark' ? (
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              ) : (
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              )}
            </svg>
            {theme === 'dark' ? t.theme.dark : t.theme.light}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <Link to="/main" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span>{t.sidebar.mainTable}</span>
          </Link>
          <Link to="/dashboard" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <span>{t.sidebar.dashboard}</span>
          </Link>
          <Link to="/requests" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span>{t.sidebar.requests}</span>
          </Link>
          <Link to="/bookings" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>{t.sidebar.bookings}</span>
          </Link>
          <Link to="/invoices" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
              <path d="M9 9h1v6h-1"/>
            </svg>
            <span>{t.sidebar.invoices}</span>
          </Link>
          <Link to="/expenses" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span>{t.sidebar.expenses}</span>
          </Link>
          <Link to="/customers" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>{t.sidebar.customers}</span>
          </Link>
          <Link to="/bank" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <path d="M2 10h20"/>
              <path d="M7 14h.01"/>
              <path d="M11 14h.01"/>
            </svg>
            <span>{t.sidebar.bank}</span>
          </Link>
          <Link to="/tax" className="nav-item">
            <img src={taxLogo} alt="TAX" width="24" height="24" />
            <span>{t.sidebar.tax}</span>
          </Link>
        </nav>

        {/* Footer Section */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-text">{t.sidebar.footer}</div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA - Passport + Form */}
      <main className="main-content">
        <div className="create-request-page">
          {/* TOP-DOWN LAYOUT: Passport (top) + Form (bottom) */}
          {/* Passport acts as reference area, form as action area */}
          {/* Optimized for fast back-office data entry */}
          
          {/* TOP SECTION: Passport Preview (compact, fixed height) */}
          <section className="passport-preview-section">
        <div className="passport-preview-container">
          {/* Minimal Toolbar - Essential viewing controls only */}
          {passportPreviewUrl && (
            <div className="passport-toolbar">
              {/* Left side: Zoom and Rotate controls */}
              <div className="toolbar-controls-left">
                {/* Zoom controls (works for both images and PDFs) */}
                <>
                  <button
                    type="button"
                    className="toolbar-button"
                    onClick={handleZoomOut}
                    title={t.passport.zoomOut}
                    aria-label={t.passport.zoomOut}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      <line x1="8" y1="11" x2="14" y2="11"/>
                    </svg>
                  </button>
                  <span className="toolbar-zoom-display">{Math.round(imageZoom * 100)}%</span>
                  <button
                    type="button"
                    className="toolbar-button"
                    onClick={handleZoomIn}
                    title={t.passport.zoomIn}
                    aria-label={t.passport.zoomIn}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      <line x1="11" y1="8" x2="11" y2="14"/>
                      <line x1="8" y1="11" x2="14" y2="11"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="toolbar-button"
                    onClick={handleResetZoom}
                    title={t.passport.resetZoom}
                    aria-label={t.passport.resetZoom}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                      <path d="M21 3v5h-5"/>
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                      <path d="M3 21v-5h5"/>
                    </svg>
                  </button>
                </>
                
                {/* Rotate controls (images only) */}
                {passportFile?.type?.startsWith('image/') && (
                  <>
                    <div className="toolbar-separator"/>
                    <button
                      type="button"
                      className="toolbar-button"
                      onClick={handleRotateLeft}
                      title={t.passport.rotateLeft}
                      aria-label={t.passport.rotateLeft}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                        <path d="M21 3v5h-5"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="toolbar-button"
                      onClick={handleRotateRight}
                      title={t.passport.rotateRight}
                      aria-label={t.passport.rotateRight}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9c-2.52 0-4.93 1-6.74 2.74L3 8"/>
                        <path d="M3 3v5h5"/>
                      </svg>
                    </button>
                  </>
                )}
              </div>

            </div>
          )}

          {/* Preview Area */}
          {passportPreviewUrl ? (
            <div 
              ref={viewerRef}
              className="passport-preview-viewer"
              onWheel={handleWheelZoom}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {passportPreviewUrl ? (
                /* Image Preview with real layout-based zoom and rotation.
                   Uses actual width/height for zoom, transform only for rotation.
                   Supports trackpad pinch, Ctrl+wheel, keyboard shortcuts, and touch zoom.
                   PDFs are converted to images (first page only) to ensure identical behavior. */
                <div 
                  className="image-zoom-container"
                  style={{
                    transform: `rotate(${imageRotation}deg)`,
                    transformOrigin: 'center center'
                  }}
                >
                  <img
                    ref={imageRef}
                    src={passportPreviewUrl}
                    alt="Passport preview"
                    className="passport-preview-image"
                    draggable={false}
                    onLoad={handleImageLoad}
                    style={{
                      width: imageDisplaySize.width > 0 ? `${imageDisplaySize.width * imageZoom}px` : 'auto',
                      height: imageDisplaySize.height > 0 ? `${imageDisplaySize.height * imageZoom}px` : 'auto',
                      maxWidth: 'none',
                      maxHeight: 'none'
                    }}
                  />
                </div>
              ) : null}
            </div>
          ) : (
            // Empty State - before upload
            <div className={`passport-preview-empty ${ocrMode && !passportPreviewUrl ? 'paste-waiting-mode' : ''}`}>
              <div className="empty-state-content">
                {ocrMode && !passportPreviewUrl ? (
                  // Paste Waiting State - when OCR mode is enabled and waiting for paste
                  <>
                    <svg
                      className="paste-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
                      />
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                    </svg>
                    <h3 className="paste-waiting-title">{t.passport.pasteWaitingTitle}</h3>
                    <p className="empty-state-text paste-waiting-text">
                      {t.passport.pasteWaitingText}
                    </p>
                    <p className="paste-waiting-subtext">
                      {t.passport.pasteWaitingSubtext}
                    </p>
                    <div className="upload-buttons-group">
                      <button
                        className="upload-button"
                        onClick={() => {
                          setOcrMode(false)
                          setShowOCROptions(true)
                        }}
                        type="button"
                      >
                        {t.passport.chooseFile}
                      </button>
                    </div>
                  </>
                ) : (
                  // Normal Empty State
                  <>
                    <svg
                      className="upload-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="empty-state-text">
                      {t.passport.uploadText}
                    </p>
                    <div className="upload-buttons-group">
                      <button
                        className="upload-button"
                        onClick={() => fileInputRef.current?.click()}
                        type="button"
                      >
                        {t.passport.chooseFile}
                      </button>
                      <button
                        className="upload-button ocr-button"
                        onClick={() => setShowOCROptions(true)}
                        type="button"
                        title="Upload passport image for OCR extraction"
                      >
                        {t.passport.extractOCR}
                      </button>
                      {passportPreviewUrl && submitError && ocrRetryCount < maxRetries - 1 && (
                        <button
                          className="upload-button retry-button"
                          onClick={handleOCRRetry}
                          type="button"
                          disabled={isExtractingOCR}
                        >
                          {t.passport.retry || 'Retry'} ({maxRetries - ocrRetryCount - 1} {t.passport.left || 'left'})
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Hidden file input for Choose File */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          {/* Hidden file input for OCR - independent */}
          <input
            ref={ocrFileInputRef}
            type="file"
            onChange={handleOCRFileUpload}
            accept="image/*,.pdf"
            style={{ display: 'none' }}
          />

          {/* OCR Options Modal - Small popup for choosing upload method */}
          {showOCROptions && (
            <div 
              className="ocr-options-modal-overlay"
              onClick={(e) => {
                // Close modal when clicking outside
                if (e.target === e.currentTarget) {
                  setShowOCROptions(false)
                }
              }}
            >
              <div className="ocr-options-modal" onClick={(e) => e.stopPropagation()}>
                <div className="ocr-options-header">
                  <h3>{t.passport.ocrOptionsTitle}</h3>
                  <button
                    className="ocr-options-close"
                    onClick={() => setShowOCROptions(false)}
                    type="button"
                    aria-label="Close"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                <div className="ocr-options-buttons">
                  <button
                    className="ocr-option-button"
                    onClick={() => {
                      setShowOCROptions(false)
                      ocrFileInputRef.current?.click()
                    }}
                    type="button"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>{t.passport.ocrManualUpload}</span>
                  </button>
                  <button
                    className="ocr-option-button"
                    onClick={() => {
                      setShowOCROptions(false)
                      setOcrMode(true)
                      // Show hint message
                      setSubmitMessage(t.passport.ocrPasteHint)
                      setSubmitError(false)
                      setTimeout(() => {
                        setSubmitMessage(null)
                      }, 3000)
                    }}
                    type="button"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                    </svg>
                    <span>{t.passport.ocrPaste}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Extract button - Floating overlay in lower left corner (when OCR file is loaded) */}
          {ocrFile && passportPreviewUrl && (
            <button
              className="extract-button-overlay"
              onClick={() => {
                setOcrRetryCount(0)
                handleExtractOCR(false)
              }}
              disabled={isExtractingOCR}
              type="button"
              title="Extract passport data using OCR"
            >
              {isExtractingOCR ? t.passport.extracting : 'Extract'}
            </button>
          )}

          {/* Retry button - Next to Extract button (when error occurs) */}
          {ocrFile && passportPreviewUrl && submitError && ocrRetryCount < maxRetries - 1 && (
            <button
              className="retry-button-overlay"
              onClick={handleOCRRetry}
              disabled={isExtractingOCR}
              type="button"
              title="Retry extraction"
            >
              Retry ({maxRetries - ocrRetryCount - 1})
            </button>
          )}

          {/* Remove button - Floating overlay (when file is uploaded) */}
          {/* File name is intentionally NOT displayed - focus is on document only */}
          {(passportFile || ocrFile) && (
            <button
              className="remove-file-button-overlay"
              onClick={() => {
                if (passportPreviewUrl && passportPreviewUrl.startsWith('blob:')) {
                  URL.revokeObjectURL(passportPreviewUrl)
                }
                setPassportPreviewUrl(null)
                setPassportFile(null)
                setOcrFile(null)
                setImageZoom(1)
                setImageRotation(0)
                
                // Clear form data when file is removed to avoid confusion with different documents
                setFormData({
                  lastName: '',
                  firstName: '',
                  middleName: '',
                  dateOfBirth: '',
                  gender: '',
                  nationality: '',
                  passportNumber: '',
                  travelDate: '',
                  returnDate: '',
                  departureAirport: '',
                  destinationAirport: '',
                  bookingRef: '',
                  requestTypes: {
                    flight: false,
                    visa: false,
                    package: false,
                    other: false
                  }
                })
                
                // Reset date pickers
                if (dateOfBirthRef.current?._flatpickr) {
                  dateOfBirthRef.current._flatpickr.clear()
                }
                if (travelDateRef.current?._flatpickr) {
                  travelDateRef.current._flatpickr.clear()
                }
                if (returnDateRef.current?._flatpickr) {
                  returnDateRef.current._flatpickr.clear()
                }
                
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
                if (ocrFileInputRef.current) {
                  ocrFileInputRef.current.value = ''
                }
              }}
              type="button"
              title={t.passport.remove}
              aria-label={t.passport.remove}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </section>

      {/* BOTTOM SECTION: Form (scrollable, compact and dense) */}
      <section className="form-section">
        <div className="form-card">
          {/* Mode Selection Modal - Show when requestMode is null */}
          {requestMode === null && (
            <div className="mode-selection-modal-overlay">
              <div className="mode-selection-modal">
                <h2>{language === 'de' ? 'Anfragetyp auswählen' : 'Select Request Type'}</h2>
                <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                  {language === 'de' 
                    ? 'Wählen Sie aus, ob Sie eine einzelne Person oder eine Familie hinzufügen möchten'
                    : 'Choose whether you want to add a single person or a family'}
                </p>
                <div className="mode-selection-buttons">
                  <button
                    type="button"
                    className="mode-button mode-single"
                    onClick={() => setRequestMode('single')}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>{language === 'de' ? 'Einzelperson' : 'Single Person'}</span>
                  </button>
                  <button
                    type="button"
                    className="mode-button mode-family"
                    onClick={() => setRequestMode('family')}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span>{language === 'de' ? 'Familie' : 'Family'}</span>
                  </button>
                  <button
                    type="button"
                    className="mode-button mode-cancel"
                    onClick={() => navigate('/requests')}
                    style={{ justifyContent: 'center' }}
                  >
                    {language === 'de' ? 'Zurück zur Tabelle' : 'Back to Requests'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Top-level header removed - section headers provide sufficient hierarchy */}
          {/* Only show form when mode is selected */}
          {requestMode !== null && (
          <form className="request-form" onSubmit={(e) => e.preventDefault()}>
            {/* Passenger Information */}
            <div className="form-section-group">
              <h3 className="form-section-title">{t.sections.passengerInformation}</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="lastName">
                    {t.fields.lastName} <span className="required">*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder={t.placeholders.lastName}
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="firstName">
                    {t.fields.firstName} <span className="required">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder={t.placeholders.firstName}
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="middleName">{t.fields.middleName}</label>
                  <input
                    id="middleName"
                    type="text"
                    placeholder={t.placeholders.middleName}
                    value={formData.middleName}
                    onChange={(e) => handleInputChange('middleName', e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="dateOfBirth">{t.fields.dateOfBirth}</label>
                  <input
                    ref={dateOfBirthRef}
                    id="dateOfBirth"
                    type="text"
                    placeholder={t.placeholders.dateOfBirth}
                    value={formData.dateOfBirth}
                    onChange={(e) => handleDateInputChange('dateOfBirth', e)}
                  data-flatpickr="true"
                  data-flatpickr-format="d-m-Y"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="gender">{t.fields.gender}</label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  >
                    <option value="">{t.gender.select}</option>
                    <option value="M">{t.gender.male}</option>
                    <option value="F">{t.gender.female}</option>
                    <option value="Other">{t.gender.other}</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="nationality">{t.fields.nationality}</label>
                  <input
                    id="nationality"
                    type="text"
                    placeholder={t.placeholders.nationality}
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Document Information */}
            <div className="form-section-group">
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="passportNumber">{t.fields.passportNumber}</label>
                  <input
                    id="passportNumber"
                    type="text"
                    placeholder={t.placeholders.passportNumber}
                    value={formData.passportNumber}
                    onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Travel Information */}
            <div className="form-section-group">
              <h3 className="form-section-title">{t.sections.travelInformation}</h3>
              
              {/* Show read-only shared travel info for family members after first person */}
              {requestMode === 'family' && currentFamilyIndex > 0 && sharedTravelInfo && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.875rem'
                }}>
                  <div style={{ marginBottom: '0.5rem', fontWeight: '600' }}>
                    {language === 'de' ? 'Gemeinsame Reiseinformationen:' : 'Shared Travel Information:'}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    <div>{sharedTravelInfo.departureAirport} → {sharedTravelInfo.destinationAirport}</div>
                    {sharedTravelInfo.travelDate && <div>{language === 'de' ? 'Abflug:' : 'Departure:'} {sharedTravelInfo.travelDate}</div>}
                    {sharedTravelInfo.returnDate && <div>{language === 'de' ? 'Rückflug:' : 'Return:'} {sharedTravelInfo.returnDate}</div>}
                  </div>
                </div>
              )}

              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="travelDate">{t.fields.travelDate}</label>
                  <input
                    ref={travelDateRef}
                    id="travelDate"
                    type="text"
                    placeholder={t.placeholders.travelDate}
                    value={requestMode === 'family' && currentFamilyIndex > 0 ? (sharedTravelInfo?.travelDate || '') : formData.travelDate}
                    onChange={(e) => handleDateInputChange('travelDate', e)}
                    disabled={requestMode === 'family' && currentFamilyIndex > 0}
                    style={requestMode === 'family' && currentFamilyIndex > 0 ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                  data-flatpickr="true"
                  data-flatpickr-format="d-m-Y"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="returnDate">{t.fields.returnDate}</label>
                  <input
                    ref={returnDateRef}
                    id="returnDate"
                    type="text"
                    placeholder={t.placeholders.returnDate}
                    value={requestMode === 'family' && currentFamilyIndex > 0 ? (sharedTravelInfo?.returnDate || '') : formData.returnDate}
                    onChange={(e) => handleDateInputChange('returnDate', e)}
                    disabled={requestMode === 'family' && currentFamilyIndex > 0}
                    style={requestMode === 'family' && currentFamilyIndex > 0 ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                  data-flatpickr="true"
                  data-flatpickr-format="d-m-Y"
                  />
                </div>

              </div>

              {/* Airport fields in one row with arrow */}
              <div className="form-grid" style={{ gridTemplateColumns: '1fr auto 1fr', alignItems: 'end' }}>
                <div className="form-field">
                  <label htmlFor="departureAirport">{t.fields.departureAirport}</label>
                  <AirportAutocomplete
                    id="departureAirport"
                    name="departureAirport"
                    value={requestMode === 'family' && currentFamilyIndex > 0 ? (sharedTravelInfo?.departureAirport || '') : formData.departureAirport}
                    onChange={(value) => handleInputChange('departureAirport', value)}
                    placeholder={t.placeholders.departureAirport}
                    disabled={requestMode === 'family' && currentFamilyIndex > 0}
                  />
                </div>

                <div className="airport-arrow" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '0.5rem', paddingLeft: '0.5rem', paddingRight: '0.5rem', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--text-primary)' }}>
                    {/* Top-left arrow (L-shaped hook pointing left) */}
                    <path d="M16 4L10 4L10 10L5 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <path d="M5 10L8.5 6.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    {/* Bottom-right arrow (L-shaped hook pointing right) */}
                    <path d="M8 20L14 20L14 14L19 14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <path d="M19 14L15.5 17.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </div>

                <div className="form-field">
                  <label htmlFor="destinationAirport">{t.fields.destinationAirport}</label>
                  <AirportAutocomplete
                    id="destinationAirport"
                    name="destinationAirport"
                    value={requestMode === 'family' && currentFamilyIndex > 0 ? (sharedTravelInfo?.destinationAirport || '') : formData.destinationAirport}
                    onChange={(value) => handleInputChange('destinationAirport', value)}
                    placeholder={t.placeholders.destinationAirport}
                    disabled={requestMode === 'family' && currentFamilyIndex > 0}
                  />
                </div>
              </div>

            </div>

            {/* Request Type */}
            <div className="form-section-group">
              <h3 className="form-section-title">
                {t.sections.requestType}
              </h3>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.requestTypes.flight}
                    onChange={(e) => handleCheckboxChange('flight', e.target.checked)}
                  />
                  <span>{t.fields.requestTypes.flight}</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.requestTypes.visa}
                    onChange={(e) => handleCheckboxChange('visa', e.target.checked)}
                  />
                  <span>{t.fields.requestTypes.visa}</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.requestTypes.package}
                    onChange={(e) => handleCheckboxChange('package', e.target.checked)}
                  />
                  <span>{t.fields.requestTypes.package}</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.requestTypes.other}
                    onChange={(e) => handleCheckboxChange('other', e.target.checked)}
                  />
                  <span>{t.fields.requestTypes.other}</span>
                </label>
              </div>
            </div>

            {/* Family Members List Display - moved near action buttons for less scrolling */}
            {requestMode === 'family' && familyMembers.length > 0 && (
              <div className="family-members-display" style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: '600' }}>
                  {language === 'de' 
                    ? `${familyMembers.length} Familienmitglied(er) hinzugefügt`
                    : `${familyMembers.length} Family Member(s) Added`}
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {familyMembers.map((member, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)'
                    }}>
                      <span style={{ fontSize: '0.875rem' }}>
                        {member.firstName} {member.lastName}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFamilyMember(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-error)',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title={language === 'de' ? 'Entfernen' : 'Remove'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                {sharedTravelInfo && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <strong>{language === 'de' ? 'Gemeinsame Reiseinformationen:' : 'Shared Travel Information:'}</strong>
                    <div style={{ marginTop: '0.25rem' }}>
                      {sharedTravelInfo.departureAirport} → {sharedTravelInfo.destinationAirport}
                      {sharedTravelInfo.travelDate && ` | ${sharedTravelInfo.travelDate}`}
                      {sharedTravelInfo.returnDate && ` | ${sharedTravelInfo.returnDate}`}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Message (Success or Error) */}
            {submitMessage && (
              <div className={`submit-message ${submitError ? 'submit-error' : 'submit-success'}`}>
                {submitMessage}
              </div>
            )}

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="button"
                className="button button-cancel"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                {t.buttons.cancel}
              </button>
              
              {/* Family Mode Buttons */}
              {requestMode === 'family' && (
                <>
                  {currentFamilyIndex === 0 ? (
                    // First person - show both buttons
                    <>
                      <button
                        type="button"
                        className="button button-primary"
                        onClick={handleSaveFamilyMember}
                        disabled={!formData.firstName || !formData.lastName || isSubmitting}
                      >
                        {language === 'de' ? 'Speichern & Weitere Person hinzufügen' : 'Save & Add Another Person'}
                      </button>
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={handleCreateRequest}
                        disabled={((!formData.firstName || !formData.lastName) && familyMembers.length === 0) || isSubmitting}
                      >
                        {isSubmitting ? (language === 'de' ? 'Erstelle...' : 'Creating...') : t.buttons.createRequest}
                      </button>
                    </>
                  ) : (
                    // Subsequent persons - show both buttons
                    <>
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={handleSaveFamilyMember}
                        disabled={!formData.firstName || !formData.lastName || isSubmitting}
                      >
                        {language === 'de' ? 'Speichern & Weitere Person hinzufügen' : 'Save & Add Another Person'}
                      </button>
                      <button
                        type="button"
                        className="button button-primary"
                        onClick={handleCreateRequest}
                        disabled={familyMembers.length === 0 || isSubmitting}
                      >
                        {isSubmitting ? (language === 'de' ? 'Erstelle...' : 'Creating...') : t.buttons.createRequest}
                      </button>
                    </>
                  )}
                </>
              )}
              
              {/* Single Mode Button */}
              {requestMode === 'single' && (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={handleCreateRequest}
                  disabled={!formData.firstName || !formData.lastName || isSubmitting}
                >
                  {isSubmitting ? (language === 'de' ? 'Erstelle...' : 'Creating...') : t.buttons.createRequest}
                </button>
              )}
            </div>
          </form>
          )}
        </div>
      </section>
        </div>
      </main>
    </div>
  )
}

export default CreateRequest
