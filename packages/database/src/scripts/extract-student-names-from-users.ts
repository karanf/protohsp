import { adminDb } from '../client';

async function extractStudentNamesFromUsers() {
  console.log('🔧 Extracting student names from linked user accounts...');

  if (!adminDb) {
    console.error('❌ AdminDB not available');
    return;
  }

  try {
    // Query all profiles and users
    const query = { 
      profiles: {},
      users: {}
    };
    const result = await adminDb.query(query);
    
    if (!result.profiles || !result.users) {
      console.log('⚠️  No profiles or users found');
      return;
    }

    const studentProfiles = result.profiles.filter((profile: any) => profile.type === 'student');
    console.log(`📊 Found ${studentProfiles.length} student profiles`);
    console.log(`📊 Found ${result.users.length} users`);

    // Find students that need name extraction
    const studentsNeedingNames = studentProfiles.filter(student => {
      const linkedUser = result.users.find((user: any) => user.id === student.userId);
      return linkedUser && linkedUser.firstName && linkedUser.lastName && 
             (!student.firstName || !student.lastName);
    });

    console.log(`📊 Students needing name extraction: ${studentsNeedingNames.length}/${studentProfiles.length}`);

    if (studentsNeedingNames.length === 0) {
      console.log('✅ All students already have names extracted!');
      return;
    }

    // Prepare extraction data
    const extractionData = studentsNeedingNames.map(student => {
      const linkedUser = result.users.find((user: any) => user.id === student.userId);
      
      if (!linkedUser) {
        console.warn(`⚠️  No linked user found for student ${student.id}`);
        return null;
      }

             const firstName = (linkedUser.firstName as string) || '';
       const lastName = (linkedUser.lastName as string) || '';
       
       // Generate proper email based on real names
       const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
       const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
      const emailDomains = ['student.edu', 'exchange.org', 'learner.net', 'academic.com'];
      const domain = emailDomains[Math.floor(Math.random() * emailDomains.length)];
      const nameBasedEmail = `${cleanFirst}.${cleanLast}@${domain}`;

      return {
        studentId: student.id,
        userId: student.userId,
        currentFirstName: student.firstName,
        currentLastName: student.lastName,
        currentEmail: student.email,
        extractedFirstName: firstName,
        extractedLastName: lastName,
        newEmail: nameBasedEmail,
        userEmail: linkedUser.email
      };
    }).filter(Boolean);

    console.log(`\n📋 Sample name extractions:`);
    extractionData.slice(0, 10).forEach((data, index) => {
      console.log(`  ${index + 1}. ${data!.extractedFirstName} ${data!.extractedLastName} → ${data!.newEmail}`);
      console.log(`     Current: "${data!.currentFirstName || 'MISSING'}" "${data!.currentLastName || 'MISSING'}" (${data!.currentEmail})`);
    });

    // Update student profiles with extracted names and proper emails
    console.log('\n🔄 Updating student profiles with extracted names and proper emails...');
    
    let totalUpdated = 0;
    const batchSize = 50;

    for (let i = 0; i < extractionData.length; i += batchSize) {
      const batch = extractionData.slice(i, i + batchSize);
      console.log(`\n🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(extractionData.length / batchSize)} (${batch.length} students)...`);

      try {
        if (!adminDb || !adminDb.tx || !adminDb.tx.profiles) {
          throw new Error('Profiles transaction not available');
        }

        const transactions = batch.map((data) => {
          if (!data) return null;
          
          const profileEntity = adminDb.tx.profiles[data.studentId];
          
          if (!profileEntity) {
            console.warn(`⚠️  Profile entity not available for ID: ${data.studentId}`);
            return null;
          }

          console.log(`  📝 ${data.extractedFirstName} ${data.extractedLastName} → ${data.newEmail}`);
          
          return profileEntity.update({ 
            firstName: data.extractedFirstName,
            lastName: data.extractedLastName,
            email: data.newEmail
          });
        }).filter((t): t is NonNullable<typeof t> => t !== null);

        if (transactions.length > 0) {
          await adminDb.transact(transactions);
          totalUpdated += transactions.length;
          console.log(`  ✅ Updated ${transactions.length} students with real names and proper emails`);
        }

      } catch (error) {
        console.error(`❌ Failed to process batch ${Math.floor(i / batchSize) + 1}:`, error);
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n🎉 Name extraction complete!`);
    console.log(`📝 Total students updated: ${totalUpdated}`);

    // Final verification
    console.log('\n🔍 Running final verification...');
    const verificationQuery = { profiles: {} };
    const verificationResult = await adminDb.query(verificationQuery);
    
    if (verificationResult.profiles) {
      const allStudents = verificationResult.profiles.filter((p: any) => p.type === 'student');
      const studentsWithNames = allStudents.filter((p: any) => p.firstName && p.lastName);
      const studentsWithEmails = allStudents.filter((p: any) => p.email && p.email.trim() !== '');
      
      console.log(`✅ Students with names: ${studentsWithNames.length}/${allStudents.length} (${((studentsWithNames.length / allStudents.length) * 100).toFixed(1)}%)`);
      console.log(`✅ Students with emails: ${studentsWithEmails.length}/${allStudents.length} (${((studentsWithEmails.length / allStudents.length) * 100).toFixed(1)}%)`);
      
      if (studentsWithNames.length === allStudents.length) {
        console.log('🎉 SUCCESS: All students now have real names!');
      }
      
      if (studentsWithEmails.length === allStudents.length) {
        console.log('🎉 SUCCESS: All students now have proper email addresses!');
      }

      // Show sample of final results
      console.log('\n📋 Sample final student data:');
      allStudents.slice(0, 5).forEach((student: any, index: number) => {
        console.log(`  ${index + 1}. ${student.firstName} ${student.lastName} - ${student.email}`);
      });
    }

  } catch (error) {
    console.error('❌ Failed to extract student names:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }
}

// Run the extraction
extractStudentNamesFromUsers().catch(console.error); 