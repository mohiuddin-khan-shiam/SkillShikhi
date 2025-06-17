// services/databaseService.js

import mongoose from 'mongoose';
import config from '../config';
import logger from './loggerService';

/**
 * Connect to MongoDB database
 * @returns {Promise<mongoose.Connection>} Mongoose connection
 */
export async function connectToDatabase() {
  try {
    const { uri, name } = config.database;
    
    // If in development and no URI is provided, use mock connection
    if (!uri && config.server.nodeEnv === 'development') {
      logger.warn('Development mode: Using mock database connection');
      return { 
        readyState: 1, 
        models: {},
        collection: () => ({ 
          find: () => ({ toArray: () => Promise.resolve([]) }),
          findOne: () => Promise.resolve(null),
          insertOne: () => Promise.resolve({ insertedId: 'mock-id' }),
          updateOne: () => Promise.resolve({ modifiedCount: 1 }),
          deleteOne: () => Promise.resolve({ deletedCount: 1 })
        })
      };
    }
    
    if (!uri) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    
    // Check if we're already connected
    if (mongoose.connection.readyState === 1) {
      logger.debug('Using existing database connection');
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
    
    logger.info('Connected to MongoDB');
    return mongoose.connection;
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB database
 * @returns {Promise<void>}
 */
export async function disconnectFromDatabase() {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      logger.info('Disconnected from MongoDB');
    }
  } catch (error) {
    logger.error('MongoDB disconnection error:', error);
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
    // If in development mode without a database, execute the operation anyway
    // The operation should handle mock data appropriately
    if (config.server.nodeEnv === 'development' && !config.database.uri) {
      logger.debug('Development mode: Using mock data');
      // Still call the operation, which should handle mock data internally
      return await operation();
    }
    
    // For normal operation, connect to the database first
    await connectToDatabase();
    return await operation();
  } catch (error) {
    logger.error('Database operation error:', error);
    if (config.server.nodeEnv === 'development' && !config.database.uri) {
      // In development without a DB, return null to simulate "not found"
      logger.warn('Development mode: Returning null after error');
      return null;
    }
    throw error;
  }
}
