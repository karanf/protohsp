#!/usr/bin/env tsx

/**
 * Convert Existing Mock Data to InstantDB
 * This script takes the existing Supabase seed data and converts it to InstantDB format
 */

import dotenv from 'dotenv';
import path from 'path';

// Load .env files
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env.local') });

import { init } from '@instantdb/admin';

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

const adminDb = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

// Sample data based on the existing structure
const existingUsers = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@example.com',
    role: 'admin',
    firstName: 'System',
    lastName: 'Administrator',
    phone: '555-123-4567',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dir-wpdsgh',
    email: 'director.al@example.com', 
    role: 'regional_director',
    firstName: 'Robert',
    lastName: 'Anderson',
    phone: '202-263-1468',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'coord-afbdb5',
    email: 'coordinator.lauren.thomas@example.com',
    role: 'coordinator', 
    firstName: 'Lauren',
    lastName: 'Thomas',
    phone: '752-889-4080',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'stud-001',
    email: 'student1@example.com',
    role: 'student',
    firstName: 'Anna',
    lastName: 'Mueller',
    phone: '+49-123-456-789',
    status: 'pending_review',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'host-001',
    email: 'host1@example.com',
    role: 'host_family',
    firstName: 'Jennifer',
    lastName: 'Smith',
    phone: '555-234-5678',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const existingProfiles = [
  {
    id: 'profile-admin-001',
    userId: '00000000-0000-0000-0000-000000000001',
    type: 'admin',
    firstName: 'System',
    lastName: 'Administrator',
    email: 'admin@example.com',
    phone: '555-123-4567',
    status: 'active',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dirp-yo7v0x',
    userId: 'dir-wpdsgh',
    type: 'regional_director',
    firstName: 'Robert',
    lastName: 'Anderson',
    email: 'director.al@example.com',
    phone: '202-263-1468',
    address: {
      street: '529 Main St',
      city: 'Birmingham',
      state: 'AL',
      zipCode: '10171',
      country: 'USA'
    },
    bio: 'Robert manages the exchange student program across Alabama, working with local coordinators and host families.',
    status: 'active',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'coordp-0mc2ln',
    userId: 'coord-afbdb5',
    type: 'local_coordinator',
    firstName: 'Lauren',
    lastName: 'Thomas',
    email: 'coordinator.lauren.thomas@example.com',
    phone: '752-889-4080',
    address: {
      street: '406 Maple St',
      city: 'Birmingham',
      state: 'AL',
      zipCode: '86527',
      country: 'USA'
    },
    bio: 'Lauren specializes in helping students adjust to life in Birmingham, Alabama.',
    status: 'active',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'studentp-001',
    userId: 'stud-001',
    type: 'student',
    firstName: 'Anna',
    lastName: 'Mueller',
    email: 'student1@example.com',
    phone: '+49-123-456-789',
    address: {
      street: 'Hauptstraße 123',
      city: 'Munich',
      state: 'Bavaria',
      zipCode: '80331',
      country: 'Germany'
    },
    bio: "I'm an enthusiastic student from Germany excited to experience American culture and improve my English skills.",
    interests: ['soccer', 'music', 'reading'],
    languages: ['German', 'English'],
    status: 'pending_review',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'hostp-001',
    userId: 'host-001',
    type: 'host_family',
    firstName: 'Jennifer',
    lastName: 'Smith',
    email: 'host1@example.com',
    phone: '555-234-5678',
    address: {
      street: '123 Oak Avenue',
      city: 'Birmingham',
      state: 'AL',
      zipCode: '35209',
      country: 'USA'
    },
    bio: 'We are a welcoming family excited to share American culture with an exchange student.',
    status: 'active',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const existingApplications = [
  {
    id: 'app-001',
    studentProfileId: 'studentp-001',
    programType: 'academic_year',
    academicYear: '2024-2025',
    preferredCountries: ['USA'],
    status: 'submitted',
    submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    requirements: {
      documents: ['passport', 'transcript', 'recommendation_letter'],
      completed: false
    },
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const existingPlacements = [
  {
    id: 'placement-001',
    studentProfileId: 'studentp-001',
    hostFamilyProfileId: 'hostp-001',
    programType: 'academic_year',
    startDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    location: {
      city: 'Birmingham',
      state: 'AL',
      country: 'USA'
    },
    agreement: {
      signed: true,
      signedDate: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const existingReferenceData = [
  {
    id: 'country-001',
    type: 'country',
    code: 'usa',
    name: 'United States',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'country-002', 
    type: 'country',
    code: 'germany',
    name: 'Germany',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'program-001',
    type: 'program_type',
    code: 'academic_year',
    name: 'Academic Year',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

async function convertExistingData() {
  try {
    console.log('Converting existing data to InstantDB format...');
    
    // Add users
    console.log('Adding users...');
    for (const user of existingUsers) {
      try {
        await adminDb.transact([adminDb.tx.users[user.id].update(user)]);
        console.log(`✅ Added user: ${user.email}`);
      } catch (error) {
        console.error(`❌ Failed to add user ${user.email}:`, error);
      }
    }
    
    // Add profiles  
    console.log('Adding profiles...');
    for (const profile of existingProfiles) {
      try {
        await adminDb.transact([adminDb.tx.profiles[profile.id].update(profile)]);
        console.log(`✅ Added profile: ${profile.email}`);
      } catch (error) {
        console.error(`❌ Failed to add profile ${profile.email}:`, error);
      }
    }
    
    // Add applications
    console.log('Adding applications...');
    for (const application of existingApplications) {
      try {
        await adminDb.transact([adminDb.tx.applications[application.id].update(application)]);
        console.log(`✅ Added application: ${application.id}`);
      } catch (error) {
        console.error(`❌ Failed to add application ${application.id}:`, error);
      }
    }
    
    // Add placements
    console.log('Adding placements...');
    for (const placement of existingPlacements) {
      try {
        await adminDb.transact([adminDb.tx.placements[placement.id].update(placement)]);
        console.log(`✅ Added placement: ${placement.id}`);
      } catch (error) {
        console.error(`❌ Failed to add placement ${placement.id}:`, error);
      }
    }
    
    // Add reference data
    console.log('Adding reference data...');
    for (const ref of existingReferenceData) {
      try {
        await adminDb.transact([adminDb.tx.referenceData[ref.id].update(ref)]);
        console.log(`✅ Added reference data: ${ref.name}`);
      } catch (error) {
        console.error(`❌ Failed to add reference data ${ref.name}:`, error);
      }
    }
    
    console.log('🎉 Data conversion completed successfully!');
    
  } catch (error) {
    console.error('💥 Data conversion failed:', error);
    throw error;
  }
}

if (require.main === module) {
  convertExistingData()
    .then(() => {
      console.log('Conversion script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Conversion script failed:', error);
      process.exit(1);
    });
}

export { convertExistingData }; 