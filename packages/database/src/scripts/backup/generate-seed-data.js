#!/usr/bin/env node

/**
 * Seed Data Generator for EGAB
 * 
 * This script generates seed data with:
 * - Regional Directors (one per state)
 * - Local Coordinators (5-20 per Regional Director)
 * - Host Families (0-10 per Coordinator)
 * - 100 Students (unassigned)
 */

const crypto = require('crypto');

// Configuration
const TOTAL_STUDENTS = 100;
const COORDINATORS_PER_DIRECTOR_MIN = 5;
const COORDINATORS_PER_DIRECTOR_MAX = 10;
const HOST_FAMILIES_PER_COORDINATOR_MIN = 0;
const HOST_FAMILIES_PER_COORDINATOR_MAX = 10;
const STUDENT_AGE_MIN = 13;
const STUDENT_AGE_MAX = 17;
// Define program types
const PROGRAM_TYPES = [
  { 
    id: 'academic_year', 
    name: 'Academic Year', 
    description: 'Full academic year program (10 months)',
    duration_months: 10
  },
  { 
    id: 'semester_fall', 
    name: 'Fall Semester', 
    description: 'Fall semester program (5 months)',
    duration_months: 5
  },
  { 
    id: 'semester_spring', 
    name: 'Spring Semester', 
    description: 'Spring semester program (5 months)',
    duration_months: 5
  },
  { 
    id: 'trimester', 
    name: 'Trimester', 
    description: 'Three month cultural immersion program',
    duration_months: 3
  },
  { 
    id: 'summer', 
    name: 'Summer Program', 
    description: 'Summer cultural experience (2 months)',
    duration_months: 2
  }
];

// Helper function to generate simple IDs
const generateSimpleId = (prefix) => {
  // Simpler ID format: prefix-random6chars
  return `${prefix}-${Math.random().toString(36).substring(2, 8)}`;
};

// Helper function to generate IDs for specific entities
const generateId = (type) => {
  switch(type) {
    case 'director':
      return generateSimpleId('dir');
    case 'director_profile':
      return generateSimpleId('dirp');
    case 'coordinator':
      return generateSimpleId('coord');
    case 'coordinator_profile':
      return generateSimpleId('coordp');
    case 'host':
      return generateSimpleId('host');
    case 'host_profile':
      return generateSimpleId('hostp');
    case 'student':
      return generateSimpleId('stud');
    case 'student_profile':
      return generateSimpleId('studp');
    case 'relationship':
      return generateSimpleId('rel');
    case 'sending_org':
      return generateSimpleId('org');
    case 'sending_org_profile':
      return generateSimpleId('orgp');
    default:
      return generateSimpleId('id');
  }
};

// US States with major education centers - first 10 states for now
const US_STATES = [
  { 
    name: 'Alabama', 
    code: 'AL', 
    population: 5024279,
    cities: [
      { name: 'Birmingham', schools: ['Hoover High School', 'Mountain Brook High School', 'Vestavia Hills High School'] },
      { name: 'Montgomery', schools: ['Montgomery Academy', 'LAMP High School'] },
      { name: 'Mobile', schools: ['UMS-Wright Preparatory School', 'McGill-Toolen Catholic High School'] },
      { name: 'Huntsville', schools: ['Huntsville High School', 'Grissom High School'] }
    ]
  },
  { 
    name: 'Alaska', 
    code: 'AK', 
    population: 733391,
    cities: [
      { name: 'Anchorage', schools: ['West Anchorage High School', 'East Anchorage High School'] },
      { name: 'Fairbanks', schools: ['West Valley High School', 'Lathrop High School'] },
      { name: 'Juneau', schools: ['Juneau-Douglas High School', 'Thunder Mountain High School'] }
    ]
  },
  { 
    name: 'Arizona', 
    code: 'AZ', 
    population: 7278717,
    cities: [
      { name: 'Phoenix', schools: ['Brophy College Preparatory', 'Xavier College Preparatory'] },
      { name: 'Tucson', schools: ['Catalina Foothills High School', 'University High School'] },
      { name: 'Scottsdale', schools: ['Chaparral High School', 'Desert Mountain High School'] }
    ]
  },
  { 
    name: 'Arkansas', 
    code: 'AR', 
    population: 3017804,
    cities: [
      { name: 'Little Rock', schools: ['Central High School', 'Pulaski Academy'] },
      { name: 'Fayetteville', schools: ['Fayetteville High School', 'Haas Hall Academy'] },
      { name: 'Bentonville', schools: ['Bentonville High School', 'Bentonville West High School'] }
    ]
  },
  { 
    name: 'California', 
    code: 'CA', 
    population: 39512223,
    cities: [
      { name: 'Los Angeles', schools: ['Harvard-Westlake School', 'Marlborough School'] },
      { name: 'San Francisco', schools: ['Lowell High School', 'St. Ignatius College Preparatory'] },
      { name: 'San Diego', schools: ['The Bishop\'s School', 'La Jolla High School'] }
    ]
  },
  { 
    name: 'Colorado', 
    code: 'CO', 
    population: 5758736,
    cities: [
      { name: 'Denver', schools: ['East High School', 'Denver School of the Arts'] },
      { name: 'Boulder', schools: ['Boulder High School', 'Fairview High School'] },
      { name: 'Colorado Springs', schools: ['Cheyenne Mountain High School', 'The Classical Academy'] }
    ]
  },
  { 
    name: 'Connecticut', 
    code: 'CT', 
    population: 3565287,
    cities: [
      { name: 'Hartford', schools: ['Hartford Public High School', 'Greater Hartford Academy of the Arts'] },
      { name: 'New Haven', schools: ['Hopkins School', 'Wilbur Cross High School'] },
      { name: 'Stamford', schools: ['Stamford High School', 'Westhill High School'] }
    ]
  },
  { 
    name: 'Delaware', 
    code: 'DE', 
    population: 973764,
    cities: [
      { name: 'Wilmington', schools: ['Charter School of Wilmington', 'Wilmington Friends School'] },
      { name: 'Dover', schools: ['Dover High School', 'Polytech High School'] },
      { name: 'Newark', schools: ['Newark High School', 'Newark Charter School'] }
    ]
  },
  { 
    name: 'Florida', 
    code: 'FL', 
    population: 21477737,
    cities: [
      { name: 'Miami', schools: ['Ransom Everglades School', 'Gulliver Preparatory School'] },
      { name: 'Orlando', schools: ['Lake Highland Preparatory School', 'Trinity Preparatory School'] },
      { name: 'Tampa', schools: ['Berkeley Preparatory School', 'Plant High School'] }
    ]
  },
  { 
    name: 'Georgia', 
    code: 'GA', 
    population: 10617423,
    cities: [
      { name: 'Atlanta', schools: ['Westminster Schools', 'Pace Academy'] },
      { name: 'Savannah', schools: ['Savannah Arts Academy', 'Savannah Country Day School'] },
      { name: 'Athens', schools: ['Clarke Central High School', 'Cedar Shoals High School'] }
    ]
  }
];

// Helper functions
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const generatePhone = () => {
  return `${getRandomNumber(200, 999)}-${getRandomNumber(100, 999)}-${getRandomNumber(1000, 9999)}`;
};
const generateEmail = (firstName, lastName, domain) => {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
};

// SQL string escape helper
const escapeSQL = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/'/g, "''");
};

// JSON string escape helper for PostgreSQL
const escapeJSONB = (obj) => {
  return JSON.stringify(obj).replace(/'/g, "''");
};

// Generate SQL header
console.log(`-- Clean up existing data if needed
TRUNCATE users, profiles CASCADE;

-- Admin users
INSERT INTO users (id, email, role, first_name, last_name, phone, avatar_url, status, metadata, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@example.com', 'admin', 'System', 'Administrator', '555-123-4567', 'https://ui-avatars.com/api/?name=System+Administrator', 'active', '{"department": "IT", "hire_date": "2022-01-15"}', NOW(), NOW()),
('00000000-0000-0000-0000-000000000002', 'director@example.com', 'admin', 'Program', 'Director', '555-987-6543', 'https://ui-avatars.com/api/?name=Program+Director', 'active', '{"department": "Operations", "hire_date": "2021-03-10"}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;`);

// Regional Director first and last names
const DIRECTOR_FIRST_NAMES = [
  'Robert', 'James', 'William', 'David', 'Michael', 
  'Jennifer', 'Elizabeth', 'Susan', 'Carol', 'Patricia'
];
const DIRECTOR_LAST_NAMES = [
  'Anderson', 'Wilson', 'Taylor', 'Thomas', 'Moore',
  'Jackson', 'Martin', 'Lee', 'Thompson', 'White'
];

// Generate Regional Directors (one per state)
console.log(`\n-- Regional Directors (${US_STATES.length} total)`);
let regionalDirectorUserSql = `INSERT INTO users (id, email, role, first_name, last_name, phone, avatar_url, status, metadata, created_at, updated_at) VALUES\n`;

// Track regional director users
const regionalDirectorUsers = [];

US_STATES.forEach((state, index) => {
  const firstName = DIRECTOR_FIRST_NAMES[index % DIRECTOR_FIRST_NAMES.length];
  const lastName = DIRECTOR_LAST_NAMES[index % DIRECTOR_LAST_NAMES.length];
  const userId = generateId('director');
  const email = `director.${state.code.toLowerCase()}@example.com`;
  const phone = generatePhone();
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+${encodeURIComponent(lastName)}`;
  const metadata = { 
    state: state.name, 
    hire_date: `2021-${getRandomNumber(1, 12)}-${getRandomNumber(1, 28)}` 
  };
  
  // Add to regionalDirectorUsers array
  regionalDirectorUsers.push({
    id: userId,
    email,
    firstName,
    lastName,
    role: 'regional_director',
    state: state.code
  });
  
  regionalDirectorUserSql += `('${userId}', '${escapeSQL(email)}', 'regional_director', '${escapeSQL(firstName)}', '${escapeSQL(lastName)}', '${escapeSQL(phone)}', '${escapeSQL(avatarUrl)}', 'active', '${escapeJSONB(metadata)}', NOW(), NOW())`;
  regionalDirectorUserSql += index < US_STATES.length - 1 ? ',\n' : '\nON CONFLICT (id) DO UPDATE SET\n';
  
  if (index === US_STATES.length - 1) {
    regionalDirectorUserSql += `  email = EXCLUDED.email,
  role = EXCLUDED.role,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  updated_at = NOW();`;
  }
});

console.log(regionalDirectorUserSql);

// Generate Director Profiles
console.log(`\n-- Regional Director Profiles`);
let regionalDirectorProfileSql = `INSERT INTO profiles (id, user_id, type, data, status, verified, created_at, updated_at) VALUES\n`;

regionalDirectorUsers.forEach((director, index) => {
  const profileId = generateId('director_profile');
  const state = US_STATES.find(s => s.code === director.state);
  const regionsCovered = state.cities.map(city => city.name);
  
  const profileData = {
    address: `${getRandomNumber(100, 999)} Main St, ${state.cities[0].name}, ${state.code} ${getRandomNumber(10000, 99999)}`,
    background_check_date: `2021-${getRandomNumber(1, 12)}-${getRandomNumber(1, 28)}`,
    training_completed: true,
    training_date: `2021-${getRandomNumber(1, 12)}-${getRandomNumber(1, 28)}`,
    state: state.name,
    regions_covered: regionsCovered,
    languages: ["English"],
    years_experience: getRandomNumber(3, 15),
    bio: `${director.firstName} manages the exchange student program across ${state.name}, working with local coordinators and host families.`
  };
  
  regionalDirectorProfileSql += `('${profileId}', '${director.id}', 'regional_director', '${escapeJSONB(profileData)}', 'active', true, NOW(), NOW())`;
  regionalDirectorProfileSql += index < regionalDirectorUsers.length - 1 ? ',\n' : '\nON CONFLICT (user_id, type) DO UPDATE SET\n';
  
  if (index === regionalDirectorUsers.length - 1) {
    regionalDirectorProfileSql += `  data = EXCLUDED.data,
  status = EXCLUDED.status,
  updated_at = NOW();`;
  }
});

console.log(regionalDirectorProfileSql);

// Coordinator first and last names
const COORDINATOR_FIRST_NAMES = [
  'Sarah', 'Michael', 'Jessica', 'David', 'Emily', 
  'Christopher', 'Ashley', 'Matthew', 'Amanda', 'Daniel',
  'Rachel', 'Joshua', 'Stephanie', 'Andrew', 'Lauren',
  'Kevin', 'Megan', 'Brian', 'Nicole', 'Ryan'
];
const COORDINATOR_LAST_NAMES = [
  'Williams', 'Johnson', 'Smith', 'Jones', 'Brown',
  'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson',
  'Thomas', 'Garcia', 'Clark', 'Lewis', 'Allen',
  'Young', 'Hall', 'Walker', 'Wright', 'Harris'
];

// Generate Local Coordinators (5-10 per Regional Director)
console.log(`\n-- Local Coordinators`);
let coordinatorUserSql = `INSERT INTO users (id, email, role, first_name, last_name, phone, avatar_url, status, metadata, created_at, updated_at) VALUES\n`;
let coordinatorProfileSql = `INSERT INTO profiles (id, user_id, type, data, status, verified, created_at, updated_at) VALUES\n`;
let directorCoordinatorRelSql = `INSERT INTO relationships (id, type, primary_id, secondary_id, status, start_date, data, created_at, updated_at) VALUES\n`;

// Track profiles for relationship creation
const directorProfiles = {};
const coordinatorProfiles = {};

// First, recreate the director profile IDs for relationships
regionalDirectorUsers.forEach((director) => {
  // Generate a profile ID for each director
  const profileId = generateId('director_profile');
  directorProfiles[director.state] = profileId;
});

// Now generate coordinators
let coordinatorCount = 0;
let relationshipCount = 0;

// Track coordinator users for relationships
const coordinatorUsers = [];

US_STATES.forEach((state) => {
  const numCoordinators = getRandomNumber(COORDINATORS_PER_DIRECTOR_MIN, COORDINATORS_PER_DIRECTOR_MAX);
  const directorProfileId = directorProfiles[state.code];
  coordinatorProfiles[state.code] = [];
  
  for (let i = 0; i < numCoordinators; i++) {
    const firstName = COORDINATOR_FIRST_NAMES[getRandomNumber(0, COORDINATOR_FIRST_NAMES.length - 1)];
    const lastName = COORDINATOR_LAST_NAMES[getRandomNumber(0, COORDINATOR_LAST_NAMES.length - 1)];
    const city = state.cities[i % state.cities.length].name;
    const userId = generateId('coordinator');
    const profileId = generateId('coordinator_profile');
    const email = `coordinator.${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    
    // Add to coordinatorUsers array
    coordinatorUsers.push({
      id: userId,
      profileId,
      email,
      firstName,
      lastName,
      role: 'coordinator',
      state: state.code,
      city
    });
    
    const phone = generatePhone();
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+${encodeURIComponent(lastName)}`;
    const metadata = { 
      region: `${city} Area`, 
      hire_date: `2022-${getRandomNumber(1, 12)}-${getRandomNumber(1, 28)}`
    };
    
    coordinatorUserSql += `('${userId}', '${escapeSQL(email)}', 'coordinator', '${escapeSQL(firstName)}', '${escapeSQL(lastName)}', '${escapeSQL(phone)}', '${escapeSQL(avatarUrl)}', 'active', '${escapeJSONB(metadata)}', NOW(), NOW())`;
    coordinatorUserSql += (coordinatorCount < (US_STATES.length * numCoordinators) - 1) ? ',\n' : '\nON CONFLICT (id) DO UPDATE SET\n';
    
    if (coordinatorCount === (US_STATES.length * numCoordinators) - 1) {
      coordinatorUserSql += `  email = EXCLUDED.email,
  role = EXCLUDED.role,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  updated_at = NOW();`;
    }
    
    // Schools in the coordinator's city
    const citySchools = state.cities.find(c => c.name === city)?.schools || [];
    
    const profileData = {
      address: `${getRandomNumber(100, 999)} ${['Oak', 'Maple', 'Pine', 'Cedar', 'Elm'][getRandomNumber(0, 4)]} ${['St', 'Ave', 'Blvd', 'Rd', 'Ln'][getRandomNumber(0, 4)]}, ${city}, ${state.code} ${getRandomNumber(10000, 99999)}`,
      background_check_date: `2022-${getRandomNumber(1, 12)}-${getRandomNumber(1, 28)}`,
      training_completed: true,
      training_date: `2022-${getRandomNumber(1, 12)}-${getRandomNumber(1, 28)}`,
      assigned_regions: [`${city}`].concat(getRandomNumber(0, 1) === 0 ? [] : [`${city} Suburbs`]),
      languages: ["English"].concat(getRandomNumber(0, 2) === 0 ? [] : ["Spanish"]),
      school_districts: citySchools.map(school => school.replace(' High School', ' School District').replace(' Academy', ' School District')),
      max_students: getRandomNumber(5, 20),
      current_students: getRandomNumber(0, 5),
      years_experience: getRandomNumber(1, 8),
      bio: `${firstName} specializes in helping students adjust to life in ${city}, ${state.name}.`
    };
    
    coordinatorProfileSql += `('${profileId}', '${userId}', 'coordinator', '${escapeJSONB(profileData)}', 'active', true, NOW(), NOW())`;
    coordinatorProfileSql += (coordinatorCount < (US_STATES.length * numCoordinators) - 1) ? ',\n' : '\nON CONFLICT (user_id, type) DO UPDATE SET\n';
    
    if (coordinatorCount === (US_STATES.length * numCoordinators) - 1) {
      coordinatorProfileSql += `  data = EXCLUDED.data,
  status = EXCLUDED.status,
  updated_at = NOW();`;
    }
    
    // Create relationship between director and coordinator
    const relationshipId = generateId('relationship');
    const relationshipData = { 
      notes: `${firstName} reports to the regional director for ${city}, ${state.name}` 
    };
    
    directorCoordinatorRelSql += `('${relationshipId}', 'director_coordinator', '${directorProfileId}', '${profileId}', 'active', '2022-${getRandomNumber(1, 12)}-${getRandomNumber(1, 28)}', '${escapeJSONB(relationshipData)}', NOW(), NOW())`;
    directorCoordinatorRelSql += (relationshipCount < (US_STATES.length * numCoordinators) - 1) ? ',\n' : '\nON CONFLICT (primary_id, secondary_id, type) DO UPDATE SET\n';
    
    if (relationshipCount === (US_STATES.length * numCoordinators) - 1) {
      directorCoordinatorRelSql += `  data = EXCLUDED.data,
  status = EXCLUDED.status,
  updated_at = NOW();`;
    }
    
    coordinatorProfiles[state.code].push(profileId);
    coordinatorCount++;
    relationshipCount++;
  }
});

console.log(coordinatorUserSql);
console.log(coordinatorProfileSql);
console.log(directorCoordinatorRelSql);

// Host Family first and last names
const HOST_FIRST_NAMES = [
  'Michael', 'Jennifer', 'Robert', 'Linda', 'William',
  'Patricia', 'David', 'Elizabeth', 'Richard', 'Barbara',
  'Joseph', 'Susan', 'Thomas', 'Jessica', 'Charles',
  'Sarah', 'Daniel', 'Karen', 'Matthew', 'Nancy'
];
const HOST_LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
  'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson',
  'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez',
  'Moore', 'Martin', 'Jackson', 'Thompson', 'White'
];

// Housing details
const HOUSE_TYPES = ['Single Family Home', 'Townhouse', 'Apartment', 'Duplex', 'Condo'];
const PET_TYPES = [
  { type: 'Dog', breeds: ['Labrador', 'Golden Retriever', 'German Shepherd', 'Beagle', 'Bulldog'] },
  { type: 'Cat', breeds: ['Siamese', 'Persian', 'Maine Coon', 'Tabby', 'Domestic Shorthair'] },
  { type: 'Fish', breeds: ['Goldfish', 'Betta', 'Angelfish', 'Guppy'] },
  { type: 'Bird', breeds: ['Canary', 'Parakeet', 'Cockatiel', 'Finch'] }
];
const RELIGIONS = ['None', 'Christian', 'Catholic', 'Jewish', 'Muslim', 'Buddhist', 'Hindu'];
const DIETARY_PREFERENCES = ['None', 'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut-free'];

// Generate Host Families (0-10 per Coordinator)
console.log(`\n-- Host Families`);
let hostFamilyUserSql = `INSERT INTO users (id, email, role, first_name, last_name, phone, avatar_url, status, metadata, created_at, updated_at) VALUES\n`;
let hostFamilyProfileSql = `INSERT INTO profiles (id, user_id, type, data, status, verified, created_at, updated_at) VALUES\n`;
let coordinatorHostRelSql = `INSERT INTO relationships (id, type, primary_id, secondary_id, status, start_date, data, created_at, updated_at) VALUES\n`;

// Track profiles for relationship creation
const hostFamilyProfiles = {};
const hostFamilyUsers = [];
const hostCoordinatorMap = {};
let hostFamilyCount = 0;
let hostRelationshipCount = 0;

US_STATES.forEach((state) => {
  hostFamilyProfiles[state.code] = [];
  
  // For each coordinator in the state
  for (let i = 0; i < coordinatorProfiles[state.code].length; i++) {
    const coordinatorProfileId = coordinatorProfiles[state.code][i];
    const numFamilies = getRandomNumber(HOST_FAMILIES_PER_COORDINATOR_MIN, HOST_FAMILIES_PER_COORDINATOR_MAX);
    
    for (let j = 0; j < numFamilies; j++) {
      const firstName = HOST_FIRST_NAMES[getRandomNumber(0, HOST_FIRST_NAMES.length - 1)];
      const lastName = HOST_LAST_NAMES[getRandomNumber(0, HOST_LAST_NAMES.length - 1)];
      const city = state.cities[i % state.cities.length].name;
      const userId = generateId('host');
      const profileId = generateId('host_profile');
      const email = `${lastName.toLowerCase()}.family${j+1}@example.com`;
      const phone = generatePhone();
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+${encodeURIComponent(lastName)}`;
      
      // Add to hostFamilyUsers array
      hostFamilyUsers.push({
        id: userId,
        email,
        firstName,
        lastName,
        role: 'host_family',
        state: state.code,
        city
      });
      
      // Map this host family to the coordinator
      const coordinatorUser = coordinatorUsers.find(c => c.profileId === coordinatorProfileId);
      if (coordinatorUser) {
        hostCoordinatorMap[userId] = coordinatorUser;
      }
      
      // Generate family details for metadata
      const familyMembers = getRandomNumber(2, 5);
      const hasPets = getRandomNumber(0, 1) === 1;
      
      const metadata = { 
        family_members: familyMembers, 
        pets: hasPets 
      };
      
      hostFamilyUserSql += `('${userId}', '${escapeSQL(email)}', 'host_family', '${escapeSQL(firstName)}', '${escapeSQL(lastName)}', '${escapeSQL(phone)}', '${escapeSQL(avatarUrl)}', 'active', '${escapeJSONB(metadata)}', NOW(), NOW())`;
      
      if (hostFamilyCount === (US_STATES.length * coordinatorProfiles[state.code].length * numFamilies) - 1) {
        hostFamilyUserSql += '\nON CONFLICT (id) DO UPDATE SET\n';
        hostFamilyUserSql += `  email = EXCLUDED.email,
  role = EXCLUDED.role,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  updated_at = NOW();`;
      } else {
        hostFamilyUserSql += ',\n';
      }
      
      // Generate detailed family profile
      const houseType = HOUSE_TYPES[getRandomNumber(0, HOUSE_TYPES.length - 1)];
      const bedrooms = getRandomNumber(2, 5);
      const bathrooms = getRandomNumber(1, 3) + (getRandomNumber(0, 1) === 1 ? 0.5 : 0);
      
      // Generate pets
      const pets = [];
      if (hasPets) {
        const numPets = getRandomNumber(1, 3);
        for (let p = 0; p < numPets; p++) {
          const petType = PET_TYPES[getRandomNumber(0, PET_TYPES.length - 1)];
          pets.push({
            type: petType.type,
            breed: petType.breeds[getRandomNumber(0, petType.breeds.length - 1)],
            name: ['Max', 'Buddy', 'Charlie', 'Cooper', 'Jack', 'Rocky', 'Bear', 'Duke', 'Bella', 'Lucy', 'Luna', 'Daisy', 'Sadie', 'Molly', 'Bailey'][getRandomNumber(0, 14)],
            size: ['Small', 'Medium', 'Large'][getRandomNumber(0, 2)],
            indoor: getRandomNumber(0, 5) > 0 // 5/6 chance of being indoor
          });
        }
      }
      
      // Generate family members
      const familyMembersList = [
        { name: `${firstName} ${lastName}`, relationship: 'Parent', age: getRandomNumber(35, 55), occupation: ['Teacher', 'Engineer', 'Doctor', 'Lawyer', 'Accountant', 'Nurse', 'Business Owner', 'Manager', 'Professor', 'IT Professional'][getRandomNumber(0, 9)] }
      ];
      
      // Add spouse with 80% probability
      if (getRandomNumber(1, 10) <= 8) {
        const spouseFirstName = ['Jennifer', 'Michael', 'Linda', 'David', 'Patricia', 'Robert', 'Susan', 'William', 'Karen', 'Joseph'][getRandomNumber(0, 9)];
        familyMembersList.push({
          name: `${spouseFirstName} ${lastName}`,
          relationship: 'Spouse',
          age: getRandomNumber(35, 55),
          occupation: ['Teacher', 'Engineer', 'Doctor', 'Lawyer', 'Accountant', 'Nurse', 'Business Owner', 'Manager', 'Professor', 'IT Professional'][getRandomNumber(0, 9)]
        });
      }
      
      // Add children
      const numChildren = familyMembers - familyMembersList.length;
      for (let c = 0; c < numChildren; c++) {
        const childAge = getRandomNumber(5, 18);
        const childFirstName = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'William', 'Sophia', 'James', 'Isabella', 'Benjamin'][getRandomNumber(0, 9)];
        familyMembersList.push({
          name: `${childFirstName} ${lastName}`,
          relationship: childAge > 16 ? 'Young Adult' : 'Child',
          age: childAge,
          occupation: 'Student'
        });
      }
      
      const religion = RELIGIONS[getRandomNumber(0, RELIGIONS.length - 1)];
      const dietaryRestrictions = DIETARY_PREFERENCES[getRandomNumber(0, DIETARY_PREFERENCES.length - 1)];
      
      // Hobbies for the family
      const hobbies = [];
      const possibleHobbies = ['Hiking', 'Cooking', 'Board Games', 'Sports', 'Reading', 'Gardening', 'Music', 'Movies', 'Traveling', 'Art', 'Photography'];
      const numHobbies = getRandomNumber(2, 5);
      for (let h = 0; h < numHobbies; h++) {
        const hobby = possibleHobbies[getRandomNumber(0, possibleHobbies.length - 1)];
        if (!hobbies.includes(hobby)) {
          hobbies.push(hobby);
        }
      }
      
      const profileData = {
        address: `${getRandomNumber(100, 999)} ${['Oak', 'Maple', 'Pine', 'Cedar', 'Elm', 'Birch', 'Willow', 'Spruce', 'Chestnut', 'Walnut'][getRandomNumber(0, 9)]} ${['St', 'Ave', 'Blvd', 'Dr', 'Ln', 'Rd', 'Way', 'Pl', 'Ct', 'Ter'][getRandomNumber(0, 9)]}, ${city}, ${state.code} ${getRandomNumber(10000, 99999)}`,
        house_type: houseType,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        has_pets: hasPets,
        pets: pets,
        family_members: familyMembersList,
        hobbies: hobbies,
        has_hosted_before: getRandomNumber(0, 4) === 0, // 20% chance of having hosted before
        previous_students: getRandomNumber(0, 4) === 0 ? getRandomNumber(1, 3) : 0,
        languages: ["English"].concat(getRandomNumber(0, 4) === 0 ? ["Spanish"] : []),
        religion: religion,
        dietary_restrictions: dietaryRestrictions,
        smokers: getRandomNumber(0, 10) < 2, // 20% chance of smokers
        school_distance: (getRandomNumber(5, 50) / 10).toFixed(1),
        transportation: ['Family car, school bus', 'Walking distance to school, family car', 'Public transportation, family car'][getRandomNumber(0, 2)],
        student_room: ['Private room with desk and closet', 'Private room with desk, dresser, and window', 'Shared room with host sibling'][getRandomNumber(0, 2)],
        house_rules: [
          'Curfew at 10 PM on weekdays, midnight on weekends. Help with dishes after dinner.',
          'Homework before recreation, help with household chores.',
          'Keep room clean, participate in family activities, limited screen time.',
          'Respectful communication, follow household schedule, help with cooking once a week.'
        ][getRandomNumber(0, 3)]
      };
      
      hostFamilyProfileSql += `('${profileId}', '${userId}', 'host_family', '${escapeJSONB(profileData)}', 'active', true, NOW(), NOW())`;
      
      if (hostFamilyCount === (US_STATES.length * coordinatorProfiles[state.code].length * numFamilies) - 1) {
        hostFamilyProfileSql += '\nON CONFLICT (user_id, type) DO UPDATE SET\n';
        hostFamilyProfileSql += `  data = EXCLUDED.data,
  status = EXCLUDED.status,
  updated_at = NOW();`;
      } else {
        hostFamilyProfileSql += ',\n';
      }
      
      // Create relationship between coordinator and host family
      const relationshipId = generateId('relationship');
      const relationshipData = { 
        notes: `${firstName}'s family is managed by their local coordinator in ${city}, ${state.name}` 
      };
      
      coordinatorHostRelSql += `('${relationshipId}', 'coordinator_host', '${coordinatorProfileId}', '${profileId}', 'active', '2022-${getRandomNumber(1, 12)}-${getRandomNumber(1, 28)}', '${escapeJSONB(relationshipData)}', NOW(), NOW())`;
      
      if (hostRelationshipCount === (US_STATES.length * coordinatorProfiles[state.code].length * numFamilies) - 1) {
        coordinatorHostRelSql += '\nON CONFLICT (primary_id, secondary_id, type) DO UPDATE SET\n';
        coordinatorHostRelSql += `  data = EXCLUDED.data,
  status = EXCLUDED.status,
  updated_at = NOW();`;
      } else {
        coordinatorHostRelSql += ',\n';
      }
      
      hostFamilyProfiles[state.code].push(profileId);
      hostFamilyCount++;
      hostRelationshipCount++;
    }
  }
});

console.log(hostFamilyUserSql);
console.log(hostFamilyProfileSql);
console.log(coordinatorHostRelSql);

// Student data
const STUDENT_COUNTRIES = [
  { 
    name: 'Germany', 
    languages: ['German'], 
    organization: {
      name: 'German Student Exchange',
      website: 'www.germanyexchange.org',
      contact_email: 'info@germanyexchange.org',
      contact_phone: '49-30-123-4567',
      description: 'Leading German organization for international student exchanges'
    }
  },
  { 
    name: 'Spain', 
    languages: ['Spanish'], 
    organization: {
      name: 'Spanish Abroad Foundation',
      website: 'www.spanishabroad.es',
      contact_email: 'contact@spanishabroad.es',
      contact_phone: '34-91-234-5678',
      description: 'Promoting Spanish culture through educational exchanges'
    }
  },
  { 
    name: 'France', 
    languages: ['French'], 
    organization: {
      name: 'France Education International',
      website: 'www.franceeducation.fr',
      contact_email: 'info@franceeducation.fr',
      contact_phone: '33-1-234-5678',
      description: 'Official French organization for international education'
    }
  },
  { 
    name: 'Italy', 
    languages: ['Italian'], 
    organization: {
      name: 'Italian Exchange Network',
      website: 'www.italyexchange.it',
      contact_email: 'programs@italyexchange.it',
      contact_phone: '39-06-123-4567',
      description: 'Connecting Italian students with international opportunities'
    }
  },
  { 
    name: 'Japan', 
    languages: ['Japanese'], 
    organization: {
      name: 'Japan Exchange Association',
      website: 'www.japanexchange.jp',
      contact_email: 'contact@japanexchange.jp',
      contact_phone: '81-3-1234-5678',
      description: 'Building bridges between Japan and the world through education'
    }
  },
  { 
    name: 'China', 
    languages: ['Mandarin', 'Cantonese'], 
    organization: {
      name: 'China Education Association',
      website: 'www.chinaeducation.cn',
      contact_email: 'info@chinaeducation.cn',
      contact_phone: '86-10-1234-5678',
      description: 'Leading Chinese organization for international educational exchanges'
    }
  },
  { 
    name: 'Brazil', 
    languages: ['Portuguese'], 
    organization: {
      name: 'Brazilian Exchange Program',
      website: 'www.brazilexchange.br',
      contact_email: 'contato@brazilexchange.br',
      contact_phone: '55-11-1234-5678',
      description: 'Promoting Brazilian culture and educational opportunities globally'
    }
  },
  { 
    name: 'South Korea', 
    languages: ['Korean'], 
    organization: {
      name: 'Korean Education Foundation',
      website: 'www.koreanedu.kr',
      contact_email: 'info@koreanedu.kr',
      contact_phone: '82-2-1234-5678',
      description: 'Expanding Korean education and cultural awareness internationally'
    }
  },
  { 
    name: 'Mexico', 
    languages: ['Spanish'], 
    organization: {
      name: 'Mexican Student Exchange',
      website: 'www.mexicanexchange.mx',
      contact_email: 'info@mexicanexchange.mx',
      contact_phone: '52-55-1234-5678',
      description: 'Fostering cultural understanding through educational exchanges'
    }
  },
  { 
    name: 'Sweden', 
    languages: ['Swedish'], 
    organization: {
      name: 'Sweden Abroad Program',
      website: 'www.swedenabroad.se',
      contact_email: 'contact@swedenabroad.se',
      contact_phone: '46-8-1234-5678',
      description: 'Swedish organization for international cultural and educational exchanges'
    }
  }
];

// Expand student first names for more diversity
const STUDENT_FIRST_NAMES = {
  male: [
    // General Western names
    'Liam', 'Noah', 'Oliver', 'Elijah', 'William', 'James', 'Benjamin', 'Lucas', 'Henry', 'Alexander',
    'Theodore', 'Jack', 'Aiden', 'Samuel', 'Joseph', 'Daniel', 'Owen', 'Sebastian', 'Gabriel', 'Carter',
    // German names
    'Hans', 'Felix', 'Lukas', 'Niklas', 'Jonas', 'Maximilian', 'Leon', 'Paul', 'Philipp', 'Moritz',
    // Spanish/Latin names
    'Luis', 'Santiago', 'Mateo', 'Diego', 'Alejandro', 'Jorge', 'Carlos', 'Miguel', 'Pablo', 'Juan',
    // Italian names
    'Francesco', 'Marco', 'Alessandro', 'Matteo', 'Lorenzo', 'Andrea', 'Luca', 'Giovanni', 'Antonio', 'Leonardo',
    // Japanese names
    'Takashi', 'Hiroshi', 'Kenji', 'Yuki', 'Hiro', 'Tatsuya', 'Ryu', 'Kazuki', 'Akira', 'Ren',
    // Chinese names
    'Wei', 'Ming', 'Li', 'Chen', 'Zhang', 'Yan', 'Xiang', 'Tao', 'Xin', 'Hao',
    // Korean names
    'Min-Jun', 'Ji-Hoon', 'Joon-Ho', 'Seung-Hyun', 'Dong-Hyun', 'Hyun-Woo', 'Jin-Ho', 'Sung-Min', 'Tae-Yong', 'Young-Ho',
    // Brazilian/Portuguese names
    'Pedro', 'Rafael', 'André', 'Gustavo', 'Roberto', 'Thiago', 'Bruno', 'Vitor', 'Eduardo', 'Marcelo',
    // Swedish names
    'Erik', 'Johan', 'Lars', 'Karl', 'Sven', 'Anders', 'Gustav', 'Björn', 'Niklas', 'Magnus'
  ],
  female: [
    // General Western names
    'Olivia', 'Emma', 'Charlotte', 'Amelia', 'Sophia', 'Isabella', 'Ava', 'Mia', 'Evelyn', 'Luna',
    'Ella', 'Lily', 'Chloe', 'Zoe', 'Emily', 'Abigail', 'Madison', 'Scarlett', 'Grace', 'Aria',
    // German names
    'Hannah', 'Lena', 'Leonie', 'Sophie', 'Emilia', 'Katharina', 'Johanna', 'Annika', 'Julia', 'Clara',
    // Spanish/Latin names
    'Sofia', 'Camila', 'Valentina', 'Isabella', 'Lucia', 'Ana', 'Carmen', 'Elena', 'Gabriela', 'Laura',
    // Italian names
    'Giulia', 'Chiara', 'Francesca', 'Martina', 'Alessia', 'Vittoria', 'Giorgia', 'Sara', 'Elisa', 'Alice',
    // Japanese names
    'Yuna', 'Yuki', 'Aiko', 'Haruka', 'Sakura', 'Misaki', 'Nana', 'Hikari', 'Rin', 'Saki',
    // Chinese names
    'Mei', 'Lin', 'Xia', 'Ying', 'Jing', 'Hui', 'Yan', 'Li', 'Wei', 'Na',
    // Korean names
    'Ji-Woo', 'Min-Jee', 'Soo-Jin', 'Eun-Ji', 'Yoo-Jin', 'Ji-Yeon', 'Min-Seo', 'Hae-Won', 'Da-Eun', 'Seo-Yeon',
    // Brazilian/Portuguese names
    'Ana', 'Maria', 'Beatriz', 'Fernanda', 'Júlia', 'Luisa', 'Larissa', 'Carolina', 'Mariana', 'Gabriela',
    // Swedish names
    'Astrid', 'Elsa', 'Linnea', 'Maja', 'Ebba', 'Alice', 'Elin', 'Ella', 'Wilma', 'Klara'
  ]
};

// Expand last names for more diversity
const STUDENT_LAST_NAMES = {
  'Germany': ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Hoffmann', 'Schulz',
             'Klein', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Krüger', 'Hofmann', 'Hartmann', 'Lange'],
  'Spain': ['García', 'Fernández', 'González', 'Rodríguez', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín',
           'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez', 'Navarro'],
  'France': ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau',
            'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier'],
  'Italy': ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco',
           'Bruno', 'Gallo', 'Conti', 'De Luca', 'Costa', 'Giordano', 'Mancini', 'Rizzo', 'Lombardi', 'Moretti'],
  'Japan': ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato',
           'Yoshida', 'Yamada', 'Sasaki', 'Yamaguchi', 'Matsumoto', 'Inoue', 'Kimura', 'Hayashi', 'Shimizu', 'Saito'],
  'China': ['Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Zhao', 'Wu', 'Zhou',
           'Sun', 'Ma', 'Zhu', 'Hu', 'Guo', 'Lin', 'He', 'Gao', 'Luo', 'Zheng'],
  'Brazil': ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
            'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa'],
  'South Korea': ['Kim', 'Lee', 'Park', 'Choi', 'Jeong', 'Kang', 'Yoon', 'Jang', 'Im', 'Han',
                 'Hwang', 'Seo', 'Cho', 'Shin', 'Song', 'Ahn', 'Kwon', 'Yoo', 'Lim', 'Ji'],
  'Mexico': ['Hernández', 'García', 'López', 'Martínez', 'González', 'Pérez', 'Rodríguez', 'Sánchez', 'Ramírez', 'Torres',
            'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales', 'Reyes', 'Gutiérrez', 'Ortiz', 'Castillo'],
  'Sweden': ['Andersson', 'Johansson', 'Karlsson', 'Nilsson', 'Eriksson', 'Larsson', 'Olsson', 'Persson', 'Svensson', 'Gustafsson',
            'Pettersson', 'Jonsson', 'Jansson', 'Hansson', 'Bengtsson', 'Jönsson', 'Lindberg', 'Jakobsson', 'Magnusson', 'Olofsson']
};

// Student interests and hobbies
const ACADEMIC_INTERESTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'History', 'Literature', 'Languages', 'Geography', 'Economics', 'Art', 'Music', 'Physical Education', 'Social Sciences', 'Environmental Science'];
const EXTRACURRICULAR_INTERESTS = ['Soccer', 'Basketball', 'Volleyball', 'Swimming', 'Tennis', 'Guitar', 'Piano', 'Singing', 'Photography', 'Drama', 'Debate', 'Chess', 'Robotics', 'Art Club', 'Yearbook', 'Student Government', 'Foreign Language Club'];
const HOBBIES = ['Reading', 'Gaming', 'Cooking', 'Dancing', 'Hiking', 'Biking', 'Skating', 'Drawing', 'Painting', 'Writing', 'Traveling', 'Photography', 'Watching Movies', 'Listening to Music', 'Social Media', 'Fashion', 'Crafting'];

// Generate Students (100 total)
console.log(`\n-- Students (100 total, unassigned)`);
let studentUserSql = `INSERT INTO users (id, email, role, first_name, last_name, phone, avatar_url, status, metadata, created_at, updated_at) VALUES\n`;
let studentProfileSql = `INSERT INTO profiles (id, user_id, type, data, status, verified, created_at, updated_at) VALUES\n`;
let studentSendingOrgRelSql = `INSERT INTO relationships (id, type, primary_id, secondary_id, status, start_date, data, created_at, updated_at) VALUES\n`;

// After generating host families, generate sending organization accounts
console.log(`\n-- Sending Organization Accounts`);
let sendingOrgUsersSql = `INSERT INTO users (id, email, role, first_name, last_name, phone, avatar_url, status, metadata, created_at, updated_at) VALUES\n`;
let sendingOrgProfilesSql = `INSERT INTO profiles (id, user_id, type, data, status, verified, created_at, updated_at) VALUES\n`;

// Map to store sending org profile IDs by country
const sendingOrgProfiles = {};

// Generate sending organizations
STUDENT_COUNTRIES.forEach((countryData, index) => {
  const country = countryData.name;
  const orgData = countryData.organization;
  const userId = generateId('sending_org');
  const profileId = generateId('sending_org_profile');
  
  // Store the profile ID for relationships
  sendingOrgProfiles[country] = profileId;
  
  // Generate sending org user
  const orgName = orgData.name;
  const firstName = orgName.split(' ')[0];
  const lastName = orgName.split(' ').slice(1).join(' ');
  const email = orgData.contact_email;
  const phone = orgData.contact_phone;
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(orgName)}`;
  
  sendingOrgUsersSql += `('${userId}', '${escapeSQL(email)}', 'sending_org', '${escapeSQL(firstName)}', '${escapeSQL(lastName)}', '${escapeSQL(phone)}', '${escapeSQL(avatarUrl)}', 'active', '${escapeJSONB({ country })}', NOW(), NOW())`;
  sendingOrgUsersSql += index < STUDENT_COUNTRIES.length - 1 ? ',\n' : '\nON CONFLICT (email) DO NOTHING;\n';
  
  // Generate profile data
  const profileData = {
    organization_name: orgName,
    country: country,
    website: orgData.website,
    contact_email: email,
    contact_phone: phone,
    description: orgData.description,
    year_established: getRandomNumber(1980, 2010),
    programs_offered: PROGRAM_TYPES.map(p => p.id),
    students_per_year: getRandomNumber(50, 500),
    partner_since: getRandomNumber(2010, 2022),
    accreditations: ["International Education Standards Board", "Cultural Exchange Association"],
    languages: countryData.languages.concat(["English"])
  };
  
  sendingOrgProfilesSql += `('${profileId}', '${userId}', 'sending_org', '${escapeJSONB(profileData)}', 'active', true, NOW(), NOW())`;
  sendingOrgProfilesSql += index < STUDENT_COUNTRIES.length - 1 ? ',\n' : '\nON CONFLICT (user_id, type) DO NOTHING;\n';
});

console.log(sendingOrgUsersSql);
console.log(sendingOrgProfilesSql);

// Array to store student users for later use
const studentUsers = [];

for (let i = 0; i < TOTAL_STUDENTS; i++) {
  // Randomly select country of origin
  const countryData = STUDENT_COUNTRIES[getRandomNumber(0, STUDENT_COUNTRIES.length - 1)];
  const country = countryData.name;
  const nativeLanguage = countryData.languages[0];
  const gender = getRandomNumber(0, 1) === 0 ? 'male' : 'female';
  
  // Generate student details
  const firstName = STUDENT_FIRST_NAMES[gender][getRandomNumber(0, STUDENT_FIRST_NAMES[gender].length - 1)];
  const lastName = STUDENT_LAST_NAMES[country][getRandomNumber(0, STUDENT_LAST_NAMES[country].length - 1)];
  const age = getRandomNumber(STUDENT_AGE_MIN, STUDENT_AGE_MAX);
  
  // Calculate grade based on age
  let grade;
  switch (age) {
    case 13: grade = '8'; break;
    case 14: grade = '9'; break;
    case 15: grade = '10'; break;
    case 16: grade = '11'; break;
    case 17: grade = '12'; break;
    default: grade = '10';
  }
  
  const userId = generateId('student');
  const profileId = generateId('student_profile');
  const email = `student.${firstName.toLowerCase()}${getRandomNumber(100, 999)}@example.com`;
  
  // Add to studentUsers array
  studentUsers.push({
    id: userId,
    profileId,
    email,
    firstName,
    lastName,
    role: 'student',
    country,
    age,
    gender // Store gender in the user object
  });
  
  // Generate phone with international format
  const countryCodes = {
    'Germany': '49', 'Spain': '34', 'France': '33', 'Italy': '39', 'Japan': '81',
    'China': '86', 'Brazil': '55', 'South Korea': '82', 'Mexico': '52', 'Sweden': '46'
  };
  const phone = `${countryCodes[country]}-${getRandomNumber(1000, 9999)}-${getRandomNumber(10000, 99999)}`;
  
  const avatarUrl = `https://ui-avatars.com/api/?name=${firstName}+${lastName}`;
  const metadata = JSON.stringify({ 
    country_of_origin: country, 
    age: age,
    gender: gender === 'male' ? 'Male' : 'Female' // Include gender in metadata
  });
  
  studentUserSql += `('${userId}', '${email}', 'student', '${firstName}', '${lastName}', '${phone}', '${avatarUrl}', 'active', '${metadata}', NOW(), NOW())`;
  studentUserSql += i < TOTAL_STUDENTS - 1 ? ',\n' : '\nON CONFLICT (email) DO NOTHING;\n';
  
  // Generate birth year based on age (assuming current year is 2023)
  const birthYear = 2023 - age;
  const birthMonth = getRandomNumber(1, 12);
  const birthDay = getRandomNumber(1, 28); // simplified to avoid month length issues
  
  // Generate academic interests (2-4)
  const numAcademicInterests = getRandomNumber(2, 4);
  const academicInterestsList = [];
  for (let j = 0; j < numAcademicInterests; j++) {
    const interest = ACADEMIC_INTERESTS[getRandomNumber(0, ACADEMIC_INTERESTS.length - 1)];
    if (!academicInterestsList.includes(interest)) {
      academicInterestsList.push(interest);
    }
  }
  
  // Generate extracurricular interests (1-3)
  const numExtracurricularInterests = getRandomNumber(1, 3);
  const extracurricularInterestsList = [];
  for (let j = 0; j < numExtracurricularInterests; j++) {
    const interest = EXTRACURRICULAR_INTERESTS[getRandomNumber(0, EXTRACURRICULAR_INTERESTS.length - 1)];
    if (!extracurricularInterestsList.includes(interest)) {
      extracurricularInterestsList.push(interest);
    }
  }
  
  // Generate hobbies (2-4)
  const numHobbies = getRandomNumber(2, 4);
  const hobbiesList = [];
  for (let j = 0; j < numHobbies; j++) {
    const hobby = HOBBIES[getRandomNumber(0, HOBBIES.length - 1)];
    if (!hobbiesList.includes(hobby)) {
      hobbiesList.push(hobby);
    }
  }
  
  // Generate other languages (0-2)
  const otherLanguages = [];
  const numOtherLanguages = getRandomNumber(0, 2);
  const allLanguages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Japanese', 'Mandarin', 'Portuguese', 'Korean', 'Swedish'];
  for (let j = 0; j < numOtherLanguages; j++) {
    let lang = allLanguages[getRandomNumber(0, allLanguages.length - 1)];
    if (lang !== nativeLanguage && !otherLanguages.includes(lang)) {
      otherLanguages.push(lang);
    }
  }
  
  // Always add English if it's not the native language and not already added
  if (nativeLanguage !== 'English' && !otherLanguages.includes('English')) {
    otherLanguages.push('English');
  }
  
  // Generate English proficiency
  const englishProficiency = ['Beginner', 'Intermediate', 'Advanced', 'Fluent'][getRandomNumber(0, 3)];
  
  // Generate passport details
  const passportNumber = `${['A', 'B', 'C', 'D', 'E'][getRandomNumber(0, 4)]}${getRandomNumber(10, 99)}${['X', 'Y', 'Z'][getRandomNumber(0, 2)]}${getRandomNumber(10000, 99999)}`;
  const passportExpiry = `${getRandomNumber(2025, 2030)}-${getRandomNumber(1, 12)}-${getRandomNumber(1, 28)}`;
  
  // Generate health info
  const healthInfo = {
    allergies: getRandomNumber(0, 5) === 0 ? [['Pollen', 'Dust', 'Peanuts', 'Dairy', 'Shellfish', 'Gluten'][getRandomNumber(0, 5)]] : [],
    medications: getRandomNumber(0, 10) === 0 ? [['Asthma inhaler', 'Allergy medication', 'Insulin'][getRandomNumber(0, 2)]] : [],
    medical_conditions: getRandomNumber(0, 15) === 0 ? [['Asthma', 'Diabetes', 'Epilepsy', 'Migraines'][getRandomNumber(0, 3)]] : [],
    dietary_restrictions: getRandomNumber(0, 5) === 0 ? ['Vegetarian', 'Vegan', 'No pork', 'No beef', 'Gluten-free', 'Dairy-free'][getRandomNumber(0, 5)] : 'None'
  };
  
  // Generate emergency contact
  const parentFirstName = gender === 'male' ? 
    ['Hans', 'Luis', 'Jean', 'Marco', 'Takashi', 'Wei', 'Paulo', 'Ji-Hoon', 'Carlos', 'Erik'][getRandomNumber(0, 9)] : 
    ['Anna', 'Sofia', 'Marie', 'Giulia', 'Yuki', 'Li', 'Ana', 'Sun-Hee', 'Maria', 'Lena'][getRandomNumber(0, 9)];
    
  const emergencyContact = {
    name: `${parentFirstName} ${lastName}`,
    relationship: gender === 'male' ? (getRandomNumber(0, 1) === 0 ? 'Father' : 'Mother') : (getRandomNumber(0, 1) === 0 ? 'Mother' : 'Father'),
    phone: `${countryCodes[country]}-${getRandomNumber(1000, 9999)}-${getRandomNumber(10000, 99999)}`,
    email: `${parentFirstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`
  };
  
  // Select a specific program from the defined programs
  const program = PROGRAM_TYPES[getRandomNumber(0, PROGRAM_TYPES.length - 1)];
  const programDuration = program.id.includes('semester') ? 'semester' : 
                          program.id === 'academic_year' ? 'academic_year' : 
                          program.id;
                          
  const currentYear = 2023;
  let arrivalDate, departureDate;
  
  if (programDuration === 'semester') {
    if (program.id === 'semester_fall') {
      // Fall semester
      arrivalDate = `${currentYear}-08-${getRandomNumber(15, 30)}`;
      departureDate = `${currentYear+1}-01-${getRandomNumber(15, 30)}`;
    } else {
      // Spring semester
      arrivalDate = `${currentYear}-01-${getRandomNumber(15, 30)}`;
      departureDate = `${currentYear}-06-${getRandomNumber(15, 30)}`;
    }
  } else if (programDuration === 'academic_year') {
    // Full academic year
    arrivalDate = `${currentYear}-08-${getRandomNumber(15, 30)}`;
    departureDate = `${currentYear+1}-06-${getRandomNumber(15, 30)}`;
  } else if (programDuration === 'trimester') {
    // Trimester program (3 months)
    const startMonth = [1, 4, 8][getRandomNumber(0, 2)]; // Jan, Apr, or Aug
    arrivalDate = `${currentYear}-${startMonth.toString().padStart(2, '0')}-${getRandomNumber(1, 15)}`;
    
    // Calculate end date 3 months later
    let endMonth = startMonth + 3;
    let endYear = currentYear;
    if (endMonth > 12) {
      endMonth -= 12;
      endYear++;
    }
    departureDate = `${endYear}-${endMonth.toString().padStart(2, '0')}-${getRandomNumber(15, 28)}`;
  } else {
    // Summer program
    arrivalDate = `${currentYear}-06-${getRandomNumber(1, 15)}`;
    departureDate = `${currentYear}-08-${getRandomNumber(15, 30)}`;
  }
  
  // Generate placement preferences
  const placementPreferences = {
    pet_preference: ['No pets', 'Likes all pets', 'Prefers dogs', 'Prefers cats', 'No large dogs'][getRandomNumber(0, 4)],
    location_preference: ['Urban', 'Suburban', 'Rural', 'Any'][getRandomNumber(0, 3)],
    family_preference: ['Any family type', 'Family with children', 'Family with teenagers', 'Quiet household', 'Active family'][getRandomNumber(0, 4)]
  };
  
  // Generate personal statement
  const personalStatements = [
    `I am excited to improve my English and experience American high school life. I love ${academicInterestsList[0].toLowerCase()} and hope to join the ${extracurricularInterestsList[0]} club.`,
    `I'm looking forward to living with an American family and learning about your culture. I enjoy ${hobbiesList[0].toLowerCase()} and am eager to share my ${country} traditions.`,
    `My dream is to study in America and make lifelong friendships. I'm passionate about ${academicInterestsList[0].toLowerCase()} and ${hobbiesList[0].toLowerCase()}.`,
    `I want to challenge myself by studying abroad and improving my language skills. I'm interested in ${academicInterestsList[0].toLowerCase()} and participating in ${extracurricularInterestsList[0]}.`,
    `I'm excited to experience the American education system and way of life. I love ${hobbiesList[0].toLowerCase()} and learning about different cultures.`
  ];
  
  // Generate profile data with enhanced program information
  const profileData = JSON.stringify({
    first_name: firstName,
    last_name: lastName,
    gender: gender === 'male' ? 'Male' : 'Female',
    date_of_birth: `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`,
    country_of_origin: country,
    native_language: nativeLanguage,
    other_languages: otherLanguages,
    english_proficiency: englishProficiency,
    passport_number: passportNumber,
    passport_expiry: passportExpiry,
    health_info: healthInfo,
    emergency_contact: emergencyContact,
    school_grade: grade,
    academic_interests: academicInterestsList,
    extracurricular_interests: extracurricularInterestsList,
    hobbies: hobbiesList,
    dietary_preferences: healthInfo.dietary_restrictions === 'None' ? 'No restrictions' : healthInfo.dietary_restrictions,
    religion: ['None', 'Christian', 'Catholic', 'Jewish', 'Muslim', 'Buddhist', 'Hindu'][getRandomNumber(0, 6)],
    personal_statement: personalStatements[getRandomNumber(0, personalStatements.length - 1)],
    program: {
      type: program.id,
      name: program.name,
      description: program.description,
      duration_months: program.duration_months
    },
    program_duration: programDuration,
    arrival_date: arrivalDate,
    departure_date: departureDate,
    sending_organization: countryData.organization.name,
    placement_preferences: placementPreferences,
    application_status: ['applied', 'accepted', 'visa_processing', 'visa_approved', 'placement_pending', 'placed'][getRandomNumber(0, 5)]
  });
  
  studentProfileSql += `('${profileId}', '${userId}', 'student', '${profileData}', 'active', true, NOW(), NOW())`;
  studentProfileSql += i < TOTAL_STUDENTS - 1 ? ',\n' : '\nON CONFLICT (user_id, type) DO NOTHING;\n';
  
  // Create relationship between student and sending organization
  const relationshipId = generateId('relationship');
  const sendingOrgProfileId = sendingOrgProfiles[country];
  const relationshipData = {
    program_type: program.id,
    program_year: currentYear,
    application_date: `${currentYear-1}-${getRandomNumber(1, 12)}-${getRandomNumber(1, 28)}`,
    notes: `Student enrolled in ${program.name} program through ${countryData.organization.name}`
  };
  
  // Add relationship between student and sending organization
  studentSendingOrgRelSql += `('${relationshipId}', 'sending_org_student', '${sendingOrgProfileId}', '${profileId}', 'active', '${relationshipData.application_date}', '${escapeJSONB(relationshipData)}', NOW(), NOW())`;
  studentSendingOrgRelSql += i < TOTAL_STUDENTS - 1 ? ',\n' : '\nON CONFLICT (primary_id, secondary_id, type) DO UPDATE SET\n';
  
  if (i === TOTAL_STUDENTS - 1) {
    studentSendingOrgRelSql += `  data = EXCLUDED.data,
  status = EXCLUDED.status,
  updated_at = NOW();`;
  }
}

console.log(studentUserSql);
console.log(studentProfileSql);
console.log(studentSendingOrgRelSql);

// Generate student-host family assignments (70% of students will be assigned)
console.log(`\n-- Student-Host Family Assignments (70% of students)`);
let studentAssignmentSql = `INSERT INTO relationships (id, type, primary_id, secondary_id, status, start_date, data, created_at, updated_at) VALUES\n`;

// Get 70% of students randomly
const studentsToAssign = Math.floor(TOTAL_STUDENTS * 0.7);
const randomStudentIndices = new Set();
while (randomStudentIndices.size < studentsToAssign) {
  randomStudentIndices.add(getRandomNumber(0, TOTAL_STUDENTS - 1));
}

let assignmentCount = 0;
for (const studentIndex of randomStudentIndices) {
  // Get a random host family
  const randomHostIndex = getRandomNumber(0, hostFamilyUsers.length - 1);
  const randomHost = hostFamilyUsers[randomHostIndex];
  const student = studentUsers[studentIndex];
  
  // Create relationship
  const relationshipId = generateId('relationship');
  
  // Get the coordinator assigned to this host
  const hostCoordinator = hostCoordinatorMap[randomHost.id];
  
  const relationshipData = {
    placement_date: `2023-${getRandomNumber(1, 12)}-${getRandomNumber(1, 28)}`,
    placement_status: 'active',
    placement_notes: `Student ${student.firstName} ${student.lastName} matched with host family ${randomHost.lastName}`,
    school_name: `${['Washington', 'Lincoln', 'Roosevelt', 'Jefferson', 'Kennedy', 'Franklin', 'Adams'][getRandomNumber(0, 6)]} ${['High School', 'Academy', 'Senior High', 'Secondary School'][getRandomNumber(0, 3)]}`,
    coordinator_id: hostCoordinator ? hostCoordinator.id : null
  };
  
  studentAssignmentSql += `('${relationshipId}', 'host_student', '${randomHost.profileId || hostFamilyProfiles[randomHost.state][0]}', '${student.profileId}', 'active', '2023-${getRandomNumber(1, 12)}-${getRandomNumber(1, 28)}', '${escapeJSONB(relationshipData)}', NOW(), NOW())`;
  assignmentCount++;
  
  if (assignmentCount < studentsToAssign) {
    studentAssignmentSql += ',\n';
  } else {
    studentAssignmentSql += '\nON CONFLICT (primary_id, secondary_id, type) DO UPDATE SET\n';
    studentAssignmentSql += `  data = EXCLUDED.data,
  status = EXCLUDED.status,
  updated_at = NOW();`;
  }
}

console.log(studentAssignmentSql);

// Output final statement
console.log(`\n-- Seed data generation complete
SELECT COUNT(*) AS "Total Users" FROM users;
SELECT role, COUNT(*) FROM users GROUP BY role ORDER BY role;`);