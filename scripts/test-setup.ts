#!/usr/bin/env ts-node

import { config } from 'dotenv';
import { logger } from '../src/utils/logger';

// Load environment variables
config();

/**
 * Simple setup test to verify all dependencies and configurations
 */
async function testSetup(): Promise<void> {
  logger.info('🧪 Testing TacoBot setup...');

  // Test 1: Environment variables
  const requiredEnvVars = ['DISCORD_TOKEN', 'MONGODB_URI'];
  let envTestPassed = true;

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      logger.error(`❌ Missing environment variable: ${envVar}`);
      envTestPassed = false;
    } else {
      logger.info(`✅ Environment variable ${envVar} is set`);
    }
  }

  if (!envTestPassed) {
    logger.error('❌ Environment test failed. Please check your .env file.');
    process.exit(1);
  }

  // Test 2: Database connection
  try {
    const { connectDatabase } = await import('../src/database/connection');
    await connectDatabase();
    logger.info('✅ Database connection test passed');
  } catch (error) {
    logger.error('❌ Database connection test failed:', error);
    process.exit(1);
  }

  // Test 3: Import core modules
  try {
    await import('../src/services/TacoService');
    await import('../src/services/UserService');
    await import('../src/commands/taco/give');
    await import('../src/commands/stats/my-stats');
    await import('../src/commands/stats/leaderboard');
    logger.info('✅ Core modules import test passed');
  } catch (error) {
    logger.error('❌ Core modules import test failed:', error);
    process.exit(1);
  }

  logger.info('🎉 All setup tests passed! TacoBot is ready to deploy.');
  process.exit(0);
}

// Run the test
testSetup().catch(error => {
  logger.error('❌ Setup test failed:', error);
  process.exit(1);
});
