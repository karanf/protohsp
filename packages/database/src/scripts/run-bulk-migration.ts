#!/usr/bin/env tsx

import { migrateBulkSqlToInstantDB } from './migrate-bulk-sql-to-instantdb';

async function main() {
  try {
    console.log('🚀 Starting bulk SQL to InstantDB migration...');
    await migrateBulkSqlToInstantDB();
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main(); 