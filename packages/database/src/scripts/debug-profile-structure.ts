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

async function debugProfileStructure() {
  try {
    console.log('🔍 Debugging profile structure...\n');

    // Get all profiles without filtering
    const result = await db.query({
      profiles: {}
    });

    const profiles = result.profiles || [];
    console.log(`📊 Total profiles found: ${profiles.length}\n`);

    if (profiles.length === 0) {
      console.log('❌ No profiles found at all!');
      return;
    }

    // Look at first few profiles to understand structure
    console.log('🔍 Sample Profile Structures (first 5):');
    profiles.slice(0, 5).forEach((profile: any, index: number) => {
      console.log(`\n--- Profile ${index + 1} ---`);
      console.log(`ID: ${profile.id}`);
      console.log(`Data keys: ${Object.keys(profile.data || {}).join(', ')}`);
      console.log(`Type field: ${profile.data?.type || 'MISSING'}`);
      console.log(`First name: ${profile.data?.first_name || 'MISSING'}`);
      console.log(`Last name: ${profile.data?.last_name || 'MISSING'}`);
      
      // Check for student indicators
      const hasStudentFields = profile.data?.country_of_origin || profile.data?.applicationStatus || profile.data?.sevisStatus;
      console.log(`Student fields present: ${hasStudentFields ? 'YES' : 'NO'}`);
      
      // Check for admin indicators  
      const hasAdminFields = profile.data?.role || profile.data?.permissions;
      console.log(`Admin fields present: ${hasAdminFields ? 'YES' : 'NO'}`);
      
      // Check for comprehensive data
      const hasComprehensiveData = profile.data?.comprehensive_application_data;
      console.log(`Has comprehensive data: ${hasComprehensiveData ? 'YES' : 'NO'}`);
    });

    // Count by actual type field values
    const typeGroups = profiles.reduce((acc: any, profile: any) => {
      const type = profile.data?.type || 'undefined';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(profile);
      return acc;
    }, {});

    console.log('\n📈 Profiles grouped by "type" field:');
    Object.entries(typeGroups).forEach(([type, profilesArray]: [string, any]) => {
      console.log(`🔸 Type "${type}": ${profilesArray.length} profiles`);
      
      // Show sample names for each type
      if (profilesArray.length > 0) {
        const sampleNames = profilesArray.slice(0, 3).map((p: any) => 
          `${p.data?.first_name || 'Unknown'} ${p.data?.last_name || 'Name'}`
        ).join(', ');
        console.log(`   Sample: ${sampleNames}${profilesArray.length > 3 ? '...' : ''}`);
      }
    });

    // Try to identify students by other fields
    console.log('\n🎓 Trying to identify students by other criteria:');
    
    const profilesWithCountry = profiles.filter((p: any) => p.data?.country_of_origin);
    console.log(`🔸 Profiles with country_of_origin: ${profilesWithCountry.length}`);
    
    const profilesWithSevis = profiles.filter((p: any) => p.data?.sevisStatus);
    console.log(`🔸 Profiles with sevisStatus: ${profilesWithSevis.length}`);
    
    const profilesWithApplication = profiles.filter((p: any) => p.data?.applicationStatus);
    console.log(`🔸 Profiles with applicationStatus: ${profilesWithApplication.length}`);
    
    const profilesWithComprehensive = profiles.filter((p: any) => p.data?.comprehensive_application_data);
    console.log(`🔸 Profiles with comprehensive data: ${profilesWithComprehensive.length}`);

    // Look for admin-like profiles
    console.log('\n👨‍💼 Trying to identify admin users:');
    const profilesWithRole = profiles.filter((p: any) => p.data?.role);
    console.log(`🔸 Profiles with role field: ${profilesWithRole.length}`);
    
    if (profilesWithRole.length > 0) {
      console.log('🔸 Sample roles:');
      profilesWithRole.slice(0, 5).forEach((p: any, index: number) => {
        console.log(`   ${index + 1}. ${p.data?.first_name} ${p.data?.last_name} - Role: ${p.data?.role}`);
      });
    }

    return {
      totalProfiles: profiles.length,
      typeGroups,
      profilesWithCountry: profilesWithCountry.length,
      profilesWithComprehensive: profilesWithComprehensive.length
    };

  } catch (error) {
    console.error('💥 Debug failed:', error);
    throw error;
  }
}

// Run the debug
debugProfileStructure()
  .then(() => {
    console.log('\n🎉 Profile structure analysis completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Debug failed:', error);
    process.exit(1);
  }); 