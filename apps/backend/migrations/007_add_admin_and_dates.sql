-- Migration: 007_add_admin_and_dates.sql
-- Description: Add admin users and scheduled dates tables

-- =============================================================================
-- Admin Roles Enum Type
-- =============================================================================
DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM (
        'super_admin',
        'genie',
        'support',
        'moderator'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- Date Status Enum Type
-- =============================================================================
DO $$ BEGIN
    CREATE TYPE date_status AS ENUM (
        'scheduled',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled',
        'no_show'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- Admin Users Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role admin_role NOT NULL DEFAULT 'support',
    is_genie BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES admin_users(id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_genie ON admin_users(is_genie) WHERE is_genie = TRUE;

-- =============================================================================
-- Scheduled Dates Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS scheduled_dates (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    genie_id INTEGER REFERENCES admin_users(id),
    scheduled_time TIMESTAMP NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    status date_status NOT NULL DEFAULT 'scheduled',
    date_type VARCHAR(50) NOT NULL DEFAULT 'online', -- online, offline, event

    -- Location details for offline dates
    place_name VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    zipcode VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    notes TEXT,
    admin_notes TEXT,

    -- Tracking
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancelled_by INTEGER REFERENCES admin_users(id),
    cancellation_reason TEXT,

    -- Ensure user1_id < user2_id to avoid duplicates
    CONSTRAINT check_different_users CHECK (user1_id != user2_id)
);

-- Indexes for scheduled dates
CREATE INDEX IF NOT EXISTS idx_scheduled_dates_user1 ON scheduled_dates(user1_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_dates_user2 ON scheduled_dates(user2_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_dates_genie ON scheduled_dates(genie_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_dates_status ON scheduled_dates(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_dates_scheduled_time ON scheduled_dates(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_dates_status_time ON scheduled_dates(status, scheduled_time);

-- =============================================================================
-- Admin Sessions Table (for tracking admin logins)
-- =============================================================================
CREATE TABLE IF NOT EXISTS admin_sessions (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token_hash);

-- =============================================================================
-- Date History/Activity Log
-- =============================================================================
CREATE TABLE IF NOT EXISTS date_activity_log (
    id SERIAL PRIMARY KEY,
    date_id INTEGER NOT NULL REFERENCES scheduled_dates(id) ON DELETE CASCADE,
    admin_id INTEGER REFERENCES admin_users(id),
    action VARCHAR(50) NOT NULL, -- created, status_changed, note_added, etc.
    old_value TEXT,
    new_value TEXT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_date_activity_date_id ON date_activity_log(date_id);

-- =============================================================================
-- Update Trigger for updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_scheduled_dates_updated_at ON scheduled_dates;
CREATE TRIGGER update_scheduled_dates_updated_at
    BEFORE UPDATE ON scheduled_dates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Insert Default Super Admin (password: Admin@123)
-- Password hash generated with bcrypt cost 12
-- =============================================================================
INSERT INTO admin_users (email, name, password_hash, role, is_genie, is_active)
VALUES (
    'admin@datifyy.com',
    'Super Admin',
    '$2a$12$i2WwSQr28rSRUEPGS5gd7e6tzwuO1QVDqa66zqwCM9i5/FJefgG4.', -- Admin@123
    'super_admin',
    TRUE,
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Insert test Genie admin
INSERT INTO admin_users (email, name, password_hash, role, is_genie, is_active)
VALUES (
    'genie@datifyy.com',
    'Date Genie',
    '$2a$12$i2WwSQr28rSRUEPGS5gd7e6tzwuO1QVDqa66zqwCM9i5/FJefgG4.', -- Admin@123
    'genie',
    TRUE,
    TRUE
) ON CONFLICT (email) DO NOTHING;
