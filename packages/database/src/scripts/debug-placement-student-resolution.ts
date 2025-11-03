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

async function debugPlacementStudentResolution() {
  try {
    console.log('🔍 Debugging placement student name resolution...\n');

    // Get all data
    const result = await db.query({
      placements: {},
      profiles: {},
      users: {}
    });

    const placements = result.placements || [];
    const profiles = result.profiles || [];
    const users = result.users || [];

    console.log(`📊 Data Overview:`);
    console.log(`🔸 Total placements: ${placements.length}`);
    console.log(`🔸 Total profiles: ${profiles.length}`);
    console.log(`🔸 Total users: ${users.length}\n`);

    // Simulate exactly what placements.tsx does
    console.log('🔍 Simulating placements.tsx component logic (first 10 placements):\n');
    
    placements.slice(0, 10).forEach((placement: any, index) => {
      console.log(`--- Placement ${index + 1} ---`);
      console.log(`Placement ID: ${placement.id}`);
      console.log(`Student Profile ID: ${placement.studentProfileId}`);
      
      // Find student profile by ID (what placements.tsx does)
      const studentProfile = profiles.find((p: any) => p.id === placement.studentProfileId);
      console.log(`Found student profile: ${studentProfile ? 'YES' : 'NO'}`);
      
      if (studentProfile) {
        console.log(`Profile data keys: ${Object.keys(studentProfile.data || {}).join(', ')}`);
        
        // Extract name data exactly like placements.tsx
        const profileData = studentProfile.data as any;
        const firstName = profileData?.firstName ?? '';
        const lastName = profileData?.lastName ?? '';
        const studentName = `${firstName} ${lastName}`.trim() || 'Unknown Student';
        
        console.log(`Profile firstName: ${profileData?.firstName}`);
        console.log(`Profile lastName: ${profileData?.lastName}`);
        console.log(`Computed student name: "${studentName}"`);
        
        // Check if profile has type='student'
        console.log(`Profile type: ${profileData?.type}`);
        
        // Check if profile has comprehensive data
        const hasComprehensiveData = !!profileData?.comprehensive_application_data;
        console.log(`Has comprehensive data: ${hasComprehensiveData}`);
        
        // Check if there's a linked user
        if (studentProfile.userId) {
          const linkedUser = users.find((u: any) => u.id === studentProfile.userId);
          console.log(`Linked user found: ${linkedUser ? 'YES' : 'NO'}`);
          if (linkedUser) {
            console.log(`User firstName: ${linkedUser.firstName}`);
            console.log(`User lastName: ${linkedUser.lastName}`);
            console.log(`User role: ${linkedUser.role}`);
          }
        } else {
          console.log(`No linked user (userId is null/undefined)`);
        }
      } else {
        console.log(`❌ Student profile NOT FOUND for ID: ${placement.studentProfileId}`);
      }
      
      console.log(`Host Family Profile ID: ${placement.hostFamilyProfileId}`);
      const hostProfile = profiles.find((p: any) => p.id === placement.hostFamilyProfileId);
      if (hostProfile) {
        const hostData = hostProfile.data as any;
        const hostFirstName = hostData?.firstName ?? '';
        const hostLastName = hostData?.lastName ?? '';
        const hostName = `${hostFirstName} ${hostLastName}`.trim();
        console.log(`Host family name: "${hostName}"`);
      } else {
        console.log(`❌ Host profile NOT FOUND`);
      }
      
      console.log(''); // Empty line for readability
    });

    // Check profile structure
    console.log('\n📋 Profile Analysis:');
    const studentProfiles = profiles.filter((p: any) => p.data?.type === 'student');
    console.log(`🔸 Student profiles: ${studentProfiles.length}`);
    
    const profilesWithNames = studentProfiles.filter((p: any) => {
      const data = p.data as any;
      return data?.firstName && data?.lastName;
    });
    
    console.log(`🔸 Student profiles with firstName/lastName: ${profilesWithNames.length}`);
    
    const profilesWithCompData = studentProfiles.filter((p: any) => 
      p.data?.comprehensive_application_data
    );
    
    console.log(`🔸 Student profiles with comprehensive data: ${profilesWithCompData.length}`);

    // Check which student profile IDs are referenced by placements
    const referencedProfileIds = new Set(placements.map((p: any) => p.studentProfileId));
    const existingProfileIds = new Set(profiles.map((p: any) => p.id));
    
    console.log(`\n🔗 Reference Analysis:`);
    console.log(`🔸 Unique student profile IDs in placements: ${referencedProfileIds.size}`);
    console.log(`🔸 Total profile IDs in database: ${existingProfileIds.size}`);
    
    const missingProfiles = [...referencedProfileIds].filter(id => !existingProfileIds.has(id));
    console.log(`🔸 Referenced profile IDs that don't exist: ${missingProfiles.length}`);
    
    if (missingProfiles.length > 0) {
      console.log(`❌ Missing profile IDs: ${missingProfiles.slice(0, 5).join(', ')}`);
    }

    // Check if the referenced profiles are student profiles
    const referencedProfiles = [...referencedProfileIds].map(id => 
      profiles.find(p => p.id === id)
    ).filter(Boolean);
    
    const referencedStudentProfiles = referencedProfiles.filter((p: any) => 
      p.data?.type === 'student'
    );
    
    console.log(`🔸 Referenced profiles that are student type: ${referencedStudentProfiles.length}`);
    
    const referencedProfilesWithNames = referencedProfiles.filter((p: any) => {
      const data = p.data as any;
      return data?.firstName && data?.lastName;
    });
    
    console.log(`🔸 Referenced profiles with names: ${referencedProfilesWithNames.length}`);

    console.log('\n🎯 ROOT CAUSE ANALYSIS:');
    if (missingProfiles.length > 0) {
      console.log('❌ Some placement references point to non-existent profiles');
    }
    if (referencedStudentProfiles.length < referencedProfiles.length) {
      console.log('❌ Some referenced profiles are not student type');
    }
    if (referencedProfilesWithNames.length < referencedProfiles.length) {
      console.log('❌ Some referenced student profiles lack firstName/lastName data');
      console.log('💡 This is likely why they show as "Unknown Student"');
    }
    if (referencedProfilesWithNames.length === referencedProfiles.length) {
      console.log('✅ All referenced profiles have names - issue might be elsewhere');
    }

  } catch (error) {
    console.error('💥 Debug failed:', error);
    throw error;
  }
}

// Run the debug
debugPlacementStudentResolution()
  .then(() => {
    console.log('\n🎉 Placement student resolution debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Debug failed:', error);
    process.exit(1);
  }); 