import mongoose from 'mongoose';
import { logger } from '@/utils/logger';

/**
 * Establishes connection to MongoDB database
 */
export async function connectDatabase(): Promise<void> {
  try {
    const mongoUri = process.env['MONGODB_URI'];

    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    // Configure mongoose options
    const options = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    };

    // Connect to MongoDB
    await mongoose.connect(mongoUri, options);

    // Set up connection event handlers
    mongoose.connection.on('connected', () => {
      logger.info('📊 MongoDB connection established successfully');
    });

    mongoose.connection.on('error', (error: Error) => {
      logger.error('❌ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB connection lost');
    });

    // Graceful app termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('📊 MongoDB connection closed through app termination');
    });
  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.connection.close();
    logger.info('📊 MongoDB connection closed successfully');
  } catch (error) {
    logger.error('❌ Error closing MongoDB connection:', error);
    throw error;
  }
}
