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

async function updateSevisProgramNames() {
  console.log('🔄 Updating SEVIS batch program names...');
  
  try {
    // Fetch all SEVIS batches
    const result = await db.query({
      sevisBatches: {}
    });
    
    if (!result?.sevisBatches) {
      console.log('❌ No SEVIS batches found');
      return;
    }

    const batches = result.sevisBatches;
    console.log(`📊 Found ${batches.length} SEVIS batches`);
    
    // Update program names
    const updatePromises = batches.map(async (batch: any) => {
      let newProgram = batch.program;
      
      if (batch.program === 'Trainee Program' || batch.program === 'Intern Program') {
        newProgram = 'Training & Internship Program';
        
        console.log(`🔄 Updating batch ${batch.batchNumber}: ${batch.program} → ${newProgram}`);
        
        // Follow the same pattern as existing scripts
        return db.transact([
          (db.tx as any).sevisBatches[batch.id].update({
            program: newProgram
          })
        ]);
      }
      
      return null;
    });

    // Execute all updates
    const results = await Promise.allSettled(updatePromises.filter(Boolean));
    
    const successful = results.filter((r: any) => r.status === 'fulfilled').length;
    const failed = results.filter((r: any) => r.status === 'rejected').length;
    
    console.log(`✅ Program name updates completed:`);
    console.log(`   - Successful: ${successful}`);
    console.log(`   - Failed: ${failed}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed updates:');
      results.forEach((result: any, index: number) => {
        if (result.status === 'rejected') {
          console.log(`   - Update ${index + 1}:`, result.reason);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error updating program names:', error);
    throw error;
  }
}

// Run the update
updateSevisProgramNames()
  .then(() => {
    console.log('🎉 SEVIS program name update completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 