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

// Valid SEVIS change types from the UI
const VALID_SEVIS_TYPES = [
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

// Mapping of invalid types to valid types
const TYPE_MAPPING: Record<string, string> = {
  // Business-specific change types that should map to standard SEVIS types
  'Address Change': 'Update - Housing',
  'Data Correction': 'Bio',
  'Transfer': 'Program Extension',
  'Program Change': 'Program Extension',
  'Host Family Change': 'Update - Housing',
  'School Change': 'Update - Site of Activity',
  'Document Update': 'Bio',
  'Status Update': 'Status Invalid',
  'Payment Update': 'Payment',
  'Extension Request': 'Program Extension',
  'Early Termination': 'Status Terminate',
  'Reactivation': 'New Student',
  'Replacement': 'Reprint',
  'Correction': 'Bio',
  'Amendment': 'Bio',
  'Cancellation': 'Status End',
  'Withdrawal': 'Status End',
  'Suspension': 'Status Invalid',
  'Reinstatement': 'New Student',
  'Change of Status': 'Program Extension',
  'Program Modification': 'Program Extension',
  'Academic Update': 'Update - Edit Subject',
  'Financial Update': 'Financial Info',
  'Housing Update': 'Update - Housing',
  'Activity Update': 'Update - Site of Activity',
  'Date Change': 'Program Date',
  'Duration Change': 'Program Extension',
  'Location Change': 'Update - Site of Activity',
  'Sponsor Change': 'Program Extension',
  'Category Change': 'Program Extension',
  'Status Correction': 'Status Invalid',
  'Record Update': 'Bio',
  'Information Update': 'Bio',
  'Document Correction': 'Bio',
  'Address Update': 'Update - Housing',
  'Contact Update': 'Bio',
  'Emergency Contact Update': 'Bio',
  'Passport Update': 'Bio',
  'Visa Update': 'Bio',
  'Insurance Update': 'Financial Info',
  'Academic Program Change': 'Update - Edit Subject',
  'Work Assignment Change': 'Update - Site of Activity',
  'Training Program Change': 'Update - Edit Subject',
  'Internship Change': 'Update - Site of Activity',
  'Employment Change': 'Update - Site of Activity',
  'Study Program Change': 'Update - Edit Subject',
  'Cultural Program Change': 'Update - Edit Subject',
  'Exchange Program Change': 'Program Extension',
  'Student Program Change': 'Program Extension',
  'Participant Program Change': 'Program Extension',
  'Exchange Student Change': 'Program Extension',
  'Cultural Exchange Change': 'Program Extension',
  'Educational Program Change': 'Update - Edit Subject',
  'Academic Exchange Change': 'Program Extension',
  'Student Exchange Change': 'Program Extension',
  'International Student Change': 'Program Extension',
  'Foreign Student Change': 'Program Extension',
  'Exchange Participant Change': 'Program Extension',
  'Cultural Participant Change': 'Program Extension',
  'Educational Participant Change': 'Program Extension',
  'Academic Participant Change': 'Program Extension',
  'Student Participant Change': 'Program Extension',
  'International Participant Change': 'Program Extension',
  'Foreign Participant Change': 'Program Extension',
  'Exchange Program Update': 'Program Extension',
  'Cultural Program Update': 'Program Extension',
  'Educational Program Update': 'Update - Edit Subject',
  'Academic Program Update': 'Update - Edit Subject',
  'Student Program Update': 'Program Extension',
  'Participant Program Update': 'Program Extension',
  'Exchange Student Update': 'Program Extension',
  'Cultural Exchange Update': 'Program Extension',
  'Educational Exchange Update': 'Program Extension',
  'Academic Exchange Update': 'Program Extension',
  'Student Exchange Update': 'Program Extension',
  'International Student Update': 'Program Extension',
  'Foreign Student Update': 'Program Extension',
  'Exchange Participant Update': 'Program Extension',
  'Cultural Participant Update': 'Program Extension',
  'Educational Participant Update': 'Program Extension',
  'Academic Participant Update': 'Program Extension',
  'Student Participant Update': 'Program Extension',
  'International Participant Update': 'Program Extension',
  'Foreign Participant Update': 'Program Extension'
};

async function fixInvalidSevisTypes() {
  try {
    console.log('🔍 Analyzing SEVIS types in profiles...');
    
    // Get all student profiles using InstantDB admin client
    const result = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      }
    });
    
    const profiles = result.profiles || [];
    console.log(`📊 Found ${profiles.length} student profiles`);
    
    let totalUpdated = 0;
    let invalidTypesFound: Record<string, number> = {};
    let mappingApplied: Record<string, number> = {};
    
    for (const profile of profiles) {
      const profileData = profile.data as any;
      let needsUpdate = false;
      let originalType = '';
      let newType = '';
      
      // Check sevis_processing_type
      if (profileData?.sevis_processing_type && typeof profileData.sevis_processing_type === 'string') {
        originalType = profileData.sevis_processing_type;
        
        if (!VALID_SEVIS_TYPES.includes(originalType)) {
          // Count invalid type
          invalidTypesFound[originalType] = (invalidTypesFound[originalType] || 0) + 1;
          
          // Find mapping
          const mappedType = TYPE_MAPPING[originalType];
          if (mappedType) {
            newType = mappedType;
            mappingApplied[`${originalType} → ${mappedType}`] = (mappingApplied[`${originalType} → ${mappedType}`] || 0) + 1;
            needsUpdate = true;
          } else {
            // No mapping found, default to "New Student"
            newType = 'New Student';
            mappingApplied[`${originalType} → New Student (default)`] = (mappingApplied[`${originalType} → New Student (default)`] || 0) + 1;
            needsUpdate = true;
          }
        }
      }
      
      // Check changeType
      if (!needsUpdate && profileData?.changeType && typeof profileData.changeType === 'string') {
        originalType = profileData.changeType;
        
        if (!VALID_SEVIS_TYPES.includes(originalType)) {
          // Count invalid type
          invalidTypesFound[originalType] = (invalidTypesFound[originalType] || 0) + 1;
          
          // Find mapping
          const mappedType = TYPE_MAPPING[originalType];
          if (mappedType) {
            newType = mappedType;
            mappingApplied[`${originalType} → ${mappedType}`] = (mappingApplied[`${originalType} → ${mappedType}`] || 0) + 1;
            needsUpdate = true;
          } else {
            // No mapping found, default to "New Student"
            newType = 'New Student';
            mappingApplied[`${originalType} → New Student (default)`] = (mappingApplied[`${originalType} → New Student (default)`] || 0) + 1;
            needsUpdate = true;
          }
        }
      }
      
      // Update the profile if needed
      if (needsUpdate) {
        const updatedData = { ...profileData };
        
        // Update the field that was invalid
        if (profileData?.sevis_processing_type && !VALID_SEVIS_TYPES.includes(profileData.sevis_processing_type)) {
          updatedData.sevis_processing_type = newType;
        }
        if (profileData?.changeType && !VALID_SEVIS_TYPES.includes(profileData.changeType)) {
          updatedData.changeType = newType;
        }
        
        // Update the profile using InstantDB admin client
        await db.transact([
          (db.tx as any).profiles[profile.id].update({
            data: updatedData
          })
        ]);
        
        totalUpdated++;
        
        if (totalUpdated % 10 === 0) {
          console.log(`✅ Updated ${totalUpdated} profiles...`);
        }
      }
    }
    
    console.log('\n📈 Analysis Results:');
    console.log('==================');
    console.log(`Total profiles processed: ${profiles.length}`);
    console.log(`Total profiles updated: ${totalUpdated}`);
    
    if (Object.keys(invalidTypesFound).length > 0) {
      console.log('\n🚨 Invalid SEVIS types found:');
      Object.entries(invalidTypesFound)
        .sort(([,a], [,b]) => b - a)
        .forEach(([type, count]) => {
          console.log(`  ${type}: ${count} records`);
        });
    }
    
    if (Object.keys(mappingApplied).length > 0) {
      console.log('\n🔄 Type mappings applied:');
      Object.entries(mappingApplied)
        .sort(([,a], [,b]) => b - a)
        .forEach(([mapping, count]) => {
          console.log(`  ${mapping}: ${count} records`);
        });
    }
    
    // Show final distribution
    console.log('\n📊 Final SEVIS type distribution:');
    const finalDistribution: Record<string, number> = {};
    
    for (const profile of profiles) {
      const profileData = profile.data as any;
      let type = 'New Student'; // Default
      
      if (profileData?.sevis_processing_type && VALID_SEVIS_TYPES.includes(profileData.sevis_processing_type)) {
        type = profileData.sevis_processing_type;
      } else if (profileData?.changeType && VALID_SEVIS_TYPES.includes(profileData.changeType)) {
        type = profileData.changeType;
      }
      
      finalDistribution[type] = (finalDistribution[type] || 0) + 1;
    }
    
    Object.entries(finalDistribution)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        const percentage = ((count / profiles.length) * 100).toFixed(1);
        console.log(`  ${type}: ${count} records (${percentage}%)`);
      });
    
    console.log('\n✅ Database cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    throw error;
  }
}

// Run the script
fixInvalidSevisTypes()
  .then(() => {
    console.log('🎉 Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 