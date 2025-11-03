/**
 * Split large profiles SQL file into smaller chunks for Supabase import
 */

const fs = require('fs');
const path = require('path');

// Configuration
const inputFile = path.join(__dirname, 'bulk-sql/03_profiles.sql');
const outputDir = path.join(__dirname, 'bulk-sql');
const profilesPerFile = 3; // Reduced to just 3 profiles per file for much smaller chunks

// Read the profiles SQL file
console.log(`Reading profiles SQL from ${inputFile}...`);
const profilesSQL = fs.readFileSync(inputFile, 'utf8');

// Find all INSERT statements
const insertPattern = /INSERT INTO profiles[^;]+;/g;
const inserts = profilesSQL.match(insertPattern);

if (!inserts || inserts.length === 0) {
  console.error('No INSERT statements found in the profiles SQL file.');
  process.exit(1);
}

console.log(`Found ${inserts.length} INSERT statements.`);

// Split the inserts into chunks
const chunks = [];
for (let i = 0; i < inserts.length; i += profilesPerFile) {
  chunks.push(inserts.slice(i, i + profilesPerFile));
}

console.log(`Splitting into ${chunks.length} files...`);

// Create subfiles for profiles
chunks.forEach((chunk, index) => {
  const paddedIndex = String(index + 1).padStart(2, '0');
  const fileName = `03_profiles_${paddedIndex}.sql`;
  const filePath = path.join(outputDir, fileName);
  
  // Write chunk to file
  fs.writeFileSync(filePath, chunk.join('\n\n'));
  console.log(`✅ Created ${fileName} with ${chunk.length} INSERT statements`);
});

// Create a parent file that includes all the chunks for reference
const profilesIndexContent = `-- Profiles SQL Index
-- This file is a reference to all the profile chunks that need to be imported

-- Run each of these files in order:
${chunks.map((_, index) => {
  const paddedIndex = String(index + 1).padStart(2, '0');
  return `-- 03_profiles_${paddedIndex}.sql`;
}).join('\n')}
`;

fs.writeFileSync(path.join(outputDir, '03_profiles_index.sql'), profilesIndexContent);
console.log(`✅ Created 03_profiles_index.sql with file listing`);

console.log('\n=== Profiles SQL Split Complete ===');
console.log('To import into Supabase:');
console.log('1. Log into your Supabase dashboard');
console.log('2. Go to the SQL Editor');
console.log('3. Run each profiles SQL file in order (e.g., 03_profiles_01.sql, 03_profiles_02.sql, etc.)');
console.log('   - Use the import-sql-helper.js script to help with the process.'); 