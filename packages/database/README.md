# EGAB Database

This package contains database schema, utilities, and scripts for the student exchange database.

## Setup

1. Make sure you have installed dependencies:
   ```bash
   pnpm install
   ```

2. Configure your Supabase connection in the `.env` file:
   ```
   SUPABASE_URL=your-project-url
   SUPABASE_KEY=your-anon-key
   ```

## Database Schema

The database schema uses simple text IDs for all tables, making it compatible with various authentication systems. The schema includes:

- Users
- Profiles (for students, host families, coordinators, etc.)
- Relationships (connecting different entities)
- Applications
- Placements
- Monitoring
- And more...

### Updating the Schema

To apply or update the schema in your Supabase project, run:

```bash
pnpm update-schema
```

This will copy the schema SQL to your clipboard. Paste it in the Supabase SQL Editor and run it to create or update your tables.

## Generating Mock Data

You can generate realistic mock data for testing:

```bash
# Generate mock data with 500 students
pnpm generate-mock-data

# Generate optimized bulk SQL files
pnpm generate-bulk-sql
```

## Importing Mock Data

To import the generated mock data into Supabase:

```bash
# Interactive helper to import all SQL files
pnpm import-sql
```

Or import individual SQL files:

```bash
# Copy setup SQL to clipboard
pnpm copy-sql src/scripts/bulk-sql/01_setup.sql

# Copy users SQL to clipboard
pnpm copy-sql src/scripts/bulk-sql/02_users.sql

# Copy profiles SQL to clipboard
pnpm copy-sql src/scripts/bulk-sql/03_profiles.sql

# Copy relationships SQL to clipboard
pnpm copy-sql src/scripts/bulk-sql/04_relationships.sql
```

After copying, paste and run the SQL in the Supabase SQL Editor.

## Type Generation

To generate TypeScript types from your Supabase schema:

```bash
pnpm generate-types
```

This will create a `generated.ts` file with all the type definitions based on your database schema.

## Development

During development, run:

```bash
pnpm dev
```

This will watch for changes and recompile TypeScript files as needed. 