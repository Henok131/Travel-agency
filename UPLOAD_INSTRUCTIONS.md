# 📤 Upload Instructions for Hostinger

## ✅ Build Status: READY

Your production build is complete with `https://travel.asenaytech.com` configured!

## 📁 Files to Upload

### 1. Upload ALL files from `dist` folder:

**Location in dist folder:**
```
dist/
├── index.html          ← Upload to root
├── pdf.worker.min.mjs  ← Upload to root
└── assets/            ← Upload entire folder
    ├── British-mUI72Xqt.png
    ├── html2canvas.esm-CBrSDip1.js
    ├── index-BNedB7gv.js
    ├── index-IKWMXYjJ.css
    ├── index.es-B9-9CRdp.js
    ├── logo-C9Mo_8H4.png
    ├── purify.es-B9ZVCkUG.js
    ├── setting-logo-CPhoTxaG.png
    └── tax-logo-BQTuHw0g.png
```

### 2. Upload `.htaccess` file:

**Location:** Root of your project (same level as `dist` folder)

## 🎯 Upload Destination

**Hostinger File Manager Path:**
```
/home/u905918308/domains/asenaytech.com/public_html/travel/
```

## 📋 Step-by-Step Upload Process

### Option A: Using Hostinger File Manager (Easiest)

1. **Login** to Hostinger hPanel
2. Go to **Files** → **File Manager**
3. Navigate to: `public_html` folder
4. **Upload `index.html`** to root
5. **Upload `pdf.worker.min.mjs`** to root
6. **Upload entire `assets` folder** (drag & drop)
7. **Upload `.htaccess`** file to root
8. **Verify** all files are uploaded

### Option B: Using FTP/SFTP Client

1. Connect to your Hostinger FTP
2. Navigate to `public_html` directory
3. Upload all files from `dist` folder
4. Upload `.htaccess` file

## ✅ Post-Upload Checklist

- [ ] All files uploaded successfully
- [ ] `.htaccess` file is in root directory
- [ ] SSL certificate is active (HTTPS enabled)
- [ ] Test: Visit `https://travel.asenaytech.com`
- [ ] Test: Open an invoice and scan QR code
- [ ] QR code should open: `https://travel.asenaytech.com/invoice/[bookingId]`

## 🔧 Troubleshooting

**If QR code still shows localhost:**
- Make sure you ran: `$env:VITE_APP_URL = "https://travel.asenaytech.com"; npm run build`
- Rebuild and re-upload

**If routes don't work:**
- Verify `.htaccess` file is uploaded
- Check file permissions (644 for files, 755 for folders)

**If SSL not working:**
- Enable SSL in Hostinger hPanel → SSL/TLS

## 🚀 Quick Deploy Command

For future deployments, run:
```powershell
.\deploy.ps1
```

Or manually:
```powershell
$env:VITE_APP_URL = "https://travel.asenaytech.com"
npm run build
```
