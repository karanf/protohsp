/**
 * Sample Detailed Student Data Display
 * Shows the complete structure of generated student mock data
 */

import { generateStudentProfile } from './detailed-student-mock-data.js';

// Generate a sample student
const student = generateStudentProfile(0);

console.log('='.repeat(80));
console.log('COMPREHENSIVE STUDENT APPLICATION DATA');
console.log('='.repeat(80));

console.log('\n📋 PERSONAL INFORMATION');
console.log('─'.repeat(40));
console.log(`Full Name: ${student.fullName}`);
console.log(`Preferred Name: ${student.preferredName}`);
console.log(`Gender: ${student.gender}`);
console.log(`Date of Birth: ${student.dateOfBirth}`);
console.log(`Age: ${student.age}`);
console.log(`City of Birth: ${student.cityOfBirth}`);
console.log(`Country of Birth: ${student.countryOfBirth}`);
console.log(`Country of Citizenship: ${student.countryOfCitizenship}`);

console.log('\n📞 CONTACT INFORMATION');
console.log('─'.repeat(40));
console.log(`Email: ${student.email}`);
console.log(`Cell Phone: ${student.cellPhone}`);
console.log(`Home Phone: ${student.homePhone}`);
console.log('\nAddress:');
console.log(`  ${student.address.line1}`);
if (student.address.line2) console.log(`  ${student.address.line2}`);
console.log(`  ${student.address.city}, ${student.address.postalCode}`);
console.log(`  ${student.address.country}`);

console.log('\n🎓 ACADEMIC INFORMATION');
console.log('─'.repeat(40));
console.log(`Current Grade: ${student.currentGrade}`);
console.log(`Current School: ${student.currentSchool}`);
console.log(`School Type: ${student.schoolType}`);
console.log(`Graduation Date: ${student.graduationDate}`);
console.log(`Favorite Subjects: ${student.favoriteSubjects.join(', ')}`);
console.log(`Years of English: ${student.englishYears}`);
console.log(`English Proficiency: ${student.englishProficiency}`);

console.log('\n🌟 PROGRAM INFORMATION');
console.log('─'.repeat(40));
console.log(`Program Type: ${student.programType}`);
console.log(`Preferred States: ${student.preferredStates.join(', ')}`);

console.log('\n👨‍👩‍👦 FAMILY INFORMATION');
console.log('─'.repeat(40));
console.log('Father:');
console.log(`  Name: ${student.parents.father.firstName} ${student.parents.father.lastName}`);
console.log(`  Occupation: ${student.parents.father.occupation}`);
console.log(`  Phone: ${student.parents.father.phone}`);
console.log(`  Email: ${student.parents.father.email}`);
console.log(`  Legal Guardian: ${student.parents.father.isLegalGuardian ? 'Yes' : 'No'}`);
console.log(`  Status: ${student.parents.father.status}`);

console.log('\nMother:');
console.log(`  Name: ${student.parents.mother.firstName} ${student.parents.mother.lastName}`);
console.log(`  Occupation: ${student.parents.mother.occupation}`);
console.log(`  Phone: ${student.parents.mother.phone}`);
console.log(`  Email: ${student.parents.mother.email}`);
console.log(`  Legal Guardian: ${student.parents.mother.isLegalGuardian ? 'Yes' : 'No'}`);
console.log(`  Status: ${student.parents.mother.status}`);

console.log(`\nParent Relationship: ${student.parents.relationshipStatus}`);
console.log(`Living Arrangement: ${student.parents.livingArrangement}`);

console.log('\n🏃‍♂️ ACTIVITIES & INTERESTS');
console.log('─'.repeat(40));
console.log(`Extracurricular Activities: ${student.extracurriculars.join(', ')}`);
console.log(`Hobbies: ${student.hobbies.join(', ')}`);

console.log('\nFavorite Activity #1:');
console.log(`  Activity: ${student.favoriteActivity1.name}`);
console.log(`  Description: ${student.favoriteActivity1.description}`);

console.log('\nFavorite Activity #2:');
console.log(`  Activity: ${student.favoriteActivity2.name}`);
console.log(`  Description: ${student.favoriteActivity2.description}`);

console.log('\nFavorite Activity #3:');
console.log(`  Activity: ${student.favoriteActivity3.name}`);
console.log(`  Description: ${student.favoriteActivity3.description}`);

console.log('\n⭐ PERSONALITY ASSESSMENT');
console.log('─'.repeat(40));
console.log(`Adaptability: ${student.personalityRatings.adaptability}/10`);
console.log(`Maturity: ${student.personalityRatings.maturity}/10`);
console.log(`Shy to Outgoing: ${student.personalityRatings.shyToOutgoing}/10`);
console.log(`Outgoing/Fun: ${student.personalityRatings.outgoingFun}/10`);
console.log(`English Level: ${student.personalityRatings.englishLevel}/10`);
console.log(`Positive Attitude: ${student.personalityRatings.positiveAttitude}/10`);
console.log(`Serious to Easygoing: ${student.personalityRatings.seriousToEasygoing}/10`);

console.log('\n🎤 INTERVIEW DETAILS');
console.log('─'.repeat(40));
console.log(`Interview Length: ${student.interview.length}`);
console.log(`Interview Date: ${student.interview.date}`);
console.log(`Interviewer: ${student.interview.interviewer}`);
console.log(`GPA Assessment: ${student.interview.gpaAssessment}`);

console.log('\n📝 STUDENT BIOGRAPHY');
console.log('─'.repeat(40));
console.log(student.studentBio);

console.log('\n💌 DEAR FAMILY LETTER');
console.log('─'.repeat(40));
console.log(student.dearFamilyLetter);

console.log('\n🍽️ DIETARY & PREFERENCES');
console.log('─'.repeat(40));
console.log(`Dietary Restrictions: ${student.dietaryRestrictions}`);
console.log(`Allergies: ${student.allergies}`);
console.log(`Pet Preference: ${student.petPreference}`);

console.log('\n🗣️ LANGUAGES');
console.log('─'.repeat(40));
console.log(`Native Language: ${student.nativeLanguage}`);
console.log('Additional Languages:');
student.additionalLanguages.forEach((lang, index) => {
  console.log(`  ${index + 1}. ${lang.language} - ${lang.years} years (${lang.proficiency})`);
});

console.log('\n🏆 AWARDS & ACHIEVEMENTS');
console.log('─'.repeat(40));
student.awards.forEach((award, index) => {
  console.log(`${index + 1}. ${award.name}`);
  console.log(`   Institution: ${award.institution}`);
  console.log(`   Reason: ${award.reason}`);
  console.log(`   Date: ${award.date}`);
  if (index < student.awards.length - 1) console.log('');
});

console.log('\n🛂 SEVIS INFORMATION');
console.log('─'.repeat(40));
console.log(`SEVIS ID: ${student.sevisId}`);
console.log(`Application Status: ${student.applicationStatus}`);
console.log(`Approval Date: ${student.approvalDate}`);
console.log(`Approved By: ${student.approvedBy}`);
console.log(`Last Action: ${student.lastAction}`);

console.log('\n' + '='.repeat(80));
console.log('This comprehensive data structure matches the detailed');
console.log('application view shown in sevis-processing-student-view.tsx');
console.log('='.repeat(80)); 