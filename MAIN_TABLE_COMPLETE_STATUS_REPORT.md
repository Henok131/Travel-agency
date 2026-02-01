# Main Table Feature - Complete Status Report

**Generated:** 2026-01-20  
**Component:** `src/pages/MainTable.jsx`  
**Status:** ✅ **FULLY IMPLEMENTED & PRODUCTION READY**

---

## 📊 EXECUTIVE SUMMARY

The Main Table is a comprehensive booking management system for LST Travel with Excel-like inline editing, real-time financial calculations, invoice generation, and full booking lifecycle management.

**Key Features:**
- ✅ Excel-like inline editing with keyboard navigation
- ✅ Real-time financial calculations (6 auto-calculated fields)
- ✅ Invoice generation with PDF template
- ✅ Monthly grouping and filtering
- ✅ Bilingual support (EN/DE)
- ✅ Column resizing and auto-fit
- ✅ Payment tracking and balance calculation

---

## 🗄️ DATABASE STRUCTURE

### **Table: `main_table`**

**Total Columns:** 30 (including system fields)

#### **Passenger Information Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | ✅ | Primary key (auto-generated) |
| `first_name` | TEXT | ✅ | Passenger first name |
| `middle_name` | TEXT | ❌ | Passenger middle name (optional) |
| `last_name` | TEXT | ✅ | Passenger last name |
| `date_of_birth` | DATE | ❌ | Date of birth (DD-MM-YYYY) |
| `gender` | TEXT | ❌ | Gender (M, F, Other) |
| `nationality` | TEXT | ❌ | Passenger nationality |
| `passport_number` | TEXT | ❌ | Passport/document number |

#### **Travel Information Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `departure_airport` | TEXT | ❌ | Departure airport code/name |
| `destination_airport` | TEXT | ❌ | Destination airport code/name |
| `travel_date` | DATE | ❌ | Travel date (DD-MM-YYYY) |
| `return_date` | DATE | ❌ | Return date (DD-MM-YYYY) |
| `request_types` | JSONB | ✅ | Array: ["flight", "visa", "package", "other"] |
| `airlines` | TEXT | ❌ | Airline name or code |

#### **Booking Management Fields:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `booking_ref` | TEXT | ❌ | NULL | Booking reference number |
| `booking_status` | TEXT | ✅ | 'pending' | pending, confirmed, cancelled |
| `status` | TEXT | ✅ | 'draft' | draft, submitted, cancelled |
| `print_invoice` | BOOLEAN | ✅ | false | Flag to print invoice |
| `notice` | TEXT | ❌ | NULL | Additional notes/comments |

#### **Financial Fields (Ticket):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `airlines_price` | NUMERIC(10,2) | ❌ | Base airline ticket price |
| `service_fee` | NUMERIC(10,2) | ❌ | Service fee for ticket |
| `total_ticket_price` | NUMERIC(10,2) | ❌ | **Auto-calculated:** airlines_price + service_fee |

#### **Financial Fields (Visa):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `visa_price` | NUMERIC(10,2) | ❌ | Base visa price |
| `service_visa` | NUMERIC(10,2) | ❌ | Service fee for visa |
| `tot_visa_fees` | NUMERIC(10,2) | ❌ | **Auto-calculated:** visa_price + service_visa |

#### **Financial Fields (Payment):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `cash_paid` | NUMERIC(10,2) | ❌ | Amount paid in cash |
| `bank_transfer` | NUMERIC(10,2) | ❌ | Amount paid via bank transfer |
| `total_customer_payment` | NUMERIC(10,2) | ❌ | **Auto-calculated:** cash_paid + bank_transfer |
| `total_amount_due` | NUMERIC(10,2) | ❌ | **Auto-calculated:** total_ticket_price + tot_visa_fees |
| `payment_balance` | NUMERIC(10,2) | ❌ | **Display-only:** total_customer_payment - total_amount_due |

#### **Financial Fields (Profit):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `commission_from_airlines` | NUMERIC(10,2) | ❌ | Commission received from airlines |
| `lst_loan_fee` | NUMERIC(10,2) | ❌ | LST loan fee (deduction) |
| `lst_profit` | NUMERIC(10,2) | ❌ | **Auto-calculated:** service_fee + service_visa + commission_from_airlines - lst_loan_fee |
| `cash_paid_to_lst_account` | NUMERIC(10,2) | ❌ | Cash paid to LST account |
| `profit` | NUMERIC(10,2) | ❌ | General profit field |

#### **System Fields:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `is_demo` | BOOLEAN | ✅ | false | Demo/test data flag |
| `ocr_source` | TEXT | ❌ | NULL | OCR source metadata |
| `ocr_confidence` | DECIMAL(5,2) | ❌ | NULL | OCR confidence score |
| `created_at` | TIMESTAMPTZ | ✅ | NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | ✅ | NOW() | Record update timestamp |

---

## 📋 TABLE COLUMNS (Display Order)

**Current Column Order (28 columns):**
1. **#** (`row_number`) - Row number (computed)
2. **Booking Ref** (`booking_ref`) - Booking reference number
3. **Booking Status** (`booking_status`) - pending, confirmed, cancelled
4. **Invoice** (`invoice_action`) - Invoice button (🖨️ Invoice)
5. **First Name** (`first_name`) - Passenger first name
6. **Middle Name** (`middle_name`) - Passenger middle name
7. **Last Name** (`last_name`) - Passenger last name
8. **Date of Birth** (`date_of_birth`) - Date of birth
9. **Gender** (`gender`) - M, F, Other
10. **Passport Number** (`passport_number`) - Passport number
11. **Travel Details** (`travel_details`) - Combined travel info display
12. **Request Types** (`request_types`) - Flight, Visa, Package, Other
13. **Airlines Price** (`airlines_price`) - Base ticket price
14. **Service Fee** (`service_fee`) - Service fee for ticket
15. **Total Ticket Price** (`total_ticket_price`) - **Auto-calculated** (read-only)
16. **Visa Price** (`visa_price`) - Base visa price
17. **Service Visa** (`service_visa`) - Service fee for visa
18. **Total Visa Fees** (`tot_visa_fees`) - **Auto-calculated** (read-only)
19. **Total Amount Due** (`total_amount_due`) - **Auto-calculated** (orange background)
20. **Cash Paid** (`cash_paid`) - Amount paid in cash
21. **Bank Transfer** (`bank_transfer`) - Amount paid via transfer
22. **Total Customer Payment** (`total_customer_payment`) - **Auto-calculated** (read-only)
23. **Payment Balance** (`payment_balance`) - **Display-only** (calculated)
24. **Commission from Airlines** (`commission_from_airlines`) - Airline commission
25. **LST Loan Fee** (`lst_loan_fee`) - Loan fee deduction
26. **LST Profit** (`lst_profit`) - **Auto-calculated** (read-only)
27. **Created At** (`created_at`) - Creation timestamp

---

## 🧮 CALCULATION LOGIC & FORMULAS

### **1. Total Ticket Price**

**Formula:**
```
total_ticket_price = airlines_price + service_fee
```

**Trigger Fields:**
- `airlines_price` changes
- `service_fee` changes

**Calculation Location:**
- Real-time in `saveCell()` function
- Display in `getCellValue()` function
- Auto-saved to database

**Example:**
- Airlines Price: €500.00
- Service Fee: €50.00
- **Total Ticket Price: €550.00**

---

### **2. Total Visa Fees**

**Formula:**
```
tot_visa_fees = visa_price + service_visa
```

**Trigger Fields:**
- `visa_price` changes
- `service_visa` changes

**Calculation Location:**
- Real-time in `saveCell()` function
- Display in `getCellValue()` function
- Auto-saved to database

**Example:**
- Visa Price: €80.00
- Service Visa: €20.00
- **Total Visa Fees: €100.00**

---

### **3. Total Customer Payment**

**Formula:**
```
total_customer_payment = cash_paid + bank_transfer
```

**Trigger Fields:**
- `cash_paid` changes
- `bank_transfer` changes

**Calculation Location:**
- Real-time in `saveCell()` function
- Display in `getCellValue()` function
- Auto-saved to database

**Example:**
- Cash Paid: €200.00
- Bank Transfer: €450.00
- **Total Customer Payment: €650.00**

---

### **4. Total Amount Due**

**Formula:**
```
total_amount_due = total_ticket_price + tot_visa_fees
```

**Trigger Fields:**
- `total_ticket_price` changes (via airlines_price or service_fee)
- `tot_visa_fees` changes (via visa_price or service_visa)
- Direct changes to `service_fee`, `airlines_price`, `visa_price`, `service_visa`

**Calculation Location:**
- Real-time in `saveCell()` function
- Display in `getCellValue()` function
- Auto-saved to database
- **Visual:** Orange/yellow background highlight

**Example:**
- Total Ticket Price: €550.00
- Total Visa Fees: €100.00
- **Total Amount Due: €650.00**

---

### **5. Payment Balance**

**Formula:**
```
payment_balance = total_customer_payment - total_amount_due
```

**Display Logic:**
- **Positive Balance:** Green text (customer overpaid)
- **Negative Balance:** Red text (customer owes money)
- **Zero Balance:** Normal text (fully paid)

**Calculation Location:**
- Display-only in `getCellValue()` function
- **NOT saved to database** (calculated on-the-fly)

**Example:**
- Total Customer Payment: €650.00
- Total Amount Due: €650.00
- **Payment Balance: €0.00** (Fully paid)

---

### **6. LST Profit**

**Formula:**
```
lst_profit = service_fee + service_visa + commission_from_airlines - lst_loan_fee
```

**Trigger Fields:**
- `service_fee` changes
- `service_visa` changes
- `commission_from_airlines` changes
- `lst_loan_fee` changes

**Calculation Location:**
- Real-time in `saveCell()` function
- Display in `getCellValue()` function
- Auto-saved to database
- Also calculated on data fetch (migration support)

**Example:**
- Service Fee: €50.00
- Service Visa: €20.00
- Commission: €30.00
- Loan Fee: €10.00
- **LST Profit: €90.00**

---

## 🔄 CALCULATION CHAIN & DEPENDENCIES

### **Calculation Flow:**

```
airlines_price + service_fee
    ↓
total_ticket_price ──┐
                     ├──→ total_amount_due
visa_price + service_visa ──┐
    ↓                        │
tot_visa_fees ───────────────┘
                                ↓
                    payment_balance (display-only)
                                ↑
cash_paid + bank_transfer ──────┘
    ↓
total_customer_payment

service_fee + service_visa + commission_from_airlines - lst_loan_fee
    ↓
lst_profit
```

### **Real-Time Update Triggers:**

**When `airlines_price` or `service_fee` changes:**
1. Recalculates `total_ticket_price`
2. Recalculates `total_amount_due`
3. Recalculates `payment_balance` (display)

**When `visa_price` or `service_visa` changes:**
1. Recalculates `tot_visa_fees`
2. Recalculates `total_amount_due`
3. Recalculates `payment_balance` (display)

**When `cash_paid` or `bank_transfer` changes:**
1. Recalculates `total_customer_payment`
2. Recalculates `payment_balance` (display)

**When `service_fee`, `service_visa`, `commission_from_airlines`, or `lst_loan_fee` changes:**
1. Recalculates `lst_profit`

---

## ✏️ EDITABILITY RULES

### **Editable Fields (Inline Editing):**
- ✅ `booking_ref` - Text input
- ✅ `booking_status` - Dropdown (pending, confirmed, cancelled)
- ✅ `first_name` - Text input
- ✅ `middle_name` - Text input
- ✅ `last_name` - Text input
- ✅ `date_of_birth` - Date input (DD-MM-YYYY)
- ✅ `gender` - Dropdown (M, F, Other)
- ✅ `passport_number` - Text input
- ✅ `departure_airport` - Text input
- ✅ `destination_airport` - Text input
- ✅ `travel_date` - Date input (DD-MM-YYYY)
- ✅ `return_date` - Date input (DD-MM-YYYY)
- ✅ `request_types` - Comma-separated text (converted to JSONB array)
- ✅ `airlines` - Autocomplete (AirlinesAutocomplete component)
- ✅ `airlines_price` - Number input (positive numbers only, min: 0)
- ✅ `service_fee` - Number input (positive numbers only, min: 0)
- ✅ `visa_price` - Number input
- ✅ `service_visa` - Number input
- ✅ `cash_paid` - Number input
- ✅ `bank_transfer` - Number input
- ✅ `commission_from_airlines` - Number input
- ✅ `lst_loan_fee` - Number input
- ✅ `notice` - Textarea (preserves newlines)

### **Read-Only Fields (Auto-Calculated/System):**
- ❌ `total_ticket_price` - Auto-calculated (airlines_price + service_fee)
- ❌ `tot_visa_fees` - Auto-calculated (visa_price + service_visa)
- ❌ `total_customer_payment` - Auto-calculated (cash_paid + bank_transfer)
- ❌ `total_amount_due` - Auto-calculated (total_ticket_price + tot_visa_fees)
- ❌ `payment_balance` - Display-only (total_customer_payment - total_amount_due)
- ❌ `lst_profit` - Auto-calculated (service_fee + service_visa + commission - loan_fee)
- ❌ `id` - UUID primary key
- ❌ `created_at` - System timestamp
- ❌ `updated_at` - System timestamp
- ❌ `row_number` - Computed row number

---

## 🎨 SPECIAL UI FEATURES

### **1. Travel Details Column**
- **Combined Display:** Shows departure → destination, travel date, return date
- **Format:** "FRA → JFK | 15-01-2026 | 20-01-2026"
- **Read-only:** Computed from individual fields

### **2. Total Amount Due Highlighting**
- **Visual:** Orange/yellow background color
- **Purpose:** Draws attention to total amount customer owes
- **Implementation:** CSS class applied via DOM manipulation

### **3. Payment Balance Color Coding**
- **Positive (Green):** Customer overpaid
- **Negative (Red):** Customer owes money
- **Zero (Normal):** Fully paid

### **4. Invoice Action Button**
- **Display:** 🖨️ Invoice button
- **Action:** Opens invoice in new tab (`/invoice/:bookingId`)
- **Component:** `InvoiceTemplate.jsx`

---

## 🔍 SEARCH & FILTERING

### **Search Functionality:**
- **Searches in:** First name, Last name, Passport number, Departure airport, Destination airport
- **Type:** Case-insensitive, partial match
- **Placeholder:** "Search by name, passport, or airport..."

### **Date Filters:**
- **Today** - Bookings created today
- **This Week** - Current week (Monday to today)
- **This Month** - Current month (default)
- **This Year** - Current year with month selector
- **Previous Years** - 2020-2025 with month selector
- **All Time** - No date filter

### **Grouping:**
- ✅ Bookings grouped by month/year
- ✅ Current month expanded by default
- ✅ Group headers show: "Month Year" (e.g., "January 2026")

---

## 📤 INVOICE GENERATION

### **Invoice Template:**
- **Component:** `src/components/Invoice/InvoiceTemplate.jsx`
- **Route:** `/invoice/:bookingId`
- **Features:**
  - Auto-generated invoice number (INV-2025-XXXX)
  - German date format (DD. Month YY)
  - German number format (480,00)
  - Bilingual labels (German/English)
  - Company details and bank information
  - Print-optimized (A4 size)
  - Payment method display (Bank Transfer or Cash)

### **Invoice Data Mapping:**
- **Passenger:** first_name + middle_name + last_name
- **Travel Dates:** travel_date, return_date
- **Airlines:** airlines field
- **Booking Ref:** booking_ref
- **Ticket Price:** total_ticket_price
- **Visa Fees:** tot_visa_fees
- **Total Amount:** total_amount_due
- **Payment Method:** "Banküberweisung" if bank_transfer > 0, else "Bar"

---

## 🎨 UI/UX FEATURES

### **Excel-Like Table:**
- ✅ Click cell to edit inline
- ✅ Keyboard navigation:
  - `Enter` → Save and move down
  - `Tab` → Save and move right
  - `Shift+Tab` → Save and move left
  - `Arrow Keys` → Save and navigate
  - `Escape` → Cancel editing
- ✅ Auto-focus and select on edit
- ✅ Auto-save on blur or Enter
- ✅ Column resizing (drag border)
- ✅ Auto-fit columns (double-click border)

### **Visual Styling:**
- ✅ Dark/Light theme support
- ✅ Responsive design
- ✅ Consistent column widths
- ✅ Currency formatting (€X,XXX.XX)
- ✅ Date formatting (DD-MM-YYYY)
- ✅ Color-coded payment balance

---

## 📊 DATA FORMATTING

### **Date Formatting:**
- **Display:** DD-MM-YYYY (e.g., "20-01-2026")
- **Database:** YYYY-MM-DD (ISO format)
- **Created At:** DD-MM-YYYY, HH:MM (e.g., "20-01-2026, 14:30")

### **Currency Formatting:**
- **Format:** Uses `Intl.NumberFormat` based on language
- **English:** €1,234.56
- **German:** 1.234,56 €

### **Request Types Formatting:**
- **Input:** Comma-separated text (e.g., "Flight, Visa")
- **Storage:** JSONB array (e.g., `["flight", "visa"]`)
- **Display:** Comma-separated labels (e.g., "Flight, Visa")

---

## 🗂️ DATABASE INDEXES

**Performance Indexes:**
1. `idx_main_table_status` - On `status` (draft, submitted, cancelled)
2. `idx_main_table_booking_status` - On `booking_status` (pending, confirmed, cancelled)
3. `idx_main_table_created_at` - On `created_at` (DESC)
4. `idx_main_table_is_demo` - On `is_demo` (WHERE is_demo = true)
5. `idx_main_table_request_types` - GIN index on `request_types` (JSONB)
6. `idx_main_table_booking_ref` - On `booking_ref` (WHERE NOT NULL)

---

## 🌐 MULTILINGUAL SUPPORT

### **Languages:**
- ✅ English (en)
- ✅ German (de)

### **Translatable Elements:**
- ✅ All column labels
- ✅ All status values
- ✅ All request types
- ✅ All gender values
- ✅ All UI text (buttons, labels, messages)
- ✅ Search placeholder
- ✅ Error messages

---

## 🔄 PAGINATION

- **Page Size:** 50 records per page
- **Navigation:** Previous/Next buttons
- **Display:** "Showing 1-50 of 150"
- **Type:** Server-side pagination

---

## ✅ IMPLEMENTATION STATUS

### **Core Features:**
- ✅ Database table created
- ✅ All columns implemented
- ✅ Excel-like inline editing
- ✅ Real-time calculations (6 formulas)
- ✅ Invoice generation
- ✅ Search and filtering
- ✅ Date filtering
- ✅ Monthly grouping
- ✅ Pagination
- ✅ Multilingual support
- ✅ Column resizing
- ✅ Theme support
- ✅ Airlines autocomplete

### **Database Migrations:**
- ✅ `002_create_main_table.sql` - Initial table creation
- ✅ `005_add_airlines_column.sql` - Airlines column added
- ✅ `006_replace_visa_fee_with_three_columns.sql` - Visa fee split into 3 columns

### **Calculations:**
- ✅ `total_ticket_price` - Real-time calculation
- ✅ `tot_visa_fees` - Real-time calculation
- ✅ `total_customer_payment` - Real-time calculation
- ✅ `total_amount_due` - Real-time calculation
- ✅ `payment_balance` - Display-only calculation
- ✅ `lst_profit` - Real-time calculation

---

## 🎯 USE CASES

### **1. Creating New Booking:**
1. Click "Create New Request" button
2. Fill passenger information
3. Enter travel details
4. Add financial amounts (airlines_price, service_fee, etc.)
5. Calculations happen automatically
6. Save booking

### **2. Editing Booking Inline:**
1. Click on editable cell
2. Make changes
3. If financial field changed → Related calculations update automatically
4. Press Enter or click outside → Changes saved

### **3. Generating Invoice:**
1. Click 🖨️ Invoice button in table
2. Invoice opens in new tab
3. Shows all booking details
4. Print-ready format (A4)
5. Bilingual labels

### **4. Tracking Payments:**
1. Enter `cash_paid` and/or `bank_transfer` amounts
2. `total_customer_payment` calculates automatically
3. `payment_balance` shows difference (green if overpaid, red if owes)
4. `total_amount_due` highlighted in orange

---

## 📈 VALIDATION RULES

### **Numeric Fields:**
- ✅ `airlines_price` - Must be ≥ 0 (positive numbers only)
- ✅ `service_fee` - Must be ≥ 0 (positive numbers only)
- ✅ Other numeric fields accept any number (including negative)

### **Date Fields:**
- ✅ Format validation: DD-MM-YYYY
- ✅ Range validation: Year between 1900-2100
- ✅ Month validation: 1-12
- ✅ Day validation: 1-31

### **Request Types:**
- ✅ Comma-separated input converted to JSONB array
- ✅ Valid values: "flight", "visa", "package", "other"

---

## 🔐 SECURITY & VALIDATION

- ✅ Required field validation
- ✅ Date format validation
- ✅ Numeric validation for amounts
- ✅ SQL injection protection (Supabase)
- ✅ XSS protection (React)
- ✅ Input sanitization

---

## 📝 NOTES

1. **Auto-Calculations:** All calculated fields update in real-time as user types
2. **Database Storage:** Calculated fields are stored in database for reporting
3. **Payment Balance:** Display-only, not stored (calculated on-the-fly)
4. **Invoice Generation:** Uses booking data from main_table
5. **Travel Details:** Combined display column, individual fields still editable
6. **Request Types:** Stored as JSONB array, displayed as comma-separated labels
7. **Airlines Field:** Uses autocomplete component for airline selection

---

## 🔄 FUTURE ENHANCEMENTS (Potential)

- [ ] Bulk import from CSV
- [ ] Export to CSV/Excel
- [ ] Booking deletion
- [ ] Booking duplication
- [ ] Advanced filtering (by status, booking_status, etc.)
- [ ] Financial reports (profit summaries, payment reports)
- [ ] Email invoice functionality
- [ ] Booking history/audit trail
- [ ] Multi-currency support
- [ ] Payment reminders

---

**Report Generated:** 2026-01-20  
**Component Version:** Latest  
**Database Migrations:** 002, 005, 006  
**Status:** ✅ **PRODUCTION READY**
