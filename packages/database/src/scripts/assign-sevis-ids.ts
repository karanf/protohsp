import { init } from '@instantdb/admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

const db = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

// SEVIS types that should have SEVIS IDs (excluding "New Student")
const TYPES_THAT_NEED_SEVIS_IDS = [
  'Validation - Housing',
  'Validation - Site of Activity',
  'Payment',
  'Bio',
  'Update - Housing',
  'Update - Site of Activity',
  'Program Date',
  'Program Extension',
  'Program Shorten',
  'Reprint',
  'Status End',
  'Status Invalid',
  'Status Terminate',
  'Update - Edit Subject',
  'Financial Info'
];

const SEVIS_ID_CONFIG = {
  prefix: 'N',
  minDigits: 7,
  maxDigits: 10,
  startRange: 1000000,
  endRange: 9999999999
};

function generateSevisId(index: number, existingIds: Set<string>): string {
  const baseNumber = SEVIS_ID_CONFIG.startRange + (index * 1234567) % (SEVIS_ID_CONFIG.endRange - SEVIS_ID_CONFIG.startRange);
  const number = Math.max(SEVIS_ID_CONFIG.startRange, Math.min(SEVIS_ID_CONFIG.endRange, baseNumber));
  const numberStr = String(number);
  const paddedNumber = numberStr.padStart(SEVIS_ID_CONFIG.minDigits, '0');
  const sevisId = `${SEVIS_ID_CONFIG.prefix}${paddedNumber}`;
  if (existingIds.has(sevisId)) {
    const collisionNumber = SEVIS_ID_CONFIG.startRange + (index * 9876543 + Date.now()) % (SEVIS_ID_CONFIG.endRange - SEVIS_ID_CONFIG.startRange);
    const collisionStr = String(collisionNumber).padStart(SEVIS_ID_CONFIG.minDigits, '0');
    return `${SEVIS_ID_CONFIG.prefix}${collisionStr}`;
  }
  return sevisId;
}

function isValidSevisId(sevisId: string): boolean {
  if (!sevisId || typeof sevisId !== 'string') return false;
  const pattern = new RegExp(`^${SEVIS_ID_CONFIG.prefix}\\d{${SEVIS_ID_CONFIG.minDigits},${SEVIS_ID_CONFIG.maxDigits}}$`);
  return pattern.test(sevisId);
}

async function assignSevisIds() {
  try {
    console.log('🔄 Enforcing SEVIS ID rules...\n');
    const result = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      }
    });
    if (!result?.profiles || result.profiles.length === 0) {
      console.log('❌ No student profiles found.');
      return;
    }
    const profiles = result.profiles;
    console.log(`📊 Found ${profiles.length} total student profiles`);

    // Collect all existing SEVIS IDs
    const existingSevisIds = new Set<string>();
    for (const profile of profiles) {
      const profileData = profile.data;
      if (profileData?.sevis_id && typeof profileData.sevis_id === 'string' && profileData.sevis_id.trim()) {
        existingSevisIds.add(profileData.sevis_id);
      }
    }
    console.log(`📋 Found ${existingSevisIds.size} existing SEVIS IDs`);

    // Prepare transactions
    const transactions = [];
    let assignedCount = 0;
    let removedCount = 0;
    const newSevisIds = new Set<string>();
    let assignIndex = 0;

    for (const profile of profiles) {
      const profileData = profile.data;
      if (!profileData) continue;
      const isApproved = profileData?.applicationStatus === 'approved';
      let sevisType = 'New Student';
      if (profileData?.sevis_processing_type && typeof profileData.sevis_processing_type === 'string') {
        sevisType = profileData.sevis_processing_type;
      } else if (profileData?.changeType && typeof profileData.changeType === 'string') {
        sevisType = profileData.changeType;
      }
      let currentSevisId = '';
      if (profileData?.sevis_id && typeof profileData.sevis_id === 'string') {
        currentSevisId = profileData.sevis_id;
      }
      // Should this student have a SEVIS ID?
      const shouldHaveSevisId = isApproved && TYPES_THAT_NEED_SEVIS_IDS.includes(sevisType);
      // Remove SEVIS ID if not allowed
      if (!shouldHaveSevisId && currentSevisId) {
        const updatedData = { ...profileData };
        delete updatedData.sevis_id;
        updatedData.updated_at = new Date().toISOString();
        transactions.push((db.tx as any).profiles[profile.id].update({ data: updatedData }));
        removedCount++;
        continue;
      }
      // Assign SEVIS ID if required and missing
      if (shouldHaveSevisId && (!currentSevisId || !isValidSevisId(currentSevisId))) {
        let sevisId = generateSevisId(assignIndex, existingSevisIds);
        while (existingSevisIds.has(sevisId) || newSevisIds.has(sevisId)) {
          assignIndex++;
          sevisId = generateSevisId(assignIndex, existingSevisIds);
        }
        const updatedData = { ...profileData, sevis_id: sevisId, updated_at: new Date().toISOString() };
        transactions.push((db.tx as any).profiles[profile.id].update({ data: updatedData }));
        newSevisIds.add(sevisId);
        assignedCount++;
        assignIndex++;
      }
    }
    // Process in batches
    for (let i = 0; i < transactions.length; i += 20) {
      await db.transact(transactions.slice(i, i + 20));
      console.log(`✅ Processed ${Math.min(i + 20, transactions.length)} of ${transactions.length} updates...`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log(`\n🎉 Assigned ${assignedCount} SEVIS IDs, removed ${removedCount} SEVIS IDs.`);
    // Verification
    const verifyResult = await db.query({
      profiles: {
        $: {
          where: {
            type: 'student'
          }
        }
      }
    });
    let correct = 0, incorrect = 0;
    for (const profile of verifyResult.profiles || []) {
      const profileData = profile.data;
      if (!profileData) continue;
      const isApproved = profileData?.applicationStatus === 'approved';
      let sevisType = 'New Student';
      if (profileData?.sevis_processing_type && typeof profileData.sevis_processing_type === 'string') {
        sevisType = profileData.sevis_processing_type;
      } else if (profileData?.changeType && typeof profileData.changeType === 'string') {
        sevisType = profileData.changeType;
      }
      let sevisId = '';
      if (profileData?.sevis_id && typeof profileData.sevis_id === 'string') {
        sevisId = profileData.sevis_id;
      }
      const shouldHaveSevisId = isApproved && TYPES_THAT_NEED_SEVIS_IDS.includes(sevisType);
      if (shouldHaveSevisId && sevisId && isValidSevisId(sevisId)) correct++;
      else if (!shouldHaveSevisId && !sevisId) correct++;
      else incorrect++;
    }
    console.log(`\n✅ Verification: ${correct} correct, ${incorrect} incorrect.`);
    if (incorrect === 0) {
      console.log('🎉 All students now have correct SEVIS ID assignment!');
    } else {
      console.log(`⚠️  ${incorrect} students have incorrect SEVIS ID assignment.`);
    }
    console.log('\n✅ SEVIS ID enforcement completed successfully!');
  } catch (error) {
    console.error('❌ Error enforcing SEVIS IDs:', error);
    throw error;
  }
}

assignSevisIds()
  .then(() => {
    console.log('🎉 Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 