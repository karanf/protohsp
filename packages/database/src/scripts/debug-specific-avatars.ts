#!/usr/bin/env tsx

import * as dotenv from 'dotenv';

// Load environment variables from .env.local files BEFORE importing anything else
const possibleEnvPaths = [
  '/Users/karan/Documents/EGAB/packages/database/.env.local',
  './packages/database/.env.local',
  './.env.local',
  './apps/greenheart/.env.local',
  '../.env.local',
  '../../.env.local',
];

for (const envPath of possibleEnvPaths) {
  try {
    const result = dotenv.config({ path: envPath, override: false });
    if (result.parsed) {
      console.log(`✅ Loaded environment from: ${envPath}`);
      break;
    }
  } catch (error) {
    // Silent fail - try next path
  }
}

// Now import after environment is loaded
import { v4 as uuidv4 } from 'uuid';

// Same helper functions from the main script
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

function sanitizeForSeed(input: string): string {
  if (!input || typeof input !== 'string') {
    return 'Unknown';
  }
  
  return input
    // Remove accents and convert to basic ASCII
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace special characters with safe alternatives
    .replace(/['']/g, '') // Remove apostrophes
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove all other special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    // Convert to title case and remove spaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
    || 'Unknown'; // Fallback if everything was removed
}

function detectGender(firstName: string): string {
  const name = firstName?.toLowerCase() || '';
  
  // Common female name patterns and endings
  const femaleIndicators = [
    'emma', 'sophia', 'sofia', 'olivia', 'anna', 'maria', 'elena', 'lucia', 'giulia', 'chiara',
    'marie', 'amelie', 'camille', 'margot', 'jade', 'lea', 'eloise', 'francesca', 'isabella',
    'astrid', 'ingrid', 'emilia', 'nora', 'saga', 'linnea', 'valentina', 'chloe', 'zoe',
    'jennifer', 'lisa', 'amy', 'sarah', 'michelle', 'jessica', 'patricia', 'linda', 'barbara',
    'elizabeth', 'nancy', 'sandra', 'donna', 'carol', 'ruth', 'helen', 'sharon', 'deborah',
    'kimberly', 'catherine', 'anna', 'frances', 'martha', 'julie', 'janice', 'arlene'
  ];
  
  // Check for exact name matches first
  if (femaleIndicators.includes(name)) {
    return 'female';
  }
  
  // Check for name endings
  if (name.endsWith('a') && name.length > 2) {
    return 'female';
  }
  
  return 'unknown';
}

function generateExpectedAvatar(firstName: string, lastName: string, userId: string, role: string): string {
  // Use the same logic as the main script
  const cleanFirstName = sanitizeForSeed(firstName || 'User');
  const cleanLastName = sanitizeForSeed(lastName || 'Name');
  const cleanId = userId.replace(/[^a-zA-Z0-9]/g, '');
  
  const seed = `${cleanFirstName}_${cleanLastName}_${cleanId}`;
  const gender = detectGender(firstName);
  
  // Pastel colors (same as main script)
  const PASTEL_COLORS = [
    'ffeaa7', 'fab1a0', 'ff7675', 'fd79a8', 'e17055', 'a29bfe', '6c5ce7', 'fdcb6e', 'e84393'
  ];
  
  const backgroundColor = PASTEL_COLORS[Math.abs(hashString(seed)) % PASTEL_COLORS.length] || 'ffeaa7';
  
  const shouldHaveFacialHair = gender === 'male' && role !== 'student';
  const facialHairProbability = shouldHaveFacialHair ? (Math.abs(hashString(seed + 'facial')) % 40).toString() : '0';
  
  const params = new URLSearchParams();
  params.append('seed', seed);
  params.append('backgroundColor', backgroundColor);
  params.append('size', '200');
  params.append('accessoriesProbability', (Math.abs(hashString(seed + 'accessories')) % 30).toString());
  params.append('facialHairProbability', facialHairProbability);
  params.append('maskProbability', (Math.abs(hashString(seed + 'mask')) % 10).toString());
  
  return `https://api.dicebear.com/9.x/open-peeps/svg?${params.toString()}`;
}

async function testUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return `${response.status} ${response.statusText}`;
  } catch (error) {
    return `Error: ${error}`;
  }
}

async function debugSpecificAvatars() {
  console.log('🔍 Debugging avatar issues for host families and local coordinators...');
  
  // Dynamic import to ensure environment variables are loaded first
  const { adminDb } = await import('../client');
  
  if (!adminDb) {
    console.error('❌ AdminDB not available');
    return;
  }

  try {
    // Fetch all users
    console.log('📥 Fetching all users...');
    const usersResponse = await adminDb.query({ users: {} });
    
    if (!usersResponse?.users) {
      console.error('❌ Failed to fetch users');
      return;
    }
    
    const users = usersResponse.users;
    console.log(`📊 Found ${users.length} total users`);
    
    // Find host families and local coordinators
    const hostFamilies = users.filter(user => user.role === 'host_family');
    const localCoordinators = users.filter(user => user.role === 'local_coordinator');
    
    console.log(`👥 Found ${hostFamilies.length} host families`);
    console.log(`👥 Found ${localCoordinators.length} local coordinators`);
    
    // Check first few of each type
    console.log('\n🔍 Checking Host Families:');
    for (const user of hostFamilies.slice(0, 5)) {
      const userFirstName = user.firstName as string || '';
      const userLastName = user.lastName as string || '';
      const userAvatarUrl = user.avatarUrl as string || '';
      
      console.log(`\n👥 Host Family: ${userFirstName} ${userLastName}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Avatar URL: ${userAvatarUrl}`);
      
      if (userAvatarUrl) {
        console.log(`   🧪 Testing avatar URL...`);
        const testResult = await testUrl(userAvatarUrl);
        console.log(`   📡 Status: ${testResult}`);
      } else {
        console.log(`   ❌ No avatar URL found!`);
      }
    }
    
    console.log('\n🔍 Checking Local Coordinators:');
    for (const user of localCoordinators.slice(0, 5)) {
      const userFirstName = user.firstName as string || '';
      const userLastName = user.lastName as string || '';
      const userAvatarUrl = user.avatarUrl as string || '';
      
      console.log(`\n🏢 Local Coordinator: ${userFirstName} ${userLastName}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Avatar URL: ${userAvatarUrl}`);
      
      if (userAvatarUrl) {
        console.log(`   🧪 Testing avatar URL...`);
        const testResult = await testUrl(userAvatarUrl);
        console.log(`   📡 Status: ${testResult}`);
      } else {
        console.log(`   ❌ No avatar URL found!`);
      }
    }
    
    // Check for missing avatars by role
    console.log('\n📊 Avatar Statistics by Role:');
    const roleStats = users.reduce((stats: Record<string, { total: number; withAvatars: number; withoutAvatars: number }>, user) => {
      const role = user.role as string || 'unknown';
      const hasAvatar = !!(user.avatarUrl as string);
      
      if (!stats[role]) {
        stats[role] = { total: 0, withAvatars: 0, withoutAvatars: 0 };
      }
      
      stats[role].total++;
      if (hasAvatar) {
        stats[role].withAvatars++;
      } else {
        stats[role].withoutAvatars++;
      }
      
      return stats;
    }, {});
    
    for (const [role, stats] of Object.entries(roleStats)) {
      console.log(`   ${role}: ${stats.withAvatars}/${stats.total} have avatars (${stats.withoutAvatars} missing)`);
    }
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  }
}

// Run the function if this is the main module
debugSpecificAvatars().catch(console.error);

export { debugSpecificAvatars }; 