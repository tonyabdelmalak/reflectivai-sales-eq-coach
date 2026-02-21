#!/bin/bash

# Download the working Cloudflare deployment
# You need to run this from a browser where you're authenticated

echo "To download the working deployment:"
echo ""
echo "1. Go to: https://27503dd3.reflectivai-app-prod.pages.dev/"
echo "2. Open DevTools (F12)"
echo "3. Go to Sources tab"
echo "4. Find assets/main-XXXXX.js"
echo "5. Right-click → Save as → save to this directory"
echo "6. Tell me the filename"
echo ""
echo "OR - if you can access it, run:"
echo "curl -H 'Cookie: YOUR_AUTH_COOKIE' https://27503dd3.reflectivai-app-prod.pages.dev/assets/main-XXXXX.js > working-bundle.js"
