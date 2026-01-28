#!/usr/bin/env tsx
/**
 * Script to migrate data from old InstantDB project to new one
 * Run with: npx tsx packages/database/src/scripts/migrate-from-old-instantdb.ts
 */

import { init, tx, id } from '@instantdb/admin';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from packages/database/.env.local
const envPath = path.resolve(__dirname, '../../.env.local');
dotenv.config({ path: envPath });

// ===== OLD INSTANTDB CREDENTIALS =====
// Replace these with your old InstantDB credentials
const OLD_APP_ID = process.env.OLD_INSTANT_APP_ID || 'YOUR_OLD_APP_ID_HERE';
const OLD_ADMIN_TOKEN = process.env.OLD_INSTANT_ADMIN_TOKEN || 'YOUR_OLD_ADMIN_TOKEN_HERE';

// ===== NEW INSTANTDB CREDENTIALS =====
const NEW_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
const NEW_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

if (!NEW_APP_ID || !NEW_ADMIN_TOKEN) {
  console.error('❌ Missing NEW InstantDB credentials!');
  console.error('Please ensure NEXT_PUBLIC_INSTANT_APP_ID and INSTANT_ADMIN_TOKEN are set in .env.local');
  process.exit(1);
}

if (OLD_APP_ID === 'YOUR_OLD_APP_ID_HERE' || OLD_ADMIN_TOKEN === 'YOUR_OLD_ADMIN_TOKEN_HERE') {
  console.error('❌ Please update the OLD_APP_ID and OLD_ADMIN_TOKEN in this script!');
  process.exit(1);
}

console.log('🔑 OLD APP_ID:', OLD_APP_ID);
console.log('🔑 NEW APP_ID:', NEW_APP_ID);
console.log('');

// Initialize both database clients
const oldDb = init({
  appId: OLD_APP_ID,
  adminToken: OLD_ADMIN_TOKEN,
});

const newDb = init({
  appId: NEW_APP_ID,
  adminToken: NEW_ADMIN_TOKEN,
});

// List of all entities to migrate
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

interface MigrationStats {
  entity: string;
  totalRecords: number;
  successCount: number;
  errorCount: number;
  errors: Array<{ id: string; error: string }>;
}

async function migrateEntity(entityName: string): Promise<MigrationStats> {
  const stats: MigrationStats = {
    entity: entityName,
    totalRecords: 0,
    successCount: 0,
    errorCount: 0,
    errors: [],
  };

  try {
    console.log(`\n📦 Migrating ${entityName}...`);

    // Query all data from old database
    const query = { [entityName]: {} };
    const oldData = await oldDb.query(query);
    const records = oldData[entityName] || [];

    stats.totalRecords = records.length;

    if (records.length === 0) {
      console.log(`   ⚠️  No records found in ${entityName}`);
      return stats;
    }

    console.log(`   📊 Found ${records.length} records`);

    // Migrate each record
    for (const record of records) {
      try {
        // Convert date strings back to Date objects if needed
        const processedRecord = { ...record };

        // List of common date fields
        const dateFields = [
          'createdAt',
          'updatedAt',
          'lastSignIn',
          'verificationDate',
          'submissionDate',
          'decisionDate',
          'startDate',
          'endDate',
          'scheduledDate',
          'completionDate',
          'followUpDate',
          'effectiveDate',
          'submittedAt',
          'processedAt',
          'exportedAt',
          'dueDate',
          'uploadedAt',
        ];

        // Convert date fields
        for (const field of dateFields) {
          if (processedRecord[field]) {
            processedRecord[field] = new Date(processedRecord[field]);
          }
        }

        // Write to new database using transact
        await newDb.transact([
          tx[entityName][record.id].update(processedRecord),
        ]);

        stats.successCount++;
      } catch (error) {
        stats.errorCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        stats.errors.push({
          id: record.id || 'unknown',
          error: errorMessage,
        });
        console.error(`   ❌ Failed to migrate record ${record.id}:`, errorMessage);
      }
    }

    console.log(`   ✅ Successfully migrated ${stats.successCount}/${stats.totalRecords} records`);
    if (stats.errorCount > 0) {
      console.log(`   ⚠️  Failed: ${stats.errorCount} records`);
    }

    return stats;
  } catch (error) {
    console.error(`   ❌ Error querying ${entityName}:`, error);
    return stats;
  }
}

async function migrateAllData() {
  console.log('\n🚀 Starting migration from old to new InstantDB instance...\n');
  console.log('=' .repeat(60));

  const allStats: MigrationStats[] = [];

  // Migrate each entity
  for (const entityName of ENTITIES) {
    const stats = await migrateEntity(entityName);
    allStats.push(stats);

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Print final summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 MIGRATION SUMMARY:\n');

  let totalRecords = 0;
  let totalSuccess = 0;
  let totalErrors = 0;

  for (const stats of allStats) {
    totalRecords += stats.totalRecords;
    totalSuccess += stats.successCount;
    totalErrors += stats.errorCount;

    if (stats.totalRecords > 0) {
      const status = stats.errorCount === 0 ? '✅' : '⚠️';
      console.log(
        `${status} ${stats.entity.padEnd(25)} ${stats.successCount}/${stats.totalRecords} migrated`
      );

      // Show errors if any
      if (stats.errors.length > 0 && stats.errors.length <= 5) {
        stats.errors.forEach(err => {
          console.log(`     └─ Error on ${err.id}: ${err.error}`);
        });
      } else if (stats.errors.length > 5) {
        console.log(`     └─ ${stats.errors.length} errors (showing first 3):`);
        stats.errors.slice(0, 3).forEach(err => {
          console.log(`        └─ ${err.id}: ${err.error}`);
        });
      }
    }
  }

  console.log('\n' + '-'.repeat(60));
  console.log(`📊 Total Records: ${totalRecords}`);
  console.log(`✅ Successfully Migrated: ${totalSuccess}`);
  console.log(`❌ Failed: ${totalErrors}`);
  console.log('=' .repeat(60));

  if (totalErrors === 0) {
    console.log('\n🎉 Migration completed successfully!');
  } else {
    console.log('\n⚠️  Migration completed with some errors. Please review the logs above.');
  }
}

// Run the migration
migrateAllData()
  .then(() => {
    console.log('\n✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
