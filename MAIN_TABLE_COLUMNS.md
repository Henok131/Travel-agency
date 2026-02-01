# Main Table - All Columns List

This document lists all columns in the Main Table for building printable templates.

## Column Order (as displayed in the table)

| # | Field Name (Database) | Display Label | Data Type | Notes |
|---|----------------------|---------------|-----------|-------|
| 1 | `row_number` | # | Number | Row number (auto-generated) |
| 2 | `booking_ref` | Booking Ref | Text | Booking reference number |
| 3 | `booking_status` | Booking Status | Text | Values: Pending, Confirmed, Cancelled |
| 4 | `print_invoice` | Print Invoice | Boolean | Yes/No |
| 5 | `first_name` | First Name | Text | Required field |
| 6 | `middle_name` | Middle Name | Text | Optional |
| 7 | `last_name` | Last Name | Text | Required field |
| 8 | `date_of_birth` | Date of Birth | Date | Format: DD-MM-YYYY |
| 9 | `gender` | Gender | Text | Values: Male, Female, Other |
| 10 | `nationality` | Nationality | Text | Document nationality |
| 11 | `passport_number` | Passport Number | Text | Optional |
| 12 | `departure_airport` | Departure | Text | Airport code or name |
| 13 | `destination_airport` | Destination | Text | Airport code or name |
| 14 | `travel_date` | Travel Date | Date | Format: DD-MM-YYYY |
| 15 | `return_date` | Return Date | Date | Format: DD-MM-YYYY |
| 16 | `request_types` | Request Types | Array | Values: Flight, Visa, Package, Other (comma-separated) |
| 17 | `bank_transfer` | Bank Transfer | Boolean | Yes/No |
| 18 | `cash_paid` | Cash Paid | Boolean | Yes/No |
| 19 | `lst_loan_fee` | LST Loan Fee | Numeric | Decimal number |
| 20 | `airlines_price` | Airlines Price | Numeric | Decimal number |
| 21 | `lst_profit` | LST Profit | Numeric | Decimal number |
| 22 | `commission_from_airlines` | Commission from Airlines | Numeric | Decimal number |
| 23 | `visa_fee` | Visa Fee | Numeric | Decimal number |
| 24 | `cash_paid_to_lst_account` | Cash Paid to LST Account | Numeric | Decimal number |
| 25 | `profit` | Profit | Numeric | Decimal number |
| 26 | `notice` | Notice | Text | Multiline text field |
| 27 | `created_at` | Created At | DateTime | Format: DD-MM-YYYY, HH:MM |

## Complete List (Field Names Only)

1. `row_number`
2. `booking_ref`
3. `booking_status`
4. `print_invoice`
5. `first_name`
6. `middle_name`
7. `last_name`
8. `date_of_birth`
9. `gender`
10. `nationality`
11. `passport_number`
12. `departure_airport`
13. `destination_airport`
14. `travel_date`
15. `return_date`
16. `request_types`
17. `bank_transfer`
18. `cash_paid`
19. `lst_loan_fee`
20. `airlines_price`
21. `lst_profit`
22. `commission_from_airlines`
23. `visa_fee`
24. `cash_paid_to_lst_account`
25. `profit`
26. `notice`
27. `created_at`

## Complete List (Display Labels Only)

1. #
2. Booking Ref
3. Booking Status
4. Print Invoice
5. First Name
6. Middle Name
7. Last Name
8. Date of Birth
9. Gender
10. Nationality
11. Passport Number
12. Departure
13. Destination
14. Travel Date
15. Return Date
16. Request Types
17. Bank Transfer
18. Cash Paid
19. LST Loan Fee
20. Airlines Price
21. LST Profit
22. Commission from Airlines
23. Visa Fee
24. Cash Paid to LST Account
25. Profit
26. Notice
27. Created At

## Column Categories

### Identification & Status
- Row Number (#)
- Booking Ref
- Booking Status
- Print Invoice
- Created At

### Passenger Information
- First Name
- Middle Name
- Last Name
- Date of Birth
- Gender
- Nationality
- Passport Number

### Travel Information
- Departure Airport
- Destination Airport
- Travel Date
- Return Date
- Request Types

### Financial Information
- Bank Transfer
- Cash Paid
- LST Loan Fee
- Airlines Price
- LST Profit
- Commission from Airlines
- Visa Fee
- Cash Paid to LST Account
- Profit

### Additional Information
- Notice

## Notes for Template Building

1. **Date Format**: All dates are stored as DATE in database but displayed as DD-MM-YYYY
2. **DateTime Format**: `created_at` is displayed as "DD-MM-YYYY, HH:MM"
3. **Boolean Fields**: Displayed as "Yes" or "No" (fields: `print_invoice`, `bank_transfer`, `cash_paid`)
4. **Numeric Fields**: All financial fields are decimal numbers (can have 2 decimal places)
5. **Request Types**: Stored as JSONB array, displayed as comma-separated values
6. **Notice Field**: Multiline text field that preserves line breaks
7. **Required Fields**: `first_name` and `last_name` are required (NOT NULL in database)

## Database Table

All these columns are from the `main_table` table in Supabase.
