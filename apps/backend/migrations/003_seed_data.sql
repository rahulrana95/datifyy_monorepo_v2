-- Seed data for development and testing
-- Creates dummy users with various profiles for testing the dating app

-- Insert test users (passwords are hashed for "Test123!@#")
-- Note: In production, never commit real password hashes

INSERT INTO users (email, name, password_hash, email_verified, account_status, date_of_birth, gender, photo_url, created_at, updated_at)
VALUES
    -- User 1: John Doe (Software Engineer, 28, Male)
    ('john.doe@example.com', 'John Doe', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu', true, 'ACTIVE', '1995-06-15', 'MALE', 'https://i.pravatar.cc/300?img=12', NOW() - INTERVAL '30 days', NOW()),

    -- User 2: Sarah Johnson (Designer, 26, Female)
    ('sarah.johnson@example.com', 'Sarah Johnson', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu', true, 'ACTIVE', '1997-03-22', 'FEMALE', 'https://i.pravatar.cc/300?img=5', NOW() - INTERVAL '25 days', NOW()),

    -- User 3: Rahul Sharma (Doctor, 32, Male)
    ('rahul.sharma@example.com', 'Rahul Sharma', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu', true, 'ACTIVE', '1991-11-08', 'MALE', 'https://i.pravatar.cc/300?img=33', NOW() - INTERVAL '20 days', NOW()),

    -- User 4: Priya Patel (Marketing Manager, 29, Female)
    ('priya.patel@example.com', 'Priya Patel', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu', true, 'ACTIVE', '1994-07-30', 'FEMALE', 'https://i.pravatar.cc/300?img=9', NOW() - INTERVAL '15 days', NOW()),

    -- User 5: Michael Chen (Entrepreneur, 35, Male)
    ('michael.chen@example.com', 'Michael Chen', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu', true, 'ACTIVE', '1988-01-12', 'MALE', 'https://i.pravatar.cc/300?img=15', NOW() - INTERVAL '10 days', NOW()),

    -- User 6: Emily Williams (Teacher, 27, Female)
    ('emily.williams@example.com', 'Emily Williams', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu', true, 'ACTIVE', '1996-09-18', 'FEMALE', 'https://i.pravatar.cc/300?img=20', NOW() - INTERVAL '7 days', NOW()),

    -- User 7: Arjun Mehta (Photographer, 30, Male)
    ('arjun.mehta@example.com', 'Arjun Mehta', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu', true, 'ACTIVE', '1993-04-25', 'MALE', 'https://i.pravatar.cc/300?img=51', NOW() - INTERVAL '5 days', NOW()),

    -- User 8: Lisa Anderson (Lawyer, 31, Female)
    ('lisa.anderson@example.com', 'Lisa Anderson', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu', true, 'ACTIVE', '1992-12-03', 'FEMALE', 'https://i.pravatar.cc/300?img=10', NOW() - INTERVAL '3 days', NOW()),

    -- User 9: David Kumar (Data Scientist, 28, Male)
    ('david.kumar@example.com', 'David Kumar', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu', true, 'ACTIVE', '1995-08-14', 'MALE', 'https://i.pravatar.cc/300?img=68', NOW() - INTERVAL '2 days', NOW()),

    -- User 10: Aisha Khan (Nurse, 25, Female)
    ('aisha.khan@example.com', 'Aisha Khan', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu', true, 'ACTIVE', '1998-02-20', 'FEMALE', 'https://i.pravatar.cc/300?img=16', NOW() - INTERVAL '1 day', NOW()),

    -- User 11: Pending verification user
    ('pending.user@example.com', 'Pending User', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu', false, 'PENDING', '1996-05-10', 'MALE', NULL, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Get user IDs for inserting related data
DO $$
DECLARE
    user_id_1 INTEGER;
    user_id_2 INTEGER;
    user_id_3 INTEGER;
    user_id_4 INTEGER;
    user_id_5 INTEGER;
BEGIN
    -- Get user IDs
    SELECT id INTO user_id_1 FROM users WHERE email = 'john.doe@example.com';
    SELECT id INTO user_id_2 FROM users WHERE email = 'sarah.johnson@example.com';
    SELECT id INTO user_id_3 FROM users WHERE email = 'rahul.sharma@example.com';
    SELECT id INTO user_id_4 FROM users WHERE email = 'priya.patel@example.com';
    SELECT id INTO user_id_5 FROM users WHERE email = 'michael.chen@example.com';

    -- Insert user profiles
    INSERT INTO user_profiles (user_id, bio, occupation, company, education, height, location, interests, languages, relationship_goals, drinking, smoking, workout, dietary_preference, religion, pets, children, completion_percentage)
    VALUES
        (user_id_1, 'Software engineer who loves hiking and trying new restaurants. Looking for someone to explore the world with!',
         '[{"category": 1, "label": "Software Engineer"}]'::jsonb, 'Tech Corp',
         '[{"level": 4, "label": "BS Computer Science"}]'::jsonb, 180,
         '{"city": "San Francisco", "country": "USA"}'::jsonb,
         '[{"category": 14, "label": "Hiking"}, {"category": 1, "label": "Travel"}, {"category": 5, "label": "Cooking"}]'::jsonb,
         '[{"code": 1, "label": "English", "proficiency": 4}]'::jsonb,
         '[1, 2]'::jsonb, 'SOCIALLY', 'NEVER', 'OFTEN', 'ANYTHING', 'AGNOSTIC', 'DOG_LOVER', 'DONT_HAVE_WANT', 85),

        (user_id_2, 'Creative soul with a passion for design and art. Coffee enthusiast and bookworm. Let''s create something beautiful together!',
         '[{"category": 19, "label": "Designer"}]'::jsonb, 'Creative Studio',
         '[{"level": 5, "label": "MFA Design"}]'::jsonb, 165,
         '{"city": "New York", "country": "USA"}'::jsonb,
         '[{"category": 10, "label": "Art"}, {"category": 8, "label": "Reading"}, {"category": 2, "label": "Photography"}]'::jsonb,
         '[{"code": 1, "label": "English", "proficiency": 4}, {"code": 2, "label": "Spanish", "proficiency": 2}]'::jsonb,
         '[1]'::jsonb, 'RARELY', 'NEVER', 'SOMETIMES', 'VEGETARIAN', 'SPIRITUAL', 'CAT_LOVER', 'OPEN_TO_CHILDREN', 90),

        (user_id_3, 'Cardiologist who believes in living life to the fullest. Fitness enthusiast and foodie. Looking for my partner in crime!',
         '[{"category": 6, "label": "Doctor"}]'::jsonb, 'City Hospital',
         '[{"level": 8, "label": "MD Cardiology"}]'::jsonb, 175,
         '{"city": "Mumbai", "country": "India"}'::jsonb,
         '[{"category": 6, "label": "Fitness"}, {"category": 5, "label": "Cooking"}, {"category": 1, "label": "Travel"}]'::jsonb,
         '[{"code": 1, "label": "English", "proficiency": 4}, {"code": 12, "label": "Hindi", "proficiency": 4}]'::jsonb,
         '[2]'::jsonb, 'SOCIALLY', 'NEVER', 'DAILY', 'ANYTHING', 'HINDU', 'NO_PETS', 'DONT_HAVE_WANT', 95),

        (user_id_4, 'Marketing guru by day, adventure seeker by weekend. Love trying new cuisines and meeting new people!',
         '[{"category": 34, "label": "Marketing Manager"}]'::jsonb, 'Brand Agency',
         '[{"level": 6, "label": "MBA Marketing"}]'::jsonb, 162,
         '{"city": "Bangalore", "country": "India"}'::jsonb,
         '[{"category": 1, "label": "Travel"}, {"category": 7, "label": "Yoga"}, {"category": 11, "label": "Dancing"}]'::jsonb,
         '[{"code": 1, "label": "English", "proficiency": 4}, {"code": 12, "label": "Hindi", "proficiency": 3}, {"code": 17, "label": "Gujarati", "proficiency": 4}]'::jsonb,
         '[1, 6]'::jsonb, 'SOCIALLY', 'NEVER', 'OFTEN', 'VEGETARIAN', 'HINDU', 'NO_PETS', 'NOT_SURE', 88),

        (user_id_5, 'Startup founder passionate about building products that matter. Tech geek, travel junkie, and wine enthusiast.',
         '[{"category": 14, "label": "Entrepreneur"}]'::jsonb, 'Startup Inc',
         '[{"level": 5, "label": "MS Business"}]'::jsonb, 178,
         '{"city": "Singapore", "country": "Singapore"}'::jsonb,
         '[{"category": 18, "label": "Entrepreneurship"}, {"category": 1, "label": "Travel"}, {"category": 19, "label": "Wine Tasting"}]'::jsonb,
         '[{"code": 1, "label": "English", "proficiency": 4}, {"code": 8, "label": "Mandarin", "proficiency": 2}]'::jsonb,
         '[1, 2]'::jsonb, 'REGULARLY', 'NEVER', 'SOMETIMES', 'ANYTHING', 'ATHEIST', 'WANT_SOMEDAY', 'OPEN_TO_CHILDREN', 92)
    ON CONFLICT (user_id) DO NOTHING;

    -- Insert partner preferences
    INSERT INTO partner_preferences (user_id, looking_for_gender, age_range_min, age_range_max, distance_preference, relationship_goals, verified_only)
    VALUES
        (user_id_1, '[2]'::jsonb, 24, 32, 50, '[1, 2]'::jsonb, false),
        (user_id_2, '[1]'::jsonb, 26, 35, 40, '[1]'::jsonb, true),
        (user_id_3, '[2]'::jsonb, 26, 34, 30, '[2]'::jsonb, false),
        (user_id_4, '[1]'::jsonb, 27, 38, 25, '[1, 6]'::jsonb, false),
        (user_id_5, '[2]'::jsonb, 28, 36, 100, '[1, 2]'::jsonb, false)
    ON CONFLICT (user_id) DO NOTHING;

    -- Insert sample photos for some users
    INSERT INTO user_photos (user_id, photo_id, url, thumbnail_url, display_order, is_primary)
    VALUES
        (user_id_1, 'photo_1_1', 'https://i.pravatar.cc/600?img=12', 'https://i.pravatar.cc/150?img=12', 1, true),
        (user_id_1, 'photo_1_2', 'https://i.pravatar.cc/600?img=13', 'https://i.pravatar.cc/150?img=13', 2, false),
        (user_id_2, 'photo_2_1', 'https://i.pravatar.cc/600?img=5', 'https://i.pravatar.cc/150?img=5', 1, true),
        (user_id_2, 'photo_2_2', 'https://i.pravatar.cc/600?img=6', 'https://i.pravatar.cc/150?img=6', 2, false)
    ON CONFLICT (photo_id) DO NOTHING;

END $$;

-- Add some sample sessions
INSERT INTO sessions (id, user_id, expires_at, is_active, last_active_at)
SELECT
    'sess_' || id || '_' || EXTRACT(EPOCH FROM NOW())::bigint,
    id,
    NOW() + INTERVAL '7 days',
    true,
    NOW()
FROM users
WHERE account_status = 'ACTIVE'
LIMIT 5
ON CONFLICT (id) DO NOTHING;
