// Test file to verify module alias is working in production
require('module-alias/register');

console.log('✅ Testing module alias...');

try {
  // Test the main problematic import
  const connection = require('@/database/connection');
  console.log('✅ @/database/connection import successful');

  const logger = require('@/utils/logger');
  console.log('✅ @/utils/logger import successful');

  const commandLoader = require('@/utils/commandLoader');
  console.log('✅ @/utils/commandLoader import successful');

  console.log('🎉 All module alias imports working correctly!');
} catch (error) {
  console.error('❌ Error with module alias:', error.message);
  process.exit(1);
}
