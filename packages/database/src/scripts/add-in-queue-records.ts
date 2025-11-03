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

// List of admin reviewers for queue approval
const ADMIN_REVIEWERS = [
  'Sarah Mitchell',
  'David Rodriguez', 
  'Jennifer Chen',
  'Michael Thompson',
  'Emily Johnson',
  'Robert Williams',
  'Lisa Davis',
  'James Garcia',
  'Amanda Brown',
  'Christopher Miller',
  'Michelle Wilson',
  'Daniel Moore',
  'Jessica Taylor',
  'Ryan Anderson',
  'Nicole Thomas'
];

function getRandomReviewer(): string {
  return ADMIN_REVIEWERS[Math.floor(Math.random() * ADMIN_REVIEWERS.length)] || 'Admin User';
}

async function addInQueueRecords() {
  try {
    console.log('🔄 Adding "In Queue" SEVIS records...');
    
    // Query student profiles that are ready for SEVIS - we'll convert some to In Queue
    const result = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      }
    });

    if (!result?.profiles || result.profiles.length === 0) {
      console.log('❌ No student profiles found');
      return;
    }

    // Find approved students with 'ready_for_sevis' status
    const readyForSevisProfiles = result.profiles.filter(p => 
      p.data && 
      p.data.applicationStatus === 'approved' && 
      p.data.sevisStatus === 'ready_for_sevis'
    );
    
    console.log(`📊 Found ${readyForSevisProfiles.length} "Ready for SEVIS" students`);
    
    // Convert the first 50 "Ready for SEVIS" students to "In Queue" (or however many we have)
    const studentsToConvert = readyForSevisProfiles.slice(0, 50);
    
    console.log(`🔄 Converting ${studentsToConvert.length} students to "In Queue" status...`);
    
    const transactions = [];
    let updatedCount = 0;

    for (const profile of studentsToConvert) {
      const currentData = profile.data;
      
      // Update the profile to be "In Queue"
      const updatedData = {
        ...currentData,
        sevisStatus: 'in_sevis_queue',
        sevisQueueApprovedBy: getRandomReviewer(),
        updated_at: new Date().toISOString()
      };

      // Create transaction to update this profile
      if (!db.tx?.profiles) {
        throw new Error('db.tx.profiles is not available - check schema');
      }
      
      transactions.push(
        (db.tx as any).profiles[profile.id].update({
          data: updatedData,
          updatedAt: new Date().toISOString()
        })
      );
      updatedCount++;

      // Process in batches to avoid overwhelming the system
      if (transactions.length >= 10) {
        await db.transact(transactions);
        console.log(`✅ Updated ${updatedCount} profiles so far...`);
        transactions.length = 0; // Clear the array
        
        // Add delay between batches to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Process remaining transactions
    if (transactions.length > 0) {
      await db.transact(transactions);
    }

    console.log(`🎉 Successfully converted ${updatedCount} students to "In Queue" status!`);
    
    // Verify the changes
    console.log('\n🔍 Verifying changes...');
    const verifyResult = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      }
    });

    const inQueueCount = verifyResult.profiles?.filter(p => 
      p.data && p.data.sevisStatus === 'in_sevis_queue'
    ).length || 0;
    
    console.log(`✅ Verification: ${inQueueCount} students now have "In Queue" status`);

  } catch (error) {
    console.error('❌ Error adding In Queue records:', error);
  }
}

// Run the update function
addInQueueRecords()
  .then(() => {
    console.log('✅ In Queue records addition completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to add In Queue records:', error);
    process.exit(1);
  }); 