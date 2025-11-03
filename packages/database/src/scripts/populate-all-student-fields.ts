import dotenv from 'dotenv';
import path from 'path';

// Load .env files
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env.local') });

import { init, tx, id } from '@instantdb/admin';

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

const db = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

interface StudentData {
  // Basic Info
  first_name?: string;
  last_name?: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  country_of_origin?: string;
  native_language?: string;
  english_proficiency?: string;
  
  // Academic Info
  school_grade?: string;
  academic?: {
    gpa?: string;
    graduation_year?: string;
    history?: {
      current_school?: string;
      years_of_english?: number;
      favorite_subjects?: string[];
      extracurricular_activities?: string[];
    };
    slep_score?: number;
    eltis_score?: number;
    private_school_tuition?: boolean;
  };
  academic_interests?: string[];
  
  // Personal Info
  student_bio?: string;
  bio?: string;
  personal_statement?: string;
  hobbies?: string[];
  favorite_activities?: string[];
  interests?: string[];
  
  // Health & Diet
  health?: {
    can_adjust_to_smoker?: boolean;
    dietary_restrictions?: string;
    vaccinations_complete?: boolean;
    afraid_of_pets?: boolean;
    has_medical_conditions?: boolean;
    medications?: string;
    has_allergies?: boolean;
    allergic_to_animals?: boolean;
    allergic_to_food?: boolean;
    allergic_to_dust?: boolean;
    allergies?: string[];
    medical_conditions?: string[];
  };
  diet_restrictions?: string;
  religion?: string;
  
  // Program Info
  program?: {
    type?: string;
    year?: number;
    duration?: number;
  };
  program_dates?: {
    arrival_date?: string;
    departure_date?: string;
  };
  
  // Contact Info
  emergency_contact?: {
    name?: string;
    email?: string;
    phone?: string;
    relationship?: string;
  };
  parents?: Array<{
    name?: string;
    email?: string;
    phone?: string;
    occupation?: string;
    relation?: string;
  }>;
  home_address?: {
    street?: string;
    city?: string;
    state_province?: string;
    postal_code?: string;
    country?: string;
  };
  
  // Application Info
  application?: {
    status?: string;
    date?: string;
    notes?: string;
  };
  
  // SEVIS Info
  sevis?: {
    sevis_id?: string;
    ds2019_issued?: boolean;
    ds2019_issue_date?: string;
    sevis_submitted_date?: string;
    sevis_response_date?: string;
  };
  passport?: {
    number?: string;
    issue_date?: string;
    expiry_date?: string;
    issuing_country?: string;
  };
  
  // Placement Info
  placement_preferences?: {
    pet_preference?: string;
    special_requests?: string[];
    family_preference?: string;
    location_preference?: string;
  };
  host_family_status?: string;
  school_status?: string;
  details?: string;
  
  [key: string]: any;
}

async function populateAllStudentFields() {
  try {
    console.log('🔄 Populating all student fields from JSON data...\n');

    // Get all student profiles
    const { profiles } = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      }
    });

    console.log(`📊 Found ${profiles.length} student profiles\n`);

    if (profiles.length === 0) {
      console.log('❌ No student profiles found');
      return;
    }

    let updated = 0;
    let errors = 0;
    const batchSize = 50;

    // Process profiles in batches
    for (let i = 0; i < profiles.length; i += batchSize) {
      const batch = profiles.slice(i, i + batchSize);
      const transactions = [];

      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(profiles.length / batchSize)} (${batch.length} profiles)`);

      for (const profile of batch) {
        try {
          const data = profile.data as StudentData;
          
          // Extract all fields for individual profile fields
          const updates: any = {};
          
          // Basic Info - extract from JSON data
          if (data.first_name && !profile.firstName) {
            updates.firstName = data.first_name;
          }
          if (data.last_name && !profile.lastName) {
            updates.lastName = data.last_name;
          }
          if (data.email && !profile.email) {
            updates.email = data.email;
          }
          
          // Enhanced data field with all extracted information
          const enhancedData = {
            ...data,
            
            // Ensure all critical fields are present
            first_name: data.first_name || profile.firstName || 'Unknown',
            last_name: data.last_name || profile.lastName || 'Student',
            email: data.email || profile.email || `student${i + 1}@exchange.edu`,
            
            // Bio and activities (already well populated)
            student_bio: data.student_bio,
            bio: data.bio || data.student_bio,
            personal_statement: data.personal_statement,
            hobbies: data.hobbies || [],
            favorite_activities: data.favorite_activities || [],
            interests: data.interests || data.academic_interests || [],
            
            // Academic information
            academic_info: {
              grade: data.school_grade,
              gpa: data.academic?.gpa,
              graduation_year: data.academic?.graduation_year,
              school: data.academic?.history?.current_school,
              years_of_english: data.academic?.history?.years_of_english,
              favorite_subjects: data.academic?.history?.favorite_subjects || [],
              extracurricular_activities: data.academic?.history?.extracurricular_activities || [],
              slep_score: data.academic?.slep_score,
              eltis_score: data.academic?.eltis_score,
              interests: data.academic_interests || []
            },
            
            // Health and dietary information
            health_info: {
              dietary_restrictions: data.health?.dietary_restrictions || data.diet_restrictions,
              allergies: data.health?.allergies || [],
              medical_conditions: data.health?.medical_conditions || [],
              medications: data.health?.medications,
              can_adjust_to_smoker: data.health?.can_adjust_to_smoker,
              afraid_of_pets: data.health?.afraid_of_pets,
              vaccinations_complete: data.health?.vaccinations_complete
            },
            
            // Program information
            program_info: {
              type: data.program?.type,
              year: data.program?.year,
              duration: data.program?.duration,
              arrival_date: data.program_dates?.arrival_date,
              departure_date: data.program_dates?.departure_date
            },
            
            // Contact information
            contact_info: {
              emergency_contact: data.emergency_contact,
              parents: data.parents || [],
              home_address: data.home_address
            },
            
            // SEVIS and passport information
            sevis_info: data.sevis || {},
            passport_info: data.passport || {},
            
            // Placement information
            placement_info: {
              preferences: data.placement_preferences || {},
              host_family_status: data.host_family_status,
              school_status: data.school_status
            },
            
            // Personal details
            personal_info: {
              date_of_birth: data.date_of_birth,
              gender: data.gender,
              country_of_origin: data.country_of_origin,
              native_language: data.native_language,
              english_proficiency: data.english_proficiency,
              religion: data.religion
            },
            
            // Application information
            application_info: data.application || {},
            
            // Additional details
            details: data.details,
            
            // Metadata
            data_populated: true,
            last_field_extraction: new Date().toISOString()
          };

          // Add to transaction batch
          const transaction = db.tx.profiles[profile.id].update({
            ...updates,
            data: enhancedData,
            updatedAt: new Date().toISOString()
          });
          
          transactions.push(transaction);
          
        } catch (error) {
          console.error(`❌ Error processing profile ${profile.id}:`, error);
          errors++;
        }
      }

      // Execute batch transaction
      if (transactions.length > 0) {
        try {
          await db.transact(transactions);
          updated += transactions.length;
          console.log(`✅ Updated ${transactions.length} profiles in batch`);
        } catch (error) {
          console.error(`❌ Batch transaction failed:`, error);
          errors += transactions.length;
        }
      }

      // Small delay between batches
      if (i + batchSize < profiles.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('\n🎉 FIELD POPULATION COMPLETE');
    console.log('==============================');
    console.log(`✅ Successfully updated: ${updated} profiles`);
    console.log(`❌ Errors: ${errors} profiles`);
    console.log(`📊 Total processed: ${profiles.length} profiles`);
    
    if (updated > 0) {
      console.log('\n📋 POPULATED FIELDS INCLUDE:');
      console.log('• ✅ Basic Info: firstName, lastName, email');
      console.log('• ✅ Bios: student_bio, personal_statement');
      console.log('• ✅ Activities: hobbies, favorite_activities, interests');
      console.log('• ✅ Academic: grades, GPA, school history, subjects');
      console.log('• ✅ Health: dietary restrictions, allergies, medical conditions');
      console.log('• ✅ Program: dates, duration, type');
      console.log('• ✅ Contact: emergency contacts, parents, addresses');
      console.log('• ✅ SEVIS: immigration status and documents');
      console.log('• ✅ Placement: preferences and status');
      console.log('• ✅ Personal: demographics and background');
    }

  } catch (error) {
    console.error('❌ Error populating student fields:', error);
    throw error;
  }
}

// Run the population
if (require.main === module) {
  populateAllStudentFields()
    .then(() => {
      console.log('\n✅ All student fields populated successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Field population failed:', error);
      process.exit(1);
    });
}

export { populateAllStudentFields }; 