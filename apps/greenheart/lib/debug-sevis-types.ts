'use client';

import { useInstantData } from './useInstantData';
import { useSeedData } from './useSeedData';

export function debugSevisTypes() {
  console.log('🔍 Debugging SEVIS type data...\n');

  // Try InstantDB first
  const instantData = useInstantData();
  
  if (instantData.error) {
    console.log('❌ InstantDB Error:', instantData.error);
    console.log('📊 Using fallback data...\n');
    
    const seedData = useSeedData();
    analyzeSevisTypes(seedData, 'Fallback Seed Data');
  } else {
    console.log('✅ InstantDB connected successfully');
    console.log(`📊 Found ${instantData.users?.length || 0} users`);
    console.log(`📊 Found ${instantData.profiles?.length || 0} profiles`);
    console.log(`📊 Found ${instantData.relationships?.length || 0} relationships\n`);
    
    analyzeSevisTypes(instantData, 'InstantDB Data');
  }
}

function analyzeSevisTypes(data: any, sourceName: string) {
  console.log(`📋 Analyzing: ${sourceName}`);
  
  if (!data.profiles || data.profiles.length === 0) {
    console.log('❌ No profiles found');
    return;
  }

  // Count profiles by type
  const profileTypes = new Map<string, number>();
  data.profiles.forEach((profile: any) => {
    const type = profile.type || 'unknown';
    profileTypes.set(type, (profileTypes.get(type) || 0) + 1);
  });

  console.log('📊 Profile Types:');
  profileTypes.forEach((count, type) => {
    console.log(`   ${type}: ${count} profiles`);
  });

  // Focus on student profiles
  const studentProfiles = data.profiles.filter((p: any) => p.type === 'student');
  console.log(`\n📊 Student Profiles: ${studentProfiles.length}`);

  if (studentProfiles.length === 0) {
    console.log('❌ No student profiles found');
    return;
  }

  // Analyze the three data sources
  console.log('\n📋 SEVIS Type Data Sources:');

  // Source 1: profile.data.sevis_processing_type
  const source1Count = studentProfiles.filter((p: any) => p.data?.sevis_processing_type).length;
  console.log(`   Source 1 (profile.data.sevis_processing_type): ${source1Count} records`);

  // Source 2: profile.data.changeType  
  const source2Count = studentProfiles.filter((p: any) => p.data?.changeType).length;
  console.log(`   Source 2 (profile.data.changeType): ${source2Count} records`);

  // Source 3: relationship.data.sevis_processing_type
  const relationships = data.relationships || [];
  const source3Count = relationships.filter((r: any) => r.data?.sevis_processing_type).length;
  console.log(`   Source 3 (relationship.data.sevis_processing_type): ${source3Count} records`);

  // Show sample data
  console.log('\n📋 Sample Data:');
  
  // Sample profile data
  const sampleProfile = studentProfiles[0];
  if (sampleProfile) {
    console.log('Sample Profile Data Keys:', Object.keys(sampleProfile.data || {}));
    console.log('Sample Profile Data:', JSON.stringify(sampleProfile.data, null, 2));
  }

  // Sample relationship data
  if (relationships.length > 0) {
    const sampleRelationship = relationships[0];
    console.log('\nSample Relationship Data Keys:', Object.keys(sampleRelationship.data || {}));
    console.log('Sample Relationship Data:', JSON.stringify(sampleRelationship.data, null, 2));
  }

  // Calculate final types
  console.log('\n📋 Final Type Distribution:');
  const finalTypes = new Map<string, number>();

  studentProfiles.forEach((profile: any) => {
    let type = 'New Student'; // Default
    
    // Apply UI logic
    if (profile.data?.sevis_processing_type) {
      type = String(profile.data.sevis_processing_type);
    } else if (profile.data?.changeType) {
      type = String(profile.data.changeType);
    } else {
      // Check relationships
      const studentRelationships = relationships.filter((r: any) => r.secondaryId === profile.id);
      const orgRelationship = studentRelationships.find((r: any) => r.type === 'sending_org_student');
      if (orgRelationship?.data?.sevis_processing_type) {
        type = String(orgRelationship.data.sevis_processing_type);
      }
    }

    // Validate
    const validTypes = [
      'New Student', 'Validation - Housing', 'Validation - Site of Activity', 'Payment',
      'Bio', 'Update - Housing', 'Update - Site of Activity', 'Program Date',
      'Program Extension', 'Program Shorten', 'Reprint', 'Status End',
      'Status Invalid', 'Status Terminate', 'Update - Edit Subject', 'Financial Info'
    ];

    if (!validTypes.includes(type)) {
      type = 'New Student';
    }

    finalTypes.set(type, (finalTypes.get(type) || 0) + 1);
  });

  finalTypes.forEach((count, type) => {
    const percentage = ((count / studentProfiles.length) * 100).toFixed(1);
    console.log(`   "${type}": ${count} records (${percentage}%)`);
  });

  console.log(`\n📊 Summary: ${finalTypes.size} different types found`);
}

// Make it available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).debugSevisTypes = debugSevisTypes;
} 