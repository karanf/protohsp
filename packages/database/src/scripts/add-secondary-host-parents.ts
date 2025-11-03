#!/usr/bin/env tsx

/**
 * Add Secondary Host Parents to Existing Host Family Data
 * This script updates existing host family profiles to include both primary and secondary parents
 */

import dotenv from 'dotenv';
import { id, tx, init } from '@instantdb/admin';

// Load .env files
dotenv.config({ path: '.env.local' });

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

if (!APP_ID || !ADMIN_TOKEN) {
  console.error('❌ Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_INSTANT_APP_ID, INSTANT_ADMIN_TOKEN');
  process.exit(1);
}

const adminDb = init({
  appId: APP_ID,
  adminToken: ADMIN_TOKEN,
});

// Common spouse names for generating realistic secondary parents
const spouseNames = {
  male: ['Michael', 'David', 'John', 'James', 'Robert', 'William', 'Christopher', 'Daniel', 'Matthew', 'Mark', 'Paul', 'Steven', 'Andrew', 'Brian', 'Kevin', 'Thomas', 'Richard', 'Charles', 'Joseph', 'Kenneth'],
  female: ['Jennifer', 'Lisa', 'Michelle', 'Patricia', 'Maria', 'Nancy', 'Donna', 'Carol', 'Sandra', 'Ruth', 'Sharon', 'Susan', 'Karen', 'Helen', 'Deborah', 'Mary', 'Linda', 'Barbara', 'Elizabeth', 'Sarah']
};

function getRandomSpouseName(currentGender: string | undefined): string {
  // If current person appears to be male, get female spouse name, and vice versa
  const maleNames = ['David', 'John', 'James', 'Robert', 'William', 'Christopher', 'Daniel', 'Matthew', 'Mark', 'Paul', 'Steven', 'Andrew', 'Brian', 'Kevin', 'Thomas', 'Richard', 'Charles', 'Joseph', 'Kenneth', 'Michael'];
  const femaleNames = ['Jennifer', 'Lisa', 'Michelle', 'Patricia', 'Maria', 'Nancy', 'Donna', 'Carol', 'Sandra', 'Ruth', 'Sharon', 'Susan', 'Karen', 'Helen', 'Deborah', 'Mary', 'Linda', 'Barbara', 'Elizabeth', 'Sarah'];
  
  const isCurrentMale = currentGender ? maleNames.some(name => currentGender.toLowerCase().includes(name.toLowerCase())) : false;
  
  if (isCurrentMale) {
    return femaleNames[Math.floor(Math.random() * femaleNames.length)]!;
  } else {
    return maleNames[Math.floor(Math.random() * maleNames.length)]!;
  }
}

async function addSecondaryHostParents() {
  try {
    console.log('🚀 Adding secondary host parents to existing host family profiles...\n');

    // Fetch all host family profiles
    const result = await adminDb.query({
      users: {
        $: {
          where: {
            role: 'host_family'
          }
        }
      },
      profiles: {
        $: {
          where: {
            type: 'host_family'
          }
        }
      }
    });

    const hostUsers = result.users || [];
    const hostProfiles = result.profiles || [];

    console.log(`Found ${hostUsers.length} host family users and ${hostProfiles.length} host family profiles`);

    if (hostProfiles.length === 0) {
      console.log('No host family profiles found to update');
      return;
    }

    // Update each host family profile
    for (let i = 0; i < hostProfiles.length; i++) {
      const profile = hostProfiles[i];
      if (!profile) continue;
      
      const user = hostUsers.find(u => u.id === profile.userId);
      
      if (!user) {
        console.log(`⚠️  No user found for profile ${profile.id}`);
        continue;
      }

      console.log(`Processing ${i + 1}/${hostProfiles.length}: ${user.firstName} ${user.lastName}`);

      const currentData = profile.data as any;
      
      // Skip if already has complex structure
      if (currentData?.primary_host && currentData?.secondary_host) {
        console.log(`   ✅ Already has complex structure, skipping`);
        continue;
      }

      // Get current name info
      const currentFirstName = currentData?.firstName || user.firstName || 'Unknown';
      const currentLastName = currentData?.lastName || user.lastName || 'Family';

      // Create secondary parent (80% chance of having one)
      const hasSecondaryParent = Math.random() > 0.2;
      const secondaryFirstName = hasSecondaryParent ? getRandomSpouseName(currentFirstName) : null;

      // Sometimes secondary parent has different last name (20% chance)
      const hasDifferentLastName = hasSecondaryParent && Math.random() > 0.8;
      const secondaryLastName = hasDifferentLastName ? 
        ['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez'][Math.floor(Math.random() * 10)] :
        currentLastName;

      // Create updated profile data with complex structure
      const updatedData = {
        ...currentData,
        // Keep existing simple fields for compatibility
        firstName: currentFirstName,
        lastName: currentLastName,
        
        // Add new complex structure
        primary_host: {
          first_name: currentFirstName,
          last_name: currentLastName,
          dob: `19${70 + Math.floor(Math.random() * 25)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          occupation: ['Teacher', 'Engineer', 'Manager', 'Nurse', 'Sales Representative', 'Accountant', 'Marketing Specialist', 'Project Manager', 'Software Developer', 'Administrative Assistant'][Math.floor(Math.random() * 10)],
          employer: `${['Global', 'United', 'First', 'Metro', 'Central', 'Advanced'][Math.floor(Math.random() * 6)]} ${['Solutions', 'Systems', 'Group', 'Corp', 'Industries', 'Services'][Math.floor(Math.random() * 6)]}`,
          work_phone: `555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          education: ['High School', 'Some College', 'Bachelor\'s Degree', 'Master\'s Degree'][Math.floor(Math.random() * 4)],
          languages: ['English']
        },
        
        secondary_host: hasSecondaryParent ? {
          first_name: secondaryFirstName,
          last_name: secondaryLastName,
          dob: `19${70 + Math.floor(Math.random() * 25)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          occupation: ['Teacher', 'Engineer', 'Manager', 'Nurse', 'Sales Representative', 'Accountant', 'Marketing Specialist', 'Project Manager', 'Software Developer', 'Administrative Assistant'][Math.floor(Math.random() * 10)],
          employer: `${['Global', 'United', 'First', 'Metro', 'Central', 'Advanced'][Math.floor(Math.random() * 6)]} ${['Solutions', 'Systems', 'Group', 'Corp', 'Industries', 'Services'][Math.floor(Math.random() * 6)]}`,
          work_phone: `555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          education: ['High School', 'Some College', 'Bachelor\'s Degree', 'Master\'s Degree'][Math.floor(Math.random() * 4)],
          languages: ['English']
        } : null
      };

      // Update the profile
      if (!adminDb.tx?.profiles) {
        throw new Error('InstantDB profiles transaction API not available');
      }
      await adminDb.transact([
        (adminDb.tx as any).profiles[profile.id].update({
          data: updatedData,
          updatedAt: new Date().toISOString()
        })
      ]);

      const displayName = hasSecondaryParent 
        ? `${currentFirstName} ${currentLastName} & ${secondaryFirstName} ${secondaryLastName}`
        : `${currentFirstName} ${currentLastName}`;
      
      console.log(`   ✅ Updated: ${displayName}`);
    }

    console.log('\n🎉 Successfully updated all host family profiles with secondary parent data!');
    console.log('Host families now have the proper structure to display both parent names.');

  } catch (error) {
    console.error('💥 Failed to add secondary host parents:', error);
    
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
addSecondaryHostParents(); 