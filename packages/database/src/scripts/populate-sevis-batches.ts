#!/usr/bin/env tsx
/**
 * Script to populate InstantDB with SEVIS batch mock data
 * Run with: npx tsx packages/database/src/scripts/populate-sevis-batches.ts
 */

import { init, tx, id } from '@instantdb/admin';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from packages/database/.env.local
const envPath = path.resolve(__dirname, '../../.env.local');
dotenv.config({ path: envPath });

// Initialize InstantDB admin client
const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

if (!APP_ID || !ADMIN_TOKEN) {
  console.error('❌ Missing InstantDB credentials!');
  console.error('Please ensure NEXT_PUBLIC_INSTANT_APP_ID and INSTANT_ADMIN_TOKEN are set in .env.local');
  process.exit(1);
}

console.log('🔑 Using APP_ID:', APP_ID);
console.log('🔑 Admin Token:', ADMIN_TOKEN.substring(0, 8) + '...');

const db = init({
  appId: APP_ID,
  adminToken: ADMIN_TOKEN,
});

// Load mock data
const mockDataPath = path.resolve(__dirname, 'sevis-batches-mock-data.json');
const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf-8'));

async function populateDatabase() {
  console.log('\n📦 Starting database population...');
  console.log(`📊 Found ${mockData.sevisBatches.length} SEVIS batches to insert\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const batch of mockData.sevisBatches) {
    try {
      // Convert date strings to Date objects
      const batchData = {
        id: id(),
        batchNumber: batch.batchNumber,
        type: batch.type,
        status: batch.status,
        createdBy: batch.createdBy,
        createdById: batch.createdById,
        numberOfParticipants: batch.numberOfParticipants,
        program: batch.program,
        submittedAt: batch.submittedAt ? new Date(batch.submittedAt) : undefined,
        processedAt: batch.processedAt ? new Date(batch.processedAt) : undefined,
        exportedAt: batch.exportedAt ? new Date(batch.exportedAt) : undefined,
        notes: batch.notes,
        metadata: batch.metadata,
        createdAt: new Date(batch.createdAt),
        updatedAt: new Date(batch.updatedAt),
      };

      // Insert batch
      await db.transact([
        tx.sevisBatches[batchData.id].update(batchData),
      ]);

      console.log(`✅ Inserted batch ${batch.batchNumber} (${batch.status})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to insert batch ${batch.batchNumber}:`, error);
      errorCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully inserted: ${successCount} batches`);
  console.log(`❌ Failed: ${errorCount} batches`);
  console.log('\n✨ Database population complete!');
}

// Run the population script
populateDatabase()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
