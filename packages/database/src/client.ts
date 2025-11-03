import { init } from '@instantdb/react';
import { init as initAdmin } from '@instantdb/admin';
import { schema } from './schema';

// Function to get environment variables, supporting both server and browser contexts
const getEnvVars = () => {
  // Next.js automatically loads .env.local files and makes NEXT_PUBLIC_ vars available on client
  // Server-only vars (like INSTANT_ADMIN_TOKEN) are only available on server-side
  return {
    instantAppId: process.env.NEXT_PUBLIC_INSTANT_APP_ID || '',
    instantAdminToken: process.env.INSTANT_ADMIN_TOKEN || '',
  };
};

// Get environment variables
const { instantAppId, instantAdminToken } = getEnvVars();

// Check if the credentials are provided
if (!instantAppId) {
  console.error(
    '🚨 InstantDB app ID not found in environment variables. ' +
    'Please ensure you have set NEXT_PUBLIC_INSTANT_APP_ID in your .env.local file.'
  );
}

// Create empty client placeholders
let db: ReturnType<typeof init> | null = null;
let adminDb: ReturnType<typeof initAdmin> | null = null;

// Only create clients if we have the required credentials
if (instantAppId) {
  try {
    // Create the InstantDB client with schema
    db = init({
      appId: instantAppId,
      schema,
      devtool: false, // Disable the debug panel/helper icon
    });
    
    // Create an admin client for server-side operations
    if (instantAdminToken) {
      adminDb = initAdmin({
        appId: instantAppId,
        adminToken: instantAdminToken,
        schema,
      });
    }
  } catch (err) {
    console.error('Failed to initialize InstantDB clients:', err);
  }
}

// Export the clients (they may be null if credentials are missing)
export { db, adminDb };

// Test the connection (optional)
export async function testConnection() {
  if (!db) {
    console.error('Cannot test connection: InstantDB client not initialized due to missing credentials');
    return false;
  }

  try {
    // Test basic query - try to fetch users
    const result = db.useQuery({ users: {} });
    console.log('Successfully connected to InstantDB');
    return true;
  } catch (error) {
    console.error('Failed to connect to InstantDB:', error);
    return false;
  }
}

// Helper functions for common operations
export const instantHelpers = {
  // Generate unique ID
  id: () => crypto.randomUUID(),
  
  // Current timestamp
  now: () => new Date(),
  
  // Format dates for InstantDB
  formatDate: (date: Date | string) => {
    if (typeof date === 'string') {
      return new Date(date);
    }
    return date;
  }
}; 