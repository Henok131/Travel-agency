# Invoice Generation - Short Report

## Overview
The LST Travel system generates professional invoices for bookings from the `main_table` database.

## How It Works

### 1. **Access Point**
- **Location:** Main Table → Invoice column (action button)
- **Route:** `/invoice/:bookingId`
- **Component:** `src/components/Invoice/InvoiceTemplate.jsx`

### 2. **Invoice Generation Process**

**Step 1: Data Fetching**
- Fetches booking data from `main_table` using booking ID
- Retrieves all booking details (passenger, travel dates, prices, payment info)

**Step 2: Invoice Number Generation**
- **Format:** `INV-YYYY-XXXX`
- **Example:** `INV-2026-A1B2`
- Generated deterministically from booking ID and creation date
- Ensures unique, consistent invoice numbers

**Step 3: Data Mapping**
- **Passenger Name:** `first_name + middle_name + last_name`
- **Travel Dates:** `travel_date` (departure), `return_date` (return)
- **Airlines:** Formatted with airline codes (ET, TK, LH, EK)
- **Ticket Price:** `total_ticket_price`
- **Visa Fees:** `tot_visa_fees`
- **Total Amount:** `total_amount_due`
- **Payment Method:** Bank Transfer or Cash Payment

**Step 4: Formatting**
- **Dates:** German format (DD. Month YY) or English (DD Month YY)
- **Currency:** German format (780,00) with comma decimal separator
- **Airports:** City name with code (e.g., "Frankfurt am Main (FRA)")

### 3. **Features**

✅ **Bilingual Support**
- German (default) and English language options
- Language toggle with flag icons

✅ **Print Optimization**
- A4 size layout
- Print-friendly CSS styling
- Print button triggers browser print dialog

✅ **QR Code Integration**
- QR code displayed on invoice
- Contains booking reference information

✅ **Payment Information**
- Payment method display (Bank Transfer/Cash)
- Payment confirmation text
- Bank account details

✅ **Travel Details**
- Departure and return flight information
- Airline details with codes
- Airport codes and city names
- PNR/RFN booking references

### 4. **Invoice Sections**

1. **Header**
   - Company logo
   - Invoice number and date
   - Language selector

2. **Passenger Information**
   - Full name
   - Travel dates (departure/return)
   - Airlines

3. **Financial Details**
   - Ticket price breakdown
   - Visa fees
   - Hotel charges (if applicable)
   - Total amount due

4. **Payment Information**
   - Payment method
   - Bank transfer details
   - Payment confirmation

5. **Terms & Conditions**
   - Booking confirmation text
   - Visa requirements notice
   - Cancellation/rebooking fees notice
   - Signature field

6. **Footer**
   - QR code
   - Company contact information
   - Print/Download buttons

### 5. **Technical Details**

**Data Source:** `main_table` (Supabase)
**Template:** React component with CSS styling
**Print Method:** Browser print dialog (`window.print()`)
**Download:** Currently uses print dialog (PDF generation recommended for future)

### 6. **Current Limitations**

⚠️ **Download Functionality**
- Download button currently calls `window.print()` instead of generating PDF
- Recommendation: Implement PDF generation using libraries like `jsPDF` or `react-pdf`

⚠️ **Invoice Storage**
- Invoices are generated on-demand, not stored in database
- No invoice history tracking
- Recommendation: Create `invoices` table to store generated invoices

### 7. **Usage Flow**

```
Main Table → Click Invoice Button → Navigate to /invoice/:bookingId 
→ Fetch Booking Data → Generate Invoice → Display → Print/Download
```

## Summary

The invoice generation system is **production-ready** and provides:
- ✅ Professional invoice layout
- ✅ Bilingual support (DE/EN)
- ✅ Accurate data mapping from bookings
- ✅ Print-optimized design
- ✅ QR code integration

**Recommendations for Enhancement:**
1. Add PDF download functionality
2. Store invoices in database for history
3. Add invoice numbering sequence management
4. Implement invoice email sending

---

**Last Updated:** January 2026  
**Status:** ✅ Production Ready
