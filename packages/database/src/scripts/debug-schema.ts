#!/usr/bin/env tsx

/**
 * Debug InstantDB Schema Requirements
 * This script tests minimal data structures to understand validation requirements
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

async function debugSchema() {
  console.log('🔍 Debugging InstantDB schema requirements...\n');
  
  // Test 1: Ultra minimal user
  console.log('Test 1: Minimal user structure');
  try {
    const minimalUser = { id: 'debug-user-1' };
    await adminDb.transact([adminDb.tx.users['debug-user-1'].update(minimalUser)]);
    console.log('✅ Minimal user worked!', minimalUser);
  } catch (error) {
    console.log('❌ Minimal user failed');
    if (error instanceof Error && 'body' in error) {
      const errorBody = (error as any).body;
      if (errorBody.hint?.errors) {
        console.log('Error details:', JSON.stringify(errorBody.hint.errors, null, 2));
      }
    }
  }
  
  console.log('\n---\n');
  
  // Test 2: Adding fields one by one
  console.log('Test 2: Adding email field');
  try {
    const userWithEmail = { 
      id: 'debug-user-2',
      email: 'debug@example.com'
    };
    await adminDb.transact([adminDb.tx.users['debug-user-2'].update(userWithEmail)]);
    console.log('✅ User with email worked!', userWithEmail);
  } catch (error) {
    console.log('❌ User with email failed');
    if (error instanceof Error && 'body' in error) {
      const errorBody = (error as any).body;
      if (errorBody.hint?.errors) {
        console.log('Error details:', JSON.stringify(errorBody.hint.errors, null, 2));
      }
    }
  }
  
  console.log('\n---\n');
  
  // Test 3: Check what worked before (admin user structure)
  console.log('Test 3: Successful admin user structure');
  try {
    const adminUser = {
      id: 'debug-admin-1',
      email: 'debug-admin@example.com',
      role: 'admin',
      firstName: 'Debug',
      lastName: 'Admin',
      phone: '555-123-4567',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await adminDb.transact([adminDb.tx.users['debug-admin-1'].update(adminUser)]);
    console.log('✅ Admin user structure worked!', adminUser);
  } catch (error) {
    console.log('❌ Admin user structure failed');
    if (error instanceof Error && 'body' in error) {
      const errorBody = (error as any).body;
      if (errorBody.hint?.errors) {
        console.log('Error details:', JSON.stringify(errorBody.hint.errors, null, 2));
      }
    }
  }
  
  console.log('\n---\n');
  
  // Test 4: Try different role values
  console.log('Test 4: Testing different role values');
  const rolesToTest = ['regional_director', 'coordinator', 'student', 'host_family'];
  
  for (const role of rolesToTest) {
    try {
      const userWithRole = {
        id: `debug-${role}-1`,
        email: `debug-${role}@example.com`,
        role: role,
        firstName: 'Debug',
        lastName: 'User',
        phone: '555-123-4567',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await adminDb.transact([adminDb.tx.users[`debug-${role}-1`].update(userWithRole)]);
      console.log(`✅ Role "${role}" worked!`);
    } catch (error) {
      console.log(`❌ Role "${role}" failed`);
      if (error instanceof Error && 'body' in error) {
        const errorBody = (error as any).body;
        if (errorBody.hint?.errors) {
          console.log(`   Error for ${role}:`, JSON.stringify(errorBody.hint.errors, null, 2));
        }
      }
    }
  }
  
  console.log('\n---\n');
  
  // Test 5: Try minimal profile
  console.log('Test 5: Testing minimal profile');
  try {
    const minimalProfile = {
      id: 'debug-profile-1',
      userId: 'debug-admin-1', // Reference the admin user that worked
      type: 'admin'
    };
    await adminDb.transact([adminDb.tx.profiles['debug-profile-1'].update(minimalProfile)]);
    console.log('✅ Minimal profile worked!', minimalProfile);
  } catch (error) {
    console.log('❌ Minimal profile failed');
    if (error instanceof Error && 'body' in error) {
      const errorBody = (error as any).body;
      if (errorBody.hint?.errors) {
        console.log('Profile error details:', JSON.stringify(errorBody.hint.errors, null, 2));
      }
    }
  }
  
  console.log('\n🎯 Debug complete!');
}

if (require.main === module) {
  debugSchema()
    .then(() => {
      console.log('Debug script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Debug script failed:', error);
      process.exit(1);
    });
} 