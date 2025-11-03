import { promises as fs } from 'fs';
import { join } from 'path';
import { adminDb } from '../client';
import { v4 as uuidv4 } from 'uuid';

interface ParsedUser {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  status: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface ParsedProfile {
  id: string;
  userId: string;
  type: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: any;
  bio?: string;
  interests?: string[];
  languages?: string[];
  emergencyContact?: any;
  preferences?: any;
  documents?: any[];
  status: string;
  isActive: boolean;
  data?: any;
  createdAt: string;
  updatedAt: string;
}

interface ParsedRelationship {
  id: string;
  type: string;
  primaryId: string;
  secondaryId: string;
  status: string;
  startDate?: string;
  endDate?: string;
  data?: any;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parse SQL INSERT statements to extract data
 */
function parseSqlInserts(sqlContent: string, tableName: string): any[] {
  const insertRegex = new RegExp(
    `INSERT INTO ${tableName}\\s*\\([^)]+\\)\\s*VALUES\\s*\\(([^;]+)\\);`,
    'gi'
  );
  
  const results: any[] = [];
  let match;
  
  while ((match = insertRegex.exec(sqlContent)) !== null) {
    const valuesString = match[1];
    if (!valuesString) {
      console.warn('No values string found in SQL INSERT statement');
      continue;
    }
    try {
      // Parse the values - this is a simplified parser
      // In production, you'd want a more robust SQL parser
      const values = parseValuesString(valuesString);
      results.push(values);
    } catch (error) {
      console.warn('Failed to parse SQL values:', error);
    }
  }
  
  return results;
}

/**
 * Properly parse SQL VALUES string handling quoted strings and JSON
 */
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

/**
 * Clean individual SQL value - remove quotes and handle NULL
 */
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

function tryParseJSON(value: string): any {
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('Failed to parse JSON:', value, error);
    return value; // Return as string if parsing fails
  }
}

function cleanDate(dateValue: string | null): string {
  if (!dateValue) return new Date().toISOString();
  
  // Remove surrounding quotes if present (common in the SQL data)
  let cleaned = dateValue;
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  
  // Validate and return
  try {
    return new Date(cleaned).toISOString();
  } catch (error) {
    console.warn('Invalid date format:', dateValue);
    return new Date().toISOString();
  }
}

/**
 * Convert SQL user data to InstantDB format
 */
function convertUserData(sqlValues: (string | null)[]): ParsedUser {
  // Users structure: (id, email, role, first_name, last_name, phone, avatar_url, status, metadata, created_at, updated_at)
  return {
    id: sqlValues[0] || '',
    email: sqlValues[1] || '',
    role: sqlValues[2] || 'student',
    firstName: sqlValues[3] || '',
    lastName: sqlValues[4] || '',
    phone: sqlValues[5] || undefined,
    avatarUrl: sqlValues[6] || undefined,
    status: sqlValues[7] || 'active',
    metadata: sqlValues[8] ? tryParseJSON(sqlValues[8] as string) : undefined,
    createdAt: cleanDate(sqlValues[9]),
    updatedAt: cleanDate(sqlValues[10])
  };
}

/**
 * Convert SQL profile data to InstantDB format
 */
function convertProfileData(sqlValues: (string | null)[]): ParsedProfile {
  // Profiles structure: (id, user_id, type, data, status, verified, created_at, updated_at)
  return {
    id: sqlValues[0] || '',
    userId: sqlValues[1] || '',
    type: sqlValues[2] || 'student',
    data: sqlValues[3] ? tryParseJSON(sqlValues[3] as string) : undefined,
    status: sqlValues[4] || 'active',
    verified: sqlValues[5] === 'true' || sqlValues[5] === 't',
    createdAt: cleanDate(sqlValues[6] || null),
    updatedAt: cleanDate(sqlValues[7] || null)
  };
}

/**
 * Convert SQL relationship data to InstantDB format
 */
function convertRelationshipData(sqlValues: (string | null)[]): ParsedRelationship {
  return {
    id: sqlValues[0] || '',
    type: sqlValues[1] || '',
    primaryId: sqlValues[2] || '',
    secondaryId: sqlValues[3] || '',
    status: sqlValues[4] || 'active',
    startDate: sqlValues[5] || undefined,
    endDate: sqlValues[6] || undefined,
    data: sqlValues[7] ? (typeof sqlValues[7] === 'string' ? JSON.parse(sqlValues[7]) : sqlValues[7]) : undefined,
    createdAt: sqlValues[8] || new Date().toISOString(),
    updatedAt: sqlValues[9] || new Date().toISOString()
  };
}

/**
 * Read and parse all SQL files from bulk-sql directory
 */
async function readBulkSqlFiles(): Promise<{
  users: ParsedUser[];
  profiles: ParsedProfile[];
  relationships: ParsedRelationship[];
}> {
  const bulkSqlDir = join(__dirname, 'bulk-sql');
  const files = await fs.readdir(bulkSqlDir);
  
  let users: ParsedUser[] = [];
  let profiles: ParsedProfile[] = [];
  let relationships: ParsedRelationship[] = [];
  
  console.log(`Found ${files.length} SQL files to process...`);
  
  for (const file of files) {
    if (!file.endsWith('.sql')) continue;
    
    console.log(`Processing ${file}...`);
    const filePath = join(bulkSqlDir, file);
    const content = await fs.readFile(filePath, 'utf-8');
    
    if (file.startsWith('02_users_')) {
      // Parse users
      const sqlRows = parseSqlInserts(content, 'users');
      const parsedUsers = sqlRows.map(convertUserData);
      users.push(...parsedUsers);
      console.log(`  Added ${parsedUsers.length} users from ${file}`);
    } else if (file.startsWith('03_profiles_')) {
      // Parse profiles
      const sqlRows = parseSqlInserts(content, 'profiles');
      const parsedProfiles = sqlRows.map(convertProfileData);
      profiles.push(...parsedProfiles);
      console.log(`  Added ${parsedProfiles.length} profiles from ${file}`);
    } else if (file.startsWith('04_relationships_')) {
      // Parse relationships
      const sqlRows = parseSqlInserts(content, 'relationships');
      const parsedRelationships = sqlRows.map(convertRelationshipData);
      relationships.push(...parsedRelationships);
      console.log(`  Added ${parsedRelationships.length} relationships from ${file}`);
    }
  }
  
  return { users, profiles, relationships };
}

/**
 * Migrate data to InstantDB in batches with proper UUID handling
 */
async function migrateBatchToInstantDB<T extends { id: string; [key: string]: any }>(
  data: T[],
  entityName: string,
  batchSize: number = 50,
  idMapping?: Map<string, string>
): Promise<Map<string, string>> {
  if (!adminDb) {
    throw new Error('AdminDB client not available');
  }

  const currentIdMapping = idMapping || new Map<string, string>();
  console.log(`Migrating ${data.length} ${entityName} records in batches of ${batchSize}...`);
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    console.log(`  Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(data.length / batchSize)}...`);
    
    try {
      const transactions = [];
      
      for (const item of batch) {
        if (!adminDb.tx || !adminDb.tx[entityName]) {
          throw new Error(`${entityName} transaction not available`);
        }
        
        // Generate new UUID for InstantDB
        const newId = uuidv4();
        currentIdMapping.set(item.id, newId);
        
        // Remove 'id' field and create clean data object
        const { id, ...cleanData } = item;
        
        // If this is a profile, update userId reference to use new UUID
        if (entityName === 'profiles' && 'userId' in cleanData && idMapping) {
          const newUserId = idMapping.get(cleanData.userId as string);
          if (newUserId) {
            cleanData.userId = newUserId;
          }
        }
        
        // If this is a relationship, update ID references
        if (entityName === 'relationships' && idMapping) {
          if ('primaryId' in cleanData) {
            const newPrimaryId = idMapping.get(cleanData.primaryId as string);
            if (newPrimaryId) {
              cleanData.primaryId = newPrimaryId;
            }
          }
          if ('secondaryId' in cleanData) {
            const newSecondaryId = idMapping.get(cleanData.secondaryId as string);
            if (newSecondaryId) {
              cleanData.secondaryId = newSecondaryId;
            }
          }
        }
        
        const entity = adminDb.tx[entityName][newId];
        if (!entity) {
          throw new Error(`${entityName} entity not found for ID: ${newId}`);
        }
        
        const transaction = entity.update(cleanData as any);
        if (!transaction) {
          throw new Error(`Failed to create ${entityName} transaction`);
        }
        
        transactions.push(transaction);
      }
      
      await adminDb.transact(transactions);
      console.log(`    Successfully migrated batch of ${batch.length} ${entityName}`);
    } catch (error) {
      console.error(`    Failed to migrate batch of ${entityName}:`, error);
      // Continue with next batch rather than failing completely
    }
  }
  
  return currentIdMapping;
}

/**
 * Main migration function
 */
export async function migrateBulkSqlToInstantDB() {
  try {
    console.log('🚀 Starting bulk SQL to InstantDB migration...');
    
    // Read and parse all SQL files
    console.log('\n📖 Reading SQL files...');
    const { users, profiles, relationships } = await readBulkSqlFiles();
    
    console.log(`\n📊 Data Summary:`);
    console.log(`  Users: ${users.length}`);
    console.log(`  Profiles: ${profiles.length}`);
    console.log(`  Relationships: ${relationships.length}`);
    
    // Migrate to InstantDB
    console.log('\n🔄 Migrating to InstantDB...');
    
    // Migrate users first (they're referenced by profiles)
    const userIdMapping = await migrateBatchToInstantDB(users, 'users', 50);
    
    // Migrate profiles next (they're referenced by relationships)
    const profileIdMapping = await migrateBatchToInstantDB(profiles, 'profiles', 50, userIdMapping);
    
    // Migrate relationships last
    // Combine both user and profile ID mappings for relationship references
    const combinedMapping = new Map([...userIdMapping, ...profileIdMapping]);
    await migrateBatchToInstantDB(relationships, 'relationships', 30, combinedMapping);
    
    console.log('\n✅ Migration completed successfully!');
    console.log(`Migrated ${users.length + profiles.length + relationships.length} total records to InstantDB.`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateBulkSqlToInstantDB()
    .then(() => {
      console.log('Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
} 