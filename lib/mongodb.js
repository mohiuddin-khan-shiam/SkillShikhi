import dotenv from 'dotenv';
dotenv.config(); //
console.log('🔧 MONGODB_URI:', process.env.MONGODB_URI);

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
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

export default dbConnect;
