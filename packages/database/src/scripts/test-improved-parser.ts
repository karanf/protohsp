/**
 * Test the improved SQL parser
 */

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
        // Check for escaped quote ('')
        if (nextChar === "'") {
          current += char + nextChar;
          i++; // Skip next quote
        } else {
          inSingleQuote = false;
          // Don't add the closing quote to current
        }
      } else {
        inSingleQuote = true;
        // Don't add the opening quote to current
      }
    } else if (char === '"' && !inSingleQuote) {
      current += char; // Keep quotes for JSON parsing
      inDoubleQuote = !inDoubleQuote;
    } else if (char === ',' && !inSingleQuote && !inDoubleQuote) {
      // Found a delimiter
      values.push(cleanSqlValue(current.trim()));
      current = '';
    } else {
      current += char;
    }

    i++;
  }

  // Add the last value
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
  
  // Remove outer single quotes if present
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1);
  }
  
  return trimmed;
}

// Test with actual SQL values string
function testParser() {
  console.log('🧪 Testing improved SQL parser...\n');
  
  // Test case 1: User data
  const userValuesString = `'3d82a0a0-553a-4fd2-ba14-792d839f634a', 'schowalter_org@example.com', 'sending_org', 'Schowalter', 'Group Students', '(698) 419-7719 x6604', 'https://ui-avatars.com/api/?name=Schowalter%20Group%20Students', 'active', '{"country":"Germany"}', '"2025-03-05T23:04:37.669Z"', '"2025-04-06T20:49:31.341Z"'`;
  
  console.log('📋 Raw user values string:');
  console.log(userValuesString);
  console.log('\n' + '='.repeat(50) + '\n');
  
  const userValues = parseValuesString(userValuesString);
  console.log('✅ Parsed user values:');
  userValues.forEach((value, index) => {
    console.log(`  [${index}]: ${JSON.stringify(value)}`);
  });
  
  console.log('\n' + '='.repeat(70) + '\n');
  
  // Test case 2: Profile data with complex JSON
  const profileValuesString = `'3eccceab-9fdb-4a15-a5cb-195f1411d3c7', '3d82a0a0-553a-4fd2-ba14-792d839f634a', 'sending_org', '{"organization_name":"Schowalter Group Students","country":"Germany","website":"https://blissful-apse.com/","contact_email":"schowalter_org@example.com","contact_phone":"(258) 363-3389 x6820","description":"Sharable empowering emulation","year_established":2003,"programs_offered":["calendar_year","semester"]}', 'active', 'true', '"2025-03-05T23:04:37.669Z"', '"2025-04-06T20:49:31.341Z"'`;
  
  console.log('📋 Raw profile values string:');
  console.log(profileValuesString);
  console.log('\n' + '='.repeat(50) + '\n');
  
  const profileValues = parseValuesString(profileValuesString);
  console.log('✅ Parsed profile values:');
  profileValues.forEach((value, index) => {
    console.log(`  [${index}]: ${JSON.stringify(value)}`);
  });
  
  // Test JSON parsing of the data field
  if (profileValues[3]) {
    try {
      const jsonData = JSON.parse(profileValues[3] as string);
      console.log('\n🎯 Successfully parsed JSON data:');
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (error) {
      console.log('\n❌ Failed to parse JSON data:', error);
    }
  }
}

testParser(); 