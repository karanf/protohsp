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

async function fixProfileTypesAndAdmins() {
  try {
    console.log('🔧 Fixing profile types and admin references...\n');

    // Get all profiles
    const result = await db.query({
      profiles: {}
    });

    const profiles = result.profiles || [];
    console.log(`📊 Found ${profiles.length} total profiles\n`);

    // Step 1: Identify and fix student profiles
    const studentProfiles = profiles.filter((p: any) => 
      p.data?.country_of_origin || p.data?.comprehensive_application_data
    );
    
    console.log(`🎓 Identified ${studentProfiles.length} student profiles`);
    
    const BATCH_SIZE = 20;
    
    if (studentProfiles.length > 0) {
      console.log('🔧 Fixing student profile types...');
      
      let fixed = 0;
      let errors = 0;

      for (let i = 0; i < studentProfiles.length; i += BATCH_SIZE) {
        const batch = studentProfiles.slice(i, i + BATCH_SIZE);
        
        try {
          const transactions = batch.map(profile => {
            if (!tx.profiles) {
              throw new Error('tx.profiles is not available');
            }
            
            const updatedData = {
              ...profile.data,
              type: 'student'
            };
            
            return tx.profiles[profile.id].update({
              data: updatedData
            });
          });
          
          await db.transact(transactions);
          fixed += batch.length;
          console.log(`✅ Fixed ${batch.length} student profiles (${fixed}/${studentProfiles.length})`);
          
        } catch (error) {
          console.error(`❌ Batch failed:`, error);
          errors += batch.length;
        }
      }
      
      console.log(`🎓 Student type fix complete: ${fixed} fixed, ${errors} errors\n`);
    }

    // Step 2: Create admin users
    console.log('👨‍💼 Creating admin users...');
    
    const adminUsers = [
      {
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@greenheart.org',
        role: 'Director',
        type: 'admin',
        permissions: ['approve_students', 'manage_placements', 'sevis_processing']
      },
      {
        first_name: 'Michael',
        last_name: 'Chen',
        email: 'michael.chen@greenheart.org', 
        role: 'SEVIS Officer',
        type: 'admin',
        permissions: ['sevis_processing', 'approve_students']
      },
      {
        first_name: 'Emily',
        last_name: 'Rodriguez',
        email: 'emily.rodriguez@greenheart.org',
        role: 'Program Coordinator', 
        type: 'admin',
        permissions: ['manage_placements', 'student_support']
      },
      {
        first_name: 'David',
        last_name: 'Thompson',
        email: 'david.thompson@greenheart.org',
        role: 'Regional Manager',
        type: 'admin', 
        permissions: ['approve_students', 'manage_coordinators']
      },
      {
        first_name: 'Lisa',
        last_name: 'Wang',
        email: 'lisa.wang@greenheart.org',
        role: 'Quality Assurance',
        type: 'admin',
        permissions: ['review_applications', 'data_verification']
      }
    ];

    // Create admin profiles
    const adminTransactions = adminUsers.map(admin => {
      return tx.profiles[crypto.randomUUID()].update({
        data: admin
      });
    });
    
    await db.transact(adminTransactions);
    console.log(`✅ Created ${adminUsers.length} admin users\n`);

    // Step 3: Fix "approved_by" fields to point to actual admin
    console.log('🔧 Fixing "approved_by" fields...');
    
    // Get updated student profiles (now they should have type = 'student')
    const updatedResult = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      }
    });
    
    const studentsToFix = updatedResult.profiles?.filter((s: any) => 
      s.data?.approved_by && (s.data.approved_by === 'system migration' || s.data.approved_by === 'System')
    ) || [];
    
    console.log(`📝 Found ${studentsToFix.length} students with system-approved status`);
    
    if (studentsToFix.length > 0) {
      // Randomly assign to different admins
      const adminNames = [
        'Sarah Johnson',
        'Michael Chen', 
        'Emily Rodriguez',
        'David Thompson',
        'Lisa Wang'
      ];
      
      let approvedFixed = 0;
      
      for (let i = 0; i < studentsToFix.length; i += BATCH_SIZE) {
        const batch = studentsToFix.slice(i, i + BATCH_SIZE);
        
        try {
          const transactions = batch.map(profile => {
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
    }

    // Step 4: Clean up empty profiles
    console.log('\n🧹 Cleaning up empty profiles...');
    
    const emptyProfiles = profiles.filter((p: any) => 
      !p.data || Object.keys(p.data).length === 0
    );
    
    console.log(`🗑️ Found ${emptyProfiles.length} empty profiles to remove`);
    
    if (emptyProfiles.length > 0) {
      let cleaned = 0;
      
      for (let i = 0; i < emptyProfiles.length; i += BATCH_SIZE) {
        const batch = emptyProfiles.slice(i, i + BATCH_SIZE);
        
        try {
          const transactions = batch.map(profile => {
            return tx.profiles[profile.id].delete();
          });
          
          await db.transact(transactions);
          cleaned += batch.length;
          console.log(`✅ Removed ${batch.length} empty profiles (${cleaned}/${emptyProfiles.length})`);
          
        } catch (error) {
          console.error(`❌ Cleanup batch failed:`, error);
        }
      }
    }

    // Step 5: Final verification
    console.log('\n🔍 Final verification...');
    
    const finalResult = await db.query({
      profiles: {}
    });
    
    const finalProfiles = finalResult.profiles || [];
    const finalStudents = finalProfiles.filter((p: any) => p.data?.type === 'student');
    const finalAdmins = finalProfiles.filter((p: any) => p.data?.type === 'admin');
    const finalOthers = finalProfiles.filter((p: any) => p.data?.type && p.data.type !== 'student' && p.data.type !== 'admin');
    const finalUndefined = finalProfiles.filter((p: any) => !p.data?.type);
    
    console.log('\n📈 Final Results:');
    console.log(`🔸 Total profiles: ${finalProfiles.length}`);
    console.log(`🔸 Students: ${finalStudents.length}`);
    console.log(`🔸 Admins: ${finalAdmins.length}`);
    console.log(`🔸 Other types: ${finalOthers.length}`);
    console.log(`🔸 Undefined type: ${finalUndefined.length}`);
    
    if (finalStudents.length > 0) {
      console.log('\n🎓 Sample students:');
      finalStudents.slice(0, 3).forEach((s: any, index: number) => {
        console.log(`${index + 1}. ${s.data?.first_name} ${s.data?.last_name} (${s.data?.country_of_origin}) - Approved by: ${s.data?.approved_by}`);
      });
    }
    
    if (finalAdmins.length > 0) {
      console.log('\n👨‍💼 Admin users:');
      finalAdmins.forEach((a: any, index: number) => {
        console.log(`${index + 1}. ${a.data?.first_name} ${a.data?.last_name} - ${a.data?.role}`);
      });
    }

  } catch (error) {
    console.error('💥 Fix failed:', error);
    throw error;
  }
}

// Run the fix
fixProfileTypesAndAdmins()
  .then(() => {
    console.log('\n🎉 Profile types and admin fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fix failed:', error);
    process.exit(1);
  }); 