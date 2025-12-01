-- Migration: Add user blocking, reporting, and app preferences tables

-- Create user_blocks table for blocking functionality
CREATE TABLE IF NOT EXISTS user_blocks (
    id SERIAL PRIMARY KEY,
    blocker_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure a user can't block the same person twice
    UNIQUE(blocker_user_id, blocked_user_id),

    -- Ensure a user can't block themselves
    CONSTRAINT check_not_self_block CHECK (blocker_user_id != blocked_user_id)
);

-- Create user_reports table for reporting inappropriate behavior
CREATE TABLE IF NOT EXISTS user_reports (
    id SERIAL PRIMARY KEY,
    reporter_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_id VARCHAR(255) UNIQUE NOT NULL,
    reason VARCHAR(50) NOT NULL, -- SPAM, INAPPROPRIATE_CONTENT, FAKE_PROFILE, etc.
    details TEXT,
    evidence_urls JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, REVIEWED, RESOLVED, DISMISSED
    reviewed_by INTEGER REFERENCES users(id), -- Admin/moderator who reviewed
    reviewed_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure a user can't report themselves
    CONSTRAINT check_not_self_report CHECK (reporter_user_id != reported_user_id)
);

-- Create user_preferences table for app settings
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Notification preferences
    push_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    notify_matches BOOLEAN DEFAULT TRUE,
    notify_messages BOOLEAN DEFAULT TRUE,
    notify_likes BOOLEAN DEFAULT TRUE,
    notify_super_likes BOOLEAN DEFAULT TRUE,
    notify_profile_views BOOLEAN DEFAULT FALSE,

    -- Privacy preferences
    public_profile BOOLEAN DEFAULT TRUE,
    show_online_status BOOLEAN DEFAULT TRUE,
    show_distance BOOLEAN DEFAULT TRUE,
    show_age BOOLEAN DEFAULT TRUE,
    allow_search_engines BOOLEAN DEFAULT FALSE,
    incognito_mode BOOLEAN DEFAULT FALSE,
    read_receipts BOOLEAN DEFAULT TRUE,

    -- Discovery preferences
    discoverable BOOLEAN DEFAULT TRUE,
    global_mode BOOLEAN DEFAULT FALSE,
    verified_only BOOLEAN DEFAULT FALSE,
    distance_radius INTEGER DEFAULT 50, -- in km
    recently_active_days INTEGER DEFAULT 7,

    -- App preferences
    app_language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'light', -- light, dark, auto

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON user_blocks(blocker_user_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON user_blocks(blocked_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter ON user_reports(reporter_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported ON user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_report_id ON user_reports(report_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Create trigger for updated_at on user_preferences
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE
    ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add check constraints for user_reports
ALTER TABLE user_reports
ADD CONSTRAINT check_report_status
CHECK (status IN ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'));

-- Add check constraints for report reasons (matching proto enum)
ALTER TABLE user_reports
ADD CONSTRAINT check_report_reason
CHECK (reason IN (
    'SPAM', 'INAPPROPRIATE_CONTENT', 'FAKE_PROFILE', 'HARASSMENT',
    'SCAM', 'UNDERAGE', 'STOLEN_PHOTOS', 'HATE_SPEECH', 'VIOLENCE', 'OTHER'
));
