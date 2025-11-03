/**
 * Change Queue Mock Data Generator
 * 
 * This script generates realistic mock data for the change queue system:
 * - Change requests for students, host families, and local coordinators
 * - Individual change items with previous/new values
 * - Comments on changes
 * - SEVIS batches and batch items
 * 
 * UUID Handling:
 * - UUIDs are generated using faker.string.uuid() (consistent with existing mock data)
 * - In TypeScript, UUIDs are typed as strings (as seen in generated.ts)
 * - In PostgreSQL, they're stored as UUID type with uuid_generate_v4() default
 * - Foreign key constraints are disabled in the schema for testing with mock UUIDs
 * - For production, enable the foreign key constraints in the schema
 */

const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');

// Configuration
const NUM_CHANGE_REQUESTS = 50;
const NUM_SEVIS_BATCHES = 5;

// Utilities
const generateId = () => faker.string.uuid(); // Consistent with existing mock data approach
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomItems = (arr, min = 1, max = 3) => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const result = [];
  const copy = [...arr];
  for (let i = 0; i < count; i++) {
    if (copy.length === 0) break;
    const index = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(index, 1)[0]);
  }
  return result;
};

// Mock existing profile IDs (these would come from your existing data)
// In production, you would query these from your actual profiles and users tables
const MOCK_PROFILE_IDS = {
  students: Array.from({ length: 100 }, () => generateId()),
  host_families: Array.from({ length: 50 }, () => generateId()),
  coordinators: Array.from({ length: 20 }, () => generateId())
};

const MOCK_USER_IDS = Array.from({ length: 20 }, () => generateId());

// Sample data for generating realistic changes
const SAMPLE_DATA = {
  names: ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa'],
  lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'],
  addresses: [
    '123 Main Street, Springfield, IL 62701',
    '456 Oak Avenue, Madison, WI 53703',
    '789 Pine Road, Austin, TX 73301',
    '321 Elm Street, Portland, OR 97201',
    '654 Maple Drive, Denver, CO 80202'
  ],
  phones: [
    '(555) 123-4567',
    '(555) 234-5678',
    '(555) 345-6789',
    '(555) 456-7890',
    '(555) 567-8901'
  ],
  emails: [
    'john.doe@email.com',
    'jane.smith@email.com',
    'michael.brown@email.com',
    'sarah.wilson@email.com'
  ],
  schools: [
    'Springfield High School',
    'Madison Central High',
    'Austin Academy',
    'Portland Prep',
    'Denver High School'
  ]
};

// Generate realistic user names for mock data
const MOCK_USER_NAMES = MOCK_USER_IDS.map(() => 
  `${randomItem(SAMPLE_DATA.names)} ${randomItem(SAMPLE_DATA.lastNames)}`
);

// Create a mapping of user IDs to names
const USER_ID_TO_NAME = Object.fromEntries(
  MOCK_USER_IDS.map((id, index) => [id, MOCK_USER_NAMES[index]])
);

// SEVIS-related fields for students
const SEVIS_FIELDS = {
  // Personal Information
  'data.first_name': { label: 'First Name', mapping: 'student.personal.firstName' },
  'data.last_name': { label: 'Last Name', mapping: 'student.personal.lastName' },
  'data.date_of_birth': { label: 'Date of Birth', mapping: 'student.personal.dateOfBirth' },
  'data.address': { label: 'Address', mapping: 'student.address.street' },
  'data.city': { label: 'City', mapping: 'student.address.city' },
  'data.state': { label: 'State', mapping: 'student.address.state' },
  'data.zip_code': { label: 'ZIP Code', mapping: 'student.address.zipCode' },
  'data.phone': { label: 'Phone Number', mapping: 'student.contact.phone' },
  'data.email': { label: 'Email', mapping: 'student.contact.email' },
  
  // Program Information
  'data.program_start_date': { label: 'Program Start Date', mapping: 'program.startDate' },
  'data.program_end_date': { label: 'Program End Date', mapping: 'program.endDate' },
  'data.school_name': { label: 'School Name', mapping: 'program.school.name' },
  'data.grade_level': { label: 'Grade Level', mapping: 'program.school.grade' },
  
  // Host Family Assignment
  'data.host_family_id': { label: 'Host Family Assignment', mapping: 'placement.hostFamily' },
  'data.coordinator_id': { label: 'Local Coordinator Assignment', mapping: 'placement.coordinator' },
  
  // Insurance and Travel
  'data.insurance_provider': { label: 'Insurance Provider', mapping: 'insurance.provider' },
  'data.insurance_policy': { label: 'Insurance Policy Number', mapping: 'insurance.policyNumber' },
  'data.arrival_date': { label: 'Arrival Date', mapping: 'travel.arrivalDate' },
  'data.departure_date': { label: 'Departure Date', mapping: 'travel.departureDate' }
};

// Non-SEVIS fields for all record types
const CHANGE_FIELDS = {
  student: {
    // Non-SEVIS student fields
    'data.emergency_contact_name': { label: 'Emergency Contact Name', sevis: false },
    'data.emergency_contact_phone': { label: 'Emergency Contact Phone', sevis: false },
    'data.dietary_restrictions': { label: 'Dietary Restrictions', sevis: false },
    'data.medical_conditions': { label: 'Medical Conditions', sevis: false },
    'data.medications': { label: 'Medications', sevis: false },
    'data.hobbies': { label: 'Hobbies and Interests', sevis: false },
    'data.favorite_activities': { label: 'Favorite Activities', sevis: false },
    'data.bio': { label: 'Student Biography', sevis: false },
    
    // SEVIS fields
    ...Object.fromEntries(
      Object.entries(SEVIS_FIELDS).map(([key, value]) => [key, { ...value, sevis: true }])
    )
  },
  
  host_family: {
    'data.family_name': { label: 'Family Name', sevis: false },
    'data.address': { label: 'Address', sevis: false },
    'data.phone_home': { label: 'Home Phone', sevis: false },
    'data.phone_cell': { label: 'Cell Phone', sevis: false },
    'data.email_primary': { label: 'Primary Email', sevis: false },
    'data.email_secondary': { label: 'Secondary Email', sevis: false },
    'data.primary_host.first_name': { label: 'Host Father First Name', sevis: false },
    'data.primary_host.last_name': { label: 'Host Father Last Name', sevis: false },
    'data.primary_host.occupation': { label: 'Host Father Occupation', sevis: false },
    'data.secondary_host.first_name': { label: 'Host Mother First Name', sevis: false },
    'data.secondary_host.last_name': { label: 'Host Mother Last Name', sevis: false },
    'data.secondary_host.occupation': { label: 'Host Mother Occupation', sevis: false },
    'data.home_details.bedrooms': { label: 'Number of Bedrooms', sevis: false },
    'data.home_details.bathrooms': { label: 'Number of Bathrooms', sevis: false },
    'data.has_pets': { label: 'Has Pets', sevis: false },
    'data.pets': { label: 'Pet Details', sevis: false },
    'data.diet_restrictions': { label: 'Dietary Restrictions', sevis: false },
    'data.languages': { label: 'Languages Spoken', sevis: false },
    'data.nearest_school': { label: 'Nearest School', sevis: false }
  },
  
  coordinator: {
    'data.address': { label: 'Address', sevis: false },
    'data.state': { label: 'State', sevis: false },
    'data.regions_covered': { label: 'Regions Covered', sevis: false },
    'data.years_experience': { label: 'Years of Experience', sevis: false },
    'data.languages': { label: 'Languages Spoken', sevis: false },
    'data.max_students': { label: 'Maximum Students', sevis: false },
    'data.preferred_contact_method': { label: 'Preferred Contact Method', sevis: false },
    'data.training_completed': { label: 'Training Completed', sevis: false },
    'data.background_check_date': { label: 'Background Check Date', sevis: false }
  }
};

// Generate change requests
const generateChangeRequests = () => {
  const changeRequests = [];
  const changeItems = [];
  const changeComments = [];
  
  for (let i = 0; i < NUM_CHANGE_REQUESTS; i++) {
    const recordType = randomItem(['student', 'host_family', 'coordinator']);
    const recordId = randomItem(MOCK_PROFILE_IDS[recordType === 'host_family' ? 'host_families' : `${recordType}s`]);
    const requestedBy = randomItem(MOCK_USER_IDS);
    
    // Generate realistic record names
    const recordName = recordType === 'student' 
      ? `${randomItem(SAMPLE_DATA.names)} ${randomItem(SAMPLE_DATA.lastNames)}`
      : recordType === 'host_family'
      ? `The ${randomItem(SAMPLE_DATA.lastNames)} Family`
      : `${randomItem(SAMPLE_DATA.names)} ${randomItem(SAMPLE_DATA.lastNames)}`;
    
    const changeRequestId = generateId();
    const requestDate = faker.date.past({ days: 30 });
    
    const changeRequest = {
      id: changeRequestId,
      record_type: recordType,
      record_id: recordId,
      record_name: recordName,
      requested_by: requestedBy,
      requested_by_name: USER_ID_TO_NAME[requestedBy],
      request_date: requestDate.toISOString(),
      status: randomItem(['pending', 'partially_approved', 'fully_approved']),
      priority: randomItem(['low', 'medium', 'high']),
      description: generateChangeDescription(recordType),
      metadata: JSON.stringify({
        source: randomItem(['user_request', 'admin_update', 'system_sync', 'data_correction']),
        urgency_reason: Math.random() > 0.7 ? 'SEVIS deadline approaching' : null
      }),
      created_at: requestDate.toISOString(),
      updated_at: faker.date.between({ from: requestDate, to: new Date() }).toISOString()
    };
    
    changeRequests.push(changeRequest);
    
    // Generate 1-5 change items per request
    const numItems = faker.number.int({ min: 1, max: 5 });
    const availableFields = Object.keys(CHANGE_FIELDS[recordType]);
    const selectedFields = randomItems(availableFields, numItems, numItems);
    
    selectedFields.forEach(fieldPath => {
      const fieldInfo = CHANGE_FIELDS[recordType][fieldPath];
      const changeItemId = generateId();
      
      const { previousValue, newValue } = generateFieldChange(fieldPath, fieldInfo);
      
      const approvedBy = Math.random() > 0.5 ? randomItem(MOCK_USER_IDS) : null;
      
      const changeItem = {
        id: changeItemId,
        change_request_id: changeRequestId,
        field_path: fieldPath,
        field_label: fieldInfo.label,
        previous_value: previousValue,
        new_value: newValue,
        change_type: 'update',
        is_sevis_related: fieldInfo.sevis || false,
        status: randomItem(['pending', 'approved', 'rejected']),
        approved_by: approvedBy,
        approved_by_name: approvedBy ? USER_ID_TO_NAME[approvedBy] : null,
        approved_at: Math.random() > 0.5 ? faker.date.between({ from: requestDate, to: new Date() }).toISOString() : null,
        rejection_reason: Math.random() > 0.8 ? 'Insufficient documentation provided' : null,
        sevis_batch_id: null, // Will be populated later for SEVIS items
        metadata: JSON.stringify({
          change_reason: randomItem([
            'Data correction',
            'Student request',
            'Host family update',
            'Administrative change',
            'SEVIS requirement'
          ])
        }),
        created_at: requestDate.toISOString(),
        updated_at: faker.date.between({ from: requestDate, to: new Date() }).toISOString()
      };
      
      changeItems.push(changeItem);
      
      // Generate 0-3 comments per change item
      const numComments = faker.number.int({ min: 0, max: 3 });
      for (let j = 0; j < numComments; j++) {
        const commentDate = faker.date.between({ from: requestDate, to: new Date() });
        const authorId = randomItem(MOCK_USER_IDS);
        const comment = {
          id: generateId(),
          change_item_id: changeItemId,
          author_id: authorId,
          author_name: USER_ID_TO_NAME[authorId],
          content: generateComment(),
          is_internal: Math.random() > 0.7,
          created_at: commentDate.toISOString(),
          updated_at: commentDate.toISOString()
        };
        changeComments.push(comment);
      }
    });
  }
  
  return { changeRequests, changeItems, changeComments };
};

// Generate realistic change descriptions
const generateChangeDescription = (recordType) => {
  const descriptions = {
    student: [
      'Student address change due to host family relocation',
      'Update emergency contact information',
      'Correct student name spelling for SEVIS compliance',
      'Change school assignment due to academic requirements',
      'Update insurance information for new policy',
      'Modify program dates due to visa processing delays'
    ],
    host_family: [
      'Update host family contact information',
      'Add new family member to household',
      'Change home address due to relocation',
      'Update pet information',
      'Modify hosting preferences',
      'Update emergency contact details'
    ],
    coordinator: [
      'Update coordinator contact information',
      'Change coverage area assignment',
      'Update training certification status',
      'Modify maximum student capacity',
      'Change preferred contact method',
      'Update background check information'
    ]
  };
  
  return randomItem(descriptions[recordType]);
};

// Generate realistic field changes
const generateFieldChange = (fieldPath, fieldInfo) => {
  const fieldType = fieldPath.split('.').pop();
  
  let previousValue, newValue;
  
  switch (fieldType) {
    case 'first_name':
    case 'last_name':
      previousValue = randomItem(SAMPLE_DATA.names);
      newValue = randomItem(SAMPLE_DATA.names);
      break;
    case 'address':
      previousValue = randomItem(SAMPLE_DATA.addresses);
      newValue = randomItem(SAMPLE_DATA.addresses);
      break;
    case 'phone':
    case 'phone_home':
    case 'phone_cell':
      previousValue = randomItem(SAMPLE_DATA.phones);
      newValue = randomItem(SAMPLE_DATA.phones);
      break;
    case 'email':
    case 'email_primary':
    case 'email_secondary':
      previousValue = randomItem(SAMPLE_DATA.emails);
      newValue = randomItem(SAMPLE_DATA.emails);
      break;
    case 'school_name':
    case 'nearest_school':
      previousValue = randomItem(SAMPLE_DATA.schools);
      newValue = randomItem(SAMPLE_DATA.schools);
      break;
    case 'bedrooms':
    case 'bathrooms':
    case 'max_students':
    case 'years_experience':
      previousValue = faker.number.int({ min: 1, max: 10 }).toString();
      newValue = faker.number.int({ min: 1, max: 10 }).toString();
      break;
    case 'has_pets':
    case 'training_completed':
      previousValue = Math.random() > 0.5 ? 'true' : 'false';
      newValue = previousValue === 'true' ? 'false' : 'true';
      break;
    case 'date_of_birth':
    case 'program_start_date':
    case 'program_end_date':
    case 'arrival_date':
    case 'departure_date':
    case 'background_check_date':
      previousValue = faker.date.past({ years: 1 }).toISOString().split('T')[0];
      newValue = faker.date.future({ years: 1 }).toISOString().split('T')[0];
      break;
    default:
      previousValue = faker.lorem.words(3);
      newValue = faker.lorem.words(3);
  }
  
  return { previousValue, newValue };
};

// Generate realistic comments
const generateComment = () => {
  const comments = [
    'Please verify this change with the student before approving.',
    'Documentation has been received and reviewed.',
    'This change requires SEVIS notification within 10 days.',
    'Approved pending verification of supporting documents.',
    'Please coordinate with the host family before implementing.',
    'This change may affect the student\'s visa status.',
    'Additional documentation required before approval.',
    'Change approved and ready for SEVIS batch processing.',
    'Please confirm this change with the local coordinator.',
    'Urgent: This change affects the student\'s program eligibility.'
  ];
  
  return randomItem(comments);
};

// Generate SEVIS batches
const generateSevisBatches = (changeItems) => {
  const sevisBatches = [];
  const sevisBatchItems = [];
  const changeItemUpdates = []; // Track which change items need sevis_batch_id updates
  
  // Get all SEVIS-related change items that are approved
  const sevisChangeItems = changeItems.filter(item => 
    item.is_sevis_related && item.status === 'approved'
  );
  
  // Create batches
  for (let i = 0; i < NUM_SEVIS_BATCHES; i++) {
    const batchId = generateId();
    const createdBy = randomItem(MOCK_USER_IDS);
    const createdDate = faker.date.past({ days: 15 });
    
    const batch = {
      id: batchId,
      batch_name: `SEVIS Batch ${new Date().getFullYear()}-${String(i + 1).padStart(3, '0')}`,
      status: randomItem(['draft', 'ready', 'submitted', 'processed']),
      created_by: createdBy,
      submitted_by: Math.random() > 0.5 ? randomItem(MOCK_USER_IDS) : null,
      submitted_at: Math.random() > 0.5 ? faker.date.between({ from: createdDate, to: new Date() }).toISOString() : null,
      processed_at: Math.random() > 0.3 ? faker.date.between({ from: createdDate, to: new Date() }).toISOString() : null,
      sevis_response: Math.random() > 0.5 ? JSON.stringify({
        batch_id: `SEVIS_${faker.string.alphanumeric(8)}`,
        status: 'processed',
        processed_count: faker.number.int({ min: 1, max: 10 })
      }) : null,
      total_items: 0, // Will be calculated
      processed_items: 0, // Will be calculated
      failed_items: 0, // Will be calculated
      notes: Math.random() > 0.5 ? 'Batch processed successfully' : null,
      created_at: createdDate.toISOString(),
      updated_at: faker.date.between({ from: createdDate, to: new Date() }).toISOString()
    };
    
    sevisBatches.push(batch);
    
    // Add some change items to this batch
    const batchSize = faker.number.int({ min: 2, max: 8 });
    const batchChangeItems = sevisChangeItems.splice(0, Math.min(batchSize, sevisChangeItems.length));
    
    batchChangeItems.forEach(changeItem => {
      // Track that this change item should be updated with the batch ID
      changeItemUpdates.push({
        changeItemId: changeItem.id,
        batchId: batchId
      });
      
      const batchItemId = generateId();
      const sevisField = SEVIS_FIELDS[changeItem.field_path];
      
      const batchItem = {
        id: batchItemId,
        sevis_batch_id: batchId,
        change_item_id: changeItem.id,
        student_sevis_id: `N${faker.string.numeric(10)}`,
        sevis_field_mapping: sevisField ? sevisField.mapping : 'unknown.field',
        status: randomItem(['pending', 'processed', 'failed']),
        sevis_response: Math.random() > 0.7 ? JSON.stringify({
          status: 'success',
          sevis_id: `N${faker.string.numeric(10)}`,
          updated_at: new Date().toISOString()
        }) : null,
        error_message: Math.random() > 0.9 ? 'SEVIS validation error: Invalid date format' : null,
        processed_at: Math.random() > 0.3 ? faker.date.between({ from: createdDate, to: new Date() }).toISOString() : null,
        created_at: createdDate.toISOString(),
        updated_at: faker.date.between({ from: createdDate, to: new Date() }).toISOString()
      };
      
      sevisBatchItems.push(batchItem);
    });
    
    // Update batch counts
    const batchItems = sevisBatchItems.filter(item => item.sevis_batch_id === batchId);
    batch.total_items = batchItems.length;
    batch.processed_items = batchItems.filter(item => item.status === 'processed').length;
    batch.failed_items = batchItems.filter(item => item.status === 'failed').length;
  }
  
  return { sevisBatches, sevisBatchItems, changeItemUpdates };
};

// Generate SQL insert statements
const generateSqlInsert = (table, records) => {
  if (records.length === 0) return '';
  
  const columns = Object.keys(records[0]);
  const values = records.map(record => {
    const valueList = columns.map(col => {
      const value = record[col];
      if (value === null || value === undefined) return 'NULL';
      if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
      if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
      return value;
    });
    return `(${valueList.join(', ')})`;
  });
  
  return `INSERT INTO public.${table} (${columns.join(', ')}) VALUES\n${values.join(',\n')};\n\n`;
};

// Main execution
console.log('Generating change queue mock data...');

const { changeRequests, changeItems, changeComments } = generateChangeRequests();
const { sevisBatches, sevisBatchItems, changeItemUpdates } = generateSevisBatches(changeItems);

console.log(`Generated:
- ${changeRequests.length} change requests
- ${changeItems.length} change items
- ${changeComments.length} change comments
- ${sevisBatches.length} SEVIS batches
- ${sevisBatchItems.length} SEVIS batch items`);

// Generate SQL
let sql = '-- Change Queue Mock Data\n';
sql += '-- Generated on ' + new Date().toISOString() + '\n\n';

sql += '-- Clear existing data (in correct order to respect foreign keys)\n';
sql += 'DELETE FROM public.sevis_batch_items;\n';
sql += 'UPDATE public.change_items SET sevis_batch_id = NULL WHERE sevis_batch_id IS NOT NULL;\n';
sql += 'DELETE FROM public.sevis_batches;\n';
sql += 'DELETE FROM public.change_comments;\n';
sql += 'DELETE FROM public.change_items;\n';
sql += 'DELETE FROM public.change_requests;\n\n';

sql += '-- Insert change requests\n';
sql += generateSqlInsert('change_requests', changeRequests);

sql += '-- Insert change items (without sevis_batch_id initially)\n';
sql += generateSqlInsert('change_items', changeItems);

sql += '-- Insert change comments\n';
sql += generateSqlInsert('change_comments', changeComments);

sql += '-- Insert SEVIS batches\n';
sql += generateSqlInsert('sevis_batches', sevisBatches);

sql += '-- Insert SEVIS batch items\n';
sql += generateSqlInsert('sevis_batch_items', sevisBatchItems);

// Add updates for change items that should reference SEVIS batches
if (changeItemUpdates.length > 0) {
  sql += '-- Update change items with SEVIS batch references\n';
  changeItemUpdates.forEach(update => {
    sql += `UPDATE public.change_items SET sevis_batch_id = '${update.batchId}' WHERE id = '${update.changeItemId}';\n`;
  });
  sql += '\n';
}

// Save to file
const outputPath = path.join(__dirname, 'change-queue-mock-data.sql');
fs.writeFileSync(outputPath, sql);

console.log(`SQL file generated: ${outputPath}`);
console.log('Ready to import into Supabase!'); 