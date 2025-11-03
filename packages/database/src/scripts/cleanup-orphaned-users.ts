import dotenv from 'dotenv';

// Load .env files
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

import { init, tx } from '@instantdb/admin';

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

if (!INSTANT_APP_ID || !INSTANT_ADMIN_TOKEN) {
  console.error('❌ Missing InstantDB credentials');
  process.exit(1);
}

const db = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

async function cleanupOrphanedUsers() {
  try {
    console.log('🧹 Cleaning up orphaned student users...\n');

    // Get all data
    const result = await db.query({
      profiles: {},
      users: {}
    });

    const profiles = result.profiles || [];
    const users = result.users || [];

    console.log(`📊 Initial State:`);
    console.log(`🔸 Total users: ${users.length}`);
    console.log(`🔸 Total profiles: ${profiles.length}`);

    // Get student users and profiles
    const studentUsers = users.filter((user: any) => user.role === 'student');
    const studentProfiles = profiles.filter((profile: any) => profile.data?.type === 'student');
    
    console.log(`🔸 Student users: ${studentUsers.length}`);
    console.log(`🔸 Student profiles: ${studentProfiles.length}\n`);

    // Find student users that have corresponding profiles with comprehensive data
    const validStudentUsers = studentUsers.filter((user: any) => {
      // Find the user's profile
      const userProfile = profiles.find(p => p.userId === user.id);
      
      // Check if the profile exists, has type='student', and has comprehensive data
      return userProfile && 
             userProfile.data?.type === 'student' && 
             userProfile.data?.comprehensive_application_data;
    });

    // Find orphaned student users (those without valid profiles)
    const orphanedStudentUsers = studentUsers.filter((user: any) => {
      const userProfile = profiles.find(p => p.userId === user.id);
      
      // User is orphaned if:
      // 1. No profile exists, OR
      // 2. Profile exists but doesn't have type='student', OR  
      // 3. Profile exists but doesn't have comprehensive data
      return !userProfile || 
             userProfile.data?.type !== 'student' ||
             !userProfile.data?.comprehensive_application_data;
    });

    console.log(`✅ Valid student users (with comprehensive profiles): ${validStudentUsers.length}`);
    console.log(`🗑️ Orphaned student users (to be removed): ${orphanedStudentUsers.length}\n`);

    if (orphanedStudentUsers.length > 0) {
      console.log(`🔍 Sample orphaned users (first 5):`);
      orphanedStudentUsers.slice(0, 5).forEach((user: any, index) => {
        const userProfile = profiles.find(p => p.userId === user.id);
        const status = !userProfile ? 'No profile' : 
                      userProfile.data?.type !== 'student' ? 'Not student type' :
                      'No comprehensive data';
        console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.id}) - ${status}`);
      });

      console.log(`\n⚠️ This will remove ${orphanedStudentUsers.length} orphaned student users.`);
      console.log(`✅ After cleanup, you will have ${validStudentUsers.length} clean student users.`);

      // Remove orphaned users in batches
      const BATCH_SIZE = 20;
      let removed = 0;
      let errors = 0;

      console.log(`\n🗑️ Removing ${orphanedStudentUsers.length} orphaned users in batches of ${BATCH_SIZE}...`);

      for (let i = 0; i < orphanedStudentUsers.length; i += BATCH_SIZE) {
        const batch = orphanedStudentUsers.slice(i, i + BATCH_SIZE);
        
        try {
          const transactions = batch.map(user => {
            if (!tx.users) {
              throw new Error('tx.users is not available');
            }
            return tx.users[user.id].delete();
          });
          
          await db.transact(transactions);
          removed += batch.length;
          
          console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: Removed ${batch.length} users (${removed}/${orphanedStudentUsers.length})`);
          
        } catch (error) {
          console.error(`❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error);
          errors += batch.length;
        }
      }

      console.log(`\n🏁 Cleanup completed!`);
      console.log(`✅ Successfully removed: ${removed} orphaned users`);
      if (errors > 0) {
        console.log(`❌ Failed to remove: ${errors} users`);
      }
    } else {
      console.log(`✅ No orphaned student users found - all student users have valid profiles!`);
    }

    // Final verification
    const finalResult = await db.query({
      profiles: {},
      users: {}
    });
    
    const finalUsers = finalResult.users || [];
    const finalProfiles = finalResult.profiles || [];
    
    const finalStudentUsers = finalUsers.filter((user: any) => user.role === 'student');
    const finalStudentProfiles = finalProfiles.filter((profile: any) => profile.data?.type === 'student');
    
    console.log(`\n📈 Final Results:`);
    console.log(`🔸 Total users: ${finalUsers.length}`);
    console.log(`🔸 Total profiles: ${finalProfiles.length}`);
    console.log(`🔸 Student users: ${finalStudentUsers.length}`);
    console.log(`🔸 Student profiles: ${finalStudentProfiles.length}`);
    
    const finalDiscrepancy = finalStudentUsers.length - finalStudentProfiles.length;
    if (finalDiscrepancy === 0) {
      console.log(`✅ SUCCESS! Student users and profiles are now aligned!`);
      console.log(`🚀 The students.tsx page will now show the correct count: ${finalStudentUsers.length}`);
    } else {
      console.log(`⚠️ Still ${finalDiscrepancy} discrepancy between users and profiles`);
    }

  } catch (error) {
    console.error('💥 Cleanup failed:', error);
    throw error;
  }
}

// Run the cleanup
cleanupOrphanedUsers()
  .then(() => {
    console.log('\n🎉 Orphaned user cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Cleanup failed:', error);
    process.exit(1);
  }); 