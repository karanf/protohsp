import dotenv from 'dotenv';

// Load .env files
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

import { init, tx } from '@instantdb/admin';

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

// Helper functions (same as before)
function generatePhoneNumber(country: string, randomSeed: number): string {
  const formats: Record<string, string> = {
    'Germany': '+49 30 12345678',
    'Spain': '+34 91 123 4567',
    'France': '+33 1 23 45 67 89',
    'Italy': '+39 06 1234 5678',
    'Japan': '+81 3 1234 5678',
    'China': '+86 10 1234 5678',
    'Brazil': '+55 11 1234 5678',
    'South Korea': '+82 2 1234 5678',
    'Mexico': '+52 55 1234 5678',
    'Sweden': '+46 8 123 456 78'
  };
  
  return formats[country] ?? '+1 555 123 4567';
}

function generateAddress(country: string, randomSeed: number) {
  const addresses: Record<string, any> = {
    'Germany': {
      line1: `${Math.floor(randomSeed * 200) + 1} Hauptstraße`,
      city: 'Berlin',
      postalCode: `1${Math.floor(randomSeed * 1000).toString().padStart(4, '0')}`,
      country: 'Germany'
    },
    'Spain': {
      line1: `Calle Mayor ${Math.floor(randomSeed * 100) + 1}`,
      city: 'Madrid', 
      postalCode: `280${Math.floor(randomSeed * 100).toString().padStart(2, '0')}`,
      country: 'Spain'
    },
    'Brazil': {
      line1: `Rua Principal ${Math.floor(randomSeed * 150) + 1}`,
      city: 'São Paulo',
      postalCode: `010${Math.floor(randomSeed * 100).toString().padStart(2, '0')}-000`,
      country: 'Brazil'
    }
  };
  
  return addresses[country] || {
    line1: `${Math.floor(randomSeed * 500) + 1} Main Street`,
    city: 'Capital City',
    postalCode: `${Math.floor(randomSeed * 90000) + 10000}`,
    country: country
  };
}

function generateParentData(gender: string, lastName: string, country: string, randomSeed: number) {
  const firstNames = gender === 'male' 
    ? ['Michael', 'David', 'Robert', 'Andreas', 'Carlos', 'Pierre', 'Marco', 'Hiroshi', 'Wei', 'Lars']
    : ['Maria', 'Anna', 'Sarah', 'Petra', 'Carmen', 'Sophie', 'Francesca', 'Yuki', 'Li', 'Astrid'];
    
  const occupations = [
    'Engineer', 'Teacher', 'Doctor', 'Manager', 'Accountant', 
    'Nurse', 'Architect', 'Designer', 'Consultant', 'Administrator'
  ];
  
  const selectedFirstName = firstNames[Math.floor(randomSeed * firstNames.length)] || 'Parent';
  
  return {
    firstName: selectedFirstName,
    lastName: lastName,
    occupation: occupations[Math.floor(randomSeed * occupations.length)] || 'Professional',
    phone: generatePhoneNumber(country, randomSeed + 0.1),
    email: `${selectedFirstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    status: 'Living',
    isLegalGuardian: true
  };
}

function generateMissingData(firstName: string, lastName: string, country: string) {
  // Generate deterministic but varied data based on name/country
  const seed = (firstName + lastName + country).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const random = (offset = 0) => ((seed + offset) % 100) / 100;
  
  return {
    // Add missing family information
    parents: {
      father: generateParentData("male", lastName, country, random(1)),
      mother: generateParentData("female", lastName, country, random(2))
    },
    
    // Add missing contact information
    address: generateAddress(country, random(3)),
    cellPhone: generatePhoneNumber(country, random(4)),
    homePhone: generatePhoneNumber(country, random(5)),
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.exchange`,
    
    // Add missing personal details
    dateOfBirth: `200${5 + Math.floor(random(6) * 4)}-${String(Math.floor(random(7) * 12) + 1).padStart(2, '0')}-${String(Math.floor(random(8) * 28) + 1).padStart(2, '0')}`,
    preferredName: random(9) > 0.8 ? firstName.substring(0, 3) + "ie" : firstName,
    
    // Add missing interview data if not present
    interview: {
      length: random(10) > 0.8 ? "45 minutes" : random(11) > 0.5 ? "60 minutes" : "75 minutes",
      date: `2024-0${Math.floor(random(12) * 3) + 1}-${Math.floor(random(13) * 28) + 1}`,
      interviewer: random(14) > 0.5 ? "Regional Coordinator" : "Senior Partner Representative",
      gpaAssessment: (2.0 + random(15) * 2.0).toFixed(1) + " (equivalent to " + (random(16) > 0.5 ? "B+" : random(17) > 0.5 ? "A-" : "B") + " average)"
    }
  };
}

async function completeMissingParentData() {
  try {
    console.log('🔄 Completing missing parent and address data for incomplete students...\n');

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

    const studentProfiles = result.profiles || [];
    console.log(`📊 Found ${studentProfiles.length} total student profiles`);

    // Find students with incomplete data (missing parent info)
    const incompleteStudents = studentProfiles.filter(student => {
      const comprehensiveData = student.data?.comprehensive_application_data;
      return comprehensiveData && !comprehensiveData.parents?.father?.firstName;
    });

    console.log(`📝 Found ${incompleteStudents.length} students with incomplete parent data`);

    if (incompleteStudents.length === 0) {
      console.log('\n🎉 All students already have complete parent data!');
      return;
    }

    // Update profiles in batches
    const BATCH_SIZE = 10;
    let updated = 0;
    let errors = 0;

    console.log(`\n🔄 Updating ${incompleteStudents.length} profiles in batches of ${BATCH_SIZE}...`);

    for (let i = 0; i < incompleteStudents.length; i += BATCH_SIZE) {
      const batch = incompleteStudents.slice(i, i + BATCH_SIZE);
      
      try {
        const transactions = batch.map(profile => {
          // Extract basic info from existing data
          const firstName = profile.data?.first_name || 'Student';
          const lastName = profile.data?.last_name || 'Name';
          const country = profile.data?.country_of_origin || 'Country';
          
          // Get existing comprehensive data
          const existingComprehensiveData = profile.data?.comprehensive_application_data || {};
          
          // Generate missing parent and address data
          const missingData = generateMissingData(firstName, lastName, country);
          
          // Merge existing data with missing data
          const updatedComprehensiveData = {
            ...existingComprehensiveData,  // Keep existing data (personalityAssessment, preferredStates, etc.)
            ...missingData                 // Add missing data (parents, address, contact info)
          };
          
          // Create updated data object that preserves existing profile data
          const updatedData = {
            ...profile.data,  // Preserve all existing profile data
            comprehensive_application_data: updatedComprehensiveData
          };
          
          if (!tx.profiles) {
            throw new Error('tx.profiles is not available');
          }
          return tx.profiles[profile.id].update({
            data: updatedData
          });
        });
        
        await db.transact(transactions);
        updated += batch.length;
        
        console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: Updated ${batch.length} profiles (${updated}/${incompleteStudents.length})`);
        
      } catch (error) {
        console.error(`❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error);
        errors += batch.length;
      }
    }

    console.log('\n🏁 Parent data completion finished!');
    console.log(`✅ Successfully updated: ${updated} profiles`);
    if (errors > 0) {
      console.log(`❌ Failed to update: ${errors} profiles`);
    }
    
    // Verify final state
    const finalResult = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      }
    });
    
    const finalProfiles = finalResult.profiles || [];
    const withCompleteParentData = finalProfiles.filter(profile => 
      profile.data?.comprehensive_application_data?.parents?.father?.firstName
    );
    
    console.log('\n📈 Final Results:');
    console.log(`🔸 Total student profiles: ${finalProfiles.length}`);
    console.log(`🔸 With complete parent data: ${withCompleteParentData.length}`);

  } catch (error) {
    console.error('💥 Parent data completion failed:', error);
    throw error;
  }
}

// Run the completion
completeMissingParentData()
  .then(() => {
    console.log('\n🎉 Missing parent data completion completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  }); 