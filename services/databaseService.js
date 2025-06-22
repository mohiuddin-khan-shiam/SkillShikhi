// services/databaseService.js

import mongoose from 'mongoose';
import config from '../config';

/**
 * Connect to MongoDB database
 * @returns {Promise<mongoose.Connection>} Mongoose connection
 */
export async function connectToDatabase() {
  try {
    const { uri, name } = config.database;
    
    if (!uri) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    
    // Check if we're already connected
    if (mongoose.connection.readyState === 1) {
      console.log('🔄 Using existing database connection');
      return mongoose.connection;
    }
    
    // Configure mongoose
    mongoose.set('strictQuery', false);
    
    // Connect to MongoDB
    await mongoose.connect(uri, {
      dbName: name,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB database
 * @returns {Promise<void>}
 */
export async function disconnectFromDatabase() {
  try {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error);
    throw error;
  }
}

/**
 * Execute a database operation with automatic connection handling
 * @param {Function} operation - Database operation to execute
 * @returns {Promise<any>} Result of the operation
 */
export async function executeDbOperation(operation) {
  try {
    await connectToDatabase();
    return await operation();
  } catch (error) {
    console.error('❌ Database operation error:', error);
    throw error;
  }
}
