# Zoom System Report - Images and PDFs

## Overview
The zoom system works **IDENTICALLY** for both images and PDFs. They share the same state, handlers, and logic. The only difference is the HTML tag used for rendering (`<img>` for images, `<iframe>` for PDFs).

---

## Shared State (Used by Both Images and PDFs)

### 1. `imageZoom` (number)
- **Range:** 0.5 to 20
- **Default:** 1 (100%)
- **Purpose:** Controls the zoom level for both images and PDFs
- **Used by:** All zoom controls (buttons, keyboard, wheel, touch)

### 2. `imageDisplaySize` (object: { width, height })
- **Purpose:** Base display size at zoom level 1 (100%)
- **For Images:** Calculated in `handleImageLoad()` based on natural dimensions and container size
- **For PDFs:** Set in `handleFileUpload()` using 90% of container dimensions
- **Used by:** Both images and PDFs to calculate actual rendered size

### 3. `imageRotation` (number)
- **Range:** 0, 90, 180, 270 (degrees)
- **Default:** 0
- **Purpose:** Rotation for images only (PDFs don't rotate)
- **Applied to:** Only the `image-zoom-container` div wrapping images

---

## Zoom Controls (Work for Both Images and PDFs)

### 1. **Zoom In Button** (`handleZoomIn`)
- Increases zoom by 0.1 (10%)
- Max zoom: 20x (2000%)
- Works on: Images and PDFs

### 2. **Zoom Out Button** (`handleZoomOut`)
- Decreases zoom by 0.1 (10%)
- Min zoom: 0.5x (50%)
- Works on: Images and PDFs

### 3. **Reset Zoom Button** (`handleResetZoom`)
- Sets zoom to 1 (100%)
- Resets rotation to 0 (images only)
- Works on: Images and PDFs

### 4. **Keyboard Shortcuts**
- `Ctrl/Cmd + Plus (+)` → Zoom in
- `Ctrl/Cmd + Minus (-)` → Zoom out
- `Ctrl/Cmd + 0` → Reset zoom
- Works on: Images and PDFs

### 5. **Mouse Wheel Zoom** (`handleWheelZoom`)
- `Ctrl/Cmd + Wheel Up` → Zoom in
- `Ctrl/Cmd + Wheel Down` → Zoom out
- Regular wheel (no Ctrl) → Browser scrolling (native)
- Works on: Images and PDFs

### 6. **Touch/Pinch Zoom** (`handleTouchStart`, `handleTouchMove`, `handleTouchEnd`)
- Two-finger pinch → Zoom in/out
- Single finger → Scroll (native)
- Works on: Images and PDFs

---

## Initial Size Calculation

### Images
1. User uploads image file
2. Image loads → `handleImageLoad()` fires
3. Calculates natural aspect ratio
4. Fits to container (maintaining aspect ratio):
   - If wider than container → Fit to width
   - If taller than container → Fit to height
5. Stores result in `imageDisplaySize`

### PDFs
1. User uploads PDF file
2. `handleFileUpload()` fires
3. Sets `imageDisplaySize` to 90% of container dimensions
4. Uses same container as images (`viewerRef.current`)

---

## Rendering (How Size is Applied)

### Images
```jsx
<img
  style={{
    width: imageDisplaySize.width * imageZoom + 'px',
    height: imageDisplaySize.height * imageZoom + 'px'
  }}
/>
```
- **Zoom method:** Layout-based (actual CSS width/height)
- **Rotation:** Applied to wrapper div via `transform: rotate()`

### PDFs
```jsx
<iframe
  style={{
    width: imageDisplaySize.width * imageZoom + 'px',
    height: imageDisplaySize.height * imageZoom + 'px'
  }}
/>
```
- **Zoom method:** Layout-based (actual CSS width/height) - **SAME AS IMAGES**
- **Rotation:** Not supported (PDFs don't rotate)

---

## Container Structure

### Shared Container
Both images and PDFs use the same container structure:

```
.passport-preview-viewer (scrollable container)
  └── .image-zoom-container (wrapper for rotation/sizing)
      └── <img> OR <iframe> (the actual content)
```

- **`.passport-preview-viewer`:** Scrollable container with `overflow: auto`
- **`.image-zoom-container`:** Wrapper for rotation (images only) and sizing
- **Content:** Either `<img>` or `<iframe>` with inline styles for size

---

## Page Zoom Prevention

### Method
Native JavaScript event listeners attached to `.passport-preview-viewer` in **capture phase**:

1. **Wheel events:** Prevents `Ctrl/Cmd + Wheel` from zooming the page
2. **Touch events:** Prevents two-finger pinch from zooming the page
3. **CSS:** `touch-action: pan-x pan-y` on container

### Result
- Page zoom: **Blocked**
- Container zoom: **Works** (via React handlers)

---

## Code Flow Summary

### Image Upload Flow
```
User selects image
  → handleFileUpload()
  → Image loads
  → handleImageLoad() calculates imageDisplaySize
  → Renders with width/height = imageDisplaySize * imageZoom
```

### PDF Upload Flow
```
User selects PDF
  → handleFileUpload() sets imageDisplaySize (90% container)
  → Renders with width/height = imageDisplaySize * imageZoom
```

### Zoom Action Flow (Same for Both)
```
User triggers zoom (button/keyboard/wheel/touch)
  → Zoom handler updates imageZoom state
  → React re-renders
  → Width/height recalculated: imageDisplaySize * imageZoom
  → Content re-sized
  → Browser scrolling handles panning (native)
```

---

## Key Points

1. **Single Source of Truth:** `imageZoom` state controls zoom for both images and PDFs
2. **Same Calculation:** Both use `imageDisplaySize * imageZoom` for rendered size
3. **Same Handlers:** All zoom controls use the same functions
4. **Same Container:** Both use `.image-zoom-container` and `.passport-preview-viewer`
5. **Only Difference:** HTML tag (`<img>` vs `<iframe>`) - required by browser, not by design
6. **No PDF-Specific Code:** PDFs use the exact same zoom logic as images

---

## Files Involved

- **`src/pages/CreateRequest.jsx`:** All zoom logic, state, and handlers
- **`src/pages/CreateRequest.css`:** Container styling (`.passport-preview-viewer`, `.image-zoom-container`)

---

## Testing Checklist

- [ ] Images zoom in/out (buttons, keyboard, wheel, touch)
- [ ] PDFs zoom in/out (buttons, keyboard, wheel, touch)
- [ ] Images rotate (buttons only)
- [ ] PDFs don't rotate (buttons disabled/hidden)
- [ ] Page doesn't zoom when using container zoom
- [ ] All edges reachable via scrolling when zoomed
- [ ] Zoom level displayed correctly (toolbar shows percentage)
- [ ] Reset zoom returns to 100% for both images and PDFs
