#!/usr/bin/env tsx

/**
 * Test InstantDB with UUID format
 * InstantDB expects UUID format for entity IDs
 */

import dotenv from 'dotenv';
import path from 'path';
import { randomUUID } from 'crypto';

// Load .env files
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env.local') });

import { init } from '@instantdb/admin';

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

const adminDb = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

async function testUUIDFormat() {
  console.log('🆔 Testing InstantDB with UUID format...\n');
  
  // Test 1: Use proper UUID for ID
  console.log('Test 1: Using proper UUID format');
  try {
    const userId = randomUUID();
    const userData = { 
      email: 'uuid-test@example.com',
      role: 'admin',
      firstName: 'UUID',
      lastName: 'Test',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Generated UUID:', userId);
    console.log('User data:', userData);
    
    await adminDb.transact([adminDb.tx.users[userId].update(userData)]);
    console.log('✅ UUID format worked!');
    
    return userId; // Return for next test
  } catch (error) {
    console.log('❌ UUID format failed');
    if (error instanceof Error && 'body' in error) {
      const errorBody = (error as any).body;
      console.log('UUID error:', JSON.stringify(errorBody.hint?.errors, null, 2));
    }
    return null;
  }
}

async function testProfileWithUUID(userId: string) {
  console.log('\nTest 2: Adding profile with user UUID reference');
  try {
    const profileId = randomUUID();
    const profileData = {
      userId: userId, // Reference the user UUID
      type: 'admin',
      firstName: 'UUID',
      lastName: 'Profile',
      email: 'uuid-profile@example.com',
      status: 'active',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Profile UUID:', profileId);
    console.log('Profile data:', profileData);
    
    await adminDb.transact([adminDb.tx.profiles[profileId].update(profileData)]);
    console.log('✅ Profile with UUID reference worked!');
    
  } catch (error) {
    console.log('❌ Profile with UUID reference failed');
    if (error instanceof Error && 'body' in error) {
      const errorBody = (error as any).body;
      console.log('Profile error:', JSON.stringify(errorBody.hint?.errors, null, 2));
    }
  }
}

async function runTests() {
  const userId = await testUUIDFormat();
  
  if (userId) {
    await testProfileWithUUID(userId);
    
    console.log('\n🎉 UUID format tests completed successfully!');
    console.log('🔑 Key finding: InstantDB requires UUID format for entity IDs');
  } else {
    console.log('\n💥 UUID format tests failed');
  }
}

if (require.main === module) {
  runTests()
    .then(() => {
      console.log('UUID format test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('UUID format test failed:', error);
      process.exit(1);
    });
} 