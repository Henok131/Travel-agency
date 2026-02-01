# LST Travel - Backend & Database Status Report
**Generated:** 2026-01-12  
**Scope:** Requests Feature - Full Lifecycle Analysis  
**Type:** READ-ONLY Analysis (No Code Changes)

---

## 1. DATABASE SCHEMA STATUS

### ✅ Fully Implemented Tables

#### Table: `requests`
**Status:** ✅ **FULLY IMPLEMENTED**

**Primary Key:**
- `id` (UUID) - Auto-generated with `uuid_generate_v4()`

**Columns:**

| Column Name | Data Type | Nullable | Required | Notes |
|------------|-----------|----------|----------|-------|
| `id` | UUID | NO | YES | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| `first_name` | TEXT | NO | YES | NOT NULL constraint |
| `middle_name` | TEXT | YES | NO | Nullable |
| `last_name` | TEXT | NO | YES | NOT NULL constraint |
| `date_of_birth` | DATE | YES | NO | Nullable |
| `gender` | TEXT | YES | NO | Nullable (M/F/Other) |
| `nationality` | TEXT | YES | NO | Nullable |
| `passport_number` | TEXT | YES | NO | Nullable |
| `departure_airport` | TEXT | YES | NO | Nullable |
| `destination_airport` | TEXT | YES | NO | Nullable |
| `travel_date` | DATE | YES | NO | Nullable |
| `return_date` | DATE | YES | NO | Nullable |
| `request_types` | JSONB | NO | YES | NOT NULL, DEFAULT '[]' |
| `status` | TEXT | NO | YES | NOT NULL, DEFAULT 'draft' |
| `is_demo` | BOOLEAN | NO | YES | NOT NULL, DEFAULT false |
| `ocr_source` | TEXT | YES | NO | Nullable (for future OCR) |
| `ocr_confidence` | DECIMAL(5,2) | YES | NO | Nullable (for future OCR) |
| `created_at` | TIMESTAMPTZ | NO | YES | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | NO | YES | NOT NULL, DEFAULT NOW() |

**Foreign Keys:** None

**Indexes:**
- ✅ `idx_requests_status` ON `requests(status)`
- ✅ `idx_requests_created_at` ON `requests(created_at DESC)`
- ✅ `idx_requests_is_demo` ON `requests(is_demo) WHERE is_demo = true`
- ✅ `idx_requests_request_types` ON `requests USING GIN(request_types)`

**Schema Location:** `001_create_requests.sql`

---

### ⚠️ Schema Gaps (Design vs Implementation)

**Fields in Design Document (`DATABASE_SCHEMA_DESIGN.md`) but NOT in Actual Schema:**
- ❌ `passport_expiry_date` (DATE) - Documented but not implemented
- ❌ `residence_permit_expiry_date` (DATE) - Documented but not implemented

**Impact:** These fields are mentioned in design docs but do not exist in the actual database schema. No UI fields reference these, so no immediate impact.

---

### ❌ Missing Tables (Implied by UI/Navigation)

**Navigation items that suggest future tables (NOT YET IMPLEMENTED):**
- `bookings` - Referenced in sidebar navigation, no table exists
- `invoices` - Referenced in sidebar navigation, no table exists
- `expenses` - Referenced in sidebar navigation, no table exists
- `customers` - Referenced in sidebar navigation, no table exists

**Status:** These are UI placeholders only. No database tables exist.

---

## 2. BACKEND API STATUS

### Architecture: Supabase Direct Client (No Traditional Backend)

**Important:** This application uses **Supabase client library directly from the frontend**. There is **NO traditional REST API backend**. All database operations go through Supabase's auto-generated REST API via the `@supabase/supabase-js` client.

---

### ✅ Implemented Operations (via Supabase Client)

#### Operation 1: INSERT Request
- **Method:** `supabase.from('requests').insert([dbData]).select()`
- **Location:** `src/pages/CreateRequest.jsx:955-958`
- **Status:** ✅ **FULLY IMPLEMENTED AND WORKING**
- **Request Payload:**
  ```javascript
  {
    first_name: string | null,
    middle_name: string | null,
    last_name: string | null,
    date_of_birth: string | null,  // YYYY-MM-DD format
    gender: string | null,          // "M", "F", "Other"
    nationality: string | null,
    passport_number: string | null,
    departure_airport: string | null,
    destination_airport: string | null,
    travel_date: string | null,     // YYYY-MM-DD format
    return_date: string | null,     // YYYY-MM-DD format
    request_types: string[],        // JSONB array: ["flight", "visa", etc.]
    status: "draft",                // Always "draft" on insert
    is_demo: false,                 // Always false
    ocr_source: null,                // Always null (OCR not implemented)
    ocr_confidence: null            // Always null (OCR not implemented)
  }
  ```
- **Response:** Returns inserted record with all fields including `id`, `created_at`, `updated_at`
- **Error Handling:** ✅ Implemented (throws error, shows user message)

---

#### Operation 2: SELECT All Requests
- **Method:** `supabase.from('requests').select('*').order('created_at', { ascending: false })`
- **Location:** `src/pages/RequestsList.jsx:218-221`
- **Status:** ✅ **FULLY IMPLEMENTED AND WORKING**
- **Request Payload:** None (no filters, no pagination)
- **Response:** Array of all request records
- **Pagination:** ❌ **NOT IMPLEMENTED** - Fetches all records at once
- **Filtering:** ❌ **NOT IMPLEMENTED** - No WHERE clauses
- **Joins:** ❌ **NOT APPLICABLE** - Single table only

---

#### Operation 3: UPDATE Single Cell
- **Method:** `supabase.from('requests').update(updateData).eq('id', rowId)`
- **Location:** `src/pages/RequestsList.jsx:410-413`
- **Status:** ✅ **FULLY IMPLEMENTED AND WORKING**
- **Request Payload:**
  ```javascript
  {
    [fieldName]: value  // Single field update
  }
  ```
- **Response:** No data returned (only error check)
- **Update Strategy:** Cell-by-cell updates (Excel-like inline editing)
- **Optimistic Updates:** ✅ Implemented (UI updates before backend confirmation)
- **Rollback on Error:** ✅ Implemented (reverts to original state on error)

---

### ❌ Missing Operations

**Operations NOT implemented:**
- ❌ DELETE request - No delete functionality exists
- ❌ Bulk UPDATE - Only single-cell updates supported
- ❌ Filtered SELECT - No filtering by status, date range, etc.
- ❌ Pagination - All records loaded at once
- ❌ Search - No search functionality
- ❌ Export - No data export functionality

---

### ⚠️ Backend Architecture Notes

**No Traditional Backend:**
- No Express.js, FastAPI, or similar backend server
- No custom REST API endpoints
- No server-side validation
- No server-side business logic
- All operations go directly from React frontend → Supabase

**Supabase Configuration:**
- Client initialized in `src/lib/supabase.js`
- Uses environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Configuration file: `env.local` (contains actual credentials)

**Security Implications:**
- ⚠️ **HIGH RISK:** Using anon key directly in frontend
- ⚠️ **MISSING:** Row Level Security (RLS) policies not verified
- ⚠️ **MISSING:** No backend validation layer
- ⚠️ **MISSING:** No rate limiting
- ⚠️ **MISSING:** No authentication/authorization checks in code

---

## 3. INSERT / UPDATE FLOW

### INSERT Flow (Create Request)

**Step-by-Step Trace:**

1. **Frontend Form** (`CreateRequest.jsx`)
   - User fills form fields
   - Form data stored in React state: `formData`
   - Date format: DD-MM-YYYY (user input)

2. **Form Submission** (`handleCreateRequest` function)
   - User clicks "Create Request" button
   - Validation: Only `firstName` and `lastName` are required (frontend only)
   - Date conversion: DD-MM-YYYY → YYYY-MM-DD (PostgreSQL format)
   - Request types: Checkbox array → JSONB array

3. **Data Mapping** (Lines 934-952)
   ```javascript
   dbData = {
     first_name: formData.firstName || null,
     middle_name: formData.middleName || null,
     last_name: formData.lastName || null,
     date_of_birth: convertDateToISO(formData.dateOfBirth),
     gender: formData.gender || null,
     nationality: formData.nationality || null,
     passport_number: formData.passportNumber || null,
     departure_airport: formData.departureAirport || null,
     destination_airport: formData.destinationAirport || null,
     travel_date: convertDateToISO(formData.travelDate),
     return_date: convertDateToISO(formData.returnDate),
     request_types: selectedRequestTypes,  // Array
     status: 'draft',                      // Always 'draft'
     is_demo: false,                       // Always false
     ocr_source: null,                     // Always null
     ocr_confidence: null                  // Always null
   }
   ```

4. **Database Insert** (Line 955-958)
   - Direct Supabase client call
   - No intermediate API layer
   - Returns inserted record

5. **Post-Insert Actions**
   - Clear form state
   - Destroy passport preview (blob URL revoked)
   - Show success message
   - Redirect to `/requests` page

---

### ✅ Fields Actually Saved to DB

**All form fields are saved:**
- ✅ `first_name` - Required, always saved
- ✅ `middle_name` - Optional, saved as null if empty
- ✅ `last_name` - Required, always saved
- ✅ `date_of_birth` - Optional, converted to ISO format
- ✅ `gender` - Optional, saved as null if empty
- ✅ `nationality` - Optional, saved as null if empty
- ✅ `passport_number` - Optional, saved as null if empty
- ✅ `departure_airport` - Optional, saved as null if empty
- ✅ `destination_airport` - Optional, saved as null if empty
- ✅ `travel_date` - Optional, converted to ISO format
- ✅ `return_date` - Optional, converted to ISO format
- ✅ `request_types` - Always saved as JSONB array (empty array if none selected)

---

### ❌ Fields NOT Persisted

**Fields shown in UI but NOT saved:**
- ❌ **Passport file** - Never saved (browser memory only, destroyed after submit)
- ❌ **Passport preview URL** - Temporary blob URL, not persisted

**Fields in DB but NOT shown in UI:**
- ⚠️ `status` - Exists in DB but removed from table display (user requested removal)
- ⚠️ `is_demo` - Exists in DB but never shown in UI
- ⚠️ `ocr_source` - Exists in DB but always null (OCR not implemented)
- ⚠️ `ocr_confidence` - Exists in DB but always null (OCR not implemented)
- ⚠️ `updated_at` - Exists in DB but not shown in UI

---

### Validation Status

**Frontend Validation:**
- ✅ Required fields: `firstName`, `lastName` (button disabled if missing)
- ✅ Date format validation: DD-MM-YYYY pattern check
- ✅ Date range validation: Basic checks (day 1-31, month 1-12, year 1900-2100)
- ❌ No email validation
- ❌ No phone number validation
- ❌ No passport number format validation
- ❌ No airport code validation

**Backend Validation:**
- ❌ **NOT IMPLEMENTED** - No backend validation layer
- ⚠️ Database constraints only: `first_name` and `last_name` NOT NULL
- ⚠️ No data type validation beyond PostgreSQL types
- ⚠️ No business rule validation

**Risk:** Invalid data can be inserted if frontend validation is bypassed.

---

### UPDATE Flow (After Submission)

**Status:** ✅ **FULLY SUPPORTED**

**Implementation:**
- Excel-like inline cell editing in `RequestsList.jsx`
- Each cell can be edited independently
- Updates happen immediately on blur or Enter key
- Optimistic UI updates with rollback on error

**Update Process:**
1. User clicks cell → Cell becomes editable
2. User types new value
3. On blur/Enter → `saveCell()` function called
4. Date conversion: DD-MM-YYYY → YYYY-MM-DD (if date field)
5. Request types: Comma-separated string → Array (if request_types field)
6. Optimistic update: UI updates immediately
7. Backend update: Single-field PATCH via Supabase
8. Error handling: Revert UI if backend fails

**Fields That Can Be Updated:**
- ✅ All editable fields (except `id`, `created_at`, `updated_at`)
- ✅ `status` field can be edited (dropdown in table)
- ✅ `gender` field can be edited (dropdown in table)

**Fields That Cannot Be Updated:**
- ❌ `id` - Read-only
- ❌ `created_at` - Read-only
- ❌ `updated_at` - Auto-updated by database (not manually editable)

---

## 4. READ / FETCH FLOW

### Fetch All Requests

**Implementation:** `src/pages/RequestsList.jsx:212-234`

**Query:**
```javascript
supabase
  .from('requests')
  .select('*')
  .order('created_at', { ascending: false })
```

**Status:** ✅ **IMPLEMENTED AND WORKING**

**Characteristics:**
- ✅ Fetches from real database (not mocked)
- ✅ Single query (no joins needed - single table)
- ✅ Ordered by `created_at` DESC (newest first)
- ❌ **NO PAGINATION** - Loads all records at once
- ❌ **NO FILTERING** - No WHERE clauses
- ❌ **NO SEARCH** - No text search functionality
- ❌ **NO LIMIT** - Could be slow with many records

**Performance Risk:** ⚠️ **MEDIUM-HIGH**
- Will load ALL requests into memory
- No limit on result set size
- Could cause performance issues with 1000+ records

---

### Data Source

**Is data fetched from DB or mocked?**
- ✅ **REAL DATABASE** - All data comes from Supabase PostgreSQL database
- ❌ No mocked data
- ❌ No local storage fallback
- ❌ No caching layer

---

### Detail View

**Status:** ❌ **NOT IMPLEMENTED**
- No detail/edit page for individual requests
- No route like `/requests/:id`
- All editing happens inline in the table

---

## 5. FILE / DOCUMENT HANDLING

### Current Implementation

**File Storage Location:**
- ✅ **Browser Memory Only** - Files stored as `File` or `Blob` objects in React state
- ✅ **Temporary Object URLs** - Created via `URL.createObjectURL(file)` for preview
- ❌ **NO Database Storage** - Files never saved to database
- ❌ **NO Cloud Storage** - No Supabase Storage, S3, or similar
- ❌ **NO File System** - No server-side file storage

**File Lifecycle:**

1. **Upload** (`CreateRequest.jsx:316-349`)
   - User selects file (PDF or image)
   - File stored in `passportFile` state (browser memory)
   - For PDFs: First page converted to image data URL
   - For images: Blob URL created for preview
   - Preview URL stored in `passportPreviewUrl` state

2. **Display**
   - File rendered in UI using object URL or data URL
   - User can zoom, rotate, navigate (for PDFs)
   - File remains visible during form filling

3. **Submission**
   - On "Create Request" click:
     - Text fields saved to database
     - Blob URL revoked: `URL.revokeObjectURL(passportPreviewUrl)`
     - File reference cleared from state
     - **File is completely destroyed**

4. **Page Refresh**
   - If user refreshes before submitting:
     - All state lost
     - File destroyed
     - User must re-upload

---

### File Metadata

**Is file metadata saved in DB?**
- ❌ **NO** - No file metadata stored
- ❌ No file name
- ❌ No file size
- ❌ No file type
- ❌ No upload timestamp
- ❌ No file path/URL

**Impact:** Once form is submitted, there is **zero trace** of the uploaded file.

---

### File Linking

**How are files linked to requests?**
- ❌ **NOT LINKED** - Files are never linked to requests
- Files exist only during form filling session
- After submission, no relationship exists

---

### Production Readiness Gaps

**Missing for Production:**
- ❌ **File Persistence** - Files are lost after submission (by design, but may need to change)
- ❌ **File Validation** - No file size limits, type restrictions, or virus scanning
- ❌ **File Security** - No access control or encryption
- ❌ **File Backup** - No backup strategy (files don't exist)
- ❌ **Compliance** - No document retention policy (files destroyed immediately)
- ❌ **Audit Trail** - No record that a file was ever uploaded

**Current Design Philosophy:**
- Files are intentionally **not stored** (privacy/compliance decision)
- This is a **feature, not a bug** per design documents
- May need to be reconsidered for production use cases

---

## 6. DATA CONSISTENCY & GAPS

### Fields in UI but NOT in Database

**None** - All UI fields have corresponding database columns.

---

### Fields in Database but NOT in UI

| Field | In DB | In UI | Notes |
|-------|-------|-------|-------|
| `status` | ✅ | ⚠️ | Exists in DB, was removed from table display (user requested) |
| `is_demo` | ✅ | ❌ | Never displayed in UI |
| `ocr_source` | ✅ | ❌ | Always null (OCR not implemented) |
| `ocr_confidence` | ✅ | ❌ | Always null (OCR not implemented) |
| `updated_at` | ✅ | ❌ | Not shown in UI (only `created_at` shown) |

---

### Schema Mismatches

**Design Document vs Actual Schema:**

| Field | In Design Doc | In Actual Schema | Status |
|-------|---------------|-----------------|--------|
| `passport_expiry_date` | ✅ | ❌ | **MISMATCH** - Documented but not implemented |
| `residence_permit_expiry_date` | ✅ | ❌ | **MISMATCH** - Documented but not implemented |

**Impact:** Low - These fields are not referenced in UI or code.

---

### Naming Inconsistencies

**Frontend vs Database:**
- ✅ Consistent - Frontend uses camelCase, database uses snake_case (standard practice)
- ✅ Mapping is correct in `CreateRequest.jsx` (lines 934-951)

**Examples:**
- Frontend: `firstName` → Database: `first_name` ✅
- Frontend: `dateOfBirth` → Database: `date_of_birth` ✅
- Frontend: `departureAirport` → Database: `departure_airport` ✅

---

### Technical Debt

**High Priority:**
1. ⚠️ **No Pagination** - Will break with large datasets
2. ⚠️ **No Backend Validation** - Security risk
3. ⚠️ **No RLS Policies Verified** - Security risk
4. ⚠️ **No Error Logging** - Errors only shown to user, not logged
5. ⚠️ **No Rate Limiting** - Vulnerable to abuse

**Medium Priority:**
1. ⚠️ **No Search/Filter** - Poor UX for large datasets
2. ⚠️ **No Bulk Operations** - Can only edit one cell at a time
3. ⚠️ **No Export** - No way to export data
4. ⚠️ **No Audit Trail** - No record of who changed what
5. ⚠️ **No Soft Delete** - No way to recover deleted data (delete not implemented anyway)

**Low Priority:**
1. ⚠️ **Schema Mismatch** - Design doc has fields not in schema
2. ⚠️ **Unused Fields** - `ocr_source`, `ocr_confidence` always null
3. ⚠️ **No Indexes on Search Fields** - If search is added, will need indexes

---

## 7. FINAL STATUS SUMMARY

### Feature Status Table

| Feature | Status | Risk Level | Notes |
|---------|--------|------------|-------|
| **Database Schema** | ✅ Done | Low | Single table, well-designed, indexes in place |
| **Table Creation** | ✅ Done | Low | Migration SQL exists and appears applied |
| **INSERT Request** | ✅ Done | Low | Fully functional, proper error handling |
| **SELECT Requests** | ✅ Done | ⚠️ Medium | Works but no pagination (will break at scale) |
| **UPDATE Request** | ✅ Done | Low | Cell-by-cell updates working |
| **DELETE Request** | ❌ Missing | Low | Not implemented (may not be needed) |
| **File Upload** | ✅ Done | Low | Works but files not persisted (by design) |
| **File Storage** | ❌ Not Applicable | N/A | Intentionally not stored (privacy decision) |
| **Pagination** | ❌ Missing | ⚠️ High | Will cause performance issues at scale |
| **Search/Filter** | ❌ Missing | ⚠️ Medium | Poor UX for large datasets |
| **Backend Validation** | ❌ Missing | ⚠️ High | Security risk - no server-side validation |
| **RLS Policies** | ❓ Unknown | ⚠️ High | Not verified - security risk |
| **Error Logging** | ❌ Missing | ⚠️ Medium | Errors only shown to user |
| **Rate Limiting** | ❌ Missing | ⚠️ High | Vulnerable to abuse |
| **Authentication** | ❓ Unknown | ⚠️ High | Not visible in codebase |
| **OCR Feature** | ❌ Missing | Low | Fields exist in DB but feature not implemented |
| **Status Management** | ⚠️ Partial | Low | Field exists but removed from UI display |
| **Export Data** | ❌ Missing | Low | Not implemented |
| **Audit Trail** | ❌ Missing | ⚠️ Medium | No record of changes |

---

### Overall Assessment

**✅ Strengths:**
- Clean, simple schema design
- Functional CRUD operations (except DELETE)
- Good user experience with Excel-like editing
- Proper date format handling
- Optimistic UI updates with error rollback

**⚠️ Concerns:**
- No pagination (will break at scale)
- No backend validation (security risk)
- No authentication visible (security risk)
- RLS policies not verified (security risk)
- No error logging (debugging difficulty)

**❌ Blockers for Production:**
1. **Pagination** - Must be implemented before large datasets
2. **Backend Validation** - Critical for security
3. **RLS Policies** - Must be verified/configured
4. **Authentication** - Must be implemented if not already
5. **Error Logging** - Needed for production debugging

---

### Recommendations

**Immediate (Before Production):**
1. Implement pagination for requests list
2. Add backend validation layer (Supabase Edge Functions or separate API)
3. Verify/configure Row Level Security policies
4. Implement proper error logging
5. Add rate limiting

**Short-term:**
1. Add search/filter functionality
2. Implement authentication/authorization
3. Add audit trail for data changes
4. Consider file persistence if needed for compliance

**Long-term:**
1. Implement OCR feature (fields already in schema)
2. Add export functionality
3. Consider soft delete for data recovery
4. Add bulk operations

---

**Report End**
