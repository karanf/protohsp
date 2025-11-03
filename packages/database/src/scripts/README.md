# Exchange Program Database Setup

This README provides instructions on how to set up and populate the Supabase database for the Exchange Student Program.

## Overview

The script `generate-mock-data.js` creates realistic mock data for:
- Students
- Host Families
- Local Coordinators
- Sending Organizations

All data is interlinked with appropriate relationships using UUIDs to create a complete dataset that represents a real-world student exchange program.

## Prerequisites

1. A Supabase project already set up
2. Node.js installed
3. Project dependencies installed (`pnpm install` or `npm install`)

## Step 1: Create Database Schema

1. Log into your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `../schema/supabase-schema.sql` 
4. Run the SQL to create all necessary tables and extensions

Or use the schema update script:

```bash
pnpm --filter @repo/database update-schema
```

This script will guide you through the schema update process.

## Step 2: Generate Mock Data

Run the following command from the project root:

```bash
pnpm --filter @repo/database generate-mock-data
```

This will:
- Generate mock data for all entities
- Save the data as JSON to `mock-data.json`

## Step 3: Generate Optimized SQL Files

Run the following command:

```bash
pnpm --filter @repo/database generate-bulk-sql
```

This will:
- Read the mock data from JSON
- Generate optimized SQL insert statements with 50 records per INSERT
- Create four files in the `bulk-sql` directory:
  - `01_setup.sql`: Setup and clean scripts
  - `02_users.sql`: User data
  - `03_profiles.sql`: Profile data
  - `04_relationships.sql`: Relationship data

## Step 4: Import Mock Data

Run the following script:

```bash
pnpm --filter @repo/database import-sql
```

Or manually:

1. Log into your Supabase dashboard
2. Go to the SQL Editor
3. Import each file from the `bulk-sql` directory in order (01, 02, 03, 04)
4. Run the SQL to populate the tables with sample data

## Data Structure

The generated data follows this structure:

```
users (UUID)
  ↑
  | (user_id)
  ↓
profiles (UUID)
  ↑     ↑
  |     |
  |     | (primary_id, secondary_id)
  ↓     ↓
relationships (UUID)
```

### Types of Relationships

The data includes the following relationship types:
- `coordinator_host`: Local Coordinator to Host Family
- `host_student`: Host Family to Student
- `sending_org_student`: Sending Organization to Student

### Data Quantities

By default, the script generates:
- 500 Students
- 200 Host Families
- 50 Local Coordinators
- 25 Sending Organizations

You can adjust these numbers by modifying the constants at the top of the `generate-mock-data.js` file.

## Regenerating Types

After importing the data, regenerate the TypeScript types:

```bash
pnpm --filter @repo/database generate-types
```

## Helper Scripts

- `copy-sql-to-clipboard.js`: Copies the SQL content to clipboard
- `upload-sql-helper.js`: Assists with uploading SQL to Supabase
- `import-sql-helper.js`: Assists with importing the SQL files

## Troubleshooting

### Error: Type Mismatch

If you encounter type mismatch errors in your application after importing data, ensure you've regenerated the TypeScript types as described above.

### Error: UUID Format

All IDs are now using UUID format. If you see UUID-related errors, make sure you're using the latest schema and data generation scripts. 