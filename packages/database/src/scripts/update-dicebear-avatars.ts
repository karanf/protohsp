#!/usr/bin/env tsx

import * as dotenv from 'dotenv';

// Load environment variables from .env.local files BEFORE importing anything else
// Try common locations relative to the execution context
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
    const result = dotenv.config({ path: envPath, override: true });
    if (result.parsed) {
      console.log(`✅ Loaded environment variables from: ${envPath}`);
      console.log(`🔍 Parsed variables:`, Object.keys(result.parsed));
      
      // Explicitly set the environment variables if they were parsed
      if (result.parsed.NEXT_PUBLIC_INSTANT_APP_ID) {
        process.env.NEXT_PUBLIC_INSTANT_APP_ID = result.parsed.NEXT_PUBLIC_INSTANT_APP_ID;
        console.log(`🔑 Set NEXT_PUBLIC_INSTANT_APP_ID: ${result.parsed.NEXT_PUBLIC_INSTANT_APP_ID}`);
      }
      if (result.parsed.INSTANT_ADMIN_TOKEN) {
        process.env.INSTANT_ADMIN_TOKEN = result.parsed.INSTANT_ADMIN_TOKEN;
        console.log(`🔑 Set INSTANT_ADMIN_TOKEN: ${result.parsed.INSTANT_ADMIN_TOKEN.substring(0, 10)}...`);
      }
      
      // Debug: Check if the variables are actually set
      console.log(`🔍 NEXT_PUBLIC_INSTANT_APP_ID: ${process.env.NEXT_PUBLIC_INSTANT_APP_ID ? 'SET' : 'NOT SET'}`);
      console.log(`🔍 INSTANT_ADMIN_TOKEN: ${process.env.INSTANT_ADMIN_TOKEN ? 'SET' : 'NOT SET'}`);
      break;
    }
  } catch (error) {
    console.log(`❌ Failed to load from ${envPath}:`, error);
  }
}

import { v4 as uuidv4 } from 'uuid';

// Pastel color palette for backgrounds
const PASTEL_COLORS = [
  'ffeaa7', // Light yellow
  'fab1a0', // Light peach
  'ff7675', // Light pink
  'fd79a8', // Light magenta
  'e17055', // Light coral
  'a29bfe', // Light purple
  '6c5ce7', // Light violet
  '74b9ff', // Light blue
  '00b894', // Light teal
  '00cec9', // Light cyan
  '55a3ff', // Light sky blue
  'fdcb6e', // Light orange
  'e84393', // Light rose
  'fd79a8', // Light hot pink
  'dda0dd', // Plum
  'f8c8dc', // Light lavender
  'b8e6b8', // Light green
  'ffd1dc', // Light rose
  'e6e6fa', // Lavender
  'f0fff0', // Honeydew
];

// Facial hair options for male host families (primary host) and local coordinators
const FACIAL_HAIR_OPTIONS = [
  'chin',
  'full',
  'full2', 
  'full3',
  'full4',
  'goatee1',
  'goatee2',
  'moustache1',
  'moustache2',
  'moustache3',
  'moustache4',
  'moustache5',
  'moustache6',
  'moustache7',
  'moustache8',
  'moustache9'
];

// Head style options by gender and role
const MALE_HEAD_OPTIONS = [
  'dreads2',
  'flatTop',
  'flatTopLong',
  'grayShort',
  'hatBeanie',
  'hatHip',
  'mohawk',
  'mohawk2',
  'pomp',
  'shaved2',
  'short1',
  'short2',
  'short4',
  'short5',
  'turban',
  'twists',
  'twists2'
];

const FEMALE_HEAD_OPTIONS = [
  'afro',
  'bangs',
  'bangs2',
  'bantuKnots',
  'bun',
  'bun2',
  'buns',
  'cornrows',
  'cornrows2',
  'dreads1',
  'grayBun',
  'grayMedium',
  'grayShort',
  'hijab',
  'long',
  'longAfro',
  'longBangs',
  'longCurly',
  'medium1',
  'medium2',
  'medium3',
  'mediumBangs',
  'mediumBangs2',
  'mediumBangs3',
  'mediumStraight',
  'short3'
];

// Additional head options for male primary host and local coordinators
const MALE_LEADERSHIP_HEAD_OPTIONS = [
  ...MALE_HEAD_OPTIONS,
  'noHair2',
  'noHair3'
];

// Face options for all genders (excluding cyclops and monster)
const FACE_OPTIONS = [
  'angryWithFang',
  'awe',
  'blank',
  'calm',
  'cheeky',
  'concerned',
  'concernedFear',
  'contempt',
  'cute',
  'driven',
  'eatingHappy',
  'explaining',
  'eyesClosed',
  'fear',
  'hectic',
  'lovingGrin1',
  'lovingGrin2',
  'old',
  'rage',
  'serious',
  'smile',
  'smileBig',
  'smileLOL',
  'smileTeethGap',
  'solemn',
  'suspicious',
  'tired',
  'veryAngry'
];

// Accessories options (excluding eyepatch)
const ACCESSORIES_OPTIONS = [
  'glasses',
  'glasses2',
  'glasses3',
  'glasses4',
  'glasses5',
  'sunglasses',
  'sunglasses2'
];

// Note: Open Peeps style doesn't support custom face values, so we rely on the seed for variation

interface UserWithGender {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  gender?: string;
  avatarUrl?: string;
  metadata?: any;
}

interface Profile {
  id: string;
  userId: string;
  type: string;
  data: any;
}

function generateDiceBearAvatar(user: UserWithGender): string {
  // Create a clean, URL-safe seed by removing special characters and normalizing
  const cleanFirstName = sanitizeForSeed(user.firstName || 'User');
  const cleanLastName = sanitizeForSeed(user.lastName || 'Name');
  const cleanId = user.id.replace(/[^a-zA-Z0-9]/g, ''); // Keep only alphanumeric characters from ID
  
  const seed = `${cleanFirstName}_${cleanLastName}_${cleanId}`;
  const backgroundColor = PASTEL_COLORS[Math.abs(hashString(seed)) % PASTEL_COLORS.length] || 'ffeaa7';
  
  // Determine gender with improved logic
  let gender = detectGender(user);
  
  // Facial hair logic: only for male host families (primary host) and local coordinators
  const shouldHaveFacialHair = gender === 'male' && 
    (user.role === 'host_family' || user.role === 'local_coordinator');
  
  // Head style selection based on gender and role
  let headOptions: string[] = [];
  if (gender === 'male') {
    if (user.role === 'host_family' || user.role === 'local_coordinator') {
      headOptions = MALE_LEADERSHIP_HEAD_OPTIONS;
    } else {
      headOptions = MALE_HEAD_OPTIONS;
    }
  } else if (gender === 'female') {
    headOptions = FEMALE_HEAD_OPTIONS;
  } else {
    // For unknown gender, use a mix of both
    headOptions = [...MALE_HEAD_OPTIONS, ...FEMALE_HEAD_OPTIONS];
  }
  
  // Create DiceBear URL with Open Peeps style using proper URL encoding
  const baseUrl = 'https://api.dicebear.com/9.x/open-peeps/svg';
  const params = new URLSearchParams();
  params.append('seed', seed);
  params.append('backgroundColor', backgroundColor);
  params.append('size', '200');
  
  // Deterministically decide if user should have accessories (0-100% based on seed)
  const shouldHaveAccessories = (Math.abs(hashString(seed + 'accessories_decision')) % 100) < 30;
  if (shouldHaveAccessories && ACCESSORIES_OPTIONS.length > 0) {
    const accessoryIndex = Math.abs(hashString(seed + 'accessories_type')) % ACCESSORIES_OPTIONS.length;
    const selectedAccessory = ACCESSORIES_OPTIONS[accessoryIndex];
    if (selectedAccessory) {
      params.append('accessories', selectedAccessory);
    }
  }
  
  // Select head style based on seed
  if (headOptions.length > 0) {
    const headIndex = Math.abs(hashString(seed + 'head_style')) % headOptions.length;
    const selectedHead = headOptions[headIndex];
    if (selectedHead) {
      params.append('head', selectedHead);
    }
  }
  
  // Select face expression based on seed
  if (FACE_OPTIONS.length > 0) {
    const faceIndex = Math.abs(hashString(seed + 'face_expression')) % FACE_OPTIONS.length;
    const selectedFace = FACE_OPTIONS[faceIndex];
    if (selectedFace) {
      params.append('face', selectedFace);
    }
  }
  
  if (shouldHaveFacialHair) {
    // Deterministically decide if this eligible male should actually have facial hair (80% chance)
    const shouldActuallyHaveFacialHair = (Math.abs(hashString(seed + 'facial_decision')) % 100) < 80;
    if (shouldActuallyHaveFacialHair) {
      // Select a specific facial hair style based on the seed
      const facialHairIndex = Math.abs(hashString(seed + 'facial_style')) % FACIAL_HAIR_OPTIONS.length;
      const selectedFacialHair = FACIAL_HAIR_OPTIONS[facialHairIndex];
      if (selectedFacialHair) {
        params.append('facialHair', selectedFacialHair);
      }
    }
  }
  
  const fullUrl = `${baseUrl}?${params.toString()}`;
  
  // Validate the URL before returning
  try {
    new URL(fullUrl);
    return fullUrl;
  } catch (error) {
    console.warn(`⚠️  Invalid URL generated for user ${user.firstName} ${user.lastName}, using fallback`);
    // Return a simple fallback URL
    return `${baseUrl}?seed=${encodeURIComponent(user.id)}&backgroundColor=ffeaa7&size=200`;
  }
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

function detectGender(user: UserWithGender): string {
  // Priority 1: Explicit gender from metadata
  if (user.metadata?.gender) {
    const metadataGender = user.metadata.gender.toLowerCase();
    if (metadataGender === 'male' || metadataGender === 'female') {
      return metadataGender;
    }
  }
  
  // Priority 2: Gender from user object
  if (user.gender) {
    const userGender = user.gender.toLowerCase();
    if (userGender === 'male' || userGender === 'female') {
      return userGender;
    }
  }
  
  // Priority 3: Detect from first name patterns
  const firstName = user.firstName?.toLowerCase() || '';
  
  // Common female name patterns and endings
  const femaleIndicators = [
    // Names
    'emma', 'sophia', 'sofia', 'olivia', 'anna', 'maria', 'elena', 'lucia', 'giulia', 'chiara',
    'marie', 'amelie', 'camille', 'margot', 'jade', 'lea', 'eloise', 'francesca', 'isabella',
    'astrid', 'ingrid', 'emilia', 'nora', 'saga', 'linnea', 'valentina', 'chloe', 'zoe',
    'jennifer', 'lisa', 'amy', 'sarah', 'michelle', 'jessica', 'patricia', 'linda', 'barbara',
    'elizabeth', 'nancy', 'sandra', 'donna', 'carol', 'ruth', 'helen', 'sharon', 'deborah',
    'kimberly', 'catherine', 'anna', 'frances', 'martha', 'julie', 'janice',
    // Endings
    'a', 'ia', 'ina', 'ette', 'elle', 'ine'
  ];
  
  // Common male name patterns and endings
  const maleIndicators = [
    // Names  
    'lukas', 'lucas', 'marcus', 'erik', 'kai', 'felix', 'leon', 'adrian', 'oscar', 'hugo',
    'diego', 'carlos', 'rafael', 'pablo', 'matias', 'sebastian', 'maximilian', 'alessandro',
    'lorenzo', 'luca', 'nicolo', 'matteo', 'pietro', 'johan', 'finn', 'viktor',
    'michael', 'david', 'william', 'james', 'john', 'robert', 'richard', 'christopher',
    'daniel', 'matthew', 'anthony', 'mark', 'donald', 'steven', 'kenneth', 'joshua',
    'kevin', 'brian', 'george', 'harold', 'gregory', 'jonathan', 'edward', 'ronald'
  ];
  
  // Check for exact name matches first
  if (femaleIndicators.includes(firstName)) {
    return 'female';
  }
  
  if (maleIndicators.includes(firstName)) {
    return 'male';
  }
  
  // Check for name endings
  for (const ending of ['ia', 'ina', 'ette', 'elle', 'ine']) {
    if (firstName.endsWith(ending) && firstName.length > ending.length) {
      return 'female';
    }
  }
  
  if (firstName.endsWith('a') && firstName.length > 2) {
    // Most names ending in 'a' are female, but exclude common male exceptions
    const maleExceptions = ['luca', 'andrea', 'joshua', 'sara']; // 'andrea' can be male in Italian
    if (!maleExceptions.includes(firstName)) {
      return 'female';
    }
  }
  
  // Default fallback
  return 'unknown';
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

async function updateDiceBearAvatars() {
  console.log('🎨 Starting DiceBear avatar update...');
  
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
    
    // Fetch all profiles to get gender information
    console.log('📥 Fetching all profiles...');
    const profilesResponse = await adminDb.query({ profiles: {} });
    
    const users = usersResponse.users || [];
    const profiles = profilesResponse.profiles || [];
    
    if (!users || !profiles) {
      console.error('❌ Failed to fetch users or profiles');
      return;
    }
    
    console.log(`📊 Found ${users.length} users and ${profiles.length} profiles`);
    
    // Create a map of userId to profile for quick lookup
    const profileMap = new Map<string, Profile>();
    profiles.forEach((profile: any) => {
      profileMap.set(profile.userId, profile);
    });
    
    // Process users and determine gender
    const usersWithGender: UserWithGender[] = users.map((user: any) => {
      const profile = profileMap.get(user.id);
      let gender = 'unknown';
      
      // Try to get gender from metadata first
      if (user.metadata?.gender) {
        gender = user.metadata.gender.toLowerCase();
      }
      // Then try from profile data
      else if (profile?.data?.gender) {
        gender = profile.data.gender.toLowerCase();
      }
      // For host families, try to get primary host gender
      else if (profile?.data?.primary_host?.gender) {
        gender = profile.data.primary_host.gender.toLowerCase();
      }
      
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName || 'User',
        lastName: user.lastName || 'Name',
        role: user.role,
        gender: gender,
        avatarUrl: user.avatarUrl,
        metadata: user.metadata
      };
    });
    
    console.log(`🎯 Processing ${usersWithGender.length} users...`);
    
    // Update avatars in batches
    const batchSize = 20;
    let updated = 0;
    let errors = 0;
    
    for (let i = 0; i < usersWithGender.length; i += batchSize) {
      const batch = usersWithGender.slice(i, i + batchSize);
      const transactions = [];
      
      for (const user of batch) {
        try {
          const newAvatarUrl = generateDiceBearAvatar(user);
          
          console.log(`🎨 Updating avatar for ${user.firstName} ${user.lastName} (${user.role}, ${user.gender})`);
          console.log(`   New avatar: ${newAvatarUrl}`);
          
          if (adminDb.tx?.users) {
            const userEntity = adminDb.tx.users[user.id];
            if (userEntity) {
              const transaction = userEntity.update({
                avatarUrl: newAvatarUrl,
                updatedAt: new Date(),
              });
              transactions.push(transaction);
            }
          }
        } catch (error) {
          console.error(`❌ Error processing user ${user.id}:`, error);
          errors++;
        }
      }
      
      // Execute batch transaction
      if (transactions.length > 0) {
        try {
          await adminDb.transact(transactions);
          updated += transactions.length;
          console.log(`✅ Updated ${transactions.length} users in batch ${Math.floor(i / batchSize) + 1}`);
        } catch (error) {
          console.error(`❌ Batch transaction failed:`, error);
          errors += transactions.length;
        }
      }
      
      // Small delay between batches to avoid overwhelming the API
      if (i + batchSize < usersWithGender.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`🎉 Avatar update complete!`);
    console.log(`✅ Updated: ${updated} users`);
    console.log(`❌ Errors: ${errors} users`);
    
    // Show some example avatars
    console.log('\n🎨 Example avatars generated:');
    usersWithGender.slice(0, 5).forEach(user => {
      const avatarUrl = generateDiceBearAvatar(user);
      console.log(`   ${user.firstName} ${user.lastName} (${user.role}, ${user.gender}): ${avatarUrl}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to update avatars:', error);
  }
}

// Execute the script
updateDiceBearAvatars().catch(console.error); 