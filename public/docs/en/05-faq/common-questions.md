# Common Questions (FAQ)

Frequently asked questions about LST Travel system.

---

## General Questions

### **Q1: How do I edit a booking?**

**A:** Click any cell in the Main Table to edit inline. Changes save automatically when you click away or press Enter. No "Save" button needed.

**Related:** [Quick Start Guide](../01-getting-started/quick-start.md)

---

### **Q2: Where can I see if a customer has paid?**

**A:** Check the "Payment Balance" column in the Main Table:
- **Green (€0.00):** Fully paid ✅
- **Red (negative):** Customer owes money ⚠️
- **Blue (positive):** Customer overpaid 💰

**Related:** [Financial Calculations](../02-financial/calculations.md#payment-balance)

---

### **Q3: How do I create a new booking?**

**A:** You have two options:
1. **Create Request:** Go to "Requests" → Click "Create New Request" → Fill form → Go to Main Table to add details
2. **Direct Entry:** Go to "Main Table" → Click any cell → Start typing

**Related:** [Quick Start Guide](../01-getting-started/quick-start.md#step-3-create-your-first-booking)

---

### **Q4: Can I undo changes?**

**A:** Changes save automatically. If you need to correct data:
- Edit the cell again with the correct value
- Contact your system administrator for data corrections
- Check the "Recycling Bin" in Settings to restore deleted items

---

### **Q5: How do I delete a booking?**

**A:** 
1. Go to Main Table
2. Find the booking row
3. Click the delete icon (trash can) in the row
4. Confirm deletion
5. Deleted items go to Recycling Bin (can be restored)

---

### **Q6: Can I export my data?**

**A:** Yes! Go to Settings → Export tab. You can export:
- All data (CSV, Excel, JSON)
- Specific sections (Requests, Bookings, Expenses)
- Date-filtered exports

---

### **Q7: How do I change the language?**

**A:** Go to Settings → Preferences tab → Select language (EN/DE). Changes apply immediately.

---

### **Q8: What does the orange highlight mean?**

**A:** The orange/yellow background indicates the "Total Amount Due" column. This is the total amount the customer needs to pay (ticket + visa fees).

**Related:** [Financial Calculations](../02-financial/calculations.md#total-amount-due)

---

### **Q9: How do I filter or search bookings?**

**A:** 
- **Search:** Use the search box at the top of Main Table (searches all fields)
- **Filter:** Use date filters or status dropdowns
- **Sort:** Click column headers to sort

---

### **Q10: Can I use this on mobile?**

**A:** Yes! The system is mobile-responsive. You can:
- View bookings on your phone
- Edit entries on tablets
- Access all features on mobile devices

---

## Financial Questions

### **Q11: How are totals calculated?**

**A:** All calculations are automatic:

- **Total Ticket Price** = Airlines Price + Service Ticket
- **Total Visa Fees** = Visa Price + Service Visa
- **Total Amount Due** = Total Ticket Price + Total Visa Fees
- **Total Customer Payment** = Cash Paid + Bank Transfer
- **Payment Balance** = Total Customer Payment - Total Amount Due
- **LST Profit** = Service Ticket + Service Visa + Commission - Loan Fee

**Related:** [Financial Calculations](../02-financial/calculations.md)

---

### **Q12: Why is my payment balance negative?**

**A:** A negative balance means the customer owes money. The amount shown is how much they still need to pay.

**Example:**
- Total Amount Due: €650.00
- Total Customer Payment: €500.00
- Payment Balance: -€150.00 (customer owes €150)

**Related:** [Payment Balance](../02-financial/calculations.md#payment-balance)

---

### **Q13: Can I enter partial payments?**

**A:** Yes! Enter payments as they come in:
- First payment: Enter in "Cash Paid" or "Bank Transfer"
- Second payment: Add to the same field or use the other payment method
- System automatically sums all payments

**Example:**
- Payment 1: €200 cash → Enter in "Cash Paid"
- Payment 2: €450 transfer → Enter in "Bank Transfer"
- Total: €650 (calculated automatically)

---

### **Q14: What if a customer overpays?**

**A:** The payment balance will show a positive amount (blue text). This indicates:
- Customer paid more than required
- You may need to issue a refund
- Amount shows how much to refund

**Example:**
- Total Amount Due: €650.00
- Total Customer Payment: €700.00
- Payment Balance: €50.00 (overpaid, refund €50)

---

### **Q15: How is profit calculated?**

**A:** LST Profit = Service Ticket + Service Visa + Commission from Airlines - Loan Fee

**Example:**
- Service Ticket: €50
- Service Visa: €20
- Commission: €30
- Loan Fee: €10
- **Profit: €90**

**Note:** Profit can be negative if loan fee exceeds income.

**Related:** [LST Profit](../02-financial/calculations.md#lst-profit)

---

### **Q16: Can I enter negative amounts?**

**A:** Yes, for certain fields:
- **Cash Paid / Bank Transfer:** Can be negative (for refunds)
- **Loan Fee:** Can be negative (for credits)
- **Payment Balance:** Can be negative (customer owes)

**Note:** Airlines Price and Service Ticket should be positive.

---

## Tax & VAT Questions

### **Q17: How is VAT calculated?**

**A:** VAT is calculated automatically when you enter expenses:

- **From Gross:** Net = Gross ÷ (1 + VAT Rate/100)
- **From Net:** Gross = Net × (1 + VAT Rate/100)
- **VAT Amount:** Gross - Net

**Example (19% VAT):**
- Gross: €119.00
- Net: €100.00
- VAT: €19.00

**Related:** [VAT Calculation](../03-tax/vat-calculation.md)

---

### **Q18: What VAT rates are supported?**

**A:** Standard German VAT rates:
- **19%** (default) - Most goods and services
- **7%** - Books, food, certain services
- **0%** - Exports, certain services

**Related:** [VAT Calculation](../03-tax/vat-calculation.md)

---

### **Q19: Why is Meal & Entertainment only 70% deductible?**

**A:** This is German tax law. Business meals and entertainment are considered partially personal expenses, so only 70% can be deducted from taxable income.

**Example:**
- Expense: €100 meal
- Deductible: €70 (70%)
- Non-deductible: €30 (30%)

**Related:** [SKR03 Categories](../03-tax/skr03-categories.md#70-deductible-rule)

---

### **Q20: What are SKR03 categories?**

**A:** SKR03 (Standardkontenrahmen 03) is the German standard chart of accounts. Each expense category has a code and deductible percentage for tax reporting.

**Example Categories:**
- 4920 - Office Rent (100% deductible)
- 6805 - Meal & Entertainment (70% deductible)
- 4960 - Software & Tools (100% deductible)

**Related:** [SKR03 Categories](../03-tax/skr03-categories.md)

---

## Technical Troubleshooting

### **Q21: Changes are not saving**

**A:** Try these steps:
1. Check your internet connection
2. Click away from the cell (blur event triggers save)
3. Refresh the page (Ctrl+R or Cmd+R)
4. Clear browser cache
5. Contact administrator if issue persists

---

### **Q22: Page is loading slowly**

**A:** 
1. Check your internet connection
2. Clear browser cache
3. Close other browser tabs
4. Try a different browser
5. Contact administrator if issue persists

---

### **Q23: I can't see all columns**

**A:** 
1. Use horizontal scroll (scroll bar at bottom)
2. Zoom out browser (Ctrl + -)
3. Resize browser window
4. Some columns may be hidden - check column visibility settings

---

### **Q24: Calculations are wrong**

**A:** 
1. Check that all input fields have correct values
2. Verify no NULL or empty values in calculation fields
3. Refresh the page to recalculate
4. Check [Financial Calculations](../02-financial/calculations.md) for formula details
5. Contact administrator if calculations still seem incorrect

---

### **Q25: I'm getting an error message**

**A:** 
1. Read the error message carefully
2. Check if you're missing required fields (marked with *)
3. Verify your data format (dates, numbers)
4. Try refreshing the page
5. Contact administrator with error details

---

### **Q26: Can't log in**

**A:**
1. Verify your username and password
2. Check if Caps Lock is on
3. Clear browser cache and cookies
4. Try a different browser
5. Contact your administrator for password reset

---

### **Q27: Data disappeared**

**A:**
1. Check if you're filtering the view (remove filters)
2. Check Recycling Bin in Settings
3. Verify you're logged into the correct organization
4. Contact administrator - data may be recoverable

---

### **Q28: Export is not working**

**A:**
1. Check if you have data to export
2. Try a different export format (CSV, Excel, JSON)
3. Check browser download settings
4. Try a different browser
5. Contact administrator if issue persists

---

## Data & Security Questions

### **Q29: Is my data secure?**

**A:** Yes! The system uses:
- Secure authentication (Supabase Auth)
- Encrypted connections (HTTPS)
- Row-level security (RLS) policies
- Organization-based data isolation

---

### **Q30: Can other organizations see my data?**

**A:** No. Each organization's data is completely isolated. You can only see data for your own organization.

---

### **Q31: How long is data stored?**

**A:** Data is stored indefinitely unless deleted. Deleted items go to Recycling Bin and can be restored for 30 days (configurable).

---

## Contact & Support

### **Need More Help?**

**Documentation:**
- [Quick Start Guide](../01-getting-started/quick-start.md)
- [Financial Calculations](../02-financial/calculations.md)
- [VAT Calculation](../03-tax/vat-calculation.md)
- [SKR03 Categories](../03-tax/skr03-categories.md)

**Support:**
- Contact your system administrator
- Check system status page (if available)
- Review error logs in browser console (F12)

---

**Last Updated:** 2026-01-25  
**Version:** 1.0
