'use client';

import { useInstantData } from './useInstantData';
import { useSeedData } from './useSeedData';

// This function can be called to analyze the data
export function analyzeSevisTypeData() {
  console.log('🔍 Analyzing SEVIS type data distribution...\n');

  // Try to get InstantDB data first
  try {
    const instantData = useInstantData();
    
    if (instantData.error) {
      console.log('❌ InstantDB not available, using fallback data');
      console.log(`Error: ${instantData.error}`);
      console.log(`Used fallback: ${instantData.usedFallback}`);
      
      // Use seed data instead
      const seedData = useSeedData();
      analyzeDataDistribution(seedData, 'Fallback Seed Data');
    } else {
      console.log('✅ Using InstantDB data');
      analyzeDataDistribution(instantData, 'InstantDB Data');
    }
  } catch (error) {
    console.log('❌ Error accessing data, using fallback');
    const seedData = useSeedData();
    analyzeDataDistribution(seedData, 'Fallback Seed Data');
  }
}

function analyzeDataDistribution(data: any, sourceName: string) {
  console.log(`\n📊 Source: ${sourceName}`);
  console.log(`📊 Found ${data.profiles?.length || 0} student profiles`);
  console.log(`📊 Found ${data.relationships?.length || 0} relationships\n`);

  if (!data.profiles || data.profiles.length === 0) {
    console.log('❌ No student profiles found.');
    return;
  }

  // Analyze source 1: studentProfile?.data?.sevis_processing_type
  console.log('📋 Source 1: studentProfile?.data?.sevis_processing_type');
  const source1Data = new Map<string, number>();
  let source1Total = 0;
  let source1Null = 0;

  data.profiles.forEach((profile: any) => {
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

  data.profiles.forEach((profile: any) => {
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

  if (data.relationships) {
    data.relationships.forEach((relationship: any) => {
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

  data.profiles.forEach((profile: any) => {
    let type = 'New Student'; // Default
    
    // Apply the same logic as in the UI
    if (profile.data?.sevis_processing_type) {
      type = String(profile.data.sevis_processing_type);
    } else if (profile.data?.changeType) {
      type = String(profile.data.changeType);
    } else {
      // Check relationships for this student
      const studentRelationships = data.relationships?.filter((r: any) => r.secondaryId === profile.id) || [];
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
}

// Export for use in browser console or other scripts
if (typeof window !== 'undefined') {
  (window as any).analyzeSevisTypeData = analyzeSevisTypeData;
} 