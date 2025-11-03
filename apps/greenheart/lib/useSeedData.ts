'use client';

import { User, Profile, Relationship } from './parseSeedData';

interface SeedData {
  users: User[];
  profiles: Profile[];
  relationships: Relationship[];
}

/**
 * Creates and returns mock data directly without using React hooks
 * This is compatible with the interface expected by the app
 */
export function useSeedData() {
  return {
    users: createMockUsers(),
    profiles: createMockProfiles(),
    relationships: createMockRelationships(),
    isLoading: false,
    error: null,
    usedFallback: true
  };
}

// Create mock users with predictable IDs
function createMockUsers(): User[] {
  const users: User[] = [];
  const countries = ['USA', 'Germany', 'Brazil', 'Spain', 'Japan', 'China', 'India', 'France'];
  
  // Create 30 students
  for (let i = 0; i < 30; i++) {
    users.push({
      id: `stud-${i}`,
      firstName: `Student${i}`,
      lastName: `LastName${i}`,
      role: 'student',
      metadata: {
        country_of_origin: countries[i % countries.length],
        gender: i % 2 === 0 ? 'Male' : 'Female'
      },
      avatarUrl: `https://ui-avatars.com/api/?name=Student${i}+LastName${i}`
    });
  }

  // Create 20 host families
  for (let i = 0; i < 20; i++) {
    const cityNames = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'];
    const stateAbbr = ['NY', 'CA', 'IL', 'TX', 'FL'];
    users.push({
      id: `host-${i}`,
      firstName: `Host${i}`,
      lastName: `Family${i}`,
      role: 'host', // Use 'host' role explicitly for consistency
      metadata: {
        // Including any custom properties in the metadata object
        verification_date: new Date(2023, i % 12, i % 28 + 1).toISOString(),
        status: i < 15 ? 'verified' : i < 18 ? 'pending' : 'rejected',
        city: cityNames[i % 5],
        state: stateAbbr[i % 5]
      } as any, // Use type assertion to avoid TypeScript errors with custom fields
      avatarUrl: `https://ui-avatars.com/api/?name=Host${i}+Family${i}`
    });
  }
  
  return users;
}

// Create profiles matching user IDs
function createMockProfiles(): Profile[] {
  const profiles: Profile[] = [];
  const programTypes = ['high_school', 'semester_spring', 'semester_fall', 'academic_year'];
  
  // Create student profiles
  for (let i = 0; i < 30; i++) {
    const birthYear = 2000 + (i % 10);
    const birthMonth = i % 12;
    const birthDay = (i % 28) + 1;
    
    profiles.push({
      id: `studp-${i}`,
      userId: `stud-${i}`,
      data: {
        date_of_birth: new Date(birthYear, birthMonth, birthDay).toISOString().split('T')[0],
        gender: i % 2 === 0 ? 'Male' : 'Female',
        school_grade: String((i % 4) + 9),
        program: {
          type: programTypes[i % programTypes.length]
        }
      }
    });
  }

  // Create host family profiles
  for (let i = 0; i < 20; i++) {
    const cityNames = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'];
    const stateAbbr = ['NY', 'CA', 'IL', 'TX', 'FL'];
    profiles.push({
      id: `hostp-${i}`,
      userId: `host-${i}`,
      data: {
        // Using a more generic data object that can hold custom properties
        date_of_birth: '', // Include required properties with empty values if needed
        gender: i % 2 === 0 ? 'Male' : 'Female',
        verified: i < 15, // 15 verified, 5 not verified
        city: cityNames[i % 5],
        state: stateAbbr[i % 5],
        family_members: Math.floor(Math.random() * 4) + 2,
        has_pets: i % 3 === 0
      } as any // Use type assertion to avoid TypeScript errors with custom fields
    });
  }
  
  return profiles;
}

// Create relationships with deterministic values
function createMockRelationships(): Relationship[] {
  // Create an empty array that will be explicitly typed as Relationship[]
  const relationships: Relationship[] = [];
  
  // Define statuses as concrete string array to avoid any possibility of undefined
  const statuses = [
    'active', 
    'pending', 
    'approved', 
    'rejected'
  ] as const;
  
  const programTypes = [
    'high_school', 
    'semester_spring', 
    'semester_fall', 
    'academic_year'
  ] as const;
  
  const organizations = [
    'Global Exchange', 
    'EduWorld', 
    'StudyAbroad', 
    'WorldLearn'
  ] as const;
  
  const schools = [
    'Washington High', 
    'Lincoln Academy', 
    'Roosevelt School', 
    'Jefferson High'
  ] as const;
  
  // Create host-student relationships - Note that host profile IDs are "hostp-{i}"
  for (let i = 0; i < 25; i++) {
    // Determine host and student profile IDs
    const hostIdx = i % 20; // Reuse hosts for some students
    const studentIdx = i % 30;

    // Use modulo to get safe index values
    const statusIndex = Math.min(i % statuses.length, statuses.length - 1);
    const programIndex = Math.min(i % programTypes.length, programTypes.length - 1);
    const orgIndex = Math.min(i % organizations.length, organizations.length - 1);
    const schoolIndex = Math.min(i % schools.length, schools.length - 1);
    
    // Explicitly cast the status to string to satisfy TypeScript
    const status: string = statuses[statusIndex] as string;
    
    relationships.push({
      id: `rel-${i}`,
      type: 'host_student',
      primaryId: `hostp-${hostIdx}`, // This is the host profile ID
      secondaryId: `studp-${studentIdx}`, // This is the student profile ID
      status: status,
      startDate: new Date(2024, i % 12, 1).toISOString().split('T')[0],
      endDate: new Date(2025, (i + 6) % 12, 1).toISOString().split('T')[0],
      data: {
        program_type: programTypes[programIndex] as string,
        partner_organization: organizations[orgIndex] as string,
        school_name: schools[schoolIndex] as string
      }
    });
  }
  
  return relationships;
} 