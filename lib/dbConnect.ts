import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/upwork-proposal-tracker';

// Define the mongoose cache type
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Add mongoose global type
declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect() {
  if (cached.conn) {
    console.log('Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    // Log the MongoDB connection attempt (but don't log the full URI for security)
    console.log('Connecting to MongoDB...');
    
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error.message);
        throw error;
      });
  }

  try {
    console.log('Waiting for MongoDB connection...');
    cached.conn = await cached.promise;
    console.log('MongoDB connection established');
  } catch (e: any) {
    console.error('Failed to establish MongoDB connection:', e.message);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
