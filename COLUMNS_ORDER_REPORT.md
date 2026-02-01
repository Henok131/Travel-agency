# LST Travel - Main Table Columns Order Report

**Generated:** 2026-01-19  
**Purpose:** Complete list of all columns in their current display order for discussion and reordering with Claude AI

---

## 📋 CURRENT COLUMN ORDER

The columns are displayed in the following order (left to right in the table):

| # | Column Name | Field Name | Data Type | Editable | Category | Description |
|---|-------------|------------|-----------|----------|---------|-------------|
| 1 | `#` | `row_number` | Computed | ❌ Read-only | System | Row number (1, 2, 3...) |
| 2 | `Booking Ref` | `booking_ref` | TEXT | ✅ Yes | Booking | Booking reference number |
| 3 | `Booking Status` | `booking_status` | TEXT | ✅ Yes | Booking | Booking status: pending, confirmed, cancelled (color-coded) |
| 4 | `Print Invoice` | `print_invoice` | BOOLEAN | ✅ Yes | Booking | Flag to indicate if invoice should be printed |
| 5 | `First Name` | `first_name` | TEXT | ✅ Yes | Passenger | Passenger first name |
| 6 | `Middle Name` | `middle_name` | TEXT | ✅ Yes | Passenger | Passenger middle name(s) |
| 7 | `Last Name` | `last_name` | TEXT | ✅ Yes | Passenger | Passenger last name |
| 8 | `Date of Birth` | `date_of_birth` | DATE | ✅ Yes | Passenger | Passenger date of birth |
| 9 | `Gender` | `gender` | TEXT | ✅ Yes | Passenger | Gender (M/F/Other) |
| 10 | `Passport Number` | `passport_number` | TEXT | ✅ Yes | Passenger | Passport number |
| 11 | `Travel Details` | `travel_details` | Computed | ❌ Read-only | Travel | Expandable panel: nationality, departure_airport, destination_airport, travel_date, return_date, airlines, notice |
| 12 | `Request Types` | `request_types` | JSONB | ✅ Yes | Request | JSONB array: ["flight", "visa", "package", "other"] |
| 13 | `Bank Transfer` | `bank_transfer` | NUMERIC(10,2) | ✅ Yes | Payment | Amount of bank transfer payment |
| 14 | `Cash Paid` | `cash_paid` | NUMERIC(10,2) | ✅ Yes | Payment | Amount of cash paid |
| 15 | `LST Loan Fee` | `lst_loan_fee` | NUMERIC(10,2) | ✅ Yes | Financial | LST loan fee (manual entry) |
| 16 | `Airlines Price` | `airlines_price` | NUMERIC(10,2) | ✅ Yes | Financial | Price charged by airlines (positive numbers only) |
| 17 | `Service Fee` | `service_fee` | NUMERIC(10,2) | ✅ Yes | Financial | Service fee charged to customer (positive numbers only) |
| 18 | `Total Ticket Price` | `total_ticket_price` | NUMERIC(10,2) | ❌ **AUTO** | Financial | Auto-calculated: `service_fee + airlines_price` |
| 19 | `LST Profit` | `lst_profit` | NUMERIC(10,2) | ❌ **AUTO** | Financial | Auto-calculated: `service_fee + service_visa + commission_from_airlines - lst_loan_fee` |
| 20 | `Commission from Airlines` | `commission_from_airlines` | NUMERIC(10,2) | ✅ Yes | Financial | Commission received from airlines (manual entry) |
| 21 | `Visa Price` | `visa_price` | NUMERIC(10,2) | ✅ Yes | Financial | Base visa price (editable) |
| 22 | `Service Visa` | `service_visa` | NUMERIC(10,2) | ✅ Yes | Financial | Service fee for visa processing (editable) |
| 23 | `Total Visa Fees` | `tot_visa_fees` | NUMERIC(10,2) | ❌ **AUTO** | Financial | Auto-calculated: `visa_price + service_visa` |
| 24 | `Total Customer Payment` | `total_customer_payment` | NUMERIC(10,2) | ❌ **AUTO** | Payment | Auto-calculated: `cash_paid + bank_transfer` |
| 25 | `Total Amount Due` | `total_amount_due` | NUMERIC(10,2) | ❌ **AUTO** | Financial | Auto-calculated: `total_ticket_price + tot_visa_fees` |
| 26 | `Payment Balance` | `payment_balance` | Computed | ❌ **Display** | Payment | Display-only: `total_customer_payment - total_amount_due` (color-coded) |
| 27 | `Created At` | `created_at` | TIMESTAMPTZ | ❌ Read-only | System | Creation timestamp |

**Total Columns:** 27

---

## 📊 COLUMNS BY CATEGORY

### **System Columns** (2 columns)
1. `row_number` - Row number (#)
27. `created_at` - Created At

### **Booking Information** (3 columns)
2. `booking_ref` - Booking Ref
3. `booking_status` - Booking Status
4. `print_invoice` - Print Invoice

### **Passenger Information** (5 columns)
5. `first_name` - First Name
6. `middle_name` - Middle Name
7. `last_name` - Last Name
8. `date_of_birth` - Date of Birth
9. `gender` - Gender
10. `passport_number` - Passport Number

### **Travel Information** (2 columns)
11. `travel_details` - Travel Details (expandable: nationality, departure_airport, destination_airport, travel_date, return_date, airlines, notice)
12. `request_types` - Request Types

### **Payment Columns** (3 columns)
13. `bank_transfer` - Bank Transfer (Input)
14. `cash_paid` - Cash Paid (Input)
24. `total_customer_payment` - Total Customer Payment (Auto-calculated)
26. `payment_balance` - Payment Balance (Display-only, color-coded)

### **Financial Columns** (11 columns)
15. `lst_loan_fee` - LST Loan Fee (Input)
16. `airlines_price` - Airlines Price (Input)
17. `service_fee` - Service Fee (Input)
18. `total_ticket_price` - Total Ticket Price (Auto-calculated)
19. `lst_profit` - LST Profit (Auto-calculated)
20. `commission_from_airlines` - Commission from Airlines (Input)
21. `visa_price` - Visa Price (Input)
22. `service_visa` - Service Visa (Input)
23. `tot_visa_fees` - Total Visa Fees (Auto-calculated)
25. `total_amount_due` - Total Amount Due (Auto-calculated)

---

## 🔄 CURRENT ORDER ANALYSIS

### **Order Flow:**
1. **System/Reference** → Row number
2. **Booking Info** → Booking ref, status, print invoice
3. **Passenger Info** → Name, DOB, gender, passport
4. **Travel Info** → Travel details (expandable), request types
5. **Payment Input** → Bank transfer, cash paid
6. **Financial Input** → Loan fee, airlines price, service fee
7. **Financial Calculated** → Total ticket price, LST profit
8. **Financial Input** → Commission, visa price, service visa
9. **Financial Calculated** → Total visa fees
10. **Payment Calculated** → Total customer payment
11. **Financial Calculated** → Total amount due
12. **Payment Display** → Payment balance (color-coded)
13. **System** → Created at

---

## 💡 SUGGESTED REORDERING OPTIONS

### **Option 1: Grouped by Function (Recommended)**
```
1. System: row_number
2-4. Booking: booking_ref, booking_status, print_invoice
5-10. Passenger: first_name, middle_name, last_name, date_of_birth, gender, passport_number
11-12. Travel: travel_details, request_types
13-16. Payment Input: cash_paid, bank_transfer, total_customer_payment, payment_balance
17-20. Ticket Costs: airlines_price, service_fee, total_ticket_price
21-24. Visa Costs: visa_price, service_visa, tot_visa_fees
25. Total Amount Due: total_amount_due
26-28. Financial: lst_loan_fee, commission_from_airlines, lst_profit
29. System: created_at
```

### **Option 2: Payment-First (Business Focus)**
```
1. System: row_number
2-4. Booking: booking_ref, booking_status, print_invoice
5-10. Passenger: first_name, middle_name, last_name, date_of_birth, gender, passport_number
11-12. Travel: travel_details, request_types
13-16. Payment: cash_paid, bank_transfer, total_customer_payment, payment_balance
17-20. Costs: airlines_price, service_fee, visa_price, service_visa
21-24. Totals: total_ticket_price, tot_visa_fees, total_amount_due
25-27. Financial: lst_loan_fee, commission_from_airlines, lst_profit
28. System: created_at
```

### **Option 3: Input-First, Calculated-Last**
```
1. System: row_number
2-4. Booking: booking_ref, booking_status, print_invoice
5-10. Passenger: first_name, middle_name, last_name, date_of_birth, gender, passport_number
11-12. Travel: travel_details, request_types
13-22. All Input Fields: cash_paid, bank_transfer, lst_loan_fee, airlines_price, service_fee, commission_from_airlines, visa_price, service_visa
23-27. All Calculated Fields: total_customer_payment, total_ticket_price, tot_visa_fees, total_amount_due, payment_balance, lst_profit
28. System: created_at
```

---

## 📝 COLUMN DETAILS FOR REORDERING

### **Input Fields (Editable)** - 15 columns
- `booking_ref`, `booking_status`, `print_invoice`
- `first_name`, `middle_name`, `last_name`, `date_of_birth`, `gender`, `passport_number`
- `request_types`
- `bank_transfer`, `cash_paid`
- `lst_loan_fee`, `airlines_price`, `service_fee`
- `commission_from_airlines`, `visa_price`, `service_visa`

### **Auto-Calculated Fields (Read-only)** - 5 columns
- `total_customer_payment` = `cash_paid + bank_transfer`
- `total_ticket_price` = `service_fee + airlines_price`
- `tot_visa_fees` = `visa_price + service_visa`
- `total_amount_due` = `total_ticket_price + tot_visa_fees`
- `lst_profit` = `service_fee + service_visa + commission_from_airlines - lst_loan_fee`

### **Display-Only Fields** - 1 column
- `payment_balance` = `total_customer_payment - total_amount_due` (color-coded, NOT stored)

### **System/Computed Fields** - 2 columns
- `row_number` - Row number
- `created_at` - Creation timestamp

### **Special Fields** - 1 column
- `travel_details` - Expandable panel (contains: nationality, departure_airport, destination_airport, travel_date, return_date, airlines, notice)

---

## 🎯 RECOMMENDATIONS FOR DISCUSSION

### **Questions to Consider:**

1. **Should payment-related columns be grouped together?**
   - Current: Payment inputs (13-14) are separated from payment calculated (24, 26)
   - Suggestion: Group all payment columns together

2. **Should financial columns be grouped by type?**
   - Current: Mixed input and calculated fields
   - Suggestion: Group ticket costs together, visa costs together, then totals

3. **Should calculated fields follow their input fields?**
   - Current: Some calculated fields are far from their inputs
   - Suggestion: Place calculated fields immediately after their component inputs

4. **Should payment balance be near payment columns?**
   - Current: Payment balance (26) is after total amount due (25)
   - Suggestion: Place payment balance right after total customer payment

5. **Should travel_details be earlier or later?**
   - Current: After passport number (11)
   - Suggestion: Could be grouped with other travel info or kept where it is

---

## 📋 CURRENT ORDER (Simple List)

```
1. row_number
2. booking_ref
3. booking_status
4. print_invoice
5. first_name
6. middle_name
7. last_name
8. date_of_birth
9. gender
10. passport_number
11. travel_details
12. request_types
13. bank_transfer
14. cash_paid
15. lst_loan_fee
16. airlines_price
17. service_fee
18. total_ticket_price
19. lst_profit
20. commission_from_airlines
21. visa_price
22. service_visa
23. tot_visa_fees
24. total_customer_payment
25. total_amount_due
26. payment_balance
27. created_at
```

---

## 🔧 FORMULAS REFERENCE

### **Auto-Calculated Fields:**
1. `total_customer_payment` = `cash_paid + bank_transfer`
2. `total_ticket_price` = `service_fee + airlines_price`
3. `tot_visa_fees` = `visa_price + service_visa`
4. `total_amount_due` = `total_ticket_price + tot_visa_fees`
5. `lst_profit` = `service_fee + service_visa + commission_from_airlines - lst_loan_fee`

### **Display-Only Fields:**
1. `payment_balance` = `total_customer_payment - total_amount_due`
   - Green if = 0: "✅ Fully Paid"
   - Yellow if > 0: "⚠️ Overpaid: €X.XX"
   - Red if < 0: "🔴 Underpaid: €X.XX"

---

## 📊 COLUMN WIDTHS (Current Defaults)

| Column | Default Width |
|--------|---------------|
| row_number | 50px |
| booking_ref | 100px |
| booking_status | 110px |
| print_invoice | 90px |
| first_name | 100px |
| middle_name | 100px |
| last_name | 100px |
| date_of_birth | 100px |
| gender | 70px |
| passport_number | 110px |
| travel_details | 150px |
| request_types | 120px |
| bank_transfer | 100px |
| cash_paid | 100px |
| lst_loan_fee | 100px |
| airlines_price | 100px |
| service_fee | 100px |
| total_ticket_price | 120px |
| lst_profit | 100px |
| commission_from_airlines | 150px |
| visa_price | 100px |
| service_visa | 100px |
| tot_visa_fees | 120px |
| total_customer_payment | 150px |
| total_amount_due | 150px |
| payment_balance | 180px |
| created_at | 130px |

---

## 🎨 VISUAL INDICATORS

### **Read-Only Fields:**
- Grey background (`var(--bg-secondary)`)
- Grey text (`var(--text-secondary)`)
- Default cursor

### **Important Fields:**
- `total_amount_due`: 
  - **Blue/Teal background** (#2196F3 or #00BCD4) to highlight importance
  - **White or dark text** for contrast
  - **Bold font weight** to emphasize significance
  - This column is critical for financial tracking

### **Color-Coded Fields:**
- `payment_balance`:
  - Green background (#4caf50) if balance = 0
  - Yellow background (#ffc107) if balance > 0
  - Red background (#f44336) if balance < 0

### **Special Fields:**
- `travel_details`: Expandable panel with toggle button
- `booking_status`: Color-coded dropdown (pending=yellow, confirmed=green, cancelled=red)

---

**End of Report**
