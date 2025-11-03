import { adminDb } from '../client';
import { v4 as uuidv4 } from 'uuid';

async function testCreateUserRecord() {
  if (!adminDb) {
    console.error('❌ AdminDB not available');
    return;
  }

  // Test with a very simple user record that matches the schema
  const testUser = {
    email: 'test@example.com',
    role: 'student',
    firstName: 'Test',
    lastName: 'User',
    phone: '+1234567890',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  console.log('🧪 Testing create user record (let InstantDB generate ID)...');
  console.log('Test data:', JSON.stringify(testUser, null, 2));

  try {
    if (!adminDb.tx?.users) {
      throw new Error('Users transaction not available');
    }
    
    // Let InstantDB generate the ID - use UUID
    const generatedId = uuidv4();
    console.log('Generated UUID:', generatedId);
    
    const userEntity = adminDb.tx.users[generatedId];
    if (!userEntity) {
      throw new Error(`User entity not found for ID: ${generatedId}`);
    }
    
    const userTransaction = userEntity.update(testUser);
    if (!userTransaction) {
      throw new Error('Failed to create user transaction');
    }
    
    await adminDb.transact([userTransaction]);
    console.log('✅ Test user record created successfully with ID:', generatedId);
    
  } catch (error: any) {
    console.error('❌ Test failed:', error);
    if (error?.body) {
      console.error('Error details:', JSON.stringify(error.body, null, 2));
    }
  }
}

async function main() {
  console.log('🚀 Testing record creation with generated UUIDs...\n');
  await testCreateUserRecord();
}

main().catch(console.error); 