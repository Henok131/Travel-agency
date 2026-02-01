# Import CSV Plan (Main Table Duplicate Flow)

Goal: Add a separate import experience (duplicate page) to load historic CSV data into `main_table` without touching the existing Main Table UI/logic, while reusing invoice generation after data lands in `main_table`.

## Scope
- Create a new page (e.g., `MainTableImport.jsx`) and route (e.g., `/main-import`) to handle CSV import.
- Keep the current Main Table untouched.
- Use `main_table` columns directly; no schema changes required.
- Batch insert to `main_table` via Supabase client; consider Edge Function only if needed for large files.

## Target Columns (main_table)
- Identity: `first_name` (req), `last_name` (req), `middle_name` (opt), `passport_number` (opt), `date_of_birth`, `gender`, `nationality`
- Travel: `departure_airport`, `destination_airport`, `travel_date`, `return_date`
- Types: `request_types` (JSON array, e.g. `["flight"]`)
- Statuses: `booking_status` (`pending|confirmed|cancelled`, default pending), `status` (keep default `draft`)
- Financial flags: `print_invoice`, `bank_transfer`, `cash_paid`
- Financial numbers (optional): `airlines_price`, `service_fee`, `visa_fee`, `tot_visa_fees`, `total_ticket_price`, `total_amount_due`, `cash_paid_to_lst_account`, `commission_from_airlines`, `lst_loan_fee`, `lst_profit`, `bank_transfer`, `cash_paid`
- Other: `booking_ref`, `notice`
- Leave `id` blank (UUID default); timestamps default.

## CSV Expectations
- Header row must match column names above (or map in UI).
- Dates: `YYYY-MM-DD`
- Booleans: `true` / `false`
- Numbers: plain decimal (no thousands separators)
- `request_types`: JSON text like `["flight"]`

## UI Flow (new import page)
1) File upload (CSV, UTF-8).
2) Preview first N rows (10–20).
3) Column mapping dropdown per target field (auto-map when headers match).
4) Validation step:
   - Required: `first_name`, `last_name`
   - Allowed `booking_status`
   - Date parse check; number parse check; JSON parse for `request_types`
5) Batch insert:
   - Chunk size: 200–500 rows
   - Show progress + per-batch errors
6) Success summary with counts; list of failed rows (row number + error).

## Data Handling
- Default `booking_status` to `pending` if missing.
- Default `request_types` to `["flight"]` if missing.
- Keep `status` default (`draft`); don’t set `id`.
- Coerce empty strings to `null` for optional fields.

## Optional Enhancements
- Downloadable sample CSV template (headers only).
- Staging table (`main_table_import_staging`) for large/dirty data; move to `main_table` after review.
- Edge Function path for very large files (upload to storage, server-side parse/insert).

## Routing/Placement
- New route: `/main-import` (or similar).
- Sidebar link labeled “Import” (optional) for admins only.
- Keep existing Main Table route unchanged.

## Reuse / Non-Changes
- Invoice generation remains unchanged; once rows are in `main_table`, existing invoice actions work.
- No changes to main table CSS/columns/editing.

## Risks / Mitigations
- Large files: use batching; consider Edge Function for >5–10k rows.
- Bad data: fail-fast per row with error list; do not partially insert a row.
- Column drift: rely on mapping step; surface unmapped columns clearly.

## Minimal Deliverable Checklist
- [ ] New component/page for import with upload, preview, mapping, validation, batch insert.
- [ ] New route wired; optional nav entry.
- [ ] Basic validation (required, dates, numbers, booking_status, request_types JSON).
- [ ] Progress + error reporting per batch.
- [ ] Sample CSV template link (optional).
