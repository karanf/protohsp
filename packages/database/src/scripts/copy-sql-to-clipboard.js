/**
 * This script copies the mock-data.sql file to the clipboard
 * so you can easily paste it into the Supabase SQL editor
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the SQL file path
const sqlFilePath = process.argv[2] || path.join(__dirname, 'bulk-sql', '02_users.sql');
const outputFile = process.argv[3] || '';

console.log(`Reading SQL file from: ${sqlFilePath}`);

if (!fs.existsSync(sqlFilePath)) {
  console.error(`Error: SQL file not found at ${sqlFilePath}`);
  console.log('Available options:');
  console.log('- 01_setup.sql: Setup SQL to clear tables');
  console.log('- 02_users.sql: SQL for users table');
  console.log('- 03_profiles.sql: SQL for profiles table');
  console.log('- 04_relationships.sql: SQL for relationships table');
  process.exit(1);
}

const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Detect operating system and use appropriate clipboard command
const platform = process.platform;
let clipboardCommand;

if (platform === 'darwin') {
  // macOS
  clipboardCommand = 'pbcopy';
} else if (platform === 'win32') {
  // Windows
  clipboardCommand = 'clip';
} else {
  // Linux and others
  clipboardCommand = 'xclip -selection clipboard';
}

// Copy to clipboard
try {
  execSync(clipboardCommand, { input: sqlContent });
  console.log('✅ SQL copied to clipboard!');
  console.log('Now you can paste it into the Supabase SQL Editor by:');
  console.log('1. Log into your Supabase dashboard');
  console.log('2. Go to the SQL Editor');
  console.log('3. Open a new query');
  console.log('4. Paste the SQL (Ctrl+V or Cmd+V)');
  console.log('5. Click "Run" to execute the SQL and populate your database');
  
  if (outputFile) {
    fs.writeFileSync(outputFile, sqlContent);
    console.log(`✅ SQL also saved to ${outputFile}`);
  }
  
  // Count records in the SQL file
  const userMatches = sqlContent.match(/^INSERT INTO users/gm);
  const profileMatches = sqlContent.match(/^INSERT INTO profiles/gm);
  const relationshipMatches = sqlContent.match(/^INSERT INTO relationships/gm);
  
  console.log('\nThe SQL file contains:');
  console.log(`- ${userMatches ? userMatches.length : 0} user records`);
  console.log(`- ${profileMatches ? profileMatches.length : 0} profile records`);
  console.log(`- ${relationshipMatches ? relationshipMatches.length : 0} relationship records`);
  
} catch (error) {
  console.error('Error copying to clipboard:', error.message);
  process.exit(1);
} 