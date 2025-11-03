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

async function cleanupOrphanedProfiles() {
  try {
    console.log('🧹 Cleaning up orphaned host family profiles...\n');

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
    
    // Find orphaned profiles (profiles without matching users)
    const userIds = new Set(users.map(u => u.id));
    const orphanedProfiles = profiles.filter(p => !userIds.has(p.userId));
    const matchedProfiles = profiles.filter(p => userIds.has(p.userId));
    
    console.log(`\n=== ANALYSIS ===`);
    console.log(`✅ Matched profiles: ${matchedProfiles.length}`);
    console.log(`❌ Orphaned profiles: ${orphanedProfiles.length}`);
    
    if (orphanedProfiles.length === 0) {
      console.log('\n🎉 No orphaned profiles found! Database is clean.');
      return;
    }
    
    console.log(`\n=== SAMPLE ORPHANED PROFILES ===`);
    orphanedProfiles.slice(0, 5).forEach((profile, index) => {
      const data = profile.data as any;
      console.log(`${index + 1}. Profile ID: ${profile.id}`);
      console.log(`   User ID: ${profile.userId} (NOT FOUND)`);
      console.log(`   Name: ${data?.firstName || 'Unknown'} ${data?.lastName || 'Unknown'}`);
      console.log(`   Email: ${data?.email || 'Unknown'}`);
      console.log('');
    });
    
    console.log(`\n⚠️  Found ${orphanedProfiles.length} orphaned profiles that will be removed.`);
    console.log('These profiles have no corresponding user records and are likely from failed imports.');
    
    // Ask for confirmation (we'll implement this as a simple timeout)
    console.log('\n🔄 Proceeding with cleanup in 3 seconds... (Press Ctrl+C to cancel)');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\n🗑️  Deleting orphaned profiles...');
    
    // Delete orphaned profiles in batches
    const batchSize = 10;
    let deletedCount = 0;
    
    for (let i = 0; i < orphanedProfiles.length; i += batchSize) {
      const batch = orphanedProfiles.slice(i, i + batchSize);
      
      const deleteTransactions = batch.map(profile => {
        if (!adminDb.tx?.profiles) {
          throw new Error('InstantDB profiles transaction API not available');
        }
        return (adminDb.tx as any).profiles[profile.id].delete();
      });
      
      await adminDb.transact(deleteTransactions);
      deletedCount += batch.length;
      
      console.log(`   Deleted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(orphanedProfiles.length / batchSize)} (${deletedCount}/${orphanedProfiles.length} total)`);
    }
    
    console.log(`\n✅ Successfully deleted ${deletedCount} orphaned profiles!`);
    console.log(`🎯 Database now has ${matchedProfiles.length} valid host family profiles.`);
    
  } catch (error) {
    console.error('💥 Cleanup failed:', error);
  }
}

cleanupOrphanedProfiles(); 