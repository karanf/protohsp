import { init } from '@instantdb/admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

const db = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

async function analyzeSevisIds() {
  try {
    console.log('🔍 Analyzing SEVIS IDs in the database...\n');
    
    // Query all student profiles
    const result = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      }
    });

    if (!result?.profiles || result.profiles.length === 0) {
      console.log('❌ No student profiles found.');
      return;
    }

    const profiles = result.profiles;
    console.log(`📊 Found ${profiles.length} total student profiles`);

    // Analyze SEVIS IDs
    const sevisIdAnalysis = {
      totalStudents: profiles.length,
      studentsWithSevisIds: 0,
      studentsWithoutSevisIds: 0,
      studentsWithNonNewStudentTypes: 0,
      studentsNeedingSevisIds: 0,
      existingSevisIds: new Set<string>(),
      sevisIdFormats: new Map<string, number>(),
      studentsByType: new Map<string, { withSevisId: number, withoutSevisId: number }>()
    };

    // SEVIS types that should have SEVIS IDs (excluding "New Student")
    const typesThatNeedSevisIds = [
      'Validation - Housing',
      'Validation - Site of Activity',
      'Payment',
      'Bio',
      'Update - Housing',
      'Update - Site of Activity',
      'Program Date',
      'Program Extension',
      'Program Shorten',
      'Reprint',
      'Status End',
      'Status Invalid',
      'Status Terminate',
      'Update - Edit Subject',
      'Financial Info'
    ];

    for (const profile of profiles) {
      const profileData = profile.data;
      if (!profileData) continue;

      // Get SEVIS type
      let sevisType = 'New Student'; // Default
      if (profileData?.sevis_processing_type && typeof profileData.sevis_processing_type === 'string') {
        sevisType = profileData.sevis_processing_type;
      } else if (profileData?.changeType && typeof profileData.changeType === 'string') {
        sevisType = profileData.changeType;
      }

      // Get SEVIS ID
      let sevisId = '';
      if (profileData?.sevis_id && typeof profileData.sevis_id === 'string') {
        sevisId = profileData.sevis_id;
      }

      // Track SEVIS ID presence
      if (sevisId && sevisId.trim()) {
        sevisIdAnalysis.studentsWithSevisIds++;
        sevisIdAnalysis.existingSevisIds.add(sevisId);
        
        // Analyze SEVIS ID format
        const format = analyzeSevisIdFormat(sevisId);
        sevisIdAnalysis.sevisIdFormats.set(format, (sevisIdAnalysis.sevisIdFormats.get(format) || 0) + 1);
      } else {
        sevisIdAnalysis.studentsWithoutSevisIds++;
      }

      // Track by type
      if (!sevisIdAnalysis.studentsByType.has(sevisType)) {
        sevisIdAnalysis.studentsByType.set(sevisType, { withSevisId: 0, withoutSevisId: 0 });
      }
      
      const typeStats = sevisIdAnalysis.studentsByType.get(sevisType)!;
      if (sevisId && sevisId.trim()) {
        typeStats.withSevisId++;
      } else {
        typeStats.withoutSevisId++;
      }

      // Check if student needs SEVIS ID (only approved students with non-"New Student" types)
      const isApproved = profileData?.applicationStatus === 'approved';
      if (isApproved && typesThatNeedSevisIds.includes(sevisType)) {
        sevisIdAnalysis.studentsWithNonNewStudentTypes++;
        if (!sevisId || !sevisId.trim()) {
          sevisIdAnalysis.studentsNeedingSevisIds++;
        }
      }
    }

    // Display analysis results
    console.log('📊 SEVIS ID Analysis Results:');
    console.log('============================');
    console.log(`Total students: ${sevisIdAnalysis.totalStudents}`);
    console.log(`Students with SEVIS IDs: ${sevisIdAnalysis.studentsWithSevisIds}`);
    console.log(`Students without SEVIS IDs: ${sevisIdAnalysis.studentsWithoutSevisIds}`);
    console.log(`Students with non-"New Student" types: ${sevisIdAnalysis.studentsWithNonNewStudentTypes}`);
    console.log(`Students needing SEVIS IDs: ${sevisIdAnalysis.studentsNeedingSevisIds}`);

    // Show SEVIS ID formats
    console.log('\n📋 SEVIS ID Formats Found:');
    if (sevisIdAnalysis.sevisIdFormats.size > 0) {
      Array.from(sevisIdAnalysis.sevisIdFormats.entries())
        .sort(([,a], [,b]) => b - a)
        .forEach(([format, count]) => {
          console.log(`  ${format}: ${count} records`);
        });
    } else {
      console.log('  No SEVIS IDs found in database');
    }

    // Show distribution by type
    console.log('\n📋 SEVIS Type Distribution:');
    Array.from(sevisIdAnalysis.studentsByType.entries())
      .sort(([,a], [,b]) => (b.withSevisId + b.withoutSevisId) - (a.withSevisId + a.withoutSevisId))
      .forEach(([type, stats]) => {
        const total = stats.withSevisId + stats.withoutSevisId;
        const needsSevisId = typesThatNeedSevisIds.includes(type);
        const status = needsSevisId && stats.withoutSevisId > 0 ? '⚠️  NEEDS SEVIS ID' : '✅ OK';
        console.log(`  ${type}: ${total} total (${stats.withSevisId} with SEVIS ID, ${stats.withoutSevisId} without) ${status}`);
      });

    // Show sample existing SEVIS IDs
    console.log('\n📋 Sample Existing SEVIS IDs:');
    const sampleIds = Array.from(sevisIdAnalysis.existingSevisIds).slice(0, 10);
    if (sampleIds.length > 0) {
      sampleIds.forEach(id => {
        console.log(`  ${id}`);
      });
    } else {
      console.log('  No SEVIS IDs found');
    }

    // Show students who need SEVIS IDs
    if (sevisIdAnalysis.studentsNeedingSevisIds > 0) {
      console.log('\n⚠️  Students Needing SEVIS IDs:');
      let count = 0;
      for (const profile of profiles) {
        const profileData = profile.data;
        if (!profileData) continue;

        let sevisType = 'New Student';
        if (profileData?.sevis_processing_type && typeof profileData.sevis_processing_type === 'string') {
          sevisType = profileData.sevis_processing_type;
        } else if (profileData?.changeType && typeof profileData.changeType === 'string') {
          sevisType = profileData.changeType;
        }

        let sevisId = '';
        if (profileData?.sevis_id && typeof profileData.sevis_id === 'string') {
          sevisId = profileData.sevis_id;
        }

        const isApproved = profileData?.applicationStatus === 'approved';
        if (isApproved && typesThatNeedSevisIds.includes(sevisType) && (!sevisId || !sevisId.trim())) {
          const firstName = profileData?.first_name || profileData?.firstName || 'Unknown';
          const lastName = profileData?.last_name || profileData?.lastName || 'Unknown';
          const name = `${firstName} ${lastName}`.trim();
          console.log(`  ${name} (${sevisType}) - Profile ID: ${profile.id}`);
          count++;
          if (count >= 10) {
            console.log(`  ... and ${sevisIdAnalysis.studentsNeedingSevisIds - count} more`);
            break;
          }
        }
      }
    }

    console.log('\n✅ SEVIS ID analysis completed!');

  } catch (error) {
    console.error('❌ Error analyzing SEVIS IDs:', error);
    throw error;
  }
}

function analyzeSevisIdFormat(sevisId: string): string {
  if (!sevisId || typeof sevisId !== 'string') {
    return 'Invalid';
  }

  // Check for N followed by digits pattern
  if (/^N\d+$/.test(sevisId)) {
    const digitCount = sevisId.length - 1; // Subtract 1 for the 'N'
    return `N + ${digitCount} digits`;
  }

  // Check for other patterns
  if (/^[A-Z]\d+$/.test(sevisId)) {
    const letter = sevisId[0];
    const digitCount = sevisId.length - 1;
    return `${letter} + ${digitCount} digits`;
  }

  if (/^\d+$/.test(sevisId)) {
    return `${sevisId.length} digits only`;
  }

  return 'Other format';
}

// Run the script
analyzeSevisIds()
  .then(() => {
    console.log('🎉 Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 