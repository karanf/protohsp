/**
 * Split large relationships SQL file into smaller chunks for Supabase import
 */

const fs = require('fs');
const path = require('path');

// Configuration
const inputFile = path.join(__dirname, 'bulk-sql/04_relationships.sql');
const outputDir = path.join(__dirname, 'bulk-sql');
const relationshipsPerFile = 3; // Small chunks of just 3 relationships per file

// Read the relationships SQL file
console.log(`Reading relationships SQL from ${inputFile}...`);
const relationshipsSQL = fs.readFileSync(inputFile, 'utf8');

// Find all INSERT statements
const insertPattern = /INSERT INTO relationships[^;]+;/g;
const inserts = relationshipsSQL.match(insertPattern);

if (!inserts || inserts.length === 0) {
  console.error('No INSERT statements found in the relationships SQL file.');
  process.exit(1);
}

console.log(`Found ${inserts.length} INSERT statements.`);

// Split the inserts into chunks
const chunks = [];
for (let i = 0; i < inserts.length; i += relationshipsPerFile) {
  chunks.push(inserts.slice(i, i + relationshipsPerFile));
}

console.log(`Splitting into ${chunks.length} files...`);

// Create subfiles for relationships
chunks.forEach((chunk, index) => {
  const paddedIndex = String(index + 1).padStart(3, '0');
  const fileName = `04_relationships_${paddedIndex}.sql`;
  const filePath = path.join(outputDir, fileName);
  
  // Write chunk to file
  fs.writeFileSync(filePath, chunk.join('\n\n'));
  console.log(`✅ Created ${fileName} with ${chunk.length} INSERT statements`);
});

// Create a parent file that includes all the chunks for reference
const relationshipsIndexContent = `-- Relationships SQL Index
-- This file is a reference to all the relationship chunks that need to be imported

-- Run each of these files in order:
${chunks.map((_, index) => {
  const paddedIndex = String(index + 1).padStart(3, '0');
  return `-- 04_relationships_${paddedIndex}.sql`;
}).join('\n')}
`;

fs.writeFileSync(path.join(outputDir, '04_relationships_index.sql'), relationshipsIndexContent);
console.log(`✅ Created 04_relationships_index.sql with file listing`);

console.log('\n=== Relationships SQL Split Complete ===');
console.log('To import into Supabase:');
console.log('1. Log into your Supabase dashboard');
console.log('2. Go to the SQL Editor');
console.log('3. Run each relationships SQL file in order (e.g., 04_relationships_001.sql, 04_relationships_002.sql, etc.)');
console.log('   - Use the import-sql-helper.js script to help with the process.'); 