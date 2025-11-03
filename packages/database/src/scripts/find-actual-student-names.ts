import { adminDb } from '../client';

async function findActualStudentNames() {
  console.log('🔍 Searching for actual student names in all possible locations...');

  if (!adminDb) {
    console.error('❌ AdminDB not available');
    return;
  }

  try {
    // Query all data to find student names
    const query = { 
      profiles: {},
      users: {}
    };
    const result = await adminDb.query(query);
    
    if (!result.profiles) {
      console.log('⚠️  No profiles found');
      return;
    }

    const studentProfiles = result.profiles.filter((profile: any) => profile.type === 'student');
    console.log(`📊 Found ${studentProfiles.length} student profiles`);
    console.log(`📊 Found ${result.users?.length || 0} users`);

    // Check if students are linked to users via userId
    console.log('\n🔍 Checking student-user relationships...');
    const studentsWithUserId = studentProfiles.filter(s => s.userId);
    console.log(`📊 Students with userId: ${studentsWithUserId.length}/${studentProfiles.length}`);

    if (studentsWithUserId.length > 0 && result.users) {
      console.log('\n👥 Analyzing user data for student names...');
      
      studentsWithUserId.slice(0, 5).forEach((student: any, index: number) => {
        const linkedUser = result.users.find((user: any) => user.id === student.userId);
        console.log(`\n--- Student ${index + 1} User Link ---`);
        console.log(`Student ID: ${student.id}`);
        console.log(`User ID: ${student.userId}`);
        console.log(`Linked User Found: ${linkedUser ? 'YES' : 'NO'}`);
        
        if (linkedUser) {
          console.log(`User Email: ${linkedUser.email || 'N/A'}`);
          console.log(`User Name: ${linkedUser.name || 'N/A'}`);
          console.log(`User FirstName: ${linkedUser.firstName || 'N/A'}`);
          console.log(`User LastName: ${linkedUser.lastName || 'N/A'}`);
          console.log(`User Keys: ${Object.keys(linkedUser).join(', ')}`);
        }
      });
    }

    // Check if student names might be in bio or other text fields
    console.log('\n📝 Searching for names in student bio and text fields...');
    
    const studentsWithBio = studentProfiles.filter(s => s.data && (s.data as any).student_bio);
    console.log(`📊 Students with bio: ${studentsWithBio.length}/${studentProfiles.length}`);

    if (studentsWithBio.length > 0) {
      console.log('\n📋 Sample student bios (looking for names):');
      studentsWithBio.slice(0, 3).forEach((student: any, index: number) => {
        console.log(`\n--- Student ${index + 1} Bio ---`);
        console.log(`Bio: ${student.data.student_bio.substring(0, 200)}...`);
        
        // Look for first-person references that might indicate names
        const bio = student.data.student_bio.toLowerCase();
        const hasFirstPerson = bio.includes('my name is') || bio.includes('i am') || bio.includes('i\'m ');
        console.log(`Contains first-person name references: ${hasFirstPerson}`);
      });
    }

    // Check the original SQL data to see if we missed student names during migration
    console.log('\n🔍 Checking if student names exist in original data but weren\'t migrated...');
    
    // Look at a few students' full data structure for any missed name patterns
    const sampleStudents = studentProfiles.slice(0, 3);
    sampleStudents.forEach((student: any, index: number) => {
      console.log(`\n--- Student ${index + 1} Full Data Analysis ---`);
      console.log(`ID: ${student.id}`);
      
      if (student.data) {
        // Search for any field that might contain the actual student name
        const searchForNames = (obj: any, path: string = '') => {
          const possibleNames: string[] = [];
          
          if (obj && typeof obj === 'object') {
            Object.keys(obj).forEach(key => {
              const fullPath = path ? `${path}.${key}` : key;
              const value = obj[key];
              
              // Look for fields that might contain student names
              if (typeof value === 'string' && value.trim() !== '') {
                // Check if this looks like a person's name (has space and capitalized words)
                const namePattern = /^[A-Z][a-z]+ [A-Z][a-z]+/;
                if (namePattern.test(value.trim())) {
                  // Exclude known non-student names
                  if (!fullPath.includes('parent') && 
                      !fullPath.includes('emergency') && 
                      !fullPath.includes('family') &&
                      !fullPath.includes('school') &&
                      !fullPath.includes('preference')) {
                    possibleNames.push(`${fullPath}: "${value}"`);
                  }
                }
              } else if (typeof value === 'object') {
                possibleNames.push(...searchForNames(value, fullPath));
              }
            });
          }
          
          return possibleNames;
        };
        
        const possibleStudentNames = searchForNames(student.data);
        if (possibleStudentNames.length > 0) {
          console.log('🎯 Possible student name fields:');
          possibleStudentNames.forEach(name => console.log(`  - ${name}`));
        } else {
          console.log('❌ No student name patterns found in data');
        }
      }
    });

    // Final analysis
    console.log('\n🎯 FINAL ANALYSIS:');
    console.log('=====================================');
    
    if (studentsWithUserId.length > 0 && result.users) {
      const usersWithNames = result.users.filter((u: any) => u.name || u.firstName || u.lastName);
      console.log(`✅ POTENTIAL SOLUTION: Link student profiles to user names`);
      console.log(`📊 Users with name data: ${usersWithNames.length}/${result.users.length}`);
      console.log('📝 Action: Extract names from linked user accounts');
    } else {
      console.log('❌ NO DIRECT NAME SOURCE FOUND');
      console.log('📝 Possible reasons:');
      console.log('  1. Student names not included in original data');
      console.log('  2. Names stored in a different table/entity');
      console.log('  3. Names need to be generated/imported separately');
    }

  } catch (error) {
    console.error('❌ Failed to find student names:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }
}

// Run the search
findActualStudentNames().catch(console.error); 