-- Initial database schema

-- Create datifyy_v2_users table
CREATE TABLE IF NOT EXISTS datifyy_v2_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create datifyy_v2_sessions table for storing user sessions
CREATE TABLE IF NOT EXISTS datifyy_v2_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER REFERENCES datifyy_v2_users(id) ON DELETE CASCADE,
    data JSONB,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_datifyy_v2_users_email ON datifyy_v2_users(email);
CREATE INDEX IF NOT EXISTS idx_datifyy_v2_sessions_user_id ON datifyy_v2_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_datifyy_v2_sessions_expires_at ON datifyy_v2_sessions(expires_at);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_datifyy_v2_users_updated_at BEFORE UPDATE
    ON datifyy_v2_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();