-- Supabase Database Schema for LLM API Sentinel
-- Run this SQL in the Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- API Status Table
CREATE TABLE IF NOT EXISTS api_status (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('online', 'offline', 'degraded')),
  latency INTEGER NOT NULL DEFAULT 0,
  last_checked TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  error TEXT,
  retries INTEGER DEFAULT 0,
  error_rate DECIMAL(5, 2) DEFAULT 0,
  availability DECIMAL(5, 2) DEFAULT 100,
  uptime DECIMAL(5, 2) DEFAULT 100,
  average_latency INTEGER,
  max_latency INTEGER,
  min_latency INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Status History Table
CREATE TABLE IF NOT EXISTS status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_id VARCHAR(255) NOT NULL REFERENCES api_status(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('online', 'offline', 'degraded')),
  latency INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  retries INTEGER DEFAULT 0,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_id VARCHAR(255) NOT NULL,
  api_name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('downtime', 'latency', 'error')),
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  error TEXT,
  retries INTEGER DEFAULT 0,
  latency INTEGER,
  resolved_at TIMESTAMPTZ,
  resolved_by VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Profiles Table (for Supabase Auth integration)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(255),
  email VARCHAR(255),
  photo_url TEXT,
  provider_id VARCHAR(255),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_status_history_api_id ON status_history(api_id);
CREATE INDEX IF NOT EXISTS idx_status_history_timestamp ON status_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_api_id ON alerts(api_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
DROP TRIGGER IF EXISTS update_api_status_updated_at ON api_status;
CREATE TRIGGER update_api_status_updated_at
  BEFORE UPDATE ON api_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies (v2.6.3)
-- Security Model:
--   - READ (SELECT): Public (all users, including anon) to allow dashboard data access
--   - WRITE (INSERT/UPDATE): Restricted to authenticated users only
--   - Reason: Anonymous users MUST NOT be able to mutate tables; only signed-in users
--     or the service_role backend (which bypasses RLS) should write data.

-- Enable RLS on all tables
ALTER TABLE api_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- API Status: Everyone can read, only authenticated users can write
CREATE POLICY "api_status_read_all" ON api_status FOR SELECT USING (true);
CREATE POLICY "api_status_insert_authenticated" ON api_status FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "api_status_update_authenticated" ON api_status FOR UPDATE TO authenticated USING (true);

-- Status History: Everyone can read, only authenticated users can insert
CREATE POLICY "status_history_read_all" ON status_history FOR SELECT USING (true);
CREATE POLICY "status_history_insert_authenticated" ON status_history FOR INSERT TO authenticated WITH CHECK (true);

-- Alerts: Everyone can read, authenticated users can update (resolve)
CREATE POLICY "alerts_read_all" ON alerts FOR SELECT USING (true);
CREATE POLICY "alerts_update_authenticated" ON alerts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "alerts_insert_authenticated" ON alerts FOR INSERT TO authenticated WITH CHECK (true);

-- User Profiles: Users can read their own profile, admins can read all
CREATE POLICY "user_profiles_select_own" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "user_profiles_insert_own" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_update_own" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant explicit, least-privilege permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
-- authenticated users: read + write on data tables (enforced by RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
-- anonymous users: read-only (SELECT) for dashboard viewing
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
-- Ensure future tables automatically inherit this policy
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, UPDATE ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO anon;
