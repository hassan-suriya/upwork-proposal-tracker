#!/bin/bash

# Test MongoDB connection script
echo "Testing MongoDB connection..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is required but not installed. Please install Node.js first."
    exit 1
fi

# Run the test script
node ./scripts/test-mongodb.js

# Check the result
if [ $? -eq 0 ]; then
    echo "MongoDB connection test passed! ✅"
else
    echo "MongoDB connection test failed! ❌"
    echo "Please check your MongoDB connection string and make sure your IP address is whitelisted in MongoDB Atlas."
fi
