import dotenv from 'dotenv';

// Load .env files
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

import { init, tx } from '@instantdb/admin';

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

if (!INSTANT_APP_ID || !INSTANT_ADMIN_TOKEN) {
  console.error('❌ Missing InstantDB credentials');
  process.exit(1);
}

const db = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

async function removeDuplicateUsers() {
  try {
    console.log('🧹 Starting duplicate user cleanup...\n');

    // Get all users
    const result = await db.query({
      users: {},
      profiles: {}
    });

    const users = result.users || [];
    
    console.log(`Total users before cleanup: ${users.length}`);

    // Group users by email pattern and name to find duplicates
    const usersByEmailPattern = new Map<string, any[]>();
    const usersByName = new Map<string, any[]>();
    
    for (const user of users) {
      // Group by email pattern (remove numbers to find pattern duplicates)
      if (user.email) {
        const baseEmail = user.email.replace(/\d+/g, '');
        if (!usersByEmailPattern.has(baseEmail)) {
          usersByEmailPattern.set(baseEmail, []);
        }
        usersByEmailPattern.get(baseEmail)!.push(user);
      }
      
      // Group by name combination
      if (user.firstName && user.lastName) {
        const fullName = `${user.firstName} ${user.lastName}`;
        if (!usersByName.has(fullName)) {
          usersByName.set(fullName, []);
        }
        usersByName.get(fullName)!.push(user);
      }
    }
    
    // Identify users to delete (keep first, delete rest)
    const usersToDelete: any[] = [];
    let duplicatesFound = 0;
    
    // Check email pattern duplicates
    for (const [emailPattern, usersWithPattern] of usersByEmailPattern) {
      if (usersWithPattern.length > 1) {
        // Check if they also have same name (then they're true duplicates)
        const nameGroups = new Map<string, any[]>();
        for (const user of usersWithPattern) {
          const fullName = `${user.firstName} ${user.lastName}`;
          if (!nameGroups.has(fullName)) {
            nameGroups.set(fullName, []);
          }
          nameGroups.get(fullName)!.push(user);
        }
        
        // For each name group with same email pattern, keep first and mark rest for deletion
        for (const [name, usersWithName] of nameGroups) {
          if (usersWithName.length > 1) {
            console.log(`🔍 Found ${usersWithName.length} duplicates: ${name} (${emailPattern})`);
            // Keep first, delete rest
            usersToDelete.push(...usersWithName.slice(1));
            duplicatesFound += usersWithName.length - 1;
          }
        }
      }
    }

    // Remove duplicates from the list (in case we added same user multiple times)
    const uniqueUsersToDelete = Array.from(new Set(usersToDelete.map(u => u.id)))
      .map(id => usersToDelete.find(u => u.id === id)!)
      .filter(user => user.role !== 'admin'); // Never delete admin users

    console.log(`\n📊 Cleanup Summary:`);
    console.log(`🔸 Total duplicates found: ${duplicatesFound}`);
    console.log(`🔸 Users to delete: ${uniqueUsersToDelete.length}`);
    console.log(`🔸 Users will remain: ${users.length - uniqueUsersToDelete.length}`);

    if (uniqueUsersToDelete.length === 0) {
      console.log('\n✅ No duplicates to clean up!');
      return;
    }

    console.log('\n🗑️  Starting deletion process...');

    // Delete users in batches
    const BATCH_SIZE = 10;
    let deleted = 0;
    let errors = 0;

    for (let i = 0; i < uniqueUsersToDelete.length; i += BATCH_SIZE) {
      const batch = uniqueUsersToDelete.slice(i, i + BATCH_SIZE);
      
      try {
        const transactions = batch.map(user => 
          tx.users[user.id].delete()
        );
        
        await db.transact(transactions);
        deleted += batch.length;
        
        console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: Deleted ${batch.length} duplicate users (${deleted}/${uniqueUsersToDelete.length})`);
        
      } catch (error) {
        console.error(`❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error);
        errors += batch.length;
      }
    }

    console.log('\n🏁 Cleanup completed!');
    console.log(`✅ Successfully deleted: ${deleted} duplicate users`);
    if (errors > 0) {
      console.log(`❌ Failed to delete: ${errors} users`);
    }
    
    // Verify final count
    const finalResult = await db.query({
      users: {},
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      }
    });
    
    const finalUsers = finalResult.users || [];
    const finalStudentProfiles = finalResult.profiles || [];
    
    console.log('\n📈 Final Results:');
    console.log(`🔸 Total users: ${finalUsers.length}`);
    console.log(`🔸 Student profiles: ${finalStudentProfiles.length}`);

  } catch (error) {
    console.error('💥 Cleanup failed:', error);
    throw error;
  }
}

// Run the cleanup
removeDuplicateUsers()
  .then(() => {
    console.log('\n🎉 Duplicate cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  }); 