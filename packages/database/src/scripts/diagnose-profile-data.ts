import dotenv from 'dotenv';

// Load .env files - try multiple locations
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

import { init } from '@instantdb/admin';

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

if (!INSTANT_APP_ID || !INSTANT_ADMIN_TOKEN) {
  console.error('❌ Missing InstantDB credentials');
  console.error('Make sure NEXT_PUBLIC_INSTANT_APP_ID and INSTANT_ADMIN_TOKEN are set');
  process.exit(1);
}

const db = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

async function diagnoseProfileData() {
  try {
    console.log('🔍 Diagnosing profile data...\n');

    // Query all student profiles
    const { profiles } = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      }
    });

    console.log(`📊 Found ${profiles?.length || 0} student profiles\n`);

    if (!profiles || profiles.length === 0) {
      console.log('❌ No student profiles found');
      return;
    }

    // Analyze each profile's data field
    let validProfiles = 0;
    let invalidProfiles = 0;
    const problematicProfiles: any[] = [];

    profiles.forEach((profile, index) => {
      try {
        // Check if data field exists and is an object
        if (!profile.data) {
          problematicProfiles.push({
            id: profile.id,
            issue: 'Missing data field',
            data: profile.data
          });
          invalidProfiles++;
        } else if (typeof profile.data !== 'object') {
          problematicProfiles.push({
            id: profile.id,
            issue: 'Data field is not an object',
            data: profile.data,
            type: typeof profile.data
          });
          invalidProfiles++;
        } else if (Array.isArray(profile.data)) {
          problematicProfiles.push({
            id: profile.id,
            issue: 'Data field is an array instead of object',
            data: profile.data
          });
          invalidProfiles++;
        } else {
          validProfiles++;
        }
      } catch (error) {
        problematicProfiles.push({
          id: profile.id,
          issue: 'Error analyzing data field',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        invalidProfiles++;
      }
    });

    console.log(`📈 Analysis Results:`);
    console.log(`  • Valid profiles: ${validProfiles}`);
    console.log(`  • Invalid profiles: ${invalidProfiles}`);
    console.log(`  • Total profiles: ${profiles.length}\n`);

    if (problematicProfiles.length > 0) {
      console.log('🚨 Problematic profiles:');
      problematicProfiles.slice(0, 10).forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.id}`);
        console.log(`     • Issue: ${profile.issue}`);
        if (profile.type) console.log(`     • Type: ${profile.type}`);
        if (profile.data !== undefined) console.log(`     • Data: ${JSON.stringify(profile.data).substring(0, 100)}...`);
        if (profile.error) console.log(`     • Error: ${profile.error}`);
        console.log('');
      });

      if (problematicProfiles.length > 10) {
        console.log(`... and ${problematicProfiles.length - 10} more problematic profiles`);
      }
    } else {
      console.log('✅ All profiles have valid data fields');
    }

  } catch (error) {
    console.error('❌ Failed to diagnose profile data:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }
}

// Run the script
diagnoseProfileData(); 