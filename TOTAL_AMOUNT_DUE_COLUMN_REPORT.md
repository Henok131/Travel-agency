# TOTAL AMOUNT DUE Column - Status Report

**Generated:** 2026-01-19  
**Column Field Name:** `total_amount_due`  
**Column Display Name:** "Total Amount Due"  
**Status:** ✅ **CRITICAL COLUMN - BLUE HIGHLIGHTING IMPLEMENTED**

---

## 📊 COLUMN OVERVIEW

### **Basic Information**
- **Position in Column Order:** Index 18 (19th column, 0-indexed)
- **Data Type:** `NUMERIC(10,2)`
- **Editable:** ❌ **AUTO-CALCULATED** (Read-only)
- **Category:** Financial
- **Default Width:** 150px

### **Calculation Formula**
```
total_amount_due = total_ticket_price + tot_visa_fees
```

Where:
- `total_ticket_price` = `service_fee + airlines_price` (also auto-calculated)
- `tot_visa_fees` = `visa_price + service_visa` (also auto-calculated)

### **Dependencies**
This column automatically recalculates when any of these fields change:
- `service_fee`
- `airlines_price`
- `visa_price`
- `service_visa`
- `total_ticket_price` (indirect)
- `tot_visa_fees` (indirect)

---

## 🎨 VISUAL STYLING

### **Current Implementation Status: ✅ ACTIVE**

The `total_amount_due` column has been configured with **blue background highlighting** to emphasize its critical importance in financial tracking.

### **Styling Details:**
- **Background Color:** `#2196F3` (Material Design Blue)
- **Text Color:** `#FFFFFF` (White)
- **Font Weight:** `bold`
- **Visual Priority:** **HIGH** - Stands out from other read-only columns

### **Implementation Methods (Multi-Layer Approach):**

1. **CSS Rules** (`RequestsList.css`)
   - High-specificity selectors with `!important` flags
   - Targets both class names and data attributes
   - Located at end of CSS file for maximum priority

2. **Inline Styles (React)**
   - Direct inline styles on both `<td>` and inner `<div>` elements
   - Applied during component rendering

3. **DOM Manipulation (useEffect)**
   - Direct DOM manipulation using `setProperty` with `'important'` flag
   - Multiple selector strategies (class, data attributes, column index)
   - MutationObserver watches for DOM changes
   - Multiple timeouts (50ms, 100ms, 300ms, 500ms, 1000ms, 2000ms) to catch dynamic content

4. **Inline Style Tag**
   - Style tag directly in component JSX
   - Ensures styles are available immediately

### **CSS Classes Applied:**
- `td-total-amount-due` - Applied to the `<td>` element
- `excel-cell-total-amount-due` - Applied to the inner `<div>` element
- `excel-cell-readonly` - Also applied (read-only indicator)

### **Data Attributes:**
- `data-field="total_amount_due"` - Field identifier
- `data-is-total-amount-due="true"` - Boolean flag for styling

---

## 🔧 TECHNICAL IMPLEMENTATION

### **Rendering Logic** (`renderCell` function)

```javascript
if (field === 'total_amount_due') {
  // Real-time calculation with live editing support
  let ticketPrice = parseFloat(request.total_ticket_price) || 0
  let visaFees = parseFloat(request.tot_visa_fees) || 0
  
  // If editing component fields, recalculate in real-time
  if (editingCell && editingCell.rowId === request.id) {
    // Recalculate based on current edit values
  }
  
  const totalDue = ticketPrice + visaFees
  const cellStyle = { 
    backgroundColor: '#2196F3', 
    color: '#fff', 
    cursor: 'default', 
    fontWeight: 'bold' 
  }
  
  return (
    <div className="excel-cell excel-cell-readonly excel-cell-total-amount-due" 
         style={cellStyle}>
      {totalDue !== 0 ? totalDue.toFixed(2) : '-'}
    </div>
  )
}
```

### **Auto-Calculation on Save**

When related fields are saved, `total_amount_due` is automatically recalculated and updated in the database:

```javascript
// Auto-calculate total_amount_due when total_ticket_price or tot_visa_fees changes
if (field === 'service_fee' || field === 'airlines_price' || 
    field === 'visa_price' || field === 'service_visa' ||
    field === 'total_ticket_price' || field === 'tot_visa_fees') {
  const totalDue = (ticketPrice || 0) + (visaFees || 0)
  updated.total_amount_due = totalDue !== 0 ? totalDue : null
}
```

---

## 📋 COLUMN POSITION IN TABLE

### **Column Order Context:**
```
... (previous columns) ...
18. total_ticket_price
19. visa_price
20. service_visa
21. tot_visa_fees
22. total_amount_due  ← THIS COLUMN (Index 18 in array)
23. cash_paid
24. bank_transfer
25. total_customer_payment
26. payment_balance
... (following columns) ...
```

### **Logical Grouping:**
The column is positioned:
- **After:** All cost components (ticket prices, visa fees)
- **Before:** Payment information (cash paid, bank transfer, customer payment, balance)

This placement makes logical sense as it shows the **total amount the customer owes** before showing what they've actually paid.

---

## 💡 BUSINESS LOGIC

### **Purpose:**
The `total_amount_due` column represents the **total amount the customer must pay** for their travel booking, including:
- Ticket costs (airline price + service fee)
- Visa costs (visa price + visa service fee)

### **Usage in Payment Balance:**
This column is used to calculate the `payment_balance`:
```
payment_balance = total_customer_payment - total_amount_due
```

Where:
- `payment_balance = 0` → ✅ Fully Paid (Green)
- `payment_balance > 0` → ⚠️ Overpaid (Yellow)
- `payment_balance < 0` → 🔴 Underpaid (Red)

### **Display Format:**
- **Non-zero values:** Displayed with 2 decimal places (e.g., "1008.00")
- **Zero/null values:** Displayed as "-" (dash)

---

## 🐛 DEBUGGING & TROUBLESHOOTING

### **Debug Logging:**
The implementation includes comprehensive debug logging:
- Column index detection
- Cell finding by multiple selectors
- DOM structure inspection if cells not found
- Computed style verification after styling

### **Console Debug Messages:**
When the page loads, check the browser console for:
- `[DEBUG] total_amount_due column index: X`
- `[DEBUG] Applying total_amount_due styles: { byClass: X, byDataAttr: X, ... }`
- `[DEBUG] Styling cell X/Y`
- `[DEBUG] Found inner div for cell X`
- `[DEBUG] After styling cell X, computed background: rgb(...)`

### **If Blue Background Not Showing:**
1. Check browser console for debug messages
2. Verify cells are being found (should show count > 0)
3. Inspect element - check if styles are applied
4. Hard refresh browser (Ctrl+F5) to clear cache
5. Check if CSS file is loading correctly
6. Verify columnOrder includes 'total_amount_due'

---

## ✅ VERIFICATION CHECKLIST

- [x] Column appears in table
- [x] Auto-calculation works correctly
- [x] Real-time updates when editing component fields
- [x] Blue background styling implemented
- [x] White bold text applied
- [x] Multiple styling methods for reliability
- [x] DOM manipulation for dynamic content
- [x] CSS rules with high specificity
- [x] Inline styles as fallback
- [x] Debug logging for troubleshooting

---

## 📝 NOTES

1. **Importance:** This column is critical for financial tracking and payment reconciliation
2. **Visual Distinction:** Blue highlighting makes it immediately identifiable
3. **Read-Only:** Users cannot directly edit this field (auto-calculated)
4. **Real-Time:** Updates immediately when component fields are edited
5. **Database Sync:** Automatically saved when related fields change

---

## 🔄 RELATED COLUMNS

- **Input Fields (affect calculation):**
  - `airlines_price`
  - `service_fee`
  - `visa_price`
  - `service_visa`

- **Calculated Fields (used in calculation):**
  - `total_ticket_price` = `service_fee + airlines_price`
  - `tot_visa_fees` = `visa_price + service_visa`

- **Dependent Fields (use this value):**
  - `payment_balance` = `total_customer_payment - total_amount_due`

---

**End of Report**
