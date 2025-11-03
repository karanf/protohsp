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

// Simple student profile generator (inline to avoid import issues)
function generateSimpleComprehensiveData() {
  return {
    // Put comprehensive data in a nested structure so it doesn't override basic fields
    interview: {
      length: "60 minutes",
      date: "2024-01-15",
      interviewer: "Regional Coordinator"
    },
    personalityAssessment: "Friendly and outgoing student with good communication skills.",
    preferredStates: ["California", "Texas", "Florida"],
    personalityRatings: {
      adaptability: 8,
      maturity: 7,
      englishLevel: 8,
      positiveAttitude: 9
    },
    favoriteActivity1: {
      name: "Soccer",
      description: "Playing soccer helps me stay active and make friends."
    },
    dearFamilyLetter: "Dear Host Family, I am excited to be part of your family and look forward to sharing my culture with you!"
  };
}

// Configuration
const NUM_STUDENTS = 886; // Same as before
const BATCH_SIZE = 10;

// Generate student names with countries for variety
const COUNTRIES = [
  { code: 'DE', name: 'Germany', language: 'German' },
  { code: 'ES', name: 'Spain', language: 'Spanish' },
  { code: 'FR', name: 'France', language: 'French' },
  { code: 'IT', name: 'Italy', language: 'Italian' },
  { code: 'JP', name: 'Japan', language: 'Japanese' },
  { code: 'CN', name: 'China', language: 'Chinese' },
  { code: 'BR', name: 'Brazil', language: 'Portuguese' },
  { code: 'KR', name: 'South Korea', language: 'Korean' },
  { code: 'MX', name: 'Mexico', language: 'Spanish' },
  { code: 'SE', name: 'Sweden', language: 'Swedish' }
];

const PROGRAMS = [
  'Academic Year',
  'Semester (Fall)', 
  'Semester (Spring)',
  'Calendar Year'
];

const STATUS_OPTIONS = [
  { text: 'Pending Review', color: 'amber' },
  { text: 'Under Review', color: 'blue' },
  { text: 'Approved', color: 'green' },
  { text: 'Ready for SEVIS', color: 'blue' },
  { text: 'SEVIS Approved', color: 'green' }
];

function generateRandomName(country: string) {
  const firstNames = {
    'Germany': ['Adrian', 'Lucas', 'Emma', 'Sofia', 'Max', 'Anna', 'Leon', 'Lena'],
    'Spain': ['Carlos', 'Sofia', 'Diego', 'Isabella', 'Alejandro', 'Carmen', 'Pablo', 'Maria'],
    'France': ['Antoine', 'Camille', 'Louis', 'Chloé', 'Pierre', 'Emma', 'Gabriel', 'Inès'],
    'Italy': ['Marco', 'Giulia', 'Alessandro', 'Sofia', 'Francesco', 'Alice', 'Lorenzo', 'Emma'],
    'Japan': ['Hiroshi', 'Yuki', 'Takeshi', 'Sakura', 'Kenji', 'Ami', 'Ryuta', 'Hana'],
    'China': ['Wei', 'Li', 'Chen', 'Wang', 'Zhang', 'Liu', 'Yang', 'Huang'],
    'Brazil': ['João', 'Ana', 'Carlos', 'Maria', 'Pedro', 'Beatriz', 'Gabriel', 'Sofia'],
    'South Korea': ['Min-jun', 'Seo-yeon', 'Do-yoon', 'Yoon-seo', 'Eun-woo', 'Chae-won'],
    'Mexico': ['José', 'María', 'Juan', 'Ana', 'Luis', 'Carmen', 'Miguel', 'Rosa'],
    'Sweden': ['Erik', 'Anna', 'Lars', 'Emma', 'Nils', 'Astrid', 'Magnus', 'Ingrid']
  };

  const lastNames = {
    'Germany': ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner'],
    'Spain': ['García', 'González', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'Sánchez'],
    'France': ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Petit', 'Durand'],
    'Italy': ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo'],
    'Japan': ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto'],
    'China': ['Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang'],
    'Brazil': ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves'],
    'South Korea': ['Kim', 'Lee', 'Park', 'Jung', 'Choi', 'Yoon', 'Jang'],
    'Mexico': ['García', 'Martínez', 'López', 'Hernández', 'González', 'Pérez', 'Sánchez'],
    'Sweden': ['Andersson', 'Johansson', 'Karlsson', 'Nilsson', 'Eriksson', 'Larsson']
  };

  const countryFirstNames = firstNames[country as keyof typeof firstNames] || firstNames['Germany'];
  const countryLastNames = lastNames[country as keyof typeof lastNames] || lastNames['Germany'];
  
  const firstName = countryFirstNames[Math.floor(Math.random() * countryFirstNames.length)];
  const lastName = countryLastNames[Math.floor(Math.random() * countryLastNames.length)];
  
  return { firstName, lastName };
}

async function restoreStudentData() {
  try {
    console.log(`🔄 Restoring ${NUM_STUDENTS} students to InstantDB...\n`);

    let createdUsers = 0;
    let createdProfiles = 0;
    let errors = 0;

    // Process students in batches
    for (let i = 0; i < NUM_STUDENTS; i += BATCH_SIZE) {
      const batchEnd = Math.min(i + BATCH_SIZE, NUM_STUDENTS);
      const batchSize = batchEnd - i;
      
      console.log(`📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(NUM_STUDENTS / BATCH_SIZE)} (${batchSize} students)...`);

      const transactions = [];

      for (let j = i; j < batchEnd; j++) {
        try {
          // Generate student data
          const country = COUNTRIES[j % COUNTRIES.length];
          if (!country) continue;
          
          const { firstName, lastName } = generateRandomName(country.name);
          const program = PROGRAMS[j % PROGRAMS.length];
          const status = STATUS_OPTIONS[j % STATUS_OPTIONS.length];
          
          if (!firstName || !lastName || !program || !status) continue;

          // Generate comprehensive application data
          const comprehensiveData = generateSimpleComprehensiveData();

          // Create user
          const userId = id();
          const userTransaction = tx.users[userId].update({
            firstName,
            lastName,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.exchange`,
            role: 'student',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          transactions.push(userTransaction);

          // Create profile with comprehensive data
          const profileId = id();
          const profileTransaction = tx.profiles[profileId].update({
            userId,
            type: 'student',
                          data: {
                // Basic fields that views expect (these are critical!)
                first_name: firstName,
                last_name: lastName,
                country_of_origin: country.name,
                school_grade: `${Math.floor(Math.random() * 4) + 9}th`, // 9th-12th grade
                date_of_birth: `200${5 + Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
                gender: Math.random() > 0.5 ? 'Male' : 'Female',
                
                // Application status fields for SEVIS view (critical!)
                applicationStatus: status.text === 'Approved' || status.text === 'Ready for SEVIS' || status.text === 'SEVIS Approved' ? 'approved' : 
                                  status.text === 'Under Review' ? 'under_review' : 'pending_review',
                sevisStatus: status.text === 'SEVIS Approved' ? 'sevis_approved' :
                            status.text === 'Ready for SEVIS' ? 'ready_for_sevis' : null,
                
                // Program information
                program: {
                  type: program.toLowerCase().replace(/\s+/g, '_')
                },

                // Mock approval data
                approved_by: 'System Migration',
                accepted_on: new Date().toISOString().split('T')[0],
                
                // Comprehensive application data (put this last)
                comprehensive_application_data: comprehensiveData,
              },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          transactions.push(profileTransaction);

        } catch (error) {
          console.error(`❌ Error creating student ${j + 1}:`, error);
          errors++;
        }
      }

      // Execute batch transaction
      try {
        await db.transact(transactions);
        createdUsers += batchSize;
        createdProfiles += batchSize;
        console.log(`✅ Batch completed: ${batchSize} students created`);
      } catch (error) {
        console.error(`❌ Batch failed:`, error);
        errors += batchSize;
      }

      // Brief pause between batches
      if (i + BATCH_SIZE < NUM_STUDENTS) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Students created: ${createdUsers}`);
    console.log(`✅ Profiles created: ${createdProfiles}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('\n🎉 Student data restoration completed!');

  } catch (error) {
    console.error('💥 Script failed:', error);
    throw error;
  }
}

// Run the restoration if this file is executed directly
restoreStudentData()
  .then(() => {
    console.log('\n🏁 Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });

export { restoreStudentData }; 