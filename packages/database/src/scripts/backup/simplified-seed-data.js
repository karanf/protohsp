#!/usr/bin/env node

/**
 * Simplified Seed Data Generator for EGAB PoC
 * Uses simple text-based IDs instead of UUIDs
 */

// Helper function to generate simple IDs
const generateId = (prefix) => {
  // Simple ID format: prefix-random6chars
  return `${prefix}-${Math.random().toString(36).substring(2, 8)}`;
};

// Helper functions
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const generatePhone = () => {
  return `${getRandomNumber(200, 999)}-${getRandomNumber(100, 999)}-${getRandomNumber(1000, 9999)}`;
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

// A few sample US States
const STATES = [
  { code: 'CA', name: 'California' },
  { code: 'NY', name: 'New York' },
  { code: 'TX', name: 'Texas' }
];

// Sample names for different entities
const NAMES = {
  directors: {
    first: ['Robert', 'James', 'William'],
    last: ['Anderson', 'Wilson', 'Taylor']
  },
  coordinators: {
    first: ['Sarah', 'Michael', 'Jessica', 'David', 'Emily', 'Christopher', 'Ashley', 'Matthew', 'Amanda', 'Daniel'],
    last: ['Williams', 'Johnson', 'Smith', 'Brown', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Jones']
  },
  hosts: {
    first: ['Michael', 'Jennifer', 'Robert', 'Lisa', 'David', 'Susan', 'Brian', 'Karen', 'Kevin', 'Maria'],
    last: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
  },
  students: {
    first: ['Liam', 'Olivia', 'Noah', 'Emma', 'Sophia', 'Jackson', 'Ava', 'Lucas', 'Mia', 'Oliver'],
    last: ['Müller', 'García', 'Martin', 'Tanaka', 'Ivanov', 'Rossi', 'Kim', 'Zhang', 'Silva', 'Robert']
  }
};

// Countries for students
const COUNTRIES = ['Germany', 'Spain', 'France', 'Italy', 'Japan'];

// Track used emails to avoid duplicates
const usedEmails = new Set();

// Generate unique email
const generateUniqueEmail = (base) => {
  let email = base;
  let counter = 1;
  
  while (usedEmails.has(email)) {
    email = `${base}${counter}`;
    counter++;
  }
  
  usedEmails.add(email);
  return email;
};

// Generate SQL header
console.log(`-- Admin users
INSERT INTO users (id, email, role, first_name, last_name, phone, avatar_url, status, metadata, created_at, updated_at) VALUES
('admin-000001', 'admin@example.com', 'admin', 'System', 'Administrator', '555-123-4567', 'https://ui-avatars.com/api/?name=System+Administrator', 'active', '{"department": "IT", "hire_date": "2022-01-15"}', NOW(), NOW()),
('director-00001', 'director@example.com', 'admin', 'Program', 'Director', '555-987-6543', 'https://ui-avatars.com/api/?name=Program+Director', 'active', '{"department": "Operations", "hire_date": "2021-03-10"}', NOW(), NOW());`);

usedEmails.add('admin@example.com');
usedEmails.add('director@example.com');

// Generate Regional Directors
console.log(`\n-- Regional Directors`);
const directors = [];

STATES.forEach((state, index) => {
  const firstName = NAMES.directors.first[index % NAMES.directors.first.length];
  const lastName = NAMES.directors.last[index % NAMES.directors.last.length];
  const userId = generateId('dir');
  const profileId = generateId('dirp');
  const baseEmail = `director.${state.code.toLowerCase()}@example.com`;
  const email = generateUniqueEmail(baseEmail);
  
  // Store for later reference
  directors.push({
    id: userId,
    profileId,
    state: state.code,
    firstName, 
    lastName
  });
  
  // User SQL
  console.log(`INSERT INTO users (id, email, role, first_name, last_name, phone, avatar_url, status, metadata, created_at, updated_at) VALUES
('${userId}', '${escapeSQL(email)}', 'regional_director', '${escapeSQL(firstName)}', '${escapeSQL(lastName)}', '${generatePhone()}', 'https://ui-avatars.com/api/?name=${firstName}+${lastName}', 'active', '{"state":"${state.name}","hire_date":"2021-${getRandomNumber(1, 12)}-${getRandomNumber(1, 28)}"}', NOW(), NOW());`);
  
  // Profile SQL  
  console.log(`INSERT INTO profiles (id, user_id, type, data, status, verified, created_at, updated_at) VALUES
('${profileId}', '${userId}', 'regional_director', '{"address":"${getRandomNumber(100, 999)} Main St, ${state.name}, ${state.code} ${getRandomNumber(10000, 99999)}","state":"${state.name}","regions_covered":["${state.name} Region"],"languages":["English"],"years_experience":${getRandomNumber(3, 15)}}', 'active', true, NOW(), NOW());`);
});

// Generate Coordinators
console.log(`\n-- Coordinators`);
const coordinators = [];
let coordinatorCounter = 0;

directors.forEach((director) => {
  // Create 2-3 coordinators per director
  const numCoordinators = getRandomNumber(2, 3);
  
  for (let i = 0; i < numCoordinators; i++) {
    const firstNameIndex = coordinatorCounter % NAMES.coordinators.first.length;
    const lastNameIndex = coordinatorCounter % NAMES.coordinators.last.length;
    const firstName = NAMES.coordinators.first[firstNameIndex];
    const lastName = NAMES.coordinators.last[lastNameIndex];
    const userId = generateId('coord');
    const profileId = generateId('coordp');
    const baseEmail = `coordinator.${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    const email = generateUniqueEmail(baseEmail);
    
    // Store for later reference
    coordinators.push({
      id: userId,
      profileId,
      directorProfileId: director.profileId,
      state: director.state,
      firstName,
      lastName
    });
    
    // User SQL
    console.log(`INSERT INTO users (id, email, role, first_name, last_name, phone, avatar_url, status, metadata, created_at, updated_at) VALUES
('${userId}', '${escapeSQL(email)}', 'coordinator', '${escapeSQL(firstName)}', '${escapeSQL(lastName)}', '${generatePhone()}', 'https://ui-avatars.com/api/?name=${firstName}+${lastName}', 'active', '{"region":"${director.state} Region ${i+1}","hire_date":"2022-${getRandomNumber(1, 12)}-${getRandomNumber(1, 28)}"}', NOW(), NOW());`);
    
    // Profile SQL
    console.log(`INSERT INTO profiles (id, user_id, type, data, status, verified, created_at, updated_at) VALUES
('${profileId}', '${userId}', 'coordinator', '{"address":"${getRandomNumber(100, 999)} Oak St, ${director.state} ${getRandomNumber(10000, 99999)}","assigned_regions":["${director.state} Region ${i+1}"],"languages":["English"],"max_students":${getRandomNumber(5, 20)},"current_students":${getRandomNumber(0, 5)}}', 'active', true, NOW(), NOW());`);
    
    // Relationship SQL
    console.log(`INSERT INTO relationships (id, type, primary_id, secondary_id, status, start_date, data, created_at, updated_at) VALUES
('${generateId('rel')}', 'director_coordinator', '${director.profileId}', '${profileId}', 'active', '2022-${getRandomNumber(1, 12)}-${getRandomNumber(1, 28)}', '{"notes":"${firstName} reports to regional director for ${director.state}"}', NOW(), NOW());`);
    
    coordinatorCounter++;
  }
});

// Generate Host Families
console.log(`\n-- Host Families`);
const hosts = [];
let hostCounter = 0;

coordinators.forEach((coordinator) => {
  // Create 1-3 host families per coordinator
  const numHosts = getRandomNumber(1, 3);
  
  for (let i = 0; i < numHosts; i++) {
    const firstNameIndex = hostCounter % NAMES.hosts.first.length;
    const lastNameIndex = hostCounter % NAMES.hosts.last.length;
    const firstName = NAMES.hosts.first[firstNameIndex];
    const lastName = NAMES.hosts.last[lastNameIndex];
    const userId = generateId('host');
    const profileId = generateId('hostp');
    const baseEmail = `${lastName.toLowerCase()}.family@example.com`;
    const email = generateUniqueEmail(baseEmail);
    
    // Store for later reference
    hosts.push({
      id: userId,
      profileId,
      coordinatorProfileId: coordinator.profileId,
      state: coordinator.state,
      firstName,
      lastName
    });
    
    // User SQL
    console.log(`INSERT INTO users (id, email, role, first_name, last_name, phone, avatar_url, status, metadata, created_at, updated_at) VALUES
('${userId}', '${escapeSQL(email)}', 'host_family', '${escapeSQL(firstName)}', '${escapeSQL(lastName)}', '${generatePhone()}', 'https://ui-avatars.com/api/?name=${firstName}+${lastName}', 'active', '{"family_members":${getRandomNumber(2, 5)},"pets":${getRandomNumber(0, 1) === 1}}', NOW(), NOW());`);
    
    // Profile SQL with minimal host family details
    console.log(`INSERT INTO profiles (id, user_id, type, data, status, verified, created_at, updated_at) VALUES
('${profileId}', '${userId}', 'host_family', '{"address":"${getRandomNumber(100, 999)} Maple St, ${coordinator.state} ${getRandomNumber(10000, 99999)}","house_type":"Single Family Home","bedrooms":${getRandomNumber(2, 5)},"has_pets":${getRandomNumber(0, 1) === 1}}', 'active', true, NOW(), NOW());`);
    
    // Relationship SQL
    console.log(`INSERT INTO relationships (id, type, primary_id, secondary_id, status, start_date, data, created_at, updated_at) VALUES
('${generateId('rel')}', 'coordinator_host', '${coordinator.profileId}', '${profileId}', 'active', '2022-${getRandomNumber(1, 12)}-${getRandomNumber(1, 28)}', '{"notes":"${firstName} family is managed by their local coordinator"}', NOW(), NOW());`);
    
    hostCounter++;
  }
});

// Generate Students
console.log(`\n-- Students`);
const students = [];
const TOTAL_STUDENTS = 20; // Reduced for simplicity

for (let i = 0; i < TOTAL_STUDENTS; i++) {
  const gender = getRandomNumber(0, 1) === 0 ? 'male' : 'female';
  const firstNameIndex = i % NAMES.students.first.length;
  const lastNameIndex = i % NAMES.students.last.length;
  const firstName = NAMES.students.first[firstNameIndex];
  const lastName = NAMES.students.last[lastNameIndex];
  const country = COUNTRIES[i % COUNTRIES.length];
  const age = getRandomNumber(14, 17);
  const userId = generateId('stud');
  const profileId = generateId('studp');
  const baseEmail = `student.${firstName.toLowerCase()}@example.com`;
  const email = generateUniqueEmail(baseEmail);
  
  // Store for later reference
  students.push({
    id: userId,
    profileId,
    firstName,
    lastName,
    country,
    age
  });
  
  // User SQL
  console.log(`INSERT INTO users (id, email, role, first_name, last_name, phone, avatar_url, status, metadata, created_at, updated_at) VALUES
('${userId}', '${escapeSQL(email)}', 'student', '${escapeSQL(firstName)}', '${escapeSQL(lastName)}', '${generatePhone()}', 'https://ui-avatars.com/api/?name=${firstName}+${lastName}', 'active', '{"country_of_origin":"${country}","age":${age}}', NOW(), NOW());`);
  
  // Profile SQL with minimal student details
  console.log(`INSERT INTO profiles (id, user_id, type, data, status, verified, created_at, updated_at) VALUES
('${profileId}', '${userId}', 'student', '{"country_of_origin":"${country}","date_of_birth":"${2023-age}-${getRandomNumber(1, 12)}-${getRandomNumber(1, 28)}","school_grade":"${age-6}"}', 'active', true, NOW(), NOW());`);
}

// Assign some students to host families
console.log(`\n-- Student-Host Family Assignments`);
const ASSIGNED_STUDENTS = Math.min(hosts.length, Math.floor(TOTAL_STUDENTS * 0.7));

for (let i = 0; i < ASSIGNED_STUDENTS; i++) {
  const host = hosts[i % hosts.length];
  const student = students[i];
  
  console.log(`INSERT INTO relationships (id, type, primary_id, secondary_id, status, start_date, data, created_at, updated_at) VALUES
('${generateId('rel')}', 'host_student', '${host.profileId}', '${student.profileId}', 'active', '2023-${getRandomNumber(1, 12)}-${getRandomNumber(1, 28)}', '{"placement_date":"2023-${getRandomNumber(1, 12)}-${getRandomNumber(1, 28)}","placement_status":"active","placement_notes":"Student ${student.firstName} ${student.lastName} matched with host family ${host.lastName}","school_name":"Local High School"}', NOW(), NOW());`);
} 