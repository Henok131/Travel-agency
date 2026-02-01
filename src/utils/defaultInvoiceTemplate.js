// Default Invoice Template
// Matches the current LST Travel invoice design
// Used when creating a new user's first template

export const DEFAULT_INVOICE_TEMPLATE = {
  template_name: 'LST Travel Default',
  is_default: true,
  
  // Header - Matching your invoice
  header_content: `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 40px;">
      <div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #000000;">{{company_name}}</h1>
      </div>
      <div style="text-align: right; font-size: 12px; line-height: 1.6; color: #000000;">
        <strong>{{company_contact_person}}</strong><br>
        {{company_address}}<br>
        {{company_postal}}<br>
        Email: {{company_email}}<br>
        Tel: {{company_phone}}<br>
        Mob: {{company_mobile}}
      </div>
    </div>
  `,
  header_height: 120,
  header_bg_color: '#ffffff',
  header_padding_top: 20,
  header_padding_right: 40,
  header_padding_bottom: 20,
  header_padding_left: 40,
  header_font_family: 'Arial, sans-serif',
  header_font_size: 14,
  header_text_color: '#000000',
  header_text_align: 'left',
  header_border_bottom: false,
  header_border_color: '#000000',
  header_border_width: 1,
  
  // Body - Invoice content
  body_font_family: 'Arial, sans-serif',
  body_font_size: 12,
  body_line_height: 1.6,
  body_text_color: '#000000',
  body_bg_color: '#ffffff',
  body_padding_top: 30,
  body_padding_right: 40,
  body_padding_bottom: 30,
  body_padding_left: 40,
  body_font_weight: '400',
  body_letter_spacing: 0,
  
  // Footer - Matching your invoice
  footer_content: `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 15px 40px; font-size: 10px; line-height: 1.6;">
      <div style="color: #000000;">
        <strong>{{company_name}}</strong><br>
        UST-ID {{tax_id}}<br>
        {{website}}
      </div>
      <div style="text-align: center; color: #000000;">
        <strong>{{bank_account_holder}}</strong><br>
        {{bank_name}}<br>
        {{bank_iban}}<br>
        {{bank_bic}}
      </div>
    </div>
  `,
  footer_height: 80,
  footer_bg_color: '#ffffff',
  footer_padding_top: 15,
  footer_padding_right: 40,
  footer_padding_bottom: 15,
  footer_padding_left: 40,
  footer_font_family: 'Arial, sans-serif',
  footer_font_size: 10,
  footer_text_color: '#000000',
  footer_text_align: 'center',
  footer_font_weight: '400',
  footer_line_height: 1.6,
  footer_border_top: false,
  footer_border_color: '#e2e8f0',
  footer_border_width: 1,
  
  // Table styling - Matching your invoice
  table_header_bg_color: '#000000',
  table_header_text_color: '#ffffff',
  table_border_color: '#000000',
  table_border_width: 1,
  table_row_alternate_bg: '#f8f9fa',
  table_row_bg_color: '#ffffff',
  table_font_size: 11,
  table_cell_padding: 10,
  table_header_font_weight: '600',
  table_number_align: 'right',
  table_total_bg_color: '#f1f5f9',
  table_total_font_weight: '700',
  
  // Global styling
  primary_color: '#000000',
  secondary_color: '#666666',
  border_color: '#000000',
  accent_color: '#10b981',
  border_width: 1,
  border_radius: 0,
  
  // Layout
  page_margin_top: 40,
  page_margin_right: 40,
  page_margin_bottom: 40,
  page_margin_left: 40,
  section_spacing: 20,
  
  // Custom CSS for invoice body content
  custom_css: `
    .invoice-body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #000000;
    }
    
    .invoice-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .invoice-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border: 1px solid #000000;
    }
    
    .invoice-info-left,
    .invoice-info-right {
      flex: 1;
    }
    
    .invoice-info-label {
      font-weight: 600;
      margin-bottom: 5px;
    }
    
    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 11px;
    }
    
    .invoice-table th {
      background: #000000;
      color: #ffffff;
      padding: 10px;
      text-align: left;
      border: 1px solid #000000;
      font-weight: 600;
    }
    
    .invoice-table td {
      padding: 10px;
      border: 1px solid #000000;
      text-align: left;
    }
    
    .invoice-table tr:nth-child(even) {
      background: #f8f9fa;
    }
    
    .invoice-total {
      margin-top: 20px;
      padding: 15px;
      background: #f8f9fa;
      border: 1px solid #000000;
      text-align: right;
    }
    
    .invoice-total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    
    .invoice-total-label {
      font-weight: 600;
    }
    
    .invoice-total-value {
      font-weight: 600;
      font-size: 14px;
    }
    
    .invoice-payment-info {
      margin-top: 30px;
      padding: 15px;
      background: #f8f9fa;
      border: 1px solid #000000;
    }
    
    .invoice-payment-info h3 {
      margin-top: 0;
      font-size: 14px;
      font-weight: 600;
    }
    
    .invoice-notice {
      margin-top: 20px;
      padding: 15px;
      background: #fff3cd;
      border: 1px solid #ffc107;
      font-size: 11px;
    }
  `,

  // Word-like editor layout
  custom_elements: []
}

// Function to create default template for new user
export async function createDefaultTemplate(userId, supabase) {
  if (!userId) {
    return { data: null, error: new Error('User ID is required') }
  }
  
  const template = {
    ...DEFAULT_INVOICE_TEMPLATE,
    user_id: userId
  }
  
  try {
    const { data, error } = await supabase
      .from('invoice_templates')
      .insert(template)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating default template:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (err) {
    console.error('Exception creating default template:', err)
    return { data: null, error: err }
  }
}

// Function to get default template HTML body structure
export function getDefaultInvoiceBodyHTML() {
  return `
    <div class="invoice-body">
      <div class="invoice-title">RECHNUNG / INVOICE</div>
      
      <div class="invoice-info">
        <div class="invoice-info-left">
          <div class="invoice-info-label">Rechnungsnummer / Invoice Number:</div>
          <div>{{invoice_number}}</div>
          
          <div class="invoice-info-label" style="margin-top: 15px;">Rechnungsdatum / Invoice Date:</div>
          <div>{{invoice_date}}</div>
          
          <div class="invoice-info-label" style="margin-top: 15px;">Buchungsreferenz / Booking Reference:</div>
          <div>{{booking_reference}}</div>
        </div>
        
        <div class="invoice-info-right">
          <div class="invoice-info-label">Passagier / Passenger:</div>
          <div>{{passenger_full_name}}</div>
          
          <div class="invoice-info-label" style="margin-top: 15px;">Passport Number:</div>
          <div>{{passport_number}}</div>
          
          <div class="invoice-info-label" style="margin-top: 15px;">Nationality:</div>
          <div>{{nationality}}</div>
        </div>
      </div>
      
      <div class="invoice-info">
        <div class="invoice-info-left">
          <div class="invoice-info-label">Flugdetails / Flight Details:</div>
          <div>
            <strong>Abflug / Departure:</strong> {{departure_date}} von {{departure_airport}} ({{departure_city}})<br>
            <strong>Rückflug / Return:</strong> {{return_date}} nach {{destination_airport}} ({{destination_city}})<br>
            <strong>Airline:</strong> {{airlines}}<br>
            <strong>PNR:</strong> {{pnr}}
          </div>
        </div>
      </div>
      
      <table class="invoice-table">
        <thead>
          <tr>
            <th>Beschreibung / Description</th>
            <th style="text-align: right;">Betrag / Amount (EUR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Flugticket / Flight Ticket</td>
            <td style="text-align: right;">{{ticket_price}}</td>
          </tr>
          <tr>
            <td>Visagebühren / Visa Fees</td>
            <td style="text-align: right;">{{visa_fees}}</td>
          </tr>
          <tr>
            <td><strong>Gesamtbetrag / Total Amount</strong></td>
            <td style="text-align: right;"><strong>{{total_amount}}</strong></td>
          </tr>
        </tbody>
      </table>
      
      <div class="invoice-total">
        <div class="invoice-total-row">
          <span class="invoice-total-label">Gesamtbetrag / Total Amount:</span>
          <span class="invoice-total-value">{{total_amount}} EUR</span>
        </div>
        <div class="invoice-total-row">
          <span>Barzahlung / Cash Paid:</span>
          <span>{{cash_paid}} EUR</span>
        </div>
        <div class="invoice-total-row">
          <span>Banküberweisung / Bank Transfer:</span>
          <span>{{bank_transfer}} EUR</span>
        </div>
        <div class="invoice-total-row">
          <span class="invoice-total-label">Restbetrag / Balance:</span>
          <span class="invoice-total-value">{{payment_balance}} EUR</span>
        </div>
        <div class="invoice-total-row">
          <span class="invoice-total-label">Zahlungsstatus / Payment Status:</span>
          <span class="invoice-total-value">{{payment_status}}</span>
        </div>
      </div>
      
      <div class="invoice-payment-info">
        <h3>Zahlungsinformationen / Payment Information</h3>
        <p>
          <strong>Zahlungsmethode / Payment Method:</strong> {{payment_method}}<br>
          <strong>Bank:</strong> {{bank_name}}<br>
          <strong>IBAN:</strong> {{bank_iban}}<br>
          <strong>BIC:</strong> {{bank_bic}}
        </p>
      </div>
      
      {{#if notice}}
      <div class="invoice-notice">
        <strong>Hinweis / Notice:</strong><br>
        {{notice}}
      </div>
      {{/if}}
    </div>
  `
}
