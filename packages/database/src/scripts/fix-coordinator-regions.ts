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

// US States and regions mapping for assignment
const US_REGIONS = {
  'Northeast': ['CT', 'ME', 'MA', 'NH', 'NJ', 'NY', 'PA', 'RI', 'VT'],
  'Southeast': ['AL', 'AR', 'FL', 'GA', 'KY', 'LA', 'MS', 'NC', 'SC', 'TN', 'VA', 'WV'],
  'Midwest': ['IL', 'IN', 'IA', 'KS', 'MI', 'MN', 'MO', 'NE', 'ND', 'OH', 'SD', 'WI'],
  'Southwest': ['AZ', 'NM', 'OK', 'TX'],
  'West': ['AK', 'CA', 'CO', 'HI', 'ID', 'MT', 'NV', 'OR', 'UT', 'WA', 'WY'],
  'Mid-Atlantic': ['DE', 'MD', 'DC']
}

// Common city to state/region mappings
const CITY_STATE_MAPPINGS = {
  'New York': 'NY',
  'Los Angeles': 'CA',
  'Chicago': 'IL',
  'Houston': 'TX',
  'Phoenix': 'AZ',
  'Philadelphia': 'PA',
  'San Antonio': 'TX',
  'San Diego': 'CA',
  'Dallas': 'TX',
  'San Jose': 'CA',
  'Austin': 'TX',
  'Jacksonville': 'FL',
  'Fort Worth': 'TX',
  'Columbus': 'OH',
  'Charlotte': 'NC',
  'San Francisco': 'CA',
  'Indianapolis': 'IN',
  'Seattle': 'WA',
  'Denver': 'CO',
  'Washington': 'DC',
  'Boston': 'MA',
  'Nashville': 'TN',
  'Baltimore': 'MD',
  'Portland': 'OR',
  'Oklahoma City': 'OK',
  'Las Vegas': 'NV',
  'Louisville': 'KY',
  'Milwaukee': 'WI',
  'Albuquerque': 'NM',
  'Tucson': 'AZ',
  'Fresno': 'CA',
  'Sacramento': 'CA',
  'Mesa': 'AZ',
  'Kansas City': 'MO',
  'Atlanta': 'GA',
  'Long Beach': 'CA',
  'Colorado Springs': 'CO',
  'Raleigh': 'NC',
  'Miami': 'FL',
  'Virginia Beach': 'VA',
  'Omaha': 'NE',
  'Oakland': 'CA',
  'Minneapolis': 'MN',
  'Tulsa': 'OK',
  'Arlington': 'TX',
  'Tampa': 'FL'
}

function getStateFromCity(city: string): string | null {
  return (CITY_STATE_MAPPINGS as Record<string, string>)[city] || null
}

function getRegionFromState(state: string): string | null {
  for (const [region, states] of Object.entries(US_REGIONS)) {
    if (states.includes(state)) {
      return region
    }
  }
  return null
}

async function fixCoordinatorRegions() {
  try {
    console.log('🔧 Fixing Coordinator Region Assignments and Host Family Connections...\n')

    // Fetch all data
    console.log('Fetching data from InstantDB...')
    const { users, profiles, relationships } = await adminDb.query({
      users: {},
      profiles: {},
      relationships: {}
    })

    console.log(`Found ${users.length} users, ${profiles.length} profiles, ${relationships.length} relationships\n`)

    // Get coordinators without proper regions
    const coordinatorUsers = users.filter(u => 
      (typeof u.role === 'string' && u.role.toLowerCase().includes('coordinator')) || 
      u.role === 'local_coordinator'
    )

    // Create profile lookup
    const profilesByUserId = new Map()
    profiles.forEach(p => {
      profilesByUserId.set(p.userId, p)
    })

    console.log(`📍 Processing ${coordinatorUsers.length} coordinators...\n`)

    const fixedCoordinators: Array<{
      id: string
      name: string
      oldRegion: string
      newRegion: string
      source: string
    }> = []

    // Fix coordinator regions
    for (const coordUser of coordinatorUsers) {
      const coordProfile = profilesByUserId.get(coordUser.id)
      
             // Check current region assignment
       const userRegion = (coordUser.metadata && typeof coordUser.metadata === 'object' && 'region' in coordUser.metadata) 
         ? coordUser.metadata.region as string | undefined : undefined
       const profileRegion = (coordProfile?.data && typeof coordProfile.data === 'object' && 'region' in coordProfile.data) 
         ? (coordProfile.data as any).region as string | undefined : undefined
      const currentRegion = userRegion || profileRegion || 'UNASSIGNED'
      
      if (currentRegion === 'UNASSIGNED' || !currentRegion) {
        let newRegion: string | null = null
        let source = ''
        
        // Try to infer region from profile data
        if (coordProfile?.data) {
          const profileData = coordProfile.data as any
          
          // Check for city/state information
          if (profileData.city) {
            const state = getStateFromCity(profileData.city)
            if (state) {
              newRegion = getRegionFromState(state) || profileData.city
              source = `city: ${profileData.city} -> state: ${state}`
            } else {
              newRegion = profileData.city
              source = `city: ${profileData.city}`
            }
          } else if (profileData.state) {
            const state = profileData.state.length === 2 ? profileData.state : null
            if (state) {
              newRegion = getRegionFromState(state) || state
              source = `state: ${state}`
            } else {
              newRegion = profileData.state
              source = `state: ${profileData.state}`
            }
          } else if (profileData.address) {
            // Try to extract state from address
            const addressParts = profileData.address.split(',')
            if (addressParts.length >= 2) {
              const lastPart = addressParts[addressParts.length - 1].trim()
              const statePart = lastPart.split(' ')[0]
              if (statePart.length === 2) {
                newRegion = getRegionFromState(statePart) || statePart
                source = `address state: ${statePart}`
              }
            }
          }
        }
        
        // If still no region, assign based on name/email patterns or use a default
        if (!newRegion) {
          // Simple fallback: assign to a region with fewer coordinators
                     const regionCounts = new Map<string, number>()
           coordinatorUsers.forEach(u => {
             const p = profilesByUserId.get(u.id)
             const userRegion = (u.metadata && typeof u.metadata === 'object' && 'region' in u.metadata) 
               ? u.metadata.region as string : undefined
             const profileRegion = (p?.data && typeof p.data === 'object' && 'region' in p.data) 
               ? (p.data as any).region as string : undefined
             const r = userRegion || profileRegion || 'Unassigned'
             regionCounts.set(r, (regionCounts.get(r) || 0) + 1)
           })
          
          // Find region with least coordinators
          let minRegion = 'Northeast'
          let minCount = Infinity
          for (const [region, count] of regionCounts) {
            if (region !== 'Unassigned' && count < minCount) {
              minRegion = region
              minCount = count
            }
          }
          
          newRegion = minRegion
          source = `default assignment (least populated region)`
        }
        
        if (newRegion && newRegion !== currentRegion) {
          // Update the coordinator's profile with the new region
          if (coordProfile) {
            const updatedData = {
              ...coordProfile.data,
              region: newRegion
            }
            
             await adminDb.transact([
               adminDb.tx.profiles[coordProfile.id]!.update({
                 data: updatedData,
                 updatedAt: new Date().toISOString()
               })
             ])
            
            fixedCoordinators.push({
              id: coordUser.id,
              name: `${coordUser.firstName || ''} ${coordUser.lastName || ''}`.trim(),
              oldRegion: currentRegion,
              newRegion,
              source
            })
            
            console.log(`✅ Fixed ${coordUser.firstName} ${coordUser.lastName}: ${currentRegion} -> ${newRegion} (${source})`)
          }
        }
      }
    }

    console.log(`\n🔗 Now connecting host families to coordinators by region...\n`)

    // Get host families without coordinators or with mismatched regions
    const hostFamilyUsers = users.filter(u => u.role === 'host_family')
    const coordinatorProfiles = profiles.filter(p => p.type === 'local_coordinator' || p.type === 'coordinator')
    
    // Create coordinator lookup by region
    const coordinatorsByRegion = new Map<string, any[]>()
    coordinatorProfiles.forEach(coordProfile => {
      const coordUser = users.find(u => u.id === coordProfile.userId)
             if (coordUser) {
         const userRegion = (coordUser.metadata && typeof coordUser.metadata === 'object' && 'region' in coordUser.metadata) 
           ? coordUser.metadata.region as string : undefined
         const profileRegion = (coordProfile.data && typeof coordProfile.data === 'object' && 'region' in coordProfile.data) 
           ? (coordProfile.data as any).region as string : undefined
         const region = userRegion || profileRegion || 'Unassigned'
        if (!coordinatorsByRegion.has(region)) {
          coordinatorsByRegion.set(region, [])
        }
        coordinatorsByRegion.get(region)!.push({
          profile: coordProfile,
          user: coordUser,
          hostCount: relationships.filter(r => 
            r.type === 'coordinator_host' && r.primaryId === coordProfile.id
          ).length
        })
      }
    })

    const newConnections: Array<{
      hostName: string
      coordinatorName: string
      region: string
    }> = []

    for (const hostUser of hostFamilyUsers) {
      const hostProfile = profilesByUserId.get(hostUser.id)
      if (!hostProfile) continue

      // Check if host already has a coordinator
      const existingRelationship = relationships.find(r => 
        r.type === 'coordinator_host' && r.secondaryId === hostProfile.id
      )

      if (!existingRelationship) {
        // Determine host family's region
        let hostRegion: string | null = null
        const profileData = hostProfile.data as any
        
        if (profileData.city) {
          const state = getStateFromCity(profileData.city)
          hostRegion = state ? getRegionFromState(state) : null
        } else if (profileData.state) {
          const state = profileData.state.length === 2 ? profileData.state : null
          hostRegion = state ? getRegionFromState(state) : null
        } else if (profileData.address) {
          const addressParts = profileData.address.split(',')
          if (addressParts.length >= 2) {
            const lastPart = addressParts[addressParts.length - 1].trim()
            const statePart = lastPart.split(' ')[0]
            if (statePart.length === 2) {
              hostRegion = getRegionFromState(statePart)
            }
          }
        }

        if (!hostRegion) {
          hostRegion = 'Northeast' // Default region
        }

        // Find coordinator in the same region with least host families
        const regionCoordinators = coordinatorsByRegion.get(hostRegion) || []
        if (regionCoordinators.length === 0) {
          // If no coordinators in region, use any available coordinator
          const allCoordinators = Array.from(coordinatorsByRegion.values()).flat()
          if (allCoordinators.length > 0) {
            regionCoordinators.push(...allCoordinators)
          }
        }

        if (regionCoordinators.length > 0) {
          // Sort by host count (ascending) to balance the load
          regionCoordinators.sort((a, b) => a.hostCount - b.hostCount)
          const selectedCoordinator = regionCoordinators[0]

                     // Create the relationship
           const relationshipId = id()
           await adminDb.transact([
             adminDb.tx.relationships[relationshipId]!.update({
               type: 'coordinator_host',
               primaryId: selectedCoordinator.profile.id,
               secondaryId: hostProfile.id,
               status: 'active',
               startDate: new Date().toISOString(),
               data: {
                 notes: `Auto-assigned based on regional matching (${hostRegion})`,
                 assignmentDate: new Date().toISOString(),
                 assignmentReason: 'regional_matching'
               },
               createdAt: new Date().toISOString(),
               updatedAt: new Date().toISOString()
             })
           ])

          // Increment the coordinator's host count for next iteration
          selectedCoordinator.hostCount++

          newConnections.push({
            hostName: `${hostUser.firstName || ''} ${hostUser.lastName || ''}`.trim(),
            coordinatorName: `${selectedCoordinator.user.firstName || ''} ${selectedCoordinator.user.lastName || ''}`.trim(),
            region: hostRegion
          })

          console.log(`🔗 Connected ${hostUser.firstName} ${hostUser.lastName} -> ${selectedCoordinator.user.firstName} ${selectedCoordinator.user.lastName} (${hostRegion})`)
        }
      }
    }

    // Summary
    console.log('\n📊 SUMMARY')
    console.log('='.repeat(50))
    console.log(`Coordinators with fixed regions: ${fixedCoordinators.length}`)
    console.log(`New host family connections: ${newConnections.length}`)

    if (fixedCoordinators.length > 0) {
      console.log('\n🔧 Fixed Coordinators:')
      fixedCoordinators.forEach(coord => {
        console.log(`   ${coord.name}: ${coord.oldRegion} -> ${coord.newRegion}`)
      })
    }

    if (newConnections.length > 0) {
      console.log('\n🔗 New Connections:')
      newConnections.forEach(conn => {
        console.log(`   ${conn.hostName} -> ${conn.coordinatorName} (${conn.region})`)
      })
    }

    return { fixedCoordinators, newConnections }

  } catch (error) {
    console.error('❌ Error fixing coordinator regions:', error)
    throw error
  }
}

// Run the fix if this file is executed directly
fixCoordinatorRegions()
  .then(() => {
    console.log('\n✅ Fix complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error)
    process.exit(1)
  })

export { fixCoordinatorRegions } 