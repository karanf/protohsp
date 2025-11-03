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

async function findParentSchmidt() {
  try {
    console.log('🔍 Looking for students with Schmidt parents...\n');

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

    // Find students with Schmidt parents
    const schmidtParentStudents = studentProfiles.filter(student => {
      const comprehensiveData = student.data?.comprehensive_application_data;
      if (!comprehensiveData || !comprehensiveData.parents) return false;
      
      const fatherLastName = comprehensiveData.parents.father?.lastName;
      const motherLastName = comprehensiveData.parents.mother?.lastName;
      
      return fatherLastName === 'Schmidt' || motherLastName === 'Schmidt';
    });

    console.log(`🔍 Found ${schmidtParentStudents.length} students with Schmidt parents\n`);

    if (schmidtParentStudents.length > 0) {
      schmidtParentStudents.slice(0, 3).forEach((student, index) => {
        console.log(`🔍 === STUDENT WITH SCHMIDT PARENT ${index + 1} ===`);
        console.log('Profile ID:', student.id);
        
        console.log('\n📁 Student Basic Data:');
        console.log('- Student first_name:', student.data?.first_name);
        console.log('- Student last_name:', student.data?.last_name);
        console.log('- Student country:', student.data?.country_of_origin);
        
        const comprehensiveData = student.data?.comprehensive_application_data;
        
        if (comprehensiveData?.parents) {
          console.log('\n👨‍👩‍👧‍👦 Parent Details:');
          
          if (comprehensiveData.parents.father) {
            console.log('\n👨 Father:');
            console.log('- firstName:', comprehensiveData.parents.father.firstName);
            console.log('- lastName:', comprehensiveData.parents.father.lastName);
            console.log('- occupation:', comprehensiveData.parents.father.occupation);
            console.log('- phone:', comprehensiveData.parents.father.phone);
            console.log('- email:', comprehensiveData.parents.father.email);
          }
          
          if (comprehensiveData.parents.mother) {
            console.log('\n👩 Mother:');
            console.log('- firstName:', comprehensiveData.parents.mother.firstName);
            console.log('- lastName:', comprehensiveData.parents.mother.lastName);
            console.log('- occupation:', comprehensiveData.parents.mother.occupation);
            console.log('- phone:', comprehensiveData.parents.mother.phone);
            console.log('- email:', comprehensiveData.parents.mother.email);
          }
        }
        
        console.log('\n' + '='.repeat(70));
      });
    }

    // Also look for potential data issues
    console.log('\n🔍 Checking for potential data issues...');
    
    let missingFatherFirstName = 0;
    let missingFatherPhone = 0;
    let missingAddress = 0;
    
    studentProfiles.forEach(student => {
      const comprehensiveData = student.data?.comprehensive_application_data;
      if (comprehensiveData) {
        if (!comprehensiveData.parents?.father?.firstName) missingFatherFirstName++;
        if (!comprehensiveData.parents?.father?.phone) missingFatherPhone++;
        if (!comprehensiveData.address?.line1) missingAddress++;
      }
    });
    
    console.log(`\n📊 Data Quality Check:`);
    console.log(`- Students missing father firstName: ${missingFatherFirstName}`);
    console.log(`- Students missing father phone: ${missingFatherPhone}`);
    console.log(`- Students missing address: ${missingAddress}`);

  } catch (error) {
    console.error('💥 Debug failed:', error);
    throw error;
  }
}

// Run the debug
findParentSchmidt()
  .then(() => {
    console.log('\n🏁 Parent Schmidt search completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Debug failed:', error);
    process.exit(1);
  }); 