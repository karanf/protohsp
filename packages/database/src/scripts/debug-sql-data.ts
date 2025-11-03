import { promises as fs } from 'fs';
import { join } from 'path';

// Read a single SQL file and examine its actual structure
async function debugSqlData() {
  const bulkSqlDir = join(__dirname, 'bulk-sql');
  
  // Read first user file
  const userFile = join(bulkSqlDir, '02_users_1.sql');
  const userContent = await fs.readFile(userFile, 'utf-8');
  
  console.log('📄 First 500 characters of user SQL file:');
  console.log(userContent.substring(0, 500));
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Parse and show first user record
  const insertRegex = /INSERT INTO .* VALUES\s*\(([^)]+)\)/gi;
  let match = insertRegex.exec(userContent);
  
  if (match) {
    const valuesString = match[1];
    console.log('📋 Raw SQL values string:');
    console.log(valuesString);
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Parse values manually 
    const values = valuesString.split(',').map(v => v.trim());
    console.log('📊 Parsed values array:');
    values.forEach((value, index) => {
      console.log(`  [${index}]: ${value}`);
    });
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Show what would be converted
    console.log('🔄 Would be converted to user object:');
    const userObj = {
      id: values[0] || '',
      email: values[1] || '',
      role: values[2] || 'student',
      firstName: values[3] || '',
      lastName: values[4] || '',
      phone: values[5] || undefined,
      avatarUrl: values[6] || undefined,
      status: values[7] || 'active',
      metadata: values[8] ? JSON.stringify(values[8]) : undefined,
      createdAt: values[9],
      updatedAt: values[10]
    };
    console.log(JSON.stringify(userObj, null, 2));
  }
  
  console.log('\n' + '='.repeat(70) + '\n');
  
  // Also check profile file
  const profileFile = join(bulkSqlDir, '03_profiles_1.sql');
  const profileContent = await fs.readFile(profileFile, 'utf-8');
  
  console.log('📄 First 500 characters of profile SQL file:');
  console.log(profileContent.substring(0, 500));
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Parse and show first profile record
  insertRegex.lastIndex = 0; // Reset regex
  match = insertRegex.exec(profileContent);
  
  if (match) {
    const valuesString = match[1];
    console.log('📋 Raw profile SQL values string:');
    console.log(valuesString);
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Parse values manually 
    const values = valuesString.split(',').map(v => v.trim());
    console.log('📊 Parsed profile values array:');
    values.forEach((value, index) => {
      console.log(`  [${index}]: ${value}`);
    });
  }
}

debugSqlData().catch(console.error); 