import { init, id } from '@instantdb/admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

const adminDb = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

// US States grouped by regions
const US_REGIONS = {
  'Northeast': [
    'CT', 'ME', 'MA', 'NH', 'NJ', 'NY', 'PA', 'RI', 'VT',
    'Connecticut', 'Maine', 'Massachusetts', 'New Hampshire', 'New Jersey', 
    'New York', 'Pennsylvania', 'Rhode Island', 'Vermont'
  ],
  'Southeast': [
    'AL', 'AR', 'DE', 'FL', 'GA', 'KY', 'LA', 'MD', 'MS', 'NC', 'SC', 'TN', 'VA', 'WV',
    'Alabama', 'Arkansas', 'Delaware', 'Florida', 'Georgia', 'Kentucky', 'Louisiana',
    'Maryland', 'Mississippi', 'North Carolina', 'South Carolina', 'Tennessee', 'Virginia', 'West Virginia'
  ],
  'Midwest': [
    'IL', 'IN', 'IA', 'KS', 'MI', 'MN', 'MO', 'NE', 'ND', 'OH', 'SD', 'WI',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Michigan', 'Minnesota', 'Missouri',
    'Nebraska', 'North Dakota', 'Ohio', 'South Dakota', 'Wisconsin'
  ],
  'Southwest': [
    'AZ', 'NM', 'OK', 'TX',
    'Arizona', 'New Mexico', 'Oklahoma', 'Texas'
  ],
  'West': [
    'AK', 'CA', 'CO', 'HI', 'ID', 'MT', 'NV', 'OR', 'UT', 'WA', 'WY',
    'Alaska', 'California', 'Colorado', 'Hawaii', 'Idaho', 'Montana',
    'Nevada', 'Oregon', 'Utah', 'Washington', 'Wyoming'
  ]
};

// City to state mapping for common cities
const CITY_TO_STATE: { [key: string]: string } = {
  'New York': 'NY', 'Los Angeles': 'CA', 'Chicago': 'IL', 'Houston': 'TX',
  'Philadelphia': 'PA', 'Phoenix': 'AZ', 'San Antonio': 'TX', 'San Diego': 'CA',
  'Dallas': 'TX', 'San Jose': 'CA', 'Austin': 'TX', 'Jacksonville': 'FL',
  'Fort Worth': 'TX', 'Columbus': 'OH', 'San Francisco': 'CA', 'Charlotte': 'NC',
  'Indianapolis': 'IN', 'Seattle': 'WA', 'Denver': 'CO', 'Boston': 'MA',
  'El Paso': 'TX', 'Detroit': 'MI', 'Nashville': 'TN', 'Portland': 'OR',
  'Memphis': 'TN', 'Oklahoma City': 'OK', 'Las Vegas': 'NV', 'Louisville': 'KY',
  'Baltimore': 'MD', 'Milwaukee': 'WI', 'Albuquerque': 'NM', 'Tucson': 'AZ',
  'Fresno': 'CA', 'Sacramento': 'CA', 'Kansas City': 'MO', 'Mesa': 'AZ',
  'Atlanta': 'GA', 'Omaha': 'NE', 'Colorado Springs': 'CO', 'Raleigh': 'NC',
  'Miami': 'FL', 'Oakland': 'CA', 'Minneapolis': 'MN', 'Tulsa': 'OK',
  'Cleveland': 'OH', 'Wichita': 'KS', 'Arlington': 'TX', 'New Orleans': 'LA',
  'Bakersfield': 'CA', 'Tampa': 'FL', 'Honolulu': 'HI', 'Aurora': 'CO',
  'Anaheim': 'CA', 'Santa Ana': 'CA', 'St. Louis': 'MO', 'Riverside': 'CA',
  'Corpus Christi': 'TX', 'Lexington': 'KY', 'Pittsburgh': 'PA', 'Anchorage': 'AK',
  'Stockton': 'CA', 'Cincinnati': 'OH', 'St. Paul': 'MN', 'Toledo': 'OH',
  'Greensboro': 'NC', 'Newark': 'NJ', 'Plano': 'TX', 'Henderson': 'NV',
  'Lincoln': 'NE', 'Buffalo': 'NY', 'Jersey City': 'NJ', 'Chula Vista': 'CA',
  'Fort Wayne': 'IN', 'Orlando': 'FL', 'St. Petersburg': 'FL', 'Chandler': 'AZ',
  'Laredo': 'TX', 'Norfolk': 'VA', 'Durham': 'NC', 'Madison': 'WI',
  'Lubbock': 'TX', 'Irvine': 'CA', 'Winston-Salem': 'NC', 'Glendale': 'AZ',
  'Garland': 'TX', 'Hialeah': 'FL', 'Reno': 'NV', 'Chesapeake': 'VA',
  'Gilbert': 'AZ', 'Baton Rouge': 'LA', 'Irving': 'TX', 'Scottsdale': 'AZ',
  'North Las Vegas': 'NV', 'Fremont': 'CA', 'Boise': 'ID', 'Richmond': 'VA',
  'San Bernardino': 'CA', 'Birmingham': 'AL', 'Spokane': 'WA', 'Rochester': 'NY',
  'Des Moines': 'IA', 'Modesto': 'CA', 'Fayetteville': 'NC', 'Tacoma': 'WA',
  'Oxnard': 'CA', 'Fontana': 'CA', 'Columbus GA': 'GA', 'Montgomery': 'AL'
};

function inferRegionFromAddress(coordinator: any): string | null {
  const profile = coordinator.profile;
  const user = coordinator.user;
  
  // Check various address fields
  const addressSources = [
    profile?.data?.address,
    profile?.data?.city,
    profile?.data?.state,
    user?.metadata?.address,
    user?.metadata?.city,
    user?.metadata?.state,
    user?.address,
    user?.city,
    user?.state
  ];

  for (const source of addressSources) {
    if (!source) continue;
    
    const addressText = typeof source === 'string' ? source : JSON.stringify(source);
    
    // Try to find state in the address
    for (const [region, states] of Object.entries(US_REGIONS)) {
      for (const state of states) {
        if (addressText.toUpperCase().includes(state.toUpperCase())) {
          return region;
        }
      }
    }
    
    // Try to match cities
    for (const [city, state] of Object.entries(CITY_TO_STATE)) {
      if (addressText.toLowerCase().includes(city.toLowerCase())) {
        // Find which region this state belongs to
        for (const [region, states] of Object.entries(US_REGIONS)) {
          if (states.includes(state)) {
            return region;
          }
        }
      }
    }
  }
  
  return null;
}

interface CoordinatorData {
  user: any;
  profile: any;
}

async function main() {
  console.log('🗺️  Assigning Local Coordinators to Regions Based on Address...\n');
  
  try {
    // Fetch all data
    console.log('Fetching data from InstantDB...');
    const { users, profiles } = await adminDb.query({
      users: {},
      profiles: {}
    });

    console.log(`Found ${users?.length || 0} users, ${profiles?.length || 0} profiles\n`);

         // Find coordinators
     const coordinators: CoordinatorData[] = [];
     const coordinatorsNeedingProfiles: any[] = [];
     
     if (users && profiles) {
       for (const user of users) {
         if (user.role === 'coordinator') {
           const profile = profiles.find(p => p.userId === user.id);
           if (profile) {
             coordinators.push({ user, profile });
           } else {
             coordinatorsNeedingProfiles.push(user);
           }
         }
       }
     }

     console.log(`📍 Found ${coordinators.length} coordinators with profiles`);
     console.log(`🏗️  Found ${coordinatorsNeedingProfiles.length} coordinators needing profiles\n`);

     // Create profiles for coordinators that don't have them
     if (coordinatorsNeedingProfiles.length > 0) {
       console.log('🏗️  Creating profiles for coordinators...\n');
       
       const profileCreationTransactions = [];
       const newProfiles: any[] = [];
       
       for (const user of coordinatorsNeedingProfiles) {
         const profileId = id();
         const newProfile = {
           id: profileId,
           userId: user.id,
           type: 'coordinator',
           data: {
             createdBy: 'automated_region_assignment'
           },
           createdAt: new Date().toISOString(),
           updatedAt: new Date().toISOString()
         };
         
         newProfiles.push(newProfile);
         profileCreationTransactions.push(
           adminDb.tx.profiles![profileId]!.update(newProfile)
         );
       }

       // Execute profile creation in batches
       const batchSize = 25;
       for (let i = 0; i < profileCreationTransactions.length; i += batchSize) {
         const batch = profileCreationTransactions.slice(i, i + batchSize);
         await adminDb.transact(batch);
         console.log(`✅ Created ${Math.min(i + batchSize, profileCreationTransactions.length)}/${profileCreationTransactions.length} profiles`);
       }

       // Add newly created profiles to coordinators list
       for (let i = 0; i < coordinatorsNeedingProfiles.length; i++) {
         coordinators.push({
           user: coordinatorsNeedingProfiles[i],
           profile: newProfiles[i]
         });
       }
       
       console.log(`✅ Created ${newProfiles.length} new profiles\n`);
     }

    console.log(`📍 Found ${coordinators.length} coordinator users\n`);

    // Find coordinators without regions
    const unassignedCoordinators = coordinators.filter(coord => {
      const userRegion = coord.user.metadata?.region;
      const profileRegion = coord.profile.data?.region;
      return !userRegion && !profileRegion;
    });

    console.log(`🚨 Found ${unassignedCoordinators.length} coordinators without regions\n`);

    if (unassignedCoordinators.length === 0) {
      console.log('✅ All coordinators already have regions assigned!');
      return;
    }

    // Analyze address data and assign regions
    const assignmentsToMake: { coordinator: CoordinatorData; region: string; reason: string }[] = [];
    
    console.log('🔍 Analyzing address data for region assignment...\n');
    
    for (const coordinator of unassignedCoordinators) {
      const name = `${coordinator.user.firstName} ${coordinator.user.lastName}`;
      const email = coordinator.user.email;
      
      console.log(`Analyzing ${name} (${email}):`);
      
      // Log available address data
      const addressData = {
        'Profile Address': coordinator.profile?.data?.address,
        'Profile City': coordinator.profile?.data?.city,
        'Profile State': coordinator.profile?.data?.state,
        'User Address': coordinator.user?.address,
        'User City': coordinator.user?.city,
        'User State': coordinator.user?.state,
        'Metadata Address': coordinator.user?.metadata?.address,
        'Metadata City': coordinator.user?.metadata?.city,
        'Metadata State': coordinator.user?.metadata?.state
      };
      
      let hasAddressData = false;
      for (const [key, value] of Object.entries(addressData)) {
        if (value) {
          console.log(`  ${key}: ${value}`);
          hasAddressData = true;
        }
      }
      
      if (!hasAddressData) {
        console.log('  ❌ No address data found');
        continue;
      }
      
      // Try to infer region
      const inferredRegion = inferRegionFromAddress(coordinator);
      
      if (inferredRegion) {
        console.log(`  ✅ Inferred region: ${inferredRegion}`);
        assignmentsToMake.push({
          coordinator,
          region: inferredRegion,
          reason: 'address_analysis'
        });
      } else {
        console.log('  ❓ Could not determine region from address data');
      }
      
      console.log('');
    }

    console.log(`\n📋 ASSIGNMENT SUMMARY\n${'='.repeat(50)}`);
    console.log(`Coordinators to assign regions: ${assignmentsToMake.length}`);
    console.log(`Coordinators without sufficient address data: ${unassignedCoordinators.length - assignmentsToMake.length}\n`);

    if (assignmentsToMake.length === 0) {
      console.log('❌ No coordinators can be assigned regions based on available address data.');
      return;
    }

    // Group by region for summary
    const regionCounts: { [region: string]: number } = {};
    for (const assignment of assignmentsToMake) {
      regionCounts[assignment.region] = (regionCounts[assignment.region] || 0) + 1;
    }

    console.log('📊 Region distribution:');
    for (const [region, count] of Object.entries(regionCounts)) {
      console.log(`   ${region}: ${count} coordinators`);
    }

    console.log('\n🔄 Applying region assignments...\n');

    // Apply the assignments
    let successCount = 0;
    let errorCount = 0;

    for (const assignment of assignmentsToMake) {
      const { coordinator, region, reason } = assignment;
      const name = `${coordinator.user.firstName} ${coordinator.user.lastName}`;
      
      try {
        // Update the profile with region assignment
        const updatedData = {
          ...coordinator.profile.data,
          region: region,
          regionAssignedAt: new Date().toISOString(),
          regionAssignedBy: 'automated_address_analysis',
          regionAssignmentReason: reason
        };

        await adminDb.transact([
          adminDb.tx.profiles![coordinator.profile.id]!.update({
            data: updatedData,
            updatedAt: new Date().toISOString()
          })
        ]);

        console.log(`✅ Assigned ${name} to ${region}`);
        successCount++;

      } catch (error) {
        console.error(`❌ Failed to assign ${name} to ${region}:`, error);
        errorCount++;
      }
    }

    console.log(`\n📈 FINAL RESULTS\n${'='.repeat(50)}`);
    console.log(`✅ Successfully assigned: ${successCount} coordinators`);
    console.log(`❌ Failed assignments: ${errorCount} coordinators`);
    console.log(`📊 Total coordinators processed: ${assignmentsToMake.length}`);
    
    if (successCount > 0) {
      console.log('\n🎉 Region assignments completed successfully!');
      console.log('💡 Tip: Run the analysis script again to verify the assignments.');
    }

  } catch (error) {
    console.error('❌ Error in script:', error);
  }
}

main(); 