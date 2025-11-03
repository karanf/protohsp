import dotenv from 'dotenv';

// Load .env files
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

import { init } from '@instantdb/admin';

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

async function debugStudentData() {
  try {
    console.log('🔍 Debugging student data structure...\n');

    // Get a sample of student profiles
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

    // Look at the first few students
    const sampleSize = 3;
    const sampleStudents = studentProfiles.slice(0, sampleSize);

    sampleStudents.forEach((student, index) => {
      console.log(`\n🔍 === STUDENT ${index + 1} ===`);
      console.log('Profile ID:', student.id);
      
      console.log('\n📁 Basic Profile Data:');
      console.log('- first_name:', student.data?.first_name);
      console.log('- last_name:', student.data?.last_name);
      console.log('- country_of_origin:', student.data?.country_of_origin);
      
      console.log('\n📋 Comprehensive Application Data:');
      const comprehensiveData = student.data?.comprehensive_application_data;
      
      if (comprehensiveData) {
        console.log('✅ Has comprehensive_application_data');
        console.log('\n🔹 Top-level keys:');
        console.log(Object.keys(comprehensiveData));
        
        if (comprehensiveData.parents) {
          console.log('\n👨‍👩‍👧‍👦 Parents data structure:');
          console.log('- Has parents object:', !!comprehensiveData.parents);
          console.log('- Parents keys:', Object.keys(comprehensiveData.parents));
          
          if (comprehensiveData.parents.father) {
            console.log('\n👨 Father data:');
            console.log('- firstName:', comprehensiveData.parents.father.firstName);
            console.log('- lastName:', comprehensiveData.parents.father.lastName);
            console.log('- occupation:', comprehensiveData.parents.father.occupation);
            console.log('- phone:', comprehensiveData.parents.father.phone);
            console.log('- email:', comprehensiveData.parents.father.email);
          } else {
            console.log('❌ No father data found');
          }
          
          if (comprehensiveData.parents.mother) {
            console.log('\n👩 Mother data:');
            console.log('- firstName:', comprehensiveData.parents.mother.firstName);
            console.log('- lastName:', comprehensiveData.parents.mother.lastName);
            console.log('- occupation:', comprehensiveData.parents.mother.occupation);
          } else {
            console.log('❌ No mother data found');
          }
        } else {
          console.log('❌ No parents object found in comprehensive data');
        }
        
        // Also check interview data
        if (comprehensiveData.interview) {
          console.log('\n🎤 Interview data:');
          console.log('- length:', comprehensiveData.interview.length);
          console.log('- date:', comprehensiveData.interview.date);
          console.log('- interviewer:', comprehensiveData.interview.interviewer);
        }
        
      } else {
        console.log('❌ No comprehensive_application_data found');
      }
      
      console.log('\n' + '='.repeat(50));
    });

  } catch (error) {
    console.error('💥 Debug failed:', error);
    throw error;
  }
}

// Run the debug
debugStudentData()
  .then(() => {
    console.log('\n🏁 Debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Debug failed:', error);
    process.exit(1);
  }); 