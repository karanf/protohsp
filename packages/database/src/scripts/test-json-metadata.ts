import { adminDb } from '../client';
import { v4 as uuidv4 } from 'uuid';

async function testJsonMetadata() {
  if (!adminDb) {
    console.error('❌ AdminDB not available');
    return;
  }

  console.log('🧪 Testing JSON metadata field with InstantDB...');
  
  // Test with JSON metadata as defined in our schema: i.json().optional()
  const testUserWithMetadata = {
    email: 'json-test@example.com',
    role: 'student',
    firstName: 'JSON',
    lastName: 'Test',
    status: 'active',
    metadata: {
      country: 'Germany',
      preferences: {
        theme: 'dark',
        notifications: true
      },
      tags: ['student', 'exchange'],
      scores: [85, 92, 78]
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  console.log('📋 Test user with JSON metadata:');
  console.log(JSON.stringify(testUserWithMetadata, null, 2));

  try {
    if (!adminDb.tx?.users) {
      throw new Error('Users transaction not available');
    }
    
    const userId = uuidv4();
    console.log('🆔 Generated UUID:', userId);
    
    const userEntity = adminDb.tx.users[userId];
    if (!userEntity) {
      throw new Error('User entity not found');
    }
    
    const transaction = userEntity.update(testUserWithMetadata);
    await adminDb.transact([transaction]);
    console.log('✅ User with JSON metadata uploaded successfully!');
    
    // Test with avatarUrl too
    console.log('\n🧪 Testing avatarUrl field...');
    const testUserWithAvatar = {
      email: 'avatar-test@example.com',
      role: 'student',
      firstName: 'Avatar',
      lastName: 'Test',
      status: 'active',
      avatarUrl: 'https://ui-avatars.com/api/?name=Avatar%20Test',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const avatarUserId = uuidv4();
    const avatarUserEntity = adminDb.tx.users[avatarUserId];
    if (!avatarUserEntity) {
      throw new Error('Avatar user entity not found');
    }
    
    const avatarTransaction = avatarUserEntity.update(testUserWithAvatar);
    await adminDb.transact([avatarTransaction]);
    console.log('✅ User with avatarUrl uploaded successfully!');
    
    // Test with both fields together
    console.log('\n🧪 Testing both JSON metadata and avatarUrl...');
    const testUserWithBoth = {
      email: 'both-test@example.com',
      role: 'student',
      firstName: 'Both',
      lastName: 'Test',
      status: 'active',
      avatarUrl: 'https://ui-avatars.com/api/?name=Both%20Test',
      metadata: {
        country: 'France',
        testField: 'success'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const bothUserId = uuidv4();
    const bothUserEntity = adminDb.tx.users[bothUserId];
    if (!bothUserEntity) {
      throw new Error('Both user entity not found');
    }
    
    const bothTransaction = bothUserEntity.update(testUserWithBoth);
    await adminDb.transact([bothTransaction]);
    console.log('✅ User with both JSON metadata and avatarUrl uploaded successfully!');
    
    console.log('\n🎯 If this test passes, the fields are properly defined in your deployed schema!');
    
  } catch (error: any) {
    console.error('❌ Test failed:', error);
    if (error?.body) {
      console.error('Error details:', JSON.stringify(error.body, null, 2));
      
      if (error.body.hint?.errors) {
        const missingFields = error.body.hint.errors
          .filter((err: any) => err.message === "Attributes are missing in your schema")
          .flatMap((err: any) => err.hint.attributes || []);
          
        if (missingFields.length > 0) {
          console.log('\n📋 Missing fields from deployed schema:');
          missingFields.forEach((field: string) => console.log(`  - ${field}`));
          console.log('\n💡 These fields need to be added to your InstantDB dashboard schema.');
        }
      }
    }
  }
}

testJsonMetadata(); 