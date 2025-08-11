-- Fix app_sessions table structure
-- This script will recreate the app_sessions table with correct structure

-- Drop existing sessions table
DROP TABLE IF EXISTS app_sessions CASCADE;

-- Create app_sessions table with correct structure
CREATE TABLE app_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_sessions_token ON app_sessions(session_token);
CREATE INDEX idx_sessions_user_id ON app_sessions(user_id);
CREATE INDEX idx_sessions_expires ON app_sessions(expires_at);

-- Create trigger for updated_at (if function doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_sessions_updated_at 
    BEFORE UPDATE ON app_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Show table structure
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'app_sessions'
ORDER BY ordinal_position;
