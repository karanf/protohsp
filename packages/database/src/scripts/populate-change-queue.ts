import * as dotenv from 'dotenv';

// Load environment variables from .env.local files BEFORE importing anything else
// Try common locations relative to the execution context
const possibleEnvPaths = [
  '/Users/karan/Documents/EGAB/packages/database/.env.local',
  './packages/database/.env.local',
  './.env.local',
  './apps/greenheart/.env.local',
  '../.env.local',
  '../../.env.local',
];

for (const envPath of possibleEnvPaths) {
  try {
    const result = dotenv.config({ path: envPath, override: true });
    if (result.parsed) {
      console.log(`✅ Loaded environment variables from: ${envPath}`);
      console.log(`🔍 Parsed variables:`, Object.keys(result.parsed));
      console.log(`🔍 Parsed content:`, result.parsed);
      
      // Explicitly set the environment variables if they were parsed
      if (result.parsed.NEXT_PUBLIC_INSTANT_APP_ID) {
        process.env.NEXT_PUBLIC_INSTANT_APP_ID = result.parsed.NEXT_PUBLIC_INSTANT_APP_ID;
        console.log(`🔑 Set NEXT_PUBLIC_INSTANT_APP_ID: ${result.parsed.NEXT_PUBLIC_INSTANT_APP_ID}`);
      }
      if (result.parsed.INSTANT_ADMIN_TOKEN) {
        process.env.INSTANT_ADMIN_TOKEN = result.parsed.INSTANT_ADMIN_TOKEN;
        console.log(`🔑 Set INSTANT_ADMIN_TOKEN: ${result.parsed.INSTANT_ADMIN_TOKEN.substring(0, 10)}...`);
      }
      
      // Debug: Check if the variables are actually set
      console.log(`🔍 NEXT_PUBLIC_INSTANT_APP_ID: ${process.env.NEXT_PUBLIC_INSTANT_APP_ID ? 'SET' : 'NOT SET'}`);
      console.log(`🔍 INSTANT_ADMIN_TOKEN: ${process.env.INSTANT_ADMIN_TOKEN ? 'SET' : 'NOT SET'}`);
      break;
    }
  } catch (error) {
    console.log(`❌ Failed to load from ${envPath}:`, error);
  }
}

import { v4 as uuidv4 } from 'uuid';

// Define the structure for change queue data that matches the InstantDB schema
interface ChangeQueueData {
  entityType: string;
  entityId: string;
  changeType: string;
  status: string;
  priority: string;
  requestedBy: string;
  requestData: {
    recordType: string;
    recordName: string;
    requestedByName: string;
    description: string;
    changeItems: Array<{
      id: string;
      fieldPath: string;
      fieldLabel: string;
      previousValue: string | null;
      newValue: string;
      changeType: string;
      isSevisRelated: boolean;
      status: string;
      comments: Array<{
        id: string;
        authorId: string;
        authorName: string;
        content: string;
        isInternal: boolean;
        createdAt: string;
      }>;
    }>;
    metadata: {
      source: string;
      urgencyReason?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// Sample field changes for students
const STUDENT_FIELD_CHANGES = [
  {
    fieldPath: 'data.address',
    fieldLabel: 'Address',
    examples: [
      { from: '123 Main Street, Springfield, IL 62701', to: '456 Oak Avenue, Madison, WI 53703' },
      { from: '789 Pine Road, Chicago, IL 60601', to: '321 Elm Street, Milwaukee, WI 53202' }
    ],
    isSevisRelated: true
  },
  {
    fieldPath: 'data.phone',
    fieldLabel: 'Phone Number',
    examples: [
      { from: '(555) 123-4567', to: '(555) 987-6543' },
      { from: '(312) 555-0123', to: '(414) 555-0987' }
    ],
    isSevisRelated: true
  },
  {
    fieldPath: 'data.program_end_date',
    fieldLabel: 'Program End Date',
    examples: [
      { from: '2024-06-15', to: '2024-12-20' },
      { from: '2024-05-30', to: '2024-11-30' }
    ],
    isSevisRelated: true
  },
  {
    fieldPath: 'data.host_family_id',
    fieldLabel: 'Host Family Assignment',
    examples: [
      { from: 'Johnson Family', to: 'Smith Family' },
      { from: 'Wilson Family', to: 'Brown Family' }
    ],
    isSevisRelated: true
  },
  {
    fieldPath: 'data.school_name',
    fieldLabel: 'School Assignment',
    examples: [
      { from: 'Lincoln High School', to: 'Roosevelt Academy' },
      { from: 'Washington High', to: 'Jefferson Secondary' }
    ],
    isSevisRelated: true
  },
  {
    fieldPath: 'data.emergency_contact',
    fieldLabel: 'Emergency Contact',
    examples: [
      { from: 'John Doe - (555) 111-2222', to: 'Jane Smith - (555) 333-4444' },
      { from: 'Maria Garcia - (555) 555-6666', to: 'David Wilson - (555) 777-8888' }
    ],
    isSevisRelated: false
  }
];

// Sample field changes for host families
const HOST_FAMILY_FIELD_CHANGES = [
  {
    fieldPath: 'data.primary_host.phone',
    fieldLabel: 'Primary Host Phone',
    examples: [
      { from: '(555) 111-2222', to: '(555) 333-4444' },
      { from: '(414) 555-1234', to: '(414) 555-5678' }
    ],
    isSevisRelated: false
  },
  {
    fieldPath: 'data.address',
    fieldLabel: 'Family Address',
    examples: [
      { from: '123 Family Lane, Springfield, IL', to: '456 Home Street, Springfield, IL' },
      { from: '789 Oak Drive, Madison, WI', to: '321 Pine Avenue, Madison, WI' }
    ],
    isSevisRelated: false
  },
  {
    fieldPath: 'data.family_members',
    fieldLabel: 'Family Composition',
    examples: [
      { from: '2 adults, 1 child', to: '2 adults, 2 children' },
      { from: '2 adults', to: '2 adults, 1 child' }
    ],
    isSevisRelated: false
  },
  {
    fieldPath: 'data.available_rooms',
    fieldLabel: 'Available Student Rooms',
    examples: [
      { from: '1 room available', to: '2 rooms available' },
      { from: '0 rooms available', to: '1 room available' }
    ],
    isSevisRelated: false
  },
  {
    fieldPath: 'data.secondary_host.occupation',
    fieldLabel: 'Secondary Host Occupation',
    examples: [
      { from: 'Teacher', to: 'Nurse' },
      { from: 'Engineer', to: 'Manager' }
    ],
    isSevisRelated: false
  }
];

// Sample users for requestedBy
const SAMPLE_USERS = [
  { id: 'user-1', name: 'Sarah Mitchell' },
  { id: 'user-2', name: 'David Rodriguez' },
  { id: 'user-3', name: 'Jennifer Chen' },
  { id: 'user-4', name: 'Michael Thompson' },
  { id: 'user-5', name: 'Emily Johnson' },
  { id: 'user-6', name: 'Robert Williams' },
  { id: 'user-7', name: 'Lisa Davis' },
  { id: 'user-8', name: 'James Garcia' },
  { id: 'user-9', name: 'Amanda Brown' },
  { id: 'user-10', name: 'Christopher Miller' }
];

function getRandomItem<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('Cannot get random item from empty array');
  }
  return array[Math.floor(Math.random() * array.length)]!;
}

function getRandomItems<T>(array: T[], min: number, max: number): T[] {
  if (array.length === 0) {
    return [];
  }
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateStudentChangeRequest(): ChangeQueueData {
  const studentNames = [
    'Emma Schmidt', 'Lukas Müller', 'Sofia Garcia', 'Yuki Tanaka', 'Wei Zhang',
    'Hans Weber', 'Anna Kowalski', 'Pierre Dubois', 'Sakura Yamamoto', 'Li Chen',
    'Marco Rossi', 'Ingrid Hansen', 'Carlos Mendez', 'Astrid Nielsen', 'Raj Patel'
  ];
  
  const recordName = getRandomItem(studentNames);
  const user = getRandomItem(SAMPLE_USERS);
  const priority = getRandomItem(['low', 'medium', 'high', 'urgent']);
  const status = getRandomItem(['pending', 'partially_approved', 'fully_approved']);
  
  // Generate 1-3 change items for this request
  const selectedChanges = getRandomItems(STUDENT_FIELD_CHANGES, 1, 3);
  const changeItems = selectedChanges.map(change => {
    const example = getRandomItem(change.examples);
    const itemStatus = Math.random() > 0.3 ? 'approved' : 'pending';
    
    return {
      id: uuidv4(),
      fieldPath: change.fieldPath,
      fieldLabel: change.fieldLabel,
      previousValue: example.from,
      newValue: example.to,
      changeType: 'update' as const,
      isSevisRelated: change.isSevisRelated,
      status: itemStatus,
      comments: Math.random() > 0.7 ? [{
        id: uuidv4(),
        authorId: user.id,
        authorName: user.name,
        content: getRandomItem([
          'Please verify this change with the student before approving.',
          'SEVIS deadline approaching - expedite review.',
          'Change approved and ready for SEVIS batch processing.',
          'Additional documentation required before approval.',
          'This change requires SEVIS notification within 10 days.'
        ]),
        isInternal: Math.random() > 0.5,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }] : []
    };
  });

  const hasSevisItems = changeItems.some(item => item.isSevisRelated);
  
  return {
    entityType: 'student',
    entityId: `student-${uuidv4()}`,
    changeType: 'profile_update',
    status,
    priority,
    requestedBy: user.id,
    requestData: {
      recordType: 'student',
      recordName,
      requestedByName: user.name,
      description: hasSevisItems 
        ? `SEVIS-related changes for ${recordName} - requires immediate attention`
        : `Profile updates for ${recordName}`,
      changeItems,
      metadata: {
        source: 'user_request',
        urgencyReason: hasSevisItems ? 'SEVIS deadline approaching' : undefined
      }
    },
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
  };
}

function generateHostFamilyChangeRequest(): ChangeQueueData {
  const familyNames = [
    'The Johnson Family', 'The Smith Family', 'The Wilson Family', 'The Brown Family',
    'The Davis Family', 'The Miller Family', 'The Garcia Family', 'The Martinez Family',
    'The Anderson Family', 'The Taylor Family', 'The Thomas Family', 'The White Family',
    'The Harris Family', 'The Martin Family', 'The Thompson Family'
  ];
  
  const recordName = getRandomItem(familyNames);
  const user = getRandomItem(SAMPLE_USERS);
  const priority = getRandomItem(['low', 'medium', 'high']);
  const status = getRandomItem(['pending', 'partially_approved', 'fully_approved']);
  
  // Generate 1-2 change items for host families
  const selectedChanges = getRandomItems(HOST_FAMILY_FIELD_CHANGES, 1, 2);
  const changeItems = selectedChanges.map(change => {
    const example = getRandomItem(change.examples);
    const itemStatus = Math.random() > 0.3 ? 'approved' : 'pending';
    
    return {
      id: uuidv4(),
      fieldPath: change.fieldPath,
      fieldLabel: change.fieldLabel,
      previousValue: example.from,
      newValue: example.to,
      changeType: 'update' as const,
      isSevisRelated: change.isSevisRelated,
      status: itemStatus,
      comments: Math.random() > 0.6 ? [{
        id: uuidv4(),
        authorId: user.id,
        authorName: user.name,
        content: getRandomItem([
          'Please coordinate with the host family before implementing.',
          'Verified with family - ready to approve.',
          'Documentation has been received and reviewed.',
          'Please confirm this change with the local coordinator.',
          'Family capacity update verified and approved.'
        ]),
        isInternal: Math.random() > 0.5,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }] : []
    };
  });
  
  return {
    entityType: 'host_family',
    entityId: `host-family-${uuidv4()}`,
    changeType: 'profile_update',
    status,
    priority,
    requestedBy: user.id,
    requestData: {
      recordType: 'host_family',
      recordName,
      requestedByName: user.name,
      description: `Host family information updates for ${recordName}`,
      changeItems,
      metadata: {
        source: 'coordinator_request'
      }
    },
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
  };
}

async function populateChangeQueue() {
  console.log('🚀 Populating change queue with 39 records...');
  
  // Dynamic import to ensure environment variables are loaded first
  const { adminDb } = await import('../client');
  
  if (!adminDb) {
    console.error('❌ AdminDB not available');
    return;
  }

  try {
    // Generate 39 records: 25 students (with successful SEVIS status) + 14 host families (active)
    const changeRequests: ChangeQueueData[] = [];
    
    // Generate 25 student change requests
    console.log('📚 Generating 25 student change requests...');
    for (let i = 0; i < 25; i++) {
      changeRequests.push(generateStudentChangeRequest());
    }
    
    // Generate 14 host family change requests  
    console.log('🏠 Generating 14 host family change requests...');
    for (let i = 0; i < 14; i++) {
      changeRequests.push(generateHostFamilyChangeRequest());
    }

    // Shuffle the array to mix students and host families
    changeRequests.sort(() => 0.5 - Math.random());

    console.log(`📊 Created ${changeRequests.length} change requests`);
    console.log(`   - Students: ${changeRequests.filter(r => r.entityType === 'student').length}`);
    console.log(`   - Host Families: ${changeRequests.filter(r => r.entityType === 'host_family').length}`);

    // Insert records in batches
    const batchSize = 10;
    let successCount = 0;
    
    for (let i = 0; i < changeRequests.length; i += batchSize) {
      const batch = changeRequests.slice(i, i + batchSize);
      console.log(`   Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(changeRequests.length / batchSize)}...`);

      try {
        const transactions = batch.map(request => {
          if (!adminDb?.tx?.changeQueue) {
            throw new Error('ChangeQueue transaction not available');
          }
          
          const newId = uuidv4();
          const changeQueueEntity = adminDb.tx.changeQueue[newId];
          
          if (!changeQueueEntity) {
            throw new Error('ChangeQueue entity not available');
          }

          // Transform the data to match InstantDB schema
          const instantDbData = {
            entityType: request.entityType,
            entityId: request.entityId,
            changeType: request.changeType,
            status: request.status,
            priority: request.priority,
            requestedBy: request.requestedBy,
            requestData: request.requestData,
            createdAt: request.createdAt,
            updatedAt: request.updatedAt
          };

          return changeQueueEntity.update(instantDbData);
        });

        await adminDb.transact(transactions);
        successCount += batch.length;
        console.log(`     ✅ Successfully created ${batch.length} records`);
        
      } catch (error) {
        console.error(`     ❌ Failed to create batch:`, error);
      }
    }

    console.log(`\n✅ Change queue population completed!`);
    console.log(`   - Successfully created: ${successCount} records`);
    console.log(`   - Failed: ${changeRequests.length - successCount} records`);
    
    // Display some statistics
    const pendingCount = changeRequests.filter(r => r.status === 'pending').length;
    const approvedCount = changeRequests.filter(r => r.status === 'fully_approved').length;
    const partialCount = changeRequests.filter(r => r.status === 'partially_approved').length;
    
    console.log(`\n📈 Status Distribution:`);
    console.log(`   - Pending: ${pendingCount}`);
    console.log(`   - Partially Approved: ${partialCount}`);
    console.log(`   - Fully Approved: ${approvedCount}`);
    
  } catch (error) {
    console.error('❌ Failed to populate change queue:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }
}

// Also create a function to clear the change queue if needed
async function clearChangeQueue() {
  console.log('🗑️  Clearing existing change queue records...');

  // Dynamic import to ensure environment variables are loaded first
  const { adminDb } = await import('../client');

  if (!adminDb) {
    console.error('❌ AdminDB not available');
    return;
  }

  try {
    // Query all existing change queue records
    const result = await adminDb.query({
      changeQueue: {}
    });

    if (!result?.changeQueue || result.changeQueue.length === 0) {
      console.log('No existing change queue records found.');
      return;
    }

    console.log(`Found ${result.changeQueue.length} existing records to delete.`);

    // Delete records in batches
    const batchSize = 20;
    let deletedCount = 0;
    
    for (let i = 0; i < result.changeQueue.length; i += batchSize) {
      const batch = result.changeQueue.slice(i, i + batchSize);
      console.log(`   Deleting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(result.changeQueue.length / batchSize)}...`);

      try {
        const transactions = batch.map(record => {
          if (!adminDb?.tx?.changeQueue) {
            throw new Error('ChangeQueue transaction not available');
          }
          
          const changeQueueEntity = adminDb.tx.changeQueue[record.id];
          if (!changeQueueEntity) {
            throw new Error(`ChangeQueue entity not found for ID: ${record.id}`);
          }
          
          return changeQueueEntity.delete();
        });

        await adminDb.transact(transactions);
        deletedCount += batch.length;
        console.log(`     ✅ Successfully deleted ${batch.length} records`);
        
      } catch (error) {
        console.error(`     ❌ Failed to delete batch:`, error);
      }
    }

    console.log(`\n✅ Cleanup completed! Deleted ${deletedCount} records.`);
    
  } catch (error) {
    console.error('❌ Failed to clear change queue:', error);
  }
}

export { populateChangeQueue, clearChangeQueue }; 