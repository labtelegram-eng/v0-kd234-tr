-- Fix users table structure for authentication
-- This script will modify the existing users table or create it if it doesn't exist

-- First, check if users table exists and drop it if needed
DROP TABLE IF EXISTS app_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with correct structure
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user' NOT NULL,
    security_question TEXT,
    security_answer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create app_sessions table
CREATE TABLE app_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_sessions_token ON app_sessions(session_token);
CREATE INDEX idx_sessions_user_id ON app_sessions(user_id);
CREATE INDEX idx_sessions_expires ON app_sessions(expires_at);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at 
    BEFORE UPDATE ON app_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert admin user with plain text password (will be handled by the app)
INSERT INTO users (username, password_hash, role, security_question, security_answer) 
VALUES (
    'admin', 
    'admin123', 
    'admin', 
    'What is your favorite color?', 
    'blue'
);

-- Insert test user
INSERT INTO users (username, password_hash, role, security_question, security_answer) 
VALUES (
    'testuser', 
    'password123', 
    'user', 
    'What is your pet name?', 
    'fluffy'
);

-- Clean up expired sessions (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM app_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Show created tables and their structure
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('users', 'app_sessions')
ORDER BY table_name, ordinal_position;
