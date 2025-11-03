-- Apply-all-policies.sql
-- This file combines both service role bypass policies and public access policies
-- Run this in your Supabase SQL Editor

-- First enable RLS on all tables (if not already enabled)
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reference_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if you need to recreate them
-- DROP POLICY IF EXISTS "Service role bypass for users" ON public.users;
-- DROP POLICY IF EXISTS "Public read access for reference_data" ON public.reference_data;

-- Create service role bypass policies for all tables
CREATE POLICY "Service role bypass for users" ON public.users
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role bypass for profiles" ON public.profiles
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role bypass for relationships" ON public.relationships
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role bypass for applications" ON public.applications
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role bypass for placements" ON public.placements
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role bypass for monitoring" ON public.monitoring
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role bypass for documents" ON public.documents
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role bypass for notes" ON public.notes
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role bypass for reference_data" ON public.reference_data
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Create public access policy for reference_data
CREATE POLICY "Public read access for reference_data" ON public.reference_data
  FOR SELECT USING (true);

-- Create public access policy for tables that need to be publicly readable
CREATE POLICY "Public read access for users" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Public read access for profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Public read access for relationships" ON public.relationships
  FOR SELECT USING (true);

-- You can add more tables here that need public read access
-- CREATE POLICY "Public read access for TABLE_NAME" ON public.TABLE_NAME 
--   FOR SELECT USING (true); 