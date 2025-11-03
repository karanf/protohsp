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

async function analyzeSevisTypeData() {
  console.log('🔍 Analyzing SEVIS type data distribution...\n');

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

    console.log(`📊 Found ${result.profiles?.length || 0} total student profiles`);
    console.log(`📊 Found ${approvedProfiles.length} APPROVED student profiles`);
    console.log(`📊 Found ${result.relationships?.length || 0} total relationships`);
    console.log(`📊 Found ${approvedRelationships.length} relationships for approved students\n`);

    if (approvedProfiles.length === 0) {
      console.log('❌ No approved student profiles found.');
      return;
    }

    // Use approved data for analysis
    const profilesToAnalyze = approvedProfiles;
    const relationshipsToAnalyze = approvedRelationships;

    // Analyze source 1: studentProfile?.data?.sevis_processing_type
    console.log('📋 Source 1: studentProfile?.data?.sevis_processing_type');
    const source1Data = new Map<string, number>();
    let source1Total = 0;
    let source1Null = 0;

    profilesToAnalyze.forEach((profile: any) => {
      const type = profile.data?.sevis_processing_type;
      if (type) {
        source1Data.set(type, (source1Data.get(type) || 0) + 1);
        source1Total++;
      } else {
        source1Null++;
      }
    });

    console.log(`   Total records with data: ${source1Total}`);
    console.log(`   Total records with null/undefined: ${source1Null}`);
    console.log('   Distribution:');
    if (source1Data.size > 0) {
      Array.from(source1Data.entries())
        .sort((a, b) => b[1] - a[1]) // Sort by count descending
        .forEach(([type, count]) => {
          console.log(`     "${type}": ${count} records`);
        });
    } else {
      console.log('     No data found');
    }
    console.log('');

    // Analyze source 2: studentProfile?.data?.changeType
    console.log('📋 Source 2: studentProfile?.data?.changeType');
    const source2Data = new Map<string, number>();
    let source2Total = 0;
    let source2Null = 0;

    profilesToAnalyze.forEach((profile: any) => {
      const type = profile.data?.changeType;
      if (type) {
        source2Data.set(type, (source2Data.get(type) || 0) + 1);
        source2Total++;
      } else {
        source2Null++;
      }
    });

    console.log(`   Total records with data: ${source2Total}`);
    console.log(`   Total records with null/undefined: ${source2Null}`);
    console.log('   Distribution:');
    if (source2Data.size > 0) {
      Array.from(source2Data.entries())
        .sort((a, b) => b[1] - a[1]) // Sort by count descending
        .forEach(([type, count]) => {
          console.log(`     "${type}": ${count} records`);
        });
    } else {
      console.log('     No data found');
    }
    console.log('');

    // Analyze source 3: orgRelationship?.data?.sevis_processing_type
    console.log('📋 Source 3: orgRelationship?.data?.sevis_processing_type');
    const source3Data = new Map<string, number>();
    let source3Total = 0;
    let source3Null = 0;

    if (relationshipsToAnalyze) {
      relationshipsToAnalyze.forEach((relationship: any) => {
        const type = relationship.data?.sevis_processing_type;
        if (type) {
          source3Data.set(type, (source3Data.get(type) || 0) + 1);
          source3Total++;
        } else {
          source3Null++;
        }
      });
    }

    console.log(`   Total records with data: ${source3Total}`);
    console.log(`   Total records with null/undefined: ${source3Null}`);
    console.log('   Distribution:');
    if (source3Data.size > 0) {
      Array.from(source3Data.entries())
        .sort((a, b) => b[1] - a[1]) // Sort by count descending
        .forEach(([type, count]) => {
          console.log(`     "${type}": ${count} records`);
        });
    } else {
      console.log('     No data found');
    }
    console.log('');

    // Analyze final type values that would be used in the UI
    console.log('📋 Final Type Values (as used in UI):');
    const finalTypeData = new Map<string, number>();
    let finalTypeTotal = 0;

    profilesToAnalyze.forEach((profile: any) => {
      let type = 'New Student'; // Default
      
      // Apply the same logic as in the UI
      if (profile.data?.sevis_processing_type) {
        type = String(profile.data.sevis_processing_type);
      } else if (profile.data?.changeType) {
        type = String(profile.data.changeType);
      } else {
        // Check relationships for this student
        const studentRelationships = relationshipsToAnalyze?.filter((r: any) => r.secondaryId === profile.id) || [];
        const orgRelationship = studentRelationships.find((r: any) => r.type === 'sending_org_student');
        if (orgRelationship?.data?.sevis_processing_type) {
          type = String(orgRelationship.data.sevis_processing_type);
        }
      }

      // Validate against valid SEVIS types
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

      if (!validSevisTypes.includes(type)) {
        type = 'New Student';
      }

      finalTypeData.set(type, (finalTypeData.get(type) || 0) + 1);
      finalTypeTotal++;
    });

    console.log(`   Total records: ${finalTypeTotal}`);
    console.log('   Distribution:');
    Array.from(finalTypeData.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .forEach(([type, count]) => {
        const percentage = ((count / finalTypeTotal) * 100).toFixed(1);
        console.log(`     "${type}": ${count} records (${percentage}%)`);
      });

    // Summary
    console.log('\n📊 Summary:');
    console.log(`- Source 1 (profile.sevis_processing_type): ${source1Total} records with data`);
    console.log(`- Source 2 (profile.changeType): ${source2Total} records with data`);
    console.log(`- Source 3 (relationship.sevis_processing_type): ${source3Total} records with data`);
    console.log(`- Final UI values: ${finalTypeData.size} different types`);

    // Show sample data
    if (profilesToAnalyze.length > 0) {
      console.log('\n📋 Sample Profile Data (Approved Student):');
      const sampleProfile = profilesToAnalyze[0]!;
      console.log('Data keys:', Object.keys(sampleProfile.data || {}));
      console.log('Sample data:', JSON.stringify(sampleProfile.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Error analyzing SEVIS type data:', error);
  }
}

// Run the analysis
analyzeSevisTypeData()
  .then(() => {
    console.log('\n✅ SEVIS type data analysis completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to analyze SEVIS type data:', error);
    process.exit(1);
  }); 