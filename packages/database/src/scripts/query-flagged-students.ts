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

async function queryFlaggedStudents() {
  try {
    console.log('🔍 Querying flagged students...\n');

    const { profiles } = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student',
            'data.hasPendingChanges': true
          }
        }
      }
    });

    console.log(`📊 Found ${profiles?.length || 0} flagged students\n`);

    if (profiles && profiles.length > 0) {
      console.log('📋 Sample flagged students:');
      profiles.slice(0, 5).forEach((student, index) => {
        const name = `${student.data?.first_name || 'Unknown'} ${student.data?.last_name || 'Student'}`;
        const changeType = student.data?.changeQueueData?.sevisChangeType || 'Unknown';
        const changeItems = student.data?.changeQueueData?.changeItems || [];
        
        console.log(`  ${index + 1}. ${name} (${student.id})`);
        console.log(`     • Change Type: ${changeType}`);
        console.log(`     • Change Items: ${changeItems.join(', ')}`);
        console.log(`     • Status: ${student.data?.changeQueueStatus || 'Unknown'}`);
        console.log('');
      });

      if (profiles.length > 5) {
        console.log(`... and ${profiles.length - 5} more flagged students`);
      }
    } else {
      console.log('❌ No flagged students found');
    }

  } catch (error) {
    console.error('❌ Failed to query flagged students:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }
}

// Run the script
queryFlaggedStudents(); 