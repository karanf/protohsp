#!/usr/bin/env node

/**
 * Partner Assessment Structure Update Script
 * 
 * This script updates SEVIS students to have the correct partner assessment structure
 * that matches the application form. The data is organized as:
 * 
 * profiles.data.partnerAssessment: {
 *   interview: { ... },
 *   specialRequests: { ... },
 *   directPlacement: { ... },
 *   studentEvaluation: { ... },
 *   englishComprehension: { ... }
 * }
 * 
 * This nested structure allows for future sections to be added at the same level:
 * - profiles.data.personalInformation: { ... }
 * - profiles.data.academicInformation: { ... }
 * - profiles.data.partnerAssessment: { ... }
 * - profiles.data.otherSections: { ... }
 * 
 * Legacy fields are maintained during transition for backward compatibility.
 */

import { init, tx, id } from '@instantdb/admin';
import dotenv from 'dotenv';

// Load .env files
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

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

// Default partner assessment structure matching the form
function createPartnerAssessmentStructure(existingData?: any) {
  const existing = existingData || {};
  
  // Check for existing partner assessment data or legacy flat structure
  const partnerData = existing.partnerAssessment || existing;
  
  return {
    interview: {
      length: partnerData.interview?.length || '',
      date: partnerData.interview?.date || '',
      interviewer: partnerData.interview?.interviewer || '',
      studentGradeLevel: partnerData.interview?.studentGradeLevel || '',
      recommendedGrade: partnerData.interview?.recommendedGrade || '',
      gpa: partnerData.interview?.gpa || ''
    },
    specialRequests: {
      stateChoice1: partnerData.specialRequests?.stateChoice1 || partnerData.preferredStates?.[0] || '',
      stateChoice2: partnerData.specialRequests?.stateChoice2 || partnerData.preferredStates?.[1] || '',
      stateChoice3: partnerData.specialRequests?.stateChoice3 || partnerData.preferredStates?.[2] || '',
      warmStateRequest: partnerData.specialRequests?.warmStateRequest || false,
      urbanSuburban: partnerData.specialRequests?.urbanSuburban || false,
      mountainStateRequest: partnerData.specialRequests?.mountainStateRequest || false
    },
    directPlacement: {
      isDirectPlacement: partnerData.directPlacement?.isDirectPlacement || false,
      hostFamily: {
        name: partnerData.directPlacement?.hostFamily?.name || '',
        phone: partnerData.directPlacement?.hostFamily?.phone || '',
        address: partnerData.directPlacement?.hostFamily?.address || '',
        addressLine1: partnerData.directPlacement?.hostFamily?.addressLine1 || '',
        addressLine2: partnerData.directPlacement?.hostFamily?.addressLine2 || '',
        city: partnerData.directPlacement?.hostFamily?.city || '',
        state: partnerData.directPlacement?.hostFamily?.state || '',
        zip: partnerData.directPlacement?.hostFamily?.zip || '',
        showManualEntry: partnerData.directPlacement?.hostFamily?.showManualEntry || false
      },
      school: {
        name: partnerData.directPlacement?.school?.name || '',
        phone: partnerData.directPlacement?.school?.phone || '',
        address: partnerData.directPlacement?.school?.address || '',
        addressLine1: partnerData.directPlacement?.school?.addressLine1 || '',
        addressLine2: partnerData.directPlacement?.school?.addressLine2 || '',
        city: partnerData.directPlacement?.school?.city || '',
        state: partnerData.directPlacement?.school?.state || '',
        zip: partnerData.directPlacement?.school?.zip || '',
        showManualEntry: partnerData.directPlacement?.school?.showManualEntry || false
      }
    },
    studentEvaluation: {
      studentCharacter: partnerData.studentEvaluation?.studentCharacter || partnerData.personalityAssessment || '',
      interviewerComments: partnerData.studentEvaluation?.interviewerComments || '',
      academicInterest: partnerData.studentEvaluation?.academicInterest || '',
      personalityTraits: {
        opinionated: partnerData.studentEvaluation?.personalityTraits?.opinionated || '',
        nervous: partnerData.studentEvaluation?.personalityTraits?.nervous || '',
        shy: partnerData.studentEvaluation?.personalityTraits?.shy || '',
        introspective: partnerData.studentEvaluation?.personalityTraits?.introspective || '',
        rigid: partnerData.studentEvaluation?.personalityTraits?.rigid || '',
        protected: partnerData.studentEvaluation?.personalityTraits?.protected || '',
        passive: partnerData.studentEvaluation?.personalityTraits?.passive || ''
      }
    },
    englishComprehension: {
      score: partnerData.englishComprehension?.score || '',
      potentialSuccess: partnerData.englishComprehension?.potentialSuccess || '',
      interviewReport: partnerData.englishComprehension?.interviewReport || null
    }
  };
}

async function updatePartnerAssessmentStructure() {
  console.log('🔄 Updating partner assessment structure for SEVIS students...\n');
  
  try {
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

    console.log(`📊 Found ${result.profiles?.length || 0} student profiles\n`);

    if (!result.profiles || result.profiles.length === 0) {
      console.log('❌ No student profiles found');
      return;
    }

    // Filter for SEVIS students only (approved or ready for SEVIS)
    const sevisStudents = result.profiles.filter(profile => {
      const data = profile.data;
      const isSevisStudent = data?.applicationStatus === 'approved' || 
                            data?.sevisStatus === 'ready_for_sevis' ||
                            data?.sevisStatus === 'sevis_approved';
      return isSevisStudent;
    });

    console.log(`🎯 Found ${sevisStudents.length} SEVIS students to update\n`);

    if (sevisStudents.length === 0) {
      console.log('✅ No SEVIS students need partner assessment structure updates');
      return;
    }

    // Process in batches
    const batchSize = 25;
    let processed = 0;
    let updated = 0;

    for (let i = 0; i < sevisStudents.length; i += batchSize) {
      const batch = sevisStudents.slice(i, i + batchSize);
      console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(sevisStudents.length / batchSize)} (${batch.length} students)`);
      
      const transactions = [];
      
      for (const profile of batch) {
        try {
          const data = profile.data;
          const studentName = `${data?.first_name || 'Unknown'} ${data?.last_name || 'Student'}`;
          
                     // Check if partner assessment structure needs updating
           const hasProperStructure = data?.partnerAssessment?.interview && 
                                     data?.partnerAssessment?.specialRequests && 
                                     data?.partnerAssessment?.directPlacement && 
                                     data?.partnerAssessment?.studentEvaluation && 
                                     data?.partnerAssessment?.englishComprehension;
           
           if (hasProperStructure) {
             console.log(`  ✅ ${studentName}: Already has correct partner assessment structure`);
             continue;
           }
           
           console.log(`  🔄 ${studentName}: Updating partner assessment structure`);
           
           // Get existing data from multiple sources
           const existingComprehensive = data?.comprehensive_application_data || {};
           const existingPartnerData = {
             interview: data?.interview,
             specialRequests: data?.specialRequests,
             directPlacement: data?.directPlacement,
             studentEvaluation: data?.studentEvaluation,
             englishComprehension: data?.englishComprehension,
             // Legacy fields
             personalityAssessment: data?.personalityAssessment,
             preferredStates: data?.preferredStates,
             personalityRatings: data?.personalityRatings,
             ...existingComprehensive
           };
           
           // Create new partner assessment structure
           const partnerAssessment = createPartnerAssessmentStructure(existingPartnerData);
           
           // Update profile with new structure (organized under partnerAssessment)
           if (tx.profiles && tx.profiles[profile.id]) {
             const profileTx = tx.profiles[profile.id];
             if (profileTx) {
               const updateTransaction = profileTx.update({
                 data: {
                   ...data,
                   partnerAssessment: partnerAssessment,
                   // Keep legacy fields for backward compatibility during transition
                   interview: partnerAssessment.interview,
                   specialRequests: partnerAssessment.specialRequests,
                   directPlacement: partnerAssessment.directPlacement,
                   studentEvaluation: partnerAssessment.studentEvaluation,
                   englishComprehension: partnerAssessment.englishComprehension
                 },
                 updatedAt: new Date()
               });
               
               transactions.push(updateTransaction);
             }
           }
          updated++;
          
        } catch (error) {
          console.error(`❌ Error processing profile ${profile.id}:`, error);
        }
        
        processed++;
      }
      
      // Execute batch transactions
      if (transactions.length > 0) {
        try {
          await db.transact(transactions);
          console.log(`✅ Successfully updated ${transactions.length} profiles in this batch`);
        } catch (error) {
          console.error('❌ Error executing batch transactions:', error);
        }
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n✅ Partner assessment structure update completed!`);
    console.log(`📈 Summary:`);
    console.log(`   - Total students processed: ${processed}`);
    console.log(`   - Students updated: ${updated}`);
    console.log(`   - Students already current: ${processed - updated}`);
    
  } catch (error) {
    console.error('❌ Error updating partner assessment structure:', error);
    process.exit(1);
  }
}

// Run the update
updatePartnerAssessmentStructure()
  .then(() => {
    console.log('\n🎉 Partner assessment structure update completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   - Test the student application form with updated data structure');
    console.log('   - Future sections can be added at the same level as partnerAssessment');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to update partner assessment structure:', error);
    process.exit(1);
  });

/*
 * To run this script:
 * 
 * cd packages/database
 * npm run ts-node src/scripts/update-partner-assessment-structure.ts
 * 
 * Make sure you have the required environment variables:
 * - NEXT_PUBLIC_INSTANT_APP_ID
 * - INSTANT_ADMIN_TOKEN
 */ 