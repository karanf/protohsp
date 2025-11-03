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

// SEVIS types to distribute (excluding "New Student")
const SEVIS_TYPES = [
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

// Weighted distribution for more realistic data
const TYPE_WEIGHTS: Record<string, number> = {
  'Program Extension': 25,      // Most common - program changes
  'Bio': 20,                    // Common - data updates
  'Update - Site of Activity': 15, // Common - school/location changes
  'Update - Housing': 12,       // Common - host family changes
  'Payment': 8,                 // Moderate - payment updates
  'Validation - Housing': 5,    // Less common - validation
  'Validation - Site of Activity': 5, // Less common - validation
  'Update - Edit Subject': 4,   // Less common - academic changes
  'Financial Info': 3,          // Less common - financial updates
  'Program Date': 2,            // Rare - date changes
  'Reprint': 2,                 // Rare - document reprints
  'Status End': 2,              // Rare - program termination
  'Status Invalid': 1,          // Very rare - status issues
  'Status Terminate': 1,        // Very rare - termination
  'Program Shorten': 1          // Very rare - program shortening
};

// Calculate total weight for distribution
const TOTAL_WEIGHT = Object.values(TYPE_WEIGHTS).reduce((sum, weight) => sum + weight, 0);

// Function to get weighted random SEVIS type
function getWeightedRandomType(): string {
  const random = Math.random() * TOTAL_WEIGHT;
  let cumulativeWeight = 0;
  
  for (const [type, weight] of Object.entries(TYPE_WEIGHTS)) {
    cumulativeWeight += weight;
    if (random <= cumulativeWeight) {
      return type;
    }
  }
  
  // Fallback to most common type
  return 'Program Extension';
}

// Function to get deterministic type based on student index (for consistent results)
function getDeterministicType(studentIndex: number): string {
  // Use modulo to cycle through types based on weights
  const normalizedIndex = studentIndex % TOTAL_WEIGHT;
  let cumulativeWeight = 0;
  
  for (const [type, weight] of Object.entries(TYPE_WEIGHTS)) {
    cumulativeWeight += weight;
    if (normalizedIndex < cumulativeWeight) {
      return type;
    }
  }
  
  return 'Program Extension';
}

async function distributeSevisTypes() {
  try {
    console.log('🔄 Distributing SEVIS types across students...\n');
    
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

    // Filter for students who should get SEVIS types (change queue or successfully processed)
    const eligibleProfiles = profiles.filter((profile: any) => {
      const profileData = profile.data;
      if (!profileData) return false;
      
      // Include students in change queue
      if (profileData.hasPendingChanges === true) return true;
      
      // Include students with successful SEVIS processing
      if (profileData.sevisStatus === 'sevis_approved') return true;
      
      // Include students in SEVIS queue or submitted
      if (profileData.sevisStatus === 'in_sevis_queue' || 
          profileData.sevisStatus === 'submitted_to_sevis') return true;
      
      return false;
    });

    console.log(`📋 Found ${eligibleProfiles.length} eligible students for SEVIS type distribution`);
    console.log(`   - Students in change queue or with SEVIS activity`);

    if (eligibleProfiles.length === 0) {
      console.log('❌ No eligible students found for SEVIS type distribution.');
      return;
    }

    // Analyze current distribution
    console.log('\n📊 Current SEVIS type distribution:');
    const currentDistribution: Record<string, number> = {};
    let newStudentCount = 0;
    let otherTypesCount = 0;

    eligibleProfiles.forEach((profile: any) => {
      const profileData = profile.data;
      let currentType = 'New Student'; // Default
      
      if (profileData?.sevis_processing_type && SEVIS_TYPES.includes(profileData.sevis_processing_type)) {
        currentType = profileData.sevis_processing_type;
      } else if (profileData?.changeType && SEVIS_TYPES.includes(profileData.changeType)) {
        currentType = profileData.changeType;
      }
      
      if (currentType === 'New Student') {
        newStudentCount++;
      } else {
        otherTypesCount++;
        currentDistribution[currentType] = (currentDistribution[currentType] || 0) + 1;
      }
    });

    console.log(`   "New Student": ${newStudentCount} records`);
    Object.entries(currentDistribution)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`   "${type}": ${count} records`);
      });

    // Distribute SEVIS types
    console.log('\n🔄 Distributing SEVIS types...');
    const transactions = [];
    let updatedCount = 0;
    const newDistribution: Record<string, number> = {};

    for (const [index, profile] of eligibleProfiles.entries()) {
      const profileData = profile.data;
      if (!profileData) continue;

      // Skip if already has a valid SEVIS type (not "New Student")
      const currentSevisType = profileData.sevis_processing_type || profileData.changeType;
      if (currentSevisType && SEVIS_TYPES.includes(currentSevisType)) {
        continue; // Already has a valid type
      }

      // Get new SEVIS type (deterministic for consistent results)
      const newSevisType = getDeterministicType(index);
      
      // Update the profile data
      const updatedData = {
        ...profileData,
        sevis_processing_type: newSevisType,
        changeType: newSevisType, // Update both fields for consistency
        updated_at: new Date().toISOString()
      };

      // Create transaction
      transactions.push(
        (db.tx as any).profiles[profile.id].update({
          data: updatedData
        })
      );

      newDistribution[newSevisType] = (newDistribution[newSevisType] || 0) + 1;
      updatedCount++;

      // Process in batches
      if (transactions.length >= 20) {
        await db.transact(transactions);
        console.log(`✅ Updated ${updatedCount} profiles so far...`);
        transactions.length = 0;
        
        // Add delay between batches
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Process remaining transactions
    if (transactions.length > 0) {
      await db.transact(transactions);
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} profiles!`);

    // Show final distribution
    console.log('\n📊 Final SEVIS type distribution:');
    const finalDistribution: Record<string, number> = {};
    let finalNewStudentCount = 0;

    eligibleProfiles.forEach((profile: any) => {
      const profileData = profile.data;
      let finalType = 'New Student'; // Default
      
      if (profileData?.sevis_processing_type && SEVIS_TYPES.includes(profileData.sevis_processing_type)) {
        finalType = profileData.sevis_processing_type;
      } else if (profileData?.changeType && SEVIS_TYPES.includes(profileData.changeType)) {
        finalType = profileData.changeType;
      }
      
      if (finalType === 'New Student') {
        finalNewStudentCount++;
      } else {
        finalDistribution[finalType] = (finalDistribution[finalType] || 0) + 1;
      }
    });

    console.log(`   "New Student": ${finalNewStudentCount} records`);
    Object.entries(finalDistribution)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        const percentage = ((count / eligibleProfiles.length) * 100).toFixed(1);
        console.log(`   "${type}": ${count} records (${percentage}%)`);
      });

    // Show distribution by SEVIS status
    console.log('\n📊 Distribution by SEVIS Status:');
    const statusDistribution: Record<string, Record<string, number>> = {};
    
    eligibleProfiles.forEach((profile: any) => {
      const profileData = profile.data;
      const sevisStatus = profileData?.sevisStatus || 'unknown';
      let sevisType = 'New Student';
      
      if (profileData?.sevis_processing_type && SEVIS_TYPES.includes(profileData.sevis_processing_type)) {
        sevisType = profileData.sevis_processing_type;
      } else if (profileData?.changeType && SEVIS_TYPES.includes(profileData.changeType)) {
        sevisType = profileData.changeType;
      }
      
      if (!statusDistribution[sevisStatus]) {
        statusDistribution[sevisStatus] = {};
      }
      statusDistribution[sevisStatus][sevisType] = (statusDistribution[sevisStatus][sevisType] || 0) + 1;
    });

    Object.entries(statusDistribution).forEach(([status, types]) => {
      console.log(`\n   ${status}:`);
      Object.entries(types)
        .sort(([,a], [,b]) => b - a)
        .forEach(([type, count]) => {
          console.log(`     "${type}": ${count} records`);
        });
    });

    console.log('\n✅ SEVIS type distribution completed successfully!');

  } catch (error) {
    console.error('❌ Error distributing SEVIS types:', error);
    throw error;
  }
}

// Run the script
distributeSevisTypes()
  .then(() => {
    console.log('🎉 Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 