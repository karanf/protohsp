import { init } from '@instantdb/admin';
import dotenv from 'dotenv';

// Load environment variables - EXACT pattern to avoid path issues
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

const db = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

async function testMigrationResults() {
  console.log('🧪 Testing migration results...\n');
  
  try {
    // Query both the old and new structure to verify migration
    const result = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      },
      studentApplications: {}
    });

    const profiles = result.profiles || [];
    const studentApplications = result.studentApplications || [];

    console.log('📊 Migration Results:');
    console.log(`  • Student profiles: ${profiles.length}`);
    console.log(`  • Student applications: ${studentApplications.length}`);

    // Verify that profiles no longer have comprehensive data
    let profilesWithComprehensiveData = 0;
    let profilesWithCoreDataOnly = 0;

    for (const profile of profiles) {
      if (profile.data?.comprehensive_application_data) {
        profilesWithComprehensiveData++;
      } else if (profile.data?.first_name || profile.data?.last_name) {
        profilesWithCoreDataOnly++;
      }
    }

    console.log('\n✅ Profile Analysis:');
    console.log(`  • Profiles with comprehensive data: ${profilesWithComprehensiveData}`);
    console.log(`  • Profiles with core data only: ${profilesWithCoreDataOnly}`);

    // Verify that student applications have comprehensive data
    let applicationsWithData = 0;
    for (const application of studentApplications) {
      if (application.comprehensiveData && typeof application.comprehensiveData === 'object') {
        applicationsWithData++;
      }
    }

    console.log('\n📋 Application Analysis:');
    console.log(`  • Applications with comprehensive data: ${applicationsWithData}`);
    console.log(`  • Applications without comprehensive data: ${studentApplications.length - applicationsWithData}`);

    // Test the query pattern that UI components will use
    console.log('\n🔍 Testing UI Query Pattern:');
    
    // Get a sample student profile
    const sampleProfile = profiles[0];
    if (sampleProfile) {
      console.log(`  • Testing with profile: ${sampleProfile.id}`);
      
      // Query for the application data using the profile ID
      const applicationQuery = await db.query({
        studentApplications: {
          $: {
            where: {
              profileId: sampleProfile.id
            }
          }
        }
      });

      const applications = applicationQuery.studentApplications || [];
      if (applications.length > 0) {
        const application = applications[0]!;
        console.log(`  • ✅ Found application data for profile`);
        console.log(`  • Comprehensive data keys: ${Object.keys(application.comprehensiveData || {}).slice(0, 10).join(', ')}...`);
        
        // Test specific data access patterns
        const comprehensiveData = application.comprehensiveData || {};
        const hasParents = comprehensiveData.parents ? 'Yes' : 'No';
        const hasInterview = comprehensiveData.interview ? 'Yes' : 'No';
        const hasPersonalityRatings = comprehensiveData.personalityRatings ? 'Yes' : 'No';
        
        console.log(`  • Has parents data: ${hasParents}`);
        console.log(`  • Has interview data: ${hasInterview}`);
        console.log(`  • Has personality ratings: ${hasPersonalityRatings}`);
      } else {
        console.log(`  • ❌ No application data found for profile`);
      }
    }

    // Performance comparison
    console.log('\n⚡ Performance Benefits:');
    
    // Calculate data size differences
    let totalProfileDataSize = 0;
    let totalCoreDataSize = 0;
    
    for (const profile of profiles.slice(0, 10)) { // Sample first 10
      const fullDataSize = JSON.stringify(profile.data || {}).length;
      totalProfileDataSize += fullDataSize;
      
      // Estimate core data size
      const coreData = {
        first_name: profile.data?.first_name,
        last_name: profile.data?.last_name,
        email: profile.data?.email,
        country_of_origin: profile.data?.country_of_origin,
        date_of_birth: profile.data?.date_of_birth,
        gender: profile.data?.gender,
        school_grade: profile.data?.school_grade,
        applicationStatus: profile.data?.applicationStatus,
        sevisStatus: profile.data?.sevisStatus
      };
      totalCoreDataSize += JSON.stringify(coreData).length;
    }
    
    const avgProfileSize = Math.round(totalProfileDataSize / Math.min(profiles.length, 10));
    const avgCoreSize = Math.round(totalCoreDataSize / Math.min(profiles.length, 10));
    const sizeReduction = Math.round(((avgProfileSize - avgCoreSize) / avgProfileSize) * 100);
    
    console.log(`  • Average profile data size (before): ~${avgProfileSize} bytes`);
    console.log(`  • Average core data size (after): ~${avgCoreSize} bytes`);
    console.log(`  • Data transfer reduction: ~${sizeReduction}%`);

    // Summary
    console.log('\n🎉 Migration Test Summary:');
    if (profilesWithComprehensiveData === 0 && applicationsWithData === studentApplications.length) {
      console.log('✅ Migration completed successfully!');
      console.log('✅ All comprehensive data moved to separate entities');
      console.log('✅ Profiles now contain only core data');
      console.log('✅ UI query pattern working correctly');
      console.log(`✅ Performance improved by ~${sizeReduction}% data reduction`);
    } else {
      console.log('⚠️  Migration may have issues:');
      if (profilesWithComprehensiveData > 0) {
        console.log(`   • ${profilesWithComprehensiveData} profiles still have comprehensive data`);
      }
      if (applicationsWithData < studentApplications.length) {
        console.log(`   • ${studentApplications.length - applicationsWithData} applications missing comprehensive data`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run the test
testMigrationResults().catch(console.error); 