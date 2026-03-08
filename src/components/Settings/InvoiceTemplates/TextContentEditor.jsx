import React from 'react'

export default function TextContentEditor({ templateData, updateTemplate }) {
  return (
    <div className="editor-section">
      <h3 className="section-title">Invoice Text Content</h3>
      <p className="section-description">
        Customize all static text blocks in your invoices. These fields support different agencies and legal wording requirements.
      </p>

      {/* Invoice Title */}
      <div className="form-group">
        <label>Invoice Title</label>
        <input
          type="text"
          value={templateData.invoice_title || ''}
          onChange={(e) => updateTemplate('invoice_title', e.target.value)}
          placeholder="e.g., BANKÜBERWEISUNG or BANK TRANSFER"
          className="form-input"
        />
        <p className="field-hint">Main title displayed at the top of the invoice</p>
      </div>

      {/* Ticket Platform Text */}
      <div className="form-group">
        <label>Ticket Platform Text</label>
        <input
          type="text"
          value={templateData.ticket_platform_text || ''}
          onChange={(e) => updateTemplate('ticket_platform_text', e.target.value)}
          placeholder="e.g., Ticket booking platforms:- IATA"
          className="form-input"
        />
        <p className="field-hint">Text describing the ticket booking platform (e.g., "Ticketbuchungsplattformen:- IATA")</p>
      </div>

      {/* Confirmation Paragraph */}
      <div className="form-group">
        <label>Confirmation Paragraph</label>
        <textarea
          value={templateData.confirmation_paragraph || ''}
          onChange={(e) => updateTemplate('confirmation_paragraph', e.target.value)}
          placeholder="I/We confirm that the details in my/our booking are correct..."
          className="form-textarea"
          rows="6"
        />
        <p className="field-hint">Legal confirmation text about booking details, visa requirements, cancellation fees, etc.</p>
      </div>

      {/* Tax Paragraph */}
      <div className="form-group">
        <label>Tax Paragraph</label>
        <textarea
          value={templateData.tax_paragraph || ''}
          onChange={(e) => updateTemplate('tax_paragraph', e.target.value)}
          placeholder="e.g., Tax-exempt brokerage service pursuant to § 3a para.2 UStG"
          className="form-textarea"
          rows="3"
        />
        <p className="field-hint">Tax exemption or legal text (e.g., "Steuerfreie Vermittlungsleistung gemäß § 3a Abs.2 UStG")</p>
      </div>

      {/* Signature Label */}
      <div className="form-group">
        <label>Signature Label</label>
        <input
          type="text"
          value={templateData.signature_label || ''}
          onChange={(e) => updateTemplate('signature_label', e.target.value)}
          placeholder="e.g., Signature: or Unterschrift:"
          className="form-input"
        />
        <p className="field-hint">Label text for the signature line</p>
      </div>

      {/* Divider */}
      <div className="section-divider"></div>

      {/* Reset Button */}
      <div className="form-group">
        <button 
          className="btn btn-secondary btn-full"
          onClick={() => {
            if (confirm('Reset all text content to default values?')) {
              updateTemplate('invoice_title', 'BANKÜBERWEISUNG')
              updateTemplate('ticket_platform_text', 'Ticketbuchungsplattformen:- IATA')
              updateTemplate('confirmation_paragraph', 'Ich/Wir bestätigen, dass die Angaben auf meiner/unserer Buchung korrekt sind, einschließlich Namen, Datum und weiterer Details. Zudem wurde ich/wurden wir über die Visumspflichten, Stornierungs- und Umbuchungsgebühren und alle Flugreisedetails umfassend aufgeklärt. Ich/Wir habe(n) die Bedingungen für die Buchung zur Kenntnis genommen und vollumfänglich verstanden und buche(n) verbindlich.')
              updateTemplate('tax_paragraph', 'Steuerfreie Vermittlungsleistung gemäß § 3a Abs.2 UStG')
              updateTemplate('signature_label', 'Unterschrift:')
            }
          }}
          type="button"
        >
          Reset to Default (German)
        </button>
      </div>

      {/* English Defaults Button */}
      <div className="form-group">
        <button 
          className="btn btn-secondary btn-full"
          onClick={() => {
            if (confirm('Set all text content to English defaults?')) {
              updateTemplate('invoice_title', 'BANK TRANSFER')
              updateTemplate('ticket_platform_text', 'Ticket booking platforms:- IATA')
              updateTemplate('confirmation_paragraph', 'I/We confirm that the details in my/our booking are correct, including names, dates, and other details. I/We have also been informed about visa requirements, cancellation and rebooking fees, and all flight details. I/We acknowledge and fully understand the booking conditions and confirm the booking.')
              updateTemplate('tax_paragraph', 'Tax-exempt brokerage service pursuant to § 3a para.2 UStG')
              updateTemplate('signature_label', 'Signature:')
            }
          }}
          type="button"
        >
          Set to English Defaults
        </button>
      </div>
    </div>
  )
}
