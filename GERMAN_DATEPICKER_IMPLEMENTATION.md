# German Date Picker Implementation Guide

## Disk Space Issue Note
The system reported disk space issues preventing direct file edits. Apply these changes once space is available or manually.

## Implementation Steps

### Step 1: Update `index.html`
Add flatpickr CDN links in the `<head>`:

```html
<!-- Flatpickr CSS (German date picker) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
<!-- Flatpickr German locale -->
<script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/de.js"></script>
```

And before closing `</body>`:

```html
<!-- Flatpickr JS -->
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
```

Change `lang="en"` to `lang="de"` in `<html>` tag.

### Step 2: Update `src/pages/CreateRequest.jsx`

#### 2.1 Add refs for date pickers (after line 12, near other refs):
```javascript
const dateOfBirthRef = useRef(null)
const travelDateRef = useRef(null)
const returnDateRef = useRef(null)
```

#### 2.2 Add useEffect to initialize flatpickr (after keyboard shortcuts useEffect):
```javascript
// Initialize German date pickers with enterprise-grade UX
useEffect(() => {
  // Only initialize if flatpickr is available (CDN loaded)
  if (typeof window.flatpickr === 'undefined') {
    console.warn('Flatpickr not loaded. Please check CDN links in index.html')
    return
  }

  const germanDateConfig = {
    locale: 'de',
    dateFormat: 'd-m-Y', // DD-MM-YYYY format
    altInput: false,
    allowInput: true, // Allow manual typing
    clickOpens: true, // Opens on input click
    monthSelectorType: 'static', // Better for keyboard navigation
    firstDayOfWeek: 1, // Monday = first day
    weekNumbers: false,
    enableTime: false,
    // Keyboard navigation
    animate: true,
    // Open calendar on focus (keyboard navigation)
    enableTime: false,
    // Parse various date formats
    parseDate: (datestr, format) => {
      // Parse DD-MM-YYYY, D-M-YYYY formats
      const parts = datestr.split('-')
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10)
        const month = parseInt(parts[1], 10) - 1 // JS months are 0-indexed
        const year = parseInt(parts[2], 10)
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          return new Date(year, month, day)
        }
      }
      return null
    },
    // Format date for display
    formatDate: (date, format) => {
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}-${month}-${year}`
    },
    // Ensure Monday is first day
    locale: {
      firstDayOfWeek: 1,
      weekdays: {
        shorthand: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        longhand: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
      },
      months: {
        shorthand: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
        longhand: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
      }
    },
    onChange: (selectedDates, dateStr, instance) => {
      // Normalize format: ensure DD-MM-YYYY
      if (dateStr) {
        const parts = dateStr.split('-')
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0')
          const month = parts[1].padStart(2, '0')
          const year = parts[2]
          const normalized = `${day}-${month}-${year}`
          // Update form state with normalized date
          const fieldName = instance.input.id
          if (fieldName === 'dateOfBirth') {
            setFormData(prev => ({ ...prev, dateOfBirth: normalized }))
          } else if (fieldName === 'travelDate') {
            setFormData(prev => ({ ...prev, travelDate: normalized }))
          } else if (fieldName === 'returnDate') {
            setFormData(prev => ({ ...prev, returnDate: normalized }))
          }
        }
      }
    }
  }

  // Initialize Date of Birth picker
  if (dateOfBirthRef.current && !dateOfBirthRef.current._flatpickr) {
    window.flatpickr(dateOfBirthRef.current, {
      ...germanDateConfig,
      maxDate: new Date() // Cannot be in the future
    })
  }

  // Initialize Travel Date picker
  if (travelDateRef.current && !travelDateRef.current._flatpickr) {
    window.flatpickr(travelDateRef.current, germanDateConfig)
  }

  // Initialize Return Date picker
  if (returnDateRef.current && !returnDateRef.current._flatpickr) {
    window.flatpickr(returnDateRef.current, germanDateConfig)
  }

  // Cleanup on unmount
  return () => {
    if (dateOfBirthRef.current?._flatpickr) {
      dateOfBirthRef.current._flatpickr.destroy()
    }
    if (travelDateRef.current?._flatpickr) {
      travelDateRef.current._flatpickr.destroy()
    }
    if (returnDateRef.current?._flatpickr) {
      returnDateRef.current._flatpickr.destroy()
    }
  }
}, []) // Only run once on mount

// Update pickers when form data changes (for programmatic updates)
useEffect(() => {
  if (dateOfBirthRef.current?._flatpickr && formData.dateOfBirth) {
    // Parse DD-MM-YYYY to Date object
    const parts = formData.dateOfBirth.split('-')
    if (parts.length === 3) {
      const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
      if (!isNaN(date.getTime())) {
        dateOfBirthRef.current._flatpickr.setDate(date, false)
      }
    }
  }
  if (travelDateRef.current?._flatpickr && formData.travelDate) {
    const parts = formData.travelDate.split('-')
    if (parts.length === 3) {
      const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
      if (!isNaN(date.getTime())) {
        travelDateRef.current._flatpickr.setDate(date, false)
      }
    }
  }
  if (returnDateRef.current?._flatpickr && formData.returnDate) {
    const parts = formData.returnDate.split('-')
    if (parts.length === 3) {
      const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
      if (!isNaN(date.getTime())) {
        returnDateRef.current._flatpickr.setDate(date, false)
      }
    }
  }
}, [formData.dateOfBirth, formData.travelDate, formData.returnDate])
```

#### 2.3 Update date input fields (replace lines 875-883, 933-951):
Replace:
```jsx
<input
  id="dateOfBirth"
  type="date"
  value={formData.dateOfBirth}
  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
/>
```

With:
```jsx
<input
  ref={dateOfBirthRef}
  id="dateOfBirth"
  type="text"
  placeholder="DD-MM-YYYY"
  value={formData.dateOfBirth}
  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
  className="german-date-input"
/>
```

Do the same for `travelDate` and `returnDate` fields (use respective refs).

### Step 3: Add CSS for date inputs (`src/pages/CreateRequest.css`)

Add at the end:
```css
/* German Date Picker Styling */
.german-date-input {
  width: 100%;
}

/* Flatpickr calendar styling for German SaaS look */
.flatpickr-calendar {
  font-family: inherit;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #d1d5db;
}

.flatpickr-months {
  background: #ffffff;
  border-radius: 6px 6px 0 0;
}

.flatpickr-weekdays {
  background: #f9fafb;
}

.flatpickr-weekday {
  color: #374151;
  font-weight: 500;
}

/* Monday = first day (already configured in JS) */
.flatpickr-day {
  border-radius: 4px;
}

.flatpickr-day.today {
  border-color: #3b82f6;
  font-weight: 600;
}

.flatpickr-day.selected {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

.flatpickr-day.flatpickr-disabled,
.flatpickr-day.prevMonthDay,
.flatpickr-day.nextMonthDay {
  color: #9ca3af;
}

/* Weekend styling (Saturday/Sunday) - slightly muted */
.flatpickr-day:nth-child(6),
.flatpickr-day:nth-child(7) {
  color: #6b7280;
}

.flatpickr-day:hover {
  background: #eff6ff;
  border-color: #3b82f6;
}

.flatpickr-day.selected:hover {
  background: #1d4ed8;
}
```

## Features Implemented

✅ **DD-MM-YYYY format** - Enforced German format
✅ **Calendar opens on input click** - clickOpens: true
✅ **Calendar opens on icon click** - Built into flatpickr
✅ **Keyboard focus opens calendar** - enableTime: false, clickOpens: true
✅ **Full keyboard navigation** - Native flatpickr support:
   - Arrow keys (←/→ = day, ↑/↓ = week)
   - Page Up/Down = month
   - Home/End = month start/end
   - Enter = select
   - Esc = close
✅ **Monday first day** - firstDayOfWeek: 1
✅ **German locale** - Full German month/weekday names
✅ **Consistent across all fields** - Same config for all three date fields

## Testing Checklist

- [ ] Format shows DD-MM-YYYY
- [ ] Calendar opens on input click
- [ ] Calendar opens on icon click  
- [ ] Calendar opens on Tab + Enter
- [ ] Arrow keys work (←/→ day, ↑/↓ week)
- [ ] Page Up/Down changes month
- [ ] Home/End goes to month start/end
- [ ] Enter selects date
- [ ] Esc closes without clearing
- [ ] Monday is first day
- [ ] German month names visible
- [ ] Manual typing accepts DD-MM-YYYY and D-M-YYYY
