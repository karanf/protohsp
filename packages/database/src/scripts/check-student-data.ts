import dotenv from 'dotenv';

// Load .env files
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

import { init } from '@instantdb/admin';

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

async function checkStudentData() {
  try {
    console.log('🔍 Checking current database state...\n');

    const result = await db.query({
      users: { profiles: {} },
      profiles: {}
    });
    
    console.log(`Total users in database: ${result.users?.length || 0}`);
    console.log(`Total direct profiles in database: ${result.profiles?.length || 0}`);
    console.log(`Total linked profiles in database: ${result.users?.reduce((total, user) => total + (user.profiles?.length || 0), 0) || 0}`);
    
    if (result.profiles && result.profiles.length > 0) {
      const profileTypes = result.profiles.reduce((types, profile: any) => {
        types[profile.type] = (types[profile.type] || 0) + 1;
        return types;
      }, {} as Record<string, number>);
      
      console.log('Direct profile types:', profileTypes);
    }
    
    if (result.users && result.users.length > 0) {
      const linkedProfileTypes = result.users.reduce((types, user) => {
        user.profiles?.forEach(profile => {
          types[profile.type] = (types[profile.type] || 0) + 1;
        });
        return types;
      }, {} as Record<string, number>);
      
      console.log('Linked profile types:', linkedProfileTypes);
    }
    
    const linkedStudents = result.users?.filter(user => 
      user.profiles?.some(profile => profile.type === 'student')
    ).slice(0, 3) || [];
    
    const directStudents = result.profiles?.filter(profile => profile.type === 'student').slice(0, 3) || [];
    
    console.log(`Found ${result.users?.filter(user => user.profiles?.some(profile => profile.type === 'student')).length || 0} linked students`);
    console.log(`Found ${result.profiles?.filter(profile => profile.type === 'student').length || 0} direct students\n`);
    
    const students = linkedStudents.length > 0 ? linkedStudents : directStudents;
    
    console.log('Sample student data:');
    if (directStudents.length > 0) {
      console.log('Direct students:');
      directStudents.forEach((profile, index) => {
        console.log(`\nDirect Student ${index + 1}:`);
        console.log('Profile fields:', {
          id: profile.id,
          userId: profile.userId,
          type: profile.type
        });
        
        if (profile.data) {
          console.log('- Profile data keys:', Object.keys(profile.data));
          console.log('- Basic profile fields:', {
            first_name: profile.data.first_name,
            last_name: profile.data.last_name,
            country_of_origin: profile.data.country_of_origin,
            applicationStatus: profile.data.applicationStatus,
            sevisStatus: profile.data.sevisStatus
          });
        }
      });
    }
    
    if (linkedStudents.length > 0) {
      console.log('Linked students:');
      linkedStudents.forEach((student, index) => {
        const profile = student.profiles.find((p: any) => p.type === 'student');
        console.log(`\nLinked Student ${index + 1}:`);
        console.log('User fields:', {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName
        });
        
        if (profile?.data) {
          console.log('- Profile data keys:', Object.keys(profile.data));
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
  }
}

checkStudentData(); 