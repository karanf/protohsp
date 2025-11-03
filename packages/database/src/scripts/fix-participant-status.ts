import { init } from '@instantdb/admin';
import dotenv from 'dotenv';

// Load environment variables - EXACT pattern from existing scripts
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

// Ensure required environment variables are available
const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

if (!INSTANT_APP_ID || !INSTANT_ADMIN_TOKEN) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Initialize InstantDB
const db = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

async function fixParticipantStatus() {
  console.log('🔄 Fixing participant status to match batch statistics...\n');
  
  try {
    // Fetch all batches and participants
    const result = await db.query({
      sevisBatches: {},
      sevisBatchParticipants: {}
    });
    
    if (!result?.sevisBatches) {
      console.log('❌ No SEVIS batches found');
      return;
    }

    const batches = result.sevisBatches;
    const participants = result.sevisBatchParticipants || [];
    
    console.log(`📊 Found ${batches.length} batches and ${participants.length} participants`);
    
    let totalUpdated = 0;
    
    // Process each batch
    for (const batch of batches) {
      const batchParticipants = participants.filter((p: any) => p.batchId === batch.id);
      
      if (batchParticipants.length === 0) {
        console.log(`⚠️  Batch ${batch.batchNumber} has no participants`);
        continue;
      }
      
      console.log(`\n🔄 Processing batch ${batch.batchNumber}:`);
      console.log(`  • Status: ${batch.status}`);
      console.log(`  • Total participants: ${batch.numberOfParticipants}`);
      console.log(`  • Should be: ${batch.successfulRecords} successful, ${batch.failedRecords} failed`);
      console.log(`  • Found ${batchParticipants.length} participant records`);
      
      // Update participant records based on batch statistics
      const transactions = [];
      
      for (let i = 0; i < batchParticipants.length; i++) {
        const participant = batchParticipants[i]!;
        let newResult: string;
        let newMessage: string;
        
        if (i < batch.successfulRecords) {
          // First successfulRecords participants should be successful
          newResult = 'Successful';
          newMessage = '';
        } else if (i < batch.successfulRecords + batch.failedRecords) {
          // Next failedRecords participants should be failed
          newResult = 'Failed';
          newMessage = participant.message || 'Processing failed'; // Keep existing message if available
        } else {
          // Remaining participants should be pending
          newResult = 'Pending';
          newMessage = batch.status === 'Draft' ? 'Not yet processed' : 'Processing in progress';
        }
        
        // Only update if the result has changed
        if (participant.result !== newResult || participant.message !== newMessage) {
          transactions.push(
            (db.tx as any).sevisBatchParticipants[participant.id].update({
              result: newResult,
              message: newMessage
            })
          );
          totalUpdated++;
        }
      }
      
      // Execute batch transaction
      if (transactions.length > 0) {
        await db.transact(transactions);
        console.log(`  ✅ Updated ${transactions.length} participant records`);
        
        // Delay between batches to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        console.log(`  ✅ No updates needed for this batch`);
      }
    }
    
    console.log(`\n🎉 Participant status fix completed!`);
    console.log(`📊 Total participant records updated: ${totalUpdated}`);
    
    // Verify the fix
    console.log('\n🔍 Verifying fixes...');
    
    const verificationResult = await db.query({
      sevisBatches: {},
      sevisBatchParticipants: {}
    });
    
    const updatedBatches = verificationResult.sevisBatches || [];
    const updatedParticipants = verificationResult.sevisBatchParticipants || [];
    
    // Check a few batches for consistency
    let consistentBatches = 0;
    
    for (const batch of updatedBatches.slice(0, 5)) { // Check first 5 batches
      const batchParticipants = updatedParticipants.filter((p: any) => p.batchId === batch.id);
      
      const successful = batchParticipants.filter((p: any) => p.result === 'Successful').length;
      const failed = batchParticipants.filter((p: any) => p.result === 'Failed').length;
      const pending = batchParticipants.filter((p: any) => p.result === 'Pending').length;
      
      console.log(`\n📋 Batch ${batch.batchNumber} verification:`);
      console.log(`  • Expected: ${batch.successfulRecords} successful, ${batch.failedRecords} failed`);
      console.log(`  • Actual: ${successful} successful, ${failed} failed, ${pending} pending`);
      
      if (successful === batch.successfulRecords && failed === batch.failedRecords) {
        console.log(`  ✅ Batch is consistent`);
        consistentBatches++;
      } else {
        console.log(`  ❌ Batch is inconsistent`);
      }
    }
    
    console.log(`\n📊 Verification summary: ${consistentBatches}/5 checked batches are consistent`);
    
  } catch (error) {
    console.error('❌ Error fixing participant status:', error);
    throw error;
  }
}

// Run the fix
fixParticipantStatus()
  .then(() => {
    console.log('\n🎉 Participant status fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fix failed:', error);
    process.exit(1);
  }); 