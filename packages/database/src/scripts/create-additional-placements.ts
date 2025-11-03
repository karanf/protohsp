#!/usr/bin/env tsx

/**
 * Create Additional Placement Data for InstantDB
 * This script creates 55 additional realistic placement records
 */

import dotenv from 'dotenv';

// Load .env files
dotenv.config({ path: '.env.local' });

import { init, id } from '@instantdb/admin';

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

if (!INSTANT_APP_ID || !INSTANT_ADMIN_TOKEN) {
  console.error('Missing InstantDB credentials');
  process.exit(1);
}

const adminDb = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

// Realistic data arrays
const studentNames = [
  { first: 'Sofia', last: 'Rodriguez', country: 'Spain', gender: 'Female' },
  { first: 'Marcus', last: 'Johansson', country: 'Sweden', gender: 'Male' },
  { first: 'Elena', last: 'Rossi', country: 'Italy', gender: 'Female' },
  { first: 'Hiroshi', last: 'Tanaka', country: 'Japan', gender: 'Male' },
  { first: 'Marie', last: 'Dubois', country: 'France', gender: 'Female' },
  { first: 'Carlos', last: 'Santos', country: 'Brazil', gender: 'Male' },
  { first: 'Anna', last: 'Kowalski', country: 'Poland', gender: 'Female' },
  { first: 'Johan', last: 'van der Berg', country: 'Netherlands', gender: 'Male' },
  { first: 'Yuki', last: 'Nakamura', country: 'Japan', gender: 'Female' },
  { first: 'Diego', last: 'Fernandez', country: 'Mexico', gender: 'Male' },
  { first: 'Isabella', last: 'Marino', country: 'Italy', gender: 'Female' },
  { first: 'Finn', last: 'O\'Sullivan', country: 'Ireland', gender: 'Male' },
  { first: 'Camille', last: 'Leblanc', country: 'France', gender: 'Female' },
  { first: 'Pietro', last: 'Bianchi', country: 'Italy', gender: 'Male' },
  { first: 'Astrid', last: 'Hansen', country: 'Denmark', gender: 'Female' },
  { first: 'Rafael', last: 'Silva', country: 'Portugal', gender: 'Male' },
  { first: 'Ingrid', last: 'Larsson', country: 'Sweden', gender: 'Female' },
  { first: 'Matteo', last: 'Ferrari', country: 'Italy', gender: 'Male' },
  { first: 'Amélie', last: 'Martin', country: 'France', gender: 'Female' },
  { first: 'Kai', last: 'Weber', country: 'Germany', gender: 'Male' },
  { first: 'Lucia', last: 'Garcia', country: 'Spain', gender: 'Female' },
  { first: 'Erik', last: 'Nielsen', country: 'Norway', gender: 'Male' },
  { first: 'Valentina', last: 'Romano', country: 'Italy', gender: 'Female' },
  { first: 'Sebastian', last: 'Müller', country: 'Germany', gender: 'Male' },
  { first: 'Chloe', last: 'Moreau', country: 'France', gender: 'Female' },
  { first: 'Alessandro', last: 'Conti', country: 'Italy', gender: 'Male' },
  { first: 'Emilia', last: 'Andersson', country: 'Sweden', gender: 'Female' },
  { first: 'Matias', last: 'Gonzalez', country: 'Argentina', gender: 'Male' },
  { first: 'Clara', last: 'Schneider', country: 'Germany', gender: 'Female' },
  { first: 'Luca', last: 'Ricci', country: 'Italy', gender: 'Male' },
  { first: 'Zoe', last: 'Petit', country: 'France', gender: 'Female' },
  { first: 'Hugo', last: 'Andersen', country: 'Denmark', gender: 'Male' },
  { first: 'Giulia', last: 'Esposito', country: 'Italy', gender: 'Female' },
  { first: 'Felix', last: 'Fischer', country: 'Germany', gender: 'Male' },
  { first: 'Manon', last: 'Roux', country: 'France', gender: 'Female' },
  { first: 'Lorenzo', last: 'Galli', country: 'Italy', gender: 'Male' },
  { first: 'Nora', last: 'Olsen', country: 'Norway', gender: 'Female' },
  { first: 'Pablo', last: 'Moreno', country: 'Spain', gender: 'Male' },
  { first: 'Linnea', last: 'Svensson', country: 'Sweden', gender: 'Female' },
  { first: 'Gabriele', last: 'Costa', country: 'Italy', gender: 'Male' },
  { first: 'Léa', last: 'Bernard', country: 'France', gender: 'Female' },
  { first: 'Oscar', last: 'Lindberg', country: 'Sweden', gender: 'Male' },
  { first: 'Chiara', last: 'Lombardi', country: 'Italy', gender: 'Female' },
  { first: 'Maximilian', last: 'Bauer', country: 'Germany', gender: 'Male' },
  { first: 'Jade', last: 'Garnier', country: 'France', gender: 'Female' },
  { first: 'Andrea', last: 'Mancini', country: 'Italy', gender: 'Male' },
  { first: 'Saga', last: 'Karlsson', country: 'Sweden', gender: 'Female' },
  { first: 'Adrian', last: 'Lopez', country: 'Spain', gender: 'Male' },
  { first: 'Emma', last: 'Christensen', country: 'Denmark', gender: 'Female' },
  { first: 'Nicolo', last: 'Greco', country: 'Italy', gender: 'Male' },
  { first: 'Eloise', last: 'Rousseau', country: 'France', gender: 'Female' },
  { first: 'Viktor', last: 'Petersson', country: 'Sweden', gender: 'Male' },
  { first: 'Francesca', last: 'Benedetti', country: 'Italy', gender: 'Female' },
  { first: 'Leon', last: 'Hoffmann', country: 'Germany', gender: 'Male' },
  { first: 'Margot', last: 'Leroy', country: 'France', gender: 'Female' },
  { first: 'Davide', last: 'Caruso', country: 'Italy', gender: 'Male' }
];

const hostFamilyNames = [
  { first: 'Robert', last: 'Anderson', city: 'Seattle', state: 'WA' },
  { first: 'Sarah', last: 'Williams', city: 'Portland', state: 'OR' },
  { first: 'David', last: 'Brown', city: 'San Francisco', state: 'CA' },
  { first: 'Lisa', last: 'Davis', city: 'Austin', state: 'TX' },
  { first: 'Mark', last: 'Wilson', city: 'Denver', state: 'CO' },
  { first: 'Amy', last: 'Miller', city: 'Atlanta', state: 'GA' },
  { first: 'John', last: 'Moore', city: 'Phoenix', state: 'AZ' },
  { first: 'Jessica', last: 'Taylor', city: 'Charlotte', state: 'NC' },
  { first: 'Brian', last: 'Johnson', city: 'Minneapolis', state: 'MN' },
  { first: 'Michelle', last: 'White', city: 'Tampa', state: 'FL' },
  { first: 'Kevin', last: 'Martin', city: 'Nashville', state: 'TN' },
  { first: 'Rachel', last: 'Thompson', city: 'Kansas City', state: 'MO' },
  { first: 'Steven', last: 'Garcia', city: 'Salt Lake City', state: 'UT' },
  { first: 'Jennifer', last: 'Martinez', city: 'Albuquerque', state: 'NM' },
  { first: 'Matthew', last: 'Robinson', city: 'Richmond', state: 'VA' },
  { first: 'Laura', last: 'Clark', city: 'Milwaukee', state: 'WI' },
  { first: 'Christopher', last: 'Rodriguez', city: 'Oklahoma City', state: 'OK' },
  { first: 'Stephanie', last: 'Lewis', city: 'Louisville', state: 'KY' },
  { first: 'Daniel', last: 'Lee', city: 'Omaha', state: 'NE' },
  { first: 'Kimberly', last: 'Walker', city: 'Tucson', state: 'AZ' },
  { first: 'Paul', last: 'Hall', city: 'Fresno', state: 'CA' },
  { first: 'Nancy', last: 'Allen', city: 'Mesa', state: 'AZ' },
  { first: 'Richard', last: 'Young', city: 'Virginia Beach', state: 'VA' },
  { first: 'Sandra', last: 'Hernandez', city: 'Oakland', state: 'CA' },
  { first: 'Anthony', last: 'King', city: 'Miami', state: 'FL' },
  { first: 'Donna', last: 'Wright', city: 'Tulsa', state: 'OK' },
  { first: 'Kenneth', last: 'Lopez', city: 'Honolulu', state: 'HI' },
  { first: 'Carol', last: 'Hill', city: 'Cleveland', state: 'OH' },
  { first: 'Jason', last: 'Scott', city: 'New Orleans', state: 'LA' },
  { first: 'Helen', last: 'Green', city: 'Bakersfield', state: 'CA' },
  { first: 'Jeffrey', last: 'Adams', city: 'Tampa', state: 'FL' },
  { first: 'Deborah', last: 'Baker', city: 'Aurora', state: 'CO' },
  { first: 'Ryan', last: 'Gonzalez', city: 'Anaheim', state: 'CA' },
  { first: 'Sharon', last: 'Nelson', city: 'Santa Ana', state: 'CA' },
  { first: 'Jacob', last: 'Carter', city: 'Riverside', state: 'CA' },
  { first: 'Michelle', last: 'Mitchell', city: 'Corpus Christi', state: 'TX' },
  { first: 'Frank', last: 'Perez', city: 'Lexington', state: 'KY' },
  { first: 'Amy', last: 'Roberts', city: 'Stockton', state: 'CA' },
  { first: 'Gary', last: 'Turner', city: 'Cincinnati', state: 'OH' },
  { first: 'Shirley', last: 'Phillips', city: 'St. Paul', state: 'MN' },
  { first: 'Eric', last: 'Campbell', city: 'Toledo', state: 'OH' },
  { first: 'Anna', last: 'Parker', city: 'Newark', state: 'NJ' },
  { first: 'Gregory', last: 'Evans', city: 'Greensboro', state: 'NC' },
  { first: 'Ruth', last: 'Edwards', city: 'Plano', state: 'TX' },
  { first: 'Jonathan', last: 'Collins', city: 'Henderson', state: 'NV' },
  { first: 'Frances', last: 'Stewart', city: 'Lincoln', state: 'NE' },
  { first: 'Harold', last: 'Sanchez', city: 'Buffalo', state: 'NY' },
  { first: 'Catherine', last: 'Morris', city: 'Jersey City', state: 'NJ' },
  { first: 'Jack', last: 'Rogers', city: 'Chula Vista', state: 'CA' },
  { first: 'Janice', last: 'Reed', city: 'Fort Wayne', state: 'IN' },
  { first: 'Carl', last: 'Cook', city: 'Orlando', state: 'FL' },
  { first: 'Martha', last: 'Morgan', city: 'St. Petersburg', state: 'FL' },
  { first: 'Henry', last: 'Bell', city: 'Chandler', state: 'AZ' },
  { first: 'Julie', last: 'Murphy', city: 'Laredo', state: 'TX' },
  { first: 'Peter', last: 'Bailey', city: 'Norfolk', state: 'VA' },
  { first: 'Cheryl', last: 'Rivera', city: 'Durham', state: 'NC' }
];

const coordinatorNames = [
  { first: 'Patricia', last: 'Evans', region: 'Pacific Northwest' },
  { first: 'Michael', last: 'Rodriguez', region: 'Southwest' },
  { first: 'Linda', last: 'Jackson', region: 'Southeast' },
  { first: 'William', last: 'Thompson', region: 'Midwest' },
  { first: 'Elizabeth', last: 'Garcia', region: 'Northeast' },
  { first: 'James', last: 'Martinez', region: 'Mountain West' },
  { first: 'Barbara', last: 'Anderson', region: 'Great Lakes' },
  { first: 'Charles', last: 'Wilson', region: 'South Central' }
];

const schools = [
  'Roosevelt High School', 'Lincoln Academy', 'Washington High School', 'Jefferson High',
  'Madison High School', 'Franklin Academy', 'Kennedy High School', 'Wilson High',
  'Jackson High School', 'Adams Academy', 'Monroe High School', 'Tyler High',
  'Harrison High School', 'Cleveland Academy', 'Grant High School', 'Pierce High',
  'Buchanan High School', 'Johnson Academy', 'Lincoln High School', 'Reagan High',
  'Carter High School', 'Bush Academy', 'Clinton High School', 'Obama High',
  'Trump High School', 'Biden Academy', 'Hamilton High School', 'Jefferson Academy',
  'Central High School', 'North High School', 'South Academy', 'East High',
  'West High School', 'Riverside Academy', 'Hillside High School', 'Valley High',
  'Mountain High School', 'Sunset Academy', 'Sunrise High School', 'Meadow High'
];

const grades = ['9', '10', '11', '12'];
const statuses = ['active', 'pending', 'completed', 'cancelled'];
const programDurations = ['semester', 'academic_year', 'summer'];

// Helper function to get random item from array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random date in range
function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function createAdditionalPlacements() {
  try {
    console.log('🚀 Creating 55 additional placement records in InstantDB...\n');

    // Create coordinator users and profiles first
    console.log('Creating coordinators...');
    const coordinatorUsers = [];
    const coordinatorProfiles = [];
    
    for (const coord of coordinatorNames) {
      const userId = id();
      const profileId = id();
      const user = {
        id: userId,
        email: `${coord.first.toLowerCase()}.${coord.last.toLowerCase()}@greenheart.org`,
        role: 'local_coordinator',
        firstName: coord.first,
        lastName: coord.last,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await adminDb.transact([adminDb.tx.users[userId].update(user)]);
      coordinatorUsers.push(user);

      const profile = {
        id: profileId,
        userId: userId,
        type: 'local_coordinator',
        data: {
          firstName: coord.first,
          lastName: coord.last,
          email: user.email,
          region: coord.region
        },
        status: 'active',
        verified: true,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      await adminDb.transact([adminDb.tx.profiles[profileId].update({
        userId: profile.userId,
        type: profile.type,
        data: profile.data,
        status: profile.status,
        verified: profile.verified,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      })]);
      
      coordinatorProfiles.push(profile);
      console.log(`✅ Created coordinator: ${coord.first} ${coord.last}`);
    }

    // Create 55 student-host family pairs and placements
    console.log('\nCreating students, host families, and placements...');
    
    for (let i = 0; i < 55; i++) {
      const student = studentNames[i];
      const hostFamily = hostFamilyNames[i];
      
      // Create student user and profile
      const studentUserId = id();
      const studentProfileId = id();
      const studentUser = {
        id: studentUserId,
        email: `${student.first.toLowerCase()}.${student.last.toLowerCase()}@student.com`,
        role: 'student',
        firstName: student.first,
        lastName: student.last,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await adminDb.transact([adminDb.tx.users[studentUserId].update(studentUser)]);

      const studentProfile = {
        userId: studentUserId,
        type: 'student',
        data: {
          firstName: student.first,
          lastName: student.last,
          email: studentUser.email,
          country: student.country,
          dateOfBirth: `200${Math.floor(Math.random() * 3) + 6}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          gender: student.gender,
          program: getRandomItem(['Academic Year', 'Semester Exchange', 'Summer Program'])
        },
        status: 'active',
        verified: true,
        createdAt: studentUser.createdAt,
        updatedAt: studentUser.updatedAt
      };

      await adminDb.transact([adminDb.tx.profiles[studentProfileId].update({
        userId: studentProfile.userId,
        type: studentProfile.type,
        data: studentProfile.data,
        status: studentProfile.status,
        verified: studentProfile.verified,
        createdAt: studentProfile.createdAt,
        updatedAt: studentProfile.updatedAt
      })]);

      // Create host family user and profile
      const hostUserId = id();
      const hostProfileId = id();
      const hostUser = {
        id: hostUserId,
        email: `${hostFamily.first.toLowerCase()}.${hostFamily.last.toLowerCase()}@family.com`,
        role: 'host_family',
        firstName: hostFamily.first,
        lastName: hostFamily.last,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await adminDb.transact([adminDb.tx.users[hostUserId].update(hostUser)]);

      const hostProfile = {
        userId: hostUserId,
        type: 'host_family',
        data: {
          firstName: hostFamily.first,
          lastName: hostFamily.last,
          email: hostUser.email,
          phone: `555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          city: hostFamily.city,
          state: hostFamily.state,
          country: 'USA'
        },
        status: 'active',
        verified: true,
        createdAt: hostUser.createdAt,
        updatedAt: hostUser.updatedAt
      };

      await adminDb.transact([adminDb.tx.profiles[hostProfileId].update({
        userId: hostProfile.userId,
        type: hostProfile.type,
        data: hostProfile.data,
        status: hostProfile.status,
        verified: hostProfile.verified,
        createdAt: hostProfile.createdAt,
        updatedAt: hostProfile.updatedAt
      })]);

      // Create placement
      const placementId = id();
      const startDate = getRandomDate(new Date('2024-01-01'), new Date('2024-09-01'));
      const endDate = new Date(startDate);
      const duration = getRandomItem(programDurations);
      
      if (duration === 'semester') {
        endDate.setMonth(endDate.getMonth() + 5);
      } else if (duration === 'academic_year') {
        endDate.setMonth(endDate.getMonth() + 10);
      } else { // summer
        endDate.setMonth(endDate.getMonth() + 2);
      }

      const placement = {
        id: placementId,
        studentProfileId: studentProfileId,
        hostFamilyProfileId: hostProfileId,
        coordinatorProfileId: getRandomItem(coordinatorProfiles).id,
        status: getRandomItem(statuses),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        school: getRandomItem(schools),
        grade: getRandomItem(grades),
        programDuration: duration,
        emergencyContactName: `${student.first === 'Sofia' ? 'Maria' : student.first === 'Marcus' ? 'Erik' : 'Parent'} ${student.last}`,
        emergencyContactPhone: `+${student.country === 'Spain' ? '34' : student.country === 'Sweden' ? '46' : student.country === 'Italy' ? '39' : '33'}-${Math.floor(Math.random() * 900000000) + 100000000}`,
        emergencyContactRelationship: getRandomItem(['Mother', 'Father', 'Guardian']),
        notes: getRandomItem([
          'Student is adapting well to American culture',
          'Excellent academic performance',
          'Very involved in school activities',
          'Learning English quickly',
          'Great relationship with host family',
          'Participating in sports teams',
          'Volunteer work in community',
          'Interested in STEM programs'
        ]),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await adminDb.transact([adminDb.tx.placements[placementId].update({
        studentProfileId: placement.studentProfileId,
        hostFamilyProfileId: placement.hostFamilyProfileId,
        coordinatorProfileId: placement.coordinatorProfileId,
        status: placement.status,
        startDate: placement.startDate,
        endDate: placement.endDate,
        school: placement.school,
        grade: placement.grade,
        programDuration: placement.programDuration,
        emergencyContactName: placement.emergencyContactName,
        emergencyContactPhone: placement.emergencyContactPhone,
        emergencyContactRelationship: placement.emergencyContactRelationship,
        notes: placement.notes,
        createdAt: placement.createdAt,
        updatedAt: placement.updatedAt
      })]);

      console.log(`✅ Created placement ${i + 1}/55: ${student.first} ${student.last} → ${hostFamily.first} ${hostFamily.last} Family`);
    }

    console.log('\n🎉 Successfully created 55 additional placement records!');
    console.log('Total placements in database: 57 (2 existing + 55 new)');

  } catch (error) {
    console.error('💥 Failed to create additional placements:', error);
    
    if (error instanceof Error && 'body' in error) {
      const errorBody = (error as any).body;
      console.log('Full error body:', JSON.stringify(errorBody, null, 2));
      
      if (errorBody.hint?.errors) {
        console.log('Specific errors:', JSON.stringify(errorBody.hint.errors, null, 2));
      }
    }
    
    throw error;
  }
}

// Run the function
createAdditionalPlacements(); 