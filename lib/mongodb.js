import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

// Check for MONGODB_URI in environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Create a mock DB connection for local development
const mockDbConnect = () => {
  console.log('🔄 Using mock database connection for local development');
  return Promise.resolve({ connection: { on: () => {} } });
};

// Use cached connection if available
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // If no MongoDB URI is provided, use mock connection
  if (!MONGODB_URI) {
    console.log('⚠️ No MONGODB_URI provided, using mock database for development');
    cached.conn = await mockDbConnect();
    return cached.conn;
  }

  if (cached.conn) {
    console.log('✅ Using existing database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      retryWrites: true
    };

    console.log('🔌 Connecting to MongoDB...');
    
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        mongoose.connection.on('error', (err) => {
          console.error('❌ MongoDB connection error:', err);
        });
        mongoose.connection.on('disconnected', () => {
          console.log('⚠️ MongoDB disconnected');
          cached.conn = null;
          cached.promise = null;
        });
        return mongoose;
      })
      .catch((err) => {
        console.error('❌ Error connecting to MongoDB:', err);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    throw err;
  }
}

// For backward compatibility
export const connectToDatabase = dbConnect;

export default dbConnect;
