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

async function debugStudentCountDiscrepancy() {
  try {
    console.log('🔍 Debugging student count discrepancy...\n');

    // Get all data
    const result = await db.query({
      profiles: {},
      users: {},
      placements: {},
      relationships: {}
    });

    const profiles = result.profiles || [];
    const users = result.users || [];
    const placements = result.placements || [];
    const relationships = result.relationships || [];

    console.log('📊 Raw Data Counts:');
    console.log(`🔸 Total profiles: ${profiles.length}`);
    console.log(`🔸 Total users: ${users.length}`);
    console.log(`🔸 Total placements: ${placements.length}`);
    console.log(`🔸 Total relationships: ${relationships.length}\n`);

    // Analyze profiles by type
    const profilesByType = profiles.reduce((acc: any, profile: any) => {
      const type = profile.data?.type || 'undefined';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    console.log('👥 Profiles by Type:');
    Object.entries(profilesByType).forEach(([type, count]) => {
      console.log(`🔸 ${type}: ${count}`);
    });

    // Analyze users by role
    const usersByRole = users.reduce((acc: any, user: any) => {
      const role = user.role || 'undefined';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    console.log('\n👤 Users by Role:');
    Object.entries(usersByRole).forEach(([role, count]) => {
      console.log(`🔸 ${role}: ${count}`);
    });

    // The students.tsx component uses: users.filter(user => user.role === 'student')
    const studentUsers = users.filter((user: any) => user.role === 'student');
    console.log(`\n🎓 Student Users (role === 'student'): ${studentUsers.length}`);

    // The profiles with type === 'student'
    const studentProfiles = profiles.filter((profile: any) => profile.data?.type === 'student');
    console.log(`📋 Student Profiles (type === 'student'): ${studentProfiles.length}`);

    // Check overlap between student users and student profiles
    const studentUserIds = new Set(studentUsers.map((u: any) => u.id));
    const profilesWithStudentUsers = profiles.filter((p: any) => 
      p.userId && studentUserIds.has(p.userId)
    );
    
    console.log(`🔗 Profiles linked to student users: ${profilesWithStudentUsers.length}`);

    // Check for orphaned data
    const usersWithoutProfiles = users.filter((user: any) => 
      !profiles.some(profile => profile.userId === user.id)
    );
    
    const profilesWithoutUsers = profiles.filter((profile: any) => 
      profile.userId && !users.some(user => user.id === profile.userId)
    );

    console.log(`\n🔍 Orphaned Data:`);
    console.log(`🔸 Users without profiles: ${usersWithoutProfiles.length}`);
    console.log(`🔸 Profiles without users: ${profilesWithoutUsers.length}`);

    // Sample orphaned users
    if (usersWithoutProfiles.length > 0) {
      console.log('\n👤 Sample Users Without Profiles (first 5):');
      usersWithoutProfiles.slice(0, 5).forEach((user: any, index) => {
        console.log(`${index + 1}. ${user.id} - Role: ${user.role} - Name: ${user.firstName} ${user.lastName}`);
      });
    }

    // Check placement references
    console.log('\n🏠 Placement Analysis:');
    const placementStudentIds = placements.map((p: any) => p.studentProfileId).filter(Boolean);
    const uniquePlacementStudentIds = [...new Set(placementStudentIds)];
    
    console.log(`🔸 Placements with student references: ${placementStudentIds.length}`);
    console.log(`🔸 Unique student IDs in placements: ${uniquePlacementStudentIds.length}`);

    // Check which placement student IDs don't exist in profiles
    const profileIds = new Set(profiles.map((p: any) => p.id));
    const brokenPlacementReferences = uniquePlacementStudentIds.filter(id => !profileIds.has(id));
    
    console.log(`🔸 Broken placement references: ${brokenPlacementReferences.length}`);

    if (brokenPlacementReferences.length > 0) {
      console.log('\n❌ Sample Broken Placement References (first 5):');
      brokenPlacementReferences.slice(0, 5).forEach((id, index) => {
        const placement = placements.find((p: any) => p.studentProfileId === id);
        console.log(`${index + 1}. Placement ID: ${placement?.id}, Missing Student Profile ID: ${id}`);
      });
    }

    // Check for comprehensive application data
    const profilesWithComprehensiveData = profiles.filter((p: any) => 
      p.data?.comprehensive_application_data
    );
    
    console.log(`\n📝 Comprehensive Data:`);
    console.log(`🔸 Profiles with comprehensive data: ${profilesWithComprehensiveData.length}`);

    // The key insight: What's causing the 1312 count?
    console.log('\n🚨 ROOT CAUSE ANALYSIS:');
    console.log(`🔍 The students.tsx component shows ${studentUsers.length} students because it uses:`);
    console.log(`   users.filter(user => user.role === 'student')`);
    console.log(`🔍 But we fixed profiles with type === 'student' (${studentProfiles.length} profiles)`);
    console.log(`🔍 These are different data sources!`);
    
    // Show the discrepancy
    const discrepancy = studentUsers.length - studentProfiles.length;
    console.log(`\n📊 DISCREPANCY: ${discrepancy} extra student users vs student profiles`);
    
    if (discrepancy > 0) {
      console.log(`\n💡 SOLUTION NEEDED:`);
      console.log(`🔸 Either clean up users table (remove excess student users)`);
      console.log(`🔸 Or align the students.tsx component to use profiles instead of users`);
    }

    return {
      studentUsers: studentUsers.length,
      studentProfiles: studentProfiles.length,
      brokenPlacements: brokenPlacementReferences.length,
      discrepancy
    };

  } catch (error) {
    console.error('💥 Debug failed:', error);
    throw error;
  }
}

// Run the debug
debugStudentCountDiscrepancy()
  .then(() => {
    console.log('\n🎉 Student count debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Debug failed:', error);
    process.exit(1);
  }); 