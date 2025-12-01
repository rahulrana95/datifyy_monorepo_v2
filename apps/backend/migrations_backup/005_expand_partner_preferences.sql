-- Migration: Expand partner_preferences table with all new fields
-- This adds ~45 new columns to match the updated PartnerPreferences proto

-- Add religion_importance
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS religion_importance INTEGER DEFAULT 0;

-- Add workout preferences
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS workout_preferences JSONB DEFAULT '[]'::jsonb;

-- Add personality & communication preferences
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS personality_types JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS communication_styles JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS love_languages JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS political_views JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS sleep_schedules JSONB DEFAULT '[]'::jsonb;

-- Add cultural & matrimonial preferences (India + Global)
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS caste_preferences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS sub_caste_preferences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS gotra_preferences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS manglik_preference INTEGER DEFAULT 0;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS mother_tongue_preferences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS ethnicity_preferences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS nationality_preferences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS nri_preference INTEGER DEFAULT 0;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS horoscope_matching_required BOOLEAN DEFAULT false;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS relocation_expectation INTEGER DEFAULT 0;

-- Add appearance preferences
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS body_type_preferences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS complexion_preferences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS hair_color_preferences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS eye_color_preferences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS facial_hair_preferences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS tattoo_preference INTEGER DEFAULT 0;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS piercing_preference INTEGER DEFAULT 0;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS disability_acceptance INTEGER DEFAULT 0;

-- Add professional & financial preferences
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS income_preferences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS employment_preferences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS industry_preferences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS min_years_experience INTEGER DEFAULT 0;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS property_preference INTEGER DEFAULT 0;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS vehicle_preference INTEGER DEFAULT 0;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS financial_expectation INTEGER DEFAULT 0;

-- Add family background preferences
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS family_type_preferences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS family_values_preferences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS living_situation_preferences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS family_affluence_preferences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS family_location_preferences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS max_siblings INTEGER DEFAULT 0;

-- Add language & location preferences
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS language_preferences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS min_language_proficiency INTEGER DEFAULT 0;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS location_preferences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS open_to_long_distance BOOLEAN DEFAULT false;

-- Add interest & hobby preferences
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS interest_preferences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS min_shared_interests INTEGER DEFAULT 0;

-- Add deal-breakers & must-haves
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS max_days_inactive INTEGER DEFAULT 30;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS photos_required BOOLEAN DEFAULT false;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS min_profile_completion INTEGER DEFAULT 0;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS deal_breakers JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS must_haves JSONB DEFAULT '[]'::jsonb;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS custom_dealbreakers JSONB DEFAULT '[]'::jsonb;

-- Create indexes for frequently searched columns
CREATE INDEX IF NOT EXISTS idx_partner_prefs_age_range ON partner_preferences (age_range_min, age_range_max);
CREATE INDEX IF NOT EXISTS idx_partner_prefs_distance ON partner_preferences (distance_preference);
CREATE INDEX IF NOT EXISTS idx_partner_prefs_religion_importance ON partner_preferences (religion_importance);
CREATE INDEX IF NOT EXISTS idx_partner_prefs_verified_only ON partner_preferences (verified_only);
