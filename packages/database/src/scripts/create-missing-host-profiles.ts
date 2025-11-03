#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { init, id } from '@instantdb/admin';

// Load .env files
dotenv.config({ path: '.env.local' });

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

if (!APP_ID || !ADMIN_TOKEN) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const adminDb = init({
  appId: APP_ID,
  adminToken: ADMIN_TOKEN,
});

// Generate realistic host family data
function generateHostFamilyProfile(user: any) {
  const maleNames = ['David', 'John', 'James', 'Robert', 'William', 'Christopher', 'Daniel', 'Matthew', 'Mark', 'Paul', 'Steven', 'Andrew', 'Brian', 'Kevin', 'Thomas', 'Richard', 'Charles', 'Joseph', 'Kenneth', 'Michael'];
  const femaleNames = ['Jennifer', 'Lisa', 'Michelle', 'Patricia', 'Maria', 'Nancy', 'Donna', 'Carol', 'Sandra', 'Ruth', 'Sharon', 'Susan', 'Karen', 'Helen', 'Deborah', 'Mary', 'Linda', 'Barbara', 'Elizabeth', 'Sarah'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  
  // Generate primary host (use actual user name if available)
  const primaryFirstName = user.firstName && user.firstName !== 'Host' ? user.firstName : 
    Math.random() > 0.5 ? maleNames[Math.floor(Math.random() * maleNames.length)] : femaleNames[Math.floor(Math.random() * femaleNames.length)];
  
  const primaryLastName = user.lastName && user.lastName !== 'Family' ? user.lastName : 
    lastNames[Math.floor(Math.random() * lastNames.length)];
  
  const primaryGender = maleNames.includes(primaryFirstName) ? 'male' : 'female';
  
  // Generate secondary host (80% chance of having a partner)
  let secondaryHost = null;
  if (Math.random() < 0.8) {
    const secondaryFirstName = primaryGender === 'male' ? 
      femaleNames[Math.floor(Math.random() * femaleNames.length)] :
      maleNames[Math.floor(Math.random() * maleNames.length)];
    
    // 70% chance same last name (married), 30% chance different (blended family)
    const secondaryLastName = Math.random() < 0.7 ? primaryLastName : 
      lastNames[Math.floor(Math.random() * lastNames.length)];
    
    secondaryHost = {
      first_name: secondaryFirstName,
      last_name: secondaryLastName,
      gender: primaryGender === 'male' ? 'female' : 'male',
      age: Math.floor(Math.random() * 15) + 35, // 35-50
      occupation: ['Teacher', 'Nurse', 'Engineer', 'Sales', 'Manager', 'Consultant'][Math.floor(Math.random() * 6)]
    };
  }
  
  const cities = ['Springfield', 'Madison', 'Franklin', 'Georgetown', 'Arlington', 'Fairview', 'Riverside', 'Oak Park', 'Hillside', 'Brookfield'];
  const states = ['IL', 'WI', 'IN', 'OH', 'MI', 'IA', 'MN', 'MO', 'KS', 'NE'];
  
  return {
    firstName: primaryFirstName,
    lastName: primaryLastName,
    email: user.email || `${primaryFirstName.toLowerCase()}.${primaryLastName.toLowerCase()}@email.com`,
    phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    city: cities[Math.floor(Math.random() * cities.length)],
    state: states[Math.floor(Math.random() * states.length)],
    country: 'United States',
    primary_host: {
      first_name: primaryFirstName,
      last_name: primaryLastName,
      gender: primaryGender,
      age: Math.floor(Math.random() * 15) + 35, // 35-50
      occupation: ['Teacher', 'Engineer', 'Sales', 'Manager', 'Consultant', 'Healthcare'][Math.floor(Math.random() * 6)]
    },
    secondary_host: secondaryHost
  };
}

async function createMissingHostProfiles() {
  try {
    console.log('👨‍👩‍👧‍👦 Creating missing host family profiles...\n');

    const result = await adminDb.query({
      users: {
        $: { where: { role: 'host_family' } }
      },
      profiles: {
        $: { where: { type: 'host_family' } }
      }
    });
    
    const users = result.users || [];
    const profiles = result.profiles || [];
    
    console.log(`Found ${users.length} host family users and ${profiles.length} host family profiles`);
    
    // Find users without profiles
    const profileUserIds = new Set(profiles.map(p => p.userId));
    const usersWithoutProfiles = users.filter(user => !profileUserIds.has(user.id));
    
    console.log(`\n=== ANALYSIS ===`);
    console.log(`✅ Users with profiles: ${users.length - usersWithoutProfiles.length}`);
    console.log(`❌ Users without profiles: ${usersWithoutProfiles.length}`);
    
    if (usersWithoutProfiles.length === 0) {
      console.log('\n🎉 All users already have profiles! No action needed.');
      return;
    }
    
    console.log(`\n=== SAMPLE USERS WITHOUT PROFILES ===`);
    usersWithoutProfiles.slice(0, 5).forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
    });
    
    console.log(`\n🔄 Creating profiles for ${usersWithoutProfiles.length} users...`);
    
    // Create profiles in batches
    const batchSize = 10;
    let createdCount = 0;
    
    for (let i = 0; i < usersWithoutProfiles.length; i += batchSize) {
      const batch = usersWithoutProfiles.slice(i, i + batchSize);
      
      const createTransactions = batch.map(user => {
        const profileData = generateHostFamilyProfile(user);
        
        if (!adminDb.tx?.profiles) {
          throw new Error('InstantDB profiles transaction API not available');
        }
        
        return (adminDb.tx as any).profiles[id()].update({
          userId: user.id,
          type: 'host_family',
          verified: Math.random() < 0.7, // 70% verified
          status: Math.random() < 0.9 ? 'active' : 'pending',
          data: profileData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
      
      await adminDb.transact(createTransactions);
      createdCount += batch.length;
      
      console.log(`   Created batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(usersWithoutProfiles.length / batchSize)} (${createdCount}/${usersWithoutProfiles.length} total)`);
    }
    
    console.log(`\n✅ Successfully created ${createdCount} host family profiles!`);
    console.log(`🎯 Database now has ${profiles.length + createdCount} total host family profiles.`);
    
    // Show some examples
    console.log(`\n=== EXAMPLES OF CREATED PROFILES ===`);
    const sampleData = usersWithoutProfiles.slice(0, 5).map(user => {
      const profile = generateHostFamilyProfile(user);
      const primaryName = `${profile.primary_host.first_name} ${profile.primary_host.last_name}`;
      const secondaryName = profile.secondary_host ? `${profile.secondary_host.first_name} ${profile.secondary_host.last_name}` : null;
      return secondaryName ? `${primaryName} & ${secondaryName}` : primaryName;
    });
    
    sampleData.forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });
    
  } catch (error) {
    console.error('💥 Profile creation failed:', error);
  }
}

createMissingHostProfiles(); 