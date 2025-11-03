#!/usr/bin/env tsx

/**
 * SEVIS Batch Data Generator
 * 
 * This script generates realistic mock data for SEVIS batches that match the structure shown in the image:
 * - Batch numbers following the A02500... format
 * - Different batch types (New Student, Update - Housing, etc.)
 * - Various statuses (Exported, Processing, Draft, Failed)
 * - Administrator names as creators
 * - Participant counts and program information
 * 
 * Usage:
 * - Run with: pnpm tsx packages/database/src/scripts/generate-sevis-batches.ts
 * - Generates both JSON and SQL output files
 * - Follows InstantDB schema requirements
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { faker } from '@faker-js/faker';

// Load environment variables using process.cwd() 
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), 'packages/database/.env.local') });

// Configuration
const NUM_BATCHES = 50;
const BATCH_BASE_NUMBER = 25070;

// Generate consistent UUID v4 (matching existing patterns)
const generateId = () => faker.string.uuid();

// Utility functions
const randomItem = <T>(arr: readonly T[]): T => {
  if (arr.length === 0) {
    throw new Error('Cannot select from empty array');
  }
  const item = arr[Math.floor(Math.random() * arr.length)];
  if (item === undefined) {
    throw new Error('Selected item is undefined');
  }
  return item;
};

// SEVIS batch types based on the image
const BATCH_TYPES = [
  'New Student',
  'Update - Housing', 
  'Update - Site of Activity',
  'Program Date',
  'Validation - Housing',
  'Payment'
] as const;

// Batch statuses
const BATCH_STATUSES = [
  'Exported',
  'Processing', 
  'Draft',
  'Failed'
] as const;

// Administrator names (consistent with existing mock data)
const ADMINISTRATORS = [
  'Sarah Johnson',
  'Michael Chen',
  'Aisha Patel', 
  'David Rodriguez',
  'Emma Wilson',
  'James Thompson',
  'Maria Garcia',
  'Robert Kim',
  'Jennifer Singh',
  'Thomas Walker',
  'Claire Henneberry',
  'Megan Chrzas'
] as const;

// Program types
const PROGRAMS = [
  'High School Program',
  'Trainee Program',
  'Intern Program',
  'Work & Travel Program'
] as const;

// Interface for SEVIS batch data
interface SevisBatch {
  id: string;
  batchNumber: string;
  type: typeof BATCH_TYPES[number];
  status: typeof BATCH_STATUSES[number];
  createdBy: string;
  createdById: string;
  numberOfParticipants: number;
  program: typeof PROGRAMS[number];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  processedAt?: string;
  exportedAt?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

// Generate administrator user IDs (would normally come from database)
const generateAdministratorIds = () => {
  const adminIds: Record<string, string> = {};
  ADMINISTRATORS.forEach(admin => {
    adminIds[admin] = generateId();
  });
  return adminIds;
};

// Generate realistic batch data
const generateSevisBatches = (numBatches: number): SevisBatch[] => {
  const batches: SevisBatch[] = [];
  const adminIds = generateAdministratorIds();
  
  for (let i = 0; i < numBatches; i++) {
    const batchId = generateId();
    const batchNumber = `A${(BATCH_BASE_NUMBER + i).toString().padStart(8, '0')}`;
    const type = randomItem(BATCH_TYPES);
    const status = randomItem(BATCH_STATUSES);
    const createdBy = randomItem(ADMINISTRATORS);
    const createdById = adminIds[createdBy] || generateId();
    const program = randomItem(PROGRAMS);
    
    // Generate realistic participant counts based on batch type
    let numberOfParticipants: number;
    switch (type) {
      case 'New Student':
        numberOfParticipants = faker.number.int({ min: 50, max: 200 });
        break;
      case 'Update - Housing':
        numberOfParticipants = faker.number.int({ min: 20, max: 100 });
        break;
      case 'Update - Site of Activity':
        numberOfParticipants = faker.number.int({ min: 10, max: 80 });
        break;
      case 'Program Date':
        numberOfParticipants = faker.number.int({ min: 5, max: 50 });
        break;
      case 'Validation - Housing':
        numberOfParticipants = faker.number.int({ min: 30, max: 150 });
        break;
      case 'Payment':
        numberOfParticipants = faker.number.int({ min: 1, max: 10 });
        break;
      default:
        numberOfParticipants = faker.number.int({ min: 1, max: 100 });
    }
    
    // Generate realistic timestamps
    const createdAt = faker.date.past({ years: 1 });
    const updatedAt = faker.date.between({ from: createdAt, to: new Date() });
    
    // Generate status-specific timestamps
    let submittedAt: string | undefined;
    let processedAt: string | undefined;
    let exportedAt: string | undefined;
    let notes: string | undefined;
    
    switch (status) {
      case 'Exported':
        submittedAt = faker.date.between({ from: createdAt, to: updatedAt }).toISOString();
        processedAt = faker.date.between({ from: new Date(submittedAt), to: updatedAt }).toISOString();
        exportedAt = faker.date.between({ from: new Date(processedAt), to: updatedAt }).toISOString();
        notes = 'Successfully exported to SEVIS system';
        break;
      case 'Processing':
        submittedAt = faker.date.between({ from: createdAt, to: updatedAt }).toISOString();
        processedAt = faker.date.between({ from: new Date(submittedAt), to: updatedAt }).toISOString();
        notes = 'Currently processing in SEVIS system';
        break;
      case 'Draft':
        notes = 'Batch created but not yet submitted';
        break;
      case 'Failed':
        submittedAt = faker.date.between({ from: createdAt, to: updatedAt }).toISOString();
        notes = 'Processing failed - ' + randomItem([
          'SEVIS connection timeout',
          'Invalid data format',
          'Authentication error',
          'Missing required fields'
        ]);
        break;
    }
    
    // Generate metadata based on batch type
    const metadata = {
      batchType: type,
      priority: randomItem(['low', 'medium', 'high']),
      source: randomItem(['manual', 'automated', 'scheduled']),
      retryCount: status === 'Failed' ? faker.number.int({ min: 1, max: 3 }) : 0,
      ...(type.includes('Update') && {
        updateReason: randomItem([
          'student_request',
          'host_family_change',
          'school_transfer',
          'data_correction'
        ])
      })
    };
    
    const batch: SevisBatch = {
      id: batchId,
      batchNumber,
      type,
      status,
      createdBy,
      createdById,
      numberOfParticipants,
      program,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      submittedAt,
      processedAt,
      exportedAt,
      notes,
      metadata
    };
    
    batches.push(batch);
  }
  
  return batches;
};

// Generate SQL insert statement
const generateSqlInsert = (table: string, records: SevisBatch[]): string => {
  if (records.length === 0) return '';
  
  const firstRecord = records[0];
  if (!firstRecord) return '';
  
  const columns = Object.keys(firstRecord);
  const values = records.map(record => {
    const valueList = columns.map(col => {
      const value = record[col as keyof SevisBatch];
      if (value === null || value === undefined) return 'NULL';
      if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
      if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
      if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
      return value;
    });
    return `(${valueList.join(', ')})`;
  });
  
  return `INSERT INTO public.${table} (${columns.join(', ')}) VALUES\n${values.join(',\n')};\n\n`;
};

// Main execution
console.log('🚀 Generating SEVIS batch mock data...');

const sevisBatches = generateSevisBatches(NUM_BATCHES);

console.log(`✅ Generated ${sevisBatches.length} SEVIS batches`);
console.log(`   - Types: ${Array.from(new Set(sevisBatches.map(b => b.type))).join(', ')}`);
console.log(`   - Statuses: ${Array.from(new Set(sevisBatches.map(b => b.status))).join(', ')}`);
console.log(`   - Programs: ${Array.from(new Set(sevisBatches.map(b => b.program))).join(', ')}`);

// Generate JSON output
const jsonData = {
  sevisBatches,
  metadata: {
    generated: new Date().toISOString(),
    totalBatches: sevisBatches.length,
    script: 'generate-sevis-batches.ts'
  }
};

const jsonOutputPath = path.join('src/scripts/sevis-batches-mock-data.json');
fs.writeFileSync(jsonOutputPath, JSON.stringify(jsonData, null, 2));

console.log(`💾 JSON file saved: ${jsonOutputPath}`);

// Generate SQL output
let sql = '-- SEVIS Batch Mock Data\n';
sql += `-- Generated on ${new Date().toISOString()}\n`;
sql += `-- Total batches: ${sevisBatches.length}\n\n`;

sql += '-- Clear existing SEVIS batch data\n';
sql += 'DELETE FROM public.sevis_batches;\n\n';

sql += '-- Insert SEVIS batches\n';
sql += generateSqlInsert('sevis_batches', sevisBatches);

sql += '-- Update sequences (if needed)\n';
sql += `SELECT setval('sevis_batches_id_seq', (SELECT MAX(id) FROM sevis_batches));\n\n`;

sql += '-- Summary statistics\n';
sql += `-- Total batches: ${sevisBatches.length}\n`;
BATCH_STATUSES.forEach(status => {
  const count = sevisBatches.filter(b => b.status === status).length;
  sql += `-- ${status}: ${count} batches\n`;
});

const sqlOutputPath = path.join('src/scripts/sevis-batches-mock-data.sql');
fs.writeFileSync(sqlOutputPath, sql);

console.log(`📄 SQL file saved: ${sqlOutputPath}`);
console.log('🎉 SEVIS batch mock data generation complete!');
console.log('\n📊 Summary:');
console.log(`   Total batches: ${sevisBatches.length}`);
BATCH_STATUSES.forEach(status => {
  const count = sevisBatches.filter(b => b.status === status).length;
  console.log(`   ${status}: ${count} batches`);
}); 