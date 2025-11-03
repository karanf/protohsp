#!/usr/bin/env tsx

import dotenv from 'dotenv';
import path from 'path';

// Load .env files
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env.local') });

import { init } from '@instantdb/admin';

// Initialize InstantDB admin client
const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

const adminDb = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

async function testSimpleData() {
  try {
    console.log('Testing with very simple user data...');
    
    // Try with minimal data first
    const simpleUser = {
      id: 'test_user_1',
      email: 'test@example.com',
      name: 'Test User'
    };
    
    console.log('Attempting to add:', simpleUser);
    await adminDb.transact([adminDb.tx.users[simpleUser.id].update(simpleUser)]);
    console.log('✅ Simple user added successfully!');
    
    // Try a simple profile
    const simpleProfile = {
      id: 'test_profile_1', 
      name: 'Test Profile'
    };
    
    console.log('Attempting to add profile:', simpleProfile);
    await adminDb.transact([adminDb.tx.profiles[simpleProfile.id].update(simpleProfile)]);
    console.log('✅ Simple profile added successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error && 'body' in error) {
      console.error('Error details:', JSON.stringify((error as any).body, null, 2));
    }
  }
}

if (require.main === module) {
  testSimpleData();
} 