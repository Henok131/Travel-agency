# Main Table - Columns Implementation & Logic Report

## Overview
This report documents all columns in the `main_table`, their implementation status, data types, and any mathematical/logical calculations implemented.

**Report Date:** January 2026  
**Table Name:** `main_table`  
**Total Columns:** 30

---

## Column Categories

### 1. Identification & System Columns (5 columns)

| # | Column Name | Display Label | Data Type | Editable | Implementation Status | Notes |
|---|-------------|---------------|-----------|----------|----------------------|-------|
| 1 | `id` | - | UUID | ❌ No | ✅ Implemented | Primary key, auto-generated |
| 2 | `row_number` | # | Number | ❌ No | ✅ Implemented | Auto-calculated row number |
| 3 | `booking_ref` | Booking Ref | TEXT | ✅ Yes | ✅ Implemented | Booking reference number |
| 4 | `booking_status` | Booking Status | TEXT | ✅ Yes | ✅ Implemented | Dropdown: Pending/Confirmed/Cancelled (color-coded) |
| 5 | `created_at` | Created At | TIMESTAMPTZ | ❌ No | ✅ Implemented | Auto-generated timestamp |

**Implementation Details:**
- `booking_status` has color-coded dropdown (red=cancelled, green=confirmed, yellow=pending)
- `row_number` is calculated dynamically based on filtered/sorted data
- `created_at` displays as "DD-MM-YYYY, HH:MM" format

---

### 2. Passenger Information (7 columns)

| # | Column Name | Display Label | Data Type | Editable | Implementation Status | Notes |
|---|-------------|---------------|-----------|----------|----------------------|-------|
| 6 | `first_name` | First Name | TEXT | ✅ Yes | ✅ Implemented | Required field (NOT NULL) |
| 7 | `middle_name` | Middle Name | TEXT | ✅ Yes | ✅ Implemented | Optional |
| 8 | `last_name` | Last Name | TEXT | ✅ Yes | ✅ Implemented | Required field (NOT NULL) |
| 9 | `date_of_birth` | Date of Birth | DATE | ✅ Yes | ✅ Implemented | Date picker, format: DD-MM-YYYY |
| 10 | `gender` | Gender | TEXT | ✅ Yes | ✅ Implemented | Dropdown: Male/Female/Other |
| 11 | `nationality` | Nationality | TEXT | ✅ Yes | ✅ Implemented | Text input |
| 12 | `passport_number` | Passport Number | TEXT | ✅ Yes | ✅ Implemented | Text input |

**Implementation Details:**
- All fields are editable in the main table
- Date fields use date picker with DD-MM-YYYY format
- Gender uses dropdown selection

---

### 3. Travel Information (5 columns)

| # | Column Name | Display Label | Data Type | Editable | Implementation Status | Notes |
|---|-------------|---------------|-----------|----------|----------------------|-------|
| 13 | `departure_airport` | Departure | TEXT | ✅ Yes | ✅ Implemented | Airport autocomplete |
| 14 | `destination_airport` | Destination | TEXT | ✅ Yes | ✅ Implemented | Airport autocomplete |
| 15 | `travel_date` | Travel Date | DATE | ✅ Yes | ✅ Implemented | Date picker, format: DD-MM-YYYY |
| 16 | `return_date` | Return Date | DATE | ✅ Yes | ✅ Implemented | Date picker, format: DD-MM-YYYY |
| 17 | `request_types` | Request Types | JSONB | ✅ Yes | ✅ Implemented | Comma-separated: Flight, Visa, Package, Other |

**Implementation Details:**
- Airport fields use autocomplete with IATA code lookup
- Request types stored as JSONB array, displayed as comma-separated values
- Date fields use date picker

---

### 4. Financial & Payment Columns (15 columns)

| # | Column Name | Display Label | Data Type | Editable | Implementation Status | Notes |
|---|-------------|---------------|-----------|----------|----------------------|-------|
| 18 | `print_invoice` | Print Invoice | BOOLEAN | ✅ Yes | ✅ Implemented | Yes/No dropdown |
| 19 | `bank_transfer` | Bank Transfer | NUMERIC | ✅ Yes | ✅ Implemented | Numeric input (was boolean, converted) |
| 20 | `cash_paid` | Cash Paid | NUMERIC | ✅ Yes | ✅ Implemented | Numeric input (was boolean, converted) |
| 21 | `total_customer_payment` | Total Customer Payment | NUMERIC | ❌ No | ✅ **AUTO-CALCULATED** | **Formula: `cash_paid + bank_transfer`** |
| 22 | `cash_paid_to_lst_account` | Cash Paid to LST Account | NUMERIC | ✅ Yes | ✅ Implemented | Numeric input (logical field, represents total customer payment) |
| 23 | `lst_loan_fee` | LST Loan Fee | NUMERIC | ✅ Yes | ✅ Implemented | Numeric input, 2 decimal places |
| 24 | `airlines_price` | Airlines Price | NUMERIC | ✅ Yes | ✅ Implemented | Numeric input, **positive only** (min=0) |
| 25 | `service_fee` | Service Fee | NUMERIC | ✅ Yes | ✅ Implemented | Numeric input, **positive only** (min=0) |
| 26 | `total_ticket_price` | Total Ticket Price | NUMERIC | ❌ No | ✅ **AUTO-CALCULATED** | **Formula: `service_fee + airlines_price`** |
| 27 | `lst_profit` | LST Profit | NUMERIC | ✅ Yes | ✅ Implemented | Numeric input, 2 decimal places |
| 28 | `commission_from_airlines` | Commission from Airlines | NUMERIC | ✅ Yes | ✅ Implemented | Numeric input, 2 decimal places |
| 29 | `visa_fee` | Visa Fee | NUMERIC | ✅ Yes | ✅ Implemented | Numeric input, 2 decimal places |
| 30 | `profit` | Profit | NUMERIC | ✅ Yes | ✅ Implemented | Numeric input, 2 decimal places |
| - | `notice` | Notice | TEXT | ✅ Yes | ✅ Implemented | Multiline text field |
| - | `updated_at` | - | TIMESTAMPTZ | ❌ No | ✅ Implemented | Auto-updated timestamp (not displayed) |

**Implementation Details:**
- All numeric fields support 2 decimal places (step="0.01")
- `airlines_price` and `service_fee` have validation to prevent negative numbers
- `total_customer_payment` and `total_ticket_price` are read-only, auto-calculated fields

---

## Mathematical Calculations Implemented

### ✅ **Calculation 1: Total Customer Payment**

**Formula:** `total_customer_payment = cash_paid + bank_transfer`

**Implementation Status:** ✅ **FULLY IMPLEMENTED**

**Details:**
- **Trigger Fields:** `cash_paid`, `bank_transfer`
- **Calculation Type:** Addition
- **Update Frequency:** Real-time (on input change) + On save
- **Display Format:** 2 decimal places (e.g., "150.00")
- **Null Handling:** Returns `null` if result is 0 or negative
- **Location in Code:**
  - `getCellValue()` - Line 720-725
  - `getRawCellValue()` - Line 764-769
  - `saveCell()` - Line 862-873, 915-921, 947-950
  - `handleInputChange()` - Line 1016-1031
  - `renderCell()` - Line 1384-1406

**Example:**
- `cash_paid` = 50.00
- `bank_transfer` = 100.00
- `total_customer_payment` = **150.00** (auto-calculated)

---

### ✅ **Calculation 2: Total Ticket Price**

**Formula:** `total_ticket_price = service_fee + airlines_price`

**Implementation Status:** ✅ **FULLY IMPLEMENTED**

**Details:**
- **Trigger Fields:** `service_fee`, `airlines_price`
- **Calculation Type:** Addition
- **Update Frequency:** Real-time (on input change) + On save
- **Display Format:** 2 decimal places (e.g., "163.00")
- **Null Handling:** Returns `null` if result is 0 or negative
- **Validation:** Both `service_fee` and `airlines_price` cannot be negative (min=0)
- **Location in Code:**
  - `getCellValue()` - Line 770-775
  - `getRawCellValue()` - Line 770-775
  - `saveCell()` - Line 875-886, 923-929, 952-955
  - `handleInputChange()` - Line 1033-1048
  - `renderCell()` - Line 1407-1425

**Example:**
- `service_fee` = 65.00
- `airlines_price` = 98.00
- `total_ticket_price` = **163.00** (auto-calculated)

---

## Validation Rules Implemented

### ✅ **Validation 1: Positive Numbers Only**

**Fields:** `airlines_price`, `service_fee`

**Rule:** Cannot accept negative numbers

**Implementation:**
- HTML5 `min="0"` attribute on input fields
- JavaScript validation in `handleInputChange()` - blocks negative input
- Backend validation in `saveCell()` - converts negative values to 0

**Location in Code:**
- `handleInputChange()` - Line 1000-1015
- `saveCell()` - Line 852-858
- `renderCell()` - Line 1356 (min attribute)

---

## Fields NOT Yet Implemented (No Calculations)

The following fields exist in the database but have **NO automatic calculations**:

1. **`profit`** - Manual entry only, no formula
2. **`lst_profit`** - Manual entry only, no formula
3. **`commission_from_airlines`** - Manual entry only, no formula
4. **`visa_fee`** - Manual entry only, no formula
5. **`lst_loan_fee`** - Manual entry only, no formula
6. **`cash_paid_to_lst_account`** - Manual entry only, no formula (logical field representing total customer payment, but not auto-calculated)

---

## Data Type Conversions

### ✅ **Completed Conversions:**

1. **`cash_paid`**: BOOLEAN → NUMERIC
   - **Status:** ✅ Converted
   - **Migration:** Applied via SQL migration
   - **Frontend:** Now uses numeric input instead of Yes/No dropdown

2. **`bank_transfer`**: BOOLEAN → NUMERIC
   - **Status:** ✅ Converted
   - **Migration:** Applied via SQL migration
   - **Frontend:** Now uses numeric input instead of Yes/No dropdown

---

## Column Display Order

Columns are displayed in the following order (as defined in `columnOrder` array):

1. `row_number` (#)
2. `booking_ref` (Booking Ref)
3. `booking_status` (Booking Status)
4. `print_invoice` (Print Invoice)
5. `first_name` (First Name)
6. `middle_name` (Middle Name)
7. `last_name` (Last Name)
8. `date_of_birth` (Date of Birth)
9. `gender` (Gender)
10. `nationality` (Nationality)
11. `passport_number` (Passport Number)
12. `departure_airport` (Departure)
13. `destination_airport` (Destination)
14. `travel_date` (Travel Date)
15. `return_date` (Return Date)
16. `request_types` (Request Types)
17. `bank_transfer` (Bank Transfer)
18. `cash_paid` (Cash Paid)
19. `lst_loan_fee` (LST Loan Fee)
20. `airlines_price` (Airlines Price)
21. `service_fee` (Service Fee)
22. `total_ticket_price` (Total Ticket Price)
23. `lst_profit` (LST Profit)
24. `commission_from_airlines` (Commission from Airlines)
25. `visa_fee` (Visa Fee)
26. `total_customer_payment` (Total Customer Payment)
27. `profit` (Profit)
28. `notice` (Notice)
29. `created_at` (Created At)

---

## Implementation Summary

### ✅ **Fully Implemented Features:**

1. ✅ All 30 columns are displayed in the table
2. ✅ All editable columns support inline editing
3. ✅ Real-time calculation for `total_customer_payment`
4. ✅ Real-time calculation for `total_ticket_price`
5. ✅ Validation for positive numbers (`airlines_price`, `service_fee`)
6. ✅ Data type conversions (boolean → numeric for payment fields)
7. ✅ Excel-like keyboard navigation (Tab, Enter, Arrow keys)
8. ✅ Column resizing functionality
9. ✅ Date pickers for date fields
10. ✅ Airport autocomplete for airport fields
11. ✅ Multiline text support for `notice` field
12. ✅ Color-coded booking status dropdown

### ❌ **Not Implemented (Potential Future Enhancements):**

1. ❌ Automatic calculation for `profit` field
2. ❌ Automatic calculation for `lst_profit` field
3. ❌ Relationship logic between `cash_paid` and `cash_paid_to_lst_account`
4. ❌ Formula-based calculations for commission or visa fees
5. ❌ Automatic profit calculation based on revenue and costs

---

## Code References

### Key Functions:

- **`getCellValue()`** - Line 684-732: Formats cell values for display, includes calculations
- **`getRawCellValue()`** - Line 734-782: Gets raw values for editing, includes calculations
- **`saveCell()`** - Line 820-1000: Saves cell changes, triggers calculations
- **`handleInputChange()`** - Line 986-1049: Handles real-time input changes, triggers real-time calculations
- **`renderCell()`** - Line 1234-1425: Renders cell content, displays calculated values
- **`isEditable()`** - Line 1225-1231: Determines if a field is editable

### Calculation Logic Locations:

**Total Customer Payment:**
- Calculation: `src/pages/MainTable.jsx` Lines 720-725, 764-769, 862-873, 915-921, 947-950, 1016-1031, 1384-1406

**Total Ticket Price:**
- Calculation: `src/pages/MainTable.jsx` Lines 770-775, 875-886, 923-929, 952-955, 1033-1048, 1407-1425

**Positive Number Validation:**
- Validation: `src/pages/MainTable.jsx` Lines 1000-1015, 852-858, 1356

---

## Database Schema

**Table:** `main_table`  
**Primary Key:** `id` (UUID)  
**Total Columns:** 30 (including system fields)

**Numeric Fields (NUMERIC(10,2)):**
- `lst_loan_fee`
- `airlines_price`
- `service_fee`
- `lst_profit`
- `commission_from_airlines`
- `visa_fee`
- `cash_paid_to_lst_account`
- `profit`
- `bank_transfer` (converted from BOOLEAN)
- `cash_paid` (converted from BOOLEAN)
- `total_customer_payment` (auto-calculated, stored in DB)
- `total_ticket_price` (auto-calculated, stored in DB)

**Boolean Fields:**
- `print_invoice`
- `is_demo`

**Text Fields:**
- All passenger information fields
- All travel information fields
- `booking_ref`
- `notice`

**Date Fields:**
- `date_of_birth`
- `travel_date`
- `return_date`

**JSONB Fields:**
- `request_types`

**Timestamp Fields:**
- `created_at`
- `updated_at`

---

## Summary

**Total Columns:** 30  
**Editable Columns:** 24  
**Read-Only Columns:** 6 (id, row_number, created_at, updated_at, total_customer_payment, total_ticket_price)  
**Auto-Calculated Columns:** 2 (total_customer_payment, total_ticket_price)  
**Mathematical Formulas Implemented:** 2  
**Validation Rules Implemented:** 1 (positive numbers for airlines_price and service_fee)

**Status:** ✅ All columns are implemented and functional. Two automatic calculations are working with real-time updates.
