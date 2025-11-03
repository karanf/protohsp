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

// List of admin reviewers for approved_by field
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

// Change types for SEVIS processing
const CHANGE_TYPES = [
  'New Student',
  'Validation - Housing',
  'Validation - Site of Activity',
  'Payment',
  'Bio',
  'Update - Housing',
  'Update - Site of Activity',
  'Program Date',
  'Program Extension',
  'Program Shorten',
  'Reprint',
  'Status End',
  'Status Invalid',
  'Status Terminate',
  'Update - Edit Subject',
  'Financial Info'
];

// SEVIS failure messages
const SEVIS_FAILURE_MESSAGES = [
  'Invalid address format',
  'Missing required field: school district',
  'SEVIS ID already exists',
  'Program dates overlap with existing record',
  'Host family not verified',
  'Payment amount exceeds limit',
  'Document validation failed',
  'Duplicate participant entry',
  'Incomplete I-94 information',
  'Medical clearance expired'
];

function getRandomReviewer(): string {
  return ADMIN_REVIEWERS[Math.floor(Math.random() * ADMIN_REVIEWERS.length)] || 'Admin User';
}

function getRandomChangeType(): string {
  return CHANGE_TYPES[Math.floor(Math.random() * CHANGE_TYPES.length)] || 'New Student';
}

function getRandomFailureMessage(): string {
  return SEVIS_FAILURE_MESSAGES[Math.floor(Math.random() * SEVIS_FAILURE_MESSAGES.length)] || 'Processing failed';
}

function getSevisStatus(index: number): string {
  // Distribute SEVIS statuses evenly
  const statuses = ['ready_for_sevis', 'in_sevis_queue', 'submitted_to_sevis', 'sevis_approved', 'sevis_failed'];
  return statuses[index % statuses.length] || 'ready_for_sevis';
}

async function updateSevisParticipantData() {
  console.log('🔄 Updating student profiles with SEVIS participant data...');
  
  try {
    // Query all student profiles
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
      console.log('❌ No student profiles found.');
      return;
    }

    console.log(`📊 Found ${result.profiles.length} student profiles to update.`);

    const transactions = [];
    let updatedCount = 0;

    for (const [index, profile] of result.profiles.entries()) {
      if (!profile.data) continue;

      const currentData = profile.data;
      
      // Check if this student has an approved application
      const isApproved = currentData.applicationStatus === 'approved';
      
      if (!isApproved) {
        console.log(`⏭️  Skipping non-approved student: ${profile.id}`);
        continue;
      }

      // Determine SEVIS status for this student
      const sevisStatus = currentData.sevisStatus || getSevisStatus(index);
      
      // Prepare updated data
      const updatedData = {
        ...currentData,
        
        // Add approved_by field if missing
        approved_by: currentData.approved_by || getRandomReviewer(),
        
        // Add change type for SEVIS batches
        changeType: currentData.changeType || getRandomChangeType(),
        
        // Ensure program structure is correct
        program: {
          ...currentData.program,
          type: currentData.program?.type || 'academic_year', // This becomes the program intake
          name: 'High School Program' // This is the actual program name
        },
        
        // Add SEVIS status if missing
        sevisStatus: sevisStatus,
        
        // Add SEVIS Queue Approved By - only for non-Ready statuses
        sevisQueueApprovedBy: currentData.sevisQueueApprovedBy || 
          (sevisStatus !== 'ready_for_sevis' ? getRandomReviewer() : ''),
        
        // Add SEVIS Message - only for Failed records
        sevisMessage: currentData.sevisMessage || 
          (sevisStatus === 'sevis_failed' ? getRandomFailureMessage() : ''),
        
        // Add any other missing fields
        sevis_processing_type: currentData.sevis_processing_type || getRandomChangeType(),
        
        // Update timestamp
        updated_at: new Date().toISOString()
      };

      // Create transaction to update this profile - using EXACT pattern from working scripts
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

    console.log(`🎉 Successfully updated ${updatedCount} student profiles!`);
    
    // Log summary
    console.log('\n📋 Summary of updates:');
    console.log(`- Added approved_by field to approved students`);
    console.log(`- Added changeType field for SEVIS processing`);
    console.log(`- Updated program structure (name and type)`);
    console.log(`- Added sevis_processing_type field`);
    console.log(`- Added sevisStatus field for SEVIS tracking`);
    console.log(`- Added sevisQueueApprovedBy field for non-Ready records`);
    console.log(`- Added sevisMessage field for Failed records`);

  } catch (error) {
    console.error('❌ Error updating SEVIS participant data:', error);
  }
}

// Run the update function
updateSevisParticipantData()
  .then(() => {
    console.log('✅ SEVIS participant data update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to update SEVIS participant data:', error);
    process.exit(1);
  }); 