#!/usr/bin/env node

/**
 * Populate Partner Assessment Data Script
 * 
 * This script populates the partner assessment fields with existing data from
 * comprehensive_application_data and generates realistic data where missing.
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

// Helper function to generate realistic missing data
function generateMissingPartnerData(firstName: string, lastName: string, country: string) {
  const seed = (firstName + lastName + country).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const random = (offset = 0) => ((seed + offset) % 100) / 100;
  
  const grades = ['9th', '10th', '11th', '12th'];
  const gpaOptions = ['A', 'A-', 'B+', 'B', 'B-', 'C+'];
  const states = ['California', 'Texas', 'Florida', 'New York', 'Arizona', 'Georgia', 'North Carolina', 'Virginia', 'Michigan', 'Ohio'];
  const academicInterests = ['Great', 'Average', 'Little'];
  const scores = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const potentialSuccess = ['very-good', 'good', 'average', 'low'];
  
  return {
    interview: {
      length: random(1) > 0.8 ? '45' : random(2) > 0.5 ? '60' : '75',
      date: `2024-0${Math.floor(random(3) * 3) + 1}-${String(Math.floor(random(4) * 28) + 1).padStart(2, '0')}`,
      interviewer: random(5) > 0.5 ? 'Regional Coordinator' : 'Senior Partner Representative',
      studentGradeLevel: grades[Math.floor(random(6) * grades.length)],
      recommendedGrade: grades[Math.floor(random(7) * grades.length)],
      gpa: gpaOptions[Math.floor(random(8) * gpaOptions.length)]
    },
    specialRequests: {
      stateChoice1: states[Math.floor(random(9) * states.length)],
      stateChoice2: states[Math.floor(random(10) * states.length)],
      stateChoice3: states[Math.floor(random(11) * states.length)],
      warmStateRequest: random(12) > 0.6,
      urbanSuburban: random(13) > 0.5,
      mountainStateRequest: random(14) > 0.7
    },
    directPlacement: {
      isDirectPlacement: random(15) > 0.9, // 10% chance of direct placement
      hostFamily: {
        name: '',
        phone: '',
        address: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zip: '',
        showManualEntry: false
      },
      school: {
        name: '',
        phone: '',
        address: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zip: '',
        showManualEntry: false
      }
    },
    studentEvaluation: {
      studentCharacter: generateStudentCharacter(firstName, country, random(16)),
      interviewerComments: generateInterviewerComments(firstName, random(17)),
      academicInterest: academicInterests[Math.floor(random(18) * academicInterests.length)],
      personalityTraits: {
        opinionated: scores[Math.floor(random(19) * scores.length)],
        nervous: scores[Math.floor(random(20) * scores.length)],
        shy: scores[Math.floor(random(21) * scores.length)],
        introspective: scores[Math.floor(random(22) * scores.length)],
        rigid: scores[Math.floor(random(23) * scores.length)],
        protected: scores[Math.floor(random(24) * scores.length)],
        passive: scores[Math.floor(random(25) * scores.length)]
      }
    },
    englishComprehension: {
      score: scores[Math.floor(random(26) * 8) + 2], // 3-10 range
      potentialSuccess: potentialSuccess[Math.floor(random(27) * potentialSuccess.length)],
      interviewReport: null
    }
  };
}

function generateStudentCharacter(firstName: string, country: string, random: number): string {
  const traits = [
    'enthusiastic and eager to learn',
    'mature and responsible',
    'friendly and outgoing',
    'curious about American culture',
    'respectful and well-mannered',
    'adaptable and flexible',
    'hardworking and dedicated',
    'creative and artistic',
    'athletic and active',
    'thoughtful and introspective'
  ];
  
  const strengths = [
    'excellent communication skills',
    'strong academic performance',
    'leadership abilities',
    'cultural awareness',
    'problem-solving skills',
    'teamwork abilities',
    'independence',
    'resilience'
  ];
  
  const appeals = [
    'genuine interest in American culture',
    'desire to share their own culture',
    'positive attitude and enthusiasm',
    'respectful nature',
    'eagerness to help with household activities',
    'love for learning new things',
    'ability to adapt to new situations',
    'strong family values'
  ];
  
  const trait = traits[Math.floor(random * traits.length)] || 'enthusiastic and eager to learn';
  const strength = strengths[Math.floor(random * strengths.length)] || 'excellent communication skills';
  const appeal = appeals[Math.floor(random * appeals.length)] || 'genuine interest in American culture';
  
  return `${firstName} is an ${trait} student from ${country}. They demonstrate ${strength} and have shown great maturity in their academic and personal pursuits. What will most appeal to a host family is their ${appeal}. ${firstName} is excited about the opportunity to experience American culture firsthand while sharing aspects of their own cultural background. They are committed to being a positive addition to their host family and contributing to household activities. This student shows excellent potential for a successful exchange experience.`;
}

function generateInterviewerComments(firstName: string, random: number): string {
  const comments = [
    `${firstName} presented themselves very well during the interview and demonstrated good English comprehension skills.`,
    `This student showed excellent motivation for participating in the exchange program and has realistic expectations.`,
    `${firstName} is well-prepared for the cultural adjustment and shows strong emotional maturity.`,
    `The interview revealed a student who is both independent and family-oriented, which will serve them well.`,
    `${firstName} expressed genuine enthusiasm for learning about American culture and sharing their own background.`,
    `This student demonstrates the flexibility and openness needed for a successful exchange experience.`
  ];
  
  return comments[Math.floor(random * comments.length)] || comments[0];
}

// Function to migrate and populate partner assessment data
function populatePartnerAssessmentData(existingData: any, firstName: string, lastName: string, country: string) {
  const comprehensiveData = existingData.comprehensive_application_data || {};
  
  // Generate missing data
  const missingData = generateMissingPartnerData(firstName, lastName, country);
  
  return {
    interview: {
      length: String(comprehensiveData.interview?.length || missingData.interview.length).replace(' minutes', ''),
      date: comprehensiveData.interview?.date || missingData.interview.date,
      interviewer: comprehensiveData.interview?.interviewer || missingData.interview.interviewer,
      studentGradeLevel: existingData.school_grade || missingData.interview.studentGradeLevel,
      recommendedGrade: existingData.school_grade || missingData.interview.recommendedGrade,
      gpa: comprehensiveData.interview?.gpaAssessment?.split(' ')[0] || missingData.interview.gpa
    },
    specialRequests: {
      stateChoice1: comprehensiveData.preferredStates?.[0] || missingData.specialRequests.stateChoice1,
      stateChoice2: comprehensiveData.preferredStates?.[1] || missingData.specialRequests.stateChoice2,
      stateChoice3: comprehensiveData.preferredStates?.[2] || missingData.specialRequests.stateChoice3,
      warmStateRequest: missingData.specialRequests.warmStateRequest,
      urbanSuburban: missingData.specialRequests.urbanSuburban,
      mountainStateRequest: missingData.specialRequests.mountainStateRequest
    },
    directPlacement: missingData.directPlacement,
    studentEvaluation: {
      studentCharacter: comprehensiveData.personalityAssessment || missingData.studentEvaluation.studentCharacter,
      interviewerComments: missingData.studentEvaluation.interviewerComments,
      academicInterest: missingData.studentEvaluation.academicInterest,
      personalityTraits: {
        opinionated: String(comprehensiveData.personalityRatings?.adaptability || missingData.studentEvaluation.personalityTraits.opinionated),
        nervous: String(comprehensiveData.personalityRatings?.maturity || missingData.studentEvaluation.personalityTraits.nervous),
        shy: String(comprehensiveData.personalityRatings?.shyToOutgoing || missingData.studentEvaluation.personalityTraits.shy),
        introspective: String(comprehensiveData.personalityRatings?.outgoingFun || missingData.studentEvaluation.personalityTraits.introspective),
        rigid: String(comprehensiveData.personalityRatings?.englishLevel || missingData.studentEvaluation.personalityTraits.rigid),
        protected: String(comprehensiveData.personalityRatings?.positiveAttitude || missingData.studentEvaluation.personalityTraits.protected),
        passive: String(comprehensiveData.personalityRatings?.seriousToEasygoing || missingData.studentEvaluation.personalityTraits.passive)
      }
    },
    englishComprehension: {
      score: String(comprehensiveData.personalityRatings?.englishLevel || missingData.englishComprehension.score),
      potentialSuccess: missingData.englishComprehension.potentialSuccess,
      interviewReport: null
    }
  };
}

async function populatePartnerAssessmentFields() {
  console.log('🔄 Populating partner assessment fields with existing data...\n');
  
  try {
    // Query SEVIS students
    const result = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      }
    });

    const allStudents = result.profiles || [];
    console.log(`📊 Found ${allStudents.length} student profiles`);

    // Filter for SEVIS students (approved students)
    const sevisStudents = allStudents.filter(profile => 
      profile.data?.applicationStatus === 'approved'
    );

    console.log(`🎯 Found ${sevisStudents.length} SEVIS students to populate\n`);

    if (sevisStudents.length === 0) {
      console.log('❌ No SEVIS students found to populate');
      return;
    }

    // Process in batches
    const batchSize = 25;
    let processed = 0;

    for (let i = 0; i < sevisStudents.length; i += batchSize) {
      const batch = sevisStudents.slice(i, i + batchSize);
      console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(sevisStudents.length / batchSize)} (${batch.length} students)`);
      
      const transactions = [];
      
      for (const profile of batch) {
        try {
          const data = profile.data;
          const firstName = data?.first_name || 'Unknown';
          const lastName = data?.last_name || 'Student';
          const country = data?.country_of_origin || 'Unknown';
          const studentName = `${firstName} ${lastName}`;
          
          console.log(`  🔄 ${studentName}: Populating partner assessment data`);
          
          // Populate partner assessment data from existing comprehensive data
          const partnerAssessment = populatePartnerAssessmentData(data, firstName, lastName, country);
          
          // Update profile with populated partner assessment data
          const updatedData = {
            ...data,
            partnerAssessment
          };
          
                     if (tx.profiles && tx.profiles[profile.id]) {
             transactions.push(
               tx.profiles[profile.id].update({
                 data: updatedData,
                 updatedAt: new Date()
               })
             );
           }
          
          processed++;
        } catch (err) {
          console.error(`❌ Error processing student ${profile.id}:`, err);
        }
      }
      
      if (transactions.length > 0) {
        await db.transact(transactions);
        console.log(`✅ Successfully populated ${transactions.length} profiles in this batch`);
      }
    }

    console.log('\n🎉 Partner assessment data population completed!');
    console.log(`📈 Summary:`);
    console.log(`   - Total students processed: ${processed}`);
    console.log(`   - Partner assessment fields populated with existing comprehensive data`);
    console.log(`   - Missing fields filled with realistic generated data`);
    
  } catch (error) {
    console.error('❌ Failed to populate partner assessment fields:', error);
    process.exit(1);
  }
}

// Run the population script
populatePartnerAssessmentFields()
  .then(() => {
    console.log('\n🎉 Partner assessment data population completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   - Test the student application form with populated data');
    console.log('   - Verify the view components display the correct information');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to populate partner assessment data:', error);
    process.exit(1);
  });

/*
 * To run this script:
 * cd packages/database
 * pnpm tsx src/scripts/populate-partner-assessment-data.ts
 */ 