// MongoDB connection test script
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.production' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}

console.log('Connecting to MongoDB...');
console.log('Connection string format check:', 
  MONGODB_URI.startsWith('mongodb+srv://') ? 'Valid MongoDB+SRV format' : 'Not using SRV format');

// Mask the password in the URI for logging
const maskedUri = MONGODB_URI.replace(
  /(mongodb(\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/,
  '$1*****$4'
);
console.log('Attempting to connect to:', maskedUri);

mongoose.connect(MONGODB_URI, {
  connectTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 45000, // 45 seconds
})
.then(() => {
  console.log('✅ MongoDB connection successful!');
  console.log('MongoDB version:', mongoose.version);
  
  // Try to access the User collection
  const db = mongoose.connection;
  return db.collection('users').countDocuments();
})
.then((count) => {
  console.log(`Found ${count} users in the database`);
  process.exit(0);
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  if (err.name === 'MongoServerSelectionError') {
    console.error('This error often occurs when the MongoDB URI is incorrect or the server is unreachable.');
    console.error('Please check your network connection and MongoDB Atlas whitelist settings.');
  }
  process.exit(1);
});
