import { init, id } from '@instantdb/admin';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from multiple possible locations
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

const db = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

// List of admin reviewers (will be used to assign approved_by)
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

// Application status mapping
const APPLICATION_STATUSES = {
  'pending_review': 'pending_review',
  'approved': 'approved',
  'rejected': 'rejected',
  'under_review': 'under_review'
};

// SEVIS status mapping (only applies to approved applications)
const SEVIS_STATUSES = {
  'ready_for_sevis': 'ready_for_sevis',
  'in_sevis_queue': 'in_sevis_queue', 
  'submitted_to_sevis': 'submitted_to_sevis',
  'sevis_approved': 'sevis_approved',
  'sevis_rejected': 'sevis_rejected'
};

function getRandomReviewer(): string {
  const reviewer = ADMIN_REVIEWERS[Math.floor(Math.random() * ADMIN_REVIEWERS.length)]!;
  return reviewer || 'Admin User';
}

function getDateBetween(startDate: string | Date, endDate: string | Date): string {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime).toISOString().split('T')[0];
}

async function updateStudentStatusFields() {
  console.log('Updating student profiles to separate application and SEVIS statuses...');
  
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
      console.log('No student profiles found.');
      return true;
    }

    console.log(`Found ${result.profiles.length} student profiles to update.`);

    const transactions = [];
    let updatedCount = 0;

    for (const profile of result.profiles) {
      if (!profile.data) continue;

      const currentData = profile.data;
      
      // Determine application status based on existing data
      let applicationStatus = APPLICATION_STATUSES.pending_review; // default
      let sevisStatus = null;
      let approvedOn = null;
      let approvedBy = null;

      // Check existing status indicators
      const existingApplicationStatus = currentData.application?.status;
      const existingStatus = currentData.status;
      
      // Set application status based on current data
      if (existingApplicationStatus === 'sevis_approved' || 
          existingApplicationStatus === 'submitted_to_sevis' ||
          existingApplicationStatus === 'pending_sevis' ||
          existingStatus === 'Active' ||
          existingStatus === 'Approved') {
        applicationStatus = APPLICATION_STATUSES.approved;
        approvedOn = currentData.accepted_on || getDateBetween(profile.createdAt, profile.updatedAt);
        approvedBy = currentData.reviewed_by || getRandomReviewer();
        
        // Set SEVIS status for approved applications
        if (existingApplicationStatus === 'sevis_approved') {
          sevisStatus = SEVIS_STATUSES.sevis_approved;
        } else if (existingApplicationStatus === 'submitted_to_sevis') {
          sevisStatus = SEVIS_STATUSES.submitted_to_sevis;
        } else if (existingApplicationStatus === 'pending_sevis') {
          sevisStatus = SEVIS_STATUSES.in_sevis_queue;
        } else {
          // Random SEVIS status for variety
          const sevisOptions = Object.values(SEVIS_STATUSES);
          sevisStatus = sevisOptions[Math.floor(Math.random() * sevisOptions.length)];
        }
      } else if (existingApplicationStatus === 'rejected' || existingStatus === 'Rejected') {
        applicationStatus = APPLICATION_STATUSES.rejected;
        approvedOn = currentData.accepted_on || getDateBetween(profile.createdAt, profile.updatedAt);
        approvedBy = currentData.reviewed_by || getRandomReviewer();
      } else if (existingApplicationStatus === 'under_review') {
        applicationStatus = APPLICATION_STATUSES.under_review;
      } else {
        // Random distribution for demo purposes
        const rand = Math.random();
        if (rand < 0.2) {
          applicationStatus = APPLICATION_STATUSES.pending_review;
        } else if (rand < 0.8) {
          applicationStatus = APPLICATION_STATUSES.approved;
          approvedOn = currentData.accepted_on || getDateBetween(profile.createdAt, profile.updatedAt);
          approvedBy = currentData.reviewed_by || getRandomReviewer();
          
          // Set SEVIS status for approved applications
          const sevisOptions = Object.values(SEVIS_STATUSES);
          sevisStatus = sevisOptions[Math.floor(Math.random() * sevisOptions.length)];
        } else if (rand < 0.9) {
          applicationStatus = APPLICATION_STATUSES.under_review;
        } else {
          applicationStatus = APPLICATION_STATUSES.rejected;
          approvedOn = currentData.accepted_on || getDateBetween(profile.createdAt, profile.updatedAt);
          approvedBy = currentData.reviewed_by || getRandomReviewer();
        }
      }

      // Create updated data structure
      const updatedData = {
        ...currentData,
        // Clear application status fields
        applicationStatus: applicationStatus,
        sevisStatus: sevisStatus,
        
        // Approval data (for approved/rejected applications)
        ...(approvedOn && { approved_on: approvedOn }),
        ...(approvedBy && { approved_by: approvedBy }),
        
        // Keep existing data but update structure
        application: {
          ...currentData.application,
          status: applicationStatus,
          approved_on: approvedOn,
          approved_by: approvedBy,
          sevis_status: sevisStatus
        }
      };

      // Create transaction to update this profile
      if (db.tx?.profiles) {
        transactions.push(
          db.tx.profiles[profile.id]!.update({
            data: updatedData,
            updatedAt: new Date()
          })
        );
        updatedCount++;
      }

      // Process in batches to avoid overwhelming the system
      if (transactions.length >= 50) {
        await db.transact(transactions);
        console.log(`Updated ${updatedCount} profiles so far...`);
        transactions.length = 0; // Clear the array
      }
    }

    // Process remaining transactions
    if (transactions.length > 0) {
      await db.transact(transactions);
    }

    console.log(`✅ Successfully updated ${updatedCount} student profiles!`);
    
    // Log status distribution
    const statusCounts = await getStatusDistribution();
    console.log('\nStatus Distribution:');
    console.log(`- Pending Review: ${statusCounts.pending_review}`);
    console.log(`- Under Review: ${statusCounts.under_review}`);
    console.log(`- Approved: ${statusCounts.approved}`);
    console.log(`- Rejected: ${statusCounts.rejected}`);
    console.log(`\nSEVIS Status Distribution:`);
    console.log(`- Ready for SEVIS: ${statusCounts.ready_for_sevis}`);
    console.log(`- In SEVIS Queue: ${statusCounts.in_sevis_queue}`);
    console.log(`- Submitted to SEVIS: ${statusCounts.submitted_to_sevis}`);
    console.log(`- SEVIS Approved: ${statusCounts.sevis_approved}`);
    console.log(`- SEVIS Rejected: ${statusCounts.sevis_rejected}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error updating student status fields:', error);
    return false;
  }
}

async function getStatusDistribution() {
  try {
    const result = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      }
    });

    const counts = {
      pending_review: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      ready_for_sevis: 0,
      in_sevis_queue: 0,
      submitted_to_sevis: 0,
      sevis_approved: 0,
      sevis_rejected: 0
    };

    if (result?.profiles) {
      for (const profile of result.profiles) {
        const appStatus = profile.data?.applicationStatus;
        const sevisStatus = profile.data?.sevisStatus;
        
        if (appStatus) {
          if (counts.hasOwnProperty(appStatus)) {
            counts[appStatus as keyof typeof counts]++;
          }
        }
        
        if (sevisStatus) {
          if (counts.hasOwnProperty(sevisStatus)) {
            counts[sevisStatus as keyof typeof counts]++;
          }
        }
      }
    }

    return counts;
  } catch (error) {
    console.error('Error getting status distribution:', error);
    return {
      pending_review: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      ready_for_sevis: 0,
      in_sevis_queue: 0,
      submitted_to_sevis: 0,
      sevis_approved: 0,
      sevis_rejected: 0
    };
  }
}

// Run the function directly since this is the main script
updateStudentStatusFields()
  .then(() => {
    console.log('Script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

export { updateStudentStatusFields }; 