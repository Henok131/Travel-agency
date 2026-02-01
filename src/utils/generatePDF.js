import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { replaceInvoiceVariables } from './invoiceVariables'
import InvoicePreview from '../components/Settings/InvoiceTemplates/InvoicePreview'

// Translations (single language selection)
const tr = {
  de: {
    heading: 'BANKÜBERWEISUNG',
    invoiceNumber: 'Rechnungsnummer',
    date: 'Datum',
    departure: 'Abflug',
    return: 'Rückflug',
    airlines: 'Fluggesellschaften',
    passenger: 'Namen des Reisenden',
    ticket: 'Ticket',
    visa: 'Visum',
    hotel: 'Hotel',
    total: 'Gesamtbetrag',
    confirm: 'Ich/Wir bestätigen, dass die Angaben auf meiner/unserer Buchung korrekt sind, einschließlich Namen, Datum und weiterer Details. Zudem wurde ich/wurden wir über die Visumspflichten, Stornierungs- und Umbuchungsgebühren und alle Flugreisedetails umfassend aufgeklärt. Ich/Wir habe(n) die Bedingungen für die Buchung zur Kenntnis genommen und vollumfänglich verstanden und buche(n) verbindlich.',
    taxNote: 'Steuerfreie Vermittlungsleistung gemäß § 3a Abs.2 UStG'
  },
  en: {
    heading: 'BANK TRANSFER',
    invoiceNumber: 'Invoice Number',
    date: 'Date',
    departure: 'Departure',
    return: 'Return',
    airlines: 'Airlines',
    passenger: 'Passenger Name',
    ticket: 'Ticket',
    visa: 'Visa',
    hotel: 'Hotel',
    total: 'Total Amount',
    confirm: 'I/We confirm that the details in my/our booking are correct, including names, dates, and other details. I/We have also been informed about visa requirements, cancellation and rebooking fees, and all flight details. I/We acknowledge and fully understand the booking conditions and confirm the booking.',
    taxNote: 'Tax-exempt brokerage service pursuant to § 3a para.2 UStG'
  }
}

const t = (key, lang) => tr[lang]?.[key] || tr.de[key] || ''

/**
 * Generate PDF invoice from template and booking data
 * @param {Object} template - Invoice template data from database
 * @param {Object} booking - Booking data from main_table
 * @returns {Promise<void>}
 */
export async function generatePDF(template, booking, options = {}) {
  try {
    const { language = 'de', includeParagraph = false } = options
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

    const airlineName = formatAirlineDisplay(booking.airline_name || booking.airlines || 'N/A')

    // Create a temporary container for the invoice preview
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.top = '0'
    container.style.width = '210mm'
    container.style.background = 'white'
    document.body.appendChild(container)

    // Create a React-like structure for the invoice preview
    // We'll use the InvoicePreview component logic but render it directly
    const headerHTML = replaceInvoiceVariables(template.header_content || '', booking)
    const footerHTML = replaceInvoiceVariables(template.footer_content || '', booking)

    // Build the invoice HTML structure
    const invoiceHTML = `
      <div style="
        width: 210mm;
        min-height: 297mm;
        background: ${template.body_bg_color || 'white'};
        font-family: ${template.body_font_family || 'Arial, sans-serif'};
        font-size: ${template.body_font_size || 12}px;
        line-height: ${template.body_line_height || 1.6};
        color: ${template.body_text_color || '#000000'};
        font-weight: ${template.body_font_weight || '400'};
        letter-spacing: ${template.body_letter_spacing || 0}px;
        padding: ${template.page_margin_top || 40}px ${template.page_margin_right || 40}px ${template.page_margin_bottom || 40}px ${template.page_margin_left || 40}px;
      ">
        <!-- Header -->
        <div style="
          min-height: ${template.header_height || 120}px;
          background-color: ${template.header_bg_color || '#ffffff'};
          padding: ${template.header_padding_top || 20}px ${template.header_padding_right || 40}px ${template.header_padding_bottom || 20}px ${template.header_padding_left || 40}px;
          border-bottom: ${template.header_border_bottom 
            ? `${template.header_border_width || 1}px solid ${template.header_border_color || '#000000'}` 
            : 'none'};
          font-family: ${template.header_font_family || 'Arial, sans-serif'};
          font-size: ${template.header_font_size || 14}px;
          color: ${template.header_text_color || '#000000'};
          text-align: ${template.header_text_align || 'left'};
        ">
          ${template.header_logo_url ? `<img src="${template.header_logo_url}" alt="Logo" style="max-width: 200px; max-height: 100px; object-fit: contain; margin-bottom: 12px; display: block;" />` : ''}
          ${headerHTML}
        </div>

        <!-- Body -->
        <div style="
          padding: ${template.body_padding_top || 30}px ${template.body_padding_right || 40}px ${template.body_padding_bottom || 30}px ${template.body_padding_left || 40}px;
          font-size: ${template.body_font_size || 12}px;
          line-height: ${template.body_line_height || 1.6};
          color: ${template.body_text_color || '#000000'};
          background-color: ${template.body_bg_color || '#ffffff'};
        ">
          <p style="margin: 8px 0;"><strong>${t('invoiceNumber', language)}:</strong> ${booking.booking_id || 'N/A'}</p>
          <p style="margin: 8px 0;"><strong>${t('date', language)}:</strong> ${new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'de-DE')}</p>
          <p style="margin: 8px 0;"><strong>${t('heading', language)}</strong></p>
          <p style="margin: 8px 0;"><strong>${t('departure', language)}:</strong> ${booking.travel_date || 'N/A'} ${booking.departure_airport || ''}</p>
          <p style="margin: 8px 0;"><strong>${t('return', language)}:</strong> ${booking.return_date || 'N/A'} ${booking.destination_airport || ''}</p>
          <p style="margin: 8px 0;"><strong>${t('airlines', language)}:</strong> ${airlineName}</p>
          
          <table style="
            width: 100%;
            margin-top: ${template.section_spacing || 20}px;
            border-collapse: collapse;
            font-size: ${template.table_font_size || 11}px;
            border: ${template.table_border_width || 1}px solid ${template.table_border_color || '#000000'};
          ">
            <thead>
              <tr style="
                background-color: ${template.table_header_bg_color || '#000000'};
                color: ${template.table_header_text_color || '#ffffff'};
                font-weight: ${template.table_header_font_weight || '600'};
              ">
                <th style="
                  padding: ${template.table_cell_padding || 10}px;
                  border: ${template.table_border_width || 1}px solid ${template.table_border_color || '#000000'};
                  text-align: left;
                ">${t('passenger', language)}</th>
                <th style="
                  padding: ${template.table_cell_padding || 10}px;
                  border: ${template.table_border_width || 1}px solid ${template.table_border_color || '#000000'};
                  text-align: ${template.table_number_align || 'right'};
                ">${t('ticket', language)}</th>
                <th style="
                  padding: ${template.table_cell_padding || 10}px;
                  border: ${template.table_border_width || 1}px solid ${template.table_border_color || '#000000'};
                  text-align: ${template.table_number_align || 'right'};
                ">${t('visa', language)}</th>
                <th style="
                  padding: ${template.table_cell_padding || 10}px;
                  border: ${template.table_border_width || 1}px solid ${template.table_border_color || '#000000'};
                  text-align: ${template.table_number_align || 'right'};
                ">${t('hotel', language)}</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background-color: ${template.table_row_bg_color || '#ffffff'};">
                <td style="
                  padding: ${template.table_cell_padding || 10}px;
                  border: ${template.table_border_width || 1}px solid ${template.table_border_color || '#000000'};
                ">${[booking.first_name, booking.middle_name, booking.last_name].filter(Boolean).join(' ') || 'N/A'}</td>
                <td style="
                  padding: ${template.table_cell_padding || 10}px;
                  border: ${template.table_border_width || 1}px solid ${template.table_border_color || '#000000'};
                  text-align: ${template.table_number_align || 'right'};
                ">${(parseFloat(booking.total_ticket_price) || 0).toFixed(2)}</td>
                <td style="
                  padding: ${template.table_cell_padding || 10}px;
                  border: ${template.table_border_width || 1}px solid ${template.table_border_color || '#000000'};
                  text-align: ${template.table_number_align || 'right'};
                ">${(parseFloat(booking.tot_visa_fees) || 0).toFixed(2)}</td>
                <td style="
                  padding: ${template.table_cell_padding || 10}px;
                  border: ${template.table_border_width || 1}px solid ${template.table_border_color || '#000000'};
                  text-align: ${template.table_number_align || 'right'};
                ">${(parseFloat(booking.hotel_charges) || 0).toFixed(2) || '-'}</td>
              </tr>
              <tr style="
                background-color: ${template.table_total_bg_color || '#f1f5f9'};
                font-weight: ${template.table_total_font_weight || '700'};
              ">
                <td colspan="3" style="
                  padding: ${template.table_cell_padding || 10}px;
                  border: ${template.table_border_width || 1}px solid ${template.table_border_color || '#000000'};
                  text-align: right;
                "><strong>${t('total', language)}</strong></td>
                <td style="
                  padding: ${template.table_cell_padding || 10}px;
                  border: ${template.table_border_width || 1}px solid ${template.table_border_color || '#000000'};
                  text-align: ${template.table_number_align || 'right'};
                "><strong>${(parseFloat(booking.total_amount_due) || 0).toFixed(2)} €</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        ${includeParagraph ? `
        <div style="margin-top: ${template.section_spacing || 20}px; font-size: ${template.body_font_size || 12}px; line-height: ${template.body_line_height || 1.6};">
          <p style="margin: 8px 0;">${t('confirm', language)}</p>
          <p style="margin: 8px 0; font-weight: 600;">${t('taxNote', language)}</p>
        </div>
        ` : ''}

        <!-- Footer -->
        <div style="
          min-height: ${template.footer_height || 80}px;
          background-color: ${template.footer_bg_color || '#ffffff'};
          padding: ${template.footer_padding_top || 15}px ${template.footer_padding_right || 40}px ${template.footer_padding_bottom || 15}px ${template.footer_padding_left || 40}px;
          border-top: ${template.footer_border_top 
            ? `${template.footer_border_width || 1}px solid ${template.footer_border_color || '#e2e8f0'}` 
            : 'none'};
          font-family: ${template.footer_font_family || 'Arial, sans-serif'};
          font-size: ${template.footer_font_size || 10}px;
          color: ${template.footer_text_color || '#000000'};
          text-align: ${template.footer_text_align || 'center'};
          font-weight: ${template.footer_font_weight || '400'};
          line-height: ${template.footer_line_height || 1.6};
        ">
          ${footerHTML}
        </div>

        ${template.custom_css ? `<style>${template.custom_css}</style>` : ''}
      </div>
    `

    container.innerHTML = invoiceHTML

    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 500))

    // Generate canvas from the container
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794, // 210mm in pixels at 96 DPI
      height: 1123 // 297mm in pixels at 96 DPI
    })

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgData = canvas.toDataURL('image/png')
    
    // Calculate dimensions
    const pdfWidth = 210
    const pdfHeight = 297
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    const imgScaledWidth = imgWidth * ratio
    const imgScaledHeight = imgHeight * ratio
    
    // Center the image
    const xOffset = (pdfWidth - imgScaledWidth) / 2
    const yOffset = (pdfHeight - imgScaledHeight) / 2

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgScaledWidth, imgScaledHeight)
    
    // Generate filename
    const bookingId = booking.booking_id || booking.id || 'invoice'
    const date = new Date().toISOString().split('T')[0]
    pdf.save(`Invoice-${bookingId}-${date}.pdf`)

    // Clean up
    document.body.removeChild(container)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}
