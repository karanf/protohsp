-- This file contains SQL commands to create public access policies
-- These policies allow anonymous/public access to certain tables

-- Reference data should be publicly readable
CREATE POLICY "Public read access for reference_data" ON public.reference_data
  FOR SELECT USING (true);

-- Drop existing policy if you need to modify it
-- Example: DROP POLICY IF EXISTS "Public read access for reference_data" ON public.reference_data;

-- If you have other tables that should be publicly readable, add them here
-- CREATE POLICY "Public read access for TABLE_NAME" ON public.TABLE_NAME 
--   FOR SELECT USING (true);

-- Helper function for creating public read policies on specified tables
CREATE OR REPLACE FUNCTION create_public_read_policies(table_names text[])
RETURNS void AS $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY table_names
  LOOP
    BEGIN
      EXECUTE format(
        'CREATE POLICY "Public read access for %I" ON public.%I
         FOR SELECT USING (true)',
        table_name, table_name
      );
      RAISE NOTICE 'Created public read policy for %', table_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Failed to create policy for %: %', table_name, SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT create_public_read_policies(ARRAY['reference_data', 'other_table']); 