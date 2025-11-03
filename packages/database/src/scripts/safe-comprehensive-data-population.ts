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

// Safe comprehensive data generator - creates realistic but varied data
function generateComprehensiveApplicationData(firstName: string, lastName: string, country: string) {
  const countries = ['Germany', 'Spain', 'France', 'Italy', 'Japan', 'China', 'Brazil', 'South Korea', 'Mexico', 'Sweden'];
  const countryIndex = countries.indexOf(country) !== -1 ? countries.indexOf(country) : 0;
  
  // Generate deterministic but varied data based on name/country
  const seed = (firstName + lastName + country).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const random = (offset = 0) => ((seed + offset) % 100) / 100;
  
  return {
    // Interview Section
    interview: {
      length: random(1) > 0.8 ? "45 minutes" : random(2) > 0.5 ? "60 minutes" : "75 minutes",
      date: `2024-0${Math.floor(random(3) * 3) + 1}-${Math.floor(random(4) * 28) + 1}`,
      interviewer: random(5) > 0.5 ? "Regional Coordinator" : "Senior Partner Representative",
      gpaAssessment: (2.0 + random(6) * 2.0).toFixed(1) + " (equivalent to " + (random(7) > 0.5 ? "B+" : random(8) > 0.5 ? "A-" : "B") + " average)"
    },
    
    // State Preferences
    preferredStates: [
      random(9) > 0.5 ? "California" : "Texas",
      random(10) > 0.5 ? "Florida" : "New York", 
      random(11) > 0.5 ? "Washington" : "Arizona"
    ],
    
    // Personality Assessment (varied realistic responses)
    personalityAssessment: generatePersonalityAssessment(firstName, country, random(12)),
    
    // Rating scores (7-10 range, varied)
    personalityRatings: {
      adaptability: Math.floor(random(13) * 3) + 7,
      maturity: Math.floor(random(14) * 3) + 7,
      shyToOutgoing: Math.floor(random(15) * 8) + 2,
      outgoingFun: Math.floor(random(16) * 3) + 7,
      englishLevel: Math.floor(random(17) * 3) + 7,
      positiveAttitude: Math.floor(random(18) * 2) + 8,
      seriousToEasygoing: Math.floor(random(19) * 6) + 3
    },
    
    // Personal Information
    firstName: firstName,
    lastName: lastName,
    preferredName: random(20) > 0.8 ? firstName.substring(0, 3) + "ie" : firstName,
    dateOfBirth: `200${5 + Math.floor(random(21) * 4)}-${String(Math.floor(random(22) * 12) + 1).padStart(2, '0')}-${String(Math.floor(random(23) * 28) + 1).padStart(2, '0')}`,
    cityOfBirth: generateCityName(country, random(24)),
    countryOfBirth: country,
    countryOfCitizenship: country,
    
    // Contact Information
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.exchange`,
    cellPhone: generatePhoneNumber(country, random(25)),
    homePhone: generatePhoneNumber(country, random(26)),
    address: generateAddress(country, random(27)),
    
    // Family Information
    parents: {
      father: generateParentData("male", lastName, country, random(28)),
      mother: generateParentData("female", lastName, country, random(29))
    },
    
    // Activities and Interests
    favoriteActivity1: generateActivity(random(30)),
    favoriteActivity2: generateActivity(random(31) + 0.3),
    favoriteActivity3: generateActivity(random(32) + 0.6),
    
    // Student Bio
    studentBio: generateStudentBio(firstName, country, random(33)),
    
    // Languages
    nativeLanguage: getNativeLanguage(country),
    yearsOfEnglish: `${Math.floor(random(34) * 4) + 4} years`,
    additionalLanguages: generateAdditionalLanguages(country, random(35)),
    
    // Dear Family Letter
    dearFamilyLetter: generateDearFamilyLetter(firstName, country, random(36))
  };
}

function generatePersonalityAssessment(firstName: string, country: string, randomSeed: number): string {
  const assessments = [
    `${firstName} is an enthusiastic and adaptable student with excellent communication skills. Shows great interest in American culture and demonstrates maturity beyond their years. Exhibits strong leadership qualities and gets along well with peers and adults alike.`,
    `A thoughtful and academically focused student who brings a calm, positive energy to any environment. ${firstName} is curious about different perspectives and shows genuine interest in cultural exchange. Demonstrates excellent problem-solving abilities.`,
    `${firstName} is outgoing and friendly with a great sense of humor. Shows strong independence and self-confidence while remaining respectful and open to guidance. Has demonstrated ability to adapt quickly to new situations.`,
    `A well-rounded student with strong academic performance and diverse interests. ${firstName} is articulate and mature, showing good judgment in social situations. Demonstrates excellent time management and organizational skills.`,
    `${firstName} brings a wonderful balance of enthusiasm and maturity to the program. Shows strong cultural awareness and sensitivity, with excellent English communication skills. Demonstrates good initiative and responsibility.`
  ];
  
  return assessments[Math.floor(randomSeed * assessments.length)];
}

function generateCityName(country: string, randomSeed: number): string {
  const cities: Record<string, string[]> = {
    'Germany': ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'],
    'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao'],
    'France': ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'],
    'Italy': ['Rome', 'Milan', 'Naples', 'Turin', 'Florence'],
    'Japan': ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Kyoto'],
    'China': ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu'],
    'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza'],
    'South Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon'],
    'Mexico': ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana'],
    'Sweden': ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås']
  };
  
  const countryCities = cities[country] || ['Capital City'];
  return countryCities[Math.floor(randomSeed * countryCities.length)];
}

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
  
  const selectedFirstName = firstNames[Math.floor(randomSeed * firstNames.length)];
  return {
    firstName: selectedFirstName,
    lastName: lastName,
    occupation: occupations[Math.floor(randomSeed * occupations.length)],
    phone: generatePhoneNumber(country, randomSeed + 0.1),
    email: `${selectedFirstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    status: 'Living',
    isLegalGuardian: true
  };
}

function generateActivity(randomSeed: number) {
  const activities = [
    { name: 'Volleyball', description: 'I love the team spirit and competitive aspect of volleyball. It has taught me leadership and cooperation skills.' },
    { name: 'Piano', description: 'Music is my passion. Playing piano helps me express emotions and brings me peace and joy.' },
    { name: 'Photography', description: 'I enjoy capturing beautiful moments and different perspectives of the world around me.' },
    { name: 'Reading', description: 'Books open my mind to new ideas and different cultures. I especially enjoy historical fiction.' },
    { name: 'Swimming', description: 'Swimming keeps me physically fit and mentally focused. I compete in regional competitions.' },
    { name: 'Cooking', description: 'I love experimenting with traditional recipes from my country and learning about international cuisine.' }
  ];
  
  return activities[Math.floor(randomSeed * activities.length)];
}

function generateStudentBio(firstName: string, country: string, randomSeed: number): string {
  const bios = [
    `Hi! I'm ${firstName} from ${country}, and I'm thrilled about the opportunity to experience American culture firsthand. I'm passionate about learning, making new friends, and sharing my own cultural background. I love sports, music, and spending time outdoors. I'm looking forward to improving my English, experiencing American high school life, and creating lasting memories with my host family.`,
    
    `Hello! My name is ${firstName}, and I come from beautiful ${country}. I'm an enthusiastic student who loves to try new things and meet people from different backgrounds. In my free time, I enjoy reading, playing sports, and learning about other cultures. I'm excited to bring my positive energy to an American family and learn about your traditions while sharing mine.`,
    
    `Greetings! I'm ${firstName}, a curious and friendly student from ${country}. I have a strong interest in academics, especially science and languages. I enjoy playing music, participating in sports, and volunteering in my community. I'm looking forward to experiencing the American way of life and building meaningful relationships with my host family and classmates.`
  ];
  
  return bios[Math.floor(randomSeed * bios.length)];
}

function getNativeLanguage(country: string): string {
  const languages: Record<string, string> = {
    'Germany': 'German',
    'Spain': 'Spanish', 
    'France': 'French',
    'Italy': 'Italian',
    'Japan': 'Japanese',
    'China': 'Mandarin Chinese',
    'Brazil': 'Portuguese',
    'South Korea': 'Korean',
    'Mexico': 'Spanish',
    'Sweden': 'Swedish'
  };
  
  return languages[country] || 'English';
}

function generateAdditionalLanguages(country: string, randomSeed: number) {
  const commonLanguages = ['English', 'Spanish', 'French', 'German', 'Italian'];
  const nativeLanguage = getNativeLanguage(country);
  
  return [
    {
      name: 'English',
      years: `${Math.floor(randomSeed * 4) + 4} years`,
      level: randomSeed > 0.7 ? 'Advanced' : randomSeed > 0.4 ? 'Intermediate' : 'Basic'
    },
    {
      name: commonLanguages[Math.floor(randomSeed * commonLanguages.length)],
      years: `${Math.floor(randomSeed * 3) + 2} years`, 
      level: 'Basic'
    }
  ].filter(lang => lang.name !== nativeLanguage);
}

function generateDearFamilyLetter(firstName: string, country: string, randomSeed: number): string {
  const letters = [
    `Dear Host Family,\n\nI am so excited to meet you and become part of your family! My name is ${firstName}, and I come from ${country}. I am eager to learn about American culture, improve my English, and share my own traditions with you. I enjoy cooking traditional foods from my country and would love to prepare some special meals for you. I am responsible, respectful, and always willing to help with household chores. I promise to be a positive addition to your family and create wonderful memories together!\n\nWith warm regards,\n${firstName}`,
    
    `Dear Future Family,\n\nHello! I'm ${firstName} from ${country}, and I can't wait to meet you all! I am a friendly, curious student who loves learning about new cultures and making friends. I'm passionate about sports and music, and I hope we can share these interests together. I will respect your house rules and traditions while also sharing stories and customs from my homeland. Thank you for opening your home to me - I promise to treat you like my own family!\n\nLooking forward to meeting you,\n${firstName}`,
    
    `Dear Host Family,\n\nMy name is ${firstName}, and I am honored that you are considering hosting me during my exchange year in America. I come from ${country} with an open heart and mind, ready to embrace new experiences and build lasting relationships. I am mature, independent, but also love being part of a family atmosphere. I enjoy helping with cooking, outdoor activities, and learning about local traditions. I hope to bring joy and positive energy to your home while creating beautiful memories together.\n\nWith gratitude and excitement,\n${firstName}`
  ];
  
  return letters[Math.floor(randomSeed * letters.length)];
}

async function safelyPopulateComprehensiveData() {
  try {
    console.log('🔍 Starting safe comprehensive data population...\n');

    // First, get current student profiles that need comprehensive data
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
    console.log(`📊 Found ${studentProfiles.length} student profiles`);

    // Filter profiles that don't already have comprehensive data
    const profilesToUpdate = studentProfiles.filter(profile => 
      !profile.data?.comprehensive_application_data
    );

    console.log(`📝 ${profilesToUpdate.length} profiles need comprehensive data`);
    console.log(`✅ ${studentProfiles.length - profilesToUpdate.length} profiles already have comprehensive data`);

    if (profilesToUpdate.length === 0) {
      console.log('\n🎉 All student profiles already have comprehensive data!');
      return;
    }

    // Update profiles in batches
    const BATCH_SIZE = 10;
    let updated = 0;
    let errors = 0;

    console.log(`\n🔄 Updating ${profilesToUpdate.length} profiles in batches of ${BATCH_SIZE}...`);

    for (let i = 0; i < profilesToUpdate.length; i += BATCH_SIZE) {
      const batch = profilesToUpdate.slice(i, i + BATCH_SIZE);
      
      try {
        const transactions = batch.map(profile => {
          // Extract basic info from existing data
          const firstName = profile.data?.first_name || 'Student';
          const lastName = profile.data?.last_name || 'Name';
          const country = profile.data?.country_of_origin || 'Country';
          
          // Generate comprehensive data
          const comprehensiveData = generateComprehensiveApplicationData(firstName, lastName, country);
          
          // Create updated data object that preserves existing data
          const updatedData = {
            ...profile.data, // Preserve existing data
            comprehensive_application_data: comprehensiveData
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
        
        console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: Updated ${batch.length} profiles (${updated}/${profilesToUpdate.length})`);
        
      } catch (error) {
        console.error(`❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error);
        errors += batch.length;
      }
    }

    console.log('\n🏁 Population completed!');
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
    const withComprehensiveData = finalProfiles.filter(profile => 
      profile.data?.comprehensive_application_data
    );
    
    console.log('\n📈 Final Results:');
    console.log(`🔸 Total student profiles: ${finalProfiles.length}`);
    console.log(`🔸 With comprehensive data: ${withComprehensiveData.length}`);

  } catch (error) {
    console.error('💥 Population failed:', error);
    throw error;
  }
}

// Run the population
safelyPopulateComprehensiveData()
  .then(() => {
    console.log('\n🎉 Safe comprehensive data population completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  }); 