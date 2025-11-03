#!/usr/bin/env tsx

/**
 * SEVIS Batches InstantDB Migration Script
 * 
 * This script migrates SEVIS batch data to InstantDB using the correct patterns
 * - Follows established dotenv loading patterns
 * - Uses proper InstantDB transaction format
 * - Includes comprehensive error handling and verification
 * - Creates realistic SEVIS batch data with participant records
 * 
 * Usage:
 * - Run with: pnpm tsx packages/database/src/scripts/migrate-sevis-batches-to-instantdb.ts
 * - Or from database directory: pnpm tsx src/scripts/migrate-sevis-batches-to-instantdb.ts
 */

import { init, id, tx } from '@instantdb/admin';
import dotenv from 'dotenv';

// Load environment variables - EXACT pattern from existing scripts
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

// Ensure required environment variables are available
const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

if (!INSTANT_APP_ID || !INSTANT_ADMIN_TOKEN) {
  console.error('❌ Missing required environment variables:');
  console.error(`  • NEXT_PUBLIC_INSTANT_APP_ID: ${INSTANT_APP_ID ? '✓' : '❌'}`);
  console.error(`  • INSTANT_ADMIN_TOKEN: ${INSTANT_ADMIN_TOKEN ? '✓' : '❌'}`);
  console.error('\nPlease check your .env.local file');
  process.exit(1);
}

// Initialize InstantDB
const db = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

// SEVIS Batch data generation
function generateSevisBatches() {
  const statuses = ['Exported', 'Processing', 'Draft', 'Failed'];
  const programs = [
    'High School Program',
    'Trainee Program', 
    'Intern Program',
    'Work & Travel Program'
  ];
  
  const administrators = [
    'Sarah Johnson',
    'Michael Chen', 
    'Aisha Patel',
    'David Rodriguez',
    'Emma Wilson',
    'James Thompson',
    'Maria Garcia',
    'Robert Kim',
    'Jennifer Singh',
    'Thomas Walker'
  ];
  
  const changeTypes = [
    'New Student',
    'Update - Housing',
    'Update - Site of Activity',
    'Program Date',
    'Validation - Housing',
    'Payment'
  ];
  
  const participantNames = [
    'Emma Johnson', 'Liam Smith', 'Olivia Williams', 'Noah Brown', 'Ava Davis',
    'William Miller', 'Sophia Wilson', 'James Moore', 'Isabella Taylor', 'Benjamin Anderson',
    'Mia Thomas', 'Lucas Jackson', 'Charlotte White', 'Mason Harris', 'Amelia Martin',
    'Ethan Thompson', 'Harper Garcia', 'Alexander Martinez', 'Evelyn Robinson', 'Michael Clark',
    'Abigail Rodriguez', 'Daniel Lewis', 'Emily Lee', 'Matthew Walker', 'Elizabeth Hall',
    'Joseph Allen', 'Sofia Young', 'David Hernandez', 'Avery King', 'Samuel Wright'
  ];
  
  const errorMessages = [
    'Invalid address format',
    'Missing required field: school district',
    'SEVIS ID already exists',
    'Program dates overlap with existing record',
    'Host family not verified',
    'Payment amount exceeds limit',
    'Document validation failed',
    'Duplicate participant entry'
  ];
  
  const randomItem = <T>(arr: T[]): T => {
    if (arr.length === 0) {
      throw new Error('Cannot select from empty array');
    }
    const item = arr[Math.floor(Math.random() * arr.length)];
    if (item === undefined) {
      throw new Error('Selected item is undefined');
    }
    return item;
  };
  
  return Array.from({ length: 25 }, (_, i) => {
    const status = randomItem(statuses);
    const program = randomItem(programs);
    const createdBy = randomItem(administrators);
    
    // Generate realistic participant counts based on program type
    let numberOfParticipants: number;
    switch (program) {
      case 'High School Program':
        numberOfParticipants = Math.floor(Math.random() * 150) + 50; // 50-200
        break;
      case 'Trainee Program':
        numberOfParticipants = Math.floor(Math.random() * 80) + 20; // 20-100
        break;
      case 'Intern Program':
        numberOfParticipants = Math.floor(Math.random() * 70) + 10; // 10-80
        break;
      case 'Work & Travel Program':
        numberOfParticipants = Math.floor(Math.random() * 45) + 5; // 5-50
        break;
      default:
        numberOfParticipants = Math.floor(Math.random() * 100) + 1;
    }
    
    // Generate success/failure distribution based on status
    let successfulRecords: number;
    let failedRecords: number;
    
    switch (status) {
      case 'Exported':
        // High success rate for exported batches
        successfulRecords = Math.floor(numberOfParticipants * (0.85 + Math.random() * 0.15));
        failedRecords = numberOfParticipants - successfulRecords;
        break;
      case 'Processing':
        // Some records processed, some pending
        successfulRecords = Math.floor(numberOfParticipants * (0.3 + Math.random() * 0.4));
        failedRecords = Math.floor(numberOfParticipants * (0.1 + Math.random() * 0.2));
        break;
      case 'Draft':
        // No records processed yet
        successfulRecords = 0;
        failedRecords = 0;
        break;
      case 'Failed':
        // High failure rate - sometimes 100% failed
        if (Math.random() < 0.3) {
          // 30% chance of 100% failure
          successfulRecords = 0;
          failedRecords = numberOfParticipants;
        } else {
          successfulRecords = Math.floor(numberOfParticipants * (0.1 + Math.random() * 0.3));
          failedRecords = numberOfParticipants - successfulRecords;
        }
        break;
      default:
        successfulRecords = Math.floor(numberOfParticipants * 0.8);
        failedRecords = numberOfParticipants - successfulRecords;
    }
    
    // Generate participant records for expanded view
    const participantRecords = Array.from({ length: numberOfParticipants }, (_, pi) => {
      const isSuccessful = pi < successfulRecords;
      const changeType = randomItem(changeTypes);
      
      return {
        id: id(), // Generate proper UUID for InstantDB
        name: randomItem(participantNames),
        changeType,
        result: isSuccessful ? 'Successful' : 'Failed',
        message: isSuccessful ? '' : randomItem(errorMessages),
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });
    
    const now = new Date();
    const createdAt = new Date(now.getTime() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);
    const updatedAt = new Date(now.getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
    
    return {
      id: id(), // Generate proper UUID for InstantDB
      batchNumber: `A${(25070 + i).toString().padStart(8, '0')}`,
      status,
      numberOfParticipants,
      successfulRecords,
      failedRecords,
      program,
      createdBy,
      participantRecords,
      createdAt,
      updatedAt
    };
  });
}

async function migrateSevisBatchesToInstantDB() {
  console.log('🚀 Starting SEVIS Batches migration to InstantDB...\n');
  
  try {
    // Check if we already have SEVIS batches
    const existingBatches = await db.query({
      sevisBatches: {}
    });

    console.log(`📊 Found ${existingBatches.sevisBatches?.length || 0} existing SEVIS batches`);
    
    if ((existingBatches.sevisBatches?.length || 0) > 0) {
      console.log('⚠️  SEVIS batches already exist in InstantDB');
      console.log('   This will add additional batches. Continue? (Ctrl+C to cancel)');
      // Give user 3 seconds to cancel
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Generate fresh batch data
    const batchesData = generateSevisBatches();
    console.log(`📦 Generated ${batchesData.length} SEVIS batches with participant data\n`);

    // Process in smaller batches for InstantDB
    const batchSize = 5; // Smaller batches due to participant records
    let processed = 0;
    let createdBatches = 0;
    let createdParticipants = 0;

    console.log(`🔄 Processing ${batchesData.length} batches in groups of ${batchSize}...\n`);

    for (let i = 0; i < batchesData.length; i += batchSize) {
      const batch = batchesData.slice(i, i + batchSize);
      
      try {
        const transactions = [];
        
        for (const batchData of batch) {
          const { participantRecords, ...batchInfo } = batchData;
          
          console.log(`  📋 Processing batch: ${batchInfo.batchNumber} (${participantRecords.length} participants)`);

          // Create the SEVIS batch
          if (!db.tx?.sevisBatches) {
            throw new Error('db.tx.sevisBatches is not available - check schema');
          }
          
          transactions.push(
            (db.tx as any).sevisBatches[batchInfo.id].update(batchInfo)
          );
          createdBatches++;

          // Create participant records
          for (const participant of participantRecords) {
            if (!db.tx?.sevisBatchParticipants) {
              throw new Error('db.tx.sevisBatchParticipants is not available - check schema');
            }
            
            transactions.push(
              (db.tx as any).sevisBatchParticipants[participant.id].update({
                ...participant,
                batchId: batchInfo.id // Link to parent batch
              })
            );
            createdParticipants++;
          }
        }

        // Execute batch transaction
        if (transactions.length > 0) {
          await db.transact(transactions);
          processed += batch.length;
          console.log(`✅ Group ${Math.floor(i / batchSize) + 1}: Processed ${batch.length} batches (${processed}/${batchesData.length})`);
        }
        
        // Delay between batches to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Group ${Math.floor(i / batchSize) + 1} failed:`, error);
        throw error; // Re-throw to stop processing
      }
    }

    console.log('\n🏁 Migration completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`  • Processed batches: ${processed}`);
    console.log(`  • Created SEVIS batches: ${createdBatches}`);
    console.log(`  • Created participant records: ${createdParticipants}`);

    // Verify the migration
    console.log('\n🔍 Verifying migration...');
    
    const verificationResult = await db.query({
      sevisBatches: {},
      sevisBatchParticipants: {}
    });

    const batches = verificationResult.sevisBatches || [];
    const participants = verificationResult.sevisBatchParticipants || [];

    console.log(`📈 Verification Results:`);
    console.log(`  • Total SEVIS batches: ${batches.length}`);
    console.log(`  • Total participant records: ${participants.length}`);
    
    // Show sample data
    if (batches.length > 0) {
      const sampleBatch = batches[0]!;
      console.log(`\n📋 Sample batch: ${sampleBatch.batchNumber}`);
      console.log(`  • Status: ${sampleBatch.status}`);
      console.log(`  • Program: ${sampleBatch.program}`);
      console.log(`  • Participants: ${sampleBatch.numberOfParticipants}`);
      console.log(`  • Successful: ${sampleBatch.successfulRecords}`);
      console.log(`  • Failed: ${sampleBatch.failedRecords}`);
      
      // Show participant breakdown for sample batch
      const batchParticipants = participants.filter(p => p.batchId === sampleBatch.id);
      const successfulCount = batchParticipants.filter(p => p.result === 'Successful').length;
      const failedCount = batchParticipants.filter(p => p.result === 'Failed').length;
      
      console.log(`  • Linked participants: ${batchParticipants.length}`);
      console.log(`  • Successful records: ${successfulCount}`);
      console.log(`  • Failed records: ${failedCount}`);
    }

    console.log('\n✅ SEVIS Batches migration completed successfully!');
    console.log('   You can now use the data in your SEVIS application.');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    
    if (error instanceof Error && error.message.includes('not available')) {
      console.error('\n💡 This might be a schema issue. Make sure you have:');
      console.error('   • sevisBatches entity defined in your InstantDB schema');
      console.error('   • sevisBatchParticipants entity defined in your InstantDB schema');
      console.error('   • Proper relationship between batches and participants');
    }
    
    process.exit(1);
  }
}

// Run the migration automatically
migrateSevisBatchesToInstantDB()
  .then(() => {
    console.log('\n🎉 Migration script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });

export { migrateSevisBatchesToInstantDB }; 