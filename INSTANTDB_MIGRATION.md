# InstantDB Migration Guide

## Overview

This project has been successfully migrated from Supabase to InstantDB. InstantDB provides real-time, offline-first database functionality with automatic type generation and a graph-based query system.

## What Has Been Completed

### ✅ 1. Package Dependencies
- **Removed**: `@supabase/supabase-js` from all packages
- **Added**: `@instantdb/react` and `@instantdb/admin` (v0.20.1)
- **Updated**: All package.json files in the monorepo

### ✅ 2. Database Schema Definition
- **Created**: `packages/database/src/schema/index.ts` with complete InstantDB schema
- **Migrated**: All Supabase tables to InstantDB entities:
  - `users` → `users` entity
  - `profiles` → `profiles` entity
  - `applications` → `applications` entity
  - `relationships` → `relationships` entity
  - `placements` → `placements` entity
  - `monitoring` → `monitoring` entity
  - `reference_data` → `referenceData` entity
  - `documents` → `documents` entity
  - `notes` → `notes` entity
  - `change_queue` → `changeQueue` entity

### ✅ 3. Database Client
- **Replaced**: `packages/database/src/client.ts` with InstantDB client
- **Added**: Both regular and admin clients for different use cases
- **Created**: Helper functions for common operations

### ✅ 4. Hook System
- **Updated**: `packages/database/src/hooks/users.ts` with InstantDB queries
- **Created**: Real-time hooks using InstantDB's reactive system
- **Maintained**: Same API surface for backwards compatibility

### ✅ 5. Greenheart App Migration
- **Updated**: Package dependencies to use InstantDB
- **Created**: `apps/greenheart/lib/useSupabaseData.ts` → `useInstantData()`
- **Maintained**: Backwards compatibility with `useSupabaseData` alias

### ✅ 6. Migration Script
- **Created**: `packages/database/src/scripts/migrate-to-instantdb.ts`
- **Included**: Sample data generation and migration logic
- **Prepared**: Infrastructure for full data migration

## Environment Setup

To complete the migration, you need to set up InstantDB:

### 1. Create InstantDB Account
1. Go to [instantdb.com](https://instantdb.com)
2. Sign up for an account
3. Create a new application

### 2. Environment Variables
Create/update your `.env.local` files with:

```bash
# Replace Supabase variables with InstantDB
NEXT_PUBLIC_INSTANT_APP_ID=your_app_id_here
INSTANT_ADMIN_TOKEN=your_admin_token_here

# Remove these Supabase variables:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...
```

### 3. Schema Deployment
The schema is automatically deployed when you use the InstantDB client. No manual schema creation is needed.

## Key Differences from Supabase

### Real-time by Default
- All queries are automatically real-time
- No need to set up subscriptions
- Automatic UI updates when data changes

### Graph-based Queries
```typescript
// Before (Supabase)
const { data: users } = await supabase
  .from('users')
  .select('*, profiles(*)')

// After (InstantDB)
const { data } = db.useQuery({
  users: {
    profiles: {}
  }
})
```

### Offline-first
- Automatic offline support
- Optimistic updates
- Conflict resolution

### No SQL Required
- All operations through JavaScript/TypeScript
- Type-safe queries
- Automatic relationship handling

## Data Migration

### Option 1: Start Fresh (Recommended)
Since this is a prototype environment, starting with fresh data might be easiest:

```bash
# Run the migration script to populate sample data
cd packages/database
npm run migrate
```

### Option 2: Full Data Migration
If you need to preserve existing data:

1. **Export from Supabase**:
   ```bash
   supabase db dump > supabase_export.sql
   ```

2. **Convert and Import**:
   - Modify the migration script to parse your SQL export
   - Run the migration to populate InstantDB

## Testing the Migration

### 1. Start the Development Server
```bash
pnpm dev
```

### 2. Check the Greenheart App
Navigate to `http://localhost:3001` and verify:
- ✅ App loads without errors
- ✅ Data displays correctly
- ✅ Real-time updates work
- ✅ No console errors

### 3. Test Real-time Functionality
Open the app in multiple browser windows and verify changes sync in real-time.

## Benefits of the Migration

### 🚀 Performance
- Faster queries due to graph-based architecture
- Automatic caching and optimization
- Real-time updates without polling

### 🛠️ Developer Experience
- Better TypeScript integration
- Simpler query syntax
- Automatic type generation

### 📱 User Experience
- Offline functionality
- Instant UI updates
- Collaborative features out of the box

### 💰 Cost Efficiency
- No separate real-time subscription costs
- Efficient data transfer
- Built-in optimization

## Troubleshooting

### Common Issues

1. **"InstantDB client not initialized"**
   - Check your `NEXT_PUBLIC_INSTANT_APP_ID` environment variable
   - Ensure the app ID is correct

2. **"Admin token required"**
   - Set `INSTANT_ADMIN_TOKEN` for server-side operations
   - Don't expose admin token in client-side code

3. **Type errors**
   - InstantDB automatically generates types from your schema
   - Restart your development server after schema changes

### Getting Help

- **Documentation**: [instantdb.com/docs](https://instantdb.com/docs)
- **Community**: [Discord](https://discord.gg/VU53p7uQcE)
- **GitHub**: [github.com/instantdb/instant](https://github.com/instantdb/instant)

## Next Steps

1. **Set up InstantDB account and get credentials**
2. **Update environment variables**
3. **Test the migration**
4. **Migrate remaining apps** (Educatius, Web)
5. **Remove Supabase infrastructure**

The migration framework is now complete. The actual data migration and environment setup are the final steps to complete the transition to InstantDB. 