import { init, id } from '@instantdb/admin';
import dotenv from 'dotenv';

// Load environment variables from multiple possible locations
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

const db = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

// Available program types
const PROGRAM_TYPES = [
  'academic_year',
  'semester_fall', 
  'semester_spring',
  'summer',
  'calendar_year'
];

// Partner organizations
const PARTNER_ORGANIZATIONS = [
  'Macejkovic and Sons International',
  'Bartell, McLaughlin and Kohler Education', 
  'Waters Group Students',
  'Flatley - Runolfsson Students',
  'Zboncak - Smitham International',
  'Huels - Reynolds Education',
  'Strosin - Waters Students',
  'Green - Armstrong Students',
  'Flatley - Crona Education',
  'Larkin and Sons Students',
  'Casper LLC Students',
  'Yundt - Hoppe International',
  'Herzog - Schultz Education',
  'Keebler - Wuckert Students',
  'Conn - Hickle International'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

function generateDateBetween(startDate: string, endDate: string): string {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime).toISOString();
}

async function fixDataQuality() {
  console.log('Fixing student data quality issues...\n');
  
  try {
    // Query current data
    const result = await db.query({
      users: {
        $: {
          where: {
            role: 'student'
          }
        }
      },
      profiles: {},
      relationships: {}
    });

    console.log(`Found ${result.users.length} student users`);
    console.log(`Found ${result.profiles.length} profiles`);
    console.log(`Found ${result.relationships.length} relationships\n`);

    let studentsFixed = 0;
    let profilesCreated = 0;
    let relationshipsCreated = 0;

    const transactions = [];

    // Fix students without profiles first
    const usersWithoutProfiles = result.users.filter((user: any) => 
      !result.profiles.some((p: any) => p.userId === user.id)
    );

    console.log(`Creating profiles for ${usersWithoutProfiles.length} students without profiles...`);
    
    for (const user of usersWithoutProfiles) {
      const profileId = id();
      
      // Create basic profile data
      const profileData = {
        applicationStatus: 'pending_review',
        country_of_origin: user.metadata?.country_of_origin || 'Unknown Country',
        gender: user.metadata?.gender || 'Not Specified',
        school_grade: '12th Grade',
        english_proficiency: 'Advanced',
        date_of_birth: '2006-01-01',
        student_bio: `Exchange student from ${user.metadata?.country_of_origin || 'abroad'}`,
        academic_interests: ['International Studies', 'Cultural Exchange'],
        hobbies: ['Reading', 'Sports', 'Music'],
        diet_restrictions: 'None',
        health: { conditions: 'None', medications: 'None' },
        emergency_contact: {
          name: 'Emergency Contact',
          phone: '+1-555-0000',
          relationship: 'Parent'
        }
      };

      if (db.tx?.profiles) {
        transactions.push(
          db.tx.profiles[profileId]!.update({
            id: profileId,
            userId: user.id,
            type: 'student',
            data: profileData,
            createdAt: new Date(),
            updatedAt: new Date()
          })
        );
        profilesCreated++;
      }

      // Also add this profile to our local results for relationship creation
      result.profiles.push({
        id: profileId,
        userId: user.id,
        type: 'student', 
        data: profileData
      } as any);
    }

    // Fix students without sending org relationships  
    const studentsWithoutOrgRelationships = result.users.filter((user: any) => {
      const profile = result.profiles.find((p: any) => p.userId === user.id);
      if (!profile) return false; // Will be handled above
      
      return !result.relationships.some((r: any) => 
        r.type === 'sending_org_student' && r.secondaryId === profile.id
      );
    });

    console.log(`Creating sending org relationships for ${studentsWithoutOrgRelationships.length} students...`);

    for (const user of studentsWithoutOrgRelationships) {
      const profile = result.profiles.find((p: any) => p.userId === user.id);
      if (!profile) continue;

      const relationshipId = id();
      const orgProfileId = id(); // Create a sending org profile

      // Create sending organization profile
      const orgData = {
        name: getRandomElement(PARTNER_ORGANIZATIONS),
        type: 'sending_organization',
        country: user.metadata?.country_of_origin || 'Unknown Country',
        contact_email: 'info@organization.com',
        established: 2000
      };

      if (db.tx?.profiles) {
        transactions.push(
          db.tx.profiles[orgProfileId]!.update({
            id: orgProfileId,
            type: 'sending_organization',
            data: orgData,
            createdAt: new Date(),
            updatedAt: new Date()
          })
        );
      }

      // Create relationship data
      const programType = getRandomElement(PROGRAM_TYPES);
      const partner = getRandomElement(PARTNER_ORGANIZATIONS);
      
      const relationshipData = {
        program_type: programType,
        partner_organization: partner,
        application_date: generateDateBetween('2024-01-01', '2024-06-01'),
        approval_date: null,
        visa_status: 'not_started'
      };

      const startDate = '2024-08-15';
      const endDate = programType === 'academic_year' ? '2025-06-15' : 
                     programType === 'summer' ? '2024-08-30' : 
                     programType === 'calendar_year' ? '2024-12-15' : '2025-01-15';

      // Create sending org relationship
      if (db.tx?.relationships) {
        transactions.push(
          db.tx.relationships[relationshipId]!.update({
            id: relationshipId,
            type: 'sending_org_student',
            primaryId: orgProfileId,
            secondaryId: profile.id,
            status: 'active',
            data: relationshipData,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            createdAt: new Date(),
            updatedAt: new Date()
          })
        );
        relationshipsCreated++;
      }

      studentsFixed++;
    }

    // Execute all transactions in batches
    if (transactions.length > 0) {
      console.log(`\nExecuting ${transactions.length} database updates...`);
      
      const batchSize = 25;
      let processed = 0;

      for (let i = 0; i < transactions.length; i += batchSize) {
        const batch = transactions.slice(i, i + batchSize);
        await db.transact(batch);
        processed += batch.length;
        console.log(`Processed ${processed}/${transactions.length} updates...`);
      }

      console.log('\n✅ Data quality fixes applied successfully!');
    } else {
      console.log('\n✅ No data quality issues found - all data is already clean!');
    }

    // Summary
    console.log(`\nSummary:`);
    console.log(`- Profiles created: ${profilesCreated}`);
    console.log(`- Relationships created: ${relationshipsCreated}`);  
    console.log(`- Students fixed: ${studentsFixed}`);

    // Verify the fixes
    console.log('\nVerifying fixes...');
    const verifyResult = await db.query({
      users: {
        $: {
          where: {
            role: 'student'
          }
        }
      },
      profiles: {},
      relationships: {}
    });

    let usersWithoutProfilesCount = 0;
    let usersWithoutOrgRelsCount = 0;

    for (const user of verifyResult.users) {
      const profile = verifyResult.profiles.find((p: any) => p.userId === user.id);
      
      if (!profile) {
        usersWithoutProfilesCount++;
        continue;
      }

      const hasOrgRel = verifyResult.relationships.some((r: any) => 
        r.type === 'sending_org_student' && r.secondaryId === profile.id
      );

      if (!hasOrgRel) {
        usersWithoutOrgRelsCount++;
      }
    }

    console.log(`\nVerification Results:`);
    console.log(`- Students without profiles: ${usersWithoutProfilesCount}`);
    console.log(`- Students without org relationships: ${usersWithoutOrgRelsCount}`);
    console.log(`- Total students: ${verifyResult.users.length}`);

    if (usersWithoutProfilesCount === 0 && usersWithoutOrgRelsCount === 0) {
      console.log('\n🎉 All data quality issues have been resolved!');
    }

  } catch (error) {
    console.error('Error fixing data quality:', error);
  }
}

fixDataQuality(); 