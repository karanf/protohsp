#!/usr/bin/env ts-node

/**
 * InstantDB Setup Helper Script
 * 
 * This script helps guide you through setting up InstantDB for the EGAB project.
 * It checks your environment and provides instructions for getting started.
 */

import fs from 'fs';
import path from 'path';
import { adminDb, db } from '../client';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkEnvironmentVariables() {
  log('\n📋 Checking Environment Variables...', colors.cyan);
  
  const requiredVars = [
    'NEXT_PUBLIC_INSTANT_APP_ID',
    'INSTANT_ADMIN_TOKEN'
  ];

  const missing = [];
  const found = [];

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      found.push(varName);
      log(`  ✅ ${varName}: Found`, colors.green);
    } else {
      missing.push(varName);
      log(`  ❌ ${varName}: Missing`, colors.red);
    }
  }

  return { missing, found, allFound: missing.length === 0 };
}

function checkEnvFiles() {
  log('\n📁 Checking .env.local files...', colors.cyan);
  
  const envPaths = [
    '.env.local',
    'apps/greenheart/.env.local',
    'apps/educatius/.env.local',
    'apps/web/.env.local'
  ];

  const existing = [];
  const missing = [];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      existing.push(envPath);
      log(`  ✅ ${envPath}: Exists`, colors.green);
    } else {
      missing.push(envPath);
      log(`  ❌ ${envPath}: Missing`, colors.yellow);
    }
  }

  return { existing, missing };
}

function createSampleEnvFile() {
  log('\n📝 Creating sample .env.local file...', colors.cyan);
  
  const sampleEnv = `# InstantDB Configuration
# Get these values from https://instantdb.com after creating an account

# Your InstantDB App ID (public - can be exposed to client)
NEXT_PUBLIC_INSTANT_APP_ID=your_app_id_here

# Your InstantDB Admin Token (private - server-side only)  
INSTANT_ADMIN_TOKEN=your_admin_token_here

# Optional: Additional configuration
NODE_ENV=development
`;

  try {
    fs.writeFileSync('.env.local.example', sampleEnv);
    log('  ✅ Created .env.local.example', colors.green);
    log('  📋 Copy this file to .env.local and fill in your InstantDB credentials', colors.yellow);
  } catch (error) {
    log(`  ❌ Failed to create .env.local.example: ${error}`, colors.red);
  }
}

async function testInstantDBConnection() {
  log('\n🔗 Testing InstantDB Connection...', colors.cyan);

  if (!db) {
    log('  ❌ InstantDB client not initialized', colors.red);
    log('  💡 Make sure NEXT_PUBLIC_INSTANT_APP_ID is set in your environment', colors.yellow);
    return false;
  }

  if (!adminDb) {
    log('  ❌ InstantDB admin client not initialized', colors.red);
    log('  💡 Make sure INSTANT_ADMIN_TOKEN is set in your environment', colors.yellow);
    return false;
  }

  try {
    // Test a simple query
    log('  🔍 Testing basic query...', colors.blue);
    const result = db.useQuery({ users: {} });
    log('  ✅ InstantDB client connection successful', colors.green);
    return true;
  } catch (error) {
    log(`  ❌ InstantDB connection failed: ${error}`, colors.red);
    return false;
  }
}

function printInstructions() {
  log('\n🚀 InstantDB Setup Instructions', colors.bold + colors.magenta);
  log('================================', colors.magenta);
  
  log('\n1. Create InstantDB Account:', colors.cyan);
  log('   • Visit https://instantdb.com');
  log('   • Sign up for a free account');
  log('   • Create a new application');

  log('\n2. Get Your Credentials:', colors.cyan);
  log('   • Copy your App ID from the InstantDB dashboard');
  log('   • Copy your Admin Token from the dashboard');

  log('\n3. Configure Environment:', colors.cyan);
  log('   • Copy .env.local.example to .env.local');
  log('   • Replace placeholders with your actual credentials:');
  log('     NEXT_PUBLIC_INSTANT_APP_ID=your_actual_app_id');
  log('     INSTANT_ADMIN_TOKEN=your_actual_admin_token');

  log('\n4. Test Setup:', colors.cyan);
  log('   • Run: pnpm --filter @repo/database setup');
  log('   • Or: npm run setup (from packages/database)');

  log('\n5. Populate Sample Data:', colors.cyan);
  log('   • Run: pnpm --filter @repo/database migrate');
  log('   • Or: npm run migrate (from packages/database)');

  log('\n6. Start Development:', colors.cyan);
  log('   • Run: pnpm dev (from project root)');
  log('   • Open multiple browser windows to test real-time features');

  log('\n📚 Documentation:', colors.blue);
  log('   • InstantDB Docs: https://instantdb.com/docs');
  log('   • Migration Guide: ./INSTANTDB_MIGRATION.md');
  log('   • Project Docs: ./docs/technical.md');
}

function printTroubleshooting() {
  log('\n🔧 Troubleshooting:', colors.yellow);
  log('==================', colors.yellow);

  log('\n❌ "InstantDB client not initialized"');
  log('   • Check NEXT_PUBLIC_INSTANT_APP_ID in .env.local');
  log('   • Ensure the variable name is exactly correct');
  log('   • Restart your development server after adding env vars');

  log('\n❌ "Admin token required"');
  log('   • Check INSTANT_ADMIN_TOKEN in .env.local');  
  log('   • Make sure this token is kept private (server-side only)');
  log('   • Verify the token is valid in InstantDB dashboard');

  log('\n❌ Real-time features not working');
  log('   • Check browser console for errors');
  log('   • Test with multiple browser windows');
  log('   • Verify your InstantDB app is active');

  log('\n❌ Type errors in development');
  log('   • InstantDB auto-generates types from schema');
  log('   • Restart TypeScript server in your editor');
  log('   • Clear node_modules and reinstall if needed');
}

async function main() {
  log('🎯 InstantDB Setup Helper for EGAB', colors.bold + colors.green);
  log('===================================', colors.green);

  // Check environment variables
  const { missing, found, allFound } = checkEnvironmentVariables();

  // Check .env files
  const envFiles = checkEnvFiles();

  // Create sample env file if needed
  if (envFiles.missing.length > 0) {
    createSampleEnvFile();
  }

  // Test connection if env vars are available
  let connectionWorking = false;
  if (allFound) {
    connectionWorking = await testInstantDBConnection();
  }

  // Print status summary
  log('\n📊 Setup Status Summary:', colors.bold + colors.blue);
  log('========================', colors.blue);
  
  if (allFound) {
    log('✅ Environment variables: Configured', colors.green);
  } else {
    log(`❌ Environment variables: ${missing.length} missing`, colors.red);
  }

  if (connectionWorking) {
    log('✅ InstantDB connection: Working', colors.green);
    log('\n🎉 Setup complete! You can now run the migration script.', colors.bold + colors.green);
    log('   Next step: pnpm --filter @repo/database migrate', colors.cyan);
  } else {
    log('❌ InstantDB connection: Not working', colors.red);
    printInstructions();
    printTroubleshooting();
  }

  log('\n✨ Happy coding with InstantDB! ✨', colors.bold + colors.magenta);
}

// Run setup if called directly
if (require.main === module) {
  main().catch(error => {
    log(`\n💥 Setup failed: ${error.message}`, colors.red);
    process.exit(1);
  });
}

export { main as setupInstantDB }; 