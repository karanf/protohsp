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

async function checkIncompleteData() {
  try {
    console.log('🔍 Checking students with incomplete comprehensive data...\n');

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
    console.log(`📊 Found ${studentProfiles.length} total student profiles`);

    // Find students with incomplete data (missing father firstName)
    const incompleteStudents = studentProfiles.filter(student => {
      const comprehensiveData = student.data?.comprehensive_application_data;
      return comprehensiveData && !comprehensiveData.parents?.father?.firstName;
    });

    console.log(`🔍 Found ${incompleteStudents.length} students with incomplete data\n`);

    if (incompleteStudents.length > 0) {
      console.log('🔍 === INCOMPLETE DATA SAMPLE ===');
      const sample = incompleteStudents[0];
      
      console.log('Profile ID:', sample.id);
      console.log('\n📁 Student Basic Data:');
      console.log('- first_name:', sample.data?.first_name);
      console.log('- last_name:', sample.data?.last_name);
      console.log('- country_of_origin:', sample.data?.country_of_origin);
      
      console.log('\n📋 Comprehensive Data Structure:');
      const comprehensiveData = sample.data?.comprehensive_application_data;
      
      if (comprehensiveData) {
        console.log('✅ Has comprehensive_application_data');
        console.log('\n🔹 Available top-level keys:');
        console.log(Object.keys(comprehensiveData));
        
        // Check what's in the old data
        if (comprehensiveData.personalityAssessment) {
          console.log('\n📝 Has personalityAssessment:', typeof comprehensiveData.personalityAssessment);
        }
        
        if (comprehensiveData.preferredStates) {
          console.log('🗺️  Has preferredStates:', Array.isArray(comprehensiveData.preferredStates));
        }
        
        if (comprehensiveData.personalityRatings) {
          console.log('⭐ Has personalityRatings:', typeof comprehensiveData.personalityRatings);
        }
        
        // Check parents structure
        if (comprehensiveData.parents) {
          console.log('\n👨‍👩‍👧‍👦 Parents structure:');
          console.log('- Has parents object:', !!comprehensiveData.parents);
          console.log('- Parents keys:', Object.keys(comprehensiveData.parents || {}));
          
          if (comprehensiveData.parents.father) {
            console.log('\n👨 Father data keys:', Object.keys(comprehensiveData.parents.father));
            console.log('- Father content:', comprehensiveData.parents.father);
          } else {
            console.log('❌ No father object');
          }
        } else {
          console.log('❌ No parents object in comprehensive data');
        }
        
        // Check address
        if (comprehensiveData.address) {
          console.log('\n🏠 Address data:', comprehensiveData.address);
        } else {
          console.log('❌ No address in comprehensive data');
        }
      }
    }

    // Find students with complete data for comparison
    const completeStudents = studentProfiles.filter(student => {
      const comprehensiveData = student.data?.comprehensive_application_data;
      return comprehensiveData && comprehensiveData.parents?.father?.firstName;
    });

    console.log(`\n✅ Found ${completeStudents.length} students with complete data`);
    
    if (completeStudents.length > 0) {
      console.log('\n🔍 === COMPLETE DATA SAMPLE ===');
      const sample = completeStudents[0];
      
      console.log('Profile ID:', sample.id);
      console.log('- Student:', sample.data?.first_name, sample.data?.last_name);
      
      const comprehensiveData = sample.data?.comprehensive_application_data;
      if (comprehensiveData?.parents?.father) {
        console.log('\n👨 Complete Father data:');
        console.log('- firstName:', comprehensiveData.parents.father.firstName);
        console.log('- lastName:', comprehensiveData.parents.father.lastName);
        console.log('- occupation:', comprehensiveData.parents.father.occupation);
        console.log('- phone:', comprehensiveData.parents.father.phone);
        console.log('- email:', comprehensiveData.parents.father.email);
      }
    }

  } catch (error) {
    console.error('💥 Debug failed:', error);
    throw error;
  }
}

// Run the debug
checkIncompleteData()
  .then(() => {
    console.log('\n🏁 Incomplete data check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Debug failed:', error);
    process.exit(1);
  }); 