import { adminDb } from '../client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

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
          i++; // Skip next char
        } else {
          // End of quoted string
          inSingleQuote = false;
        }
      } else {
        // Start of quoted string
        inSingleQuote = true;
      }
    } else if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      current += char;
    } else if (char === ',' && !inSingleQuote && !inDoubleQuote) {
      // Found a separator
      const trimmed = current.trim();
      if (trimmed === 'NULL') {
        values.push(null);
      } else {
        values.push(trimmed);
      }
      current = '';
    } else {
      current += char;
    }
    i++;
  }

  // Add the last value
  if (current.trim()) {
    const trimmed = current.trim();
    if (trimmed === 'NULL') {
      values.push(null);
    } else {
      values.push(trimmed);
    }
  }

  return values;
}

/**
 * Convert SQL parsed value to proper JavaScript type
 */
function convertValue(value: string | null, expectedType: 'string' | 'date' | 'json' | 'boolean'): any {
  if (value === null) return null;
  
  switch (expectedType) {
    case 'date':
      return new Date(value);
    case 'json':
      try {
        return JSON.parse(value);
      } catch {
        return value; // Return as string if not valid JSON
      }
    case 'boolean':
      return value.toLowerCase() === 'true';
    default:
      return value;
  }
}

interface ParsedChangeRequest {
  id: string;
  recordType: string;
  recordId: string;
  recordName: string;
  requestedBy: string;
  requestedByName: string;
  requestDate: Date;
  status: string;
  priority: string;
  description: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

interface ParsedChangeItem {
  id: string;
  changeRequestId: string;
  fieldPath: string;
  fieldLabel: string;
  previousValue: string | null;
  newValue: string | null;
  changeType: string;
  isSevisRelated: boolean;
  status: string;
  approvedBy: string | null;
  approvedByName: string | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
  sevisBatchId: string | null;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

function parseChangeRequests(sqlContent: string): ParsedChangeRequest[] {
  const insertMatch = sqlContent.match(/INSERT INTO public\.change_requests[^;]*VALUES\s*(.*?)(?=;|\n-- Insert)/gs);
  if (!insertMatch) return [];

  const valuesSection = insertMatch[0];
  const valuesPattern = /\((.*?)\)(?=,|\s*;)/gs;
  const records: ParsedChangeRequest[] = [];

  let match;
  while ((match = valuesPattern.exec(valuesSection)) !== null) {
    const values = parseValuesString(match[1]);
    if (values.length >= 13 && values[0] && values[1] && values[2] && values[3] && values[4] && values[5] && values[6] && values[7] && values[8] && values[9] && values[11] && values[12]) {
      records.push({
        id: values[0],
        recordType: values[1],
        recordId: values[2],
        recordName: values[3],
        requestedBy: values[4],
        requestedByName: values[5],
        requestDate: convertValue(values[6]!, 'date'),
        status: values[7],
        priority: values[8],
        description: values[9],
        metadata: convertValue(values[10], 'json'),
        createdAt: convertValue(values[11], 'date'),
        updatedAt: convertValue(values[12], 'date'),
      });
    }
  }

  return records;
}

function parseChangeItems(sqlContent: string): ParsedChangeItem[] {
  const insertMatch = sqlContent.match(/INSERT INTO public\.change_items[^;]*VALUES\s*(.*?)(?=;|\n-- Insert)/gs);
  if (!insertMatch) return [];

  const valuesSection = insertMatch[0];
  const valuesPattern = /\((.*?)\)(?=,|\s*;)/gs;
  const records: ParsedChangeItem[] = [];

  let match;
  while ((match = valuesPattern.exec(valuesSection)) !== null) {
    const values = parseValuesString(match[1]);
    if (values.length >= 17) {
      records.push({
        id: values[0]!,
        changeRequestId: values[1]!,
        fieldPath: values[2]!,
        fieldLabel: values[3]!,
        previousValue: values[4],
        newValue: values[5],
        changeType: values[6]!,
        isSevisRelated: convertValue(values[7], 'boolean'),
        status: values[8]!,
        approvedBy: values[9],
        approvedByName: values[10],
        approvedAt: values[11] ? convertValue(values[11], 'date') : null,
        rejectionReason: values[12],
        sevisBatchId: values[13],
        metadata: convertValue(values[14], 'json'),
        createdAt: convertValue(values[15], 'date'),
        updatedAt: convertValue(values[16], 'date'),
      });
    }
  }

  return records;
}

async function migrateChangeQueue() {
  console.log('🚀 Starting Change Queue migration to InstantDB...');

  if (!adminDb) {
    console.error('❌ AdminDB not available');
    return;
  }

  // Read the change queue SQL file
  const sqlFilePath = join(__dirname, 'change-queue-mock-data.sql');
  let sqlContent: string;
  
  try {
    sqlContent = readFileSync(sqlFilePath, 'utf-8');
    console.log('📖 Read change queue SQL file successfully');
  } catch (error) {
    console.error('❌ Failed to read SQL file:', error);
    return;
  }

  // Parse change requests and items
  const changeRequests = parseChangeRequests(sqlContent);
  const changeItems = parseChangeItems(sqlContent);

  console.log(`📊 Found ${changeRequests.length} change requests and ${changeItems.length} change items`);

  // Migrate change requests as changeQueue entities
  console.log('\n🔄 Migrating change requests to changeQueue...');
  
  const batchSize = 30;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < changeRequests.length; i += batchSize) {
    const batch = changeRequests.slice(i, i + batchSize);
    console.log(`  Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(changeRequests.length / batchSize)}...`);

    try {
      const transactions = batch.map(request => {
        const newId = uuidv4();
        const changeQueueEntity = adminDb.tx.changeQueue[newId];
        
        if (!changeQueueEntity) {
          throw new Error('ChangeQueue transaction not available');
        }

        // Combine request data with related items
        const relatedItems = changeItems.filter(item => item.changeRequestId === request.id);
        const requestData = {
          recordType: request.recordType,
          recordId: request.recordId,
          recordName: request.recordName,
          requestedByName: request.requestedByName,
          description: request.description,
          originalMetadata: request.metadata,
          items: relatedItems.map(item => ({
            fieldPath: item.fieldPath,
            fieldLabel: item.fieldLabel,
            previousValue: item.previousValue,
            newValue: item.newValue,
            changeType: item.changeType,
            isSevisRelated: item.isSevisRelated,
            status: item.status,
            approvedBy: item.approvedBy,
            approvedByName: item.approvedByName,
            approvedAt: item.approvedAt,
            rejectionReason: item.rejectionReason,
            metadata: item.metadata
          }))
        };

        return changeQueueEntity.update({
          entityType: request.recordType,
          entityId: request.recordId,
          changeType: 'update', // Default since most are updates
          status: request.status,
          priority: request.priority,
          requestedBy: request.requestedBy,
          requestData: requestData,
          // Ensure dates are valid Date objects
          createdAt: request.createdAt || new Date(),
          updatedAt: request.updatedAt || new Date(),
        });
      });

      await adminDb.transact(transactions);
      successCount += batch.length;
      console.log(`    ✅ Successfully migrated batch of ${batch.length} change requests`);
    } catch (error) {
      errorCount += batch.length;
      console.error(`    ❌ Failed to migrate batch:`, error);
    }
  }

  console.log(`\n📊 Migration Summary:`);
  console.log(`  ✅ Successfully migrated: ${successCount} change requests`);
  console.log(`  ❌ Failed to migrate: ${errorCount} change requests`);
  console.log(`  📝 Total change items processed: ${changeItems.length} items`);

  if (errorCount === 0) {
    console.log('🎉 Change Queue migration completed successfully!');
  } else {
    console.log('⚠️  Change Queue migration completed with some errors.');
  }
}

// Run the migration
migrateChangeQueue().catch(console.error); 