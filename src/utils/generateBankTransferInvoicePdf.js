import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import QRCode from 'qrcode'
import britishFlag from '../assets/British.png'
import germanFlag from '../assets/Germany.png'
import defaultInvoiceLogo from '../assets/logo.png'

const DEFAULT_SETTINGS = {
  // Provide a guaranteed fallback logo so invoices always render a brand mark
  logo_url: defaultInvoiceLogo,
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
  bic: 'COBADEFFXXX'
}

const formatAmount = (value) => {
  const numberValue = Number(value)
  if (Number.isNaN(numberValue)) return ''
  return numberValue.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// Escape HTML entities to prevent XSS and rendering issues
const escapeHtml = (text) => {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

const normalizeSettings = (settings) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'generateBankTransferInvoicePdf.js:normalizeSettings',message:'normalizeSettings called',data:{inputLogoUrl:settings?.logo_url,defaultLogoUrl:DEFAULT_SETTINGS.logo_url,hasSettings:!!settings},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'H5'})}).catch(()=>{});
  // #endregion
  
  const result = {
    ...DEFAULT_SETTINGS,
    ...(settings || {})
  }
  
  // Preserve logo_url from settings if it exists (even if empty string - let caller decide)
  // Only use default if logo_url is null/undefined (not explicitly set)
  if (settings?.logo_url !== undefined && settings?.logo_url !== null) {
    result.logo_url = settings.logo_url
  } else if (!result.logo_url) {
    // Only fallback to default if no logo_url was provided at all
    result.logo_url = DEFAULT_SETTINGS.logo_url
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'generateBankTransferInvoicePdf.js:normalizeSettings_result',message:'normalizeSettings result',data:{resultLogoUrl:result.logo_url,inputLogoUrl:settings?.logo_url,willOverwrite:!settings?.logo_url&&DEFAULT_SETTINGS.logo_url===''},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'H5'})}).catch(()=>{});
  // #endregion
  
  return result
}

// Extract city and code from airport string
// Example: "HHN, Hahn Airport, Frankfurt" → { city: "Hahn", code: "HHN" }
const parseAirport = (airportString) => {
  if (!airportString) return { city: '', code: '' }
  
  // Try to extract code (usually first part before comma)
  const parts = airportString.split(',').map(p => p.trim())
  const code = parts[0] || ''
  
  // Try to extract city name (usually second or third part)
  // Look for city name in the parts
  let city = ''
  if (parts.length > 1) {
    // Check if second part contains airport name
    const secondPart = parts[1]
    if (secondPart && !secondPart.toLowerCase().includes('airport')) {
      city = secondPart
    } else if (parts.length > 2) {
      city = parts[2]
    } else {
      // Fallback: use second part and remove "Airport" if present
      city = secondPart.replace(/Airport/gi, '').trim()
    }
  }
  
  // If no city found, try to extract from the string
  if (!city && airportString) {
    const match = airportString.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/)
    if (match) {
      city = match[1]
    }
  }
  
  return { city: city || '', code: code || '' }
}

// Format date: "DD.MM.YY"
const formatGermanDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return `${day}.${month}.${year}`
  } catch (err) {
    return dateString
  }
}

const formatAirportDisplay = (raw) => {
  if (!raw) return '-'
  const cleaned = String(raw)
    .replace(/\bairport\b/gi, '')
    .replace(/\bintl\b/gi, '')
    .replace(/\binternational\b/gi, '')
    .replace(/\bair\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  // Extract IATA code
  const parenCode = cleaned.match(/\(([A-Z]{3})\)/)
  let code = parenCode?.[1] || null
  if (!code) {
    const tokenCode = cleaned.match(/\b([A-Z]{3})\b/)
    if (tokenCode) code = tokenCode[1]
  }

  // Hard map EBB
  if (code === 'EBB') {
    return 'Entebbe/Kampala(EBB)'
  }

  const parts = cleaned.split(/[,|]/).map(p => p.trim()).filter(Boolean)
  let city = parts[0] || ''
  city = city.replace(/\([A-Z]{3}\)/g, '').trim()
  if (!city && code) city = code
  if (!code) {
    const tokens = cleaned.split(/\s+/)
    const maybe = tokens.reverse().find(t => /^[A-Z]{3}$/.test(t))
    if (maybe) code = maybe
  }
  if (!code) return city || '-'
  return `${city.replace(/\s+/g, '') ? city.replace(/\s+/g, '') : city}(${code})`
}

// Format airline display to "Name (CODE)" regardless of input order/format
const formatAirlineDisplay = (raw) => {
  if (!raw) return ''
  const cleaned = String(raw).trim().replace(/\s+/g, ' ')

  // If already has parentheses, normalize spacing/case
  const paren = cleaned.match(/\(([A-Za-z0-9]{2,3})\)/)
  if (paren) {
    const code = paren[1].toUpperCase()
    const name = cleaned.replace(/\([^)]+\)/, '').trim()
    if (name) return `${name} (${code})`
    return `${cleaned.replace(/\s*\([^)]+\)/, '').trim()} (${code})`
  }

  const tokens = cleaned.split(' ')
  const codePattern = /^[A-Z0-9]{2,3}$/

  // Pattern: CODE Name...
  if (tokens.length > 1 && codePattern.test(tokens[0])) {
    const code = tokens[0].toUpperCase()
    const name = tokens.slice(1).join(' ')
    return `${name} (${code})`
  }

  // Pattern: Name... CODE
  if (tokens.length > 1 && codePattern.test(tokens[tokens.length - 1])) {
    const code = tokens[tokens.length - 1].toUpperCase()
    const name = tokens.slice(0, -1).join(' ')
    return `${name} (${code})`
  }

  return cleaned
}

// Translations (single language selection)
const tr = {
  de: {
    heading: 'BANKÜBERWEISUNG',
    date: 'Datum',
    departure: 'Abflug',
    return: 'Rückflug',
    airlines: 'Fluggesellschaften',
    pnr: 'PNR / RFN:-',
    passenger: 'Namen des Reisenden',
    ticket: 'Ticket',
    visa: 'Visum',
    hotel: 'Hotel',
    total: 'Gesamtsumme',
    platform: 'Ticketbuchungsplattformen:-',
    platformValue: 'IATA',
    confirm: 'Ich/Wir bestätigen, dass die Angaben auf meiner/unserer Buchung korrekt sind, einschließlich Namen, Datum und weiterer Details. Zudem wurde ich/wurden wir über die Visumspflichten, Stornierungs- und Umbuchungsgebühren und alle Flugreisedetails umfassend aufgeklärt. Ich/Wir habe(n) die Bedingungen für die Buchung zur Kenntnis genommen und vollumfänglich verstanden und buche(n) verbindlich.',
    taxNote: 'Steuerfreie Vermittlungsleistung gemäß § 3a Abs.2 UStG',
    signature: 'Unterschrift:'
  },
  en: {
    heading: 'BANK TRANSFER',
    date: 'Date',
    departure: 'Departure',
    return: 'Return',
    airlines: 'Airlines',
    pnr: 'PNR / RFN:-',
    passenger: 'Passenger Name',
    ticket: 'Ticket',
    visa: 'Visa',
    hotel: 'Hotel',
    total: 'Total Amount',
    platform: 'Ticket booking platforms:-',
    platformValue: 'IATA',
    confirm: 'I/We confirm that the details in my/our booking are correct, including names, dates, and other details. I/We have also been informed about visa requirements, cancellation and rebooking fees, and all flight details. I/We acknowledge and fully understand the booking conditions and confirm the booking.',
    taxNote: 'Tax-exempt brokerage service pursuant to § 3a para.2 UStG',
    signature: 'Signature:'
  }
}

const t = (key, lang) => tr[lang]?.[key] || tr.de[key] || ''

// Generate QR code with logo overlay
async function generateQRCodeWithLogo(qrData, logoUrl) {
  try {
    // Generate QR code at MUCH larger size for maximum scannability
    // Simple URL with low error correction = biggest possible dots
    const qrSize = 600 // Large size for maximum scannability
    const qrImageDataUrl = await QRCode.toDataURL(qrData, {
      width: qrSize,
      margin: 4, // Generous white border (quiet zone) - critical for scanning
      errorCorrectionLevel: 'L', // Low error correction (7% recovery) - simplest QR code possible
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      type: 'image/png'
    })

    // If logo is provided, overlay it in the center (but keep it VERY small - 5% max)
    if (logoUrl) {
      return new Promise((resolve, reject) => {
        const qrImg = new Image()
        qrImg.crossOrigin = 'anonymous'
        qrImg.onload = () => {
          const logoImg = new Image()
          logoImg.crossOrigin = 'anonymous'
          logoImg.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = qrSize
            canvas.height = qrSize
            const ctx = canvas.getContext('2d')

            // Disable smoothing for QR code to maintain sharp edges
            ctx.imageSmoothingEnabled = false

            // Draw QR code at full resolution
            ctx.drawImage(qrImg, 0, 0, qrSize, qrSize)

            // Calculate logo size - keep it VERY small (5% max) to minimize interference
            const logoSize = Math.round(qrSize * 0.05) // ~30px for 600px QR code - very small
            const logoX = (qrSize - logoSize) / 2
            const logoY = (qrSize - logoSize) / 2
            const padding = 4 // Minimal white padding around logo

            // Draw white background for logo with padding (ensures clean area)
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(logoX - padding, logoY - padding, logoSize + (padding * 2), logoSize + (padding * 2))

            // Draw logo with high quality (enable smoothing only for logo)
            ctx.save()
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
            ctx.restore()

            resolve(canvas.toDataURL('image/png', 1.0)) // Maximum quality PNG
          }
          logoImg.onerror = () => resolve(qrImageDataUrl) // Fallback to QR without logo if logo fails
          logoImg.src = logoUrl
        }
        qrImg.onerror = () => reject(new Error('Failed to load QR code'))
        qrImg.src = qrImageDataUrl
      })
    }

    return qrImageDataUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    return null
  }
}

async function generateBankTransferInvoicePdf({ booking, settings, mode = 'download', language = 'de', includeParagraph = true }) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'generateBankTransferInvoicePdf.js:entry',message:'Invoice generator called',data:{bookingId:booking.id,inputLogoUrl:settings?.logo_url,hasSettings:!!settings},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'H5'})}).catch(()=>{});
  // #endregion
  
  const safeSettings = normalizeSettings(settings)
  const includeQr = safeSettings.include_qr !== false
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'generateBankTransferInvoicePdf.js:after_normalize',message:'After normalizeSettings',data:{inputLogoUrl:settings?.logo_url,outputLogoUrl:safeSettings.logo_url,hasLogo:!!safeSettings.logo_url,defaultLogoUrl:DEFAULT_SETTINGS.logo_url},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'H5'})}).catch(()=>{});
  // #endregion
  
  // Debug: Log logo URL
  console.log('Invoice generator - Logo URL:', safeSettings.logo_url)
  console.log('Invoice generator - Full settings:', safeSettings)

  const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`

  const locale = language === 'en' ? 'en-US' : 'de-DE'
  const dateString = new Date().toLocaleDateString(locale)
  const passengerName = [booking.first_name, booking.last_name].filter(Boolean).join(' ').trim()
  const passengerRowName = [
    passengerName,
    booking.passport_number
  ].filter(Boolean).join(' ')

  const departureAirport = booking.departure_airport || ''
  const arrivalAirport = booking.arrival_airport || booking.destination_airport || ''
  const airlineNameRaw = booking.airline_name || booking.airlines || ''
  const airlineName = formatAirlineDisplay(airlineNameRaw)
  const pnrValue = booking.pnr || booking.booking_ref || 'TBD'
  
  // Parse airports
  const departureParsed = parseAirport(departureAirport)
  const arrivalParsed = parseAirport(arrivalAirport)
  
  // Format dates
  const travelDateFormatted = formatGermanDate(booking.travel_date)
  const returnDateFormatted = formatGermanDate(booking.return_date)
  
  // Format airport display: "City (CODE)"
  const departureDisplay = formatAirportDisplay(departureAirport)
  const arrivalDisplay = formatAirportDisplay(arrivalAirport)
  
  // For return flight, swap departure and arrival
  const returnDepartureDisplay = arrivalDisplay
  const returnArrivalDisplay = departureDisplay

  const ticketValue = formatAmount(booking.total_ticket_price || 0)
  const visaValue = formatAmount(booking.tot_visa_fees || 0)
  const hotelRaw = Number(booking.hotel_charges || 0)
  const hotelValue = hotelRaw > 0 ? formatAmount(hotelRaw) : ''
  const totalValue = formatAmount(booking.total_amount_due || 0)
  
  // Build payment confirmation text
  let paymentText = ''
  const fullName = `${booking.first_name || ''} ${booking.middle_name || ''} ${booking.last_name || ''}`.trim()
  const passport = booking.passport_number || ''
  const paymentBalanceRaw = booking.payment_balance || ''
  const paymentBalance = String(paymentBalanceRaw).trim()
  
  // Get notice from booking data and escape HTML
  const noticeText = booking.notice && booking.notice.trim() ? escapeHtml(booking.notice.trim()) : null

  const tableMarginTop = includeQr ? '29mm' : '10mm'
  const afterTableMarginTop = includeQr ? '8mm' : '6mm'
  const noticeMarginTop = includeQr ? '6mm' : '3mm'
  const noticeMarginBottom = includeQr ? '4mm' : '2mm'
  // Without QR: tighter spacing per request
  const signatureMarginTop = includeQr ? '34mm' : '15mm'
  const footerMarginTop = includeQr ? '16mm' : '11mm'

  // Build notice HTML section - displayed in red box, right-aligned below the table
  let noticeSectionHTML = ''
  if (noticeText) {
    noticeSectionHTML = `<div style="margin-top: ${noticeMarginTop}; margin-bottom: ${noticeMarginBottom}; text-align: right;">
      <div style="display: inline-block; border: 2px solid #dc2626; padding: 8px 12px; font-size: 16px; font-weight: 500; color: #dc2626; white-space: pre-wrap; word-wrap: break-word; text-align: left; max-width: 60%;">${noticeText}</div>
    </div>`
  }

  // Generate QR code WITHOUT logo - add directly to PDF to bypass html2canvas degradation
  const bookingId = booking.id || booking.booking_id || ''
  const qrData = `https://lsttravel.de/verify/${encodeURIComponent(bookingId)}`
  let qrImage = null
  if (includeQr) {
    // Generate QR code directly (no logo overlay) - will be added to PDF separately
    qrImage = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
  }

  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = '210mm'
  container.style.background = '#ffffff'
  document.body.appendChild(container)

  const invoiceHTML = `
    <div style="
      width: 210mm;
      min-height: 297mm;
      padding: 12mm 18mm;
      box-sizing: border-box;
      font-family: 'Times New Roman', serif;
      color: #000;
      display: flex;
      flex-direction: column;
    ">
      <div style="flex: 1; display: flex; flex-direction: column;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="width: 45%;">
          ${(() => {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'generateBankTransferInvoicePdf.js:html_logo_check',message:'Checking logo_url in HTML template',data:{logoUrl:safeSettings.logo_url,hasLogo:!!safeSettings.logo_url,logoUrlLength:safeSettings.logo_url?.length||0,isEmptyString:safeSettings.logo_url===''},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'H5'})}).catch(()=>{});
            // #endregion
            return safeSettings.logo_url ? `<img src="${safeSettings.logo_url}" alt="Logo" style="max-width: 140px; max-height: 60px; object-fit: contain; display: block; margin-bottom: 4px;" />` : ''
          })()}
          <div style="font-size: 22px; font-weight: bold; color: #000; margin-top: 4px;">${safeSettings.company_name || 'LST Travel Agency'}</div>
        </div>
        <div style="text-align: right; font-size: 14px; line-height: 1.2;">
          <div style="font-weight: bold; margin-bottom: 1px;">${safeSettings.contact_person || ''}</div>
          <div style="margin-bottom: 1px;">${safeSettings.address || ''}</div>
          <div style="margin-bottom: 1px;">${safeSettings.postal || ''}</div>
          <div style="margin-bottom: 1px;">Email: ${safeSettings.email || ''}</div>
          <div style="margin-bottom: 1px;">Tel: ${safeSettings.phone || ''}</div>
          <div>Mob ${safeSettings.mobile || ''}</div>
        </div>
      </div>

      <div style="margin-top: 5mm; border-bottom: 1px solid #000;"></div>

      <div style="margin-top: 8mm;">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <div style="font-size: 24px; font-weight: bold;">${t('heading', language)}</div>
          <div style="text-align: right; font-size: 14px;">
            <div>${t('date', language)} ${dateString}</div>
          </div>
        </div>

      <div style="margin-top: 4mm; font-size: 13px; line-height: 1.4;">
          <div><strong>${t('departure', language)}:</strong> ${travelDateFormatted} ${departureDisplay} - ${arrivalDisplay}</div>
          <div><strong>${t('return', language)}:</strong> ${returnDateFormatted} ${returnDepartureDisplay} - ${returnArrivalDisplay}</div>
          <div><strong>${t('airlines', language)}:</strong> ${airlineName}</div>
          <div><strong>${t('pnr', language)}</strong> ${pnrValue}</div>
        </div>
      </div>

      <!-- QR code removed from HTML - will be added directly to PDF to bypass html2canvas -->

      <table style="
        width: 100%;
        margin-top: ${tableMarginTop};
        border-collapse: collapse;
        font-size: 14px;
      ">
        <thead>
          <tr>
            <th style="border: 1px solid #000; padding: 8px; text-align: left;">${t('passenger', language)}</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: right;">${t('ticket', language)}</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: right;">${t('visa', language)}</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: right;">${t('hotel', language)}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #000; padding: 8px;">${passengerRowName || ''}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${ticketValue}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${visaValue}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${hotelValue}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 8px; font-weight: bold;">${t('total', language)}</td>
            <td style="border: 1px solid #000; padding: 8px;"></td>
            <td style="border: 1px solid #000; padding: 8px;"></td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">${totalValue} €</td>
          </tr>
        </tbody>
      </table>

      ${noticeSectionHTML}
      
      <div style="margin-top: ${afterTableMarginTop}; font-size: 14px; line-height: 1.6;">
        <div style="margin-bottom: 6mm;"><strong>${t('platform', language)}</strong> ${t('platformValue', language)}</div>
        <div style="margin-bottom: 6mm; text-align: justify;">
          <div>${t('confirm', language)}</div>
        </div>
        <div style="margin-top: ${afterTableMarginTop};">
          <div style="font-weight: bold;">${t('taxNote', language)}</div>
        </div>
      </div>
      </div>

      <div style="margin-top: auto; padding-top: 10mm;">
        <div style="text-align: right; font-size: 14px; margin-bottom: 8mm;">
          <div style="font-weight: bold;">
            ${t('signature', language)}<span style="border-bottom: 1px solid #000; display: inline-block; width: 70mm; margin-left: 4px; vertical-align: middle; height: 1em;"></span>
          </div>
        </div>

        <div style="border-top: 1px solid #000; padding-top: 6mm; font-size: 13px;">
          <div style="display: flex; justify-content: space-between; gap: 12px;">
            <div style="flex: 1;">
              <div>${safeSettings.company_name || 'LST Travel Agency'}</div>
              <div>UST-ID ${safeSettings.tax_id || 'DE340914297'}</div>
              <div>${safeSettings.website || 'www.lsttravel.de'}</div>
            </div>
            <div style="flex: 1; text-align: center;">
              <div>Geschäftsinhaberin</div>
              <div>${safeSettings.contact_person || 'Yodli Hagos Mebratu'}</div>
            </div>
            <div style="flex: 1; text-align: right;">
              <div>Bankverbindung</div>
              <div>${safeSettings.bank_name || 'Commerzbank AG'}</div>
              <div>${safeSettings.iban || 'DE28 5134 0013 0185 3597 00'}</div>
              <div>${safeSettings.bic || 'COBADEFFXXX'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `

  container.innerHTML = invoiceHTML

  await new Promise((resolve) => setTimeout(resolve, 500))

  const canvas = await html2canvas(container, {
    scale: 3, // Increased scale for better QR code quality
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: 794,
    height: 1123,
    allowTaint: true,
    imageTimeout: 15000,
    removeContainer: false,
    onclone: (clonedDoc) => {
      // Ensure QR code images are fully loaded before capture
      const qrImages = clonedDoc.querySelectorAll('img[alt="QR Code"]')
      qrImages.forEach(img => {
        img.style.imageRendering = 'crisp-edges'
        img.style.imageRendering = '-webkit-optimize-contrast'
      })
    }
  })

  const pdf = new jsPDF('p', 'mm', 'a4')
  const imgData = canvas.toDataURL('image/png', 1.0) // Maximum quality

  const pdfWidth = 210
  const pdfHeight = 297
  const imgWidth = canvas.width
  const imgHeight = canvas.height
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
  const imgScaledWidth = imgWidth * ratio
  const imgScaledHeight = imgHeight * ratio
  const xOffset = (pdfWidth - imgScaledWidth) / 2
  const yOffset = (pdfHeight - imgScaledHeight) / 2

  // Add main invoice HTML (captured via html2canvas)
  pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgScaledWidth, imgScaledHeight)

  // Add QR code DIRECTLY to PDF (bypass html2canvas to preserve quality)
  // Position: Right side, after flight details, before table
  if (includeQr && qrImage) {
    // Use exact coordinates as specified: x=150mm, y=80mm, size=40mm
    pdf.addImage(qrImage, 'PNG', 150, 80, 40, 40)
    
    // Add "Scannen für Details" text below QR code
    pdf.setFontSize(9)
    pdf.setTextColor(102, 102, 102) // #666
    pdf.text('Scannen für Details', 170, 123, { align: 'center' }) // Center of QR (150 + 40/2 = 170), below QR (80 + 40 + 3 = 123)
  }

  // Use bookingId from above, or fallback for filename
  const fileNameId = bookingId || booking.booking_ref || 'invoice'
  
  if (mode === 'preview') {
    try {
      const pdfBlob = pdf.output('blob')
      const pdfUrl = URL.createObjectURL(pdfBlob)
      const previewWindow = window.open('', '_blank')

      if (!previewWindow) {
        pdf.save(`Invoice-${fileNameId}.pdf`)
        document.body.removeChild(container)
        return
      }

      const fileName = `Invoice-${fileNameId}.pdf`
      // Reuse already-built HTML string for selectable view
      const invoiceHtml = invoiceHTML
      const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice Preview</title>
    <style>
      body { margin: 0; font-family: Arial, sans-serif; background: #f5f5f5; color: #1f2937; }
      .toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; background: #fff; border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; z-index: 1; }
      .toolbar-left { display: flex; align-items: center; gap: 10px; }
      .toolbar-right { display: flex; align-items: center; gap: 8px; }
      .toolbar button { padding: 8px 14px; border: 1px solid transparent; background: #2563eb; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.15s ease; color: #ffffff; }
      .toolbar button:hover { filter: brightness(0.98); }
      .btn-primary { background: #f59e0b !important; color: #111827 !important; border: none !important; }
      .btn-secondary { background: #2563eb !important; color: #ffffff !important; border: none !important; }
      .lang-btn { background: #2563eb !important; color: #ffffff !important; border: none !important; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; }
      .lang-btn.de { background: #2563eb !important; }
      .lang-btn.active { background: #f59e0b !important; color: #111827 !important; }
      .flag-icon { width: 18px; height: 18px; border-radius: 3px; object-fit: cover; }
      .title { font-size: 14px; font-weight: 600; color: #6b7280; }
      .frame-wrap { height: calc(100vh - 64px); }
      iframe { width: 100%; height: 100%; border: 0; }
    </style>
  </head>
  <body>
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="title" id="preview-title">Invoice Preview</div>
      </div>
      <div class="toolbar-right">
        <button id="lang-en" class="lang-btn active">
          <img class="flag-icon" src="${britishFlag}" alt="EN" /> EN
        </button>
        <button id="lang-de" class="lang-btn de">
          <img class="flag-icon" src="${germanFlag}" alt="DE" /> DE
        </button>
        <button id="print-btn" class="btn-primary">Print now</button>
        <button id="download-btn" class="btn-secondary">Download</button>
          <button id="html-btn" class="btn-secondary">HTML view</button>
      </div>
    </div>
    <div class="frame-wrap">
      <iframe id="invoice-frame" src="${pdfUrl}"></iframe>
    </div>
    <script>
      const pdfUrl = "${pdfUrl}";
      const fileName = "${fileName}";
      const frame = document.getElementById('invoice-frame');
      const translations = {
        en: {
          title: "Invoice Preview",
          print: "Print now",
          download: "Download"
        },
        de: {
          title: "Rechnungsvorschau",
          print: "Jetzt drucken",
          download: "Herunterladen"
        }
      };
      let currentLang = "en";
      const titleEl = document.getElementById('preview-title');
      const printBtn = document.getElementById('print-btn');
      const downloadBtn = document.getElementById('download-btn');
      const htmlBtn = document.getElementById('html-btn');
      const langEn = document.getElementById('lang-en');
      const langDe = document.getElementById('lang-de');

      const applyLang = (lang) => {
        currentLang = lang;
        titleEl.textContent = translations[lang].title;
        printBtn.textContent = translations[lang].print;
        downloadBtn.textContent = translations[lang].download;
        langEn.classList.toggle('active', lang === 'en');
        langDe.classList.toggle('active', lang === 'de');
      };

      langEn.addEventListener('click', () => applyLang('en'));
      langDe.addEventListener('click', () => applyLang('de'));
      applyLang('en');

      htmlBtn.addEventListener('click', () => {
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(\`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice HTML View</title>
    <style>
      body { margin: 0; padding: 16px; font-family: 'Times New Roman', serif; background: #f5f5f5; }
      .toolbar { display: flex; justify-content: flex-end; gap: 8px; margin-bottom: 12px; }
      .toolbar button { padding: 8px 12px; border: 1px solid #d1d5db; background: #fff; border-radius: 6px; cursor: pointer; }
      .toolbar button:hover { background: #f3f4f6; }
      .page { background: #fff; margin: 0 auto; max-width: 900px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); padding: 12mm 18mm; }
    </style>
  </head>
  <body>
    <div class="toolbar">
      <button onclick="window.print()">Print</button>
    </div>
    <div class="page">${'${invoiceHtml}'}</div>
  </body>
</html>\`);
        win.document.close();
      });

      printBtn.addEventListener('click', () => {
        try {
          frame.contentWindow.focus();
          frame.contentWindow.print();
        } catch (err) {
          window.print();
        }
      });
      downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
      window.addEventListener('beforeunload', () => {
        URL.revokeObjectURL(pdfUrl);
      });
    </script>
  </body>
</html>`

      previewWindow.document.open()
      previewWindow.document.write(html)
      previewWindow.document.close()
    } catch (err) {
      console.error('Preview mode error:', err)
      pdf.save(`Invoice-${fileNameId}.pdf`)
    }
  } else if (mode === 'print') {
    // For print mode: create blob URL and open in new window for printing
    try {
      const pdfBlob = pdf.output('blob')
      const pdfUrl = URL.createObjectURL(pdfBlob)
      
      // Create iframe for more reliable printing
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = '0'
      iframe.src = pdfUrl
      document.body.appendChild(iframe)
      
      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow?.print()
            // Clean up after printing
            setTimeout(() => {
              document.body.removeChild(iframe)
              URL.revokeObjectURL(pdfUrl)
            }, 1000)
          } catch (err) {
            console.error('Print error:', err)
            // Fallback: open in new window
            const printWindow = window.open(pdfUrl, '_blank')
            if (printWindow) {
              setTimeout(() => printWindow.print(), 500)
            }
            document.body.removeChild(iframe)
            setTimeout(() => URL.revokeObjectURL(pdfUrl), 2000)
          }
        }, 500)
      }
      
      // Fallback timeout
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          try {
            iframe.contentWindow?.print()
            setTimeout(() => {
              document.body.removeChild(iframe)
              URL.revokeObjectURL(pdfUrl)
            }, 1000)
          } catch (err) {
            document.body.removeChild(iframe)
            URL.revokeObjectURL(pdfUrl)
            // Fallback to download
            pdf.save(`Invoice-${fileNameId}.pdf`)
          }
        }
      }, 3000)
    } catch (err) {
      console.error('Print mode error:', err)
      // Fallback to download
      pdf.save(`Invoice-${fileNameId}.pdf`)
    }
  } else {
    // For download mode: save PDF file
    pdf.save(`Invoice-${fileNameId}.pdf`)
  }

  document.body.removeChild(container)
}

export default generateBankTransferInvoicePdf
