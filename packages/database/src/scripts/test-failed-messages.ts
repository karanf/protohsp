import { init } from '@instantdb/admin';
import dotenv from 'dotenv';

// Load environment variables - EXACT pattern from existing scripts
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

// Ensure required environment variables are available
const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

if (!INSTANT_APP_ID || !INSTANT_ADMIN_TOKEN) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Initialize InstantDB
const db = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

async function testFailedMessages() {
  try {
    console.log('🔍 Testing failed SEVIS records for messages...\n');
    
    // Query student profiles with failed SEVIS status
    const result = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      }
    });

    if (!result?.profiles) {
      console.log('❌ No profiles found');
      return;
    }

    const failedStudents = result.profiles.filter(p => 
      p.data?.applicationStatus === 'approved' && 
      p.data?.sevisStatus === 'sevis_failed'
    );

    console.log(`📊 Found ${failedStudents.length} students with sevis_failed status`);

    let studentsWithMessages = 0;
    let studentsWithoutMessages = 0;

    for (const student of failedStudents.slice(0, 10)) { // Check first 10
      const hasMessage = student.data?.sevisMessage && student.data.sevisMessage.length > 0;
      
      if (hasMessage) {
        studentsWithMessages++;
        console.log(`✅ Student ${student.id}: "${student.data.sevisMessage}"`);
      } else {
        studentsWithoutMessages++;
        console.log(`❌ Student ${student.id}: No message found`);
      }
    }

    console.log(`\n📋 Summary:`);
    console.log(`  • Students with messages: ${studentsWithMessages}`);
    console.log(`  • Students without messages: ${studentsWithoutMessages}`);

    if (studentsWithoutMessages > 0) {
      console.log(`\n⚠️  Some failed students are missing messages. Consider running the update script again.`);
    } else {
      console.log(`\n✅ All tested failed students have proper failure messages!`);
    }

  } catch (error) {
    console.error('❌ Error testing failed messages:', error);
  }
}

// Run the test
testFailedMessages()
  .then(() => {
    console.log('\n🎉 Test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }); 