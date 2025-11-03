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

async function removeIncompleteStudents() {
  try {
    console.log('🗑️  Removing students with incomplete comprehensive data...\n');

    // Get all student profiles
    const result = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      }
    });

    const studentProfiles = result.profiles || [];
    console.log(`📊 Found ${studentProfiles.length} total student profiles`);

    // Find students with incomplete data (missing parent info = incomplete overall)
    const incompleteStudents = studentProfiles.filter(student => {
      const comprehensiveData = student.data?.comprehensive_application_data;
      return comprehensiveData && !comprehensiveData.parents?.father?.firstName;
    });

    // Find students with complete data for verification
    const completeStudents = studentProfiles.filter(student => {
      const comprehensiveData = student.data?.comprehensive_application_data;
      return comprehensiveData && comprehensiveData.parents?.father?.firstName;
    });

    console.log(`📝 Found ${incompleteStudents.length} students with incomplete data (will be removed)`);
    console.log(`✅ Found ${completeStudents.length} students with complete data (will be kept)`);

    if (incompleteStudents.length === 0) {
      console.log('\n🎉 No incomplete students found - all data is already complete!');
      return;
    }

    console.log('\n🔍 Sample of students to be removed:');
    incompleteStudents.slice(0, 5).forEach((student, index) => {
      console.log(`${index + 1}. ${student.data?.first_name} ${student.data?.last_name} (${student.data?.country_of_origin})`);
    });

    console.log('\n⚠️  This will permanently delete the incomplete student profiles.');
    console.log('🎯 After removal, you will have clean, complete data for all remaining students.');

    // Remove profiles in batches
    const BATCH_SIZE = 20;
    let removed = 0;
    let errors = 0;

    console.log(`\n🗑️  Removing ${incompleteStudents.length} incomplete profiles in batches of ${BATCH_SIZE}...`);

    for (let i = 0; i < incompleteStudents.length; i += BATCH_SIZE) {
      const batch = incompleteStudents.slice(i, i + BATCH_SIZE);
      
      try {
        const transactions = batch.map(profile => {
          if (!tx.profiles) {
            throw new Error('tx.profiles is not available');
          }
          return tx.profiles[profile.id].delete();
        });
        
        await db.transact(transactions);
        removed += batch.length;
        
        console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: Removed ${batch.length} profiles (${removed}/${incompleteStudents.length})`);
        
      } catch (error) {
        console.error(`❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error);
        errors += batch.length;
      }
    }

    console.log('\n🏁 Student removal completed!');
    console.log(`✅ Successfully removed: ${removed} incomplete profiles`);
    if (errors > 0) {
      console.log(`❌ Failed to remove: ${errors} profiles`);
    }
    
    // Verify final state
    const finalResult = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      }
    });
    
    const finalProfiles = finalResult.profiles || [];
    const allHaveCompleteData = finalProfiles.every(profile => 
      profile.data?.comprehensive_application_data?.parents?.father?.firstName
    );
    
    console.log('\n📈 Final Results:');
    console.log(`🔸 Remaining student profiles: ${finalProfiles.length}`);
    console.log(`🔸 All have complete data: ${allHaveCompleteData ? '✅ YES' : '❌ NO'}`);
    
    if (allHaveCompleteData) {
      console.log('\n🎉 SUCCESS! All remaining students now have complete comprehensive data.');
      console.log('🚀 The SEVIS view will no longer show "Not specified" values!');
    }

  } catch (error) {
    console.error('💥 Student removal failed:', error);
    throw error;
  }
}

// Run the removal
removeIncompleteStudents()
  .then(() => {
    console.log('\n🎉 Incomplete student removal completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  }); 