import { init } from '@instantdb/admin';
import dotenv from 'dotenv';

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

async function removeDuplicateStudents() {
  console.log('Removing duplicate student records (keeping ones with profiles)...');
  
  try {
    // Query all student users and profiles
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

    if (!result?.users || result.users.length === 0) {
      console.log('No student users found.');
      return;
    }

    console.log(`Found ${result.users.length} student users.`);
    console.log(`Found ${result.profiles.length} profiles.`);

    // Group students by name and email to find duplicates
    const studentGroups: Record<string, any[]> = {};
    
    result.users.forEach((student: any) => {
      const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
      const email = student.email || '';
      const key = `${fullName}|${email}`;
      
      if (studentGroups[key]) {
        studentGroups[key].push(student);
      } else {
        studentGroups[key] = [student];
      }
    });

    // Find duplicates and identify which ones to remove
    const toDelete: string[] = [];
    let duplicateGroups = 0;
    let recordsToDelete = 0;

    Object.entries(studentGroups).forEach(([key, students]) => {
      if (students.length > 1) {
        duplicateGroups++;
        console.log(`\nProcessing duplicate group: ${key.split('|')[0]} (${students.length} records)`);
        
        // For each group, find which records have profiles and which don't
        const studentsWithProfiles: any[] = [];
        const studentsWithoutProfiles: any[] = [];
        
        students.forEach((student: any) => {
          const hasProfile = result.profiles.some((p: any) => p.userId === student.id);
          if (hasProfile) {
            studentsWithProfiles.push(student);
          } else {
            studentsWithoutProfiles.push(student);
          }
        });
        
        console.log(`  - ${studentsWithProfiles.length} with profiles`);
        console.log(`  - ${studentsWithoutProfiles.length} without profiles`);
        
        // Strategy: Remove students without profiles (they're the "empty" duplicates)
        if (studentsWithProfiles.length > 0 && studentsWithoutProfiles.length > 0) {
          studentsWithoutProfiles.forEach((student: any) => {
            console.log(`  - Marking for deletion: ${student.id} (no profile)`);
            toDelete.push(student.id);
            recordsToDelete++;
          });
        } else if (studentsWithProfiles.length > 1) {
          // If multiple students have profiles, keep the most recent one
          const sortedWithProfiles = studentsWithProfiles.sort((a: any, b: any) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          
          // Keep the first (most recent), delete the rest
          for (let i = 1; i < sortedWithProfiles.length; i++) {
            console.log(`  - Marking for deletion: ${sortedWithProfiles[i].id} (older duplicate with profile)`);
            toDelete.push(sortedWithProfiles[i].id);
            recordsToDelete++;
          }
        } else if (studentsWithoutProfiles.length > 1) {
          // If multiple students without profiles, keep the most recent
          const sortedWithoutProfiles = studentsWithoutProfiles.sort((a: any, b: any) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          
          // Keep the first (most recent), delete the rest
          for (let i = 1; i < sortedWithoutProfiles.length; i++) {
            console.log(`  - Marking for deletion: ${sortedWithoutProfiles[i].id} (older duplicate without profile)`);
            toDelete.push(sortedWithoutProfiles[i].id);
            recordsToDelete++;
          }
        }
      }
    });

    console.log(`\nSummary:`);
    console.log(`- Found ${duplicateGroups} duplicate student groups`);
    console.log(`- ${recordsToDelete} duplicate records marked for deletion`);
    console.log(`- ${result.users.length - recordsToDelete} records will remain`);

    if (toDelete.length === 0) {
      console.log('No duplicates to remove.');
      return;
    }

    // Confirm before deletion
    console.log('\nREADY TO DELETE DUPLICATE RECORDS');
    console.log('This will permanently remove the duplicate student user records.');
    console.log('Are you sure you want to continue? (This script will proceed automatically)\n');

    // Delete the duplicate records in batches
    const batchSize = 20;
    let deletedCount = 0;

    for (let i = 0; i < toDelete.length; i += batchSize) {
      const batch = toDelete.slice(i, i + batchSize);
      const transactions = [];

      for (const userId of batch) {
        if (db.tx?.users) {
          transactions.push(db.tx.users[userId]!.delete());
        }
      }

      if (transactions.length > 0) {
        await db.transact(transactions);
        deletedCount += transactions.length;
        console.log(`Deleted ${deletedCount}/${toDelete.length} duplicate records...`);
      }
    }

    console.log(`\n✅ Successfully removed ${deletedCount} duplicate student records!`);
    
    // Verify the cleanup
    const verifyResult = await db.query({
      users: {
        $: {
          where: {
            role: 'student'
          }
        }
      }
    });
    
    console.log(`\nVerification: ${verifyResult.users.length} student records remain in database.`);
    
  } catch (error) {
    console.error('Error removing duplicates:', error);
  }
}

removeDuplicateStudents(); 