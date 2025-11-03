#!/usr/bin/env tsx

/**
 * Test Different Transaction Formats for InstantDB
 * Try to understand what format InstantDB expects
 */

import dotenv from 'dotenv';
import path from 'path';

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

async function testTransactionFormats() {
  console.log('🧪 Testing different transaction formats...\n');
  
  // Test 1: Try using .merge instead of .update
  console.log('Test 1: Using .merge instead of .update');
  try {
    const userData = { 
      id: 'test-merge-1',
      email: 'merge@example.com'
    };
    await adminDb.transact([adminDb.tx.users['test-merge-1'].merge(userData)]);
    console.log('✅ .merge() worked!');
  } catch (error) {
    console.log('❌ .merge() failed');
    if (error instanceof Error && 'body' in error) {
      const errorBody = (error as any).body;
      console.log('Merge error:', JSON.stringify(errorBody.hint?.errors, null, 2));
    }
  }
  
  console.log('\n---\n');
  
  // Test 2: Try without custom ID
  console.log('Test 2: Let InstantDB generate ID');
  try {
    const userData = { 
      email: 'auto-id@example.com',
      name: 'Auto ID User'
    };
    const tempId = 'temp-' + Date.now();
    await adminDb.transact([adminDb.tx.users[tempId].update(userData)]);
    console.log('✅ Auto ID worked!');
  } catch (error) {
    console.log('❌ Auto ID failed');
    if (error instanceof Error && 'body' in error) {
      const errorBody = (error as any).body;
      console.log('Auto ID error:', JSON.stringify(errorBody.hint?.errors, null, 2));
    }
  }
  
  console.log('\n---\n');
  
  // Test 3: Try the exact format from InstantDB docs
  console.log('Test 3: InstantDB docs example format');
  try {
    // Try a very basic structure
    await adminDb.transact([
      adminDb.tx.users['doc-test-1'].update({
        email: 'docs@example.com'
      })
    ]);
    console.log('✅ Docs format worked!');
  } catch (error) {
    console.log('❌ Docs format failed');
    if (error instanceof Error && 'body' in error) {
      const errorBody = (error as any).body;
      console.log('Docs error:', JSON.stringify(errorBody, null, 2));
    }
  }
  
  console.log('\n---\n');
  
  // Test 4: Check if we can query existing data first
  console.log('Test 4: Try to query existing data');
  try {
    // Just try to read from users table
    const result = await adminDb.transact([]);
    console.log('✅ Empty transaction worked!', result);
  } catch (error) {
    console.log('❌ Empty transaction failed');
    console.log('Query error:', error);
  }
  
  console.log('\n---\n');
  
  // Test 5: Check available transactions
  console.log('Test 5: Check what\'s available on adminDb.tx');
  console.log('adminDb.tx keys:', Object.keys(adminDb.tx || {}));
  console.log('adminDb.tx.users type:', typeof adminDb.tx?.users);
  
  if (adminDb.tx?.users) {
    console.log('users methods:', Object.getOwnPropertyNames(adminDb.tx.users));
    
    // Try to access a user record differently
    try {
      const userRecord = adminDb.tx.users['test-access'];
      console.log('User record methods:', Object.getOwnPropertyNames(userRecord));
    } catch (error) {
      console.log('Cannot access user record:', error);
    }
  }
  
  console.log('\n🎯 Transaction format test complete!');
}

if (require.main === module) {
  testTransactionFormats()
    .then(() => {
      console.log('Transaction format test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Transaction format test failed:', error);
      process.exit(1);
    });
} 