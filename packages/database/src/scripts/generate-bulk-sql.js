/**
 * Generate optimized SQL files for Supabase import
 * This script reads the mock data and generates bulk SQL for more efficient imports
 */

const fs = require('fs');
const path = require('path');

// Configuration
const inputFile = path.join(__dirname, 'mock-data.json');
const outputDir = path.join(__dirname, 'bulk-sql');
const recordsPerBatch = 50; // Number of records per INSERT statement

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read mock data
console.log(`Reading data from ${inputFile}...`);
const mockData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

// Generate bulk SQL with optimized inserts
const generateBulkSqlInsert = (table, records) => {
  if (!records.length) return '';
  
  // Split records into batches
  const batches = [];
  for (let i = 0; i < records.length; i += recordsPerBatch) {
    batches.push(records.slice(i, i + recordsPerBatch));
  }
  
  // Generate SQL for each batch
  return batches.map(batch => {
    const columns = Object.keys(batch[0]).join(', ');
    
    const valuesList = batch.map(record => {
      const vals = Object.values(record).map(val => {
        if (val === null) return 'NULL';
        if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
        return val;
      });
      
      return `(${vals.join(', ')})`;
    }).join(',\n');
    
    return `INSERT INTO ${table} (${columns})\nVALUES\n${valuesList};`;
  }).join('\n\n');
};

// Generate setup SQL
const setupSQL = `
-- Generated bulk SQL for Supabase import
-- Generated on: ${new Date().toISOString()}

-- Clean up existing data
TRUNCATE users, profiles, relationships RESTART IDENTITY CASCADE;
`;
fs.writeFileSync(path.join(outputDir, '01_setup.sql'), setupSQL);
console.log(`✅ Wrote setup SQL: ${path.join(outputDir, '01_setup.sql')}`);

// Generate users SQL
const usersSql = generateBulkSqlInsert('users', mockData.users);
fs.writeFileSync(path.join(outputDir, '02_users.sql'), usersSql);
console.log(`✅ Wrote users SQL: ${path.join(outputDir, '02_users.sql')} (${mockData.users.length} records)`);

// Generate profiles SQL
const profilesSql = generateBulkSqlInsert('profiles', mockData.profiles);
fs.writeFileSync(path.join(outputDir, '03_profiles.sql'), profilesSql);
console.log(`✅ Wrote profiles SQL: ${path.join(outputDir, '03_profiles.sql')} (${mockData.profiles.length} records)`);

// Generate relationships SQL
const relationshipsSql = generateBulkSqlInsert('relationships', mockData.relationships);
fs.writeFileSync(path.join(outputDir, '04_relationships.sql'), relationshipsSql);
console.log(`✅ Wrote relationships SQL: ${path.join(outputDir, '04_relationships.sql')} (${mockData.relationships.length} records)`);

console.log('\n=== Bulk SQL Generation Complete ===');
console.log('To import into Supabase:');
console.log('1. Log into your Supabase dashboard');
console.log('2. Go to the SQL Editor');
console.log('3. Run each SQL file in order:');
console.log('   - First run 01_setup.sql');
console.log('   - Then run 02_users.sql');
console.log('   - Then run 03_profiles.sql');
console.log('   - Finally run 04_relationships.sql'); 