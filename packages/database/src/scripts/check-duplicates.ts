import dotenv from 'dotenv';

// Load .env files
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

import { init, tx, id } from '@instantdb/admin';

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

async function checkForDuplicates() {
  try {
    console.log('🔍 Checking for duplicate student records...\n');

    // Get all users and student profiles
    const result = await db.query({
      users: {},
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      }
    });

    const users = result.users || [];
    const studentProfiles = result.profiles || [];

    console.log(`Total users: ${users.length}`);
    console.log(`Total student profiles: ${studentProfiles.length}\n`);

    // Check for duplicate users (by email pattern or name)
    console.log('📧 Checking for duplicate users...');
    
    const usersByEmail = new Map();
    const usersByName = new Map();
    const duplicateUsers = [];
    
    for (const user of users) {
      // Group by email pattern
      if (user.email) {
        const baseEmail = user.email.replace(/\d+/g, ''); // Remove numbers to find pattern duplicates
        if (!usersByEmail.has(baseEmail)) {
          usersByEmail.set(baseEmail, []);
        }
        usersByEmail.get(baseEmail).push(user);
      }
      
      // Group by name combination
      if (user.firstName && user.lastName) {
        const fullName = `${user.firstName} ${user.lastName}`;
        if (!usersByName.has(fullName)) {
          usersByName.set(fullName, []);
        }
        usersByName.get(fullName).push(user);
      }
    }
    
    // Find actual duplicates
    for (const [email, usersWithEmail] of usersByEmail) {
      if (usersWithEmail.length > 1) {
        console.log(`🔸 Found ${usersWithEmail.length} users with email pattern "${email}"`);
        duplicateUsers.push(...usersWithEmail.slice(1)); // Keep first, mark rest as duplicates
      }
    }
    
    for (const [name, usersWithName] of usersByName) {
      if (usersWithName.length > 1) {
        const emailPatterns = new Set(usersWithName.map(u => u.email?.replace(/\d+/g, '')));
        if (emailPatterns.size === 1) { // Same name AND same email pattern = likely duplicate
          console.log(`🔸 Found ${usersWithName.length} users with name "${name}" and same email pattern`);
          duplicateUsers.push(...usersWithName.slice(1));
        }
      }
    }

    // Check for duplicate profiles (by user linkage or data similarity)
    console.log('\n📋 Checking for duplicate student profiles...');
    
    const profilesByUser = new Map();
    const profilesByData = new Map();
    const duplicateProfiles = [];
    
    for (const profile of studentProfiles) {
      // Group by userId
      if (profile.userId) {
        if (!profilesByUser.has(profile.userId)) {
          profilesByUser.set(profile.userId, []);
        }
        profilesByUser.get(profile.userId).push(profile);
      }
      
      // Group by data similarity (first_name + last_name + country)
      if (profile.data?.first_name && profile.data?.last_name && profile.data?.country_of_origin) {
        const dataKey = `${profile.data.first_name}-${profile.data.last_name}-${profile.data.country_of_origin}`;
        if (!profilesByData.has(dataKey)) {
          profilesByData.set(dataKey, []);
        }
        profilesByData.get(dataKey).push(profile);
      }
    }
    
    // Find duplicate profiles
    for (const [userId, profiles] of profilesByUser) {
      if (profiles.length > 1) {
        console.log(`🔸 Found ${profiles.length} student profiles for user ${userId}`);
        duplicateProfiles.push(...profiles.slice(1)); // Keep first, mark rest as duplicates
      }
    }
    
    for (const [dataKey, profiles] of profilesByData) {
      if (profiles.length > 1) {
        console.log(`🔸 Found ${profiles.length} student profiles with same data: ${dataKey}`);
        // Only mark as duplicates if they also have the same userId or no userId
        const uniqueUserIds = new Set(profiles.map(p => p.userId).filter(Boolean));
        if (uniqueUserIds.size <= 1) {
          duplicateProfiles.push(...profiles.slice(1));
        }
      }
    }

    // Remove duplicates from arrays (since we might have added the same record multiple times)
    const uniqueDuplicateUsers = Array.from(new Set(duplicateUsers.map(u => u.id))).map(id => 
      duplicateUsers.find(u => u.id === id)
    );
    const uniqueDuplicateProfiles = Array.from(new Set(duplicateProfiles.map(p => p.id))).map(id =>
      duplicateProfiles.find(p => p.id === id)
    );

    console.log('\n📊 Duplicate Analysis Summary:');
    console.log(`🔸 Duplicate users found: ${uniqueDuplicateUsers.length}`);
    console.log(`🔸 Duplicate profiles found: ${uniqueDuplicateProfiles.length}`);
    console.log(`🔸 Total records that could be cleaned: ${uniqueDuplicateUsers.length + uniqueDuplicateProfiles.length}`);
    
    if (uniqueDuplicateUsers.length > 0) {
      console.log('\n🔸 Sample duplicate users:');
      uniqueDuplicateUsers.slice(0, 5).forEach((user: any) => {
        console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) - ID: ${user.id}`);
      });
    }
    
    if (uniqueDuplicateProfiles.length > 0) {
      console.log('\n🔸 Sample duplicate profiles:');
      uniqueDuplicateProfiles.slice(0, 5).forEach((profile: any) => {
        console.log(`  - ${profile.data?.first_name} ${profile.data?.last_name} (${profile.data?.country_of_origin}) - ID: ${profile.id}`);
      });
    }

    // Estimate after cleanup
    const estimatedUsers = users.length - uniqueDuplicateUsers.length;
    const estimatedProfiles = studentProfiles.length - uniqueDuplicateProfiles.length;
    
    console.log('\n📈 After cleanup estimates:');
    console.log(`🔸 Users would be: ${estimatedUsers} (currently ${users.length})`);
    console.log(`🔸 Student profiles would be: ${estimatedProfiles} (currently ${studentProfiles.length})`);
    
    return {
      duplicateUsers: uniqueDuplicateUsers,
      duplicateProfiles: uniqueDuplicateProfiles
    };

  } catch (error) {
    console.error('💥 Script failed:', error);
    throw error;
  }
}

// Run the check
checkForDuplicates()
  .then((result) => {
    console.log('\n🏁 Duplicate check completed successfully');
    if (result.duplicateUsers.length > 0 || result.duplicateProfiles.length > 0) {
      console.log('\n⚠️  To clean up duplicates, run: pnpm dlx tsx remove-duplicates.ts');
    } else {
      console.log('\n✅ No duplicates found!');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });

export { checkForDuplicates }; 