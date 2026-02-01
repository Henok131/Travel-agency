# Deployment Script for inventory.asenaytech.com
# This script sets the production domain and builds the app

Write-Host "🚀 Starting deployment preparation..." -ForegroundColor Green

# Set production domain environment variable
$env:VITE_APP_URL = "https://travel.asenaytech.com"

Write-Host "✅ Production domain set: $env:VITE_APP_URL" -ForegroundColor Green

# Build for production
Write-Host "📦 Building for production..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Upload all files from 'dist' folder to Hostinger" -ForegroundColor White
    Write-Host "2. Upload '.htaccess' file to root directory" -ForegroundColor White
    Write-Host "3. Verify SSL is enabled for inventory.asenaytech.com" -ForegroundColor White
    Write-Host "4. Test: https://inventory.asenaytech.com" -ForegroundColor White
    Write-Host ""
    Write-Host "📁 Files ready in: dist/" -ForegroundColor Cyan
} else {
    Write-Host "❌ Build failed! Please check errors above." -ForegroundColor Red
    exit 1
}
