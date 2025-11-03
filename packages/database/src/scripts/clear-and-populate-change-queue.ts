import { init } from '@instantdb/admin';
import dotenv from 'dotenv';

// Load environment variables - EXACT pattern to avoid path issues
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

const db = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

// Helper function to generate unique ID
const id = () => crypto.randomUUID();

interface ChangeItem {
  id: string;
  fieldPath: string;
  fieldLabel: string;
  previousValue: string | null;
  newValue: string;
  changeType: 'create' | 'update' | 'delete';
  isSevisRelated: boolean;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  requestedBy?: string;
  requesterName?: string;
  requesterRole?: string;
  requestDate?: string;
  comments?: Array<{
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    isInternal: boolean;
    createdAt: string;
  }>;
}

interface ChangeRequest {
  id: string;
  entityType: string;
  entityId: string;
  changeType: string;
  status: string;
  priority: string;
  requestedBy: string;
  assignedTo?: string;
  notes?: string;
  dueDate?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
  requestData: {
    recordType: string;
    recordId: string;
    recordName: string;
    requestedByName: string;
    description: string;
    metadata?: any;
    changeItems: ChangeItem[];
  };
  responseData?: any;
}

const generateComprehensiveChangeRequests = (): ChangeRequest[] => {
  const now = new Date();
  const requests: ChangeRequest[] = [];

  // Request 1: Student with both pending and approved changes
  requests.push({
    id: id(),
    entityType: 'student',
    entityId: 'student-001',
    changeType: 'profile_update',
    status: 'partially_approved',
    priority: 'high',
    requestedBy: 'user-admin-001',
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    requestData: {
      recordType: 'student',
      recordId: 'student-001',
      recordName: 'Emma Schmidt',
      requestedByName: 'Admin User',
      description: 'Multiple field updates due to host family change and SEVIS requirements',
      metadata: {
        firstName: 'Emma',
        lastName: 'Schmidt',
        dob: '2006-03-15',
        gender: 'Female',
        country: 'Germany',
        program: 'Academic Year Program',
        partner: 'EduCulture Germany',
        grade: '11th Grade',
        school: 'Madison High School',
        hostFamilyName: 'The Johnson Family',
        applicationStatus: 'Approved',
        approvedOn: '2024-02-15',
        lastAction: 'Host family assignment updated'
      },
      changeItems: [
        // Approved change
        {
          id: id(),
          fieldPath: 'data.hostFamily',
          fieldLabel: 'Host Family Assignment',
          previousValue: 'The Wilson Family',
          newValue: 'The Johnson Family',
          changeType: 'update',
          isSevisRelated: true,
          status: 'approved',
          approvedBy: 'supervisor-001',
          approvedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          requestedBy: 'coordinator-mike',
          requesterName: 'Mike Wilson',
          requesterRole: 'coordinator',
          requestDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          comments: [
            {
              id: id(),
              authorId: 'supervisor-001',
              authorName: 'Sarah Davis',
              content: 'Approved due to Wilson family emergency relocation. Johnson family has been verified and approved.',
              isInternal: false,
              createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        // Pending change
        {
          id: id(),
          fieldPath: 'data.address',
          fieldLabel: 'Student Address',
          previousValue: '123 Wilson Street, Madison, WI 53703',
          newValue: '456 Johnson Avenue, Madison, WI 53704',
          changeType: 'update',
          isSevisRelated: true,
          status: 'pending',
          requestedBy: 'coordinator-mike',
          requesterName: 'Mike Wilson',
          requesterRole: 'coordinator',
          requestDate: new Date().toISOString(),
          comments: []
        }
      ]
    }
  });

  // Request 2: Host Family with approved and rejected changes
  requests.push({
    id: id(),
    entityType: 'host_family',
    entityId: 'hf-002',
    changeType: 'contact_update',
    status: 'partially_approved',
    priority: 'medium',
    requestedBy: 'hf-parent-001',
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    requestData: {
      recordType: 'host_family',
      recordId: 'hf-002',
      recordName: 'John Johnson & Sarah Johnson',
      requestedByName: 'John Johnson',
      description: 'Contact information updates and capacity change request',
      metadata: {
        primaryParent: 'John Johnson',
        secondaryParent: 'Sarah Johnson',
        familyStatus: 'Active',
        phone: '(608) 555-0123',
        address: '456 Johnson Avenue, Madison, WI 53704',
        city: 'Madison',
        state: 'Wisconsin',
        region: 'Midwest',
        localCoordinator: 'Mike Wilson',
        currentStudents: 'Emma Schmidt',
        capacity: '1 student',
        placementHistory: '3 previous successful placements'
      },
      changeItems: [
        // Approved change
        {
          id: id(),
          fieldPath: 'data.email_primary',
          fieldLabel: 'Primary Email Address',
          previousValue: 'john.johnson.old@email.com',
          newValue: 'john.johnson@email.com',
          changeType: 'update',
          isSevisRelated: false,
          status: 'approved',
          approvedBy: 'coordinator-mike',
          approvedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          requestedBy: 'hf-parent-001',
          requesterName: 'John Johnson',
          requesterRole: 'student',
          requestDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          comments: [
            {
              id: id(),
              authorId: 'coordinator-mike',
              authorName: 'Mike Wilson',
              content: 'Email update approved. Previous email was bouncing.',
              isInternal: false,
              createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        // Rejected change
        {
          id: id(),
          fieldPath: 'data.student_capacity',
          fieldLabel: 'Student Capacity',
          previousValue: '1',
          newValue: '2',
          changeType: 'update',
          isSevisRelated: false,
          status: 'rejected',
          approvedBy: 'regional-director-001',
          approvedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          rejectionReason: 'Current bedroom configuration does not support two students per regulations',
          requestedBy: 'hf-parent-001',
          requesterName: 'John Johnson',
          requesterRole: 'student',
          requestDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          comments: [
            {
              id: id(),
              authorId: 'regional-director-001',
              authorName: 'Lisa Chen',
              content: 'Rejected: House inspection shows only one suitable bedroom for exchange students. Would need home modification approval first.',
              isInternal: false,
              createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        // Pending change
        {
          id: id(),
          fieldPath: 'data.phone_secondary',
          fieldLabel: 'Secondary Phone Number',
          previousValue: null,
          newValue: '(608) 555-0124',
          changeType: 'create',
          isSevisRelated: false,
          status: 'pending',
          requestedBy: 'hf-parent-001',
          requesterName: 'John Johnson',
          requesterRole: 'student',
          requestDate: new Date().toISOString(),
          comments: []
        }
      ]
    }
  });

  // Request 3: Coordinator with multiple changes
  requests.push({
    id: id(),
    entityType: 'coordinator',
    entityId: 'coord-003',
    changeType: 'region_update',
    status: 'fully_approved',
    priority: 'low',
    requestedBy: 'coord-mike-wilson',
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    requestData: {
      recordType: 'coordinator',
      recordId: 'coord-003',
      recordName: 'Mike Wilson',
      requestedByName: 'Mike Wilson',
      description: 'Coordinator profile updates following regional restructuring',
      metadata: {
        email: 'mike.wilson@greenheart.org',
        phone: '(608) 555-0100',
        status: 'Active',
        regionalDirector: 'Lisa Chen',
        region: 'Midwest',
        serviceArea: 'Wisconsin, Minnesota',
        coverageStates: 'WI, MN',
        activeHostFamilies: '12',
        totalHostFamilies: '15',
        activeStudents: '18'
      },
      changeItems: [
        // Approved change 1
        {
          id: id(),
          fieldPath: 'data.service_region',
          fieldLabel: 'Service Region',
          previousValue: 'Wisconsin only',
          newValue: 'Wisconsin, Minnesota',
          changeType: 'update',
          isSevisRelated: false,
          status: 'approved',
          approvedBy: 'regional-director-001',
          approvedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          requestedBy: 'coord-mike-wilson',
          requesterName: 'Mike Wilson',
          requesterRole: 'coordinator',
          requestDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          comments: [
            {
              id: id(),
              authorId: 'regional-director-001',
              authorName: 'Lisa Chen',
              content: 'Approved: Regional expansion due to coordinator shortage in Minnesota.',
              isInternal: true,
              createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        // Approved change 2
        {
          id: id(),
          fieldPath: 'data.phone_work',
          fieldLabel: 'Work Phone Number',
          previousValue: '(608) 555-0099',
          newValue: '(608) 555-0100',
          changeType: 'update',
          isSevisRelated: false,
          status: 'approved',
          approvedBy: 'admin-user-001',
          approvedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          requestedBy: 'coord-mike-wilson',
          requesterName: 'Mike Wilson',
          requesterRole: 'coordinator',
          requestDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          comments: [
            {
              id: id(),
              authorId: 'admin-user-001',
              authorName: 'Admin User',
              content: 'Phone number update approved - new direct line.',
              isInternal: false,
              createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        }
      ]
    }
  });

  // Add more records with various combinations of pending/approved/rejected changes
  for (let i = 4; i <= 15; i++) {
    const recordType = i % 3 === 0 ? 'student' : i % 3 === 1 ? 'host_family' : 'coordinator';
    const hasApprovedChanges = i % 4 !== 0;
    const hasRejectedChanges = i % 5 === 0;
    
    const changeItems: ChangeItem[] = [];
    
    // Add a pending change
    changeItems.push({
      id: id(),
      fieldPath: `data.${recordType === 'student' ? 'grade' : recordType === 'host_family' ? 'phone' : 'email'}`,
      fieldLabel: recordType === 'student' ? 'Grade Level' : recordType === 'host_family' ? 'Phone Number' : 'Email Address',
      previousValue: recordType === 'student' ? '10th Grade' : recordType === 'host_family' ? '(555) 123-4567' : 'old@email.com',
      newValue: recordType === 'student' ? '11th Grade' : recordType === 'host_family' ? '(555) 123-4568' : 'new@email.com',
      changeType: 'update',
      isSevisRelated: recordType === 'student',
      status: 'pending',
      requestedBy: `user-${i}`,
      requesterName: recordType === 'student' ? 'Emma Schmidt' : recordType === 'host_family' ? 'John Smith' : 'Jane Coordinator',
      requesterRole: recordType === 'student' ? 'student' : recordType === 'host_family' ? 'student' : 'coordinator',
      requestDate: new Date().toISOString(),
      comments: []
    });

    // Add approved change if applicable
    if (hasApprovedChanges) {
      changeItems.push({
        id: id(),
        fieldPath: `data.${recordType}_address`,
        fieldLabel: 'Address',
        previousValue: '123 Old Street',
        newValue: '456 New Street',
        changeType: 'update',
        isSevisRelated: recordType === 'student',
        status: 'approved',
        approvedBy: 'supervisor-001',
        approvedAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        requestedBy: `user-${i}`,
        requesterName: recordType === 'student' ? 'Emma Schmidt' : recordType === 'host_family' ? 'John Smith' : 'Jane Coordinator',
        requesterRole: recordType === 'student' ? 'student' : recordType === 'host_family' ? 'student' : 'coordinator',
        requestDate: new Date(now.getTime() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
        comments: [
          {
            id: id(),
            authorId: 'supervisor-001',
            authorName: 'Sarah Davis',
            content: `Address update approved for ${recordType}.`,
            isInternal: false,
            createdAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      });
    }

    // Add rejected change if applicable
    if (hasRejectedChanges) {
      changeItems.push({
        id: id(),
        fieldPath: `data.${recordType}_special_request`,
        fieldLabel: 'Special Request',
        previousValue: null,
        newValue: 'Request for special accommodation',
        changeType: 'create',
        isSevisRelated: false,
        status: 'rejected',
        approvedBy: 'admin-user-001',
        approvedAt: new Date(now.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
        rejectionReason: 'Insufficient documentation provided',
        requestedBy: `user-${i}`,
        requesterName: recordType === 'student' ? 'Emma Schmidt' : recordType === 'host_family' ? 'John Smith' : 'Jane Coordinator',
        requesterRole: recordType === 'student' ? 'student' : recordType === 'host_family' ? 'student' : 'coordinator',
        requestDate: new Date(now.getTime() - Math.random() * 8 * 24 * 60 * 60 * 1000).toISOString(),
        comments: [
          {
            id: id(),
            authorId: 'admin-user-001',
            authorName: 'Admin User',
            content: 'Request rejected: Please provide additional documentation before resubmitting.',
            isInternal: false,
            createdAt: new Date(now.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      });
    }

    // Determine overall status
    const allApproved = changeItems.every(item => item.status === 'approved');
    const hasRejected = changeItems.some(item => item.status === 'rejected');
    const hasPending = changeItems.some(item => item.status === 'pending');
    
    const status = allApproved ? 'fully_approved' : 
                  hasRejected && hasPending ? 'partially_approved' :
                  hasRejected ? 'rejected' : 'pending';

    requests.push({
      id: id(),
      entityType: recordType,
      entityId: `${recordType}-${String(i).padStart(3, '0')}`,
      changeType: 'profile_update',
      status,
      priority: i % 3 === 0 ? 'high' : i % 2 === 0 ? 'medium' : 'low',
      requestedBy: `user-${i}`,
      createdAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      requestData: {
        recordType,
        recordId: `${recordType}-${String(i).padStart(3, '0')}`,
        recordName: recordType === 'student' ? `Student ${i}` : 
                   recordType === 'host_family' ? `Family ${i}` : 
                   `Coordinator ${i}`,
        requestedByName: recordType === 'student' ? 'Student User' : recordType === 'host_family' ? 'Host Parent' : 'Coordinator User',
        description: `${recordType} profile updates`,
        changeItems
      }
    });
  }

  return requests;
};

async function clearAndPopulateChangeQueue() {
  console.log('🗑️  Clearing existing change queue data...');
  
  try {
    // First, get all existing change queue records
    const existingData = await db.query({
      changeQueue: {}
    });

    if (existingData.changeQueue && existingData.changeQueue.length > 0) {
      console.log(`Found ${existingData.changeQueue.length} existing records to delete`);
      
      // Delete records using InstantDB's transact with delete operations
      if (!db.tx?.changeQueue) {
        throw new Error('Database transaction not available');
      }
      
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
    
    console.log('📝 Generating comprehensive change queue data with previous changes...');
    const changeRequests = generateComprehensiveChangeRequests();
    
    console.log(`🔄 Adding ${changeRequests.length} change requests to InstantDB...`);
    
    // Add new data using InstantDB's transact with update operations
    if (!db.tx?.changeQueue) {
      throw new Error('Database transaction not available');
    }
    
    const addPromises = changeRequests.map(request => {
      const changeQueueEntity = db.tx.changeQueue![request.id];
      if (!changeQueueEntity) {
        throw new Error(`ChangeQueue entity not found for ID: ${request.id}`);
      }
      return db.transact([changeQueueEntity.update(request)]);
    });
    
    await Promise.all(addPromises);

    console.log('✅ Change queue populated successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Total records: ${changeRequests.length}`);
    console.log(`   - Records with approved changes: ${changeRequests.filter(r => r.requestData.changeItems.some(c => c.status === 'approved')).length}`);
    console.log(`   - Records with rejected changes: ${changeRequests.filter(r => r.requestData.changeItems.some(c => c.status === 'rejected')).length}`);
    console.log(`   - Records with pending changes: ${changeRequests.filter(r => r.requestData.changeItems.some(c => c.status === 'pending')).length}`);
    
  } catch (error) {
    console.error('❌ Error clearing and populating change queue:', error);
    throw error;
  }
}

// Execute the function
clearAndPopulateChangeQueue()
  .then(() => {
    console.log('🎉 Change queue population completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to populate change queue:', error);
    process.exit(1);
  });

export { clearAndPopulateChangeQueue }; 