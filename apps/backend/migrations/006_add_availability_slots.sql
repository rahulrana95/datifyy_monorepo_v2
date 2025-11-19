-- Migration: Add availability slots table
-- Description: Store user availability for dates

-- Create date_type enum
DO $$ BEGIN
    CREATE TYPE date_type AS ENUM ('online', 'offline', 'offline_event');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create availability_slots table
CREATE TABLE IF NOT EXISTS availability_slots (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time BIGINT NOT NULL,  -- Unix timestamp
    end_time BIGINT NOT NULL,    -- Unix timestamp
    date_type date_type NOT NULL DEFAULT 'online',

    -- Offline location details (nullable for online dates)
    place_name VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    zipcode VARCHAR(20),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    google_place_id VARCHAR(255),
    google_maps_url TEXT,

    -- Optional notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT valid_duration CHECK (end_time - start_time = 3600),  -- Exactly 1 hour (3600 seconds)

    -- Prevent duplicate slots for the same user at the same time
    CONSTRAINT unique_user_slot UNIQUE (user_id, start_time)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_availability_slots_user_id ON availability_slots(user_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_start_time ON availability_slots(start_time);
CREATE INDEX IF NOT EXISTS idx_availability_slots_user_start ON availability_slots(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_availability_slots_date_type ON availability_slots(date_type);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_availability_slots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_availability_slots_updated_at ON availability_slots;
CREATE TRIGGER trigger_update_availability_slots_updated_at
    BEFORE UPDATE ON availability_slots
    FOR EACH ROW
    EXECUTE FUNCTION update_availability_slots_updated_at();

-- Comment on table
COMMENT ON TABLE availability_slots IS 'Stores user availability slots for dates';
COMMENT ON COLUMN availability_slots.start_time IS 'Start time as Unix timestamp in seconds';
COMMENT ON COLUMN availability_slots.end_time IS 'End time as Unix timestamp in seconds (must be exactly 1 hour after start_time)';
COMMENT ON COLUMN availability_slots.date_type IS 'Type of date: online (virtual), offline (in-person), or offline_event';
