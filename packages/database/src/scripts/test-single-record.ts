import { adminDb } from '../client';

async function testSingleUserRecord() {
  if (!adminDb) {
    console.error('❌ AdminDB not available');
    return;
  }

  // Test with a very simple user record that matches the schema
  // Remove 'id' from the data - InstantDB handles this automatically
  const testUser = {
    email: 'test@example.com',
    role: 'student',
    firstName: 'Test',
    lastName: 'User',
    phone: '+1234567890',
    avatarUrl: null,
    status: 'active',
    metadata: null,
    lastSignIn: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  console.log('🧪 Testing single user record...');
  console.log('Test data:', JSON.stringify(testUser, null, 2));

  try {
    if (!adminDb.tx?.users) {
      throw new Error('Users transaction not available');
    }
    
    // Use a lookup reference pattern for InstantDB
    const testUserId = 'test-user-123';
    const userEntity = adminDb.tx.users[testUserId];
    if (!userEntity) {
      throw new Error(`User entity not found for ID: ${testUserId}`);
    }
    
    const userTransaction = userEntity.update(testUser); // Don't include 'id' in the data
    if (!userTransaction) {
      throw new Error('Failed to create user transaction');
    }
    
    await adminDb.transact([userTransaction]);
    console.log('✅ Test user record uploaded successfully!');
    
  } catch (error: any) {
    console.error('❌ Test failed:', error);
    if (error?.body) {
      console.error('Error details:', JSON.stringify(error.body, null, 2));
    }
  }
}

// Test profile record 
async function testSingleProfileRecord() {
  if (!adminDb) {
    console.error('❌ AdminDB not available');
    return;
  }

  const testProfile = {
    userId: 'test-user-123',
    type: 'student',
    data: { 
      firstName: 'Test',
      lastName: 'User',
      grade: '11',
      interests: ['sports', 'music']
    },
    status: 'active',
    verified: false,
    verificationDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  console.log('🧪 Testing single profile record...');
  console.log('Test data:', JSON.stringify(testProfile, null, 2));

  try {
    if (!adminDb.tx?.profiles) {
      throw new Error('Profiles transaction not available');
    }
    
    const testProfileId = 'test-profile-123';
    const profileEntity = adminDb.tx.profiles[testProfileId];
    if (!profileEntity) {
      throw new Error(`Profile entity not found for ID: ${testProfileId}`);
    }
    
    const profileTransaction = profileEntity.update(testProfile); // Don't include 'id' in the data
    if (!profileTransaction) {
      throw new Error('Failed to create profile transaction');
    }
    
    await adminDb.transact([profileTransaction]);
    console.log('✅ Test profile record uploaded successfully!');
    
  } catch (error: any) {
    console.error('❌ Test failed:', error);
    if (error?.body) {
      console.error('Error details:', JSON.stringify(error.body, null, 2));
    }
  }
}

async function main() {
  console.log('🚀 Testing single records to debug validation issues...\n');
  
  await testSingleUserRecord();
  console.log('\n' + '='.repeat(50) + '\n');
  await testSingleProfileRecord();
}

main().catch(console.error); 