import { adminDb } from '../client';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Improved SQL parser (copied from the fixed version)
function parseValuesString(valuesString: string): (string | null)[] {
  const values: (string | null)[] = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let escapeNext = false;
  let i = 0;

  while (i < valuesString.length) {
    const char = valuesString[i];
    const nextChar = valuesString[i + 1];

    if (escapeNext) {
      current += char;
      escapeNext = false;
    } else if (char === '\\') {
      escapeNext = true;
      current += char;
    } else if (char === "'" && !inDoubleQuote) {
      if (inSingleQuote) {
        if (nextChar === "'") {
          current += char + nextChar;
          i++; // Skip next quote
        } else {
          inSingleQuote = false;
        }
      } else {
        inSingleQuote = true;
      }
    } else if (char === '"' && !inSingleQuote) {
      current += char; // Keep quotes for JSON parsing
      inDoubleQuote = !inDoubleQuote;
    } else if (char === ',' && !inSingleQuote && !inDoubleQuote) {
      values.push(cleanSqlValue(current.trim()));
      current = '';
    } else {
      current += char;
    }

    i++;
  }

  if (current.trim()) {
    values.push(cleanSqlValue(current.trim()));
  }

  return values;
}

function cleanSqlValue(value: string): string | null {
  const trimmed = value.trim();
  
  if (trimmed === 'NULL' || trimmed === 'null') {
    return null;
  }
  
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1);
  }
  
  return trimmed;
}

function cleanDate(dateValue: string | null): Date {
  if (!dateValue) return new Date();
  
  let cleaned = dateValue;
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  
  try {
    const date = new Date(cleaned);
    if (isNaN(date.getTime())) {
      return new Date();
    }
    return date;
  } catch {
    return new Date();
  }
}

async function migrateCoreFieldsOnly() {
  if (!adminDb) {
    console.error('❌ AdminDB not available');
    return;
  }

  const sqlDir = join(__dirname, '../scripts/bulk-sql');
  
  try {
    // Read first user file for testing
    const userFiles = readdirSync(sqlDir).filter(f => f.startsWith('02_users_'));
    if (userFiles.length === 0) {
      throw new Error('No user SQL files found');
    }
    
    console.log('📄 Reading user file:', userFiles[0]);
    const userContent = readFileSync(join(sqlDir, userFiles[0]), 'utf8');
    
    // Extract first few users only for testing
    const lines = userContent.split('\n').filter(line => line.trim().startsWith('INSERT INTO users'));
    const firstLine = lines[0];
    
    if (!firstLine) {
      throw new Error('No INSERT statements found');
    }
    
    console.log('🔍 Processing first user line...');
    const valuesMatch = firstLine.match(/VALUES\s*\(([^)]+)\)/);
    if (!valuesMatch) {
      throw new Error('Could not extract VALUES from SQL');
    }
    
    const values = parseValuesString(valuesMatch[1]);
    console.log('📊 Parsed values:', values.slice(0, 5).map((v, i) => `[${i}]: ${JSON.stringify(v)}`).join(', '));
    
    // Create user with only CORE fields that definitely work
    const coreUserData = {
      email: values[1] || 'test@example.com',
      role: values[2] || 'student',
      firstName: values[3] || 'Test',
      lastName: values[4] || 'User',
      status: values[7] || 'active',
      createdAt: cleanDate(values[9]),
      updatedAt: cleanDate(values[10])
    };
    
    console.log('✅ Core user data (no optional fields):');
    console.log(JSON.stringify(coreUserData, null, 2));
    
    // Test core fields migration
    const userId = uuidv4();
    console.log('🔄 Testing core fields migration...');
    
    const userEntity = adminDb.tx.users[userId];
    if (!userEntity) {
      throw new Error('User entity not found');
    }
    
    const transaction = userEntity.update(coreUserData);
    await adminDb.transact([transaction]);
    console.log('✅ Core fields migration successful!');
    
    // Now try adding phone field
    console.log('\n🔄 Testing with phone field...');
    const userWithPhone = { ...coreUserData, phone: values[5] || '+1234567890' };
    const phoneUserId = uuidv4();
    
    const phoneUserEntity = adminDb.tx.users[phoneUserId];
    if (!phoneUserEntity) {
      throw new Error('Phone user entity not found');
    }
    
    const phoneTransaction = phoneUserEntity.update(userWithPhone);
    await adminDb.transact([phoneTransaction]);
    console.log('✅ Phone field works!');
    
    // Now the problematic field test
    console.log('\n🔄 Testing ONE problematic field at a time...');
    
    // Test avatarUrl alone
    try {
      const userWithAvatar = { ...coreUserData, email: 'avatar-test@example.com' };
      // Skip avatarUrl for now since we know it fails
      console.log('⏭️  Skipping avatarUrl (known to fail due to schema)');
    } catch (error) {
      console.log('❌ avatarUrl failed:', error);
    }
    
    // Test metadata alone  
    try {
      console.log('⏭️  Skipping metadata (known to fail due to schema)');
    } catch (error) {
      console.log('❌ metadata failed:', error);
    }
    
    console.log('\n🎯 SUCCESS! Core fields migration works perfectly.');
    console.log('📋 Next steps:');
    console.log('1. Update InstantDB schema in dashboard to add avatarUrl and metadata fields');
    console.log('2. Run full migration with all fields once schema is updated');
    console.log('3. Use migrate-bulk-sql-to-instantdb.ts for complete migration');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrateCoreFieldsOnly(); 