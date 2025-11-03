-- This file contains SQL commands to create bypass policies for all tables
-- These policies allow the service_role key to bypass Row Level Security (RLS)

-- Users table policy
CREATE POLICY "Service role bypass for users" ON public.users
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Profiles table policy  
CREATE POLICY "Service role bypass for profiles" ON public.profiles
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Relationships table policy
CREATE POLICY "Service role bypass for relationships" ON public.relationships
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Applications table policy
CREATE POLICY "Service role bypass for applications" ON public.applications
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Placements table policy
CREATE POLICY "Service role bypass for placements" ON public.placements
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Monitoring table policy
CREATE POLICY "Service role bypass for monitoring" ON public.monitoring
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Documents table policy
CREATE POLICY "Service role bypass for documents" ON public.documents
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Notes table policy  
CREATE POLICY "Service role bypass for notes" ON public.notes
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Reference data table policy
CREATE POLICY "Service role bypass for reference_data" ON public.reference_data
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Additional helper function to create bypass policies for all tables
-- This is useful if you add new tables in the future
CREATE OR REPLACE FUNCTION create_service_role_bypass_policies()
RETURNS void AS $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  LOOP
    BEGIN
      EXECUTE format(
        'CREATE POLICY "Service role bypass for %I" ON public.%I
         FOR ALL USING (auth.jwt()->''role'' = ''service_role'')',
        table_record.tablename, table_record.tablename
      );
      RAISE NOTICE 'Created bypass policy for %', table_record.tablename;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Failed to create policy for %: %', table_record.tablename, SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql; 