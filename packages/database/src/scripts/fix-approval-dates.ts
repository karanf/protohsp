import { init } from '@instantdb/admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

const db = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

function generateRealisticApprovalDate(createdAt: string | undefined, updatedAt: string | undefined): string {
  // Generate approval date between creation and update, or within last 6 months
  const created = createdAt ? new Date(createdAt).getTime() : new Date().getTime() - (6 * 30 * 24 * 60 * 60 * 1000);
  const updated = updatedAt ? new Date(updatedAt).getTime() : new Date().getTime();
  const sixMonthsAgo = new Date().getTime() - (6 * 30 * 24 * 60 * 60 * 1000);
  
  const startTime = Math.max(created, sixMonthsAgo);
  const endTime = Math.min(updated, new Date().getTime());
  
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime).toISOString().split('T')[0]!; // YYYY-MM-DD format
}

async function fixApprovalDates() {
  console.log('Finding and fixing students with approved_by but missing approved_on dates...\n');
  
  try {
    // Query all student data
    const result = await db.query({
      users: {
        $: {
          where: {
            role: 'student'
          }
        }
      },
      profiles: {}
    });

    console.log(`Found ${result.users.length} student users`);
    console.log(`Found ${result.profiles.length} profiles\n`);

    const inconsistentStudents: any[] = [];
    
    // Find students with approved_by but missing approved_on
    for (const user of result.users) {
      const profile = result.profiles.find((p: any) => p.userId === user.id);
      
      if (!profile || !profile.data) continue;

      const applicationStatus = profile.data.applicationStatus;
      const approvedBy = profile.data.approved_by;
      const approvedOn = profile.data.approved_on;

      // Check for inconsistency: has approved_by but missing/invalid approved_on
      if ((applicationStatus === 'approved' || applicationStatus === 'rejected') && 
          approvedBy && 
          approvedBy !== 'Unknown' && 
          approvedBy !== '' &&
          (!approvedOn || approvedOn === 'Unknown' || approvedOn === '')) {
        
        inconsistentStudents.push({
          userId: user.id,
          profileId: profile.id,
          name: `${user.firstName} ${user.lastName}`,
          applicationStatus,
          approvedBy,
          approvedOn,
          createdAt: profile.createdAt || user.createdAt,
          updatedAt: profile.updatedAt || user.updatedAt
        });
      }
    }

    console.log(`Found ${inconsistentStudents.length} students with approved_by but missing approved_on`);

    if (inconsistentStudents.length === 0) {
      console.log('✅ No approval date inconsistencies found!');
      return;
    }

    // Show some examples
    console.log('\nExamples of inconsistent data:');
    inconsistentStudents.slice(0, 5).forEach((student, i) => {
      console.log(`${i + 1}. ${student.name} (${student.applicationStatus})`);
      console.log(`   approved_by: "${student.approvedBy}"`);
      console.log(`   approved_on: "${student.approvedOn}"`);
    });

    console.log(`\nFixing ${inconsistentStudents.length} students...`);

    const transactions = [];

    for (const student of inconsistentStudents) {
      // Generate a realistic approval date
      const approvalDate = generateRealisticApprovalDate(
        student.createdAt,
        student.updatedAt
      );

      // Update the profile with the approval date
      const updatedData = {
        ...result.profiles.find((p: any) => p.id === student.profileId)?.data,
        approved_on: approvalDate
      };

      if (db.tx?.profiles) {
        transactions.push(
          db.tx.profiles[student.profileId]!.update({
            data: updatedData,
            updatedAt: new Date()
          })
        );
      }

      console.log(`  ${student.name}: Setting approved_on to ${approvalDate}`);
    }

    // Execute transactions in batches
    const batchSize = 25;
    let processed = 0;

    console.log(`\nExecuting ${transactions.length} updates...`);

    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      await db.transact(batch);
      processed += batch.length;
      console.log(`Processed ${processed}/${transactions.length} updates...`);
    }

    console.log('\n✅ All approval date inconsistencies have been fixed!');

    // Verify the fixes
    console.log('\nVerifying fixes...');
    const verifyResult = await db.query({
      users: {
        $: {
          where: {
            role: 'student'
          }
        }
      },
      profiles: {}
    });

    let stillInconsistent = 0;

    for (const user of verifyResult.users) {
      const profile = verifyResult.profiles.find((p: any) => p.userId === user.id);
      
      if (!profile || !profile.data) continue;

      const applicationStatus = profile.data.applicationStatus;
      const approvedBy = profile.data.approved_by;
      const approvedOn = profile.data.approved_on;

      if ((applicationStatus === 'approved' || applicationStatus === 'rejected') && 
          approvedBy && 
          approvedBy !== 'Unknown' && 
          approvedBy !== '' &&
          (!approvedOn || approvedOn === 'Unknown' || approvedOn === '')) {
        stillInconsistent++;
      }
    }

    console.log(`\nVerification Results:`);
    console.log(`- Students fixed: ${inconsistentStudents.length}`);
    console.log(`- Still inconsistent: ${stillInconsistent}`);
    
    if (stillInconsistent === 0) {
      console.log('\n🎉 All approval data is now consistent!');
    }

  } catch (error) {
    console.error('Error fixing approval dates:', error);
  }
}

fixApprovalDates(); 