# Deployment Checklist for travel.asenaytech.com

## ✅ Step 1: Configure Environment Variable

**IMPORTANT**: Before building, add this line to your `.env` file:

```bash
VITE_APP_URL=https://travel.asenaytech.com
```

Your `.env` file should look like:
```bash
VITE_SUPABASE_URL=https://xhfcerpeymkapyrglnly.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_URL=https://travel.asenaytech.com
```

## ✅ Step 2: Rebuild (if needed)

If you just added VITE_APP_URL, rebuild:
```bash
npm run build
```

## ✅ Step 3: Files Ready for Upload

The `dist` folder contains all production files. Upload these to Hostinger:

### Files to Upload:
- `dist/index.html` → Upload to root
- `dist/assets/` folder → Upload entire folder
- `.htaccess` → Upload to root (for React Router)

### Upload Location:
```
/home/u905918308/domains/asenaytech.com/public_html/travel/
```

## ✅ Step 4: Upload via Hostinger File Manager

1. Login to Hostinger hPanel
2. Go to **Files** → **File Manager**
3. Navigate to: `public_html` folder
4. Upload all files from `dist` folder
5. Upload `.htaccess` file to root

## ✅ Step 5: Verify SSL

- Ensure SSL certificate is active for `travel.asenaytech.com`
- Should show HTTPS (green lock icon)

## ✅ Step 6: Test

1. Visit: `https://travel.asenaytech.com`
2. Open an invoice
3. Scan the QR code
4. Should open: `https://travel.asenaytech.com/invoice/[bookingId]`

## 📋 Quick Command Reference

```bash
# 1. Add VITE_APP_URL to .env (manually)
# 2. Build
npm run build

# 3. Files are ready in dist/ folder
# 4. Upload dist/* and .htaccess to Hostinger
```
