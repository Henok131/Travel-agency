# LST Travel - Database Schema Design

## Overview
This document defines the database schema for the Request system with a **MANUAL-FIRST workflow** and **OPTIONAL OCR**. Passport/document uploads exist **only in temporary upload session (browser memory and/or short-lived backend memory)** - they are never stored in database or object storage. Once "Create Request" is clicked, only extracted/entered text fields are saved, and the passport file is immediately destroyed.

---

## Table: `requests`

Main table storing travel request information with extracted passenger and document data.

### Columns

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique request identifier |
| `first_name` | TEXT | NOT NULL | Passenger first name (manually entered or OCR-extracted) |
| `middle_name` | TEXT | NULLABLE | Passenger middle name(s) (manually entered or OCR-extracted) |
| `last_name` | TEXT | NOT NULL | Passenger last name (manually entered or OCR-extracted) |
| `date_of_birth` | DATE | NULLABLE | Passenger date of birth (manually entered or OCR-extracted) |
| `gender` | TEXT | NULLABLE | Gender (M/F/Other) - manually entered or OCR-extracted |
| `nationality` | TEXT | NULLABLE | Document nationality (manually entered or OCR-extracted) |
| `passport_number` | TEXT | NULLABLE | Passport number (manually entered or OCR-extracted) |
| `passport_expiry_date` | DATE | NULLABLE | Passport expiration date (manually entered or OCR-extracted) |
| `residence_permit_expiry_date` | DATE | NULLABLE | Residence permit expiration (manually entered or OCR-extracted) |
| `departure_airport` | TEXT | NULLABLE | Airport code or full name |
| `destination_airport` | TEXT | NULLABLE | Airport code or full name |
| `travel_date` | DATE | NULLABLE | Departure date |
| `return_date` | DATE | NULLABLE | Return date |
| `request_types` | JSONB | DEFAULT '[]' | Array of request types: ["flight", "visa", "package", "other"] |
| `status` | TEXT | NOT NULL, DEFAULT 'draft' | Status: 'draft', 'submitted', 'cancelled' |
| `is_demo` | BOOLEAN | DEFAULT false | Flag for demo/test data |
| `ocr_source` | TEXT | NULLABLE | Source of OCR extraction (e.g., 'tesseract', 'azure-vision', 'google-vision') |
| `ocr_confidence` | DECIMAL(5,2) | NULLABLE | OCR confidence score (0.00 to 100.00) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

### Indexes
- `idx_requests_status` ON `requests(status)`
- `idx_requests_created_at` ON `requests(created_at DESC)`
- `idx_requests_is_demo` ON `requests(is_demo)` WHERE `is_demo = true`
- `idx_requests_request_types` ON `requests USING GIN(request_types)` (for JSONB queries)

---

## Workflow: Manual-First with Optional OCR

### STRICT PASSPORT VISIBILITY RULE (NON-NEGOTIABLE)
**Once a passport is uploaded, it MUST remain visible, zoomable, and navigable (PDF pages) until the user clicks "Create Request".**

This applies to BOTH manual-only and OCR-assisted workflows.

---

### WORKFLOW 1: Manual-First (DEFAULT)

1. **Upload Passport**
   - User selects passport file (PDF, PNG, JPEG, JPG)
   - File is loaded into **temporary upload session (browser memory and/or short-lived backend memory)**
   - **No database record created yet**
   - **No file storage (database or object storage)**

2. **Passport Preview Appears**
   - Passport renders in UI (PDF viewer or image viewer)
   - User can zoom, navigate pages, rotate
   - **Passport remains visible throughout entire form filling**

3. **User Manually Fills Fields**
   - User types all fields while viewing passport
   - All fields remain editable
   - Form data exists only in browser state (not in database)

4. **User Double-Checks**
   - User reviews entered values against visible passport
   - Can edit any field at any time

5. **User Clicks "Create Request"**
   - **Only text fields are saved to `requests` table**
   - Passport file in temporary upload session is immediately destroyed
   - Passport preview disappears
   - Request record created with status `'draft'` (created but not submitted)

---

### WORKFLOW 2: OCR-Assisted (OPTIONAL BUTTON)

1. **Upload Passport**
   - User selects passport file (PDF, PNG, JPEG, JPG)
   - File is loaded into **temporary upload session (browser memory and/or short-lived backend memory)**
   - **No database record created yet**
   - **No file storage (database or object storage)**

2. **Passport Preview Appears**
   - Passport renders in UI (PDF viewer or image viewer)
   - User can zoom, navigate pages, rotate
   - **Passport remains visible throughout entire process**

3. **User Clicks "Extract with OCR" Button** (OPTIONAL)
   - OCR service processes passport from browser memory
   - OCR fills form fields with extracted data
   - OCR metadata captured: `ocr_source`, `ocr_confidence`
   - **All fields remain editable** - OCR does NOT block manual editing
   - **OCR does NOT auto-confirm** - user must review

4. **User Manually Reviews and Edits**
   - User reviews OCR-extracted fields
   - User edits any incorrect fields while passport is visible
   - User can type over OCR values
   - User can clear fields and re-enter manually

5. **User Double-Checks**
   - User verifies all values against visible passport
   - Can edit any field at any time

6. **User Clicks "Create Request"**
   - **Only text fields are saved to `requests` table** (including `ocr_source` and `ocr_confidence` if OCR was used)
   - Passport file in temporary upload session is immediately destroyed
   - Passport preview disappears
   - Request record created with status `'draft'` (created but not submitted)

---

## Temporary Upload Session Concept

### How Temporary Upload Session Works

**Before "Create Request" Click:**
- Passport file exists **only in temporary upload session (browser memory and/or short-lived backend memory)**
- No database record exists (client-only state)
- No file storage (Supabase Storage or any object storage)
- No link between passport and request_id (because request doesn't exist yet)
- Passport is held in frontend component state (React/Vue) and/or short-lived backend session
- Passport can be previewed via `URL.createObjectURL()` for display (if in browser memory)

**Page Refresh Rule:**
- If the page is refreshed before clicking "Create Request", the temporary passport session and all unsaved form data are cleared
- User must re-upload passport and re-enter form data

**After "Create Request" Click:**
- Request record is created in `requests` table (text fields only) with status `'draft'`
- Status `'draft'` means: request has been created but not yet submitted
- Passport file is immediately destroyed from temporary upload session
- Object URL is revoked (`URL.revokeObjectURL()`)
- Passport preview disappears
- **No trace of passport file exists anywhere**

### Technical Implementation Notes

1. **Temporary Upload Session Storage**
   - File stored as `File` or `Blob` object in browser JavaScript memory, and/or
   - File temporarily held in short-lived backend memory for OCR processing
   - Accessed via `URL.createObjectURL(file)` for preview (if in browser memory)
   - OCR processing may temporarily hold file in backend memory, then immediately discards after extraction
   - All file data destroyed immediately after form submission

2. **No Backend File Storage**
   - No Supabase Storage bucket needed
   - No database file records
   - No file_path or file_url columns
   - OCR processing sends file temporarily to backend memory (if backend OCR), discards immediately after extraction

3. **Session State Management**
   - Form state in frontend (React state, Vue data, etc.)
   - Passport file reference in component state and/or short-lived backend session
   - All data ephemeral until "Create Request" click
   - Page refresh clears all temporary session data (passport and form fields)

---

## Manual-First + OCR-Optional Coexistence

### Design Principles

1. **Manual-First as Default**
   - Users can complete entire form manually
   - No OCR required
   - OCR is purely optional convenience feature
   - `ocr_source` and `ocr_confidence` are NULL for manual-only entries

2. **OCR Never Blocks Manual Entry**
   - User can type in any field at any time
   - OCR values are suggestions, not locked
   - User can partially use OCR (some fields) and manually fill others
   - User can ignore OCR completely and type everything

3. **OCR Never Auto-Confirms**
   - OCR does not automatically submit
   - User must manually click "Create Request"
   - User must manually verify OCR output
   - All OCR-extracted fields remain editable

4. **Both Workflows Share Same Schema**
   - Same `requests` table structure
   - OCR fields are optional (NULL for manual-only)
   - No workflow-specific columns needed
   - Database doesn't know or care which workflow was used

---

## OCR Fields Explanation

### `ocr_source` (TEXT, NULLABLE)
- Records which OCR service/engine was used to extract the text
- Examples: `'tesseract'`, `'azure-computer-vision'`, `'google-cloud-vision'`, `'aws-textract'`
- NULL if data was entered manually without OCR

### `ocr_confidence` (DECIMAL(5,2), NULLABLE)
- OCR confidence score ranging from 0.00 to 100.00
- Indicates how confident the OCR engine was in the extraction
- Lower scores may indicate poor image quality or unclear text
- NULL if data was entered manually without OCR

**Use Cases:**
- Quality control: Flag low-confidence extractions for manual review
- Audit trail: Track which OCR service performed best
- User guidance: Show confidence indicator in UI to prompt verification

---

## Request Types (Multi-Select)

Using JSONB array for simplicity:
- `request_types JSONB DEFAULT '[]'`
- Valid values: `["flight"]`, `["visa"]`, `["flight", "visa"]`, `["package"]`, etc.
- Query example: `WHERE request_types @> '["flight"]'::jsonb`

---

## Status Values

**Status Semantics:**
- **Before "Create Request"**: No request record exists (client-only state)
- **After "Create Request"**: Request record created with status `'draft'`

**Status Definitions:**
- `draft`: Request has been created but not yet submitted (user can still edit)
- `submitted`: Request has been submitted for processing
- `cancelled`: Request was cancelled

---

## Design Decisions

### ✅ **Why No File Storage?**

1. **Privacy**: Documents are never stored, only temporarily held in upload session during form filling
2. **Storage Costs**: No persistent file storage infrastructure needed (no Supabase Storage, no S3, no file system)
3. **Simplicity**: Single table schema, no file management complexity
4. **Compliance**: Zero document retention - documents exist only during active form session
5. **Performance**: No persistent file upload/download overhead
6. **Security**: No attack surface for file storage vulnerabilities
7. **Session-Based**: Documents live only in temporary upload session (browser memory and/or short-lived backend memory) during form completion

### ✅ **Why OCR Fields?**

1. **Quality Control**: Track extraction quality for review processes
2. **Audit Trail**: Know which OCR service extracted what data
3. **User Experience**: Show confidence scores to guide manual verification
4. **Debugging**: Help troubleshoot extraction issues

---

## Next Steps (NOT YET)

1. ✅ Schema design (THIS DOCUMENT)
2. ⏸️ Wait for approval
3. ⏸️ Create migration SQL
4. ⏸️ Apply migration to database
5. ⏸️ Configure Row Level Security (RLS) policies

---

## Summary

**Table:**
- `requests` - Single table storing all request data with extracted text fields only

**File Handling:**
- Files exist **only in temporary upload session (browser memory and/or short-lived backend memory)** during form filling
- Files **never stored** in database or object storage
- Files remain **visible and zoomable** until "Create Request" clicked
- Page refresh before "Create Request" clears temporary session and unsaved form data
- Only extracted/entered text fields stored in database
- Files **immediately destroyed** after "Create Request" click
- OCR metadata (`ocr_source`, `ocr_confidence`) stored only if OCR was used (NULL for manual-only)

**Key Design Decisions:**
- **Manual-first workflow** - users type fields while viewing passport
- **OCR optional** - convenience feature, never required
- **Zero persistent file storage** - files exist only in temporary upload session (browser memory and/or short-lived backend memory)
- **Strict passport visibility** - passport must remain visible until "Create Request"
- **Page refresh clears session** - temporary passport and unsaved form data cleared on refresh
- **Text-only database** - only extracted/entered text fields stored
- **Status semantics** - no record exists before "Create Request"; `'draft'` means created but not submitted
- **OCR metadata optional** - NULL for manual-only entries
- JSONB for request_types (multi-select)
- UUID primary keys for distributed systems compatibility
