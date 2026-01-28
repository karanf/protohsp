#!/usr/bin/env tsx
/**
 * Script to verify data in InstantDB
 * Run with: npx tsx packages/database/src/scripts/verify-data.ts
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

async function verifyData() {
  console.log('🔍 Verifying data in InstantDB...\n');

  try {
    // Query all SEVIS batches
    const result = await db.query({ sevisBatches: {} });

    const batches = result.sevisBatches;

    if (!batches || batches.length === 0) {
      console.log('❌ No SEVIS batches found in database!');
      return;
    }

    console.log(`✅ Found ${batches.length} SEVIS batches in database\n`);

    // Count by status
    const statusCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};
    const programCounts: Record<string, number> = {};

    batches.forEach((batch: any) => {
      statusCounts[batch.status] = (statusCounts[batch.status] || 0) + 1;
      typeCounts[batch.type] = (typeCounts[batch.type] || 0) + 1;
      programCounts[batch.program] = (programCounts[batch.program] || 0) + 1;
    });

    console.log('📊 Status breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    console.log('\n📊 Type breakdown:');
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    console.log('\n📊 Program breakdown:');
    Object.entries(programCounts).forEach(([program, count]) => {
      console.log(`   ${program}: ${count}`);
    });

    // Show sample records
    console.log('\n📝 Sample records:');
    batches.slice(0, 3).forEach((batch: any) => {
      console.log(`   - ${batch.batchNumber}: ${batch.type} (${batch.status}) - ${batch.numberOfParticipants} participants`);
    });

    console.log('\n✅ Data verification complete!');
  } catch (error) {
    console.error('❌ Error verifying data:', error);
  }
}

verifyData()
  .then(() => {
    console.log('\n🎉 Verification complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
