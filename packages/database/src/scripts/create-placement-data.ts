#!/usr/bin/env tsx

/**
 * Create Placement Data for InstantDB
 * This script creates sample placement data for the placements view
 */

import dotenv from 'dotenv';
import path from 'path';

// Load .env files - dotenv will look for .env files starting from current directory
dotenv.config({ path: '.env.local' });

import { init, id } from '@instantdb/admin';
import { schema } from '../schema/index.js';

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

if (!INSTANT_APP_ID || !INSTANT_ADMIN_TOKEN) {
  console.error('Missing InstantDB credentials');
  process.exit(1);
}

const adminDb = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
  schema,
});

async function createPlacementData() {
  try {
    console.log('🚀 Creating placement data in InstantDB...\n');

    // Create users first
    console.log('Creating users...');
    const users = [
      {
        id: id(),
        email: 'emma.schmidt@example.com',
        role: 'student',
        firstName: 'Emma',
        lastName: 'Schmidt',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: id(),
        email: 'jennifer.johnson@example.com',
        role: 'host_family',
        firstName: 'Jennifer',
        lastName: 'Johnson',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: id(),
        email: 'lukas.mueller@example.com',
        role: 'student',
        firstName: 'Lukas',
        lastName: 'Mueller',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: id(),
        email: 'michael.smith@example.com',
        role: 'host_family',
        firstName: 'Michael',
        lastName: 'Smith',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: id(),
        email: 'amy.thompson@example.com',
        role: 'local_coordinator',
        firstName: 'Amy',
        lastName: 'Thompson',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const user of users) {
      console.log(`Creating user: ${user.email}`);
      if (!adminDb.tx.users) {
        throw new Error('InstantDB users transaction API not available');
      }
      await adminDb.transact([(adminDb.tx as any).users[user.id].update({
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })]);
      console.log(`✅ Created user: ${user.email}`);
    }

    // Create profiles
    console.log('\nCreating profiles...');
    const profiles = [];
    for (const user of users) {
      const profileId = id();
      const profileData = {
        userId: user.id,
        type: user.role,
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          country: user.role === 'student' ? (user.firstName === 'Emma' ? 'Germany' : 'Germany') : 'USA',
          dateOfBirth: user.role === 'student' ? '2007-05-12' : undefined,
          gender: user.role === 'student' ? (user.firstName === 'Emma' ? 'Female' : 'Male') : undefined,
          program: user.role === 'student' ? 'Academic Year' : undefined,
          phone: user.role === 'host_family' ? '555-0101' : undefined,
          city: user.role === 'host_family' ? 'Portland' : undefined,
          state: user.role === 'host_family' ? 'OR' : undefined,
          region: user.role === 'local_coordinator' ? 'Pacific Northwest' : undefined
        },
        status: 'active',
        verified: true,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      
      profiles.push({ id: profileId, ...profileData, userId: user.id, type: user.role });
      
      console.log(`Creating profile for: ${user.email}`);
      if (!adminDb.tx.profiles) {
        throw new Error('InstantDB profiles transaction API not available');
      }
      await adminDb.transact([(adminDb.tx as any).profiles[profileId].update({
        userId: profileData.userId,
        type: profileData.type,
        data: profileData.data,
        status: profileData.status,
        verified: profileData.verified,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt
      })]);
      console.log(`✅ Created profile for: ${user.email}`);
    }

    // Create placements
    console.log('\nCreating placements...');
    const studentProfiles = profiles.filter(p => p.type === 'student');
    const hostProfiles = profiles.filter(p => p.type === 'host_family');
    const coordinatorProfiles = profiles.filter(p => p.type === 'local_coordinator');

    const placements = [
      {
        id: id(),
        studentProfileId: studentProfiles[0]?.id,
        hostFamilyProfileId: hostProfiles[0]?.id,
        coordinatorProfileId: coordinatorProfiles[0]?.id,
        status: 'active',
        startDate: new Date('2024-08-15').toISOString(),
        endDate: new Date('2025-06-15').toISOString(),
        school: 'Washington High School',
        grade: '11',
        programDuration: 'academic_year',
        emergencyContactName: 'Maria Schmidt',
        emergencyContactPhone: '+49-123-456-789',
        emergencyContactRelationship: 'Mother',
        notes: 'Student is adjusting well to American culture',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: id(),
        studentProfileId: studentProfiles[1]?.id,
        hostFamilyProfileId: hostProfiles[1]?.id,
        coordinatorProfileId: coordinatorProfiles[0]?.id,
        status: 'pending',
        startDate: new Date('2024-09-01').toISOString(),
        endDate: new Date('2025-01-15').toISOString(),
        school: 'Lincoln Academy',
        grade: '10',
        programDuration: 'semester',
        emergencyContactName: 'Hans Mueller',
        emergencyContactPhone: '+49-987-654-321',
        emergencyContactRelationship: 'Father',
        notes: 'Waiting for visa approval',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const placement of placements) {
      console.log(`Creating placement for student: ${placement.studentProfileId}`);
      if (!adminDb.tx.placements) {
        throw new Error('InstantDB placements transaction API not available');
      }
      await adminDb.transact([(adminDb.tx as any).placements[placement.id].update({
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
      console.log(`✅ Created placement for: ${placement.school}`);
    }

    console.log('\n🎉 Successfully created placement data!');
    console.log('You can now view the placements in the application.');

  } catch (error) {
    console.error('💥 Failed to create placement data:', error);
    
    // More detailed error analysis
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
createPlacementData(); 