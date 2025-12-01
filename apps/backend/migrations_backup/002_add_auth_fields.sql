-- Migration: Add authentication and profile fields to users table
-- This extends the basic users table with fields needed for authentication,
-- verification, and user profiles

-- Add authentication fields
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS account_status VARCHAR(50) DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS password_reset_token_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- Add profile fields (basic)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender VARCHAR(50);

-- Create user_profiles table for extended profile data
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    -- Profile details
    bio TEXT,
    occupation JSONB DEFAULT '[]'::jsonb,
    company VARCHAR(255),
    job_title VARCHAR(255),
    education JSONB DEFAULT '[]'::jsonb,
    school VARCHAR(255),
    height INTEGER, -- in cm
    location JSONB,
    hometown VARCHAR(255),
    interests JSONB DEFAULT '[]'::jsonb,
    languages JSONB DEFAULT '[]'::jsonb,
    relationship_goals JSONB DEFAULT '[]'::jsonb,

    -- Lifestyle information
    drinking VARCHAR(50),
    smoking VARCHAR(50),
    workout VARCHAR(50),
    dietary_preference VARCHAR(50),
    religion VARCHAR(50),
    religion_importance VARCHAR(50),
    political_view VARCHAR(50),
    pets VARCHAR(50),
    children VARCHAR(50),
    personality_type VARCHAR(20),
    communication_style VARCHAR(50),
    love_language VARCHAR(50),
    sleep_schedule VARCHAR(50),

    -- Profile prompts (dating questions)
    prompts JSONB DEFAULT '[]'::jsonb,

    -- Profile metadata
    completion_percentage INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create partner_preferences table
CREATE TABLE IF NOT EXISTS partner_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    -- Preference fields
    looking_for_gender JSONB DEFAULT '[]'::jsonb,
    age_range_min INTEGER DEFAULT 18,
    age_range_max INTEGER DEFAULT 99,
    distance_preference INTEGER DEFAULT 50, -- in km
    height_range_min INTEGER,
    height_range_max INTEGER,
    relationship_goals JSONB DEFAULT '[]'::jsonb,
    education_levels JSONB DEFAULT '[]'::jsonb,
    occupations JSONB DEFAULT '[]'::jsonb,
    religions JSONB DEFAULT '[]'::jsonb,
    children_preferences JSONB DEFAULT '[]'::jsonb,
    drinking_preferences JSONB DEFAULT '[]'::jsonb,
    smoking_preferences JSONB DEFAULT '[]'::jsonb,
    dietary_preferences JSONB DEFAULT '[]'::jsonb,
    pet_preferences JSONB DEFAULT '[]'::jsonb,
    verified_only BOOLEAN DEFAULT FALSE,
    dealbreakers JSONB DEFAULT '[]'::jsonb,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_photos table
CREATE TABLE IF NOT EXISTS user_photos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    photo_id VARCHAR(255) UNIQUE NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    caption TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create devices table for device management
CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) UNIQUE NOT NULL,
    device_name VARCHAR(255),
    platform VARCHAR(50),
    os_version VARCHAR(50),
    app_version VARCHAR(50),
    browser VARCHAR(100),
    push_token TEXT,
    is_trusted BOOLEAN DEFAULT FALSE,
    login_count INTEGER DEFAULT 1,
    last_ip_address VARCHAR(50),
    last_location JSONB,
    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create verification_codes table
CREATE TABLE IF NOT EXISTS verification_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    type VARCHAR(50) NOT NULL, -- EMAIL, PHONE, PASSWORD_RESET
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update sessions table to include more metadata
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS device_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(50),
ADD COLUMN IF NOT EXISTS location JSONB,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_preferences_user_id ON partner_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_photos_user_id ON user_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id ON verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_sessions_device_id ON sessions(device_id);

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE
    ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_preferences_updated_at BEFORE UPDATE
    ON partner_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add constraints (ensure only one primary photo per user)
-- Using a unique partial index instead of EXCLUDE constraint
CREATE UNIQUE INDEX idx_user_photos_primary_per_user
ON user_photos (user_id)
WHERE is_primary = true;

-- Add check constraints
ALTER TABLE users
ADD CONSTRAINT check_account_status
CHECK (account_status IN ('PENDING', 'ACTIVE', 'SUSPENDED', 'BANNED', 'DELETED'));

ALTER TABLE users
ADD CONSTRAINT check_email_format
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
