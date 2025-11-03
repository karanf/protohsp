import { init, id } from '@instantdb/admin';
import dotenv from 'dotenv';

// Load environment variables from multiple possible locations
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../../../.env.local' });

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN!;

const db = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

// Admin users for reviewing and approving applications
const ADMIN_USERS = [
  {
    firstName: 'Sarah',
    lastName: 'Mitchell',
    email: 'sarah.mitchell@egab.org',
    role: 'admin'
  },
  {
    firstName: 'David',
    lastName: 'Rodriguez',
    email: 'david.rodriguez@egab.org',
    role: 'admin'
  },
  {
    firstName: 'Jennifer',
    lastName: 'Chen',
    email: 'jennifer.chen@egab.org',
    role: 'admin'
  },
  {
    firstName: 'Michael',
    lastName: 'Thompson',
    email: 'michael.thompson@egab.org',
    role: 'admin'
  },
  {
    firstName: 'Emily',
    lastName: 'Johnson',
    email: 'emily.johnson@egab.org',
    role: 'admin'
  },
  {
    firstName: 'Robert',
    lastName: 'Williams',
    email: 'robert.williams@egab.org',
    role: 'admin'
  },
  {
    firstName: 'Lisa',
    lastName: 'Davis',
    email: 'lisa.davis@egab.org',
    role: 'admin'
  },
  {
    firstName: 'James',
    lastName: 'Garcia',
    email: 'james.garcia@egab.org',
    role: 'admin'
  },
  {
    firstName: 'Amanda',
    lastName: 'Brown',
    email: 'amanda.brown@egab.org',
    role: 'admin'
  },
  {
    firstName: 'Christopher',
    lastName: 'Miller',
    email: 'christopher.miller@egab.org',
    role: 'admin'
  },
  {
    firstName: 'Michelle',
    lastName: 'Wilson',
    email: 'michelle.wilson@egab.org',
    role: 'admin'
  },
  {
    firstName: 'Daniel',
    lastName: 'Moore',
    email: 'daniel.moore@egab.org',
    role: 'admin'
  },
  {
    firstName: 'Jessica',
    lastName: 'Taylor',
    email: 'jessica.taylor@egab.org',
    role: 'admin'
  },
  {
    firstName: 'Ryan',
    lastName: 'Anderson',
    email: 'ryan.anderson@egab.org',
    role: 'admin'
  },
  {
    firstName: 'Nicole',
    lastName: 'Thomas',
    email: 'nicole.thomas@egab.org',
    role: 'admin'
  }
];

async function createAdminUsers() {
  console.log('Creating 15 admin users for application review...');
  
  try {
    const transactions = [];
    
    for (let i = 0; i < ADMIN_USERS.length; i++) {
      const adminUser = ADMIN_USERS[i];
      if (!adminUser) continue;
      
      const userId = id();
      const profileId = id();
      
      // Create user transaction
      if (db.tx?.users) {
        transactions.push(
          db.tx.users[userId]!.update({
            email: adminUser.email,
            role: adminUser.role,
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
            phone: `+1-555-${String(i + 100).padStart(4, '0')}`,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(adminUser.firstName)}+${encodeURIComponent(adminUser.lastName)}&background=3b82f6&color=ffffff`,
            status: 'active',
            metadata: {
              department: 'Application Review',
              clearanceLevel: 'admin',
              canApproveApplications: true
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          }).link({
            profiles: profileId
          })
        );
      }
      
      // Create profile transaction
      if (db.tx?.profiles) {
        transactions.push(
          db.tx.profiles[profileId]!.update({
            userId: userId,
            type: 'admin',
            data: {
              firstName: adminUser.firstName,
              lastName: adminUser.lastName,
              title: 'Application Review Administrator',
              department: 'Application Review',
              permissions: {
                canReviewStudentApplications: true,
                canApproveApplications: true,
                canRejectApplications: true,
                canViewAllStudents: true
              },
              workSchedule: {
                timezone: 'America/New_York',
                availability: 'business_hours'
              }
            },
            status: 'active',
            verified: true,
            verificationDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        );
      }
    }

    await db.transact(transactions);
    
    console.log(`✅ Successfully created ${ADMIN_USERS.length} admin users!`);
    
    // Log the admin users for reference
    console.log('\nAdmin Users Created:');
    ADMIN_USERS.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error creating admin users:', error);
    return false;
  }
}

// Run the function directly since this is the main script
createAdminUsers()
  .then(() => {
    console.log('Script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

export { createAdminUsers }; 