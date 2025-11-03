import { init } from '@instantdb/admin';
import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

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

async function rollbackComprehensiveData() {
  console.log('🔄 Starting comprehensive data rollback...\n');
  console.log('⚠️  WARNING: This will reverse the migration by moving comprehensive data back to profiles!\n');
  
  try {
    // Check if backup file exists
    const backupPath = join('packages/database/src/scripts/backup', 'comprehensive-data-backup.json');
    if (!existsSync(backupPath)) {
      console.log('❌ Backup file not found! Cannot perform rollback without backup.');
      console.log(`   Expected: ${backupPath}`);
      return;
    }

    // Load backup data
    console.log('📂 Loading backup data...');
    const backupData = JSON.parse(readFileSync(backupPath, 'utf-8'));
    console.log(`✅ Loaded backup with ${backupData.profiles?.length || 0} profiles\n`);

    // Query current state
    const result = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      },
      studentApplications: {}
    });

    const currentProfiles = result.profiles || [];
    const studentApplications = result.studentApplications || [];

    console.log('📊 Current State:');
    console.log(`  • Student profiles: ${currentProfiles.length}`);
    console.log(`  • Student applications: ${studentApplications.length}`);

    if (studentApplications.length === 0) {
      console.log('❌ No studentApplications found to rollback!');
      return;
    }

    // Process rollback in batches
    const batchSize = 25;
    let processed = 0;
    let rolledBack = 0;
    let deleted = 0;

    console.log(`\n🔄 Rolling back ${studentApplications.length} applications in batches of ${batchSize}...\n`);

    for (let i = 0; i < studentApplications.length; i += batchSize) {
      const batch = studentApplications.slice(i, i + batchSize);
      
      try {
        const transactions = [];
        
        for (const application of batch) {
          const profileId = application.profileId;
          const comprehensiveData = application.comprehensiveData;
          
          if (!profileId || !comprehensiveData) {
            console.log(`⚠️  Skipping application ${application.id} - missing data`);
            continue;
          }

          // Find the corresponding backup profile data
          const backupProfile = backupData.profiles?.find((p: any) => p.id === profileId);
          if (!backupProfile) {
            console.log(`⚠️  No backup found for profile ${profileId} - using current profile`);
          }

          // Find current profile
          const currentProfile = currentProfiles.find(p => p.id === profileId);
          if (!currentProfile) {
            console.log(`⚠️  Profile ${profileId} not found - skipping`);
            continue;
          }

          // Restore comprehensive data to profile
          const restoredData = {
            ...currentProfile.data,
            comprehensive_application_data: comprehensiveData
          };

          // Log what we're doing
          const studentName = `${currentProfile.data?.first_name || 'Unknown'} ${currentProfile.data?.last_name || 'Student'}`;
          console.log(`  📋 Rolling back: ${studentName} (${profileId})`);

          // Update profile with comprehensive data
          if (!db.tx?.profiles) {
            throw new Error('db.tx.profiles is not available');
          }
          
          transactions.push(
            (db.tx as any).profiles[profileId].update({
              data: restoredData,
              updatedAt: new Date()
            })
          );
          rolledBack++;

          // Delete the studentApplications entity
          if (!db.tx?.studentApplications) {
            throw new Error('db.tx.studentApplications is not available');
          }
          
          transactions.push(
            (db.tx as any).studentApplications[application.id].delete()
          );
          deleted++;
        }

        // Execute batch
        if (transactions.length > 0) {
          await db.transact(transactions);
          processed += batch.length;
          console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}: Processed ${batch.length} applications (${processed}/${studentApplications.length})`);
        }
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, error);
      }
    }

    console.log('\n🏁 Rollback completed!');
    console.log(`📊 Summary:`);
    console.log(`  • Processed applications: ${processed}`);
    console.log(`  • Profiles restored: ${rolledBack}`);
    console.log(`  • Applications deleted: ${deleted}`);

    // Verify the rollback
    console.log('\n🔍 Verifying rollback...');
    
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
    
    // Check if profiles now have comprehensive data
    const profilesWithComprehensiveData = verificationProfiles.filter(profile => 
      profile.data?.comprehensive_application_data
    );
    
    console.log(`  • Profiles with comprehensive data: ${profilesWithComprehensiveData.length}`);
    
    if (verificationApplications.length === 0 && profilesWithComprehensiveData.length > 0) {
      console.log('✅ Rollback successful - comprehensive data restored to profiles');
      console.log('✅ All studentApplications entities removed');
    } else {
      console.log('⚠️  Rollback may be incomplete:');
      if (verificationApplications.length > 0) {
        console.log(`   • ${verificationApplications.length} student applications still exist`);
      }
      if (profilesWithComprehensiveData.length === 0) {
        console.log(`   • No profiles have comprehensive data restored`);
      }
    }

    // Show sample of restored data
    if (profilesWithComprehensiveData.length > 0) {
      const sampleProfile = profilesWithComprehensiveData[0]!;
      console.log(`\n📋 Sample restored profile ${sampleProfile.id}:`);
      console.log(`  • Has comprehensive data: ${!!sampleProfile.data?.comprehensive_application_data}`);
      const comprehensiveKeys = Object.keys(sampleProfile.data?.comprehensive_application_data || {});
      console.log(`  • Comprehensive data keys: ${comprehensiveKeys.slice(0, 10).join(', ')}...`);
    }

  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}

// Confirmation prompt simulation
console.log('⚠️  ROLLBACK WARNING ⚠️');
console.log('This will reverse the comprehensive data migration!');
console.log('Make sure you want to proceed before running this script.');
console.log('');

// Run the rollback
rollbackComprehensiveData().catch(console.error); 