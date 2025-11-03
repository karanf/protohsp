# Change Queue System Setup Guide

This guide walks you through setting up the complete change queue system for your Supabase database.

## Overview

The change queue system provides:
- **Individual Change Tracking**: Each field change is tracked separately
- **SEVIS Integration**: Automatic flagging and batching of SEVIS-related changes
- **Comment System**: Comments on individual changes for collaboration
- **Approval Workflow**: Granular approval of individual changes
- **Batch Processing**: SEVIS changes can be batched for submission

## UUID Handling Approach

This system follows your existing UUID patterns:

### Development/Testing
- **Schema**: Foreign key constraints are commented out to allow mock data testing
- **Mock Data**: Uses `faker.string.uuid()` to generate test UUIDs (consistent with your existing approach)
- **TypeScript**: UUIDs are typed as `string` (as seen in your `generated.ts`)
- **PostgreSQL**: Stored as `UUID` type with `uuid_generate_v4()` default

### Production
- **Enable Foreign Keys**: Uncomment the foreign key constraints at the bottom of the schema file
- **Real Data**: Use actual UUIDs from your existing `users` and `profiles` tables
- **Data Integrity**: Full referential integrity with cascade deletes where appropriate

## Database Schema

The system adds 5 new tables to your existing database:

1. **`change_requests`** - Main container for change requests
2. **`change_items`** - Individual field changes within requests
3. **`change_comments`** - Comments on individual changes
4. **`sevis_batches`** - Batches for SEVIS processing
5. **`sevis_batch_items`** - Individual changes within SEVIS batches

## Setup Steps

### Step 1: Apply Database Schema

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `change-queue-schema.sql`
4. Run the SQL to create all tables, indexes, and triggers

```bash
# The schema file is located at:
packages/database/src/schema/change-queue-schema.sql
```

**Note**: The schema includes commented-out foreign key constraints for testing. For production use, uncomment the constraints at the bottom of the file.

### Step 2: Generate Mock Data

Generate realistic mock data for testing:

```bash
# From the project root:
pnpm --filter @repo/database generate-change-queue-data
```

This will create `change-queue-mock-data.sql` with:
- 50 change requests
- Multiple change items per request
- Comments on changes
- SEVIS batches with batch items

### Step 3: Import Mock Data

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `change-queue-mock-data.sql`
4. Run the SQL to populate the tables

### Step 4: Update TypeScript Types

Regenerate your TypeScript types to include the new tables:

```bash
pnpm --filter @repo/database generate-types
```

### Step 5: Production Setup (When Ready)

For production deployment:

1. **Enable Foreign Key Constraints**: Uncomment the foreign key constraints in the schema file
2. **Use Real Data**: Replace mock UUIDs with actual user and profile IDs from your database
3. **Update RLS Policies**: Customize the Row Level Security policies based on your auth requirements

```sql
-- Example: Enable foreign key constraints for production
ALTER TABLE public.change_requests 
ADD CONSTRAINT fk_change_requests_record_id 
FOREIGN KEY (record_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.change_requests 
ADD CONSTRAINT fk_change_requests_requested_by 
FOREIGN KEY (requested_by) REFERENCES public.users(id);

-- ... (other constraints as shown in schema file)
```

## Data Structure

### Change Request Flow

```
Change Request
├── Change Item 1 (Address) [SEVIS] [Approved] → SEVIS Batch
├── Change Item 2 (Phone) [SEVIS] [Pending]
└── Change Item 3 (Emergency Contact) [Regular] [Approved]
```

### SEVIS Fields

The following student fields are automatically flagged as SEVIS-related:

**Personal Information:**
- First Name, Last Name, Date of Birth
- Address, City, State, ZIP Code
- Phone Number, Email

**Program Information:**
- Program Start/End Dates
- School Name, Grade Level
- Host Family Assignment
- Local Coordinator Assignment

**Insurance and Travel:**
- Insurance Provider/Policy
- Arrival/Departure Dates

### Change Item Statuses

- **`pending`** - Awaiting approval
- **`approved`** - Approved and ready for implementation
- **`rejected`** - Rejected with reason

### SEVIS Batch Workflow

1. **Individual Approval**: SEVIS changes are approved individually
2. **Batch Creation**: Approved SEVIS changes can be added to batches
3. **Batch Submission**: Batches are submitted to SEVIS
4. **Processing**: Track batch processing status and responses

## UI Features

The updated React component provides:

### Enhanced Table View
- **Status Badges**: Visual status indicators
- **SEVIS Indicators**: Shows count of SEVIS-related changes
- **Priority Levels**: Color-coded priority badges
- **Change Counts**: Shows number of changes per request

### Detailed Expanded View
- **Individual Change Cards**: Each change shown separately
- **Previous vs New Values**: Side-by-side comparison
- **Approval Actions**: Approve/reject individual changes
- **SEVIS Batching**: Add approved SEVIS changes to batches
- **Comment System**: Add and view comments on changes
- **Status Tracking**: Visual status and approval information

### Bulk Actions
- **Approve All Changes**: Bulk approve all changes in selected requests
- **Process SEVIS Items**: Batch process SEVIS-related changes

## API Integration Points

To fully implement this system, you'll need to create API endpoints for:

### Change Management
```typescript
// Approve individual change
POST /api/change-items/{id}/approve

// Reject individual change
POST /api/change-items/{id}/reject

// Add comment to change
POST /api/change-items/{id}/comments
```

### SEVIS Batch Management
```typescript
// Create SEVIS batch
POST /api/sevis-batches

// Add change to batch
POST /api/sevis-batches/{id}/items

// Submit batch to SEVIS
POST /api/sevis-batches/{id}/submit
```

### Data Queries
```typescript
// Get change requests with items and comments
GET /api/change-requests?include=items,comments

// Get SEVIS batches
GET /api/sevis-batches?status=ready
```

## Database Triggers

The system includes automatic triggers for:

1. **Change Request Status Updates**: Automatically updates request status based on individual change approvals
2. **SEVIS Batch Counts**: Maintains accurate counts of total, processed, and failed items

## Security Considerations

- **Row Level Security (RLS)**: Basic policies are included but should be customized
- **User Permissions**: Implement role-based access for approvals
- **SEVIS Data**: Ensure SEVIS-related data is properly secured
- **Audit Trail**: All changes and approvals are logged with timestamps

## Monitoring and Maintenance

### Key Metrics to Monitor
- Pending change items requiring approval
- SEVIS batches ready for submission
- Failed SEVIS batch items
- Average approval time for changes

### Regular Maintenance
- Archive old change requests
- Clean up processed SEVIS batches
- Monitor comment storage growth
- Review and update SEVIS field mappings

## Troubleshooting

### Common Issues

1. **Foreign Key Errors**: Ensure existing profile IDs are used in mock data
2. **Trigger Failures**: Check that all required tables exist before creating triggers
3. **Type Mismatches**: Regenerate TypeScript types after schema changes

### Validation Queries

```sql
-- Check change request status consistency
SELECT cr.id, cr.status, 
       COUNT(ci.id) as total_items,
       COUNT(CASE WHEN ci.status = 'approved' THEN 1 END) as approved_items
FROM change_requests cr
LEFT JOIN change_items ci ON cr.id = ci.change_request_id
GROUP BY cr.id, cr.status;

-- Check SEVIS batch item counts
SELECT sb.id, sb.batch_name, sb.total_items, 
       COUNT(sbi.id) as actual_items
FROM sevis_batches sb
LEFT JOIN sevis_batch_items sbi ON sb.id = sbi.sevis_batch_id
GROUP BY sb.id, sb.batch_name, sb.total_items;
```

## Next Steps

1. **Apply the schema** to your Supabase database
2. **Generate and import** mock data for testing
3. **Test the UI** with the new change queue component
4. **Implement API endpoints** for full functionality
5. **Customize RLS policies** for your security requirements
6. **Set up monitoring** for the change queue metrics

The system is designed to be flexible and can be extended with additional features like:
- Email notifications for approvals
- Automated SEVIS submissions
- Advanced reporting and analytics
- Integration with external systems 