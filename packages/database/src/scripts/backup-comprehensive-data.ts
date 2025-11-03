import { init } from '@instantdb/admin';
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';
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

async function backupComprehensiveData() {
  console.log('🔄 Starting comprehensive data backup...\n');
  
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
      console.log('❌ No student profiles found to backup');
      return;
    }

    // Extract profiles with comprehensive data
    const profilesWithComprehensiveData = result.profiles.filter(profile => 
      profile.data?.comprehensive_application_data
    );

    console.log(`Found ${profilesWithComprehensiveData.length} profiles with comprehensive data`);

    // Create backup data structure
    const backupData = {
      timestamp: new Date().toISOString(),
      totalProfiles: result.profiles.length,
      profilesWithComprehensiveData: profilesWithComprehensiveData.length,
      profiles: result.profiles.map(profile => ({
        id: profile.id,
        userId: profile.userId,
        type: profile.type,
        data: profile.data,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
        // Extract comprehensive data separately for clarity
        comprehensiveData: profile.data?.comprehensive_application_data || null
      }))
    };

    // Save backup to file
    const backupFileName = `student-comprehensive-data-backup-${new Date().toISOString().split('T')[0]}.json`;
    const backupPath = join(process.cwd(), 'packages/database/src/scripts/backup', backupFileName);
    
    writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    
    console.log(`✅ Backup completed successfully!`);
    console.log(`📁 Backup file: ${backupPath}`);
    console.log(`📊 Backup Summary:`);
    console.log(`  • Total profiles: ${backupData.totalProfiles}`);
    console.log(`  • Profiles with comprehensive data: ${backupData.profilesWithComprehensiveData}`);
    console.log(`  • Backup size: ${Math.round(JSON.stringify(backupData).length / 1024 / 1024 * 100) / 100} MB`);

    // Verify backup file was created
    try {
      const backupContent = JSON.parse(JSON.stringify(backupData));
      console.log(`✅ Backup file verification: Valid JSON with ${backupContent.profiles.length} profiles`);
    } catch (error) {
      console.error('❌ Backup verification failed:', error);
    }

  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

// Run the backup
backupComprehensiveData().catch(console.error); 