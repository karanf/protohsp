/**
 * Import SQL Helper for Supabase (with split SQL files support)
 * This script guides the user through importing all SQL files in sequence
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const sqlDir = path.join(__dirname, 'bulk-sql');

// Find all SQL files matching a pattern
const getSQLFiles = (pattern) => {
  const files = fs.readdirSync(sqlDir);
  return files
    .filter(file => file.match(pattern))
    .sort((a, b) => {
      const numA = parseInt(a.match(/(\d+)\.sql$/)[1]);
      const numB = parseInt(b.match(/(\d+)\.sql$/)[1]);
      return numA - numB;
    });
};

// Get all files in sequence
const getFiles = () => {
  const files = ['01_setup.sql'];
  
  // Get user files
  const userFiles = getSQLFiles(/^02_users_\d+\.sql$/);
  if (userFiles.length === 0) {
    console.warn('No user chunks found. Using original users SQL file.');
    files.push('02_users.sql');
  } else {
    files.push(...userFiles);
  }
  
  // Get profile files
  const profileFiles = getSQLFiles(/^03_profiles_\d+\.sql$/);
  if (profileFiles.length === 0) {
    console.warn('No profile chunks found. Using original profiles SQL file.');
    files.push('03_profiles.sql');
  } else {
    files.push(...profileFiles);
  }
  
  // Get relationship files
  const relationshipFiles = getSQLFiles(/^04_relationships_\d+\.sql$/);
  if (relationshipFiles.length === 0) {
    console.warn('No relationship chunks found. Using original relationships SQL file.');
    files.push('04_relationships.sql');
  } else {
    files.push(...relationshipFiles);
  }
  
  return files;
};

const files = getFiles();

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

// Create a smaller chunk from a file if needed
const createSmallerChunk = (filePath) => {
  console.log('Creating smaller chunks from file...');
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Split by INSERT statements
  const statements = content.split('\n').filter(line => line.trim().startsWith('INSERT'));
  
  if (statements.length <= 1) {
    console.log('File only contains one statement, cannot split further.');
    return null;
  }
  
  // Split into half
  const halfIndex = Math.ceil(statements.length / 2);
  const firstHalf = statements.slice(0, halfIndex).join('\n');
  const secondHalf = statements.slice(halfIndex).join('\n');
  
  // Write to temporary files
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  
  const baseName = path.basename(filePath, '.sql');
  const firstHalfPath = path.join(tempDir, `${baseName}_1.sql`);
  const secondHalfPath = path.join(tempDir, `${baseName}_2.sql`);
  
  fs.writeFileSync(firstHalfPath, firstHalf);
  fs.writeFileSync(secondHalfPath, secondHalf);
  
  console.log(`Split into 2 files: ${firstHalfPath} and ${secondHalfPath}`);
  return [firstHalfPath, secondHalfPath];
};

// Process each file in sequence
const processFiles = async () => {
  console.log('\n=== Supabase SQL Import Helper (with split files) ===');
  console.log('This tool will help you import the SQL files into your Supabase database.\n');
  
  console.log(`Files to import (${files.length} total):`);
  files.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });
  console.log('');
  
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
    
    let processed = false;
    while (!processed) {
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
      
      const response = await new Promise(resolve => {
        rl.question('\nDid the import succeed? (y/n/retry/skip): ', answer => {
          resolve(answer.toLowerCase());
        });
      });
      
      if (response === 'y' || response === 'yes') {
        processed = true;
      } else if (response === 'skip') {
        console.log(`Skipping ${file}...`);
        processed = true;
      } else if (response === 'retry') {
        console.log(`Retrying ${file}...`);
        // Try again with the same file
      } else {
        // Failed - offer to split the file
        const splitOption = await new Promise(resolve => {
          rl.question('Would you like to split this file into smaller chunks? (y/n): ', answer => {
            resolve(answer.toLowerCase());
          });
        });
        
        if (splitOption === 'y' || splitOption === 'yes') {
          const smallerChunks = createSmallerChunk(filePath);
          if (smallerChunks) {
            console.log('Please import these chunks manually:');
            smallerChunks.forEach(chunkPath => {
              console.log(`- ${chunkPath}`);
            });
            processed = true;
          } else {
            console.log('Could not split file further. Try importing this file manually later.');
            processed = true;
          }
        } else {
          console.log('Try importing this file manually later.');
          processed = true;
        }
      }
    }
  }
  
  console.log('\n🎉 All SQL files have been processed!');
  console.log('Your Supabase database should now be populated with mock data.\n');
  
  rl.close();
};

// Start the process
processFiles().catch(error => {
  console.error('Error:', error);
  rl.close();
}); 