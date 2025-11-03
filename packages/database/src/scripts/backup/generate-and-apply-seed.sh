#!/bin/bash

# Exit on any error
set -e

# Display usage information
echo "EGAB Seed Data Generator and Applier (Simple Schema Version)"
echo "==========================================================="
echo "This script generates seed data using simple IDs for PoC purposes."
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not installed."
    exit 1
fi

# Create scripts directory if it doesn't exist
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_DIR="$SCRIPT_DIR/../schema"
mkdir -p "$SCHEMA_DIR"

# Generate seed data with transaction support and error handling
echo "Generating seed data..."

# Create a temporary file with SQL transaction wrapping and validation
TMP_SEED_FILE=$(mktemp)

# Add transaction start and proper headers
cat > "$TMP_SEED_FILE" << EOF
-- EGAB Simple Seed Data
-- Generated: $(date)
-- This file contains seed data with simple IDs for the EGAB PoC
-- Default password for all users: PasswordThreeTwo1

BEGIN;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS relationships CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create simplified schema
$(cat "$SCHEMA_DIR/simple-schema.sql")

-- Disable triggers temporarily for bulk loading
SET session_replication_role = replica;

EOF

# Generate the data content
node "$SCRIPT_DIR/simplified-seed-data.js" >> "$TMP_SEED_FILE"

# Add transaction end and restore triggers
cat >> "$TMP_SEED_FILE" << EOF

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Verify data integrity
DO \$\$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;
  RAISE NOTICE 'Seed data inserted: % users', user_count;
  
  IF user_count = 0 THEN
    RAISE WARNING 'No users were inserted!';
  END IF;
END
\$\$;

COMMIT;
EOF

# Copy to final location
cp "$TMP_SEED_FILE" "$SCHEMA_DIR/full-seed-data.sql"
rm "$TMP_SEED_FILE"

echo "Generated seed data saved to $SCHEMA_DIR/full-seed-data.sql"

# Check for Supabase CLI
if command -v supabase &> /dev/null; then
    echo ""
    echo "Supabase CLI detected. How would you like to apply the seed data?"
    echo "1) Apply seed data to local Supabase instance (if running)"
    echo "2) Just generate the files (no application)"
    echo "3) Exit"
    read -r apply_option
    
    case $apply_option in
        1)
            echo "Checking if local Supabase is running..."
            if nc -z localhost 54322 2>/dev/null; then
                echo "Supabase instance detected at localhost:54322"
                echo "Applying seed data to local Supabase..."
                
                if supabase db execute "$SCHEMA_DIR/full-seed-data.sql"; then
                    echo "Seed data applied successfully to local Supabase!"
                else
                    echo "Error applying seed data. You can manually apply it with:"
                    echo "supabase db execute < $SCHEMA_DIR/full-seed-data.sql"
                fi
            else
                echo "No local Supabase instance found at localhost:54322"
                echo "Please start your local Supabase instance with 'supabase start' and then manually apply the seed data with:"
                echo "supabase db execute < $SCHEMA_DIR/full-seed-data.sql"
            fi
            ;;
        2)
            echo "Seed data file generated successfully at: $SCHEMA_DIR/full-seed-data.sql"
            echo "You can manually apply it when ready with:"
            echo "supabase db execute < $SCHEMA_DIR/full-seed-data.sql"
            ;;
        *)
            echo "Exiting without applying seed data."
            ;;
    esac
else
    echo ""
    echo "Supabase CLI not detected. To apply the seed data, use one of these methods:"
    echo "1. Install Supabase CLI: npm install -g supabase"
    echo "2. With PostgreSQL client, run:"
    echo "   psql -h localhost -p 54322 -U postgres -d postgres -f $SCHEMA_DIR/full-seed-data.sql"
fi

echo ""
echo "All users have been created with the password: PasswordThreeTwo1"
echo "Done!" 