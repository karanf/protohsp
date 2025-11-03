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

async function debugSchmidtStudent() {
  try {
    console.log('🔍 Looking for Schmidt students...\n');

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

    // Find Schmidt students
    const schmidtStudents = studentProfiles.filter(student => 
      student.data?.last_name === 'Schmidt' || 
      student.data?.comprehensive_application_data?.lastName === 'Schmidt'
    );

    console.log(`🔍 Found ${schmidtStudents.length} Schmidt students\n`);

    schmidtStudents.forEach((student, index) => {
      console.log(`🔍 === SCHMIDT STUDENT ${index + 1} ===`);
      console.log('Profile ID:', student.id);
      
      console.log('\n📁 Basic Profile Data:');
      console.log('- first_name:', student.data?.first_name);
      console.log('- last_name:', student.data?.last_name);
      console.log('- country_of_origin:', student.data?.country_of_origin);
      
      console.log('\n📋 Comprehensive Application Data:');
      const comprehensiveData = student.data?.comprehensive_application_data;
      
      if (comprehensiveData) {
        console.log('✅ Has comprehensive_application_data');
        
        if (comprehensiveData.parents) {
          console.log('\n👨‍👩‍👧‍👦 Parents data:');
          
          if (comprehensiveData.parents.father) {
            console.log('\n👨 Father data:');
            console.log('- firstName:', comprehensiveData.parents.father.firstName);
            console.log('- lastName:', comprehensiveData.parents.father.lastName);
            console.log('- occupation:', comprehensiveData.parents.father.occupation);
            console.log('- phone:', comprehensiveData.parents.father.phone);
            console.log('- email:', comprehensiveData.parents.father.email);
            console.log('- isLegalGuardian:', comprehensiveData.parents.father.isLegalGuardian);
            console.log('- status:', comprehensiveData.parents.father.status);
          } else {
            console.log('❌ No father data');
          }
          
          if (comprehensiveData.parents.mother) {
            console.log('\n👩 Mother data:');
            console.log('- firstName:', comprehensiveData.parents.mother.firstName);
            console.log('- lastName:', comprehensiveData.parents.mother.lastName);
            console.log('- occupation:', comprehensiveData.parents.mother.occupation);
            console.log('- phone:', comprehensiveData.parents.mother.phone);
            console.log('- email:', comprehensiveData.parents.mother.email);
            console.log('- isLegalGuardian:', comprehensiveData.parents.mother.isLegalGuardian);
            console.log('- status:', comprehensiveData.parents.mother.status);
          } else {
            console.log('❌ No mother data');
          }
        } else {
          console.log('❌ No parents data');
        }
        
        // Check address
        if (comprehensiveData.address) {
          console.log('\n🏠 Address data:');
          console.log('- line1:', comprehensiveData.address.line1);
          console.log('- city:', comprehensiveData.address.city);
          console.log('- postalCode:', comprehensiveData.address.postalCode);
          console.log('- country:', comprehensiveData.address.country);
        } else {
          console.log('❌ No address data');
        }
        
      } else {
        console.log('❌ NO comprehensive_application_data - This explains the "Not specified" values!');
      }
      
      console.log('\n' + '='.repeat(70));
    });

    // Also check students without comprehensive data
    const studentsWithoutComprehensiveData = studentProfiles.filter(student => 
      !student.data?.comprehensive_application_data
    );
    
    console.log(`\n⚠️  Found ${studentsWithoutComprehensiveData.length} students WITHOUT comprehensive data`);
    
    if (studentsWithoutComprehensiveData.length > 0) {
      console.log('\nFirst few students without comprehensive data:');
      studentsWithoutComprehensiveData.slice(0, 5).forEach((student, index) => {
        console.log(`${index + 1}. ${student.data?.first_name} ${student.data?.last_name} (${student.data?.country_of_origin})`);
      });
    }

  } catch (error) {
    console.error('💥 Debug failed:', error);
    throw error;
  }
}

// Run the debug
debugSchmidtStudent()
  .then(() => {
    console.log('\n🏁 Schmidt debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Debug failed:', error);
    process.exit(1);
  }); 