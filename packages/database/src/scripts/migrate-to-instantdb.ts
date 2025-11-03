#!/usr/bin/env tsx

/**
 * Migration Script: Supabase to InstantDB
 * 
 * This script converts the existing Supabase mock data to InstantDB format.
 * It creates comprehensive sample data for all entities in the InstantDB schema.
 */

import { adminDb, instantHelpers } from '../client';

// Type definitions
interface SampleUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface SampleProfile {
  id: string;
  userId: string;
  type: 'student' | 'host_family' | 'local_coordinator' | 'program_coordinator' | 'admin';
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: any;
  bio?: string;
  interests?: string[];
  languages?: string[];
  emergencyContact?: any;
  preferences?: any;
  documents?: any[];
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Generate sample users
function generateSampleUsers(count: number = 100): SampleUser[] {
  const roles = ['student', 'host_family', 'local_coordinator', 'program_coordinator', 'admin'];
  const statuses = ['active', 'inactive', 'pending', 'suspended'];
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily', 'Chris', 'Lisa', 'Tom', 'Anna'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)] || 'John';
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)] || 'Doe';
    const role = roles[Math.floor(Math.random() * roles.length)] || 'student';
    const status = statuses[Math.floor(Math.random() * statuses.length)] || 'active';
    
    return {
      id: `user_${i + 1}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@example.com`,
      firstName,
      lastName,
      role,
      status,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };
  });
}

// Generate sample profiles
function generateSampleProfiles(users: SampleUser[]): SampleProfile[] {
  const profileTypes: ('student' | 'host_family' | 'local_coordinator' | 'program_coordinator' | 'admin')[] = 
    ['student', 'host_family', 'local_coordinator', 'program_coordinator', 'admin'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese'];
  const interests = ['Sports', 'Music', 'Art', 'Technology', 'Reading', 'Travel', 'Cooking', 'Photography'];

  return users.map(user => {
    const profileType = profileTypes[Math.floor(Math.random() * profileTypes.length)] || 'student';
    
    return {
      id: `profile_${user.id}`,
      userId: user.id,
      type: profileType,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      address: {
        street: `${Math.floor(Math.random() * 9999) + 1} Main St`,
        city: 'Sample City',
        state: 'Sample State',
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        country: 'USA'
      },
      bio: `Sample bio for ${user.firstName} ${user.lastName}`,
      interests: interests.slice(0, Math.floor(Math.random() * 4) + 1),
      languages: languages.slice(0, Math.floor(Math.random() * 3) + 1),
      emergencyContact: {
        name: 'Emergency Contact',
        phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        relationship: 'Parent'
      },
      preferences: {
        dietaryRestrictions: [],
        allergies: [],
        hobbies: interests.slice(0, Math.floor(Math.random() * 3) + 1)
      },
      documents: [],
      status: user.status,
      isActive: user.status === 'active',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  });
}

// Generate sample applications
function generateSampleApplications(profiles: SampleProfile[]) {
  const students = profiles.filter(p => p.type === 'student');
  const statuses = ['draft', 'submitted', 'under_review', 'approved', 'rejected'];
  
  return students.slice(0, 50).map((student, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)] || 'draft';
    
    return {
      id: `app_${i + 1}`,
      studentProfileId: student.id,
      programType: 'exchange',
      academicYear: '2024-2025',
      preferredCountries: ['USA', 'Canada', 'UK'],
      status,
      submittedAt: status !== 'draft' ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      reviewedAt: ['under_review', 'approved', 'rejected'].includes(status) ? new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      decisionDate: ['approved', 'rejected'].includes(status) ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      requirements: {
        documents: ['passport', 'transcript', 'recommendation_letter'],
        completed: Math.random() > 0.5
      },
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };
  });
}

// Generate sample placements
function generateSamplePlacements(profiles: SampleProfile[]) {
  const students = profiles.filter(p => p.type === 'student');
  const hostFamilies = profiles.filter(p => p.type === 'host_family');
  
  const placements = [];
  const maxPlacements = Math.min(students.length, hostFamilies.length, 30);
  
  for (let i = 0; i < maxPlacements; i++) {
    const student = students[i];
    const hostFamily = hostFamilies[i];
    
    if (student && hostFamily) {
      placements.push({
        id: `placement_${i + 1}`,
        studentProfileId: student.id,
        hostFamilyProfileId: hostFamily.id,
        programType: 'exchange',
        startDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + (365 + Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        location: {
          city: 'Sample City',
          state: 'Sample State',
          country: 'USA'
        },
        agreement: {
          signed: true,
          signedDate: new Date().toISOString()
        },
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }
  
  return placements;
}

// Generate sample monitoring records
function generateSampleMonitoring(placements: any[]) {
  return placements.slice(0, 20).map((placement, i) => ({
    id: `monitoring_${i + 1}`,
    placementId: placement.id,
    type: 'check_in',
    scheduledDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    completedDate: Math.random() > 0.5 ? new Date().toISOString() : undefined,
    status: Math.random() > 0.5 ? 'completed' : 'scheduled',
    notes: `Sample monitoring notes for placement ${placement.id}`,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }));
}

// Generate sample change queue entries
function generateSampleChangeQueue(profiles: SampleProfile[]) {
  const changeTypes = ['profile_update', 'placement_change', 'status_change', 'document_update'];
  
  return profiles.slice(0, 15).map((profile, i) => ({
    id: `change_${i + 1}`,
    entityType: 'profile',
    entityId: profile.id,
    changeType: changeTypes[Math.floor(Math.random() * changeTypes.length)],
    oldValue: { status: 'pending' },
    newValue: { status: 'active' },
    requestedBy: profile.userId,
    status: Math.random() > 0.5 ? 'approved' : 'pending',
    requestDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    processedDate: Math.random() > 0.5 ? new Date().toISOString() : undefined,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }));
}

// Generate sample reference data
function generateSampleReferenceData() {
  const referenceData: any[] = [];
  
  // Countries
  const countries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Spain', 'Italy', 'Australia'];
  countries.forEach((country, i) => {
    referenceData.push({
      id: `country_${i + 1}`,
      type: 'country',
      code: country.toLowerCase().replace(' ', '_'),
      name: country,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });
  
  // Program types
  const programTypes = ['exchange', 'au_pair', 'internship', 'work_travel'];
  programTypes.forEach((type, i) => {
    referenceData.push({
      id: `program_${i + 1}`,
      type: 'program_type',
      code: type,
      name: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });
  
  return referenceData;
}

// Main migration function
export async function migrateToInstantDB() {
  try {
    console.log('Starting InstantDB migration...');
    
    // Generate sample data
    const users = generateSampleUsers(100);
    const profiles = generateSampleProfiles(users);
    const applications = generateSampleApplications(profiles);
    const placements = generateSamplePlacements(profiles);
    const monitoring = generateSampleMonitoring(placements);
    const changeQueue = generateSampleChangeQueue(profiles);
    const referenceData = generateSampleReferenceData();
    
    console.log(`Generated:
    - ${users.length} users
    - ${profiles.length} profiles  
    - ${applications.length} applications
    - ${placements.length} placements
    - ${monitoring.length} monitoring records
    - ${changeQueue.length} change queue entries
    - ${referenceData.length} reference data entries`);
    
    // Upload data to InstantDB
    console.log('Uploading users...');
    if (!adminDb) {
      throw new Error('AdminDB client not available');
    }
    
    for (const user of users) {
      if (!adminDb.tx?.users) {
        throw new Error('Users transaction not available');
      }
      const userEntity = adminDb.tx.users[user.id];
      if (!userEntity) {
        throw new Error(`User entity not found for ID: ${user.id}`);
      }
      const userTransaction = userEntity.update(user as any);
      if (!userTransaction) {
        throw new Error('Failed to create user transaction');
      }
      await adminDb.transact([userTransaction]);
    }
    
    console.log('Uploading profiles...');
    for (const profile of profiles) {
      if (!adminDb.tx?.profiles) {
        throw new Error('Profiles transaction not available');
      }
      const profileEntity = adminDb.tx.profiles[profile.id];
      if (!profileEntity) {
        throw new Error(`Profile entity not found for ID: ${profile.id}`);
      }
      const profileTransaction = profileEntity.update(profile as any);
      if (!profileTransaction) {
        throw new Error('Failed to create profile transaction');
      }
      await adminDb.transact([profileTransaction]);
    }
    
    console.log('Uploading applications...');
    for (const application of applications) {
      if (!adminDb.tx?.applications) {
        throw new Error('Applications transaction not available');
      }
      const applicationEntity = adminDb.tx.applications[application.id];
      if (!applicationEntity) {
        throw new Error(`Application entity not found for ID: ${application.id}`);
      }
      const applicationTransaction = applicationEntity.update(application as any);
      if (!applicationTransaction) {
        throw new Error('Failed to create application transaction');
      }
      await adminDb.transact([applicationTransaction]);
    }
    
    console.log('Uploading placements...');
    for (const placement of placements) {
      if (!adminDb.tx?.placements) {
        throw new Error('Placements transaction not available');
      }
      const placementEntity = adminDb.tx.placements[placement.id];
      if (!placementEntity) {
        throw new Error(`Placement entity not found for ID: ${placement.id}`);
      }
      const placementTransaction = placementEntity.update(placement as any);
      if (!placementTransaction) {
        throw new Error('Failed to create placement transaction');
      }
      await adminDb.transact([placementTransaction]);
    }
    
    console.log('Uploading monitoring records...');
    for (const monitor of monitoring) {
      if (!adminDb.tx?.monitoring) {
        throw new Error('Monitoring transaction not available');
      }
      const monitorEntity = adminDb.tx.monitoring[monitor.id];
      if (!monitorEntity) {
        throw new Error(`Monitor entity not found for ID: ${monitor.id}`);
      }
      const monitorTransaction = monitorEntity.update(monitor as any);
      if (!monitorTransaction) {
        throw new Error('Failed to create monitor transaction');
      }
      await adminDb.transact([monitorTransaction]);
    }
    
    console.log('Uploading change queue entries...');
    for (const change of changeQueue) {
      if (!adminDb.tx?.changeQueue) {
        throw new Error('ChangeQueue transaction not available');
      }
      const changeEntity = adminDb.tx.changeQueue[change.id];
      if (!changeEntity) {
        throw new Error(`Change entity not found for ID: ${change.id}`);
      }
      const changeTransaction = changeEntity.update(change as any);
      if (!changeTransaction) {
        throw new Error('Failed to create change transaction');
      }
      await adminDb.transact([changeTransaction]);
    }
    
    console.log('Uploading reference data...');
    for (const ref of referenceData) {
      if (!adminDb.tx?.referenceData) {
        throw new Error('ReferenceData transaction not available');
      }
      const refEntity = adminDb.tx.referenceData[ref.id];
      if (!refEntity) {
        throw new Error(`Reference entity not found for ID: ${ref.id}`);
      }
      const refTransaction = refEntity.update(ref as any);
      if (!refTransaction) {
        throw new Error('Failed to create reference transaction');
      }
      await adminDb.transact([refTransaction]);
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateToInstantDB()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
} 