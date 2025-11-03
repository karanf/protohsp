/**
 * Split large users SQL file into smaller chunks for Supabase import
 */

const fs = require('fs');
const path = require('path');

// Configuration
const inputFile = path.join(__dirname, 'bulk-sql/02_users.sql');
const outputDir = path.join(__dirname, 'bulk-sql');
const usersPerFile = 3; // Small chunks of just 3 users per file

// Read the users SQL file
console.log(`Reading users SQL from ${inputFile}...`);
const usersSQL = fs.readFileSync(inputFile, 'utf8');

// Find all INSERT statements
const insertPattern = /INSERT INTO users[^;]+;/g;
const inserts = usersSQL.match(insertPattern);

if (!inserts || inserts.length === 0) {
  console.error('No INSERT statements found in the users SQL file.');
  process.exit(1);
}

console.log(`Found ${inserts.length} INSERT statements.`);

// Split the inserts into chunks
const chunks = [];
for (let i = 0; i < inserts.length; i += usersPerFile) {
  chunks.push(inserts.slice(i, i + usersPerFile));
}

console.log(`Splitting into ${chunks.length} files...`);

// Create subfiles for users
chunks.forEach((chunk, index) => {
  const paddedIndex = String(index + 1).padStart(3, '0');
  const fileName = `02_users_${paddedIndex}.sql`;
  const filePath = path.join(outputDir, fileName);
  
  // Write chunk to file
  fs.writeFileSync(filePath, chunk.join('\n\n'));
  console.log(`✅ Created ${fileName} with ${chunk.length} INSERT statements`);
});

// Create a parent file that includes all the chunks for reference
const usersIndexContent = `-- Users SQL Index
-- This file is a reference to all the user chunks that need to be imported

-- Run each of these files in order:
${chunks.map((_, index) => {
  const paddedIndex = String(index + 1).padStart(3, '0');
  return `-- 02_users_${paddedIndex}.sql`;
}).join('\n')}
`;

fs.writeFileSync(path.join(outputDir, '02_users_index.sql'), usersIndexContent);
console.log(`✅ Created 02_users_index.sql with file listing`);

console.log('\n=== Users SQL Split Complete ===');
console.log('To import into Supabase:');
console.log('1. Log into your Supabase dashboard');
console.log('2. Go to the SQL Editor');
console.log('3. Run each users SQL file in order (e.g., 02_users_001.sql, 02_users_002.sql, etc.)');
console.log('   - Use the import-sql-helper.js script to help with the process.'); 