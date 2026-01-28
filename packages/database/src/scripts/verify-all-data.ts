#!/usr/bin/env tsx
/**
 * Script to verify all migrated data in InstantDB
 * Run with: npx tsx packages/database/src/scripts/verify-all-data.ts
 */

import { init } from '@instantdb/admin';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env.local');
dotenv.config({ path: envPath });

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

if (!APP_ID || !ADMIN_TOKEN) {
  console.error('❌ Missing InstantDB credentials!');
  process.exit(1);
}

const db = init({
  appId: APP_ID,
  adminToken: ADMIN_TOKEN,
});

const ENTITIES = [
  'users',
  'profiles',
  'applications',
  'relationships',
  'placements',
  'monitoring',
  'referenceData',
  'documents',
  'notes',
  'changeQueue',
  'sevisBatches',
  'sevisBatchParticipants',
];

async function verifyAllData() {
  console.log('🔍 Verifying all migrated data in InstantDB...\n');
  console.log('=' .repeat(60));

  let totalRecords = 0;

  for (const entityName of ENTITIES) {
    try {
      const query = { [entityName]: {} };
      const result = await db.query(query);
      const records = result[entityName] || [];
      const count = records.length;
      totalRecords += count;

      const icon = count > 0 ? '✅' : '⚠️';
      console.log(`${icon} ${entityName.padEnd(25)} ${count.toString().padStart(6)} records`);
    } catch (error) {
      console.error(`❌ Error querying ${entityName}:`, error);
    }
  }

  console.log('=' .repeat(60));
  console.log(`📊 Total Records: ${totalRecords}`);
  console.log('\n✅ Verification complete!');
}

verifyAllData()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
