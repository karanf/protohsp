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

async function testSimpleQuery() {
  try {
    console.log('🔍 Testing simple query...\n');

    // Test 1: Query all student profiles (no nested conditions)
    console.log('📊 Test 1: Query all student profiles...');
    const { profiles: allProfiles } = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      }
    });
    console.log(`✅ Found ${allProfiles?.length || 0} student profiles\n`);

    // Test 2: Query profiles with sevisStatus
    console.log('📊 Test 2: Query profiles with sevisStatus...');
    const { profiles: sevisProfiles } = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student',
            'data.sevisStatus': 'sevis_approved'
          }
        }
      }
    });
    console.log(`✅ Found ${sevisProfiles?.length || 0} profiles with sevis_approved status\n`);

    // Test 3: Query profiles with hasPendingChanges (this is where the error occurs)
    console.log('📊 Test 3: Query profiles with hasPendingChanges...');
    try {
      const { profiles: flaggedProfiles } = await db.query({
        profiles: {
          $: {
            where: {
              type: 'student',
              'data.hasPendingChanges': true
            }
          }
        }
      });
      console.log(`✅ Found ${flaggedProfiles?.length || 0} flagged profiles\n`);
    } catch (error) {
      console.log(`❌ Error querying flagged profiles: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Test 4: Query a single profile and check its data structure
    if (allProfiles && allProfiles.length > 0) {
      console.log('📊 Test 4: Examine data structure of first profile...');
      const firstProfile = allProfiles[0];
      console.log(`Profile ID: ${firstProfile.id}`);
      console.log(`Data type: ${typeof firstProfile.data}`);
      console.log(`Data keys: ${Object.keys(firstProfile.data || {}).join(', ')}`);
      
      if (firstProfile.data?.hasPendingChanges !== undefined) {
        console.log(`hasPendingChanges: ${firstProfile.data.hasPendingChanges}`);
      } else {
        console.log(`hasPendingChanges: undefined`);
      }
    }

  } catch (error) {
    console.error('❌ Failed to test simple query:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }
}

// Run the script
testSimpleQuery(); 