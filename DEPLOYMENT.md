# Deployment Guide - Production Domain Setup

## QR Code Configuration for Production

The invoice QR codes are configured to work with your production domain. Here's how to set it up:

### Step 1: Set Production Domain

Add this to your production `.env` file:

```bash
VITE_APP_URL=https://travel.asenaytech.com
```

**Your Configuration:**
```bash
VITE_APP_URL=https://travel.asenaytech.com
```

### Step 2: Build for Production

```bash
npm run build
```

### Step 3: Deploy

Deploy the `dist` folder to your hosting provider (Vercel, Netlify, AWS, etc.)

### How It Works

- **Development**: QR codes use the current origin (localhost or network IP)
- **Production**: QR codes automatically use your domain from `VITE_APP_URL`
- **Mobile Scanning**: Works perfectly when deployed to your domain

### Example QR Code URLs

- **Development**: `http://localhost:5173/invoice/[bookingId]`
- **Production**: `https://travel.asenaytech.com/invoice/[bookingId]`

### Important Notes

1. **Always use HTTPS** in production for security
2. **No trailing slash** - The code automatically handles this
3. **Environment Variable** - Must be set before building for production
4. **QR Code Size** - 120x120px with company logo embedded
5. **Error Correction** - Level H (highest) for reliable scanning

### Testing

After deployment, scan a QR code from an invoice to verify it opens:
`https://travel.asenaytech.com/invoice/[bookingId]`

### Hostinger-Specific Notes

1. **SSL Certificate**: Make sure SSL is enabled for `travel.asenaytech.com` (HTTPS)
2. **File Permissions**: Ensure files have correct permissions (644 for files, 755 for folders)
3. **.htaccess** (if needed): For React Router to work, you may need an `.htaccess` file:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

4. **Environment Variables**: Hostinger doesn't support `.env` files directly. You'll need to:
   - Set `VITE_APP_URL=https://inventory.asenaytech.com` before building
   - Or use Hostinger's environment variable feature if available
   - Or hardcode it temporarily (not recommended for production)
