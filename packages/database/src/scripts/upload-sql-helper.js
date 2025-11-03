/**
 * Helper script to copy split SQL files to clipboard one by one
 * This makes it easier to upload large datasets to Supabase SQL Editor
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// Configuration
const splitSqlDir = path.join(__dirname, 'split-sql');
const files = fs.readdirSync(splitSqlDir)
  .filter(file => file.endsWith('.sql'))
  .sort((a, b) => {
    // Ensure files are processed in the correct order
    // 01_setup.sql comes first
    // Then 02_users_*.sql
    // Then 03_profiles_*.sql
    // Then 04_relationships_*.sql
    
    const aPrefix = a.split('_')[0];
    const bPrefix = b.split('_')[0];
    
    if (aPrefix !== bPrefix) {
      return parseInt(aPrefix) - parseInt(bPrefix);
    }
    
    // If prefixes match, compare the indices
    const aMatch = a.match(/(\d+)\.sql$/);
    const bMatch = b.match(/(\d+)\.sql$/);
    
    if (aMatch && bMatch) {
      return parseInt(aMatch[1]) - parseInt(bMatch[1]);
    }
    
    return a.localeCompare(b);
  });

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== Supabase SQL Upload Helper ===');
console.log(`Found ${files.length} SQL files to upload in correct order.`);
console.log('This script will:');
console.log('1. Display each SQL file name');
console.log('2. Copy its content to your clipboard');
console.log('3. Wait for you to confirm that you\'ve uploaded it to Supabase');
console.log('4. Move to the next file\n');

// Function to copy text to clipboard
function copyToClipboard(text) {
  try {
    // Detect platform
    const platform = process.platform;
    
    if (platform === 'darwin') {
      // macOS
      const proc = execSync('pbcopy', { input: text });
      return true;
    } else if (platform === 'win32') {
      // Windows
      const proc = execSync('clip', { input: text });
      return true;
    } else {
      // Linux (requires xclip)
      try {
        const proc = execSync('xclip -selection clipboard', { input: text });
        return true;
      } catch (error) {
        console.error('Error copying to clipboard. Make sure xclip is installed on Linux.');
        return false;
      }
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

// Process files one by one
function processNextFile(index) {
  if (index >= files.length) {
    console.log('\n✅ All SQL files have been processed!');
    console.log('Your Supabase database should now be populated with the mock data.');
    rl.close();
    return;
  }
  
  const file = files[index];
  const filePath = path.join(splitSqlDir, file);
  
  // Get file size in KB
  const stats = fs.statSync(filePath);
  const fileSizeKB = Math.round(stats.size / 1024);
  
  console.log(`\n[${index + 1}/${files.length}] Processing: ${file} (${fileSizeKB} KB)`);
  
  // Read file content
  const sqlContent = fs.readFileSync(filePath, 'utf8');
  
  // Copy to clipboard
  const copied = copyToClipboard(sqlContent);
  
  if (copied) {
    console.log('✅ SQL copied to clipboard! Now:');
    console.log('1. Go to Supabase SQL Editor');
    console.log('2. Create a new query');
    console.log('3. Paste the SQL (Ctrl+V or Cmd+V)');
    console.log('4. Run the query');
    
    rl.question('\nAfter you\'ve run the query in Supabase, press Enter to continue to the next file...', () => {
      processNextFile(index + 1);
    });
  } else {
    console.log('❌ Failed to copy SQL to clipboard. Please manually copy from the file:');
    console.log(filePath);
    
    rl.question('\nAfter you\'ve run the query in Supabase, press Enter to continue to the next file...', () => {
      processNextFile(index + 1);
    });
  }
}

// Start processing with the first file
processNextFile(0); 