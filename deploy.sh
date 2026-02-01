#!/bin/bash
# Deployment Script for inventory.asenaytech.com
# This script sets the production domain and builds the app

echo "🚀 Starting deployment preparation..."

# Set production domain environment variable
export VITE_APP_URL="https://travel.asenaytech.com"

echo "✅ Production domain set: $VITE_APP_URL"

# Build for production
echo "📦 Building for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Upload all files from 'dist' folder to Hostinger"
    echo "2. Upload '.htaccess' file to root directory"
    echo "3. Verify SSL is enabled for inventory.asenaytech.com"
    echo "4. Test: https://inventory.asenaytech.com"
    echo ""
    echo "📁 Files ready in: dist/"
else
    echo "❌ Build failed! Please check errors above."
    exit 1
fi
