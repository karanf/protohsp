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

async function debugPlacementsStructure() {
  try {
    console.log('🔍 Debugging placements structure...\n');

    // Get all placements data
    const result = await db.query({
      placements: {},
      profiles: {}
    });

    const placements = result.placements || [];
    const allProfiles = result.profiles || [];
    const studentProfiles = allProfiles.filter((p: any) => p.data?.type === 'student');

    console.log(`📊 Data Overview:`);
    console.log(`🔸 Total placements: ${placements.length}`);
    console.log(`🔸 Student profiles: ${studentProfiles.length}\n`);

    if (placements.length === 0) {
      console.log('❌ No placements found!');
      return;
    }

    // Examine placement structure
    console.log('🔍 Placement Structure Analysis (first 5):');
    placements.slice(0, 5).forEach((placement: any, index) => {
      console.log(`\n--- Placement ${index + 1} ---`);
      console.log(`ID: ${placement.id}`);
      console.log(`Keys: ${Object.keys(placement).join(', ')}`);
      
      // Check all possible student reference fields
      const possibleStudentFields = [
        'student_id', 'studentId', 'student_profile_id', 'studentProfileId',
        'profile_id', 'profileId', 'user_id', 'userId'
      ];
      
      possibleStudentFields.forEach(field => {
        if (placement[field]) {
          console.log(`${field}: ${placement[field]}`);
        }
      });
      
      // Show all non-null fields
      Object.entries(placement).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          console.log(`${key}: ${value}`);
        }
      });
    });

    // Look for any student reference patterns
    console.log('\n🔍 Looking for student references in placements:');
    
    const studentReferenceFields = [
      'student_id', 'studentId', 'student_profile_id', 'studentProfileId',
      'profile_id', 'profileId', 'user_id', 'userId'
    ];
    
    studentReferenceFields.forEach(field => {
      const placementsWithField = placements.filter((p: any) => p[field]);
      console.log(`🔸 Placements with ${field}: ${placementsWithField.length}`);
      
      if (placementsWithField.length > 0) {
        const sampleValues = placementsWithField.slice(0, 3).map((p: any) => p[field]);
        console.log(`   Sample values: ${sampleValues.join(', ')}`);
      }
    });

    // Check if any placement references match existing student profile IDs
    const studentProfileIds = new Set(studentProfiles.map((p: any) => p.id));
    
    console.log('\n🔗 Checking placement-to-student linkage:');
    studentReferenceFields.forEach(field => {
      const placementsWithField = placements.filter((p: any) => p[field]);
      if (placementsWithField.length > 0) {
        const validReferences = placementsWithField.filter((p: any) => 
          studentProfileIds.has(p[field])
        );
        const brokenReferences = placementsWithField.filter((p: any) => 
          !studentProfileIds.has(p[field])
        );
        
        console.log(`🔸 ${field}:`);
        console.log(`   Valid references: ${validReferences.length}`);
        console.log(`   Broken references: ${brokenReferences.length}`);
        
        if (brokenReferences.length > 0) {
          console.log(`   Sample broken IDs: ${brokenReferences.slice(0, 3).map((p: any) => p[field]).join(', ')}`);
        }
      }
    });

    // Show what the placements.tsx component expects
    console.log('\n📋 placements.tsx component expects:');
    console.log('🔸 placement.studentProfileId to link to profiles');
    
    const placementsWithExpectedField = placements.filter((p: any) => p.studentProfileId);
    console.log(`🔸 Placements with studentProfileId: ${placementsWithExpectedField.length}`);

  } catch (error) {
    console.error('💥 Debug failed:', error);
    throw error;
  }
}

// Run the debug
debugPlacementsStructure()
  .then(() => {
    console.log('\n🎉 Placements structure debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Debug failed:', error);
    process.exit(1);
  }); 