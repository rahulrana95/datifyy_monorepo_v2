--
-- PostgreSQL database dump
--

\restrict h5sHyTJLPdJIZhdWLnMciPlZOcfpXukt9QVcBTZZX2v2Que98GifaGUqCzb0g1J

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: admin_role; Type: TYPE; Schema: public; Owner: devuser
--

CREATE TYPE public.admin_role AS ENUM (
    'super_admin',
    'genie',
    'support',
    'moderator'
);


ALTER TYPE public.admin_role OWNER TO devuser;

--
-- Name: date_status; Type: TYPE; Schema: public; Owner: devuser
--

CREATE TYPE public.date_status AS ENUM (
    'scheduled',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'no_show'
);


ALTER TYPE public.date_status OWNER TO devuser;

--
-- Name: date_type; Type: TYPE; Schema: public; Owner: devuser
--

CREATE TYPE public.date_type AS ENUM (
    'online',
    'offline',
    'offline_event'
);


ALTER TYPE public.date_type OWNER TO devuser;

--
-- Name: rejection_reason_type; Type: TYPE; Schema: public; Owner: devuser
--

CREATE TYPE public.rejection_reason_type AS ENUM (
    'not_interested',
    'too_far',
    'incompatible_interests',
    'age_mismatch',
    'lifestyle_difference',
    'timing_conflict',
    'other'
);


ALTER TYPE public.rejection_reason_type OWNER TO devuser;

--
-- Name: update_availability_slots_updated_at(); Type: FUNCTION; Schema: public; Owner: devuser
--

CREATE FUNCTION public.update_availability_slots_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_availability_slots_updated_at() OWNER TO devuser;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: devuser
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO devuser;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_sessions; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.admin_sessions (
    id integer NOT NULL,
    admin_id integer NOT NULL,
    token_hash character varying(255) NOT NULL,
    ip_address character varying(45),
    user_agent text,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    revoked_at timestamp without time zone
);


ALTER TABLE public.admin_sessions OWNER TO devuser;

--
-- Name: admin_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.admin_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.admin_sessions_id_seq OWNER TO devuser;

--
-- Name: admin_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.admin_sessions_id_seq OWNED BY public.admin_sessions.id;


--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.admin_users (
    id integer NOT NULL,
    user_id integer,
    email character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role public.admin_role DEFAULT 'support'::public.admin_role NOT NULL,
    is_genie boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    last_login_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by integer
);


ALTER TABLE public.admin_users OWNER TO devuser;

--
-- Name: admin_users_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.admin_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.admin_users_id_seq OWNER TO devuser;

--
-- Name: admin_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.admin_users_id_seq OWNED BY public.admin_users.id;


--
-- Name: availability_slots; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.availability_slots (
    id integer NOT NULL,
    user_id integer NOT NULL,
    start_time bigint NOT NULL,
    end_time bigint NOT NULL,
    date_type public.date_type DEFAULT 'online'::public.date_type NOT NULL,
    place_name character varying(255),
    address text,
    city character varying(100),
    state character varying(100),
    country character varying(100),
    zipcode character varying(20),
    latitude double precision,
    longitude double precision,
    google_place_id character varying(255),
    google_maps_url text,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_duration CHECK (((end_time - start_time) = 3600)),
    CONSTRAINT valid_time_range CHECK ((end_time > start_time))
);


ALTER TABLE public.availability_slots OWNER TO devuser;

--
-- Name: TABLE availability_slots; Type: COMMENT; Schema: public; Owner: devuser
--

COMMENT ON TABLE public.availability_slots IS 'Stores user availability slots for dates';


--
-- Name: COLUMN availability_slots.start_time; Type: COMMENT; Schema: public; Owner: devuser
--

COMMENT ON COLUMN public.availability_slots.start_time IS 'Start time as Unix timestamp in seconds';


--
-- Name: COLUMN availability_slots.end_time; Type: COMMENT; Schema: public; Owner: devuser
--

COMMENT ON COLUMN public.availability_slots.end_time IS 'End time as Unix timestamp in seconds (must be exactly 1 hour after start_time)';


--
-- Name: COLUMN availability_slots.date_type; Type: COMMENT; Schema: public; Owner: devuser
--

COMMENT ON COLUMN public.availability_slots.date_type IS 'Type of date: online (virtual), offline (in-person), or offline_event';


--
-- Name: availability_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.availability_slots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.availability_slots_id_seq OWNER TO devuser;

--
-- Name: availability_slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.availability_slots_id_seq OWNED BY public.availability_slots.id;


--
-- Name: curated_matches; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.curated_matches (
    id integer NOT NULL,
    user1_id integer NOT NULL,
    user2_id integer NOT NULL,
    compatibility_score numeric(5,2) NOT NULL,
    is_match boolean DEFAULT false NOT NULL,
    reasoning text,
    matched_aspects text[],
    mismatched_aspects text[],
    ai_provider character varying(50) DEFAULT 'gemini'::character varying NOT NULL,
    ai_model character varying(100),
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    created_by_admin integer,
    scheduled_date_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT check_different_users_curated CHECK ((user1_id <> user2_id))
);


ALTER TABLE public.curated_matches OWNER TO devuser;

--
-- Name: curated_matches_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.curated_matches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.curated_matches_id_seq OWNER TO devuser;

--
-- Name: curated_matches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.curated_matches_id_seq OWNED BY public.curated_matches.id;


--
-- Name: date_activity_log; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.date_activity_log (
    id integer NOT NULL,
    date_id integer NOT NULL,
    admin_id integer,
    action character varying(50) NOT NULL,
    old_value text,
    new_value text,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.date_activity_log OWNER TO devuser;

--
-- Name: date_activity_log_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.date_activity_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.date_activity_log_id_seq OWNER TO devuser;

--
-- Name: date_activity_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.date_activity_log_id_seq OWNED BY public.date_activity_log.id;


--
-- Name: date_rejections; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.date_rejections (
    id integer NOT NULL,
    user_id integer NOT NULL,
    rejected_user_id integer NOT NULL,
    suggestion_id integer,
    scheduled_date_id integer,
    reasons public.rejection_reason_type[] NOT NULL,
    custom_reason text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT check_different_users_rejection CHECK ((user_id <> rejected_user_id)),
    CONSTRAINT check_rejection_source CHECK ((((suggestion_id IS NOT NULL) AND (scheduled_date_id IS NULL)) OR ((suggestion_id IS NULL) AND (scheduled_date_id IS NOT NULL))))
);


ALTER TABLE public.date_rejections OWNER TO devuser;

--
-- Name: date_rejections_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.date_rejections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.date_rejections_id_seq OWNER TO devuser;

--
-- Name: date_rejections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.date_rejections_id_seq OWNED BY public.date_rejections.id;


--
-- Name: date_suggestions; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.date_suggestions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    suggested_user_id integer NOT NULL,
    curated_match_id integer,
    compatibility_score numeric(5,2) NOT NULL,
    reasoning text,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    scheduled_date_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    responded_at timestamp without time zone,
    CONSTRAINT check_different_users_suggestion CHECK ((user_id <> suggested_user_id))
);


ALTER TABLE public.date_suggestions OWNER TO devuser;

--
-- Name: date_suggestions_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.date_suggestions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.date_suggestions_id_seq OWNER TO devuser;

--
-- Name: date_suggestions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.date_suggestions_id_seq OWNED BY public.date_suggestions.id;


--
-- Name: devices; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.devices (
    id integer NOT NULL,
    user_id integer,
    device_id character varying(255) NOT NULL,
    device_name character varying(255),
    platform character varying(50),
    os_version character varying(50),
    app_version character varying(50),
    browser character varying(100),
    push_token text,
    is_trusted boolean DEFAULT false,
    login_count integer DEFAULT 1,
    last_ip_address character varying(50),
    last_location jsonb,
    last_active_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.devices OWNER TO devuser;

--
-- Name: devices_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.devices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.devices_id_seq OWNER TO devuser;

--
-- Name: devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.devices_id_seq OWNED BY public.devices.id;


--
-- Name: partner_preferences; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.partner_preferences (
    id integer NOT NULL,
    user_id integer,
    looking_for_gender jsonb DEFAULT '[]'::jsonb,
    age_range_min integer DEFAULT 18,
    age_range_max integer DEFAULT 99,
    distance_preference integer DEFAULT 50,
    height_range_min integer,
    height_range_max integer,
    relationship_goals jsonb DEFAULT '[]'::jsonb,
    education_levels jsonb DEFAULT '[]'::jsonb,
    occupations jsonb DEFAULT '[]'::jsonb,
    religions jsonb DEFAULT '[]'::jsonb,
    children_preferences jsonb DEFAULT '[]'::jsonb,
    drinking_preferences jsonb DEFAULT '[]'::jsonb,
    smoking_preferences jsonb DEFAULT '[]'::jsonb,
    dietary_preferences jsonb DEFAULT '[]'::jsonb,
    pet_preferences jsonb DEFAULT '[]'::jsonb,
    verified_only boolean DEFAULT false,
    dealbreakers jsonb DEFAULT '[]'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    religion_importance integer DEFAULT 0,
    workout_preferences jsonb DEFAULT '[]'::jsonb,
    personality_types jsonb DEFAULT '[]'::jsonb,
    communication_styles jsonb DEFAULT '[]'::jsonb,
    love_languages jsonb DEFAULT '[]'::jsonb,
    political_views jsonb DEFAULT '[]'::jsonb,
    sleep_schedules jsonb DEFAULT '[]'::jsonb,
    caste_preferences jsonb DEFAULT '[]'::jsonb,
    sub_caste_preferences jsonb DEFAULT '[]'::jsonb,
    gotra_preferences jsonb DEFAULT '[]'::jsonb,
    manglik_preference integer DEFAULT 0,
    mother_tongue_preferences jsonb DEFAULT '[]'::jsonb,
    ethnicity_preferences jsonb DEFAULT '[]'::jsonb,
    nationality_preferences jsonb DEFAULT '[]'::jsonb,
    nri_preference integer DEFAULT 0,
    horoscope_matching_required boolean DEFAULT false,
    relocation_expectation integer DEFAULT 0,
    body_type_preferences jsonb DEFAULT '[]'::jsonb,
    complexion_preferences jsonb DEFAULT '[]'::jsonb,
    hair_color_preferences jsonb DEFAULT '[]'::jsonb,
    eye_color_preferences jsonb DEFAULT '[]'::jsonb,
    facial_hair_preferences jsonb DEFAULT '[]'::jsonb,
    tattoo_preference integer DEFAULT 0,
    piercing_preference integer DEFAULT 0,
    disability_acceptance integer DEFAULT 0,
    income_preferences jsonb DEFAULT '[]'::jsonb,
    employment_preferences jsonb DEFAULT '[]'::jsonb,
    industry_preferences jsonb DEFAULT '[]'::jsonb,
    min_years_experience integer DEFAULT 0,
    property_preference integer DEFAULT 0,
    vehicle_preference integer DEFAULT 0,
    financial_expectation integer DEFAULT 0,
    family_type_preferences jsonb DEFAULT '[]'::jsonb,
    family_values_preferences jsonb DEFAULT '[]'::jsonb,
    living_situation_preferences jsonb DEFAULT '[]'::jsonb,
    family_affluence_preferences jsonb DEFAULT '[]'::jsonb,
    family_location_preferences jsonb DEFAULT '[]'::jsonb,
    max_siblings integer DEFAULT 0,
    language_preferences jsonb DEFAULT '[]'::jsonb,
    min_language_proficiency integer DEFAULT 0,
    location_preferences jsonb DEFAULT '[]'::jsonb,
    open_to_long_distance boolean DEFAULT false,
    interest_preferences jsonb DEFAULT '[]'::jsonb,
    min_shared_interests integer DEFAULT 0,
    max_days_inactive integer DEFAULT 30,
    photos_required boolean DEFAULT false,
    min_profile_completion integer DEFAULT 0,
    deal_breakers jsonb DEFAULT '[]'::jsonb,
    must_haves jsonb DEFAULT '[]'::jsonb,
    custom_dealbreakers jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.partner_preferences OWNER TO devuser;

--
-- Name: partner_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.partner_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.partner_preferences_id_seq OWNER TO devuser;

--
-- Name: partner_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.partner_preferences_id_seq OWNED BY public.partner_preferences.id;


--
-- Name: scheduled_dates; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.scheduled_dates (
    id integer NOT NULL,
    user1_id integer NOT NULL,
    user2_id integer NOT NULL,
    genie_id integer,
    scheduled_time timestamp without time zone NOT NULL,
    duration_minutes integer DEFAULT 60 NOT NULL,
    status public.date_status DEFAULT 'scheduled'::public.date_status NOT NULL,
    date_type character varying(50) DEFAULT 'online'::character varying NOT NULL,
    place_name character varying(255),
    address text,
    city character varying(100),
    state character varying(100),
    country character varying(100),
    zipcode character varying(20),
    latitude numeric(10,8),
    longitude numeric(11,8),
    notes text,
    admin_notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    confirmed_at timestamp without time zone,
    completed_at timestamp without time zone,
    cancelled_at timestamp without time zone,
    cancelled_by integer,
    cancellation_reason text,
    CONSTRAINT check_different_users CHECK ((user1_id <> user2_id))
);


ALTER TABLE public.scheduled_dates OWNER TO devuser;

--
-- Name: scheduled_dates_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.scheduled_dates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.scheduled_dates_id_seq OWNER TO devuser;

--
-- Name: scheduled_dates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.scheduled_dates_id_seq OWNED BY public.scheduled_dates.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id integer,
    data jsonb,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    device_id character varying(255),
    ip_address character varying(50),
    location jsonb,
    user_agent text,
    is_active boolean DEFAULT true,
    last_active_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sessions OWNER TO devuser;

--
-- Name: user_blocks; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.user_blocks (
    id integer NOT NULL,
    blocker_user_id integer NOT NULL,
    blocked_user_id integer NOT NULL,
    reason text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_not_self_block CHECK ((blocker_user_id <> blocked_user_id))
);


ALTER TABLE public.user_blocks OWNER TO devuser;

--
-- Name: user_blocks_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.user_blocks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_blocks_id_seq OWNER TO devuser;

--
-- Name: user_blocks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.user_blocks_id_seq OWNED BY public.user_blocks.id;


--
-- Name: user_photos; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.user_photos (
    id integer NOT NULL,
    user_id integer,
    photo_id character varying(255) NOT NULL,
    url text NOT NULL,
    thumbnail_url text,
    display_order integer DEFAULT 0,
    is_primary boolean DEFAULT false,
    caption text,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_photos OWNER TO devuser;

--
-- Name: user_photos_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.user_photos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_photos_id_seq OWNER TO devuser;

--
-- Name: user_photos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.user_photos_id_seq OWNED BY public.user_photos.id;


--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.user_preferences (
    id integer NOT NULL,
    user_id integer NOT NULL,
    push_enabled boolean DEFAULT true,
    email_enabled boolean DEFAULT true,
    sms_enabled boolean DEFAULT false,
    notify_matches boolean DEFAULT true,
    notify_messages boolean DEFAULT true,
    notify_likes boolean DEFAULT true,
    notify_super_likes boolean DEFAULT true,
    notify_profile_views boolean DEFAULT false,
    public_profile boolean DEFAULT true,
    show_online_status boolean DEFAULT true,
    show_distance boolean DEFAULT true,
    show_age boolean DEFAULT true,
    allow_search_engines boolean DEFAULT false,
    incognito_mode boolean DEFAULT false,
    read_receipts boolean DEFAULT true,
    discoverable boolean DEFAULT true,
    global_mode boolean DEFAULT false,
    verified_only boolean DEFAULT false,
    distance_radius integer DEFAULT 50,
    recently_active_days integer DEFAULT 7,
    app_language character varying(10) DEFAULT 'en'::character varying,
    theme character varying(20) DEFAULT 'light'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_preferences OWNER TO devuser;

--
-- Name: user_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.user_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_preferences_id_seq OWNER TO devuser;

--
-- Name: user_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.user_preferences_id_seq OWNED BY public.user_preferences.id;


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.user_profiles (
    id integer NOT NULL,
    user_id integer,
    bio text,
    occupation jsonb DEFAULT '[]'::jsonb,
    company character varying(255),
    job_title character varying(255),
    education jsonb DEFAULT '[]'::jsonb,
    school character varying(255),
    height integer,
    location jsonb,
    hometown character varying(255),
    interests jsonb DEFAULT '[]'::jsonb,
    languages jsonb DEFAULT '[]'::jsonb,
    relationship_goals jsonb DEFAULT '[]'::jsonb,
    drinking character varying(50),
    smoking character varying(50),
    workout character varying(50),
    dietary_preference character varying(50),
    religion character varying(50),
    religion_importance character varying(50),
    political_view character varying(50),
    pets character varying(50),
    children character varying(50),
    personality_type character varying(20),
    communication_style character varying(50),
    love_language character varying(50),
    sleep_schedule character varying(50),
    prompts jsonb DEFAULT '[]'::jsonb,
    completion_percentage integer DEFAULT 0,
    is_public boolean DEFAULT true,
    is_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_profiles OWNER TO devuser;

--
-- Name: user_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.user_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_profiles_id_seq OWNER TO devuser;

--
-- Name: user_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.user_profiles_id_seq OWNED BY public.user_profiles.id;


--
-- Name: user_reports; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.user_reports (
    id integer NOT NULL,
    reporter_user_id integer NOT NULL,
    reported_user_id integer NOT NULL,
    report_id character varying(255) NOT NULL,
    reason character varying(50) NOT NULL,
    details text,
    evidence_urls jsonb DEFAULT '[]'::jsonb,
    status character varying(50) DEFAULT 'PENDING'::character varying,
    reviewed_by integer,
    reviewed_at timestamp without time zone,
    resolution_notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_not_self_report CHECK ((reporter_user_id <> reported_user_id)),
    CONSTRAINT check_report_reason CHECK (((reason)::text = ANY ((ARRAY['SPAM'::character varying, 'INAPPROPRIATE_CONTENT'::character varying, 'FAKE_PROFILE'::character varying, 'HARASSMENT'::character varying, 'SCAM'::character varying, 'UNDERAGE'::character varying, 'STOLEN_PHOTOS'::character varying, 'HATE_SPEECH'::character varying, 'VIOLENCE'::character varying, 'OTHER'::character varying])::text[]))),
    CONSTRAINT check_report_status CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'REVIEWED'::character varying, 'RESOLVED'::character varying, 'DISMISSED'::character varying])::text[])))
);


ALTER TABLE public.user_reports OWNER TO devuser;

--
-- Name: user_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.user_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_reports_id_seq OWNER TO devuser;

--
-- Name: user_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.user_reports_id_seq OWNED BY public.user_reports.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    password_hash character varying(255),
    phone_number character varying(20),
    email_verified boolean DEFAULT false,
    phone_verified boolean DEFAULT false,
    account_status character varying(50) DEFAULT 'PENDING'::character varying,
    verification_token character varying(255),
    verification_token_expires_at timestamp without time zone,
    password_reset_token character varying(255),
    password_reset_token_expires_at timestamp without time zone,
    last_login_at timestamp without time zone,
    photo_url text,
    date_of_birth date,
    gender character varying(50),
    CONSTRAINT check_account_status CHECK (((account_status)::text = ANY ((ARRAY['PENDING'::character varying, 'ACTIVE'::character varying, 'SUSPENDED'::character varying, 'BANNED'::character varying, 'DELETED'::character varying])::text[]))),
    CONSTRAINT check_email_format CHECK (((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text))
);


ALTER TABLE public.users OWNER TO devuser;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO devuser;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: verification_codes; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.verification_codes (
    id integer NOT NULL,
    user_id integer,
    code character varying(10) NOT NULL,
    type character varying(50) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.verification_codes OWNER TO devuser;

--
-- Name: verification_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.verification_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.verification_codes_id_seq OWNER TO devuser;

--
-- Name: verification_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.verification_codes_id_seq OWNED BY public.verification_codes.id;


--
-- Name: admin_sessions id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.admin_sessions ALTER COLUMN id SET DEFAULT nextval('public.admin_sessions_id_seq'::regclass);


--
-- Name: admin_users id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.admin_users ALTER COLUMN id SET DEFAULT nextval('public.admin_users_id_seq'::regclass);


--
-- Name: availability_slots id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.availability_slots ALTER COLUMN id SET DEFAULT nextval('public.availability_slots_id_seq'::regclass);


--
-- Name: curated_matches id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.curated_matches ALTER COLUMN id SET DEFAULT nextval('public.curated_matches_id_seq'::regclass);


--
-- Name: date_activity_log id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.date_activity_log ALTER COLUMN id SET DEFAULT nextval('public.date_activity_log_id_seq'::regclass);


--
-- Name: date_rejections id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.date_rejections ALTER COLUMN id SET DEFAULT nextval('public.date_rejections_id_seq'::regclass);


--
-- Name: date_suggestions id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.date_suggestions ALTER COLUMN id SET DEFAULT nextval('public.date_suggestions_id_seq'::regclass);


--
-- Name: devices id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.devices ALTER COLUMN id SET DEFAULT nextval('public.devices_id_seq'::regclass);


--
-- Name: partner_preferences id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.partner_preferences ALTER COLUMN id SET DEFAULT nextval('public.partner_preferences_id_seq'::regclass);


--
-- Name: scheduled_dates id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.scheduled_dates ALTER COLUMN id SET DEFAULT nextval('public.scheduled_dates_id_seq'::regclass);


--
-- Name: user_blocks id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.user_blocks ALTER COLUMN id SET DEFAULT nextval('public.user_blocks_id_seq'::regclass);


--
-- Name: user_photos id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.user_photos ALTER COLUMN id SET DEFAULT nextval('public.user_photos_id_seq'::regclass);


--
-- Name: user_preferences id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.user_preferences ALTER COLUMN id SET DEFAULT nextval('public.user_preferences_id_seq'::regclass);


--
-- Name: user_profiles id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.user_profiles ALTER COLUMN id SET DEFAULT nextval('public.user_profiles_id_seq'::regclass);


--
-- Name: user_reports id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.user_reports ALTER COLUMN id SET DEFAULT nextval('public.user_reports_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: verification_codes id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.verification_codes ALTER COLUMN id SET DEFAULT nextval('public.verification_codes_id_seq'::regclass);


--
-- Data for Name: admin_sessions; Type: TABLE DATA; Schema: public; Owner: devuser
--

COPY public.admin_sessions (id, admin_id, token_hash, ip_address, user_agent, expires_at, created_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: devuser
--

COPY public.admin_users (id, user_id, email, name, password_hash, role, is_genie, is_active, last_login_at, created_at, updated_at, created_by) FROM stdin;
2	\N	genie@datifyy.com	Date Genie	$2a$12$i2WwSQr28rSRUEPGS5gd7e6tzwuO1QVDqa66zqwCM9i5/FJefgG4.	genie	t	t	\N	2025-11-19 19:46:22.09501	2025-11-19 19:53:26.061771	\N
1	\N	admin@datifyy.com	Super Admin	$2a$12$i2WwSQr28rSRUEPGS5gd7e6tzwuO1QVDqa66zqwCM9i5/FJefgG4.	super_admin	t	t	2025-11-19 21:08:15.077625	2025-11-19 19:46:22.085273	2025-11-19 21:08:15.077625	\N
\.


--
-- Data for Name: availability_slots; Type: TABLE DATA; Schema: public; Owner: devuser
--

COPY public.availability_slots (id, user_id, start_time, end_time, date_type, place_name, address, city, state, country, zipcode, latitude, longitude, google_place_id, google_maps_url, notes, created_at, updated_at) FROM stdin;
61	51	1764073800	1764077400	online	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-23 10:55:58.602821+00	2025-11-23 10:55:58.602821+00
62	51	1764160200	1764163800	online	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-23 10:55:58.602821+00	2025-11-23 10:55:58.602821+00
63	51	1764246600	1764250200	online	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-23 10:55:58.602821+00	2025-11-23 10:55:58.602821+00
64	51	1764333000	1764336600	online	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-23 10:55:58.602821+00	2025-11-23 10:55:58.602821+00
65	51	1764419400	1764423000	online	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-23 10:55:58.602821+00	2025-11-23 10:55:58.602821+00
66	51	1764505800	1764509400	online	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-23 10:55:58.602821+00	2025-11-23 10:55:58.602821+00
67	51	1764592200	1764595800	online	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-23 10:55:58.602821+00	2025-11-23 10:55:58.602821+00
68	105	1764073800	1764077400	online	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-23 10:56:27.934923+00	2025-11-23 10:56:27.934923+00
69	105	1764160200	1764163800	online	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-23 10:56:27.934923+00	2025-11-23 10:56:27.934923+00
70	105	1764246600	1764250200	online	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-23 10:56:27.934923+00	2025-11-23 10:56:27.934923+00
71	106	1764073800	1764077400	online	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-23 10:56:43.529556+00	2025-11-23 10:56:43.529556+00
72	106	1764160200	1764163800	online	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-23 10:56:43.529556+00	2025-11-23 10:56:43.529556+00
73	106	1764246600	1764250200	online	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-23 10:56:43.529556+00	2025-11-23 10:56:43.529556+00
74	106	1764333000	1764336600	online	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-23 10:56:43.529556+00	2025-11-23 10:56:43.529556+00
76	52	1764007200	1764010800	online	\N	\N	Mumbai	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-23 12:24:09.857537+00	2025-11-23 12:24:09.857537+00
77	52	1764093600	1764097200	online	\N	\N	Mumbai	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-23 12:24:09.857537+00	2025-11-23 12:24:09.857537+00
78	52	1764180000	1764183600	online	\N	\N	Mumbai	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-23 12:24:09.857537+00	2025-11-23 12:24:09.857537+00
79	53	1764010800	1764014400	online	\N	\N	Delhi	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-23 12:24:09.857537+00	2025-11-23 12:24:09.857537+00
80	53	1764097200	1764100800	online	\N	\N	Delhi	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-23 12:24:09.857537+00	2025-11-23 12:24:09.857537+00
81	53	1764270000	1764273600	online	\N	\N	Delhi	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-23 12:24:09.857537+00	2025-11-23 12:24:09.857537+00
\.


--
-- Data for Name: curated_matches; Type: TABLE DATA; Schema: public; Owner: devuser
--

COPY public.curated_matches (id, user1_id, user2_id, compatibility_score, is_match, reasoning, matched_aspects, mismatched_aspects, ai_provider, ai_model, status, created_by_admin, scheduled_date_id, created_at, updated_at) FROM stdin;
10	105	106	75.00	t	Sarah and Michael demonstrate strong compatibility across several key areas. They perfectly align on age preferences, with both individuals falling squarely within each other's desired age ranges. Their gender preferences are also a perfect match. Lifestyle compatibility, specifically regarding drinking habits, is excellent as both state 'Socially' and prefer a partner with the same habit. A significant positive is their shared interest in 'travel,' providing a strong common ground for joint activities and experiences. While their education levels differ (Masters vs. Bachelors), neither has an explicit preference, preventing this from being a mismatch. Similarly, their primary occupations and some interests (photography, yoga for Sarah; coding, fitness for Michael) diverge, but these can be seen as opportunities for new shared experiences or respected individual pursuits rather than incompatibilities. The lack of location information prevents an assessment in that area. Overall, the mutual fulfillment of core preferences, especially age, gender, and lifestyle, along with a shared prominent interest, points to a high potential for a successful romantic match.	{"Age Compatibility","Gender Preference Match","Shared Interest: Travel","Lifestyle Compatibility (Drinking Socially)","Mutual Fulfillment of Age Preference","Mutual Fulfillment of Gender Preference","Mutual Fulfillment of Lifestyle Preference"}	{"Differing Primary Interests (e.g., photography/yoga vs. coding/fitness)","Differing Education Levels (no stated preference, but not identical)","Location (No information provided)"}	Gemini	gemini-1.5-flash	pending	1	\N	2025-11-23 11:03:54.814531	2025-11-23 11:03:54.814531
12	105	51	10.00	f	The compatibility between Sarah Anderson and RahulRana is extremely low, primarily due to a critical discrepancy in RahulRana's profile and a significant age preference mismatch from his side.\n\n**Critical Profile Discrepancy:** RahulRana's structured profile lists his age as 30, but his bio explicitly states: 'My name is Alex Chen, and I'm a 14-year-old...'. This contradiction raises serious concerns about the authenticity or accuracy of the profile, making any romantic match highly problematic.\n\n**Age Compatibility:** While Sarah (30) falls perfectly within her preferred age range (25-35) for a partner like Rahul (30), Rahul's age preference (34-40) is not met by Sarah (30). This indicates a significant barrier from Rahul's perspective, as he is seeking an older partner.\n\n**Gender Preference:** Both users' gender preferences align. Sarah prefers males, and Rahul is male. Rahul's preference (interpreted as female) is met by Sarah, who is female. This is the strongest point of mutual alignment.\n\n**Shared Interests and Hobbies:** Sarah lists 'travel, photography, yoga' as interests. Rahul's interests field is empty. If the bio's mention of 'robotics' and 'soccer' were to be considered (despite the age contradiction), there would still be no explicit shared interests. This lack of common ground in hobbies is a negative factor.\n\n**Lifestyle Compatibility:** Both Sarah and Rahul state their drinking lifestyle as 'Socially' or 'DRINKING_SOCIALLY', which is a perfect match. Sarah's preference for a socially drinking partner is also met.\n\n**Location & Education:** No information is provided for location or education for Rahul, preventing assessment in these areas.\n\n**Mutual Attraction Potential:** Sarah might find Rahul's profile appealing based on his age, gender, and lifestyle matching her preferences. However, Rahul is highly unlikely to find Sarah appealing, as her age falls outside his stated preference. Furthermore, the significant profile discrepancy severely undermines any potential for mutual attraction or trust.	{"User 1's Age Preference (25-35) is met by User 2 (30)","User 1's Gender Preference (MALE) is met by User 2 (MALE)","User 2's Gender Preference (FEMALE) is met by User 1 (FEMALE)","Shared Lifestyle: Social Drinking","User 1's Lifestyle Preference (Socially) is met by User 2 (Socially)"}	{"User 2's Age Preference (34-40) is NOT met by User 1 (30)","Lack of Explicit Shared Interests","User 2 Profile Discrepancy (Age 30 vs. Bio stating 14-year-old Alex Chen)","Unknown Location Compatibility","Unknown Education Compatibility"}	Gemini	gemini-1.5-flash	rejected	1	\N	2025-11-23 11:09:21.091167	2025-11-23 16:41:06.715975
11	106	51	0.00	f	The compatibility between Michael Chen and User 2 (identified as RahulRana but self-described as Alex Chen, 14 years old) is extremely low, rendering a romantic match inappropriate and non-existent. The most critical factor is the severe age disparity: Michael is 33, while Alex is 14. This age gap makes a romantic relationship ethically problematic, and in many jurisdictions, illegal. Michael's age preference (23-33) does not include Alex's age (14), and Alex's stated preference (34-40) does not include Michael's age (33), indicating a mutual lack of age compatibility. Furthermore, Michael's gender preference is 'FEMALE', while Alex is 'MALE', a direct mismatch. Although some superficial commonalities exist in interests (Michael's 'coding' and Alex's 'robotics/programming'; Michael's 'fitness' and Alex's 'soccer'), and 'Drinking: Socially' is listed for both, the latter is a highly problematic and inconsistent data point for a 14-year-old and cannot be considered a genuine lifestyle match. The vast difference in life stages (adult vs. minor) and fundamental preferences completely override any minor shared interests.	{"Interests (conceptual overlap in tech/programming and physical activity)","Lifestyle (Drinking: Socially - based on provided data, but inconsistent with User 2's age)"}	{"Age compatibility (severe mismatch, Michael 33 vs. Alex 14)","Gender preference match (Michael prefers FEMALE, Alex is MALE)","Life stage (adult vs. minor)","Mutual attraction potential (non-existent due to age and gender mismatches)","Ethical and legal considerations (romantic relationship between 33 and 14 is inappropriate)"}	Gemini	gemini-1.5-flash	review_later	1	\N	2025-11-23 11:04:20.48204	2025-11-23 16:41:11.975032
13	3	105	85.00	t	John and Sarah demonstrate high compatibility across several critical factors, indicating strong potential for a romantic match. Their ages align perfectly, with both being 30 and falling precisely within each other's preferred age ranges (John: 24-32; Sarah: 25-35). Gender preferences are also a direct match, with John being male and seeking a female partner, and Sarah being female and seeking a male partner. Furthermore, their lifestyles regarding alcohol consumption are identical, both stating 'Socially,' which suggests shared social habits and expectations. A significant area of common ground lies in their shared passion for exploration and travel; John's bio mentions loving to 'explore the world,' and Sarah expresses a love for 'traveling.' This shared interest provides a robust foundation for joint activities and experiences, with other interests like John's 'hiking' and Sarah's 'photography' potentially complementing each other on adventures.\n\nThe primary uncertainty, and a crucial factor for any romantic connection, is location proximity. John is located in San Francisco, but Sarah's location is not specified in her profile. While neither user explicitly stated a location preference, the absence of Sarah's location means their geographical compatibility remains unconfirmed. If Sarah is not within a reasonable distance of San Francisco, this would present a significant logistical challenge to forming a relationship. Education levels are neutral as John's education is unspecified, and neither stated a preference. Despite the geographical unknown, the strong alignment in fundamental preferences and shared core interests suggests a very promising match.	{"Age Compatibility","Gender Preference Match","Lifestyle (Drinking) Compatibility","Shared Interest in Travel/Exploration","Mutual Alignment with Partner Preferences"}	{"Unconfirmed Location Proximity"}	Gemini	gemini-1.5-flash	scheduled	1	1	2025-11-23 16:33:35.632717	2025-11-23 16:55:58.104315
\.


--
-- Data for Name: date_activity_log; Type: TABLE DATA; Schema: public; Owner: devuser
--

COPY public.date_activity_log (id, date_id, admin_id, action, old_value, new_value, notes, created_at) FROM stdin;
\.


--
-- Data for Name: date_rejections; Type: TABLE DATA; Schema: public; Owner: devuser
--

COPY public.date_rejections (id, user_id, rejected_user_id, suggestion_id, scheduled_date_id, reasons, custom_reason, created_at) FROM stdin;
\.


--
-- Data for Name: date_suggestions; Type: TABLE DATA; Schema: public; Owner: devuser
--

COPY public.date_suggestions (id, user_id, suggested_user_id, curated_match_id, compatibility_score, reasoning, status, scheduled_date_id, created_at, updated_at, responded_at) FROM stdin;
1	3	105	13	85.00	John and Sarah demonstrate high compatibility across several critical factors, indicating strong potential for a romantic match. Their ages align perfectly, with both being 30 and falling precisely within each other's preferred age ranges (John: 24-32; Sarah: 25-35). Gender preferences are also a direct match, with John being male and seeking a female partner, and Sarah being female and seeking a male partner. Furthermore, their lifestyles regarding alcohol consumption are identical, both stating 'Socially,' which suggests shared social habits and expectations. A significant area of common ground lies in their shared passion for exploration and travel; John's bio mentions loving to 'explore the world,' and Sarah expresses a love for 'traveling.' This shared interest provides a robust foundation for joint activities and experiences, with other interests like John's 'hiking' and Sarah's 'photography' potentially complementing each other on adventures.\n\nThe primary uncertainty, and a crucial factor for any romantic connection, is location proximity. John is located in San Francisco, but Sarah's location is not specified in her profile. While neither user explicitly stated a location preference, the absence of Sarah's location means their geographical compatibility remains unconfirmed. If Sarah is not within a reasonable distance of San Francisco, this would present a significant logistical challenge to forming a relationship. Education levels are neutral as John's education is unspecified, and neither stated a preference. Despite the geographical unknown, the strong alignment in fundamental preferences and shared core interests suggests a very promising match.	accepted	\N	2025-11-23 16:50:58.769011	2025-11-23 16:51:22.869271	2025-11-23 16:51:22.867483
2	105	3	13	85.00	John and Sarah demonstrate high compatibility across several critical factors, indicating strong potential for a romantic match. Their ages align perfectly, with both being 30 and falling precisely within each other's preferred age ranges (John: 24-32; Sarah: 25-35). Gender preferences are also a direct match, with John being male and seeking a female partner, and Sarah being female and seeking a male partner. Furthermore, their lifestyles regarding alcohol consumption are identical, both stating 'Socially,' which suggests shared social habits and expectations. A significant area of common ground lies in their shared passion for exploration and travel; John's bio mentions loving to 'explore the world,' and Sarah expresses a love for 'traveling.' This shared interest provides a robust foundation for joint activities and experiences, with other interests like John's 'hiking' and Sarah's 'photography' potentially complementing each other on adventures.\n\nThe primary uncertainty, and a crucial factor for any romantic connection, is location proximity. John is located in San Francisco, but Sarah's location is not specified in her profile. While neither user explicitly stated a location preference, the absence of Sarah's location means their geographical compatibility remains unconfirmed. If Sarah is not within a reasonable distance of San Francisco, this would present a significant logistical challenge to forming a relationship. Education levels are neutral as John's education is unspecified, and neither stated a preference. Despite the geographical unknown, the strong alignment in fundamental preferences and shared core interests suggests a very promising match.	accepted	\N	2025-11-23 16:50:58.774202	2025-11-23 16:51:32.652832	2025-11-23 16:51:32.652688
\.


--
-- Data for Name: devices; Type: TABLE DATA; Schema: public; Owner: devuser
--

COPY public.devices (id, user_id, device_id, device_name, platform, os_version, app_version, browser, push_token, is_trusted, login_count, last_ip_address, last_location, last_active_at, created_at) FROM stdin;
\.


--
-- Data for Name: partner_preferences; Type: TABLE DATA; Schema: public; Owner: devuser
--

COPY public.partner_preferences (id, user_id, looking_for_gender, age_range_min, age_range_max, distance_preference, height_range_min, height_range_max, relationship_goals, education_levels, occupations, religions, children_preferences, drinking_preferences, smoking_preferences, dietary_preferences, pet_preferences, verified_only, dealbreakers, created_at, updated_at, religion_importance, workout_preferences, personality_types, communication_styles, love_languages, political_views, sleep_schedules, caste_preferences, sub_caste_preferences, gotra_preferences, manglik_preference, mother_tongue_preferences, ethnicity_preferences, nationality_preferences, nri_preference, horoscope_matching_required, relocation_expectation, body_type_preferences, complexion_preferences, hair_color_preferences, eye_color_preferences, facial_hair_preferences, tattoo_preference, piercing_preference, disability_acceptance, income_preferences, employment_preferences, industry_preferences, min_years_experience, property_preference, vehicle_preference, financial_expectation, family_type_preferences, family_values_preferences, living_situation_preferences, family_affluence_preferences, family_location_preferences, max_siblings, language_preferences, min_language_proficiency, location_preferences, open_to_long_distance, interest_preferences, min_shared_interests, max_days_inactive, photos_required, min_profile_completion, deal_breakers, must_haves, custom_dealbreakers) FROM stdin;
1	3	["FEMALE"]	24	32	50	\N	\N	[1, 2]	[]	[]	[]	[]	[]	[]	[]	[]	f	[]	2025-11-11 18:59:01.825387	2025-11-23 16:32:16.928346	0	[]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	[]	0	30	f	0	[]	[]	[]
2	4	["MALE"]	26	35	40	\N	\N	[1]	[]	[]	[]	[]	[]	[]	[]	[]	t	[]	2025-11-11 18:59:01.825387	2025-11-23 16:32:16.928346	0	[]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	[]	0	30	f	0	[]	[]	[]
3	5	["FEMALE"]	26	34	30	\N	\N	[2]	[]	[]	[]	[]	[]	[]	[]	[]	f	[]	2025-11-11 18:59:01.825387	2025-11-23 16:32:16.928346	0	[]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	[]	0	30	f	0	[]	[]	[]
4	6	["MALE"]	27	38	25	\N	\N	[1, 6]	[]	[]	[]	[]	[]	[]	[]	[]	f	[]	2025-11-11 18:59:01.825387	2025-11-23 16:32:16.928346	0	[]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	[]	0	30	f	0	[]	[]	[]
5	7	["FEMALE"]	28	36	100	\N	\N	[1, 2]	[]	[]	[]	[]	[]	[]	[]	[]	f	[]	2025-11-11 18:59:01.825387	2025-11-23 16:32:16.928346	0	[]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	[]	0	30	f	0	[]	[]	[]
10	18	[]	18	99	50	\N	\N	[]	[]	[]	[]	[]	[]	[]	[]	[]	f	[]	2025-11-11 19:20:40.613116	2025-11-23 16:32:16.928346	0	[]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	[]	0	30	f	0	[]	[]	[]
11	19	[]	18	99	50	\N	\N	[]	[]	[]	[]	[]	[]	[]	[]	[]	f	[]	2025-11-11 19:23:23.608449	2025-11-23 16:32:16.928346	0	[]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	[]	0	30	f	0	[]	[]	[]
12	20	[]	18	99	50	\N	\N	[]	[]	[]	[]	[]	[]	[]	[]	[]	f	[]	2025-11-11 19:31:06.748943	2025-11-23 16:32:16.928346	0	[]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	[]	0	30	f	0	[]	[]	[]
13	21	[]	18	99	50	\N	\N	[]	[]	[]	[]	[]	[]	[]	[]	[]	f	[]	2025-11-11 19:37:20.508621	2025-11-23 16:32:16.928346	0	[]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	[]	0	30	f	0	[]	[]	[]
18	26	[]	18	99	50	\N	\N	[]	[]	[]	[]	[]	[]	[]	[]	[]	f	[]	2025-11-12 15:53:31.050255	2025-11-23 16:32:16.928346	0	[]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	[]	0	30	f	0	[]	[]	[]
112	106	["FEMALE"]	23	33	50	\N	\N	[]	[]	[]	[]	[]	["Socially", "Never"]	["Never"]	[]	[]	f	[]	2025-11-23 10:56:43.525489	2025-11-23 16:32:16.928346	0	["Regularly", "Sometimes"]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	[]	0	30	f	0	[]	[]	[]
43	52	["MALE"]	18	99	50	\N	\N	[]	[]	[]	[]	[]	[]	[]	[]	[]	f	[]	2025-11-12 19:31:37.343523	2025-11-23 16:32:16.928346	0	[]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	[]	0	30	f	0	[]	[]	[]
44	53	["MALE"]	25	35	100	160	180	[]	[]	[]	[]	[]	[]	[]	[]	[]	t	[]	2025-11-16 14:44:04.496154	2025-11-23 16:32:16.928346	0	[]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	[]	0	30	f	0	[]	[]	[]
35	43	[]	21	35	50	\N	\N	[]	[]	[]	[]	[]	[]	[]	[]	[]	f	[]	2025-11-12 17:49:53.903383	2025-11-23 16:32:16.928346	0	[]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	[]	0	30	f	0	[]	[]	[]
36	45	[]	21	35	50	\N	\N	[]	[]	[]	[]	[]	[]	[]	[]	[]	f	[]	2025-11-12 17:49:53.963333	2025-11-23 16:32:16.928346	0	[]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	[]	0	30	f	0	[]	[]	[]
37	46	[]	21	35	50	\N	\N	[]	[]	[]	[]	[]	[]	[]	[]	[]	f	[]	2025-11-12 17:49:53.965887	2025-11-23 16:32:16.928346	0	[]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	[]	0	30	f	0	[]	[]	[]
38	47	[]	21	35	50	\N	\N	[]	[]	[]	[]	[]	[]	[]	[]	[]	f	[]	2025-11-12 17:49:53.99544	2025-11-23 16:32:16.928346	0	[]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	[]	0	30	f	0	[]	[]	[]
39	48	[]	21	35	50	\N	\N	[]	[]	[]	[]	[]	[]	[]	[]	[]	f	[]	2025-11-12 17:49:54.012948	2025-11-23 16:32:16.928346	0	[]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	[]	0	30	f	0	[]	[]	[]
40	49	[]	25	40	100	\N	\N	[]	[]	[]	[]	[]	[]	[]	[]	[]	t	[]	2025-11-12 17:49:54.034709	2025-11-23 16:32:16.928346	0	[]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	[]	0	30	f	0	[]	[]	[]
41	50	[]	21	35	50	\N	\N	[]	[]	[]	[]	[]	[]	[]	[]	[]	f	[]	2025-11-12 17:49:54.055101	2025-11-23 16:32:16.928346	0	[]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	[]	0	30	f	0	[]	[]	[]
45	1	["FEMALE"]	25	35	50	160	180	[]	[]	[]	[]	[]	[]	[]	[]	[]	t	[]	2025-11-16 19:29:33.466842	2025-11-23 16:32:16.928346	0	[]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	[]	0	30	f	0	[]	[]	[]
46	54	["MALE", "FEMALE"]	25	35	100	160	185	[]	[]	[]	[]	[]	[]	[]	[]	[]	t	[]	2025-11-19 12:51:24.647585	2025-11-23 16:32:16.928346	2	[1, 2]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[1, 2]	[]	[]	[]	[]	2	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	3	[]	0	[]	t	[]	5	14	t	80	[]	[]	[]
49	55	["MALE", "FEMALE"]	25	35	100	160	185	[1, 2]	[3, 4, 5]	[]	[1]	[1, 2]	[1, 2]	[1]	[1]	[1, 2]	t	[]	2025-11-19 16:12:56.571653	2025-11-23 16:32:16.928346	2	[1, 2, 3]	["INTJ", "ENFP"]	[1]	[2, 3]	[2]	[1, 2]	[]	[]	[]	0	[]	[]	[]	0	f	0	[1, 2, 3]	[]	[]	[]	[]	2	2	1	[2, 3, 4]	[1]	[]	0	0	0	2	[1]	[1]	[1, 2]	[]	[]	3	[1]	2	[]	t	[]	5	14	t	80	[]	[]	[]
53	56	[]	18	99	50	\N	\N	[]	[]	[]	[]	[]	[]	[]	[]	[]	f	[]	2025-11-19 16:22:33.765485	2025-11-23 16:32:16.928346	0	[]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	[]	0	30	f	0	[]	[]	[]
96	90	["MALE", "FEMALE"]	23	33	50	\N	\N	[]	["Bachelor's", "Master's"]	[]	[]	[]	["Socially", "Never"]	["Never"]	[]	[]	f	[]	2025-11-23 09:41:37.377209	2025-11-23 16:32:16.928346	0	["Regularly", "Sometimes"]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	["coding", "technology", "outdoors"]	0	30	f	0	[]	[]	[]
97	91	["MALE", "FEMALE"]	25	35	50	\N	\N	[]	["Bachelor's", "Master's"]	[]	[]	[]	["Socially", "Never"]	["Never"]	[]	[]	f	[]	2025-11-23 09:41:37.382846	2025-11-23 16:32:16.928346	0	["Regularly", "Sometimes"]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	["coding", "technology", "outdoors"]	0	30	f	0	[]	[]	[]
98	92	["MALE", "FEMALE"]	20	30	50	\N	\N	[]	["Bachelor's", "Master's"]	[]	[]	[]	["Socially", "Never"]	["Never"]	[]	[]	f	[]	2025-11-23 09:41:37.388962	2025-11-23 16:32:16.928346	0	["Regularly", "Sometimes"]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	["coding", "technology", "outdoors"]	0	30	f	0	[]	[]	[]
111	105	["MALE"]	25	35	50	\N	\N	[]	[]	[]	[]	[]	["Socially", "Never"]	["Never"]	[]	[]	f	[]	2025-11-23 10:56:27.932348	2025-11-23 16:32:16.928346	0	["Regularly", "Sometimes"]	[]	[]	[]	[]	[]	[]	[]	[]	0	[]	[]	[]	0	f	0	[]	[]	[]	[]	[]	0	0	0	[]	[]	[]	0	0	0	0	[]	[]	[]	[]	[]	0	[]	0	[]	f	[]	0	30	f	0	[]	[]	[]
42	51	["FEMALE"]	34	40	123	160	199	[3, 2]	[2, 6]	[6, 2]	[1]	[2]	[1, 2]	[1]	[1]	[3, 2]	t	[]	2025-11-12 19:10:35.052756	2025-11-23 16:32:16.928346	2	[1]	[]	[3]	[1]	[2]	[1]	["jat"]	[]	[]	1	[]	[]	[]	0	t	1	[1, 2, 3]	[1]	[]	[5]	[]	2	2	1	[6]	[2]	["computer", "finance"]	34	1	1	2	[1]	[1]	[1]	[]	[]	3	[1]	2	[]	t	[2, 6]	2	14	t	80	[]	[]	[]
\.


--
-- Data for Name: scheduled_dates; Type: TABLE DATA; Schema: public; Owner: devuser
--

COPY public.scheduled_dates (id, user1_id, user2_id, genie_id, scheduled_time, duration_minutes, status, date_type, place_name, address, city, state, country, zipcode, latitude, longitude, notes, admin_notes, created_at, updated_at, confirmed_at, completed_at, cancelled_at, cancelled_by, cancellation_reason) FROM stdin;
1	3	105	1	2025-11-25 19:00:00	60	scheduled	online	\N	\N	\N	\N	\N	\N	\N	\N	Google Meet: https://meet.google.com/datifyy-1764097200-J\n\nCalendar Info:\n📅 Date Details:\n• When: Tuesday, November 25, 2025 at 7:00 PM UTC\n• Duration: 60 minutes\n• End Time: 8:00 PM UTC\n• Participants: John Doe & Sarah Anderson\n• Location: https://meet.google.com/datifyy-1764097200-J\n\nThis is your Datifyy curated date! 💝\n	Scheduled by genie 1 from curated match 13	2025-11-23 16:55:58.097453	2025-11-23 16:55:58.097453	\N	\N	\N	\N	\N
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: devuser
--

COPY public.sessions (id, user_id, data, expires_at, created_at, device_id, ip_address, location, user_agent, is_active, last_active_at) FROM stdin;
sess_3_1762887542	3	\N	2025-11-18 18:59:01.842159	2025-11-11 18:59:01.842159	\N	\N	\N	\N	t	2025-11-11 18:59:01.842159
sess_4_1762887542	4	\N	2025-11-18 18:59:01.842159	2025-11-11 18:59:01.842159	\N	\N	\N	\N	t	2025-11-11 18:59:01.842159
sess_5_1762887542	5	\N	2025-11-18 18:59:01.842159	2025-11-11 18:59:01.842159	\N	\N	\N	\N	t	2025-11-11 18:59:01.842159
sess_6_1762887542	6	\N	2025-11-18 18:59:01.842159	2025-11-11 18:59:01.842159	\N	\N	\N	\N	t	2025-11-11 18:59:01.842159
sess_7_1762887542	7	\N	2025-11-18 18:59:01.842159	2025-11-11 18:59:01.842159	\N	\N	\N	\N	t	2025-11-11 18:59:01.842159
sess_18_1762888840	18	\N	2025-11-18 19:20:40.614519	2025-11-11 19:20:40.614841	\N	\N	\N	\N	t	2025-11-11 19:20:40.614841
sess_19_1762889003	19	\N	2025-11-18 19:23:23.609432	2025-11-11 19:23:23.609692	\N	\N	\N	\N	t	2025-11-11 19:23:23.609692
sess_20_1762889466	20	\N	2025-11-18 19:31:06.74961	2025-11-11 19:31:06.749825	\N	\N	\N	\N	t	2025-11-11 19:31:06.749825
sess_21_1762889840	21	\N	2025-11-18 19:37:20.509406	2025-11-11 19:37:20.509638	\N	\N	\N	\N	t	2025-11-11 19:37:20.509638
sess_26_1762962811	26	\N	2025-11-19 15:53:31.051678	2025-11-12 15:53:31.051943	\N	\N	\N	\N	t	2025-11-12 15:53:31.051943
sess_26_1762962828	26	\N	2025-11-19 15:53:48.153079	2025-11-12 15:53:48.153565	\N	\N	\N	\N	t	2025-11-12 15:53:48.153565
sess_26_1762962857	26	\N	2025-11-19 15:54:17.754064	2025-11-12 15:54:17.754683	\N	\N	\N	\N	t	2025-11-12 15:54:17.754683
sess_26_1762963391	26	\N	2025-11-19 16:03:11.165199	2025-11-12 16:03:11.16681	\N	\N	\N	\N	t	2025-11-12 16:03:40.505093
sess_51_1762974635	51	\N	2025-11-19 19:10:35.055741	2025-11-12 19:10:35.056517	\N	\N	\N	\N	f	2025-11-12 19:10:35.056517
sess_51_1762974661	51	\N	2025-11-19 19:11:01.761577	2025-11-12 19:11:01.762188	\N	\N	\N	\N	t	2025-11-12 19:11:01.762188
sess_51_1762975124	51	\N	2025-11-19 19:18:44.813634	2025-11-12 19:18:44.816102	\N	\N	\N	\N	t	2025-11-12 19:18:44.816102
sess_52_1762975897	52	\N	2025-11-19 19:31:37.345879	2025-11-12 19:31:37.346215	\N	\N	\N	\N	t	2025-11-12 19:31:37.346215
sess_52_1762975920	52	\N	2025-11-19 19:32:00.573746	2025-11-12 19:32:00.574408	\N	\N	\N	\N	t	2025-11-12 19:32:00.574408
sess_51_1763008583	51	\N	2025-11-20 04:36:23.365733	2025-11-13 04:36:23.369245	\N	\N	\N	\N	t	2025-11-13 04:36:23.369245
sess_51_1763048731	51	\N	2025-11-20 15:45:31.722381	2025-11-13 15:45:31.724987	\N	\N	\N	\N	t	2025-11-13 15:45:31.724987
sess_51_1763227077	51	\N	2025-11-22 17:17:57.980989	2025-11-15 17:17:57.982795	device_12345	\N	\N	\N	t	2025-11-15 17:17:57.982795
sess_51_1763227133	51	\N	2025-11-22 17:18:53.772113	2025-11-15 17:18:53.772585	device_12345	\N	\N	\N	f	2025-11-15 17:19:04.006643
sess_51_1763227848	51	\N	2025-11-22 17:30:48.978883	2025-11-15 17:30:48.979605	\N	\N	\N	\N	t	2025-11-15 17:30:48.979605
sess_51_1763227862	51	\N	2025-11-22 17:31:02.778464	2025-11-15 17:31:02.778798	\N	\N	\N	\N	t	2025-11-15 17:31:02.778798
sess_51_1763229011	51	\N	2025-11-22 17:50:11.030784	2025-11-15 17:50:11.031948	\N	\N	\N	\N	t	2025-11-15 17:50:11.031948
sess_51_1763267744	51	\N	2025-11-23 04:35:44.457129	2025-11-16 04:35:44.458282	\N	\N	\N	\N	t	2025-11-16 04:35:44.458282
sess_51_1763269414	51	\N	2025-11-23 05:03:34.063358	2025-11-16 05:03:34.064273	\N	\N	\N	\N	t	2025-11-16 05:03:34.064273
sess_51_1763269584	51	\N	2025-11-23 05:06:24.848168	2025-11-16 05:06:24.848646	\N	\N	\N	\N	t	2025-11-16 05:06:24.848646
sess_51_1763270692	51	\N	2025-11-23 05:24:52.333557	2025-11-16 05:24:52.334485	device_12345	\N	\N	\N	t	2025-11-16 05:24:52.334485
sess_53_1763304244	53	\N	2025-11-23 14:44:04.498622	2025-11-16 14:44:04.499257	\N	\N	\N	\N	t	2025-11-16 14:44:04.499257
sess_54_1763556684	54	\N	2025-11-26 12:51:24.655142	2025-11-19 12:51:24.656548	\N	\N	\N	\N	t	2025-11-19 12:51:24.656548
sess_51_1763563462	51	\N	2025-11-26 14:44:22.117783	2025-11-19 14:44:22.121388	device_12345	\N	\N	\N	t	2025-11-19 14:44:22.121388
sess_55_1763568776	55	\N	2025-11-26 16:12:56.574277	2025-11-19 16:12:56.574902	\N	\N	\N	\N	t	2025-11-19 16:12:56.574902
sess_56_1763569353	56	\N	2025-11-26 16:22:33.769539	2025-11-19 16:22:33.770025	\N	\N	\N	\N	t	2025-11-19 16:22:33.770025
\.


--
-- Data for Name: user_blocks; Type: TABLE DATA; Schema: public; Owner: devuser
--

COPY public.user_blocks (id, blocker_user_id, blocked_user_id, reason, created_at) FROM stdin;
\.


--
-- Data for Name: user_photos; Type: TABLE DATA; Schema: public; Owner: devuser
--

COPY public.user_photos (id, user_id, photo_id, url, thumbnail_url, display_order, is_primary, caption, uploaded_at) FROM stdin;
1	3	photo_1_1	https://i.pravatar.cc/600?img=12	https://i.pravatar.cc/150?img=12	1	t	\N	2025-11-11 18:59:01.825387
2	3	photo_1_2	https://i.pravatar.cc/600?img=13	https://i.pravatar.cc/150?img=13	2	f	\N	2025-11-11 18:59:01.825387
3	4	photo_2_1	https://i.pravatar.cc/600?img=5	https://i.pravatar.cc/150?img=5	1	t	\N	2025-11-11 18:59:01.825387
4	4	photo_2_2	https://i.pravatar.cc/600?img=6	https://i.pravatar.cc/150?img=6	2	f	\N	2025-11-11 18:59:01.825387
\.


--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: devuser
--

COPY public.user_preferences (id, user_id, push_enabled, email_enabled, sms_enabled, notify_matches, notify_messages, notify_likes, notify_super_likes, notify_profile_views, public_profile, show_online_status, show_distance, show_age, allow_search_engines, incognito_mode, read_receipts, discoverable, global_mode, verified_only, distance_radius, recently_active_days, app_language, theme, created_at, updated_at) FROM stdin;
1	43	t	t	f	t	t	t	t	f	t	t	t	t	f	f	t	t	f	f	50	7	en	light	2025-11-12 17:49:53.913072	2025-11-12 17:49:53.913072
2	50	f	t	f	f	f	f	f	f	f	f	f	f	f	t	f	t	f	f	50	7	es	dark	2025-11-12 17:49:54.056889	2025-11-12 17:49:54.057693
3	51	t	t	f	t	t	t	t	f	t	t	t	t	f	f	t	t	f	f	50	7	en	light	2025-11-16 06:06:17.932028	2025-11-16 06:06:17.932028
\.


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: devuser
--

COPY public.user_profiles (id, user_id, bio, occupation, company, job_title, education, school, height, location, hometown, interests, languages, relationship_goals, drinking, smoking, workout, dietary_preference, religion, religion_importance, political_view, pets, children, personality_type, communication_style, love_language, sleep_schedule, prompts, completion_percentage, is_public, is_verified, created_at, updated_at) FROM stdin;
1	3	Software engineer who loves hiking and trying new restaurants. Looking for someone to explore the world with!	[{"label": "Software Engineer", "category": 1}]	Tech Corp	\N	[{"label": "BS Computer Science", "level": 4}]	\N	180	{"city": "San Francisco", "country": "USA"}	\N	[{"label": "Hiking", "category": 14}, {"label": "Travel", "category": 1}, {"label": "Cooking", "category": 5}]	[{"code": 1, "label": "English", "proficiency": 4}]	[1, 2]	SOCIALLY	NEVER	OFTEN	ANYTHING	AGNOSTIC	\N	\N	DOG_LOVER	DONT_HAVE_WANT	\N	\N	\N	\N	[]	85	t	f	2025-11-11 18:59:01.825387	2025-11-11 18:59:01.825387
2	4	Creative soul with a passion for design and art. Coffee enthusiast and bookworm. Let's create something beautiful together!	[{"label": "Designer", "category": 19}]	Creative Studio	\N	[{"label": "MFA Design", "level": 5}]	\N	165	{"city": "New York", "country": "USA"}	\N	[{"label": "Art", "category": 10}, {"label": "Reading", "category": 8}, {"label": "Photography", "category": 2}]	[{"code": 1, "label": "English", "proficiency": 4}, {"code": 2, "label": "Spanish", "proficiency": 2}]	[1]	RARELY	NEVER	SOMETIMES	VEGETARIAN	SPIRITUAL	\N	\N	CAT_LOVER	OPEN_TO_CHILDREN	\N	\N	\N	\N	[]	90	t	f	2025-11-11 18:59:01.825387	2025-11-11 18:59:01.825387
3	5	Cardiologist who believes in living life to the fullest. Fitness enthusiast and foodie. Looking for my partner in crime!	[{"label": "Doctor", "category": 6}]	City Hospital	\N	[{"label": "MD Cardiology", "level": 8}]	\N	175	{"city": "Mumbai", "country": "India"}	\N	[{"label": "Fitness", "category": 6}, {"label": "Cooking", "category": 5}, {"label": "Travel", "category": 1}]	[{"code": 1, "label": "English", "proficiency": 4}, {"code": 12, "label": "Hindi", "proficiency": 4}]	[2]	SOCIALLY	NEVER	DAILY	ANYTHING	HINDU	\N	\N	NO_PETS	DONT_HAVE_WANT	\N	\N	\N	\N	[]	95	t	f	2025-11-11 18:59:01.825387	2025-11-11 18:59:01.825387
4	6	Marketing guru by day, adventure seeker by weekend. Love trying new cuisines and meeting new people!	[{"label": "Marketing Manager", "category": 34}]	Brand Agency	\N	[{"label": "MBA Marketing", "level": 6}]	\N	162	{"city": "Bangalore", "country": "India"}	\N	[{"label": "Travel", "category": 1}, {"label": "Yoga", "category": 7}, {"label": "Dancing", "category": 11}]	[{"code": 1, "label": "English", "proficiency": 4}, {"code": 12, "label": "Hindi", "proficiency": 3}, {"code": 17, "label": "Gujarati", "proficiency": 4}]	[1, 6]	SOCIALLY	NEVER	OFTEN	VEGETARIAN	HINDU	\N	\N	NO_PETS	NOT_SURE	\N	\N	\N	\N	[]	88	t	f	2025-11-11 18:59:01.825387	2025-11-11 18:59:01.825387
5	7	Startup founder passionate about building products that matter. Tech geek, travel junkie, and wine enthusiast.	[{"label": "Entrepreneur", "category": 14}]	Startup Inc	\N	[{"label": "MS Business", "level": 5}]	\N	178	{"city": "Singapore", "country": "Singapore"}	\N	[{"label": "Entrepreneurship", "category": 18}, {"label": "Travel", "category": 1}, {"label": "Wine Tasting", "category": 19}]	[{"code": 1, "label": "English", "proficiency": 4}, {"code": 8, "label": "Mandarin", "proficiency": 2}]	[1, 2]	REGULARLY	NEVER	SOMETIMES	ANYTHING	ATHEIST	\N	\N	WANT_SOMEDAY	OPEN_TO_CHILDREN	\N	\N	\N	\N	[]	92	t	f	2025-11-11 18:59:01.825387	2025-11-11 18:59:01.825387
10	18	\N	[]	\N	\N	[]	\N	\N	\N	\N	[]	[]	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	0	t	f	2025-11-11 19:20:40.610424	2025-11-11 19:20:40.610424
11	19	\N	[]	\N	\N	[]	\N	\N	\N	\N	[]	[]	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	0	t	f	2025-11-11 19:23:23.606215	2025-11-11 19:23:23.606215
12	20	\N	[]	\N	\N	[]	\N	\N	\N	\N	[]	[]	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	0	t	f	2025-11-11 19:31:06.746966	2025-11-11 19:31:06.746966
13	21	\N	[]	\N	\N	[]	\N	\N	\N	\N	[]	[]	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	0	t	f	2025-11-11 19:37:20.506932	2025-11-11 19:37:20.506932
94	105	Love traveling and photography	{"title": "Marketing Manager"}	\N	\N	{"level": "Masters"}	\N	\N	\N	\N	["travel", "photography", "yoga"]	[]	[]	Socially	Never	Regularly	Vegetarian	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	80	t	f	2025-11-23 10:56:27.923736	2025-11-23 10:56:27.923736
18	26	\N	[]	\N	\N	[]	\N	\N	\N	\N	[]	[]	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	0	t	f	2025-11-12 15:53:31.047855	2025-11-12 15:53:31.047855
35	43	\N	[]	\N	\N	[]	\N	\N	\N	\N	[]	[]	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	50	t	f	2025-11-12 17:49:53.898761	2025-11-12 17:49:53.898761
36	45	\N	[]	\N	\N	[]	\N	\N	\N	\N	[]	[]	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	50	t	f	2025-11-12 17:49:53.961603	2025-11-12 17:49:53.961603
37	46	\N	[]	\N	\N	[]	\N	\N	\N	\N	[]	[]	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	50	t	f	2025-11-12 17:49:53.965301	2025-11-12 17:49:53.965301
38	47	\N	[]	\N	\N	[]	\N	\N	\N	\N	[]	[]	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	50	t	f	2025-11-12 17:49:53.992814	2025-11-12 17:49:53.992814
39	48	\N	[]	\N	\N	[]	\N	\N	\N	\N	[]	[]	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	50	t	f	2025-11-12 17:49:54.01133	2025-11-12 17:49:54.01133
40	49	\N	[]	\N	\N	[]	\N	\N	\N	\N	[]	[]	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	50	t	f	2025-11-12 17:49:54.033511	2025-11-12 17:49:54.033511
41	50	\N	[]	\N	\N	[]	\N	\N	\N	\N	[]	[]	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	50	t	f	2025-11-12 17:49:54.053754	2025-11-12 17:49:54.053754
43	52	\N	[]	\N	\N	[]	\N	\N	\N	\N	[]	[]	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	0	t	f	2025-11-12 19:31:37.33922	2025-11-12 19:31:37.33922
44	53	\N	[]	\N	\N	[]	\N	\N	\N	\N	[]	[]	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	0	t	f	2025-11-16 14:44:04.490347	2025-11-16 14:44:04.490347
45	54	\N	[]	\N	\N	[]	\N	\N	\N	\N	[]	[]	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	0	t	f	2025-11-19 12:51:24.632152	2025-11-19 12:51:24.632152
46	55	\N	[]	\N	\N	[]	\N	\N	\N	\N	[]	[]	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	0	t	f	2025-11-19 16:12:56.565804	2025-11-19 16:12:56.565804
47	56	\N	[]	\N	\N	[]	\N	\N	\N	\N	[]	[]	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	0	t	f	2025-11-19 16:22:33.751008	2025-11-19 16:22:33.751008
95	106	Tech enthusiast and fitness lover	{"title": "Software Engineer"}	\N	\N	{"level": "Bachelors"}	\N	\N	\N	\N	["coding", "fitness", "travel"]	[]	[]	Socially	Never	Regularly	Anything	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	75	t	f	2025-11-23 10:57:35.247114	2025-11-23 10:57:35.247114
42	51	My name is Alex Chen, and I'm a 14-year-old who loves exploring the world around me. I'm passionate about robotics and spend most of my free time building and programming small machines in my garage workshop. Soccer is my favorite sport, and I play as a midfielder for my school's team. I have a younger sister named Emma wh	[]	TechCorp v1	Senior Engineer v1	[]	nsitv1	185	\N	asdabangaelorev1 ads	[]	[]	[]	DRINKING_SOCIALLY	SMOKING_UNSPECIFIED	WORKOUT_SOMETIMES	DIETARY_VEGETARIAN	RELIGION_MUSLIM	IMPORTANCE_UNSPECIFIED	POLITICAL_CONSERVATIVE	PET_UNSPECIFIED	CHILDREN_UNSPECIFIED	My n	COMMUNICATION_PHONE_CALLER	LOVE_LANGUAGE_RECEIVING_GIFTS	SLEEP_SCHEDULE_NIGHT_OWL	[]	65	t	f	2025-11-12 19:10:35.045722	2025-11-23 11:08:19.599674
79	90	Test bio for Alice	{"title": "Software Engineer", "company": "Tech Corp"}	\N	\N	{"field": "Computer Science", "level": "Bachelor's"}	\N	\N	\N	\N	["coding", "hiking", "reading"]	[]	[]	Socially	Never	Regularly	Vegetarian	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	75	t	f	2025-11-23 09:41:37.375362	2025-11-23 09:41:37.375362
80	91	Test bio for Bob	{"title": "Software Engineer", "company": "Tech Corp"}	\N	\N	{"field": "Computer Science", "level": "Bachelor's"}	\N	\N	\N	\N	["coding", "hiking", "reading"]	[]	[]	Socially	Never	Regularly	Vegetarian	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	75	t	f	2025-11-23 09:41:37.381131	2025-11-23 09:41:37.381131
81	92	Test bio for Charlie	{"title": "Software Engineer", "company": "Tech Corp"}	\N	\N	{"field": "Computer Science", "level": "Bachelor's"}	\N	\N	\N	\N	["coding", "hiking", "reading"]	[]	[]	Socially	Never	Regularly	Vegetarian	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	75	t	f	2025-11-23 09:41:37.387167	2025-11-23 09:41:37.387167
\.


--
-- Data for Name: user_reports; Type: TABLE DATA; Schema: public; Owner: devuser
--

COPY public.user_reports (id, reporter_user_id, reported_user_id, report_id, reason, details, evidence_urls, status, reviewed_by, reviewed_at, resolution_notes, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: devuser
--

COPY public.users (id, email, name, created_at, updated_at, password_hash, phone_number, email_verified, phone_verified, account_status, verification_token, verification_token_expires_at, password_reset_token, password_reset_token_expires_at, last_login_at, photo_url, date_of_birth, gender) FROM stdin;
1	admin@datifyy.com	Admin User	2025-11-11 15:40:19.726084	2025-11-11 15:40:19.726084	\N	\N	f	f	PENDING	\N	\N	\N	\N	\N	\N	\N	\N
2	test@datifyy.com	Test User	2025-11-11 15:40:19.726084	2025-11-11 15:40:19.726084	\N	\N	f	f	PENDING	\N	\N	\N	\N	\N	\N	\N	\N
3	john.doe@example.com	John Doe	2025-10-12 18:59:01.816787	2025-11-11 18:59:01.816787	$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu	\N	t	f	ACTIVE	\N	\N	\N	\N	\N	https://i.pravatar.cc/300?img=12	1995-06-15	MALE
4	sarah.johnson@example.com	Sarah Johnson	2025-10-17 18:59:01.816787	2025-11-11 18:59:01.816787	$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu	\N	t	f	ACTIVE	\N	\N	\N	\N	\N	https://i.pravatar.cc/300?img=5	1997-03-22	FEMALE
5	rahul.sharma@example.com	Rahul Sharma	2025-10-22 18:59:01.816787	2025-11-11 18:59:01.816787	$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu	\N	t	f	ACTIVE	\N	\N	\N	\N	\N	https://i.pravatar.cc/300?img=33	1991-11-08	MALE
6	priya.patel@example.com	Priya Patel	2025-10-27 18:59:01.816787	2025-11-11 18:59:01.816787	$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu	\N	t	f	ACTIVE	\N	\N	\N	\N	\N	https://i.pravatar.cc/300?img=9	1994-07-30	FEMALE
7	michael.chen@example.com	Michael Chen	2025-11-01 18:59:01.816787	2025-11-11 18:59:01.816787	$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu	\N	t	f	ACTIVE	\N	\N	\N	\N	\N	https://i.pravatar.cc/300?img=15	1988-01-12	MALE
8	emily.williams@example.com	Emily Williams	2025-11-04 18:59:01.816787	2025-11-11 18:59:01.816787	$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu	\N	t	f	ACTIVE	\N	\N	\N	\N	\N	https://i.pravatar.cc/300?img=20	1996-09-18	FEMALE
9	arjun.mehta@example.com	Arjun Mehta	2025-11-06 18:59:01.816787	2025-11-11 18:59:01.816787	$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu	\N	t	f	ACTIVE	\N	\N	\N	\N	\N	https://i.pravatar.cc/300?img=51	1993-04-25	MALE
10	lisa.anderson@example.com	Lisa Anderson	2025-11-08 18:59:01.816787	2025-11-11 18:59:01.816787	$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu	\N	t	f	ACTIVE	\N	\N	\N	\N	\N	https://i.pravatar.cc/300?img=10	1992-12-03	FEMALE
11	david.kumar@example.com	David Kumar	2025-11-09 18:59:01.816787	2025-11-11 18:59:01.816787	$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu	\N	t	f	ACTIVE	\N	\N	\N	\N	\N	https://i.pravatar.cc/300?img=68	1995-08-14	MALE
12	aisha.khan@example.com	Aisha Khan	2025-11-10 18:59:01.816787	2025-11-11 18:59:01.816787	$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu	\N	t	f	ACTIVE	\N	\N	\N	\N	\N	https://i.pravatar.cc/300?img=16	1998-02-20	FEMALE
13	pending.user@example.com	Pending User	2025-11-11 18:59:01.816787	2025-11-11 18:59:01.816787	$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu	\N	f	f	PENDING	\N	\N	\N	\N	\N	\N	1996-05-10	MALE
18	testuser456@example.com	Test User	2025-11-11 19:20:40.605935	2025-11-11 19:20:40.605935	$2a$12$FaJuUrOlT77SCtOpu6Gh1uW2b2/iY8Fjyf6shKDx58noLJerEUS9G	\N	f	f	PENDING	z0iv4FYq7itrcCGgDvzNwr68WZC8XOtWAC9XglbHh4c=	2025-11-12 19:20:40.587578	\N	\N	\N	\N	\N	\N
19	grpcuser4@example.com	gRPC User 4	2025-11-11 19:23:23.596804	2025-11-11 19:23:23.596804	$2a$12$sVuAyfBFkwCN86AutFoKAO5jjrlrp4utsE0ra8X8fJfhE3E8A6jJ2	\N	f	f	PENDING	unAqt9duYBSPePKbpf-B-fhcv5Jdmz3_EBlX6ICvOjU=	2025-11-12 19:23:23.579596	\N	\N	\N	\N	\N	\N
20	admin@admin.com	Test User	2025-11-11 19:31:06.744241	2025-11-11 19:31:06.744241	$2a$12$fZed.UNu34qsFmAKp5EOu.E9KFn0jVFusVze3M8xR8.fFrQL/ZIPK	\N	f	f	PENDING	4qdFVG8aFTzEdgL-9JYpOv3flVuZ127edtbN_lRFTTM=	2025-11-12 19:31:06.730736	\N	\N	\N	\N	\N	\N
21	grpcui@example.com	gRPC UI User\ngRPC UI User	2025-11-11 19:37:20.504669	2025-11-11 19:37:20.504669	$2a$12$GxdPMP2IAe7OB.OiXCXJpuKHoGdVyWS5O3qMm87KMdSvWV87UEp5i	\N	f	f	PENDING	UxRj58qRJZPl9oivrL95s3PdTkTvwf9KJT4wdtWRMiI=	2025-11-12 19:37:20.496773	\N	\N	\N	\N	\N	\N
105	test2@test.com	Sarah Anderson	2025-11-23 10:56:12.342789	2025-11-23 10:56:12.342789	hashedpassword	\N	t	f	ACTIVE	\N	\N	\N	\N	\N	\N	1995-03-15	FEMALE
106	test3@test.com	Michael Chen	2025-11-23 10:56:43.518281	2025-11-23 10:56:43.518281	hashedpassword	\N	t	f	ACTIVE	\N	\N	\N	\N	\N	\N	1992-07-20	MALE
26	manualtest@example.com	Manual Test User	2025-11-12 15:53:31.044348	2025-11-12 16:03:11.17253	$2a$12$hrZ9bM0u4kEjF2Po0SASYOa92zXyggdPzmzqQukmoi/DnUSar3Cgu	\N	f	f	PENDING	O7x40Q00YauiC8uxDqZ9Pep7qIBJ2JDGyzJE8bSBzwc=	2025-11-13 15:53:31.030147	\N	\N	2025-11-12 16:03:11.17253	\N	\N	\N
51	test1@test.com	RahulRana	2025-11-12 19:10:35.015309	2025-11-23 11:08:48.095731	$2a$12$FI6smULLudcO3Tc46r3FreJCtr1.kK.UIS3mEaA9CZQqaJ6EooISW	+1234567890	f	f	ACTIVE	8qEvVzSc4U908Q0RXdTT2a8LzgreCMKGEJUO7ZCM5ks=	2025-11-13 19:10:34.957817	\N	\N	2025-11-19 14:44:22.128821	\N	1995-05-10	MALE
52	a@b.com	Priya	2025-11-12 19:31:37.332602	2025-11-23 12:21:04.937978	$2a$12$eripeSKhwTfgvsKCVUAnuOklgDX5WwVi8fbpSAcvnOh4/9CwA0VEe	\N	f	f	PENDING	4jgFejnKkqYjX1Ym8LY5ar2u27hvFpEF6GJNS8MIMyE=	2025-11-13 19:31:37.277927	\N	\N	2025-11-12 19:32:00.579457	\N	\N	FEMALE
53	partnertest@example.com	Partner Test	2025-11-16 14:44:04.479886	2025-11-23 12:21:04.941972	$2a$12$vDV9fg0SFym9QBOMzZ5hK.jrZW2TOE7pMzBuyREzzhDo/K3Ea4OsK	\N	f	f	PENDING	qWNo0uTowS1ii_oBjTMd7Qkjq7_IJ1VbP3sFs4dctbY=	2025-11-17 14:44:04.473425	\N	\N	\N	\N	\N	FEMALE
43	integration-1762969793@example.com	Test User	2025-11-12 17:49:53.887533	2025-11-12 17:49:53.887533	hash	\N	t	f	ACTIVE	\N	\N	\N	\N	\N	\N	\N	\N
45	blocker-1762969793@example.com	Test User	2025-11-12 17:49:53.959648	2025-11-12 17:49:53.959648	hash	\N	t	f	ACTIVE	\N	\N	\N	\N	\N	\N	\N	\N
46	blocked-1762969793@example.com	Test User	2025-11-12 17:49:53.964557	2025-11-12 17:49:53.964557	hash	\N	t	f	ACTIVE	\N	\N	\N	\N	\N	\N	\N	\N
47	reporter-1762969793@example.com	Test User	2025-11-12 17:49:53.990741	2025-11-12 17:49:53.990741	hash	\N	t	f	ACTIVE	\N	\N	\N	\N	\N	\N	\N	\N
48	reported-1762969793@example.com	Test User	2025-11-12 17:49:54.004669	2025-11-12 17:49:54.004669	hash	\N	t	f	ACTIVE	\N	\N	\N	\N	\N	\N	\N	\N
49	prefs-1762969794@example.com	Test User	2025-11-12 17:49:54.031753	2025-11-12 17:49:54.031753	hash	\N	t	f	ACTIVE	\N	\N	\N	\N	\N	\N	\N	\N
50	userprefs-1762969794@example.com	Test User	2025-11-12 17:49:54.05222	2025-11-12 17:49:54.05222	hash	\N	t	f	ACTIVE	\N	\N	\N	\N	\N	\N	\N	\N
54	testcurl@example.com	Test User	2025-11-19 12:51:24.612403	2025-11-19 12:51:24.612403	$2a$12$WOHEpSkHOv9I5jJedwLB.ujXHRgoC5.pE5ZS1LhOey13VDU8Wcp76	\N	f	f	PENDING	kaXFrvPcbpOdhndvge_nkIes5xQgdnT0QYC35gAexX8=	2025-11-20 12:51:24.523861	\N	\N	\N	\N	\N	\N
55	test-prefs-1732027201@example.com	Test User	2025-11-19 16:12:56.555309	2025-11-19 16:12:56.555309	$2a$12$JIKkmL2S2z13nKuk5Qm59eNfLhuTjbBgk2g17DNPlgm52QLFY.rvC	\N	f	f	PENDING	g6B2IqOEYSkACP63b4PfDopLiq94fPnxzFzh6XiSOkw=	2025-11-20 16:12:56.52144	\N	\N	\N	\N	\N	\N
56	test-camel-case@example.com	Test User	2025-11-19 16:22:33.72925	2025-11-19 16:22:33.72925	$2a$12$.NfBPqD31ckHE/77fSMxr.7fxECyzvlMgrYQr0A85Ai14t7LVQS6a	\N	f	f	PENDING	E-DtI7t0XoqdKBxk4NoG30Mp_ldsHw9UpZH88cYwnTY=	2025-11-20 16:22:33.70945	\N	\N	\N	\N	\N	\N
90	test_admin_curation_1@test.com	Alice	2025-11-23 09:41:37.372895	2025-11-23 09:41:37.372895	hashedpassword	\N	t	f	ACTIVE	\N	\N	\N	\N	\N	\N	1997-11-23	FEMALE
91	test_admin_curation_2@test.com	Bob	2025-11-23 09:41:37.379936	2025-11-23 09:41:37.379936	hashedpassword	\N	t	f	ACTIVE	\N	\N	\N	\N	\N	\N	1995-11-23	MALE
92	test_admin_curation_3@test.com	Charlie	2025-11-23 09:41:37.385622	2025-11-23 09:41:37.385622	hashedpassword	\N	t	f	ACTIVE	\N	\N	\N	\N	\N	\N	2000-11-23	MALE
\.


--
-- Data for Name: verification_codes; Type: TABLE DATA; Schema: public; Owner: devuser
--

COPY public.verification_codes (id, user_id, code, type, expires_at, used, created_at) FROM stdin;
\.


--
-- Name: admin_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.admin_sessions_id_seq', 1, false);


--
-- Name: admin_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.admin_users_id_seq', 2, true);


--
-- Name: availability_slots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.availability_slots_id_seq', 81, true);


--
-- Name: curated_matches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.curated_matches_id_seq', 13, true);


--
-- Name: date_activity_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.date_activity_log_id_seq', 1, false);


--
-- Name: date_rejections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.date_rejections_id_seq', 1, false);


--
-- Name: date_suggestions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.date_suggestions_id_seq', 2, true);


--
-- Name: devices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.devices_id_seq', 1, false);


--
-- Name: partner_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.partner_preferences_id_seq', 115, true);


--
-- Name: scheduled_dates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.scheduled_dates_id_seq', 1, true);


--
-- Name: user_blocks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.user_blocks_id_seq', 1, true);


--
-- Name: user_photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.user_photos_id_seq', 4, true);


--
-- Name: user_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.user_preferences_id_seq', 3, true);


--
-- Name: user_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.user_profiles_id_seq', 95, true);


--
-- Name: user_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.user_reports_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.users_id_seq', 106, true);


--
-- Name: verification_codes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.verification_codes_id_seq', 1, false);


--
-- Name: admin_sessions admin_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT admin_sessions_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_email_key; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_key UNIQUE (email);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: availability_slots availability_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.availability_slots
    ADD CONSTRAINT availability_slots_pkey PRIMARY KEY (id);


--
-- Name: curated_matches curated_matches_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.curated_matches
    ADD CONSTRAINT curated_matches_pkey PRIMARY KEY (id);


--
-- Name: date_activity_log date_activity_log_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.date_activity_log
    ADD CONSTRAINT date_activity_log_pkey PRIMARY KEY (id);


--
-- Name: date_rejections date_rejections_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.date_rejections
    ADD CONSTRAINT date_rejections_pkey PRIMARY KEY (id);


--
-- Name: date_suggestions date_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.date_suggestions
    ADD CONSTRAINT date_suggestions_pkey PRIMARY KEY (id);


--
-- Name: devices devices_device_id_key; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_device_id_key UNIQUE (device_id);


--
-- Name: devices devices_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_pkey PRIMARY KEY (id);


--
-- Name: partner_preferences partner_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.partner_preferences
    ADD CONSTRAINT partner_preferences_pkey PRIMARY KEY (id);


--
-- Name: partner_preferences partner_preferences_user_id_key; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.partner_preferences
    ADD CONSTRAINT partner_preferences_user_id_key UNIQUE (user_id);


--
-- Name: scheduled_dates scheduled_dates_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.scheduled_dates
    ADD CONSTRAINT scheduled_dates_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: curated_matches unique_curated_match; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.curated_matches
    ADD CONSTRAINT unique_curated_match UNIQUE (user1_id, user2_id);


--
-- Name: availability_slots unique_user_slot; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.availability_slots
    ADD CONSTRAINT unique_user_slot UNIQUE (user_id, start_time);


--
-- Name: user_blocks user_blocks_blocker_user_id_blocked_user_id_key; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.user_blocks
    ADD CONSTRAINT user_blocks_blocker_user_id_blocked_user_id_key UNIQUE (blocker_user_id, blocked_user_id);


--
-- Name: user_blocks user_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.user_blocks
    ADD CONSTRAINT user_blocks_pkey PRIMARY KEY (id);


--
-- Name: user_photos user_photos_photo_id_key; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.user_photos
    ADD CONSTRAINT user_photos_photo_id_key UNIQUE (photo_id);


--
-- Name: user_photos user_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.user_photos
    ADD CONSTRAINT user_photos_pkey PRIMARY KEY (id);


--
-- Name: user_preferences user_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_preferences user_preferences_user_id_key; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_user_id_key UNIQUE (user_id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);


--
-- Name: user_reports user_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.user_reports
    ADD CONSTRAINT user_reports_pkey PRIMARY KEY (id);


--
-- Name: user_reports user_reports_report_id_key; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.user_reports
    ADD CONSTRAINT user_reports_report_id_key UNIQUE (report_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_number_key UNIQUE (phone_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: verification_codes verification_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.verification_codes
    ADD CONSTRAINT verification_codes_pkey PRIMARY KEY (id);


--
-- Name: idx_admin_sessions_admin_id; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_admin_sessions_admin_id ON public.admin_sessions USING btree (admin_id);


--
-- Name: idx_admin_sessions_token; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_admin_sessions_token ON public.admin_sessions USING btree (token_hash);


--
-- Name: idx_admin_users_email; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_admin_users_email ON public.admin_users USING btree (email);


--
-- Name: idx_admin_users_is_genie; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_admin_users_is_genie ON public.admin_users USING btree (is_genie) WHERE (is_genie = true);


--
-- Name: idx_admin_users_role; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_admin_users_role ON public.admin_users USING btree (role);


--
-- Name: idx_availability_slots_date_type; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_availability_slots_date_type ON public.availability_slots USING btree (date_type);


--
-- Name: idx_availability_slots_start_time; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_availability_slots_start_time ON public.availability_slots USING btree (start_time);


--
-- Name: idx_availability_slots_user_id; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_availability_slots_user_id ON public.availability_slots USING btree (user_id);


--
-- Name: idx_availability_slots_user_start; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_availability_slots_user_start ON public.availability_slots USING btree (user_id, start_time);


--
-- Name: idx_curated_matches_created_by; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_curated_matches_created_by ON public.curated_matches USING btree (created_by_admin);


--
-- Name: idx_curated_matches_score; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_curated_matches_score ON public.curated_matches USING btree (compatibility_score DESC);


--
-- Name: idx_curated_matches_status; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_curated_matches_status ON public.curated_matches USING btree (status);


--
-- Name: idx_curated_matches_user1; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_curated_matches_user1 ON public.curated_matches USING btree (user1_id);


--
-- Name: idx_curated_matches_user2; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_curated_matches_user2 ON public.curated_matches USING btree (user2_id);


--
-- Name: idx_date_activity_date_id; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_date_activity_date_id ON public.date_activity_log USING btree (date_id);


--
-- Name: idx_date_rejections_rejected_user; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_date_rejections_rejected_user ON public.date_rejections USING btree (rejected_user_id);


--
-- Name: idx_date_rejections_scheduled_date; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_date_rejections_scheduled_date ON public.date_rejections USING btree (scheduled_date_id);


--
-- Name: idx_date_rejections_suggestion; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_date_rejections_suggestion ON public.date_rejections USING btree (suggestion_id);


--
-- Name: idx_date_rejections_user; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_date_rejections_user ON public.date_rejections USING btree (user_id);


--
-- Name: idx_date_suggestions_status; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_date_suggestions_status ON public.date_suggestions USING btree (status);


--
-- Name: idx_date_suggestions_suggested_user; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_date_suggestions_suggested_user ON public.date_suggestions USING btree (suggested_user_id);


--
-- Name: idx_date_suggestions_user; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_date_suggestions_user ON public.date_suggestions USING btree (user_id);


--
-- Name: idx_date_suggestions_user_status; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_date_suggestions_user_status ON public.date_suggestions USING btree (user_id, status);


--
-- Name: idx_devices_device_id; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_devices_device_id ON public.devices USING btree (device_id);


--
-- Name: idx_devices_user_id; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_devices_user_id ON public.devices USING btree (user_id);


--
-- Name: idx_partner_preferences_user_id; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_partner_preferences_user_id ON public.partner_preferences USING btree (user_id);


--
-- Name: idx_partner_prefs_age_range; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_partner_prefs_age_range ON public.partner_preferences USING btree (age_range_min, age_range_max);


--
-- Name: idx_partner_prefs_distance; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_partner_prefs_distance ON public.partner_preferences USING btree (distance_preference);


--
-- Name: idx_partner_prefs_religion_importance; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_partner_prefs_religion_importance ON public.partner_preferences USING btree (religion_importance);


--
-- Name: idx_partner_prefs_verified_only; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_partner_prefs_verified_only ON public.partner_preferences USING btree (verified_only);


--
-- Name: idx_scheduled_dates_genie; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_scheduled_dates_genie ON public.scheduled_dates USING btree (genie_id);


--
-- Name: idx_scheduled_dates_scheduled_time; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_scheduled_dates_scheduled_time ON public.scheduled_dates USING btree (scheduled_time);


--
-- Name: idx_scheduled_dates_status; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_scheduled_dates_status ON public.scheduled_dates USING btree (status);


--
-- Name: idx_scheduled_dates_status_time; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_scheduled_dates_status_time ON public.scheduled_dates USING btree (status, scheduled_time);


--
-- Name: idx_scheduled_dates_user1; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_scheduled_dates_user1 ON public.scheduled_dates USING btree (user1_id);


--
-- Name: idx_scheduled_dates_user2; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_scheduled_dates_user2 ON public.scheduled_dates USING btree (user2_id);


--
-- Name: idx_sessions_device_id; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_sessions_device_id ON public.sessions USING btree (device_id);


--
-- Name: idx_sessions_expires_at; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_sessions_expires_at ON public.sessions USING btree (expires_at);


--
-- Name: idx_sessions_user_id; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_sessions_user_id ON public.sessions USING btree (user_id);


--
-- Name: idx_user_blocks_blocked; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_user_blocks_blocked ON public.user_blocks USING btree (blocked_user_id);


--
-- Name: idx_user_blocks_blocker; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_user_blocks_blocker ON public.user_blocks USING btree (blocker_user_id);


--
-- Name: idx_user_photos_primary_per_user; Type: INDEX; Schema: public; Owner: devuser
--

CREATE UNIQUE INDEX idx_user_photos_primary_per_user ON public.user_photos USING btree (user_id) WHERE (is_primary = true);


--
-- Name: idx_user_photos_user_id; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_user_photos_user_id ON public.user_photos USING btree (user_id);


--
-- Name: idx_user_preferences_user_id; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_user_preferences_user_id ON public.user_preferences USING btree (user_id);


--
-- Name: idx_user_profiles_user_id; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_user_profiles_user_id ON public.user_profiles USING btree (user_id);


--
-- Name: idx_user_reports_report_id; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_user_reports_report_id ON public.user_reports USING btree (report_id);


--
-- Name: idx_user_reports_reported; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_user_reports_reported ON public.user_reports USING btree (reported_user_id);


--
-- Name: idx_user_reports_reporter; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_user_reports_reporter ON public.user_reports USING btree (reporter_user_id);


--
-- Name: idx_user_reports_status; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_user_reports_status ON public.user_reports USING btree (status);


--
-- Name: idx_users_account_status; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_users_account_status ON public.users USING btree (account_status);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_email_verified; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_users_email_verified ON public.users USING btree (email_verified);


--
-- Name: idx_users_phone_number; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_users_phone_number ON public.users USING btree (phone_number);


--
-- Name: idx_verification_codes_code; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_verification_codes_code ON public.verification_codes USING btree (code);


--
-- Name: idx_verification_codes_user_id; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_verification_codes_user_id ON public.verification_codes USING btree (user_id);


--
-- Name: availability_slots trigger_update_availability_slots_updated_at; Type: TRIGGER; Schema: public; Owner: devuser
--

CREATE TRIGGER trigger_update_availability_slots_updated_at BEFORE UPDATE ON public.availability_slots FOR EACH ROW EXECUTE FUNCTION public.update_availability_slots_updated_at();


--
-- Name: admin_users update_admin_users_updated_at; Type: TRIGGER; Schema: public; Owner: devuser
--

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: curated_matches update_curated_matches_updated_at; Type: TRIGGER; Schema: public; Owner: devuser
--

CREATE TRIGGER update_curated_matches_updated_at BEFORE UPDATE ON public.curated_matches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: date_suggestions update_date_suggestions_updated_at; Type: TRIGGER; Schema: public; Owner: devuser
--

CREATE TRIGGER update_date_suggestions_updated_at BEFORE UPDATE ON public.date_suggestions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: partner_preferences update_partner_preferences_updated_at; Type: TRIGGER; Schema: public; Owner: devuser
--

CREATE TRIGGER update_partner_preferences_updated_at BEFORE UPDATE ON public.partner_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: scheduled_dates update_scheduled_dates_updated_at; Type: TRIGGER; Schema: public; Owner: devuser
--

CREATE TRIGGER update_scheduled_dates_updated_at BEFORE UPDATE ON public.scheduled_dates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_preferences update_user_preferences_updated_at; Type: TRIGGER; Schema: public; Owner: devuser
--

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_profiles update_user_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: devuser
--

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: devuser
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: admin_sessions admin_sessions_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT admin_sessions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admin_users(id) ON DELETE CASCADE;


--
-- Name: admin_users admin_users_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admin_users(id);


--
-- Name: admin_users admin_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: availability_slots availability_slots_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.availability_slots
    ADD CONSTRAINT availability_slots_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: curated_matches curated_matches_created_by_admin_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.curated_matches
    ADD CONSTRAINT curated_matches_created_by_admin_fkey FOREIGN KEY (created_by_admin) REFERENCES public.admin_users(id);


--
-- Name: curated_matches curated_matches_scheduled_date_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.curated_matches
    ADD CONSTRAINT curated_matches_scheduled_date_id_fkey FOREIGN KEY (scheduled_date_id) REFERENCES public.scheduled_dates(id) ON DELETE SET NULL;


--
-- Name: curated_matches curated_matches_user1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.curated_matches
    ADD CONSTRAINT curated_matches_user1_id_fkey FOREIGN KEY (user1_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: curated_matches curated_matches_user2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.curated_matches
    ADD CONSTRAINT curated_matches_user2_id_fkey FOREIGN KEY (user2_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: date_activity_log date_activity_log_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.date_activity_log
    ADD CONSTRAINT date_activity_log_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admin_users(id);


--
-- Name: date_activity_log date_activity_log_date_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.date_activity_log
    ADD CONSTRAINT date_activity_log_date_id_fkey FOREIGN KEY (date_id) REFERENCES public.scheduled_dates(id) ON DELETE CASCADE;


--
-- Name: date_rejections date_rejections_rejected_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.date_rejections
    ADD CONSTRAINT date_rejections_rejected_user_id_fkey FOREIGN KEY (rejected_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: date_rejections date_rejections_scheduled_date_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.date_rejections
    ADD CONSTRAINT date_rejections_scheduled_date_id_fkey FOREIGN KEY (scheduled_date_id) REFERENCES public.scheduled_dates(id) ON DELETE SET NULL;


--
-- Name: date_rejections date_rejections_suggestion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.date_rejections
    ADD CONSTRAINT date_rejections_suggestion_id_fkey FOREIGN KEY (suggestion_id) REFERENCES public.date_suggestions(id) ON DELETE SET NULL;


--
-- Name: date_rejections date_rejections_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.date_rejections
    ADD CONSTRAINT date_rejections_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: date_suggestions date_suggestions_curated_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.date_suggestions
    ADD CONSTRAINT date_suggestions_curated_match_id_fkey FOREIGN KEY (curated_match_id) REFERENCES public.curated_matches(id) ON DELETE SET NULL;


--
-- Name: date_suggestions date_suggestions_scheduled_date_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.date_suggestions
    ADD CONSTRAINT date_suggestions_scheduled_date_id_fkey FOREIGN KEY (scheduled_date_id) REFERENCES public.scheduled_dates(id) ON DELETE SET NULL;


--
-- Name: date_suggestions date_suggestions_suggested_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.date_suggestions
    ADD CONSTRAINT date_suggestions_suggested_user_id_fkey FOREIGN KEY (suggested_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: date_suggestions date_suggestions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.date_suggestions
    ADD CONSTRAINT date_suggestions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: devices devices_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: partner_preferences partner_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.partner_preferences
    ADD CONSTRAINT partner_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: scheduled_dates scheduled_dates_cancelled_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.scheduled_dates
    ADD CONSTRAINT scheduled_dates_cancelled_by_fkey FOREIGN KEY (cancelled_by) REFERENCES public.admin_users(id);


--
-- Name: scheduled_dates scheduled_dates_genie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.scheduled_dates
    ADD CONSTRAINT scheduled_dates_genie_id_fkey FOREIGN KEY (genie_id) REFERENCES public.admin_users(id);


--
-- Name: scheduled_dates scheduled_dates_user1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.scheduled_dates
    ADD CONSTRAINT scheduled_dates_user1_id_fkey FOREIGN KEY (user1_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: scheduled_dates scheduled_dates_user2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.scheduled_dates
    ADD CONSTRAINT scheduled_dates_user2_id_fkey FOREIGN KEY (user2_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_blocks user_blocks_blocked_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.user_blocks
    ADD CONSTRAINT user_blocks_blocked_user_id_fkey FOREIGN KEY (blocked_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_blocks user_blocks_blocker_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.user_blocks
    ADD CONSTRAINT user_blocks_blocker_user_id_fkey FOREIGN KEY (blocker_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_photos user_photos_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.user_photos
    ADD CONSTRAINT user_photos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_preferences user_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_profiles user_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_reports user_reports_reported_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.user_reports
    ADD CONSTRAINT user_reports_reported_user_id_fkey FOREIGN KEY (reported_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_reports user_reports_reporter_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.user_reports
    ADD CONSTRAINT user_reports_reporter_user_id_fkey FOREIGN KEY (reporter_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_reports user_reports_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.user_reports
    ADD CONSTRAINT user_reports_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: verification_codes verification_codes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.verification_codes
    ADD CONSTRAINT verification_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict h5sHyTJLPdJIZhdWLnMciPlZOcfpXukt9QVcBTZZX2v2Que98GifaGUqCzb0g1J

