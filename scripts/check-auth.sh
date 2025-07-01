#!/bin/bash
# Script to check authentication status in production

# URL of your deployed app
APP_URL=${1:-"https://your-app-url.vercel.app"}

echo "Checking authentication status for: $APP_URL"
echo "--------------------------------------------"

# Test login endpoint
echo "Testing login endpoint..."
LOGIN_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrongpassword"}' \
  "$APP_URL/api/auth/login")

echo "Login endpoint response:"
echo "$LOGIN_RESPONSE" | grep -v "token"
echo ""

# Test auth status endpoint (me endpoint)
echo "Testing authentication status endpoint..."
ME_RESPONSE=$(curl -s "$APP_URL/api/auth/me")
echo "Auth status response:"
echo "$ME_RESPONSE"
echo ""

# Test debug endpoint (if enabled)
echo "Testing debug endpoint..."
DEBUG_RESPONSE=$(curl -s "$APP_URL/api/auth/debug")
echo "Debug endpoint response:"
if [[ "$DEBUG_RESPONSE" == *"Debug endpoint only available in development mode"* ]]; then
  echo "Debug endpoint properly secured in production."
else
  echo "$DEBUG_RESPONSE" | grep -v "JWT_SECRET"
fi
echo ""

echo "--------------------------------------------"
echo "Authentication check complete."
echo "If you're experiencing authentication issues in production, ensure:"
echo "1. JWT_SECRET is properly set in your environment variables"
echo "2. Cookies are correctly configured for your domain"
echo "3. Check browser console for client-side errors"
echo ""
echo "To test token storage in the browser, visit: $APP_URL/auth/test"
