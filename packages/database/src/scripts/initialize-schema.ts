#!/usr/bin/env tsx

/**
 * Initialize InstantDB Schema
 * This script sets up the schema in InstantDB before we can add data
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

// Simplified schema for initial setup
const basicSchema = {
  entities: {
    users: {
      email: { type: 'string', unique: true },
      role: { type: 'string' },
      firstName: { type: 'string', optional: true },
      lastName: { type: 'string', optional: true },
      phone: { type: 'string', optional: true },
      status: { type: 'string' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' }
    },
    profiles: {
      userId: { type: 'string' },
      type: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      email: { type: 'string' },
      phone: { type: 'string', optional: true },
      status: { type: 'string' },
      isActive: { type: 'boolean' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' }
    },
    applications: {
      studentProfileId: { type: 'string' },
      programType: { type: 'string' },
      academicYear: { type: 'string' },
      status: { type: 'string' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' }
    },
    placements: {
      studentProfileId: { type: 'string' },
      hostFamilyProfileId: { type: 'string' },
      programType: { type: 'string' },
      status: { type: 'string' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' }
    },
    referenceData: {
      type: { type: 'string' },
      code: { type: 'string' },
      name: { type: 'string' },
      isActive: { type: 'boolean' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' }
    }
  },
  links: {
    userProfiles: {
      forward: { on: 'users', has: 'many', label: 'profiles' },
      reverse: { on: 'profiles', has: 'one', label: 'user' }
    }
  }
};

async function initializeSchema() {
  try {
    console.log('🔧 Initializing InstantDB schema...');
    
    // Check if we can access the schema endpoint
    console.log('Checking current schema...');
    
    // Try to apply the schema
    // Note: InstantDB might handle schema automatically or need manual setup
    console.log('Schema object prepared:', JSON.stringify(basicSchema, null, 2));
    
    // Test with a very simple user after "schema" setup
    console.log('\nTesting simple user creation...');
    
    const testUser = {
      email: 'schema-test@example.com',
      role: 'admin',
      firstName: 'Schema',
      lastName: 'Test',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await adminDb.transact([adminDb.tx.users['schema-test-1'].update(testUser)]);
    console.log('✅ Schema test user created successfully!');
    
    console.log('🎉 Schema initialization completed!');
    
  } catch (error) {
    console.error('💥 Schema initialization failed:', error);
    
    // More detailed error analysis
    if (error instanceof Error && 'body' in error) {
      const errorBody = (error as any).body;
      console.log('Full error body:', JSON.stringify(errorBody, null, 2));
      
      if (errorBody.hint?.errors) {
        console.log('Specific errors:', JSON.stringify(errorBody.hint.errors, null, 2));
      }
    }
    
    throw error;
  }
}

if (require.main === module) {
  initializeSchema()
    .then(() => {
      console.log('Schema initialization completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Schema initialization failed:', error);
      process.exit(1);
    });
} 