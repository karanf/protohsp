import { init } from '@instantdb/admin';
import dotenv from 'dotenv';

// Load environment variables - EXACT pattern from existing scripts
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

// Ensure required environment variables are available
const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

if (!INSTANT_APP_ID || !INSTANT_ADMIN_TOKEN) {
  console.error('❌ Missing required environment variables:');
  console.error(`  • NEXT_PUBLIC_INSTANT_APP_ID: ${INSTANT_APP_ID ? '✓' : '❌'}`);
  console.error(`  • INSTANT_ADMIN_TOKEN: ${INSTANT_ADMIN_TOKEN ? '✓' : '❌'}`);
  console.error('\nPlease check your .env.local file');
  process.exit(1);
}

// Initialize InstantDB
const db = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

async function fixApprovalDates() {
  console.log('🔄 Checking approval dates for non-approved records...');
  
  try {
    // Query all student profiles
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

    console.log(`📊 Found ${result.profiles.length} student profiles to check.`);

    const transactions = [];
    let updatedCount = 0;
    let statusCounts: { [key: string]: number } = {};
    let approvalDateIssues: { [key: string]: number } = {};

    for (const profile of result.profiles) {
      if (!profile.data) continue;

      const currentData = profile.data;
      const status = currentData.applicationStatus || 'unknown';
      
      // Track status counts
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      
      // Check for approval date issues in non-approved records
      if ((status === 'pending_review' || status === 'under_review') && 
          (currentData.approved_on || currentData.application?.approved_on)) {
        
        // Track the issue for reporting
        approvalDateIssues[status] = (approvalDateIssues[status] || 0) + 1;
        
        console.log(`🔍 Found ${status} record with approval date: ${profile.id}`);
        console.log(`   Current approved_on: "${currentData.approved_on}"`);
        
        // Clear approval date and related fields
        const updatedData = {
          ...currentData,
          approved_on: null,
          
          // Update application sub-object if it exists
          ...(currentData.application && {
            application: {
              ...currentData.application,
              approved_on: null
            }
          })
        };

        // Create transaction to update this profile
        if (!db.tx?.profiles) {
          throw new Error('db.tx.profiles is not available - check schema');
        }
        
        transactions.push(
          (db.tx as any).profiles[profile.id].update({
            data: updatedData,
            updatedAt: new Date().toISOString()
          })
        );
        updatedCount++;
      }

      // Process in batches to avoid overwhelming the system
      if (transactions.length >= 10) {
        await db.transact(transactions);
        console.log(`✅ Fixed ${updatedCount} profiles so far...`);
        transactions.length = 0; // Clear the array
        
        // Add delay between batches to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Process remaining transactions
    if (transactions.length > 0) {
      await db.transact(transactions);
    }

    console.log(`\n📋 Summary:`);
    console.log(`- Total profiles checked: ${result.profiles.length}`);
    console.log(`- Profiles fixed: ${updatedCount}`);
    
    console.log('\n📊 Application Status Distribution:');
    Object.entries(statusCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([status, count]) => {
        console.log(`   ${status}: ${count} records`);
      });
    
    if (Object.keys(approvalDateIssues).length > 0) {
      console.log('\n🚫 Approval date issues found:');
      Object.entries(approvalDateIssues)
        .sort(([,a], [,b]) => b - a)
        .forEach(([status, count]) => {
          console.log(`   ${status}: ${count} records had approval dates (now cleared)`);
        });
    } else {
      console.log('\n✅ No approval date issues found!');
    }

  } catch (error) {
    console.error('❌ Error fixing approval dates:', error);
  }
}

// Run the fix function
fixApprovalDates()
  .then(() => {
    console.log('✅ Approval date fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to fix approval dates:', error);
    process.exit(1);
  }); 