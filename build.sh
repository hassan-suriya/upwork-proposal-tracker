#!/bin/bash
# This script is used to build the Next.js application for production

# Check if .env.production file exists
if [ ! -f .env.production ]; then
    echo "Error: .env.production file not found. Please create it with required environment variables."
    exit 1
fi

# Check if JWT_SECRET is set in .env.production
if ! grep -q "JWT_SECRET=" .env.production || grep -q "JWT_SECRET=$" .env.production; then
    echo "Error: JWT_SECRET is not properly set in .env.production."
    echo "Make sure to set a strong JWT_SECRET in your .env.production file."
    exit 1
fi

# Check if MONGODB_URI is set in .env.production
if ! grep -q "MONGODB_URI=" .env.production || grep -q "MONGODB_URI=$" .env.production; then
    echo "Error: MONGODB_URI is not properly set in .env.production."
    echo "Make sure to set your MongoDB connection string in your .env.production file."
    exit 1
fi

# Build the Next.js application
echo "Building the Next.js application..."
npm run build

echo "Build completed successfully. Make sure to set all required environment variables in your production environment."
echo "Important environment variables:"
echo "- JWT_SECRET: Used for authentication"
echo "- MONGODB_URI: MongoDB connection string"
echo "- NODE_ENV: Should be set to 'production'"

echo "To test your production build locally, run: npm run start"
