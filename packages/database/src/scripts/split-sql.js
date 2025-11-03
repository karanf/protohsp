/**
 * SQL Splitter Script
 * 
 * This script splits the large mock-data.sql file into smaller chunks
 * that can be imported into Supabase more easily
 */

const fs = require('fs');
const path = require('path');

const sqlFile = path.join(__dirname, 'mock-data.sql');
const outputDir = path.join(__dirname, 'bulk-sql');

// Read the SQL file
const sqlContent = fs.readFileSync(sqlFile, 'utf8');

// Extract the setup section (everything before the first INSERT)
const setupEndIndex = sqlContent.indexOf('INSERT INTO');
const setupSection = sqlContent.substring(0, setupEndIndex);

// Function to extract INSERT statements by table name
function extractInserts(content, tableName) {
  const regex = new RegExp(`INSERT INTO ${tableName}[\\s\\S]*?;`, 'g');
  return content.match(regex) || [];
}

// Extract all INSERT statements
const userInserts = extractInserts(sqlContent, 'users');
const profileInserts = extractInserts(sqlContent, 'profiles');
const relationshipInserts = extractInserts(sqlContent, 'relationships');

console.log(`Found ${userInserts.length} user inserts`);
console.log(`Found ${profileInserts.length} profile inserts`);
console.log(`Found ${relationshipInserts.length} relationship inserts`);

// Function to split a section into chunks
function splitIntoChunks(inserts, prefix, chunkSize) {
  const chunkCount = Math.ceil(inserts.length / chunkSize);
  console.log(`Splitting ${prefix} into ${chunkCount} chunks`);
  
  const chunks = [];
  for (let i = 0; i < chunkCount; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, inserts.length);
    const chunk = inserts.slice(start, end).join('\n');
    chunks.push(chunk);
  }
  
  return chunks;
}

// Write setup file
fs.writeFileSync(path.join(outputDir, '01_setup.sql'), setupSection);
console.log('✅ Created 01_setup.sql');

// Split and write user chunks - users are smaller, so 300 per chunk is fine
const userChunks = splitIntoChunks(userInserts, 'Users', 300);
userChunks.forEach((chunk, index) => {
  const fileName = `02_users_${index + 1}.sql`;
  fs.writeFileSync(path.join(outputDir, fileName), chunk);
  console.log(`✅ Created ${fileName}`);
});

// Split and write profile chunks - profiles are very large, use very small chunks
// 20 profiles per chunk to handle large JSON data
const profileChunks = splitIntoChunks(profileInserts, 'Profiles', 20);
profileChunks.forEach((chunk, index) => {
  const fileName = `03_profiles_${index + 1}.sql`;
  fs.writeFileSync(path.join(outputDir, fileName), chunk);
  console.log(`✅ Created ${fileName}`);
});

// Split and write relationship chunks
const relationshipChunks = splitIntoChunks(relationshipInserts, 'Relationships', 300);
relationshipChunks.forEach((chunk, index) => {
  const fileName = `04_relationships_${index + 1}.sql`;
  fs.writeFileSync(path.join(outputDir, fileName), chunk);
  console.log(`✅ Created ${fileName}`);
});

console.log('\n🎉 SQL splitting complete! Files are ready to be imported.');
console.log('Use the import-sql-helper-split.js script to import the files:');
console.log('node import-sql-helper-split.js'); 