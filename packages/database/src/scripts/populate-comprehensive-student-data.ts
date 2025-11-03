import dotenv from 'dotenv';

// Load .env files - try multiple locations
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

import { init, tx, id } from '@instantdb/admin';
import { generateStudentProfile, generateMultipleStudents } from './detailed-student-mock-data.js';

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

if (!INSTANT_APP_ID || !INSTANT_ADMIN_TOKEN) {
  console.error('❌ Missing InstantDB credentials');
  console.error('Make sure NEXT_PUBLIC_INSTANT_APP_ID and INSTANT_ADMIN_TOKEN are set');
  process.exit(1);
}

const db = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

// Helper function to create display name from student data
function createDisplayName(studentData: any): string {
  const firstName = studentData.personalInfo?.firstName || studentData.first_name || 'Unknown';
  const lastName = studentData.personalInfo?.lastName || studentData.last_name || 'Student';
  return `${firstName} ${lastName}`;
}

// Helper function to extract initials
function createInitials(studentData: any): string {
  const firstName = studentData.personalInfo?.firstName || studentData.first_name || 'U';
  const lastName = studentData.personalInfo?.lastName || studentData.last_name || 'S';
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

// Helper function to convert student data to InstantDB format
function convertToInstantDBFormat(comprehensiveData: any) {
  const personalInfo = comprehensiveData.personalInfo || {};
  const contactInfo = comprehensiveData.contactInfo || {};
  const academicInfo = comprehensiveData.academicInfo || {};
  const programInfo = comprehensiveData.programInfo || {};
  const familyInfo = comprehensiveData.familyInfo || {};
  const partnerAssessment = comprehensiveData.partnerAssessment || {};
  
  return {
    // Basic profile fields for InstantDB
    firstName: personalInfo.firstName || 'Unknown',
    lastName: personalInfo.lastName || 'Student',
    email: contactInfo.email || `student@example.com`,
    phone: contactInfo.cellPhone || contactInfo.homePhone,
    
    // Comprehensive data stored in profile.data field
    data: {
      // Personal Information
      first_name: personalInfo.firstName,
      last_name: personalInfo.lastName,
      preferred_name: personalInfo.preferredName,
      gender: personalInfo.gender,
      date_of_birth: personalInfo.dateOfBirth,
      city_of_birth: personalInfo.cityOfBirth,
      country_of_birth: personalInfo.countryOfBirth,
      country_of_origin: personalInfo.countryOfLegalResidence,
      country_of_citizenship: personalInfo.countryOfCitizenship,
      native_language: comprehensiveData.languages?.nativeLanguage,
      
      // Contact Information
      email: contactInfo.email,
      cell_phone: contactInfo.cellPhone,
      home_phone: contactInfo.homePhone,
      address: {
        line1: contactInfo.currentAddress?.line1,
        line2: contactInfo.currentAddress?.line2,
        city: contactInfo.currentAddress?.city,
        postal_code: contactInfo.currentAddress?.postalCode,
        country: contactInfo.currentAddress?.country
      },
      emergency_contact: {
        name: contactInfo.emergencyContact?.name,
        relationship: contactInfo.emergencyContact?.relationship,
        phone: contactInfo.emergencyContact?.phone
      },
      
      // Academic Information
      school_grade: academicInfo.currentGrade,
      school_type: academicInfo.schoolType,
      highest_grade: academicInfo.highestGrade,
      graduation_situation: academicInfo.graduationSituation,
      graduation_date: academicInfo.graduationDate,
      current_school: academicInfo.schoolName,
      gpa: academicInfo.gpa,
      favorite_subjects: academicInfo.favoriteSubjects,
      years_of_english: comprehensiveData.languages?.yearsOfEnglish,
      english_proficiency: comprehensiveData.languages?.additionalLanguages?.[0]?.proficiency,
      
      // Program Information
      program_type: programInfo.programOption,
      program: {
        type: programInfo.programOption,
        duration: 'Academic Year'
      },
      
      // Family Information
      parents: familyInfo.parents || [],
      siblings: familyInfo.siblings || [],
      us_contacts: familyInfo.usContacts || [],
      family_status: familyInfo.parentRelationshipStatus,
      living_situation: familyInfo.livingSituation,
      
      // Activities and Interests
      favorite_activities: comprehensiveData.activities?.map((activity: any) => ({
        name: activity.name,
        description: activity.description
      })) || [],
      hobbies: comprehensiveData.activities?.map((activity: any) => activity.name) || [],
      interests: comprehensiveData.activities?.map((activity: any) => activity.name) || [],
      
      // Biography
      student_bio: comprehensiveData.biography?.studentBio,
      bio: comprehensiveData.biography?.studentBio,
      dear_family_letter: comprehensiveData.biography?.dearFamilyLetter,
      video_intro_link: comprehensiveData.biography?.videoIntroLink,
      
      // Partner Assessment
      interview: partnerAssessment.interview || {},
      special_requests: partnerAssessment.specialRequests || {},
      direct_placement: partnerAssessment.directPlacement || {},
      student_evaluation: partnerAssessment.studentEvaluation || {},
      english_comprehension: partnerAssessment.englishComprehension || {},
      
      // Preferences
      dietary_restrictions: comprehensiveData.preferences?.dietaryRestrictions,
      allergies: comprehensiveData.preferences?.allergies,
      pet_preferences: comprehensiveData.preferences?.pets,
      housing_preferences: comprehensiveData.preferences?.housing,
      
      // Languages
      additional_languages: comprehensiveData.languages?.additionalLanguages || [],
      
      // Awards
      awards: comprehensiveData.awards || [],
      
      // Application status fields for SEVIS processing
      application_status: 'approved',
      sevis_status: 'ready_for_sevis',
      approved_by: partnerAssessment.interview?.interviewer || 'System Admin',
      approved_on: new Date().toISOString(),
      last_action: 'Application approved',
      
      // SEVIS Information
      sevis: {
        sevis_id: Math.random() > 0.7 ? `N${Math.floor(Math.random() * 9000000000) + 1000000000}` : null,
        status: Math.random() > 0.7 ? 'assigned' : 'pending_assignment'
      }
    },
    
    // Status and metadata
    status: 'active',
    isActive: true,
    type: 'student',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

async function populateComprehensiveStudentData() {
  try {
    console.log('🚀 Starting comprehensive student data population...\n');
    
    // Check existing student profiles
    console.log('📊 Checking existing student profiles...');
    const { profiles } = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      }
    });
    
    console.log(`Found ${profiles.length} existing student profiles`);
    
    // Generate comprehensive student data using our detailed mock data generator
    console.log('\n🎲 Generating comprehensive student profiles...');
    const numStudents = Math.max(50, profiles.length); // Generate at least 50 comprehensive profiles
    const comprehensiveStudents = generateMultipleStudents(numStudents);
    
    console.log(`Generated ${comprehensiveStudents.length} comprehensive student profiles`);
    
    // Process in batches to avoid overwhelming InstantDB
    const batchSize = 10;
    let processedCount = 0;
    let updatedCount = 0;
    let createdCount = 0;
    
    for (let i = 0; i < comprehensiveStudents.length; i += batchSize) {
      const batch = comprehensiveStudents.slice(i, i + batchSize);
      console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(comprehensiveStudents.length / batchSize)} (${batch.length} students)`);
      
      const transactions = [];
      
      for (const comprehensiveData of batch) {
        try {
          const instantDBData = convertToInstantDBFormat(comprehensiveData);
          const displayName = createDisplayName(instantDBData);
          const initials = createInitials(instantDBData);
          
          // Check if we should update existing profile or create new one
          const existingProfile = profiles[processedCount];
          
          if (existingProfile && processedCount < profiles.length) {
            // Update existing profile with comprehensive data
            console.log(`  ↻ Updating: ${displayName} (${existingProfile.id})`);
            
            const updateData = {
              ...instantDBData,
              name: displayName,
              initials: initials,
              country: instantDBData.data.country_of_origin,
              grade: instantDBData.data.school_grade,
              program: instantDBData.data.program?.type || 'Academic Year Exchange',
              partner: 'International Exchange Partners',
              dob: instantDBData.data.date_of_birth,
              hostFamilyName: 'Pending Assignment',
              school: instantDBData.data.current_school || 'To Be Assigned',
              startDate: '2024-08-15',
              endDate: '2025-06-15',
              sevisId: instantDBData.data.sevis?.sevis_id || 'Pending Assignment'
            };
            
            if (tx.profiles && tx.profiles[existingProfile.id]) {
              transactions.push(
                tx.profiles[existingProfile.id].update(updateData)
              );
            }
            updatedCount++;
          } else {
            // Create new profile
            const newProfileId = id();
            console.log(`  ✨ Creating: ${displayName} (${newProfileId})`);
            
            const newProfileData = {
              ...instantDBData,
              id: newProfileId,
              name: displayName,
              initials: initials,
              country: instantDBData.data.country_of_origin,
              grade: instantDBData.data.school_grade,
              program: instantDBData.data.program?.type || 'Academic Year Exchange',
              partner: 'International Exchange Partners',
              dob: instantDBData.data.date_of_birth,
              hostFamilyName: 'Pending Assignment',
              school: instantDBData.data.current_school || 'To Be Assigned',
              startDate: '2024-08-15',
              endDate: '2025-06-15',
              sevisId: instantDBData.data.sevis?.sevis_id || 'Pending Assignment'
            };
            
            if (tx.profiles && tx.profiles[newProfileId]) {
              transactions.push(
                tx.profiles[newProfileId].update(newProfileData)
              );
            }
            createdCount++;
          }
          
          processedCount++;
          
        } catch (error) {
          console.error(`  ❌ Error processing student: ${error}`);
        }
      }
      
      // Execute batch transactions
      if (transactions.length > 0) {
        try {
          await db.transact(transactions);
          console.log(`  ✅ Batch completed successfully`);
        } catch (error) {
          console.error(`  ❌ Batch failed: ${error}`);
        }
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n✅ Comprehensive student data population completed!');
    console.log(`📊 Summary:`);
    console.log(`  • Processed: ${processedCount} students`);
    console.log(`  • Updated: ${updatedCount} existing profiles`);
    console.log(`  • Created: ${createdCount} new profiles`);
    console.log(`  • Total comprehensive profiles: ${updatedCount + createdCount}`);
    
    // Verify the data
    console.log('\n🔍 Verifying updated data...');
    const { profiles: updatedProfiles } = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      }
    });
    
    console.log(`Verification: Found ${updatedProfiles.length} student profiles in database`);
    
    // Sample one profile to show the comprehensive data
    if (updatedProfiles.length > 0) {
      const sampleProfile = updatedProfiles[0];
      console.log(`\n📋 Sample profile structure for: ${sampleProfile.name}`);
      console.log(`  • Basic info: ✓ (${sampleProfile.firstName} ${sampleProfile.lastName})`);
      console.log(`  • Contact info: ✓ (${sampleProfile.email})`);
      console.log(`  • Comprehensive data: ✓ (${Object.keys(sampleProfile.data || {}).length} fields)`);
      
      if (sampleProfile.data?.interview) {
        console.log(`  • Interview assessment: ✓`);
      }
      if (sampleProfile.data?.parents?.length > 0) {
        console.log(`  • Family information: ✓ (${sampleProfile.data.parents.length} parents)`);
      }
      if (sampleProfile.data?.favorite_activities?.length > 0) {
        console.log(`  • Activities: ✓ (${sampleProfile.data.favorite_activities.length} activities)`);
      }
    }
    
    console.log('\n🎉 All student profiles now have comprehensive SEVIS processing data!');
    
  } catch (error) {
    console.error('❌ Population failed:', error);
    throw error;
  }
}

// Run the population - ES module equivalent to require.main === module
if (import.meta.url === `file://${process.argv[1]}`) {
  populateComprehensiveStudentData()
    .then(() => {
      console.log('\n🏁 Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

export { populateComprehensiveStudentData }; 