/**
 * Import SQL Helper for Supabase
 * This script guides the user through importing all SQL files in sequence
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const sqlDir = path.join(__dirname, 'bulk-sql');
const files = [
  '01_setup.sql',
  '02_users.sql',
  '03_profiles.sql',
  '04_relationships.sql'
];

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

// Process each file in sequence
const processFiles = async () => {
  console.log('\n=== Supabase SQL Import Helper ===');
  console.log('This tool will help you import the SQL files into your Supabase database.\n');
  
  console.log('Instructions:');
  console.log('1. Log into your Supabase dashboard');
  console.log('2. Go to the SQL Editor');
  console.log('3. For each file, we will copy the content to your clipboard');
  console.log('4. You will paste and run the SQL in the Supabase SQL Editor');
  console.log('5. After confirming the import was successful, we will proceed to the next file\n');
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(sqlDir, file);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }
    
    console.log(`\n[${i+1}/${files.length}] Processing ${file}...`);
    
    await new Promise(resolve => {
      rl.question(`Press Enter to copy ${file} to clipboard...`, () => {
        if (copyToClipboard(filePath)) {
          console.log(`✅ ${file} copied to clipboard!`);
          console.log('Now:');
          console.log('  1. Open a new query in the Supabase SQL Editor');
          console.log('  2. Paste the SQL (Ctrl+V or Cmd+V)');
          console.log('  3. Click "Run" to execute the SQL');
        }
        resolve();
      });
    });
    
    if (i < files.length - 1) {
      await new Promise(resolve => {
        rl.question('\nPress Enter when the SQL has been successfully executed in Supabase...', resolve);
      });
    }
  }
  
  console.log('\n🎉 All SQL files have been imported!');
  console.log('Your Supabase database should now be populated with mock data.\n');
  
  rl.close();
};

// Start the process
processFiles().catch(error => {
  console.error('Error:', error);
  rl.close();
}); 