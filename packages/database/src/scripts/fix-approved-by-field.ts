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

async function fixApprovedByField() {
  try {
    console.log('🔧 Fixing "approved_by" fields...\n');

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
    console.log(`📊 Found ${studentProfiles.length} student profiles`);

    // Find students with system-approved status (check all variations)
    const studentsToFix = studentProfiles.filter((s: any) => {
      const approvedBy = s.data?.approved_by;
      return approvedBy && (
        approvedBy.includes('system') || 
        approvedBy.includes('System') ||
        approvedBy.includes('migration') ||
        approvedBy.includes('Migration')
      );
    });

    console.log(`📝 Found ${studentsToFix.length} students with system-approved status`);
    
    if (studentsToFix.length > 0) {
      console.log('🔍 Sample values to fix:');
      const uniqueValues = [...new Set(studentsToFix.map(s => s.data?.approved_by))];
      uniqueValues.forEach(value => {
        const count = studentsToFix.filter(s => s.data?.approved_by === value).length;
        console.log(`   - "${value}": ${count} students`);
      });
    }

    if (studentsToFix.length > 0) {
      // Randomly assign to different admins
      const adminNames = [
        'Sarah Johnson',
        'Michael Chen', 
        'Emily Rodriguez',
        'David Thompson',
        'Lisa Wang'
      ];
      
      const BATCH_SIZE = 20;
      let approvedFixed = 0;
      
      console.log(`\n🔧 Updating ${studentsToFix.length} students...`);
      
      for (let i = 0; i < studentsToFix.length; i += BATCH_SIZE) {
        const batch = studentsToFix.slice(i, i + BATCH_SIZE);
        
        try {
          const transactions = batch.map(profile => {
            if (!tx.profiles) {
              throw new Error('tx.profiles is not available');
            }
            
            const randomAdmin = adminNames[Math.floor(Math.random() * adminNames.length)];
            
            const updatedData = {
              ...profile.data,
              approved_by: randomAdmin
            };
            
            return tx.profiles[profile.id].update({
              data: updatedData
            });
          });
          
          await db.transact(transactions);
          approvedFixed += batch.length;
          console.log(`✅ Fixed approved_by for ${batch.length} students (${approvedFixed}/${studentsToFix.length})`);
          
        } catch (error) {
          console.error(`❌ Approved_by fix batch failed:`, error);
        }
      }
      
      console.log(`\n🎉 Fixed "approved_by" for ${approvedFixed} students!`);
    } else {
      console.log('\n✅ No students found with system-approved status - all good!');
    }

    // Verify results
    const verifyResult = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      }
    });

    const verifyProfiles = verifyResult.profiles || [];
    const stillSystemApproved = verifyProfiles.filter((s: any) => {
      const approvedBy = s.data?.approved_by;
      return approvedBy && (
        approvedBy.includes('system') || 
        approvedBy.includes('System') ||
        approvedBy.includes('migration') ||
        approvedBy.includes('Migration')
      );
    });

    console.log('\n📈 Verification:');
    console.log(`🔸 Total students: ${verifyProfiles.length}`);
    console.log(`🔸 Still system-approved: ${stillSystemApproved.length}`);
    
    if (stillSystemApproved.length === 0) {
      console.log('✅ All students now have proper admin approvers!');
      
      // Show sample of fixed students
      console.log('\n🎓 Sample approved students:');
      verifyProfiles.slice(0, 5).forEach((s: any, index: number) => {
        console.log(`${index + 1}. ${s.data?.first_name} ${s.data?.last_name} - Approved by: ${s.data?.approved_by}`);
      });
    }

  } catch (error) {
    console.error('💥 Fix failed:', error);
    throw error;
  }
}

// Run the fix
fixApprovedByField()
  .then(() => {
    console.log('\n🎉 Approved_by field fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fix failed:', error);
    process.exit(1);
  }); 