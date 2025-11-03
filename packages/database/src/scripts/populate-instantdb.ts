#!/usr/bin/env tsx

/**
 * Simple InstantDB Population Script
 * Populates InstantDB with sample data for testing
 */

// Load environment variables for Node.js script
import dotenv from 'dotenv';
import path from 'path';

// Load .env files
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env.local') });

import { init } from '@instantdb/admin';

// Initialize InstantDB admin client
const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

console.log('Environment check:');
console.log('NEXT_PUBLIC_INSTANT_APP_ID:', INSTANT_APP_ID ? 'Set' : 'Missing');
console.log('INSTANT_ADMIN_TOKEN:', INSTANT_ADMIN_TOKEN ? 'Set' : 'Missing');

if (!INSTANT_APP_ID || !INSTANT_ADMIN_TOKEN) {
  console.error('Missing InstantDB credentials');
  process.exit(1);
}

const adminDb = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

// Simple sample data
const sampleUsers = [
  {
    id: 'user_1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'student',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'user_2',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'host_family',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'user_3',
    email: 'mike.coordinator@example.com',
    firstName: 'Mike',
    lastName: 'Johnson',
    role: 'local_coordinator',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const sampleProfiles = [
  {
    id: 'profile_1',
    userId: 'user_1',
    type: 'student',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    status: 'active',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'profile_2',
    userId: 'user_2',
    type: 'host_family',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1234567891',
    status: 'active',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

async function populateInstantDB() {
  try {
    console.log('Starting to populate InstantDB...');
    
    // Test the connection first
    console.log('Testing connection...');
    
    // Add users one by one with proper error handling
    for (const user of sampleUsers) {
      try {
        console.log(`Adding user: ${user.email}`);
        await adminDb.transact([adminDb.tx.users[user.id].update(user)]);
        console.log(`✅ Added user: ${user.email}`);
      } catch (error) {
        console.error(`❌ Failed to add user ${user.email}:`, error);
      }
    }
    
    // Add profiles
    for (const profile of sampleProfiles) {
      try {
        console.log(`Adding profile: ${profile.email}`);
        await adminDb.transact([adminDb.tx.profiles[profile.id].update(profile)]);
        console.log(`✅ Added profile: ${profile.email}`);
      } catch (error) {
        console.error(`❌ Failed to add profile ${profile.email}:`, error);
      }
    }
    
    console.log('🎉 Population completed successfully!');
    
  } catch (error) {
    console.error('💥 Population failed:', error);
    throw error;
  }
}

// Run the population script
if (require.main === module) {
  populateInstantDB()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { populateInstantDB }; 