import { init } from '@instantdb/admin';
import dotenv from 'dotenv';

// Load environment variables - EXACT pattern from lessons learned
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

const db = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

async function analyzeValidationRejections() {
  console.log('🔍 Analyzing SEVIS type validation rejections...\n');

  try {
    // Query all profiles and relationships
    const result = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      },
      relationships: {
        $: {
          where: {
            type: 'sending_org_student'
          }
        }
      }
    });

    // Filter for approved students only
    const approvedProfiles = result.profiles?.filter((profile: any) => 
      profile.data?.applicationStatus === 'approved'
    ) || [];
    
    const approvedProfileIds = new Set(approvedProfiles.map((p: any) => p.id));
    const approvedRelationships = result.relationships?.filter((rel: any) => 
      approvedProfileIds.has(rel.secondaryId)
    ) || [];

    console.log(`📊 Found ${approvedProfiles.length} APPROVED student profiles\n`);

    if (approvedProfiles.length === 0) {
      console.log('❌ No approved student profiles found.');
      return;
    }

    // Define the valid SEVIS types from the UI code
    const validSevisTypes = [
      'New Student',
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

    console.log('📋 Valid SEVIS Types (from UI validation):');
    validSevisTypes.forEach((type, index) => {
      console.log(`   ${index + 1}. "${type}"`);
    });
    console.log('');

    // Analyze source 1: sevis_processing_type
    console.log('📋 Source 1: studentProfile?.data?.sevis_processing_type');
    const source1Data = new Map<string, number>();
    const source1Rejected = new Map<string, number>();
    let source1Total = 0;
    let source1Valid = 0;
    let source1Invalid = 0;

    approvedProfiles.forEach((profile: any) => {
      const type = profile.data?.sevis_processing_type;
      if (type) {
        source1Total++;
        if (validSevisTypes.includes(type)) {
          source1Data.set(type, (source1Data.get(type) || 0) + 1);
          source1Valid++;
        } else {
          source1Rejected.set(type, (source1Rejected.get(type) || 0) + 1);
          source1Invalid++;
        }
      }
    });

    console.log(`   Total records with data: ${source1Total}`);
    console.log(`   Valid records: ${source1Valid} (${((source1Valid / source1Total) * 100).toFixed(1)}%)`);
    console.log(`   Invalid records: ${source1Invalid} (${((source1Invalid / source1Total) * 100).toFixed(1)}%)`);
    
    console.log('\n   Valid types distribution:');
    if (source1Data.size > 0) {
      Array.from(source1Data.entries())
        .sort((a, b) => b[1] - a[1]) // Sort by count descending
        .forEach(([type, count]) => {
          console.log(`     "${type}": ${count} records`);
        });
    } else {
      console.log('     No valid types found');
    }

    console.log('\n   REJECTED types:');
    if (source1Rejected.size > 0) {
      Array.from(source1Rejected.entries())
        .sort((a, b) => b[1] - a[1]) // Sort by count descending
        .forEach(([type, count]) => {
          console.log(`     ❌ "${type}": ${count} records (will become "New Student")`);
        });
    } else {
      console.log('     No rejected types found');
    }
    console.log('');

    // Analyze source 2: changeType
    console.log('📋 Source 2: studentProfile?.data?.changeType');
    const source2Data = new Map<string, number>();
    const source2Rejected = new Map<string, number>();
    let source2Total = 0;
    let source2Valid = 0;
    let source2Invalid = 0;

    approvedProfiles.forEach((profile: any) => {
      const type = profile.data?.changeType;
      if (type) {
        source2Total++;
        if (validSevisTypes.includes(type)) {
          source2Data.set(type, (source2Data.get(type) || 0) + 1);
          source2Valid++;
        } else {
          source2Rejected.set(type, (source2Rejected.get(type) || 0) + 1);
          source2Invalid++;
        }
      }
    });

    console.log(`   Total records with data: ${source2Total}`);
    console.log(`   Valid records: ${source2Valid} (${((source2Valid / source2Total) * 100).toFixed(1)}%)`);
    console.log(`   Invalid records: ${source2Invalid} (${((source2Invalid / source2Total) * 100).toFixed(1)}%)`);
    
    console.log('\n   Valid types distribution:');
    if (source2Data.size > 0) {
      Array.from(source2Data.entries())
        .sort((a, b) => b[1] - a[1]) // Sort by count descending
        .forEach(([type, count]) => {
          console.log(`     "${type}": ${count} records`);
        });
    } else {
      console.log('     No valid types found');
    }

    console.log('\n   REJECTED types:');
    if (source2Rejected.size > 0) {
      Array.from(source2Rejected.entries())
        .sort((a, b) => b[1] - a[1]) // Sort by count descending
        .forEach(([type, count]) => {
          console.log(`     ❌ "${type}": ${count} records (will become "New Student")`);
        });
    } else {
      console.log('     No rejected types found');
    }
    console.log('');

    // Analyze final type values that would be used in the UI
    console.log('📋 Final Type Values (as used in UI):');
    const finalTypeData = new Map<string, number>();
    const rejectedTypes = new Map<string, number>();
    let finalTypeTotal = 0;

    approvedProfiles.forEach((profile: any) => {
      let type = 'New Student'; // Default
      let originalType = '';
      
      // Apply the same logic as in the UI
      if (profile.data?.sevis_processing_type) {
        originalType = String(profile.data.sevis_processing_type);
        if (validSevisTypes.includes(originalType)) {
          type = originalType;
        }
      } else if (profile.data?.changeType) {
        originalType = String(profile.data.changeType);
        if (validSevisTypes.includes(originalType)) {
          type = originalType;
        }
      } else {
        // Check relationships for this student
        const studentRelationships = approvedRelationships?.filter((r: any) => r.secondaryId === profile.id) || [];
        const orgRelationship = studentRelationships.find((r: any) => r.type === 'sending_org_student');
        if (orgRelationship?.data?.sevis_processing_type) {
          originalType = String(orgRelationship.data.sevis_processing_type);
          if (validSevisTypes.includes(originalType)) {
            type = originalType;
          }
        }
      }

      finalTypeData.set(type, (finalTypeData.get(type) || 0) + 1);
      
      // Track rejected types
      if (originalType && !validSevisTypes.includes(originalType)) {
        rejectedTypes.set(originalType, (rejectedTypes.get(originalType) || 0) + 1);
      }
      
      finalTypeTotal++;
    });

    console.log(`   Total records: ${finalTypeTotal}`);
    console.log('   Final distribution:');
    Array.from(finalTypeData.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .forEach(([type, count]) => {
        const percentage = ((count / finalTypeTotal) * 100).toFixed(1);
        console.log(`     "${type}": ${count} records (${percentage}%)`);
      });

    console.log('\n   Summary of rejected types:');
    if (rejectedTypes.size > 0) {
      Array.from(rejectedTypes.entries())
        .sort((a, b) => b[1] - a[1]) // Sort by count descending
        .forEach(([type, count]) => {
          console.log(`     ❌ "${type}": ${count} records → converted to "New Student"`);
        });
    } else {
      console.log('     No types were rejected');
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`- Source 1 valid: ${source1Valid}/${source1Total} (${((source1Valid / source1Total) * 100).toFixed(1)}%)`);
    console.log(`- Source 2 valid: ${source2Valid}/${source2Total} (${((source2Valid / source2Total) * 100).toFixed(1)}%)`);
    console.log(`- Final UI types: ${finalTypeData.size} different types`);
    console.log(`- Rejected types: ${rejectedTypes.size} different invalid types`);

  } catch (error) {
    console.error('❌ Error analyzing validation rejections:', error);
  }
}

// Run the analysis
analyzeValidationRejections()
  .then(() => {
    console.log('\n✅ Validation rejection analysis completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to analyze validation rejections:', error);
    process.exit(1);
  }); 