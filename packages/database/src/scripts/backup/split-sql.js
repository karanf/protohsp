/**
 * Script to split large SQL file into smaller chunks for Supabase SQL Editor
 */

const fs = require('fs');
const path = require('path');

// Configuration
const inputFile = path.join(__dirname, 'mock-data.sql');
const outputDir = path.join(__dirname, 'split-sql');
const maxChunkSize = 1800000; // ~1.8MB per file, doubled again

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Read the input SQL file
console.log(`Reading SQL file from: ${inputFile}`);
const sqlContent = fs.readFileSync(inputFile, 'utf8');

// Extract SQL statements by type
const setupStatements = [];
const userStatements = [];
const profileStatements = [];
const relationshipStatements = [];

// Split the SQL into statements
const statements = sqlContent.split(';').map(s => s.trim()).filter(s => s.length > 0);

statements.forEach(statement => {
  if (statement.includes('TRUNCATE') || statement.includes('--')) {
    setupStatements.push(statement);
  } else if (statement.includes('INSERT INTO users')) {
    userStatements.push(statement);
  } else if (statement.includes('INSERT INTO profiles')) {
    profileStatements.push(statement);
  } else if (statement.includes('INSERT INTO relationships')) {
    relationshipStatements.push(statement);
  }
});

// Ensure each statement ends with a semicolon
const formatStatements = (statements) => {
  if (!Array.isArray(statements)) {
    // If it's a single statement
    return statements + ';';
  }
  return statements.map(s => s + ';').join('\n\n');
};

// Helper function to split an INSERT statement into multiple smaller statements
function splitInsertStatement(insertSQL, tableName) {
  const [insertHeader, valuesStr] = insertSQL.split('VALUES');
  const valuesList = valuesStr.trim().slice(0, -1); // Remove trailing semicolon
  
  // Split the values by commas, but only at the top level (not inside parentheses)
  let values = [];
  let currentValue = '';
  let depth = 0;
  
  for (let i = 0; i < valuesList.length; i++) {
    const char = valuesList[i];
    
    if (char === '(') depth++;
    if (char === ')') depth--;
    
    // Only split at commas at the top level
    if (char === ',' && depth === 0) {
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  // Add the last value
  if (currentValue.trim()) {
    values.push(currentValue.trim());
  }
  
  // Chunk the values into smaller inserts
  const chunks = [];
  let currentChunk = [];
  let currentChunkSize = 0;
  
  for (const value of values) {
    // If adding this value would make the chunk too large, create a new chunk
    if (currentChunkSize + value.length > maxChunkSize && currentChunk.length > 0) {
      const chunkSQL = `${insertHeader} VALUES ${currentChunk.join(',')};`;
      chunks.push(chunkSQL);
      currentChunk = [];
      currentChunkSize = 0;
    }
    
    currentChunk.push(value);
    currentChunkSize += value.length;
  }
  
  // Add the last chunk
  if (currentChunk.length > 0) {
    const chunkSQL = `${insertHeader} VALUES ${currentChunk.join(',')};`;
    chunks.push(chunkSQL);
  }
  
  return chunks;
}

// Split each INSERT statement
const userChunks = userStatements.length > 0 ? 
  userStatements.flatMap(statement => splitInsertStatement(statement, 'users')) : 
  [];
const profileChunks = profileStatements.length > 0 ? 
  profileStatements.flatMap(statement => splitInsertStatement(statement, 'profiles')) : 
  [];
const relationshipChunks = relationshipStatements.length > 0 ? 
  relationshipStatements.flatMap(statement => splitInsertStatement(statement, 'relationships')) : 
  [];

// Write the chunks to separate files
let fileIndex = 1;

// Write the setup file
const setupFile = path.join(outputDir, `01_setup.sql`);
fs.writeFileSync(setupFile, formatStatements(setupStatements));
console.log(`✅ Wrote setup file: ${setupFile}`);

// Write the user chunks
userChunks.forEach((chunk, index) => {
  const fileName = path.join(outputDir, `02_users_${index + 1}.sql`);
  fs.writeFileSync(fileName, formatStatements(chunk));
  console.log(`✅ Wrote user chunk ${index + 1}: ${fileName}`);
});

// Write the profile chunks
profileChunks.forEach((chunk, index) => {
  const fileName = path.join(outputDir, `03_profiles_${index + 1}.sql`);
  fs.writeFileSync(fileName, formatStatements(chunk));
  console.log(`✅ Wrote profile chunk ${index + 1}: ${fileName}`);
});

// Write the relationship chunks
relationshipChunks.forEach((chunk, index) => {
  const fileName = path.join(outputDir, `04_relationships_${index + 1}.sql`);
  fs.writeFileSync(fileName, formatStatements(chunk));
  console.log(`✅ Wrote relationship chunk ${index + 1}: ${fileName}`);
});

console.log('\n=== SQL Split Complete ===');
console.log(`Total chunks created: ${userChunks.length + profileChunks.length + relationshipChunks.length + 1}`);
console.log('To import into Supabase:');
console.log('1. Log into your Supabase dashboard');
console.log('2. Go to the SQL Editor');
console.log('3. Run each SQL file in order:');
console.log('   - First run 01_setup.sql');
console.log('   - Then run all user files (02_users_*.sql)');
console.log('   - Then run all profile files (03_profiles_*.sql)');
console.log('   - Finally run all relationship files (04_relationships_*.sql)'); 