/**
 * Update Supabase Schema Helper
 * This script helps you update the Supabase schema by copying the schema SQL to clipboard
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const schemaPath = path.join(__dirname, '..', 'schema', 'supabase-schema.sql');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get the clipboard command based on OS
const getClipboardCommand = () => {
  const platform = process.platform;
  
  if (platform === 'darwin') return 'pbcopy';
  if (platform === 'win32') return 'clip';
  return 'xclip -selection clipboard'; // Linux and others
};

// Copy SQL file content to clipboard
const copyToClipboard = (filePath) => {
  if (!fs.existsSync(filePath)) {
    console.error(`Error: Schema file not found at ${filePath}`);
    return false;
  }

  const sqlContent = fs.readFileSync(filePath, 'utf8');
  const clipCommand = getClipboardCommand();
  
  try {
    execSync(clipCommand, { input: sqlContent });
    return true;
  } catch (error) {
    console.error(`Error copying to clipboard: ${error.message}`);
    return false;
  }
};

const updateSchema = async () => {
  console.log('\n=== Supabase Schema Update Helper ===');
  console.log('This tool will help you update the Supabase database schema.\n');
  
  console.log('Instructions:');
  console.log('1. Log into your Supabase dashboard');
  console.log('2. Go to the SQL Editor');
  console.log('3. We will copy the schema SQL to your clipboard');
  console.log('4. You will paste and run the SQL in the Supabase SQL Editor');
  console.log('5. This will create or update all tables in your database\n');
  
  console.log(`Schema file: ${schemaPath}`);
  
  await new Promise(resolve => {
    rl.question(`Press Enter to copy the schema SQL to clipboard...`, () => {
      if (copyToClipboard(schemaPath)) {
        console.log(`✅ Schema SQL copied to clipboard!`);
        console.log('Now:');
        console.log('  1. Open a new query in the Supabase SQL Editor');
        console.log('  2. Paste the SQL (Ctrl+V or Cmd+V)');
        console.log('  3. Click "Run" to execute the SQL and update your schema');
        console.log('\n⚠️ WARNING: This may modify existing tables. Consider backing up your data first.');
      }
      resolve();
    });
  });
  
  console.log('\nAfter updating the schema, you should:');
  console.log('1. Run "pnpm generate-types" to update TypeScript types');
  console.log('2. Generate new mock data with "pnpm generate-mock-data" and "pnpm generate-bulk-sql"');
  console.log('3. Import the mock data with "pnpm import-sql"\n');
  
  rl.close();
};

// Start the process
updateSchema().catch(error => {
  console.error('Error:', error);
  rl.close();
}); 