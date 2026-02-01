# QR Code Troubleshooting Report

## Issue Summary
The QR code generated in the invoice PDF is **not scannable** despite multiple optimization attempts. The QR code appears visually correct but fails to scan with standard QR code readers.

## Current Implementation

### QR Code Data
- **Format**: Simple URL
- **Current Data**: `https://lsttravel.de/verify/{booking_id}`
- **Data Length**: ~35-50 characters (very short)
- **Example**: `https://lsttravel.de/verify/9461750d-1b91-4df5-98d1-c6716cbb4d99`

### QR Code Generation Settings
```javascript
QRCode.toDataURL(qrData, {
  width: 600,                    // Large size for better scannability
  margin: 4,                     // Generous white border (quiet zone)
  errorCorrectionLevel: 'L',     // Low error correction (7% recovery) - simplest QR code
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  },
  type: 'image/png'
})
```

### Logo Overlay
- **Logo Size**: 5% of QR code size (~30px for 600px QR code)
- **Position**: Centered
- **White Padding**: 4px around logo
- **Logo Quality**: High-quality image smoothing enabled

### Display Settings
- **PDF Display Size**: 45mm x 45mm
- **Image Rendering**: `crisp-edges`, `pixelated`, `nearest-neighbor`
- **Canvas Quality**: Maximum PNG quality (1.0)

### PDF Generation Pipeline
1. Generate QR code at 600px resolution
2. Overlay small logo in center (if logo URL provided)
3. Convert to base64 PNG
4. Embed in HTML as `<img>` tag
5. Use `html2canvas` to capture HTML (scale: 3)
6. Convert canvas to PNG
7. Add to jsPDF document

## Attempted Solutions

### 1. Data Simplification
- ✅ **Attempted**: Reduced from full JSON object to simple URL
- ✅ **Result**: Data is now minimal (~35-50 chars)
- ❌ **Status**: Still not scannable

### 2. Size Increases
- ✅ **Attempted**: Increased from 150px → 400px → 600px
- ✅ **Result**: QR code appears larger visually
- ❌ **Status**: Still not scannable

### 3. Error Correction Levels
- ✅ **Attempted**: Tried 'H' (High) → 'M' (Medium) → 'L' (Low)
- ✅ **Result**: QR code less dense with 'L' level
- ❌ **Status**: Still not scannable

### 4. Logo Size Reduction
- ✅ **Attempted**: Reduced logo from 15% → 8% → 5% of QR size
- ✅ **Result**: Logo is now very small
- ❌ **Status**: Still not scannable

### 5. Margin/Quiet Zone
- ✅ **Attempted**: Increased margin from 2 → 4
- ✅ **Result**: Better white border around QR code
- ❌ **Status**: Still not scannable

### 6. Image Rendering
- ✅ **Attempted**: Various CSS rendering modes (crisp-edges, pixelated, nearest-neighbor)
- ✅ **Result**: QR code appears sharp visually
- ❌ **Status**: Still not scannable

### 7. Canvas Quality
- ✅ **Attempted**: Maximum PNG quality (1.0), high-resolution canvas
- ✅ **Result**: High-quality image output
- ❌ **Status**: Still not scannable

## Technical Details

### Library Used
- **Package**: `qrcode` (npm package)
- **Version**: Latest (installed via `npm install qrcode`)
- **Method**: `QRCode.toDataURL()`

### Code Flow
```javascript
// 1. Generate QR code
const qrImageDataUrl = await QRCode.toDataURL(qrData, options)

// 2. Load QR code image
const qrImg = new Image()
qrImg.src = qrImageDataUrl

// 3. Overlay logo (if provided)
// - Create canvas
// - Draw QR code
// - Draw white background for logo
// - Draw logo

// 4. Embed in HTML
<img src="${qrCodeImage}" style="width: 45mm; height: 45mm;" />

// 5. Capture with html2canvas
const canvas = await html2canvas(container, { scale: 3 })

// 6. Add to PDF
pdf.addImage(imgData, 'PNG', x, y, width, height)
```

## Potential Issues

### 1. HTML2Canvas Rendering
- **Issue**: `html2canvas` might be degrading QR code quality during capture
- **Evidence**: QR code looks correct visually but doesn't scan
- **Possible Cause**: Anti-aliasing, compression, or scaling issues

### 2. PDF Compression
- **Issue**: jsPDF might be compressing the image
- **Evidence**: Image quality might be reduced in final PDF
- **Possible Cause**: Default compression settings

### 3. Logo Overlay Interference
- **Issue**: Even small logo might be interfering with QR code scanning
- **Evidence**: Logo covers center finder pattern area
- **Possible Cause**: Logo blocking critical QR code modules

### 4. Canvas Rendering
- **Issue**: Canvas operations might be introducing artifacts
- **Evidence**: Multiple canvas operations (QR → logo overlay → html2canvas)
- **Possible Cause**: Image smoothing, scaling, or quality loss

### 5. Color/Contrast Issues
- **Issue**: Colors might not have sufficient contrast after processing
- **Evidence**: QR code appears correct but scanners can't read it
- **Possible Cause**: Color space conversion or contrast reduction

## Test Cases Attempted

1. ✅ Simple URL without logo - **Not scannable**
2. ✅ Simple URL with small logo - **Not scannable**
3. ✅ Different error correction levels - **Not scannable**
4. ✅ Different sizes (150px, 400px, 600px) - **Not scannable**
5. ✅ Different margins (2, 3, 4) - **Not scannable**

## Current Code Location
- **File**: `src/utils/generateBankTransferInvoicePdf.js`
- **Function**: `generateQRCodeWithLogo()`
- **Line**: ~94-163

## Next Steps / Questions for Claude AI

1. **Is html2canvas degrading QR code quality?**
   - Should we bypass html2canvas and add QR code directly to PDF?
   - Can we use jsPDF's image support directly?

2. **Is the logo overlay causing issues?**
   - Should we test without logo overlay completely?
   - Is 5% logo size still too large?

3. **Are there better QR code libraries?**
   - Should we try a different QR code generation library?
   - Are there known issues with `qrcode` npm package?

4. **PDF generation approach**
   - Should we add QR code image directly to PDF instead of HTML→Canvas→PDF?
   - Can jsPDF handle base64 images directly?

5. **Quality/Compression**
   - Are there jsPDF settings to prevent image compression?
   - Should we use different image format (SVG instead of PNG)?

6. **Testing methodology**
   - How can we verify QR code is valid before PDF generation?
   - Should we test QR code at each step of the pipeline?

## Environment
- **Framework**: React + Vite
- **PDF Library**: jsPDF
- **Canvas Library**: html2canvas
- **QR Code Library**: qrcode (npm)
- **Browser**: Chrome/Edge (Windows)

## Visual Description
- QR code appears visually correct in PDF
- Black squares on white background
- Small logo centered in QR code
- Proper margins/quiet zone visible
- Size appears adequate (45mm x 45mm)
- **BUT**: QR code readers cannot scan it

## Request for Help
Need assistance identifying why QR code is not scannable despite:
- Simple data (short URL)
- Large size (600px generation, 45mm display)
- Low error correction (L level)
- Small logo (5%)
- High quality rendering
- Proper margins

The QR code looks correct but fails to scan. This suggests a quality/rendering issue rather than a data/size issue.

## Code Snippets

### QR Code Data Generation
```javascript
// Line ~248-252 in generateBankTransferInvoicePdf.js
const bookingId = booking.id || booking.booking_id || ''
const qrData = `https://lsttravel.de/verify/${encodeURIComponent(bookingId)}`
console.log('QR Code Data:', qrData, 'Length:', qrData.length)
```

### QR Code Generation Function
```javascript
// Lines ~94-163 in generateBankTransferInvoicePdf.js
async function generateQRCodeWithLogo(qrData, logoUrl) {
  const qrSize = 600
  const qrImageDataUrl = await QRCode.toDataURL(qrData, {
    width: qrSize,
    margin: 4,
    errorCorrectionLevel: 'L',
    color: { dark: '#000000', light: '#FFFFFF' },
    type: 'image/png'
  })
  
  // Logo overlay logic (5% size, centered)
  // Returns base64 PNG string
}
```

### HTML Embedding
```javascript
// Line ~309 in generateBankTransferInvoicePdf.js
<img src="${qrCodeImage}" alt="QR Code" 
     style="width: 45mm; height: 45mm; 
            image-rendering: crisp-edges; 
            image-rendering: pixelated;" />
```

### PDF Generation
```javascript
// Lines ~417-441 in generateBankTransferInvoicePdf.js
const canvas = await html2canvas(container, {
  scale: 3,
  useCORS: true,
  backgroundColor: '#ffffff',
  width: 794,
  height: 1123
})

const imgData = canvas.toDataURL('image/png', 1.0)
pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgScaledWidth, imgScaledHeight)
```

## Additional Notes
- QR code is generated successfully (no errors)
- Base64 image is created correctly
- Image displays properly in PDF
- Visual appearance is correct
- Multiple QR code readers tested (all fail)
- Tested on different devices (all fail)
- QR code data is valid (can be manually typed and works)
