// This script is deprecated - InstantDB migration complete
// Host family verification is now managed through InstantDB
// For reference, the equivalent operations would be:

const { init } = require('@instantdb/admin');
require('dotenv').config();

// InstantDB setup
const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID,
  adminToken: process.env.INSTANT_ADMIN_TOKEN,
});

async function updateHostFamilyVerificationInstantDB() {
  try {
    console.log('⚠️  This script is deprecated after InstantDB migration');
    console.log('Host family verification is now managed through InstantDB');
    console.log('To update host family verification, use the InstantDB admin interface or create a new migration script');
    
    // Example of how this would work with InstantDB:
    /*
    // Get all host family profiles
    const { profiles } = await db.query({
      profiles: {
        $: {
          where: { type: 'host_family' }
        }
      }
    });

    console.log('\nTotal host families:', profiles.length);

    // Calculate 80% to verify
    const numToVerify = Math.floor(profiles.length * 0.8);
    const familiesToVerify = profiles.slice(0, numToVerify);

    // Update verification status using transactions
    const transactions = [
      // First, reset all to unverified
      ...profiles.map(profile => 
        db.tx.profiles[profile.id].update({ verified: false })
      ),
      // Then verify 80%
      ...familiesToVerify.map(profile => 
        db.tx.profiles[profile.id].update({ verified: true })
      )
    ];

    await db.transact(transactions);

    console.log(`Successfully marked ${numToVerify} host families as verified`);
    */
    
    return;
  } catch (error) {
    console.error('Error updating host family verification:', error);
  }
}

updateHostFamilyVerificationInstantDB(); 