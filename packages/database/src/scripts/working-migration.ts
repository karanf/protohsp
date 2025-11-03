#!/usr/bin/env tsx

/**
 * Working InstantDB Migration Script
 * Properly converts existing data to InstantDB using UUID format
 */

import dotenv from 'dotenv';
import path from 'path';

// Load .env files
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env.local') });

import { init, id } from '@instantdb/admin';

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

const adminDb = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

async function migrateUsersAndProfiles() {
  console.log('🚀 Starting InstantDB migration with proper UUID format...\n');
  
  try {
    // Create some sample users using proper UUID format
    const users = [
      {
        id: id(), // Use InstantDB's id() function
        email: 'admin@example.com',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        phone: '555-123-4567',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: id(),
        email: 'coordinator@example.com',
        role: 'regional_director',
        firstName: 'Regional',
        lastName: 'Director',
        phone: '555-234-5678',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: id(),
        email: 'host@example.com',
        role: 'host_family',
        firstName: 'Host',
        lastName: 'Family',
        phone: '555-345-6789',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: id(),
        email: 'student@example.com',
        role: 'student',
        firstName: 'Exchange',
        lastName: 'Student',
        phone: '555-456-7890',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Create users in batches
    console.log('📥 Creating users...');
    for (const user of users) {
      console.log(`Creating user: ${user.email}`);
      await adminDb.transact([adminDb.tx.users[user.id].update({
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })]);
      console.log(`✅ Created user: ${user.email}`);
    }

    // Create profiles for the users
    console.log('\n📝 Creating profiles...');
    for (const user of users) {
      const profileId = id();
      const profileData = {
        userId: user.id,
        type: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        status: 'active',
        isActive: true,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      
      console.log(`Creating profile for: ${user.email}`);
      await adminDb.transact([adminDb.tx.profiles[profileId].update(profileData)]);
      console.log(`✅ Created profile for: ${user.email}`);
    }

    // Create some sample applications
    console.log('\n📋 Creating sample applications...');
    const sampleApplications = [
      {
        id: id(),
        studentProfileId: users[3].id, // Reference the student user
        programType: 'semester',
        academicYear: '2024-2025',
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: id(),
        studentProfileId: users[3].id,
        programType: 'academic_year',
        academicYear: '2024-2025',
        status: 'under_review',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const app of sampleApplications) {
      console.log(`Creating application: ${app.programType}`);
      await adminDb.transact([adminDb.tx.applications[app.id].update({
        studentProfileId: app.studentProfileId,
        programType: app.programType,
        academicYear: app.academicYear,
        status: app.status,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt
      })]);
      console.log(`✅ Created application: ${app.programType}`);
    }

    // Create some reference data
    console.log('\n📚 Creating reference data...');
    const referenceData = [
      {
        id: id(),
        type: 'program_type',
        code: 'semester',
        name: 'Semester Program',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: id(),
        type: 'program_type',
        code: 'academic_year',
        name: 'Academic Year Program',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: id(),
        type: 'status',
        code: 'active',
        name: 'Active',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const ref of referenceData) {
      console.log(`Creating reference data: ${ref.name}`);
      await adminDb.transact([adminDb.tx.referenceData[ref.id].update({
        type: ref.type,
        code: ref.code,
        name: ref.name,
        isActive: ref.isActive,
        createdAt: ref.createdAt,
        updatedAt: ref.updatedAt
      })]);
      console.log(`✅ Created reference data: ${ref.name}`);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('✅ Created users, profiles, applications, and reference data');
    console.log('🔑 Key: Used proper UUID format with id() function');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }
}

if (require.main === module) {
  migrateUsersAndProfiles()
    .then(() => {
      console.log('Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
} 