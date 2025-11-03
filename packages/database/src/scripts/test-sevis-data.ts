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

async function testSevisBatchData() {
  console.log('🔍 Testing SEVIS batch data availability...\n');
  
  try {
    const result = await db.query({
      sevisBatches: {},
      sevisBatchParticipants: {}
    });
    
    const batches = result.sevisBatches || [];
    const participants = result.sevisBatchParticipants || [];
    
    console.log('📊 SEVIS Batches Results:');
    console.log(`  • Total batches: ${batches.length}`);
    console.log(`  • Total participants: ${participants.length}`);
    
    if (batches.length > 0) {
      console.log('\n📋 Sample batch data:');
      const sample = batches[0]!;
      console.log(`  • Batch Number: ${sample.batchNumber}`);
      console.log(`  • Status: ${sample.status}`);
      console.log(`  • Program: ${sample.program}`);
      console.log(`  • Total Participants: ${sample.numberOfParticipants}`);
      console.log(`  • Successful Records: ${sample.successfulRecords}`);
      console.log(`  • Failed Records: ${sample.failedRecords}`);
      
      // Check if we have Training & Internship Program
      const trainingBatches = batches.filter((b: any) => b.program === 'Training & Internship Program');
      console.log(`  • Training & Internship Program batches: ${trainingBatches.length}`);
      
      // Sample participant data
      const sampleParticipants = participants.filter((p: any) => p.batchId === sample.id);
      console.log(`  • Participants for sample batch: ${sampleParticipants.length}`);
      
      if (sampleParticipants.length > 0) {
        const sampleParticipant = sampleParticipants[0]!;
        console.log(`    - Sample participant: ${sampleParticipant.name}`);
        console.log(`    - Change type: ${sampleParticipant.changeType}`);
        console.log(`    - Result: ${sampleParticipant.result}`);
      }
    }
    
    console.log('\n✅ SEVIS batch data is available and ready for use!');
    
  } catch (error) {
    console.error('❌ Error testing SEVIS batch data:', error);
    process.exit(1);
  }
}

// Run the test
testSevisBatchData()
  .then(() => {
    console.log('\n🎉 Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  }); 