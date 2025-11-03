import { adminDb } from '../client';
import { v4 as uuidv4 } from 'uuid';

async function testMinimalUser() {
  if (!adminDb) {
    console.error('❌ AdminDB not available');
    return;
  }

  // Test with minimal required fields only
  const minimalUserData = {
    email: 'test-minimal@example.com',
    role: 'student',
    firstName: 'Test',
    lastName: 'User',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  console.log('🧪 Testing minimal user data...');
  console.log('📋 Minimal user data:');
  console.log(JSON.stringify(minimalUserData, null, 2));

  try {
    if (!adminDb.tx?.users) {
      throw new Error('Users transaction not available');
    }
    
    const newUserId = uuidv4();
    console.log('🆔 Generated UUID:', newUserId);
    
    const userEntity = adminDb.tx.users[newUserId];
    if (!userEntity) {
      throw new Error(`User entity not found for ID: ${newUserId}`);
    }
    
    const userTransaction = userEntity.update(minimalUserData);
    if (!userTransaction) {
      throw new Error('Failed to create user transaction');
    }
    
    await adminDb.transact([userTransaction]);
    console.log('✅ Minimal user data uploaded successfully!');
    
    // Now try adding optional fields one by one
    console.log('\n🧪 Testing with phone field...');
    const userWithPhone = { ...minimalUserData, phone: '123-456-7890' };
    const phoneUserId = uuidv4();
    const phoneUserEntity = adminDb.tx.users[phoneUserId];
    const phoneTransaction = phoneUserEntity.update(userWithPhone);
    await adminDb.transact([phoneTransaction]);
    console.log('✅ User with phone uploaded successfully!');
    
  } catch (error: any) {
    console.error('❌ Test failed:', error);
    if (error?.body) {
      console.error('Error details:', JSON.stringify(error.body, null, 2));
    }
  }
}

testMinimalUser(); 