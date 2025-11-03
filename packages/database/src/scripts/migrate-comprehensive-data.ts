import { init, id, tx } from '@instantdb/admin';
import dotenv from 'dotenv';

// Load environment variables - EXACT pattern to avoid path issues
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

const db = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

// Core student fields to keep in profiles
const CORE_STUDENT_FIELDS = [
  'first_name',
  'last_name',
  'email',
  'country_of_origin',
  'date_of_birth',
  'gender',
  'school_grade',
  'applicationStatus',
  'sevisStatus',
  'approved_by',
  'approved_on',
  'program',
  'native_language',
  'english_proficiency'
];

async function migrateComprehensiveData() {
  console.log('🔄 Starting comprehensive data migration...\n');
  
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

    console.log(`Found ${result.profiles?.length || 0} student profiles\n`);

    if (!result.profiles || result.profiles.length === 0) {
      console.log('❌ No student profiles found to migrate');
      return;
    }

    // Filter profiles that have comprehensive data
    const profilesToMigrate = result.profiles.filter(profile => 
      profile.data?.comprehensive_application_data
    );

    console.log(`Found ${profilesToMigrate.length} profiles with comprehensive data to migrate`);

    if (profilesToMigrate.length === 0) {
      console.log('✅ No profiles need migration - all comprehensive data already separated');
      return;
    }

    // Process in batches
    const batchSize = 25;
    let processed = 0;
    let created = 0;
    let updated = 0;

    console.log(`\n🔄 Processing ${profilesToMigrate.length} profiles in batches of ${batchSize}...\n`);

    for (let i = 0; i < profilesToMigrate.length; i += batchSize) {
      const batch = profilesToMigrate.slice(i, i + batchSize);
      
      try {
        const transactions = [];
        
        for (const profile of batch) {
          if (!profile.data?.comprehensive_application_data) {
            console.log(`⚠️  Profile ${profile.id} has no comprehensive data - skipping`);
            continue;
          }

          // Extract comprehensive data
          const comprehensiveData = profile.data.comprehensive_application_data;
          
          // Create core student data (only essential fields)
          const coreData: any = {};
          
          // Copy over core fields
          for (const field of CORE_STUDENT_FIELDS) {
            if (profile.data[field] !== undefined) {
              coreData[field] = profile.data[field];
            }
          }

          // Log what we're doing
          const studentName = `${coreData.first_name || 'Unknown'} ${coreData.last_name || 'Student'}`;
          console.log(`  📋 Processing: ${studentName} (${profile.id})`);

          // Create studentApplications entity
          const applicationId = id();
          if (!db.tx?.studentApplications) {
            throw new Error('db.tx.studentApplications is not available');
          }
          
          transactions.push(
            (db.tx as any).studentApplications[applicationId].update({
              id: applicationId,
              profileId: profile.id,
              comprehensiveData: comprehensiveData,
              createdAt: new Date(),
              updatedAt: new Date()
            })
          );
          created++;

          // Update profile with only core data
          if (!db.tx?.profiles) {
            throw new Error('db.tx.profiles is not available');
          }
          
          transactions.push(
            (db.tx as any).profiles[profile.id].update({
              data: coreData,
              updatedAt: new Date()
            })
          );
          updated++;
        }

        // Execute batch
        if (transactions.length > 0) {
          await db.transact(transactions);
          processed += batch.length;
          console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}: Processed ${batch.length} profiles (${processed}/${profilesToMigrate.length})`);
        }
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, error);
      }
    }

    console.log('\n🏁 Migration completed!');
    console.log(`📊 Summary:`);
    console.log(`  • Processed profiles: ${processed}`);
    console.log(`  • Created student applications: ${created}`);
    console.log(`  • Updated profiles: ${updated}`);

    // Verify the migration
    console.log('\n🔍 Verifying migration...');
    
    const verificationResult = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      },
      studentApplications: {}
    });

    const verificationProfiles = verificationResult.profiles || [];
    const verificationApplications = verificationResult.studentApplications || [];

    console.log(`📈 Verification Results:`);
    console.log(`  • Total student profiles: ${verificationProfiles.length}`);
    console.log(`  • Total student applications: ${verificationApplications.length}`);
    
    // Check if profiles still have comprehensive data
    const profilesWithComprehensiveData = verificationProfiles.filter(profile => 
      profile.data?.comprehensive_application_data
    );
    
    console.log(`  • Profiles still with comprehensive data: ${profilesWithComprehensiveData.length}`);
    
    if (profilesWithComprehensiveData.length === 0) {
      console.log('✅ Migration successful - all comprehensive data moved to studentApplications');
    } else {
      console.log('⚠️  Some profiles still have comprehensive data - may need another migration pass');
    }

    // Show sample of migrated data
    if (verificationApplications.length > 0) {
      const sampleApplication = verificationApplications[0]!;
      console.log(`\n📋 Sample migrated application for profile ${sampleApplication.profileId}:`);
      console.log(`  • Has comprehensive data: ${!!sampleApplication.comprehensiveData}`);
      console.log(`  • Comprehensive data keys: ${Object.keys(sampleApplication.comprehensiveData || {}).slice(0, 10).join(', ')}...`);
    }

    if (verificationProfiles.length > 0) {
      const sampleProfile = verificationProfiles[0]!;
      console.log(`\n👤 Sample updated profile ${sampleProfile.id}:`);
      console.log(`  • Core data keys: ${Object.keys(sampleProfile.data || {}).join(', ')}`);
      console.log(`  • Has comprehensive data: ${!!sampleProfile.data?.comprehensive_application_data}`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run the migration
migrateComprehensiveData().catch(console.error); 