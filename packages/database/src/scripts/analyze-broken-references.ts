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

async function analyzeBrokenReferences() {
  try {
    console.log('🔍 Analyzing database for broken references...\n');

    // Get all profiles by type
    const result = await db.query({
      profiles: {},
      users: {},
      placements: {},
      changeQueue: {}
    });

    const profiles = result.profiles || [];
    const users = result.users || [];
    const placements = result.placements || [];
    const changeQueue = result.changeQueue || [];

    console.log('📊 Current Database State:');
    console.log(`🔸 Total profiles: ${profiles.length}`);
    console.log(`🔸 Total users: ${users.length}`);
    console.log(`🔸 Total placements: ${placements.length}`);
    console.log(`🔸 Total change queue items: ${changeQueue.length}\n`);

    // Analyze profiles by type
    const profilesByType = profiles.reduce((acc: any, profile: any) => {
      const type = profile.data?.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    console.log('👥 Profiles by Type:');
    Object.entries(profilesByType).forEach(([type, count]) => {
      console.log(`🔸 ${type}: ${count}`);
    });

    // Get admin users
    const adminProfiles = profiles.filter((p: any) => p.data?.type === 'admin');
    console.log('\n👨‍💼 Admin Users:');
    adminProfiles.forEach((admin: any, index: number) => {
      console.log(`${index + 1}. ${admin.data?.first_name} ${admin.data?.last_name} (ID: ${admin.id})`);
    });

    // Get student profiles
    const studentProfiles = profiles.filter((p: any) => p.data?.type === 'student');
    const studentIds = new Set(studentProfiles.map((s: any) => s.id));
    
    console.log('\n🎓 Students:');
    console.log(`🔸 Current student count: ${studentProfiles.length}`);
    
    // Check for "reviewed by" issues
    console.log('\n🔍 Checking "Reviewed By" Fields:');
    const studentsWithReviewedBy = studentProfiles.filter((s: any) => s.data?.approved_by);
    const reviewedByValues = [...new Set(studentsWithReviewedBy.map((s: any) => s.data?.approved_by))];
    
    console.log(`🔸 Students with "approved_by" field: ${studentsWithReviewedBy.length}`);
    console.log('🔸 Unique "approved_by" values:');
    reviewedByValues.forEach((value: string) => {
      const count = studentsWithReviewedBy.filter((s: any) => s.data?.approved_by === value).length;
      console.log(`   - "${value}": ${count} students`);
    });

    // Check placements for broken student references
    console.log('\n🏠 Analyzing Placements:');
    const placementsWithStudentIds = placements.filter((p: any) => p.student_id);
    const brokenPlacements = placementsWithStudentIds.filter((p: any) => !studentIds.has(p.student_id));
    
    console.log(`🔸 Total placements: ${placements.length}`);
    console.log(`🔸 Placements with student_id: ${placementsWithStudentIds.length}`);
    console.log(`🔸 Broken placements (student not found): ${brokenPlacements.length}`);
    
    if (brokenPlacements.length > 0) {
      console.log('\n❌ Broken Placements (first 10):');
      brokenPlacements.slice(0, 10).forEach((placement: any, index: number) => {
        console.log(`${index + 1}. Placement ID: ${placement.id}, Missing Student ID: ${placement.student_id}`);
      });
    }

    // Check change queue for broken references
    console.log('\n📝 Analyzing Change Queue:');
    const changeQueueWithStudentIds = changeQueue.filter((c: any) => c.student_id);
    const brokenChangeQueue = changeQueueWithStudentIds.filter((c: any) => !studentIds.has(c.student_id));
    
    console.log(`🔸 Total change queue items: ${changeQueue.length}`);
    console.log(`🔸 Change queue items with student_id: ${changeQueueWithStudentIds.length}`);
    console.log(`🔸 Broken change queue items: ${brokenChangeQueue.length}`);
    
    if (brokenChangeQueue.length > 0) {
      console.log('\n❌ Broken Change Queue Items (first 10):');
      brokenChangeQueue.slice(0, 10).forEach((item: any, index: number) => {
        console.log(`${index + 1}. Change ID: ${item.id}, Missing Student ID: ${item.student_id}, Type: ${item.change_type}`);
      });
    }

    // Check for any other relationships
    console.log('\n🔗 Summary of Issues Found:');
    const issues = [];
    
    if (reviewedByValues.includes('system migration') || reviewedByValues.includes('System')) {
      issues.push(`❌ ${studentsWithReviewedBy.filter(s => s.data?.approved_by === 'system migration' || s.data?.approved_by === 'System').length} students have "reviewed by" pointing to system instead of admin users`);
    }
    
    if (brokenPlacements.length > 0) {
      issues.push(`❌ ${brokenPlacements.length} placements reference non-existent students`);
    }
    
    if (brokenChangeQueue.length > 0) {
      issues.push(`❌ ${brokenChangeQueue.length} change queue items reference non-existent students`);
    }
    
    if (issues.length === 0) {
      console.log('✅ No broken references found!');
    } else {
      issues.forEach(issue => console.log(issue));
    }

    return {
      adminProfiles,
      studentProfiles,
      brokenPlacements,
      brokenChangeQueue,
      reviewedByValues
    };

  } catch (error) {
    console.error('💥 Analysis failed:', error);
    throw error;
  }
}

// Run the analysis
analyzeBrokenReferences()
  .then(() => {
    console.log('\n🎉 Database analysis completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Analysis failed:', error);
    process.exit(1);
  }); 