# Main Table Issues Analysis

## Root Cause
**Fixed table layout + conflicting CSS height constraints + missing cursor pointer**

## Issues Found

### 1. Cell Editing Blocked
- **File:** `src/pages/RequestsList.css:508-515`
- **Problem:** `.excel-cell` has `cursor: default` (line 531) instead of `cursor: pointer` for editable cells
- **Impact:** Cells appear non-clickable, no visual feedback

### 2. Columns Squished
- **File:** `src/pages/RequestsList.css:283` + `src/pages/MainTable.jsx:1914-1917`
- **Problem:** `table-layout: fixed` with fixed pixel widths - if total width > container, columns compress
- **Impact:** Columns appear broken/squished when many columns exist

### 3. Height Conflicts
- **File:** `src/pages/RequestsList.css:508-515`
- **Problem:** `max-height: 20px !important` conflicts with cell's `min-height: 28px` (line 526)
- **Impact:** Cells may not render properly, blocking interactions

## Quick Fix (3 Steps)

1. **Add cursor pointer for editable cells** (`RequestsList.css:531`)
   ```css
   .excel-cell-editable { cursor: pointer; }
   ```

2. **Fix height conflict** (`RequestsList.css:508-515`)
   ```css
   .excel-table tbody tr td .excel-cell {
     height: auto !important;  /* Remove fixed 20px */
     min-height: 28px;
   }
   ```

3. **Add horizontal scroll** (`RequestsList.css:279`)
   ```css
   .excel-table { overflow-x: auto; }
   ```
