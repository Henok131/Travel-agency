# Universal Bank Statement Import & Extraction (Single Client)

This document describes the workflow, requirements, and technical details for importing and extracting bank statement data for a single client in the LST Travel Agency system. It is intended for developers and system integrators.

---

## 1. Overview

- **Goal:** Enable a single client to import bank statements (CSV, PDF) and extract transaction data into the system.
- **Scope:** Single-tenant mode; multi-client support will be added later.
- **Components:**
  - Frontend: Import modal (BankImportModal)
  - Backend: Import service, parsers, utilities
  - Database: Supabase/Postgres tables (bank_accounts, bank_imports, bank_transactions)

---

## 2. Import Workflow

1. **User Action:**
   - User clicks "+ Connect Bank Account" in the Bank Dashboard.
   - Import modal opens, allowing file upload (CSV, PDF).

2. **File Upload:**
   - User selects and uploads a bank statement file.
   - Modal passes `accountId` (single client, hardcoded or fetched from Supabase) to backend.

3. **Backend Processing:**
   - File is parsed using appropriate parser (CSV, PDF/OCR).
   - Transactions are extracted and normalized.
   - Data is validated (date, amount, type, reference).
   - Transactions are inserted into `bank_transactions` table, linked to `accountId`.
   - Import metadata is stored in `bank_imports` table.

4. **Frontend Update:**
   - On success, modal closes and dashboard refreshes.
   - Imported transactions appear in the dashboard.

---

## 3. Extraction Logic

- **CSV Parser:**
  - Reads rows, maps columns to transaction fields.
  - Handles date, amount, type (credit/debit), reference.
- **PDF Parser:**
  - Uses `pdfjs-dist` for browser compatibility.
  - Extracts text, applies regex to find transaction rows.
- **Normalization:**
  - Ensures consistent date format (ISO 8601).
  - Amounts are parsed as numbers, type inferred.
  - Reference/description cleaned for duplicates.

---

## 4. Database Schema (Single Client)

- `bank_accounts`: Stores account info (id, name, iban, currency, balance).
- `bank_imports`: Stores import metadata (id, account_id, filename, import_date).
- `bank_transactions`: Stores transactions (id, account_id, date, amount, type, reference, description).

---

## 5. Single Client Mode

- `accountId` is fixed or fetched for the single client.
- All imports and transactions are linked to this account.
- No organization/user scoping required at this stage.

---

## 6. Future Extensions

- Multi-client/organization support (accountId per user/org).
- API-based bank sync (in addition to file import).
- Advanced validation, duplicate detection, error handling.

---

## 7. References

- [BankImportModal.jsx](src/components/BankImportModal.jsx)
- [importService.js](src/services/importService.js)
- [csvParser.js](src/parsers/csvParser.js)
- [pdfParser.js](src/parsers/pdfParser.js)
- [Supabase schema migration guide](BACKFILL_ORGANIZATION_ID_GUIDE.md)

---

## 8. Example Import (Single Client)

1. User uploads `statement.csv` for account `123e4567-e89b-12d3-a456-426614174000`.
2. Transactions extracted:
   - Date: 2026-01-01, Amount: 1000, Type: credit, Reference: "Salary"
   - Date: 2026-01-02, Amount: -200, Type: debit, Reference: "Groceries"
3. Transactions inserted into `bank_transactions` with `account_id` = `123e4567-e89b-12d3-a456-426614174000`.
4. Import metadata stored in `bank_imports`.

---

## 9. Troubleshooting

- Ensure `accountId` matches the backend schema (TEXT/UUID).
- For browser compatibility, use `crypto.subtle` and `pdfjs-dist`.
- Recreate views if schema changes (see migration guide).

---

## 10. Contact

For questions or integration help, contact the LST Travel Agency dev team.
