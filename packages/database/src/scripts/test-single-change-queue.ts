import { adminDb } from '../client';
import { v4 as uuidv4 } from 'uuid';

async function testSingleChangeQueue() {
  console.log('🧪 Testing single change queue entry...');

  if (!adminDb) {
    console.error('❌ AdminDB not available');
    return;
  }

  // Test with minimal but complete change queue data
  const testChangeQueueData = {
    entityType: 'student',
    entityId: 'test-student-id-123',
    changeType: 'update',
    status: 'pending',
    priority: 'high',
    requestedBy: 'test-user-id-456',
    requestData: {
      description: 'Test change request',
      fieldPath: 'data.first_name',
      fieldLabel: 'First Name',
      previousValue: 'John',
      newValue: 'Jane',
      metadata: { reason: 'Data correction' }
    },
    createdAt: new Date('2024-06-15T00:31:21.240Z'),
    updatedAt: new Date('2024-06-15T00:31:21.240Z'),
  };
  
  console.log('📋 Test change queue data:');
  console.log(JSON.stringify(testChangeQueueData, null, 2));

  try {
    if (!adminDb.tx?.changeQueue) {
      throw new Error('ChangeQueue transaction not available');
    }
    
    const newChangeId = uuidv4();
    console.log('🆔 Generated new change ID:', newChangeId);
    
    const changeQueueEntity = adminDb.tx.changeQueue[newChangeId];
    
    if (!changeQueueEntity) {
      throw new Error('ChangeQueue entity not available');
    }

    const updateTransaction = changeQueueEntity.update(testChangeQueueData);
    
    console.log('🔄 Executing transaction...');
    const result = await adminDb.transact([updateTransaction]);
    
    console.log('✅ Successfully created change queue entry!');
    console.log('📊 Transaction result:', result);
    
  } catch (error) {
    console.error('❌ Failed to create change queue entry:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }
}

// Run the test
testSingleChangeQueue().catch(console.error); 