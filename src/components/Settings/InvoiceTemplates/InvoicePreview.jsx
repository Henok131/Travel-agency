import { replaceInvoiceVariables } from '../../../utils/invoiceVariables'

export default function InvoicePreview({ templateData, bookingData }) {
  // Sample booking data if not provided
  const sampleBooking = bookingData || {
    booking_id: 'ABC123',
    first_name: 'Henok',
    middle_name: 'Asenay',
    last_name: 'Petros',
    passport_number: 'G4576879867',
    nationality: 'Eritrea',
    travel_date: '2026-01-22',
    return_date: '2026-01-31',
    departure_airport: 'FRA, Frankfurt Airport, Frankfurt',
    arrival_airport: 'HHN, Hahn Airport, Berlin',
    airline_name: 'Ethiopian Airlines (ET)',
    pnr: 'TBD',
    total_ticket_price: 12.00,
    tot_visa_fees: 11.00,
    hotel_charges: 0,
    total_amount_due: 23.00,
    cash_paid: 0,
    bank_transfer: 644,
    payment_balance: 'Fully Paid'
  }

  if (!templateData) {
    return <div className="preview-error">No template data provided</div>
  }

  // Use canvas HTML if available, otherwise use header/footer content
  const useCanvas = templateData.canvas_html && templateData.canvas_html.trim() !== ''
  const headerHTML = useCanvas ? '' : replaceInvoiceVariables(templateData.header_content || '', sampleBooking)
  const footerHTML = replaceInvoiceVariables(templateData.footer_content || '', sampleBooking)
  const canvasHTML = useCanvas ? replaceInvoiceVariables(templateData.canvas_html || '', sampleBooking) : ''

  // Calculate totals
  const ticketTotal = sampleBooking.total_ticket_price || 0
  const visaTotal = sampleBooking.tot_visa_fees || 0
  const hotelTotal = sampleBooking.hotel_charges || 0
  const grandTotal = ticketTotal + visaTotal + hotelTotal

  // If canvas HTML exists, use it for full-page layout
  if (useCanvas && canvasHTML) {
    return (
      <div className="invoice-preview-wrapper" style={{
        width: '210mm',
        height: '297mm',
        maxHeight: '297mm',
        background: templateData.body_bg_color || 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontFamily: templateData.body_font_family || 'Arial, sans-serif',
        fontSize: `${templateData.body_font_size || 12}px`,
        lineHeight: templateData.body_line_height || 1.6,
        color: templateData.body_text_color || '#000000',
        fontWeight: templateData.body_font_weight || '400',
        letterSpacing: `${templateData.body_letter_spacing || 0}px`,
        padding: `${templateData.page_margin_top || 40}px ${templateData.page_margin_right || 40}px ${templateData.page_margin_bottom || 40}px ${templateData.page_margin_left || 40}px`,
        border: '1px solid var(--border-color)',
        borderRadius: `${templateData.border_radius || 0}px`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }} dangerouslySetInnerHTML={{ __html: canvasHTML }} />
      </div>
    )
  }

  return (
    <div className="invoice-preview-wrapper" style={{
      width: '210mm',
      height: '297mm',
      maxHeight: '297mm',
      background: templateData.body_bg_color || 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      fontFamily: templateData.body_font_family || 'Arial, sans-serif',
      fontSize: `${templateData.body_font_size || 12}px`,
      lineHeight: templateData.body_line_height || 1.6,
      color: templateData.body_text_color || '#000000',
      fontWeight: templateData.body_font_weight || '400',
      letterSpacing: `${templateData.body_letter_spacing || 0}px`,
      padding: `${templateData.page_margin_top || 40}px ${templateData.page_margin_right || 40}px ${templateData.page_margin_bottom || 40}px ${templateData.page_margin_left || 40}px`,
      border: '1px solid var(--border-color)',
      borderRadius: `${templateData.border_radius || 0}px`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{
        minHeight: `${templateData.header_height ?? 120}px`,
        height: templateData.header_height === 0 ? 'auto' : `${templateData.header_height ?? 120}px`,
        overflow: templateData.header_height === 0 ? 'visible' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        backgroundColor: templateData.header_bg_color || '#ffffff',
        padding: `${templateData.header_padding_top || 20}px ${templateData.header_padding_right || 40}px ${templateData.header_padding_bottom || 20}px ${templateData.header_padding_left || 40}px`,
        borderBottom: templateData.header_border_bottom 
          ? `${templateData.header_border_width || 1}px solid ${templateData.header_border_color || '#000000'}` 
          : 'none',
        fontFamily: templateData.header_font_family || 'Arial, sans-serif',
        fontSize: `${templateData.header_font_size || 14}px`,
        color: templateData.header_text_color || '#000000',
        textAlign: templateData.header_text_align || 'left',
        boxSizing: 'border-box'
      }}>
        {templateData.header_logo_url && (
          <img 
            src={templateData.header_logo_url} 
            alt="Logo" 
            style={{ 
              maxWidth: '200px', 
              maxHeight: '100px', 
              objectFit: 'contain',
              marginBottom: templateData.header_content ? '12px' : '0',
              display: 'block'
            }} 
          />
        )}
        {headerHTML && (
          <div 
            dangerouslySetInnerHTML={{ __html: headerHTML }}
            style={{ flex: 1 }}
          />
        )}
      </div>

      {/* Body */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        minHeight: 0,
        padding: `${templateData.body_padding_top || 30}px ${templateData.body_padding_right || 40}px ${templateData.body_padding_bottom || 30}px ${templateData.body_padding_left || 40}px`,
        fontSize: `${templateData.body_font_size || 12}px`,
        lineHeight: templateData.body_line_height || 1.6,
        color: templateData.body_text_color || '#000000',
        backgroundColor: templateData.body_bg_color || '#ffffff',
        boxSizing: 'border-box'
      }}>
        <p style={{ margin: '8px 0' }}><strong>Rechnungsnummer:</strong> INV-2026-9710</p>
        <p style={{ margin: '8px 0' }}><strong>Datum:</strong> 13. Januar 26</p>
        <p style={{ margin: '8px 0' }}><strong>BANKÜBERWEISUNG</strong></p>
        <p style={{ margin: '8px 0' }}><strong>Abflug:</strong> 22. Januar 26 Hahn (HHN) - Berlin (BER)</p>
        <p style={{ margin: '8px 0' }}><strong>Rückflug:</strong> 31. Januar 26 Berlin (BER) - Hahn (HHN)</p>
        <p style={{ margin: '8px 0' }}><strong>Fluggesellschaften:</strong> (ET) Ethiopian Airlines</p>
        
        <table style={{
          width: '100%',
          marginTop: `${templateData.section_spacing || 20}px`,
          borderCollapse: 'collapse',
          fontSize: `${templateData.table_font_size || 11}px`,
          border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`
        }}>
          <thead>
            <tr style={{
              backgroundColor: templateData.table_header_bg_color || '#000000',
              color: templateData.table_header_text_color || '#ffffff',
              fontWeight: templateData.table_header_font_weight || '600'
            }}>
              <th style={{ 
                padding: `${templateData.table_cell_padding || 10}px`, 
                border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`, 
                textAlign: 'left' 
              }}>
                Namen des Reisenden
              </th>
              <th style={{ 
                padding: `${templateData.table_cell_padding || 10}px`, 
                border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`, 
                textAlign: templateData.table_number_align || 'right' 
              }}>
                Ticket
              </th>
              <th style={{ 
                padding: `${templateData.table_cell_padding || 10}px`, 
                border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`, 
                textAlign: templateData.table_number_align || 'right' 
              }}>
                Visum
              </th>
              <th style={{ 
                padding: `${templateData.table_cell_padding || 10}px`, 
                border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`, 
                textAlign: templateData.table_number_align || 'right' 
              }}>
                Hotel
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ backgroundColor: templateData.table_row_bg_color || '#ffffff' }}>
              <td style={{ 
                padding: `${templateData.table_cell_padding || 10}px`, 
                border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}` 
              }}>
                Henok Asenay k0622909 Petros
              </td>
              <td style={{ 
                padding: `${templateData.table_cell_padding || 10}px`, 
                border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`, 
                textAlign: templateData.table_number_align || 'right' 
              }}>
                12,00
              </td>
              <td style={{ 
                padding: `${templateData.table_cell_padding || 10}px`, 
                border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`, 
                textAlign: templateData.table_number_align || 'right' 
              }}>
                11,00
              </td>
              <td style={{ 
                padding: `${templateData.table_cell_padding || 10}px`, 
                border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`, 
                textAlign: templateData.table_number_align || 'right' 
              }}>
                -
              </td>
            </tr>
            <tr style={{ backgroundColor: templateData.table_row_alternate_bg || '#f8f9fa' }}>
              <td style={{ 
                padding: `${templateData.table_cell_padding || 10}px`, 
                border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}` 
              }}>
                {/* Empty row for spacing */}
              </td>
              <td style={{ 
                padding: `${templateData.table_cell_padding || 10}px`, 
                border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`, 
                textAlign: templateData.table_number_align || 'right' 
              }}>
                {/* Empty */}
              </td>
              <td style={{ 
                padding: `${templateData.table_cell_padding || 10}px`, 
                border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`, 
                textAlign: templateData.table_number_align || 'right' 
              }}>
                {/* Empty */}
              </td>
              <td style={{ 
                padding: `${templateData.table_cell_padding || 10}px`, 
                border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`, 
                textAlign: templateData.table_number_align || 'right' 
              }}>
                {/* Empty */}
              </td>
            </tr>
            <tr style={{ 
              backgroundColor: templateData.table_total_bg_color || '#f1f5f9',
              fontWeight: templateData.table_total_font_weight || '700'
            }}>
              <td 
                colSpan="3" 
                style={{ 
                  padding: `${templateData.table_cell_padding || 10}px`, 
                  border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`, 
                  textAlign: 'right' 
                }}
              >
                <strong>Gesamtbetrag</strong>
              </td>
              <td style={{ 
                padding: `${templateData.table_cell_padding || 10}px`, 
                border: `${templateData.table_border_width || 1}px solid ${templateData.table_border_color || '#000000'}`, 
                textAlign: templateData.table_number_align || 'right' 
              }}>
                <strong>23,00 €</strong>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Notice field from main table - displayed in red box, right-aligned below the table */}
        {sampleBooking.notice && sampleBooking.notice.trim() && (
          <div style={{
            marginTop: `${templateData.section_spacing || 20}px`,
            textAlign: 'right'
          }}>
            <div style={{
              display: 'inline-block',
              border: '2px solid #dc2626',
              padding: '8px 12px',
              color: '#dc2626',
              fontSize: `${Math.max((templateData.body_font_size || 12) + 4, 16)}px`,
              fontWeight: '500',
              lineHeight: templateData.body_line_height || 1.6,
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              textAlign: 'left',
              maxWidth: '60%'
            }}>
              {sampleBooking.notice}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        flexShrink: 0,
        height: `${templateData.footer_height ?? 80}px`,
        maxHeight: `${templateData.footer_height ?? 80}px`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        marginTop: `${templateData.footer_margin_top || 0}px`,
        backgroundColor: templateData.footer_bg_color || '#ffffff',
        padding: `${templateData.footer_padding_top || 15}px ${templateData.footer_padding_right || 40}px ${templateData.footer_padding_bottom || 15}px ${templateData.footer_padding_left || 40}px`,
        borderTop: templateData.footer_border_top 
          ? `${templateData.footer_border_width || 1}px solid ${templateData.footer_border_color || '#e2e8f0'}` 
          : 'none',
        fontFamily: templateData.footer_font_family || 'Arial, sans-serif',
        fontSize: `${templateData.footer_font_size || 10}px`,
        color: templateData.footer_text_color || '#000000',
        textAlign: templateData.footer_text_align || 'center',
        fontWeight: templateData.footer_font_weight || '400',
        lineHeight: templateData.footer_line_height || 1.6,
        boxSizing: 'border-box'
      }}>
        <div dangerouslySetInnerHTML={{ __html: footerHTML }} />
      </div>

      {/* Custom CSS - Apply via style tag in wrapper */}
      {templateData.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: templateData.custom_css }} />
      )}
    </div>
  )
}
