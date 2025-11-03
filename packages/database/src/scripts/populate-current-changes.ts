import { init } from '@instantdb/admin';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

const db = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

// SEVIS types that should have current changes (excluding "New Student")
const SEVIS_TYPES_WITH_CHANGES = [
  'Validation - Housing',
  'Validation - Site of Activity',
  'Payment',
  'Bio',
  'Update - Housing',
  'Update - Site of Activity',
  'Program Date',
  'Program Extension',
  'Program Shorten',
  'Reprint',
  'Status End',
  'Status Invalid',
  'Status Terminate',
  'Update - Edit Subject',
  'Financial Info'
];

// Field mappings for different SEVIS types
const SEVIS_TYPE_FIELDS: Record<string, Array<{fieldPath: string; fieldLabel: string; isSevisRelated: boolean}>> = {
  'Validation - Housing': [
    { fieldPath: 'data.address', fieldLabel: 'Address', isSevisRelated: true },
    { fieldPath: 'data.city', fieldLabel: 'City', isSevisRelated: true },
    { fieldPath: 'data.state', fieldLabel: 'State', isSevisRelated: true },
    { fieldPath: 'data.zip_code', fieldLabel: 'ZIP Code', isSevisRelated: true },
    { fieldPath: 'data.host_family_id', fieldLabel: 'Host Family Assignment', isSevisRelated: true }
  ],
  'Validation - Site of Activity': [
    { fieldPath: 'data.school_name', fieldLabel: 'School Name', isSevisRelated: true },
    { fieldPath: 'data.school_address', fieldLabel: 'School Address', isSevisRelated: true },
    { fieldPath: 'data.school_city', fieldLabel: 'School City', isSevisRelated: true },
    { fieldPath: 'data.school_state', fieldLabel: 'School State', isSevisRelated: true },
    { fieldPath: 'data.grade_level', fieldLabel: 'Grade Level', isSevisRelated: true }
  ],
  'Update - Housing': [
    { fieldPath: 'data.address', fieldLabel: 'Address', isSevisRelated: true },
    { fieldPath: 'data.city', fieldLabel: 'City', isSevisRelated: true },
    { fieldPath: 'data.state', fieldLabel: 'State', isSevisRelated: true },
    { fieldPath: 'data.zip_code', fieldLabel: 'ZIP Code', isSevisRelated: true },
    { fieldPath: 'data.host_family_id', fieldLabel: 'Host Family Assignment', isSevisRelated: true }
  ],
  'Update - Site of Activity': [
    { fieldPath: 'data.school_name', fieldLabel: 'School Name', isSevisRelated: true },
    { fieldPath: 'data.school_address', fieldLabel: 'School Address', isSevisRelated: true },
    { fieldPath: 'data.school_city', fieldLabel: 'School City', isSevisRelated: true },
    { fieldPath: 'data.school_state', fieldLabel: 'School State', isSevisRelated: true },
    { fieldPath: 'data.grade_level', fieldLabel: 'Grade Level', isSevisRelated: true }
  ],
  'Program Date': [
    { fieldPath: 'data.program_start_date', fieldLabel: 'Program Start Date', isSevisRelated: true },
    { fieldPath: 'data.program_end_date', fieldLabel: 'Program End Date', isSevisRelated: true },
    { fieldPath: 'data.arrival_date', fieldLabel: 'Arrival Date', isSevisRelated: true },
    { fieldPath: 'data.departure_date', fieldLabel: 'Departure Date', isSevisRelated: true }
  ],
  'Program Extension': [
    { fieldPath: 'data.program_end_date', fieldLabel: 'Program End Date', isSevisRelated: true },
    { fieldPath: 'data.departure_date', fieldLabel: 'Departure Date', isSevisRelated: true },
    { fieldPath: 'data.extension_reason', fieldLabel: 'Extension Reason', isSevisRelated: true }
  ],
  'Program Shorten': [
    { fieldPath: 'data.program_end_date', fieldLabel: 'Program End Date', isSevisRelated: true },
    { fieldPath: 'data.departure_date', fieldLabel: 'Departure Date', isSevisRelated: true },
    { fieldPath: 'data.shorten_reason', fieldLabel: 'Shorten Reason', isSevisRelated: true }
  ],
  'Bio': [
    { fieldPath: 'data.first_name', fieldLabel: 'First Name', isSevisRelated: true },
    { fieldPath: 'data.last_name', fieldLabel: 'Last Name', isSevisRelated: true },
    { fieldPath: 'data.date_of_birth', fieldLabel: 'Date of Birth', isSevisRelated: true },
    { fieldPath: 'data.gender', fieldLabel: 'Gender', isSevisRelated: true },
    { fieldPath: 'data.country_of_origin', fieldLabel: 'Country of Origin', isSevisRelated: true }
  ],
  'Payment': [
    { fieldPath: 'data.payment_status', fieldLabel: 'Payment Status', isSevisRelated: true },
    { fieldPath: 'data.payment_amount', fieldLabel: 'Payment Amount', isSevisRelated: true },
    { fieldPath: 'data.payment_method', fieldLabel: 'Payment Method', isSevisRelated: true }
  ],
  'Financial Info': [
    { fieldPath: 'data.financial_guarantee', fieldLabel: 'Financial Guarantee', isSevisRelated: true },
    { fieldPath: 'data.sponsor_name', fieldLabel: 'Sponsor Name', isSevisRelated: true },
    { fieldPath: 'data.sponsor_contact', fieldLabel: 'Sponsor Contact', isSevisRelated: true }
  ],
  'Status End': [
    { fieldPath: 'data.program_status', fieldLabel: 'Program Status', isSevisRelated: true },
    { fieldPath: 'data.end_reason', fieldLabel: 'End Reason', isSevisRelated: true },
    { fieldPath: 'data.end_date', fieldLabel: 'End Date', isSevisRelated: true }
  ],
  'Status Invalid': [
    { fieldPath: 'data.program_status', fieldLabel: 'Program Status', isSevisRelated: true },
    { fieldPath: 'data.invalid_reason', fieldLabel: 'Invalid Reason', isSevisRelated: true },
    { fieldPath: 'data.invalid_date', fieldLabel: 'Invalid Date', isSevisRelated: true }
  ],
  'Status Terminate': [
    { fieldPath: 'data.program_status', fieldLabel: 'Program Status', isSevisRelated: true },
    { fieldPath: 'data.termination_reason', fieldLabel: 'Termination Reason', isSevisRelated: true },
    { fieldPath: 'data.termination_date', fieldLabel: 'Termination Date', isSevisRelated: true }
  ],
  'Update - Edit Subject': [
    { fieldPath: 'data.academic_program', fieldLabel: 'Academic Program', isSevisRelated: true },
    { fieldPath: 'data.course_of_study', fieldLabel: 'Course of Study', isSevisRelated: true },
    { fieldPath: 'data.academic_level', fieldLabel: 'Academic Level', isSevisRelated: true }
  ],
  'Reprint': [
    { fieldPath: 'data.reprint_reason', fieldLabel: 'Reprint Reason', isSevisRelated: true },
    { fieldPath: 'data.document_type', fieldLabel: 'Document Type', isSevisRelated: true }
  ]
};

// Mock data generators
const generateMockValue = (fieldPath: string, isAddress: boolean = false) => {
  const fieldName = fieldPath.split('.').pop() || '';
  
  if (isAddress) {
    const addresses = [
      '123 Main Street',
      '456 Oak Avenue', 
      '789 Pine Road',
      '321 Elm Street',
      '654 Maple Drive'
    ];
    return addresses[Math.floor(Math.random() * addresses.length)];
  }
  
  switch (fieldName) {
    case 'first_name':
      return ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa'][Math.floor(Math.random() * 8)];
    case 'last_name':
      return ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'][Math.floor(Math.random() * 8)];
    case 'city':
      return ['Springfield', 'Madison', 'Austin', 'Portland', 'Denver', 'Seattle', 'Boston', 'Chicago'][Math.floor(Math.random() * 8)];
    case 'state':
      return ['IL', 'WI', 'TX', 'OR', 'CO', 'WA', 'MA', 'IL'][Math.floor(Math.random() * 8)];
    case 'zip_code':
      return `${Math.floor(Math.random() * 90000) + 10000}`;
    case 'school_name':
      return ['Springfield High School', 'Madison Central High', 'Austin Academy', 'Portland Prep', 'Denver High School'][Math.floor(Math.random() * 5)];
    case 'grade_level':
      return ['9th', '10th', '11th', '12th'][Math.floor(Math.random() * 4)];
    case 'date_of_birth':
      return `200${5 + Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
    case 'gender':
      return ['Male', 'Female'][Math.floor(Math.random() * 2)];
    case 'country_of_origin':
      return ['Brazil', 'Germany', 'Japan', 'Spain', 'France', 'Italy', 'China', 'South Korea'][Math.floor(Math.random() * 8)];
    case 'payment_status':
      return ['Pending', 'Paid', 'Overdue'][Math.floor(Math.random() * 3)];
    case 'payment_amount':
      return `$${Math.floor(Math.random() * 5000) + 1000}`;
    case 'program_status':
      return ['Active', 'Completed', 'Terminated'][Math.floor(Math.random() * 3)];
    default:
      return `Sample ${fieldName.replace(/_/g, ' ')}`;
  }
};

const generateChangeItem = (field: {fieldPath: string; fieldLabel: string; isSevisRelated: boolean}, sevisType: string, isFailed: boolean = false) => {
  const previousValue = generateMockValue(field.fieldPath, field.fieldPath.includes('address'));
  const newValue = generateMockValue(field.fieldPath, field.fieldPath.includes('address'));
  
  return {
    id: uuidv4(),
    fieldPath: field.fieldPath,
    fieldLabel: field.fieldLabel,
    previousValue: previousValue,
    newValue: newValue,
    changeType: 'update',
    isSevisRelated: field.isSevisRelated,
    status: 'pending',
    requestedBy: 'system',
    requesterName: 'System',
    requesterRole: 'admin',
    requestDate: new Date().toISOString(),
    // For failed changes, add correction field
    ...(isFailed && {
      correction: '',
      errorMessage: 'SEVIS validation failed - please correct the data',
      severity: 'error'
    }),
    // Action fields
    action: 'Undecided',
    onHold: false,
    comments: []
  };
};

async function populateCurrentChanges() {
  try {
    console.log('🔄 Populating current changes for non-New Student types...\n');
    
    // Get all student profiles
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

    const profiles = result.profiles;
    console.log(`📊 Found ${profiles.length} total student profiles`);

    // Filter for non-New Student types
    const eligibleProfiles = profiles.filter((profile: any) => {
      const profileData = profile.data;
      if (!profileData) return false;
      
      let sevisType = 'New Student';
      if (profileData?.sevis_processing_type && typeof profileData.sevis_processing_type === 'string') {
        sevisType = profileData.sevis_processing_type;
      } else if (profileData?.changeType && typeof profileData.changeType === 'string') {
        sevisType = profileData.changeType;
      }
      
      return SEVIS_TYPES_WITH_CHANGES.includes(sevisType);
    });

    console.log(`📋 Found ${eligibleProfiles.length} eligible profiles (non-New Student types)`);

    // Clear existing change queue data
    console.log('🗑️  Clearing existing change queue data...');
    const existingData = await db.query({
      changeQueue: {}
    });

    if (existingData.changeQueue && existingData.changeQueue.length > 0) {
      const deletePromises = existingData.changeQueue.map((record: any) => {
        const changeQueueEntity = db.tx.changeQueue![record.id];
        if (!changeQueueEntity) {
          throw new Error(`ChangeQueue entity not found for ID: ${record.id}`);
        }
        return db.transact([changeQueueEntity.delete()]);
      });
      
      await Promise.all(deletePromises);
      console.log('✅ Existing data cleared');
    }

    // Generate change requests for eligible profiles
    const changeRequests = [];
    let totalChangeItems = 0;

    for (const profile of eligibleProfiles) {
      const profileData = profile.data;
      let sevisType = 'New Student';
      
      if (profileData?.sevis_processing_type && typeof profileData.sevis_processing_type === 'string') {
        sevisType = profileData.sevis_processing_type;
      } else if (profileData?.changeType && typeof profileData.changeType === 'string') {
        sevisType = profileData.changeType;
      }

      // Get fields for this SEVIS type
      const fields = SEVIS_TYPE_FIELDS[sevisType] || [];
      if (fields.length === 0) continue;

      // Determine if this should be a failed change (20% chance)
      const isFailed = Math.random() < 0.2;

      // Generate change items
      const changeItems = fields.map(field => generateChangeItem(field, sevisType, isFailed));
      totalChangeItems += changeItems.length;

      // Create change request
      const changeRequest = {
        id: uuidv4(),
        entityType: 'student',
        entityId: profile.id,
        changeType: sevisType,
        status: 'pending',
        priority: isFailed ? 'high' : 'medium',
        requestedBy: 'system',
        assignedTo: null,
        requestData: {
          recordType: 'student',
          recordId: profile.id,
          recordName: `${profileData?.first_name || 'Unknown'} ${profileData?.last_name || 'Student'}`,
          requestedByName: 'System',
          description: `${sevisType} change request for student`,
          changeItems: changeItems,
          metadata: {
            source: 'system',
            sevisType: sevisType,
            isFailed: isFailed,
            urgencyReason: isFailed ? 'SEVIS validation failed' : null
          }
        },
        responseData: null,
        notes: null,
        dueDate: null,
        completedDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      changeRequests.push(changeRequest);
    }

    console.log(`📝 Generated ${changeRequests.length} change requests with ${totalChangeItems} total change items`);

    // Add change requests to InstantDB
    console.log('🔄 Adding change requests to InstantDB...');
    
    const addPromises = changeRequests.map(request => {
      const changeQueueEntity = db.tx.changeQueue![request.id];
      if (!changeQueueEntity) {
        throw new Error(`ChangeQueue entity not found for ID: ${request.id}`);
      }
      return db.transact([changeQueueEntity.update(request)]);
    });

    await Promise.all(addPromises);

    console.log('✅ Current changes populated successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Total change requests: ${changeRequests.length}`);
    console.log(`   - Total change items: ${totalChangeItems}`);
    
    // Show breakdown by SEVIS type
    const typeBreakdown = changeRequests.reduce((acc: Record<string, number>, request: any) => {
      const type = request.changeType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📈 Breakdown by SEVIS type:');
    Object.entries(typeBreakdown)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`   - ${type}: ${count} requests`);
      });

    // Show failed vs successful
    const failedCount = changeRequests.filter((r: any) => r.requestData.metadata.isFailed).length;
    const successfulCount = changeRequests.length - failedCount;
    
    console.log('\n📊 Change Status:');
    console.log(`   - Failed changes: ${failedCount}`);
    console.log(`   - Successful changes: ${successfulCount}`);

    console.log('\n✅ Current changes population completed successfully!');

  } catch (error) {
    console.error('❌ Error populating current changes:', error);
    throw error;
  }
}

populateCurrentChanges()
  .then(() => {
    console.log('🎉 Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 