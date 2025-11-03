#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { init } from '@instantdb/admin';

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

async function debugHostFamilies() {
  try {
    console.log('🔍 Debugging host family data structure...\n');

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
    
    console.log('=== DATA OVERVIEW ===');
    console.log(`Total host family users: ${users.length}`);
    console.log(`Total host family profiles: ${profiles.length}`);
    
    // Check for orphaned profiles (profiles without matching users)
    const userIds = new Set(users.map(u => u.id));
    const orphanedProfiles = profiles.filter(p => !userIds.has(p.userId));
    const matchedProfiles = profiles.filter(p => userIds.has(p.userId));
    
    console.log(`\n=== PROFILE MATCHING ===`);
    console.log(`Matched profiles: ${matchedProfiles.length}`);
    console.log(`Orphaned profiles: ${orphanedProfiles.length}`);
    
    // Show sample user structure
    if (users.length > 0) {
      console.log(`\n=== SAMPLE USER STRUCTURE ===`);
      const sampleUser = users[0]!;
      console.log(`ID: ${sampleUser.id}`);
      console.log(`Name: ${sampleUser.firstName} ${sampleUser.lastName}`);
      console.log(`Email: ${sampleUser.email}`);
      console.log(`Role: ${sampleUser.role}`);
    }
    
    // Show sample profile structure  
    if (matchedProfiles.length > 0) {
      console.log(`\n=== SAMPLE MATCHED PROFILE STRUCTURE ===`);
      const sampleProfile = matchedProfiles[0]!;
      console.log(`Profile ID: ${sampleProfile.id}`);
      console.log(`User ID: ${sampleProfile.userId}`);
      console.log(`Type: ${sampleProfile.type}`);
      console.log(`Data keys: ${Object.keys(sampleProfile.data || {})}`);
      
      if (sampleProfile.data) {
        const data = sampleProfile.data as any;
        console.log(`\n=== PROFILE DATA STRUCTURE ===`);
        console.log(`firstName: ${data.firstName}`);
        console.log(`lastName: ${data.lastName}`);
        console.log(`primary_host: ${data.primary_host ? 'EXISTS' : 'MISSING'}`);
        console.log(`secondary_host: ${data.secondary_host ? 'EXISTS' : 'MISSING'}`);
        
        if (data.primary_host) {
          console.log(`Primary host name: ${data.primary_host.first_name} ${data.primary_host.last_name}`);
        }
        if (data.secondary_host) {
          console.log(`Secondary host name: ${data.secondary_host.first_name} ${data.secondary_host.last_name}`);
        }
      }
    }
    
    // Count how many profiles have the updated structure
    const profilesWithComplexStructure = matchedProfiles.filter(p => p.data?.primary_host);
    const profilesWithSimpleStructure = matchedProfiles.filter(p => !p.data?.primary_host && (p.data?.firstName || p.data?.lastName));
    
    console.log(`\n=== PROFILE STRUCTURE ANALYSIS ===`);
    console.log(`Profiles with complex structure (primary_host): ${profilesWithComplexStructure.length}`);
    console.log(`Profiles with simple structure (firstName/lastName): ${profilesWithSimpleStructure.length}`);
    console.log(`Profiles with no name data: ${matchedProfiles.length - profilesWithComplexStructure.length - profilesWithSimpleStructure.length}`);
    
    // Show some examples of complex structure
    console.log(`\n=== EXAMPLES OF UPDATED PROFILES ===`);
    profilesWithComplexStructure.slice(0, 5).forEach((profile, index) => {
      const data = profile.data as any;
      const primaryName = `${data.primary_host?.first_name || ''} ${data.primary_host?.last_name || ''}`.trim();
      const secondaryName = data.secondary_host ? `${data.secondary_host?.first_name || ''} ${data.secondary_host?.last_name || ''}`.trim() : null;
      const displayName = secondaryName ? `${primaryName} & ${secondaryName}` : primaryName;
      console.log(`${index + 1}. ${displayName}`);
    });

  } catch (error) {
    console.error('💥 Debug failed:', error);
  }
}

debugHostFamilies(); 