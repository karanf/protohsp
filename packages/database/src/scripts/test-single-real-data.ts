import { adminDb } from '../client';
import { v4 as uuidv4 } from 'uuid';

// Copy of the improved parser functions
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
  
  // Remove surrounding quotes if present
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

async function testRealUserData() {
  if (!adminDb) {
    console.error('❌ AdminDB not available');
    return;
  }

  // Real SQL values from your data
  const userValuesString = `'3d82a0a0-553a-4fd2-ba14-792d839f634a', 'schowalter_org@example.com', 'sending_org', 'Schowalter', 'Group Students', '(698) 419-7719 x6604', 'https://ui-avatars.com/api/?name=Schowalter%20Group%20Students', 'active', '{"country":"Germany"}', '"2025-03-05T23:04:37.669Z"', '"2025-04-06T20:49:31.341Z"'`;
  
  console.log('🧪 Testing real user data from SQL...');
  
  // Parse the SQL values
  const values = parseValuesString(userValuesString);
  
  // Convert to user object matching InstantDB schema
  const userData = {
    email: values[1] || '',
    role: values[2] || 'student',
    firstName: values[3] || '',
    lastName: values[4] || '',
    phone: values[5] || undefined,
    avatarUrl: values[6] || undefined,
    status: values[7] || 'active',
    metadata: values[8] ? JSON.parse(values[8]) : undefined,
    createdAt: cleanDate(values[9]),
    updatedAt: cleanDate(values[10])
  };
  
  console.log('📋 Converted user data:');
  console.log(JSON.stringify(userData, null, 2));

  try {
    if (!adminDb.tx?.users) {
      throw new Error('Users transaction not available');
    }
    
    // Use UUID for InstantDB
    const newUserId = uuidv4();
    console.log('🆔 Generated UUID:', newUserId);
    
    const userEntity = adminDb.tx.users[newUserId];
    if (!userEntity) {
      throw new Error(`User entity not found for ID: ${newUserId}`);
    }
    
    const userTransaction = userEntity.update(userData);
    if (!userTransaction) {
      throw new Error('Failed to create user transaction');
    }
    
    await adminDb.transact([userTransaction]);
    console.log('✅ Real user data uploaded successfully to InstantDB!');
    
  } catch (error: any) {
    console.error('❌ Test failed:', error);
    if (error?.body) {
      console.error('Error details:', JSON.stringify(error.body, null, 2));
    }
  }
}

testRealUserData(); 