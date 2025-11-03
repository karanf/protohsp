// Export InstantDB client
export { db, adminDb, testConnection, instantHelpers } from './client';

// Export schema
export { schema } from './schema';

// Export hooks
export * from './hooks';

// Export utilities
export * from './utils';

// Note: This is the main entry point for the database package.
// InstantDB provides real-time, offline-first database functionality
// with automatic type generation from the schema. 