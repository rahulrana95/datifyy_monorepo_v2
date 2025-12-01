-- Migration: 008_add_curated_matches.sql
-- Description: Add tables for AI-curated matches and date rejections

-- =============================================================================
-- Curated Matches Table (AI Compatibility Analysis Results)
-- =============================================================================
CREATE TABLE IF NOT EXISTS curated_matches (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    compatibility_score DECIMAL(5, 2) NOT NULL, -- 0.00 to 100.00
    is_match BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE if score >= 60
    reasoning TEXT,
    matched_aspects TEXT[], -- Array of strings
    mismatched_aspects TEXT[], -- Array of strings

    -- AI Provider info
    ai_provider VARCHAR(50) NOT NULL DEFAULT 'gemini',
    ai_model VARCHAR(100),

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected, scheduled

    -- Admin who created this match
    created_by_admin INTEGER REFERENCES admin_users(id),

    -- Scheduled date reference (if date created)
    scheduled_date_id INTEGER REFERENCES scheduled_dates(id) ON DELETE SET NULL,

    -- Tracking
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Ensure user1_id < user2_id to avoid duplicates
    CONSTRAINT check_different_users_curated CHECK (user1_id != user2_id),

    -- Unique constraint to prevent duplicate analysis
    CONSTRAINT unique_curated_match UNIQUE (user1_id, user2_id)
);

-- Indexes for curated matches
CREATE INDEX IF NOT EXISTS idx_curated_matches_user1 ON curated_matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_curated_matches_user2 ON curated_matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_curated_matches_score ON curated_matches(compatibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_curated_matches_status ON curated_matches(status);
CREATE INDEX IF NOT EXISTS idx_curated_matches_created_by ON curated_matches(created_by_admin);

-- =============================================================================
-- Date Suggestions Table (Datifyy AI Suggestions to Users)
-- =============================================================================
CREATE TABLE IF NOT EXISTS date_suggestions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    suggested_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    curated_match_id INTEGER REFERENCES curated_matches(id) ON DELETE SET NULL,

    -- Suggestion metadata
    compatibility_score DECIMAL(5, 2) NOT NULL,
    reasoning TEXT,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, accepted, rejected

    -- If accepted, reference to scheduled date
    scheduled_date_id INTEGER REFERENCES scheduled_dates(id) ON DELETE SET NULL,

    -- Tracking
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,

    -- Ensure different users
    CONSTRAINT check_different_users_suggestion CHECK (user_id != suggested_user_id)
);

-- Indexes for date suggestions
CREATE INDEX IF NOT EXISTS idx_date_suggestions_user ON date_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_date_suggestions_suggested_user ON date_suggestions(suggested_user_id);
CREATE INDEX IF NOT EXISTS idx_date_suggestions_status ON date_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_date_suggestions_user_status ON date_suggestions(user_id, status);

-- =============================================================================
-- Rejection Reasons Enum Type
-- =============================================================================
DO $$ BEGIN
    CREATE TYPE rejection_reason_type AS ENUM (
        'not_interested',
        'too_far',
        'incompatible_interests',
        'age_mismatch',
        'lifestyle_difference',
        'timing_conflict',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- Date Rejections Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS date_rejections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rejected_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    suggestion_id INTEGER REFERENCES date_suggestions(id) ON DELETE SET NULL,
    scheduled_date_id INTEGER REFERENCES scheduled_dates(id) ON DELETE SET NULL,

    -- Rejection reasons (can have multiple)
    reasons rejection_reason_type[] NOT NULL,
    custom_reason TEXT, -- Max 200 characters (validated in application)

    -- Tracking
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Ensure different users
    CONSTRAINT check_different_users_rejection CHECK (user_id != rejected_user_id),

    -- Constraint: either suggestion_id or scheduled_date_id must be set
    CONSTRAINT check_rejection_source CHECK (
        (suggestion_id IS NOT NULL AND scheduled_date_id IS NULL) OR
        (suggestion_id IS NULL AND scheduled_date_id IS NOT NULL)
    )
);

-- Indexes for date rejections
CREATE INDEX IF NOT EXISTS idx_date_rejections_user ON date_rejections(user_id);
CREATE INDEX IF NOT EXISTS idx_date_rejections_rejected_user ON date_rejections(rejected_user_id);
CREATE INDEX IF NOT EXISTS idx_date_rejections_suggestion ON date_rejections(suggestion_id);
CREATE INDEX IF NOT EXISTS idx_date_rejections_scheduled_date ON date_rejections(scheduled_date_id);

-- =============================================================================
-- Update Triggers
-- =============================================================================
DROP TRIGGER IF EXISTS update_curated_matches_updated_at ON curated_matches;
CREATE TRIGGER update_curated_matches_updated_at
    BEFORE UPDATE ON curated_matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_date_suggestions_updated_at ON date_suggestions;
CREATE TRIGGER update_date_suggestions_updated_at
    BEFORE UPDATE ON date_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
