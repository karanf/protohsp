import { adminDb } from '../client';
import { v4 as uuidv4 } from 'uuid';

async function testProblematicFields() {
  if (!adminDb) {
    console.error('❌ AdminDB not available');
    return;
  }

  const baseUserData = {
    email: 'test-fields@example.com',
    role: 'student',
    firstName: 'Test',
    lastName: 'User',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  try {
    // Test 1: avatarUrl field
    console.log('🧪 Testing avatarUrl field...');
    const userWithAvatar = { 
      ...baseUserData, 
      email: 'test-avatar@example.com',
      avatarUrl: 'https://ui-avatars.com/api/?name=Test%20User'
    };
    
    const avatarUserId = uuidv4();
    const avatarUserEntity = adminDb.tx.users[avatarUserId];
    if (!avatarUserEntity) {
      throw new Error('Avatar user entity not found');
    }
    const avatarTransaction = avatarUserEntity.update(userWithAvatar);
    await adminDb.transact([avatarTransaction]);
    console.log('✅ User with avatarUrl uploaded successfully!');
    
  } catch (error: any) {
    console.error('❌ avatarUrl test failed:', error?.body || error?.message);
  }

  try {
    // Test 2: metadata field
    console.log('\n🧪 Testing metadata field...');
    const userWithMetadata = { 
      ...baseUserData, 
      email: 'test-metadata@example.com',
      metadata: { country: 'Germany' }
    };
    
    const metadataUserId = uuidv4();
    const metadataUserEntity = adminDb.tx.users[metadataUserId];
    if (!metadataUserEntity) {
      throw new Error('Metadata user entity not found');
    }
    const metadataTransaction = metadataUserEntity.update(userWithMetadata);
    await adminDb.transact([metadataTransaction]);
    console.log('✅ User with metadata uploaded successfully!');
    
  } catch (error: any) {
    console.error('❌ metadata test failed:', error?.body || error?.message);
  }

  try {
    // Test 3: both problematic fields together
    console.log('\n🧪 Testing both avatarUrl and metadata...');
    const userWithBoth = { 
      ...baseUserData, 
      email: 'test-both@example.com',
      avatarUrl: 'https://ui-avatars.com/api/?name=Test%20Both',
      metadata: { country: 'Germany', testField: true }
    };
    
    const bothUserId = uuidv4();
    const bothUserEntity = adminDb.tx.users[bothUserId];
    if (!bothUserEntity) {
      throw new Error('Both user entity not found');
    }
    const bothTransaction = bothUserEntity.update(userWithBoth);
    await adminDb.transact([bothTransaction]);
    console.log('✅ User with both fields uploaded successfully!');
    
  } catch (error: any) {
    console.error('❌ Both fields test failed:', error?.body || error?.message);
    if (error?.body?.hint) {
      console.log('Schema validation errors:', JSON.stringify(error.body.hint, null, 2));
    }
  }
}

testProblematicFields(); 