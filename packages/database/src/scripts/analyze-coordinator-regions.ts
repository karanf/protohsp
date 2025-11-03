import { init } from '@instantdb/admin';
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

interface CoordinatorAnalysis {
  id: string
  name: string
  email: string
  userRegion?: string
  profileRegion?: string
  finalRegion: string
  hostFamiliesAssigned: number
  hostFamilyDetails: Array<{
    id: string
    name: string
    location?: string
  }>
}

interface HostFamilyAnalysis {
  id: string
  name: string
  location?: string
  coordinatorId?: string
  coordinatorName?: string
  coordinatorRegion?: string
  hasCoordinator: boolean
}

async function analyzeCoordinatorRegions() {
  try {
    console.log('🔍 Analyzing Coordinator Region Assignments and Host Family Connections...\n')

    // Fetch all data
    console.log('Fetching data from InstantDB...')
    const { users, profiles, relationships } = await adminDb.query({
      users: {},
      profiles: {},
      relationships: {}
    })

    console.log(`Found ${users.length} users, ${profiles.length} profiles, ${relationships.length} relationships\n`)

    // Process coordinators
    const coordinatorUsers = users.filter(u => 
      (typeof u.role === 'string' && u.role.toLowerCase().includes('coordinator')) || 
      u.role === 'local_coordinator'
    )
    
    console.log(`📍 Found ${coordinatorUsers.length} coordinator users`)

    // Create profile lookup
    const profilesByUserId = new Map()
    profiles.forEach(p => {
      profilesByUserId.set(p.userId, p)
    })

    // Analyze each coordinator
    const coordinatorAnalysis: CoordinatorAnalysis[] = []
    
    for (const coordUser of coordinatorUsers) {
      const coordProfile = profilesByUserId.get(coordUser.id)
      
      // Extract regions from different sources
      const userRegion = (coordUser.metadata && typeof coordUser.metadata === 'object' && 'region' in coordUser.metadata) 
        ? coordUser.metadata.region as string | undefined : undefined
      const profileRegion = (coordProfile?.data && typeof coordProfile.data === 'object' && 'region' in coordProfile.data) 
        ? (coordProfile.data as any).region as string | undefined : undefined
      const finalRegion = userRegion || profileRegion || 'UNASSIGNED'
      
      // Find host families assigned to this coordinator
      const coordProfileId = coordProfile?.id
      const hostRelationships = relationships.filter(r => 
        r.type === 'coordinator_host' && r.primaryId === coordProfileId
      )
      
      // Get host family details
      const hostFamilyDetails = []
      for (const rel of hostRelationships) {
        const hostProfile = profiles.find(p => p.id === rel.secondaryId)
        const hostUser = hostProfile ? users.find(u => u.id === hostProfile.userId) : null
        
        if (hostUser && hostProfile) {
          hostFamilyDetails.push({
            id: hostUser.id,
            name: `${hostUser.firstName || ''} ${hostUser.lastName || ''}`.trim(),
            location: hostProfile.data?.city || hostProfile.data?.state || 'Unknown'
          })
        }
      }
      
      coordinatorAnalysis.push({
        id: coordUser.id,
        name: `${coordUser.firstName || ''} ${coordUser.lastName || ''}`.trim(),
        email: coordUser.email,
        userRegion,
        profileRegion,
        finalRegion,
        hostFamiliesAssigned: hostFamilyDetails.length,
        hostFamilyDetails
      })
    }

    // Analyze host families
    const hostFamilyUsers = users.filter(u => u.role === 'host_family')
    console.log(`🏠 Found ${hostFamilyUsers.length} host family users`)

    const hostFamilyAnalysis: HostFamilyAnalysis[] = []
    
    for (const hostUser of hostFamilyUsers) {
      const hostProfile = profilesByUserId.get(hostUser.id)
      
      // Find coordinator relationship
      const coordRelationship = relationships.find(r => 
        r.type === 'coordinator_host' && r.secondaryId === hostProfile?.id
      )
      
      let coordinatorInfo = null
      if (coordRelationship) {
        const coordProfile = profiles.find(p => p.id === coordRelationship.primaryId)
        const coordUser = coordProfile ? users.find(u => u.id === coordProfile.userId) : null
        
                 if (coordUser && coordProfile) {
           const userRegion = (coordUser.metadata && typeof coordUser.metadata === 'object' && 'region' in coordUser.metadata) 
             ? coordUser.metadata.region as string : undefined
           const profileRegion = (coordProfile.data && typeof coordProfile.data === 'object' && 'region' in coordProfile.data) 
             ? (coordProfile.data as any).region as string : undefined
           const coordRegion = userRegion || profileRegion || 'UNASSIGNED'
          coordinatorInfo = {
            id: coordUser.id,
            name: `${coordUser.firstName || ''} ${coordUser.lastName || ''}`.trim(),
            region: coordRegion
          }
        }
      }
      
      hostFamilyAnalysis.push({
        id: hostUser.id,
        name: `${hostUser.firstName || ''} ${hostUser.lastName || ''}`.trim(),
        location: hostProfile?.data?.city || hostProfile?.data?.state || 'Unknown',
        coordinatorId: coordinatorInfo?.id,
        coordinatorName: coordinatorInfo?.name,
        coordinatorRegion: coordinatorInfo?.region,
        hasCoordinator: !!coordinatorInfo
      })
    }

    // Generate analysis report
    console.log('\n📊 COORDINATOR REGION ANALYSIS')
    console.log('='.repeat(50))
    
    const unassignedCoordinators = coordinatorAnalysis.filter(c => c.finalRegion === 'UNASSIGNED')
    const coordinatorsWithoutHosts = coordinatorAnalysis.filter(c => c.hostFamiliesAssigned === 0)
    
    console.log(`\n🚨 Coordinators without proper regions: ${unassignedCoordinators.length}`)
    unassignedCoordinators.forEach(coord => {
      console.log(`   - ${coord.name} (${coord.email})`)
      console.log(`     User region: ${coord.userRegion || 'None'}`)
      console.log(`     Profile region: ${coord.profileRegion || 'None'}`)
      console.log(`     Host families: ${coord.hostFamiliesAssigned}`)
      console.log()
    })

    console.log(`\n📭 Coordinators without host families: ${coordinatorsWithoutHosts.length}`)
    coordinatorsWithoutHosts.forEach(coord => {
      console.log(`   - ${coord.name} (${coord.email}) - Region: ${coord.finalRegion}`)
    })

    console.log('\n🏠 HOST FAMILY ANALYSIS')
    console.log('='.repeat(50))
    
    const hostsWithoutCoordinators = hostFamilyAnalysis.filter(h => !h.hasCoordinator)
    
    console.log(`\n🚨 Host families without coordinators: ${hostsWithoutCoordinators.length}`)
    hostsWithoutCoordinators.forEach(host => {
      console.log(`   - ${host.name} (Location: ${host.location})`)
    })

    // Group analysis by region
    console.log('\n🗺️ REGIONAL DISTRIBUTION')
    console.log('='.repeat(50))
    
    const regionStats = new Map<string, {
      coordinators: number
      hostFamilies: number
      coordinatorNames: string[]
    }>()
    
    // Process coordinators by region
    coordinatorAnalysis.forEach(coord => {
      const region = coord.finalRegion
      if (!regionStats.has(region)) {
        regionStats.set(region, { coordinators: 0, hostFamilies: 0, coordinatorNames: [] })
      }
      const stats = regionStats.get(region)!
      stats.coordinators++
      stats.coordinatorNames.push(coord.name)
      stats.hostFamilies += coord.hostFamiliesAssigned
    })
    
    // Sort regions by name
    const sortedRegions = Array.from(regionStats.entries()).sort(([a], [b]) => a.localeCompare(b))
    
    sortedRegions.forEach(([region, stats]) => {
      console.log(`\n📍 ${region}:`)
      console.log(`   Coordinators: ${stats.coordinators}`)
      console.log(`   Host Families: ${stats.hostFamilies}`)
      console.log(`   Coordinator Names: ${stats.coordinatorNames.join(', ') || 'None'}`)
    })

    // Summary
    console.log('\n📈 SUMMARY')
    console.log('='.repeat(50))
    console.log(`Total Coordinators: ${coordinatorAnalysis.length}`)
    console.log(`Coordinators with regions: ${coordinatorAnalysis.length - unassignedCoordinators.length}`)
    console.log(`Coordinators without regions: ${unassignedCoordinators.length}`)
    console.log(`Total Host Families: ${hostFamilyAnalysis.length}`)
    console.log(`Host Families with coordinators: ${hostFamilyAnalysis.length - hostsWithoutCoordinators.length}`)
    console.log(`Host Families without coordinators: ${hostsWithoutCoordinators.length}`)
    console.log(`Active Regions: ${regionStats.size}`)

    return {
      coordinatorAnalysis,
      hostFamilyAnalysis,
      unassignedCoordinators,
      hostsWithoutCoordinators,
      regionStats
    }

  } catch (error) {
    console.error('❌ Error analyzing coordinator regions:', error)
    throw error
  }
}

// Run the analysis if this file is executed directly
analyzeCoordinatorRegions()
  .then(() => {
    console.log('\n✅ Analysis complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Analysis failed:', error)
    process.exit(1)
  })

export { analyzeCoordinatorRegions } 