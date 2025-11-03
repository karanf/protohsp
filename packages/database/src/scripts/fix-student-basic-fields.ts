import dotenv from 'dotenv';

// Load .env files
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

import { init, tx, id } from '@instantdb/admin';

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

// Generate basic info for students
const COUNTRIES = [
  'Germany', 'Spain', 'France', 'Italy', 'Japan',
  'China', 'Brazil', 'South Korea', 'Mexico', 'Sweden'
];

const firstNames = ['Adrian', 'Lucas', 'Emma', 'Sofia', 'Max', 'Anna', 'Leon', 'Lena', 'Carlos', 'Isabella'];
const lastNames = ['Müller', 'García', 'Martin', 'Rossi', 'Sato', 'Wang', 'Silva', 'Kim', 'López', 'Andersson'];

async function fixStudentBasicFields() {
  try {
    console.log('🔧 Fixing basic fields for existing student profiles...\n');

    // Get all student profiles
    const result = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      }
    });

    const students = result.profiles || [];
    console.log(`Found ${students.length} student profiles to fix\n`);

    if (students.length === 0) {
      console.log('❌ No student profiles found');
      return;
    }

    let updated = 0;
    let errors = 0;
    const batchSize = 20;

    // Process students in batches
    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize);
      const transactions = [];

      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(students.length / batchSize)} (${batch.length} profiles)`);

      for (const profile of batch) {
        try {
          // Generate basic data for this student
          const studentIndex = i + batch.indexOf(profile);
          const firstName = firstNames[studentIndex % firstNames.length];
          const lastName = lastNames[studentIndex % lastNames.length];
          const country = COUNTRIES[studentIndex % COUNTRIES.length];
          
          // Determine status
          const statuses = ['pending_review', 'under_review', 'approved', 'approved', 'approved']; // More approved for variety
          const sevisStatuses = [null, null, 'ready_for_sevis', 'sevis_approved'];
          
          const applicationStatus = statuses[studentIndex % statuses.length];
          const sevisStatus = applicationStatus === 'approved' ? sevisStatuses[studentIndex % sevisStatuses.length] : null;

          // Update the profile with basic fields
          const updateTransaction = tx.profiles[profile.id].update({
            data: {
              // Keep existing data but add/fix basic fields
              ...profile.data,
              
              // Critical basic fields for SEVIS view
              first_name: firstName,
              last_name: lastName,
              country_of_origin: country,
              school_grade: `${Math.floor(Math.random() * 4) + 9}th`,
              date_of_birth: `200${5 + Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
              gender: Math.random() > 0.5 ? 'Male' : 'Female',
              
              // Application status fields
              applicationStatus: applicationStatus,
              sevisStatus: sevisStatus,
              
              // Program information
              program: {
                type: 'academic_year'
              },
              
              // Approval fields
              approved_by: 'System Migration',
              accepted_on: new Date().toISOString().split('T')[0],
            }
          });
          
          transactions.push(updateTransaction);

        } catch (error) {
          console.error(`❌ Error updating profile ${profile.id}:`, error);
          errors++;
        }
      }

      // Execute batch transaction
      try {
        await db.transact(transactions);
        updated += batch.length;
        console.log(`✅ Batch completed: ${batch.length} profiles updated`);
      } catch (error) {
        console.error(`❌ Batch failed:`, error);
        errors += batch.length;
      }

      // Brief pause between batches
      if (i + batchSize < students.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('\n📊 Update Summary:');
    console.log(`✅ Profiles updated: ${updated}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('\n🎉 Student profile fix completed!');

  } catch (error) {
    console.error('💥 Script failed:', error);
    throw error;
  }
}

// Run the fix
fixStudentBasicFields()
  .then(() => {
    console.log('\n🏁 Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });

export { fixStudentBasicFields }; 