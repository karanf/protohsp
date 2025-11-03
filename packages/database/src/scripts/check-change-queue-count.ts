import { init } from '@instantdb/admin';
import dotenv from 'dotenv';

// Load environment variables - EXACT pattern to avoid path issues
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

const db = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

async function checkChangeQueueCount() {
  console.log('🔍 Checking change queue record count...');

  if (!db) {
    console.error('❌ DB not available');
    return;
  }

  try {
    // Query all change queue records
    const result = await db.query({
      changeQueue: {}
    });

    if (!result?.changeQueue) {
      console.log('No changeQueue data found.');
      return;
    }

    console.log(`📊 Total records in changeQueue: ${result.changeQueue.length}`);
    
    // Group by entityType
    const groupedByType = result.changeQueue.reduce((acc: Record<string, number>, record: any) => {
      const type = record.entityType || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📈 Breakdown by entity type:');
    Object.entries(groupedByType).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`);
    });

    // Group by status
    const groupedByStatus = result.changeQueue.reduce((acc: Record<string, number>, record: any) => {
      const status = record.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Breakdown by status:');
    Object.entries(groupedByStatus).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count}`);
    });

    // Show first few record IDs to check for duplicates
    console.log('\n🔢 First 10 record IDs:');
    result.changeQueue.slice(0, 10).forEach((record: any, index: number) => {
      console.log(`   ${index + 1}. ${record.id} (${record.entityType}, ${record.status})`);
    });

    // Check for duplicate IDs
    const ids = result.changeQueue.map((r: any) => r.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      console.log(`\n⚠️  WARNING: Found duplicate IDs! Total: ${ids.length}, Unique: ${uniqueIds.size}`);
    } else {
      console.log(`\n✅ All record IDs are unique`);
    }

  } catch (error) {
    console.error('❌ Failed to check change queue:', error);
  }
}

checkChangeQueueCount().catch(console.error); 