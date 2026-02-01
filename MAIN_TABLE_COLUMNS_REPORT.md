# Main Table Columns Report
**Generated:** 2026-01-19  
**Table:** `main_table`  
**Total Columns:** 33

---

## Column List (In Display Order)

### 1. Row Number
- **Field Name:** `row_number`
- **Type:** Computed (not in database)
- **Editable:** No
- **Description:** Sequential row number displayed in the table
- **Display Label:** `#`

---

### 2. Booking Reference
- **Field Name:** `booking_ref`
- **Type:** TEXT
- **Editable:** Yes
- **Description:** Booking reference number
- **Display Label:** `BOOKING REF`

---

### 3. Booking Status
- **Field Name:** `booking_status`
- **Type:** TEXT (default: 'pending')
- **Editable:** Yes (Dropdown)
- **Values:** `pending`, `confirmed`, `cancelled`
- **Description:** Current status of the booking with color-coded dropdown
- **Display Label:** `BOOKING STATUS`
- **Special:** Color-coded (Yellow: Pending, Green: Confirmed, Red: Cancelled)

---

### 4. Print Invoice
- **Field Name:** `print_invoice`
- **Type:** BOOLEAN (default: false)
- **Editable:** Yes (Checkbox)
- **Description:** Flag to indicate if invoice should be printed
- **Display Label:** `PRINT INVOICE`

---

### 5. First Name
- **Field Name:** `first_name`
- **Type:** TEXT (NOT NULL)
- **Editable:** Yes
- **Description:** Passenger's first name
- **Display Label:** `FIRST NAME`

---

### 6. Middle Name
- **Field Name:** `middle_name`
- **Type:** TEXT
- **Editable:** Yes
- **Description:** Passenger's middle name(s)
- **Display Label:** `MIDDLE NAME`

---

### 7. Last Name
- **Field Name:** `last_name`
- **Type:** TEXT (NOT NULL)
- **Editable:** Yes
- **Description:** Passenger's last name
- **Display Label:** `LAST NAME`

---

### 8. Date of Birth
- **Field Name:** `date_of_birth`
- **Type:** DATE
- **Editable:** Yes
- **Description:** Passenger's date of birth
- **Display Label:** `DATE OF BIRTH`
- **Format:** DD-MM-YYYY

---

### 9. Gender
- **Field Name:** `gender`
- **Type:** TEXT
- **Editable:** Yes (Dropdown)
- **Values:** `M`, `F`, `Other`
- **Description:** Passenger's gender
- **Display Label:** `GENDER`

---

### 10. Nationality
- **Field Name:** `nationality`
- **Type:** TEXT
- **Editable:** Yes
- **Description:** Passenger's nationality
- **Display Label:** `NATIONALITY`

---

### 11. Passport Number
- **Field Name:** `passport_number`
- **Type:** TEXT
- **Editable:** Yes
- **Description:** Passport number
- **Display Label:** `PASSPORT NUMBER`

---

### 12. Departure Airport
- **Field Name:** `departure_airport`
- **Type:** TEXT
- **Editable:** Yes
- **Description:** Departure airport code or name
- **Display Label:** `DEPARTURE AIRPORT`

---

### 13. Destination Airport
- **Field Name:** `destination_airport`
- **Type:** TEXT
- **Editable:** Yes
- **Description:** Destination airport code or name
- **Display Label:** `DESTINATION AIRPORT`

---

### 14. Travel Date
- **Field Name:** `travel_date`
- **Type:** DATE
- **Editable:** Yes
- **Description:** Departure date
- **Display Label:** `TRAVEL DATE`
- **Format:** DD-MM-YYYY

---

### 15. Return Date
- **Field Name:** `return_date`
- **Type:** DATE
- **Editable:** Yes
- **Description:** Return date
- **Display Label:** `RETURN DATE`
- **Format:** DD-MM-YYYY

---

### 16. Request Types
- **Field Name:** `request_types`
- **Type:** JSONB (default: '[]')
- **Editable:** Yes (Comma-separated input)
- **Values:** `flight`, `visa`, `package`, `other`
- **Description:** Array of request types (multi-select)
- **Display Label:** `REQUEST TYPES`

---

### 17. Bank Transfer
- **Field Name:** `bank_transfer`
- **Type:** NUMERIC(10,2)
- **Editable:** Yes
- **Description:** Amount paid via bank transfer
- **Display Label:** `BANK TRANSFER`
- **Note:** Changed from BOOLEAN to NUMERIC

---

### 18. Cash Paid
- **Field Name:** `cash_paid`
- **Type:** NUMERIC(10,2)
- **Editable:** Yes
- **Description:** Amount paid in cash
- **Display Label:** `CASH PAID`
- **Note:** Changed from BOOLEAN to NUMERIC

---

### 19. LST Loan Fee
- **Field Name:** `lst_loan_fee`
- **Type:** NUMERIC(10,2)
- **Editable:** Yes
- **Description:** Loan fee charged by LST
- **Display Label:** `LST LOAN FEE`

---

### 20. Airlines
- **Field Name:** `airlines`
- **Type:** TEXT
- **Editable:** Yes (Autocomplete)
- **Description:** Airline name with code (e.g., "ET Ethiopian Airlines")
- **Display Label:** `AIRLINES`
- **Special:** Autocomplete search by name, code, or country

---

### 21. Airlines Price
- **Field Name:** `airlines_price`
- **Type:** NUMERIC(10,2)
- **Editable:** Yes
- **Description:** Base price from airline
- **Display Label:** `AIRLINES PRICE`
- **Validation:** Positive numbers only (min: 0)

---

### 22. Service Fee
- **Field Name:** `service_fee`
- **Type:** NUMERIC(10,2)
- **Editable:** Yes
- **Description:** Service fee for ticket processing
- **Display Label:** `SERVICE FEE`
- **Validation:** Positive numbers only (min: 0)

---

### 23. Total Ticket Price
- **Field Name:** `total_ticket_price`
- **Type:** NUMERIC(10,2)
- **Editable:** No (Auto-calculated)
- **Description:** Total ticket price (airlines_price + service_fee)
- **Display Label:** `TOTAL TICKET PRICE`
- **Calculation:** `service_fee + airlines_price = total_ticket_price`
- **Special:** Read-only, updates in real-time

---

### 24. LST Profit
- **Field Name:** `lst_profit`
- **Type:** NUMERIC(10,2)
- **Editable:** Yes
- **Description:** Profit earned by LST
- **Display Label:** `LST PROFIT`

---

### 25. Commission from Airlines
- **Field Name:** `commission_from_airlines`
- **Type:** NUMERIC(10,2)
- **Editable:** Yes
- **Description:** Commission received from airlines
- **Display Label:** `COMMISSION FROM AIRLINES`

---

### 26. Visa Price
- **Field Name:** `visa_price`
- **Type:** NUMERIC(10,2)
- **Editable:** Yes
- **Description:** Base visa price
- **Display Label:** `VISA PRICE`
- **Note:** New column (replaces old visa_fee)

---

### 27. Service Visa
- **Field Name:** `service_visa`
- **Type:** NUMERIC(10,2)
- **Editable:** Yes
- **Description:** Service fee for visa processing
- **Display Label:** `SERVICE VISA`
- **Note:** New column

---

### 28. Total Visa Fees
- **Field Name:** `tot_visa_fees`
- **Type:** NUMERIC(10,2)
- **Editable:** No (Auto-calculated)
- **Description:** Total visa fees (visa_price + service_visa)
- **Display Label:** `TOTAL VISA FEES`
- **Calculation:** `visa_price + service_visa = tot_visa_fees`
- **Special:** Read-only, updates in real-time
- **Note:** New column

---

### 29. Total Customer Payment
- **Field Name:** `total_customer_payment`
- **Type:** NUMERIC(10,2)
- **Editable:** No (Auto-calculated)
- **Description:** Total customer payment to LST (mixed payment: cash + bank transfer)
- **Display Label:** `TOTAL CUSTOMER PAYMENT`
- **Calculation:** `cash_paid + bank_transfer = total_customer_payment`
- **Special:** Read-only, updates in real-time

---

### 30. Profit
- **Field Name:** `profit`
- **Type:** NUMERIC(10,2)
- **Editable:** Yes
- **Description:** Overall profit
- **Display Label:** `PROFIT`

---

### 31. Notice
- **Field Name:** `notice`
- **Type:** TEXT
- **Editable:** Yes (Multiline)
- **Description:** Notes and additional information
- **Display Label:** `NOTICE`
- **Special:** Multiline text field, Excel-like behavior

---

### 32. Created At
- **Field Name:** `created_at`
- **Type:** TIMESTAMPTZ (default: NOW())
- **Editable:** No
- **Description:** Record creation timestamp
- **Display Label:** `CREATED AT`
- **Format:** DD-MM-YYYY, HH:MM

---

## Columns Not Displayed in Table (System Fields)

### ID
- **Field Name:** `id`
- **Type:** UUID (PRIMARY KEY)
- **Editable:** No
- **Description:** Unique booking identifier

### Status
- **Field Name:** `status`
- **Type:** TEXT (default: 'draft')
- **Editable:** No (System field)
- **Values:** `draft`, `submitted`, `cancelled`
- **Description:** Request status (system field)

### Is Demo
- **Field Name:** `is_demo`
- **Type:** BOOLEAN (default: false)
- **Editable:** No (System field)
- **Description:** Flag for demo/test data

### OCR Source
- **Field Name:** `ocr_source`
- **Type:** TEXT
- **Editable:** No (System field)
- **Description:** Source of OCR extraction

### OCR Confidence
- **Field Name:** `ocr_confidence`
- **Type:** DECIMAL(5,2)
- **Editable:** No (System field)
- **Description:** OCR confidence score (0.00 to 100.00)

### Updated At
- **Field Name:** `updated_at`
- **Type:** TIMESTAMPTZ (default: NOW())
- **Editable:** No (System field)
- **Description:** Last update timestamp

### Cash Paid to LST Account
- **Field Name:** `cash_paid_to_lst_account`
- **Type:** NUMERIC(10,2)
- **Editable:** No (Auto-calculated, same as total_customer_payment)
- **Description:** Total customer payment to LST (logical field, same as total_customer_payment)

### Visa Fee (Deprecated)
- **Field Name:** `visa_fee`
- **Type:** NUMERIC(10,2)
- **Editable:** No (Deprecated)
- **Description:** Old visa fee column (replaced by visa_price, service_visa, tot_visa_fees)
- **Note:** Still exists in database but not displayed. Can be dropped after migration verification.

---

## Summary Statistics

- **Total Columns in Database:** 40
- **Columns Displayed in Table:** 33
- **Editable Columns:** 28
- **Read-Only Columns:** 5 (row_number, total_ticket_price, tot_visa_fees, total_customer_payment, created_at)
- **Auto-Calculated Columns:** 3 (total_ticket_price, tot_visa_fees, total_customer_payment)
- **Dropdown Columns:** 2 (booking_status, gender)
- **Date Columns:** 3 (date_of_birth, travel_date, return_date)
- **Numeric Columns:** 12
- **Text Columns:** 18

---

## Calculation Logic

### Auto-Calculated Fields

1. **Total Ticket Price**
   - Formula: `service_fee + airlines_price = total_ticket_price`
   - Updates in real-time when editing `service_fee` or `airlines_price`

2. **Total Visa Fees**
   - Formula: `visa_price + service_visa = tot_visa_fees`
   - Updates in real-time when editing `visa_price` or `service_visa`

3. **Total Customer Payment**
   - Formula: `cash_paid + bank_transfer = total_customer_payment`
   - Updates in real-time when editing `cash_paid` or `bank_transfer`

---

## Column Groups

### Passenger Information (Columns 5-10)
- first_name, middle_name, last_name, date_of_birth, gender, nationality

### Travel Information (Columns 11-15)
- passport_number, departure_airport, destination_airport, travel_date, return_date

### Financial - Tickets (Columns 21-23)
- airlines_price, service_fee, total_ticket_price

### Financial - Visa (Columns 26-28)
- visa_price, service_visa, tot_visa_fees

### Financial - Payments (Columns 17-18, 29)
- bank_transfer, cash_paid, total_customer_payment

### Financial - Profit (Columns 19, 24-25, 30)
- lst_loan_fee, lst_profit, commission_from_airlines, profit

---

## Notes

- All numeric fields support decimal values (NUMERIC(10,2))
- Date fields use DD-MM-YYYY format in display
- Booking status has color-coded dropdown (Yellow: Pending, Green: Confirmed, Red: Cancelled)
- Airlines column uses autocomplete with search by name, code, or country
- Notice column supports multiline text with Excel-like behavior
- All columns are resizable via drag handles on column headers
- Row height is compact (24px) with reduced padding (3px vertical)

---

**Report End**
