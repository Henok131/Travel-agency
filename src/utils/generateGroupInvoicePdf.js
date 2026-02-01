import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import QRCode from 'qrcode'
import britishFlag from '../assets/British.png'
import germanFlag from '../assets/Germany.png'

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

const normalizeSettings = (settings) => ({
  ...DEFAULT_SETTINGS,
  ...(settings || {})
})

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

// Format date in German format: "DD. Month YY"
// Example: "2026-01-22" → "22. Januar 26"
const formatGermanDate = (dateString) => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    
    const day = date.getDate()
    const monthNames = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ]
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear().toString().slice(-2)
    
    return `${day}. ${month} ${year}`
  } catch (err) {
    return dateString
  }
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

// Format airline display to "Name (CODE)" regardless of input order/format
const formatAirlineDisplay = (raw) => {
  if (!raw) return ''
  const cleaned = String(raw).trim().replace(/\s+/g, ' ')

  const paren = cleaned.match(/\(([A-Za-z0-9]{2,3})\)/)
  if (paren) {
    const code = paren[1].toUpperCase()
    const name = cleaned.replace(/\([^)]+\)/, '').trim()
    if (name) return `${name} (${code})`
    return `${cleaned.replace(/\s*\([^)]+\)/, '').trim()} (${code})`
  }

  const tokens = cleaned.split(' ')
  const codePattern = /^[A-Z0-9]{2,3}$/

  if (tokens.length > 1 && codePattern.test(tokens[0])) {
    const code = tokens[0].toUpperCase()
    const name = tokens.slice(1).join(' ')
    return `${name} (${code})`
  }

  if (tokens.length > 1 && codePattern.test(tokens[tokens.length - 1])) {
    const code = tokens[tokens.length - 1].toUpperCase()
    const name = tokens.slice(0, -1).join(' ')
    return `${name} (${code})`
  }

  return cleaned
}

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

export async function generateGroupInvoicePdf(bookings, settings, mode = 'download', language = 'de', includeParagraph = false) {
  const firstBooking = bookings[0] // Use for header info (dates, airline, PNR)
  const safeSettings = normalizeSettings(settings)
  const includeQr = safeSettings.include_qr !== false

  const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`

  const locale = language === 'en' ? 'en-US' : 'de-DE'
  const dateString = new Date().toLocaleDateString(locale)
  const passengerName = [firstBooking.first_name, firstBooking.last_name].filter(Boolean).join(' ').trim()
  const passengerRowName = [
    passengerName,
    firstBooking.passport_number
  ].filter(Boolean).join(' ')

  const departureAirport = firstBooking.departure_airport || ''
  const arrivalAirport = firstBooking.arrival_airport || firstBooking.destination_airport || ''
  const airlineName = formatAirlineDisplay(firstBooking.airline_name || firstBooking.airlines || '')
  const pnrValue = firstBooking.pnr || firstBooking.booking_ref || 'TBD'
  
  // Parse airports
  const departureParsed = parseAirport(departureAirport)
  const arrivalParsed = parseAirport(arrivalAirport)
  
  // Format dates
  const travelDateFormatted = formatGermanDate(firstBooking.travel_date)
  const returnDateFormatted = formatGermanDate(firstBooking.return_date)
  
  // Format airport display: "City (CODE)"
  const departureDisplay = departureParsed.city && departureParsed.code 
    ? `${departureParsed.city} (${departureParsed.code})`
    : departureAirport || ''
  const arrivalDisplay = arrivalParsed.city && arrivalParsed.code
    ? `${arrivalParsed.city} (${arrivalParsed.code})`
    : arrivalAirport || ''
  
  // For return flight, swap departure and arrival
  const returnDepartureDisplay = arrivalDisplay
  const returnArrivalDisplay = departureDisplay

  const ticketValue = formatAmount(firstBooking.total_ticket_price || 0)
  const visaValue = formatAmount(firstBooking.tot_visa_fees || 0)
  const hotelRaw = Number(firstBooking.hotel_charges || 0)
  const hotelValue = hotelRaw > 0 ? formatAmount(hotelRaw) : ''
  const totalValue = formatAmount(firstBooking.total_amount_due || 0)

  // Calculate totals for all bookings
  const totalTicket = bookings.reduce((sum, b) => sum + (parseFloat(b.total_ticket_price) || 0), 0)
  const totalVisa = bookings.reduce((sum, b) => sum + (parseFloat(b.tot_visa_fees) || 0), 0)
  const totalHotel = bookings.reduce((sum, b) => sum + (parseFloat(b.hotel_charges) || 0), 0)
  const grandTotal = totalTicket + totalVisa + totalHotel
  
  // Get notice from first booking (or check if all bookings have the same notice) and escape HTML
  const noticeText = firstBooking.notice && firstBooking.notice.trim() ? escapeHtml(firstBooking.notice.trim()) : null

  const tableMarginTop = includeQr ? '24mm' : '8mm'
  const afterTableMarginTop = '4mm'
  const noticeMarginTop = '2mm'
  const noticeMarginBottom = '2mm'
  const signatureMarginTop = '20mm'
  const footerMarginTop = '12mm'

  const rowsPerPage = 8
  const pages = []
  for (let i = 0; i < bookings.length; i += rowsPerPage) {
    pages.push(bookings.slice(i, i + rowsPerPage))
  }

  // Generate QR code WITHOUT logo - add directly to PDF to bypass html2canvas degradation
  const bookingId = firstBooking.id || firstBooking.booking_id || ''
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

  const buildInvoiceHTML = (pageBookings, isLastPage) => {
    // Notice section - displayed in red box, right-aligned below the table
    const noticeSectionHTML = isLastPage && noticeText
      ? `<div style="margin-top: ${noticeMarginTop}; margin-bottom: ${noticeMarginBottom}; text-align: right;">
          <div style="display: inline-block; border: 2px solid #dc2626; padding: 8px 12px; font-size: 16px; font-weight: 500; color: #dc2626; white-space: pre-wrap; word-wrap: break-word; text-align: left; max-width: 60%;">${noticeText}</div>
        </div>`
      : ''
    const footerLockedHTML = isLastPage
      ? `
      <div style="margin-top: ${afterTableMarginTop}; font-size: 14px; line-height: 1.6;">
        <div style="margin-bottom: 6mm;"><strong>${t('platform', language)}</strong> ${t('platformValue', language)}</div>
        
        ${includeParagraph ? `
        <div style="margin-bottom: 6mm; text-align: justify;">
          <div>${t('confirm', language)}</div>
        </div>` : ''}
        
        <div style="margin-top: ${afterTableMarginTop};">
          <div style="font-weight: bold;">${t('taxNote', language)}</div>
        </div>
      </div>

      <div style="margin-top: ${signatureMarginTop}; text-align: right; font-size: 14px;">
        <div style="font-weight: bold;">
          ${t('signature', language)}<span style="border-bottom: 1px solid #000; display: inline-block; width: 70mm; margin-left: 4px; vertical-align: middle; height: 1em;"></span>
        </div>
      </div>

      <div style="margin-top: ${footerMarginTop}; border-top: 1px solid #000; padding-top: 6mm; font-size: 13px;">
        <div style="display: flex; justify-content: space-between; gap: 12px;">
          <div style="flex: 1;">
            <div>${safeSettings.company_name || 'LST Travel Agency'}</div>
            <div>UST-ID ${safeSettings.tax_id || 'DE340914297'}</div>
            <div>${safeSettings.website || 'www.lsttravel.de'}</div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div>Geschäftsinhaberin / Proprietor</div>
            <div>${safeSettings.contact_person || 'Yodli Hagos Mebratu'}</div>
          </div>
          <div style="flex: 1; text-align: right;">
            <div>Bankverbindung / Bank Details</div>
            <div>${safeSettings.bank_name || 'Commerzbank AG'}</div>
            <div>${safeSettings.iban || 'DE28 5134 0013 0185 3597 00'}</div>
            <div>${safeSettings.bic || 'COBADEFFXXX'}</div>
          </div>
        </div>
      </div>
      `
      : ''

    return `
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
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="width: 45%;">
          ${safeSettings.logo_url ? `<img src="${safeSettings.logo_url}" alt="Logo" style="max-width: 140px; max-height: 60px; object-fit: contain; display: block; margin-bottom: 4px;" />` : ''}
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

        <div style="margin-top: 8mm; font-size: 14px; line-height: 1.8;">
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
          ${pageBookings.map(booking => {
            const name = [booking.first_name, booking.middle_name, booking.last_name]
              .filter(Boolean)
              .join(' ')
            const ticket = (parseFloat(booking.total_ticket_price) || 0).toFixed(2)
            const visa = (parseFloat(booking.tot_visa_fees) || 0).toFixed(2)
            const hotel = (parseFloat(booking.hotel_charges) || 0).toFixed(2)
            
            return `
              <tr>
                <td style="border: 1px solid #000; padding: 8px;">${name}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: right;">${ticket}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: right;">${visa}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: right;">${hotel || ''}</td>
              </tr>
            `
          }).join('')}
          ${isLastPage ? `
          <tr>
            <td style="border: 1px solid #000; padding: 8px; font-weight: bold;">${t('total', language)}</td>
            <td style="border: 1px solid #000; padding: 8px;"></td>
            <td style="border: 1px solid #000; padding: 8px;"></td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">${grandTotal.toFixed(2)} €</td>
          </tr>
          ` : ''}
        </tbody>
      </table>

      ${noticeSectionHTML}
      <div style="flex: 1; display: flex; flex-direction: column; margin-top: ${afterTableMarginTop};">
        <div style="flex: 1;"></div>
        ${footerLockedHTML}
      </div>
    </div>
  `
  }

  const pdf = new jsPDF('p', 'mm', 'a4')

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
    const pageBookings = pages[pageIndex]
    const isLastPage = pageIndex === pages.length - 1
    container.innerHTML = buildInvoiceHTML(pageBookings, isLastPage)

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

    if (pageIndex > 0) {
      pdf.addPage()
    }

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
  }

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

  const fileNameId = firstBooking.booking_ref || Date.now()
  
  if (mode === 'preview') {
    try {
      const pdfBlob = pdf.output('blob')
      const pdfUrl = URL.createObjectURL(pdfBlob)
      const previewWindow = window.open('', '_blank')

      if (!previewWindow) {
        pdf.save(`Group-Invoice-${fileNameId}.pdf`)
        document.body.removeChild(container)
        return
      }

      const fileName = `Group-Invoice-${fileNameId}.pdf`
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
      pdf.save(`Group-Invoice-${fileNameId}.pdf`)
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
            pdf.save(`Group-Invoice-${fileNameId}.pdf`)
          }
        }
      }, 3000)
    } catch (err) {
      console.error('Print mode error:', err)
      // Fallback to download
      pdf.save(`Group-Invoice-${fileNameId}.pdf`)
    }
  } else {
    // For download mode: save PDF file
    pdf.save(`Group-Invoice-${fileNameId}.pdf`)
  }

  document.body.removeChild(container)
}

export default generateGroupInvoicePdf
