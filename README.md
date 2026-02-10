- Schema note: add request linkage column when missing
  ```sql
  ALTER TABLE main_table ADD COLUMN IF NOT EXISTS request_id uuid;
  ```
# LST Travel - Backoffice System

Travel request management system with manual-first workflow and optional OCR.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Supabase credentials:
# VITE_SUPABASE_URL=your_supabase_project_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Start development server:
```bash
npm run dev
```

4. Open browser:
- Navigate to `http://localhost:5173/requests/new` (or the port shown in terminal)

## Project Structure

```
src/
  ├── pages/
  │   └── CreateRequest.jsx    # Create Request page component
  │   └── CreateRequest.css    # Styles for Create Request page
  ├── App.jsx                   # Main app router
  ├── main.jsx                  # React entry point
  └── index.css                 # Global styles
```

## Features

### Create Request Page (`/requests/new`)

- **Document-First Layout**: Passport preview at top, form below
- **File Upload**: PDF, PNG, JPEG support
- **Browser Memory Only**: Files stored temporarily, never uploaded to server
- **Manual-First Workflow**: All fields editable at all times
- **OCR Placeholder**: Button ready for future OCR integration

## Features

### Database Integration
- Creates requests in Supabase `requests` table
- Only text fields are saved (no file uploads)
- Files remain in browser memory only, destroyed after successful insert

## Notes

- Files are NOT uploaded to Supabase Storage
- Files exist only in browser memory during form filling
- Files are destroyed immediately after successful database insert
- Passport preview and form data are preserved if insert fails
