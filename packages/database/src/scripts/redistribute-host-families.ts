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

// US States grouped by regions (same as before)
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
  'Portland': 'OR', 'Atlanta': 'GA', 'Miami': 'FL', 'Minneapolis': 'MN',
  'Tampa': 'FL', 'Nashville': 'TN', 'Kansas City': 'MO', 'Salt Lake City': 'UT',
  'Richmond': 'VA', 'Milwaukee': 'WI', 'Oklahoma City': 'OK', 'Louisville': 'KY'
};

function inferHostFamilyRegion(hostProfile: any): string {
  if (!hostProfile?.data) return 'Unknown';
  
  const city = hostProfile.data.city;
  const state = hostProfile.data.state;
  const address = hostProfile.data.address;
  
  // Check direct state match
  if (state) {
    for (const [region, states] of Object.entries(US_REGIONS)) {
      for (const s of states) {
        if (state.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(state.toLowerCase())) {
          return region;
        }
      }
    }
  }
  
  // Check city to state mapping
  if (city && CITY_TO_STATE[city]) {
    const stateCode = CITY_TO_STATE[city];
    for (const [region, states] of Object.entries(US_REGIONS)) {
      if (states.includes(stateCode)) {
        return region;
      }
    }
  }
  
  // Check address for state mentions
  if (address) {
    for (const [region, states] of Object.entries(US_REGIONS)) {
      for (const s of states) {
        if (address.toLowerCase().includes(s.toLowerCase())) {
          return region;
        }
      }
    }
  }
  
  return 'Unknown';
}

interface CoordinatorInfo {
  id: string;
  name: string;
  region: string;
  profileId: string;
  currentHostCount: number;
}

interface HostFamilyInfo {
  id: string;
  name: string;
  profileId: string;
  region: string;
  location: string;
  currentCoordinatorId?: string;
}

async function main() {
  console.log('🔄 Redistributing Host Family Assignments Across All Coordinators...\n');
  
  try {
    // Fetch all data
    console.log('Fetching data from InstantDB...');
    const { users, profiles, relationships } = await adminDb.query({
      users: {},
      profiles: {},
      relationships: {}
    });

    console.log(`Found ${users?.length || 0} users, ${profiles?.length || 0} profiles, ${relationships?.length || 0} relationships\n`);

    // Create lookup maps
    const profilesByUserId = new Map();
    const usersByProfileId = new Map();
    
    if (profiles) {
      profiles.forEach(p => {
        profilesByUserId.set(p.userId, p);
        usersByProfileId.set(p.id, users?.find(u => u.id === p.userId));
      });
    }

    // Get all coordinators with their regions
    const coordinators: CoordinatorInfo[] = [];
    
    if (users && profiles) {
      for (const user of users) {
        if (user.role === 'coordinator' || user.role === 'local_coordinator') {
          const profile = profilesByUserId.get(user.id);
          if (profile) {
            const userRegion = user.metadata?.region;
            const profileRegion = profile.data?.region;
            const region = userRegion || profileRegion || 'Unknown';
            
            // Count current host families
            const currentHostCount = relationships?.filter(r => 
              r.type === 'coordinator_host' && r.primaryId === profile.id
            ).length || 0;
            
            coordinators.push({
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
              region,
              profileId: profile.id,
              currentHostCount
            });
          }
        }
      }
    }

    // Get all host families with their regions
    const hostFamilies: HostFamilyInfo[] = [];
    
    if (users && profiles) {
      for (const user of users) {
        if (user.role === 'host_family') {
          const profile = profilesByUserId.get(user.id);
          if (profile) {
            const region = inferHostFamilyRegion(profile);
            const location = profile.data?.city || profile.data?.state || 'Unknown';
            
            // Find current coordinator
            const currentRelationship = relationships?.find(r => 
              r.type === 'coordinator_host' && r.secondaryId === profile.id
            );
            const currentCoordinatorProfile = currentRelationship ? 
              profiles.find(p => p.id === currentRelationship.primaryId) : null;
            const currentCoordinator = currentCoordinatorProfile ? 
              users?.find(u => u.id === currentCoordinatorProfile.userId) : null;
            
            hostFamilies.push({
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
              profileId: profile.id,
              region,
              location,
              currentCoordinatorId: currentCoordinator?.id
            });
          }
        }
      }
    }

    console.log(`📍 Found ${coordinators.length} coordinators`);
    console.log(`🏠 Found ${hostFamilies.length} host families\n`);

    // Group coordinators and host families by region
    const coordinatorsByRegion = new Map<string, CoordinatorInfo[]>();
    const hostFamiliesByRegion = new Map<string, HostFamilyInfo[]>();

    coordinators.forEach(coord => {
      if (!coordinatorsByRegion.has(coord.region)) {
        coordinatorsByRegion.set(coord.region, []);
      }
      coordinatorsByRegion.get(coord.region)!.push(coord);
    });

    hostFamilies.forEach(host => {
      if (!hostFamiliesByRegion.has(host.region)) {
        hostFamiliesByRegion.set(host.region, []);
      }
      hostFamiliesByRegion.get(host.region)!.push(host);
    });

    console.log('📊 Current Distribution by Region:');
    for (const [region, coords] of coordinatorsByRegion.entries()) {
      const hosts = hostFamiliesByRegion.get(region) || [];
      const totalCurrentHosts = coords.reduce((sum, c) => sum + c.currentHostCount, 0);
      console.log(`   ${region}: ${coords.length} coordinators, ${hosts.length} host families (${totalCurrentHosts} currently assigned)`);
    }
    console.log('');

    // Plan redistribution
    const redistributionPlan: {
      hostFamilyId: string;
      hostFamilyName: string;
      fromCoordinatorId?: string;
      fromCoordinatorName?: string;
      toCoordinatorId: string;
      toCoordinatorName: string;
      region: string;
    }[] = [];

    const relationshipsToDelete: string[] = [];
    const relationshipsToCreate: any[] = [];

    // Process each region
    for (const [region, regionCoordinators] of coordinatorsByRegion.entries()) {
      const regionHostFamilies = hostFamiliesByRegion.get(region) || [];
      
      if (regionCoordinators.length === 0 || regionHostFamilies.length === 0) {
        console.log(`⚠️  Skipping ${region}: ${regionCoordinators.length} coordinators, ${regionHostFamilies.length} host families`);
        continue;
      }

      console.log(`🔄 Processing ${region}: ${regionCoordinators.length} coordinators, ${regionHostFamilies.length} host families`);

      // Calculate ideal distribution
      const hostsPerCoordinator = Math.floor(regionHostFamilies.length / regionCoordinators.length);
      const extraHosts = regionHostFamilies.length % regionCoordinators.length;

      console.log(`   Target: ${hostsPerCoordinator} hosts per coordinator (+${extraHosts} coordinators get 1 extra)`);

      // Sort coordinators by current load (least loaded first)
      const sortedCoordinators = [...regionCoordinators].sort((a, b) => a.currentHostCount - b.currentHostCount);

      // Redistribute host families
      let hostIndex = 0;
      for (let coordIndex = 0; coordIndex < sortedCoordinators.length; coordIndex++) {
        const coordinator = sortedCoordinators[coordIndex];
        const targetHostCount = hostsPerCoordinator + (coordIndex < extraHosts ? 1 : 0);

        console.log(`   ${coordinator.name}: current ${coordinator.currentHostCount} → target ${targetHostCount}`);

        // Remove existing relationships for this coordinator
        const existingRelationships = relationships?.filter(r => 
          r.type === 'coordinator_host' && r.primaryId === coordinator.profileId
        ) || [];

        for (const rel of existingRelationships) {
          relationshipsToDelete.push(rel.id);
        }

        // Assign new host families
        for (let i = 0; i < targetHostCount && hostIndex < regionHostFamilies.length; i++) {
          const hostFamily = regionHostFamilies[hostIndex];
          
          // Remove existing relationship for this host family
          const existingHostRelationship = relationships?.find(r =>
            r.type === 'coordinator_host' && r.secondaryId === hostFamily.profileId
          );
          if (existingHostRelationship && !relationshipsToDelete.includes(existingHostRelationship.id)) {
            relationshipsToDelete.push(existingHostRelationship.id);
          }

          // Create new relationship
          const relationshipId = id();
          relationshipsToCreate.push({
            id: relationshipId,
            type: 'coordinator_host',
            primaryId: coordinator.profileId,
            secondaryId: hostFamily.profileId,
            status: 'active',
            startDate: new Date().toISOString(),
            data: {
              notes: `Redistributed for better load balancing (${region})`,
              assignmentDate: new Date().toISOString(),
              assignmentReason: 'load_balancing_redistribution'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });

          redistributionPlan.push({
            hostFamilyId: hostFamily.id,
            hostFamilyName: hostFamily.name,
            fromCoordinatorId: hostFamily.currentCoordinatorId,
            fromCoordinatorName: hostFamily.currentCoordinatorId ? 
              coordinators.find(c => c.id === hostFamily.currentCoordinatorId)?.name : undefined,
            toCoordinatorId: coordinator.id,
            toCoordinatorName: coordinator.name,
            region
          });

          hostIndex++;
        }
      }
    }

    console.log(`\n📋 REDISTRIBUTION PLAN\n${'='.repeat(60)}`);
    console.log(`Relationships to delete: ${relationshipsToDelete.length}`);
    console.log(`Relationships to create: ${relationshipsToCreate.length}`);
    console.log(`Host families being redistributed: ${redistributionPlan.length}\n`);

    // Group by region for summary
    const planByRegion = new Map<string, typeof redistributionPlan>();
    redistributionPlan.forEach(item => {
      if (!planByRegion.has(item.region)) {
        planByRegion.set(item.region, []);
      }
      planByRegion.get(item.region)!.push(item);
    });

    for (const [region, items] of planByRegion.entries()) {
      console.log(`📍 ${region} (${items.length} redistributions):`);
      const coordinatorCounts = new Map<string, number>();
      items.forEach(item => {
        coordinatorCounts.set(item.toCoordinatorName, (coordinatorCounts.get(item.toCoordinatorName) || 0) + 1);
      });
      
      for (const [coordName, count] of coordinatorCounts.entries()) {
        console.log(`   ${coordName}: ${count} host families`);
      }
      console.log('');
    }

    if (relationshipsToDelete.length === 0 && relationshipsToCreate.length === 0) {
      console.log('✅ No redistribution needed - assignments are already well balanced!');
      return;
    }

    console.log('🔄 Executing redistribution...\n');

    // Delete existing relationships in batches
    if (relationshipsToDelete.length > 0) {
      console.log(`🗑️  Removing ${relationshipsToDelete.length} existing relationships...`);
      const deleteBatchSize = 25;
      
      for (let i = 0; i < relationshipsToDelete.length; i += deleteBatchSize) {
        const batch = relationshipsToDelete.slice(i, i + deleteBatchSize);
        const deleteTransactions = batch.map(relId => 
          adminDb.tx.relationships![relId]!.delete()
        );
        
        await adminDb.transact(deleteTransactions);
        console.log(`   Deleted ${Math.min(i + deleteBatchSize, relationshipsToDelete.length)}/${relationshipsToDelete.length} relationships`);
      }
    }

    // Create new relationships in batches  
    if (relationshipsToCreate.length > 0) {
      console.log(`🔗 Creating ${relationshipsToCreate.length} new relationships...`);
      const createBatchSize = 25;
      
      for (let i = 0; i < relationshipsToCreate.length; i += createBatchSize) {
        const batch = relationshipsToCreate.slice(i, i + createBatchSize);
        const createTransactions = batch.map(rel => 
          adminDb.tx.relationships![rel.id]!.update(rel)
        );
        
        await adminDb.transact(createTransactions);
        console.log(`   Created ${Math.min(i + createBatchSize, relationshipsToCreate.length)}/${relationshipsToCreate.length} relationships`);
      }
    }

    console.log(`\n📈 REDISTRIBUTION COMPLETE\n${'='.repeat(50)}`);
    console.log(`✅ Successfully redistributed ${redistributionPlan.length} host family assignments`);
    console.log(`🔗 Processed ${relationshipsToDelete.length} deletions and ${relationshipsToCreate.length} creations`);
    console.log(`📊 Load balancing improved across all ${coordinators.length} coordinators`);
    
    console.log('\n🎉 Host family redistribution completed successfully!');
    console.log('💡 Tip: Run the analysis script to verify the new balanced distribution.');

  } catch (error) {
    console.error('❌ Error in redistribution script:', error);
  }
}

main(); 