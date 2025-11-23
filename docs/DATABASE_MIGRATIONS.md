# Database Migrations Guide

Complete guide for managing database schema changes in the Datifyy application.

## Table of Contents

1. [Overview](#overview)
2. [Migration Files](#migration-files)
3. [Running Migrations](#running-migrations)
4. [Creating New Migrations](#creating-new-migrations)
5. [Migration Best Practices](#migration-best-practices)
6. [Rolling Back Migrations](#rolling-back-migrations)
7. [Production Migrations](#production-migrations)
8. [Troubleshooting](#troubleshooting)
9. [Migration Tools](#migration-tools)

## Overview

Database migrations are version-controlled SQL files that modify your database schema. They allow you to:
- Track database changes over time
- Apply changes consistently across environments
- Roll back changes if needed
- Collaborate with team members

### Migration Strategy

```
Development → Staging → Production
     ↓           ↓          ↓
  Test First  Verify    Apply Carefully
```

## Migration Files

### Location

```
apps/backend/migrations/
├── 001_initial_schema.sql
├── 002_add_auth_fields.sql
├── 003_seed_data.sql
├── 004_add_user_features.sql
└── 005_expand_partner_preferences.sql
```

### Naming Convention

```
XXX_description.sql

Where:
- XXX: 3-digit sequential number (001, 002, 003...)
- description: Brief, descriptive name in snake_case
- .sql: SQL file extension

Examples:
✅ 006_add_user_photos.sql
✅ 007_create_matches_table.sql
✅ 008_add_user_verification.sql
❌ add_photos.sql (missing number)
❌ 6_photos.sql (number not zero-padded)
❌ 006-add-photos.sql (use underscore, not dash)
```

### Current Migrations

```bash
# View all existing migrations
ls -la apps/backend/migrations/

# Count migrations
ls apps/backend/migrations/*.sql | wc -l
# Output: 5

# Show migration file sizes
du -h apps/backend/migrations/*.sql
```

### Migration Content Structure

Each migration should:
1. Begin with a comment describing the change
2. Use transactions for safety (when possible)
3. Include both UP and DOWN migrations (in separate files or sections)
4. Be idempotent (safe to run multiple times)

```sql
-- Migration: 006_add_user_photos
-- Description: Add user_photos table for storing profile and gallery images
-- Author: Your Name
-- Date: 2025-11-23

BEGIN;

-- Add user_photos table
CREATE TABLE IF NOT EXISTS user_photos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    photo_type VARCHAR(50) NOT NULL CHECK (photo_type IN ('PROFILE', 'GALLERY')),
    is_primary BOOLEAN DEFAULT false,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_photos_user_id ON user_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_photos_type ON user_photos(photo_type);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_photos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_photos_updated_at
BEFORE UPDATE ON user_photos
FOR EACH ROW
EXECUTE FUNCTION update_user_photos_updated_at();

COMMIT;
```

## Running Migrations

### Prerequisites

```bash
# Install PostgreSQL client
# macOS:
brew install postgresql

# Ubuntu/Debian:
sudo apt-get install postgresql-client

# Windows:
# Download from: https://www.postgresql.org/download/windows/

# Verify installation
psql --version
# Should output: psql (PostgreSQL) 15.x
```

### Set Environment Variables

```bash
# Development
export DATABASE_URL="postgres://devuser:devpass@localhost:5432/monorepo_dev?sslmode=disable"

# Production (from Render/Supabase)
export DATABASE_URL="postgres://user:password@host:5432/dbname?sslmode=require"

# Verify connection
psql $DATABASE_URL -c "SELECT version();"
```

### Run All Migrations

```bash
# Navigate to project root
cd /Users/rahulrana/repo/datifyy_monorepo_v2

# Run migrations in order
for migration in apps/backend/migrations/*.sql; do
    echo "Running migration: $migration"
    psql $DATABASE_URL -f "$migration"
    if [ $? -eq 0 ]; then
        echo "✅ Success: $migration"
    else
        echo "❌ Failed: $migration"
        exit 1
    fi
done
```

### Run Single Migration

```bash
# Run specific migration
psql $DATABASE_URL -f apps/backend/migrations/006_add_user_photos.sql

# Verify migration
psql $DATABASE_URL -c "\d user_photos"
# Should show table structure

# Check data
psql $DATABASE_URL -c "SELECT COUNT(*) FROM user_photos;"
```

### Run Migrations with Error Handling

```bash
# Create migration runner script
cat > run-migrations.sh <<'EOF'
#!/bin/bash
set -e  # Exit on error

DATABASE_URL="${1:-$DATABASE_URL}"
MIGRATIONS_DIR="apps/backend/migrations"

if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL not set"
    echo "Usage: ./run-migrations.sh [DATABASE_URL]"
    exit 1
fi

echo "🗄️  Running migrations..."
echo "Database: $DATABASE_URL"
echo ""

# Create migrations tracking table
psql $DATABASE_URL -c "
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"

# Run each migration
for migration in $MIGRATIONS_DIR/*.sql; do
    filename=$(basename "$migration")
    version="${filename%.sql}"

    # Check if already applied
    already_applied=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM schema_migrations WHERE version='$version';")

    if [ "$already_applied" -eq 0 ]; then
        echo "⏳ Applying: $filename"
        psql $DATABASE_URL -f "$migration"

        # Record migration
        psql $DATABASE_URL -c "INSERT INTO schema_migrations (version) VALUES ('$version');"
        echo "✅ Applied: $filename"
    else
        echo "⏭️  Skipped: $filename (already applied)"
    fi
done

echo ""
echo "🎉 All migrations completed!"
EOF

chmod +x run-migrations.sh

# Run migrations
./run-migrations.sh $DATABASE_URL
```

### Verify Migrations

```bash
# List all tables
psql $DATABASE_URL -c "\dt"

# Check specific table structure
psql $DATABASE_URL -c "\d users"
psql $DATABASE_URL -c "\d user_photos"

# View applied migrations
psql $DATABASE_URL -c "SELECT * FROM schema_migrations ORDER BY version;"

# Check table row counts
psql $DATABASE_URL -c "
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    (SELECT COUNT(*) FROM pg_catalog.pg_class WHERE relname = tablename) AS row_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
"
```

## Creating New Migrations

### Step 1: Determine Next Number

```bash
# Find latest migration number
ls apps/backend/migrations/*.sql | tail -1
# Output: apps/backend/migrations/005_expand_partner_preferences.sql

# Next number: 006
```

### Step 2: Create Migration File

```bash
# Create new migration
cd apps/backend/migrations

# Generate filename
NEXT_NUMBER="006"
DESCRIPTION="add_user_photos"
FILENAME="${NEXT_NUMBER}_${DESCRIPTION}.sql"

# Create file
touch $FILENAME
```

### Step 3: Write Migration

```sql
-- Migration: 006_add_user_photos
-- Description: Add user_photos table for profile and gallery images
-- Author: Your Name
-- Date: 2025-11-23

BEGIN;

-- ============================================
-- UP Migration (Apply Changes)
-- ============================================

-- Create user_photos table
CREATE TABLE IF NOT EXISTS user_photos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    photo_type VARCHAR(50) NOT NULL CHECK (photo_type IN ('PROFILE', 'GALLERY')),
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_primary_photo UNIQUE (user_id, is_primary) WHERE is_primary = true
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_photos_user_id ON user_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_photos_type ON user_photos(photo_type);
CREATE INDEX IF NOT EXISTS idx_user_photos_primary ON user_photos(user_id, is_primary) WHERE is_primary = true;

-- Add trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_photos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_photos_updated_at
BEFORE UPDATE ON user_photos
FOR EACH ROW
EXECUTE FUNCTION update_user_photos_updated_at();

-- Add comments for documentation
COMMENT ON TABLE user_photos IS 'Stores user profile and gallery photos';
COMMENT ON COLUMN user_photos.photo_type IS 'Type of photo: PROFILE or GALLERY';
COMMENT ON COLUMN user_photos.is_primary IS 'Whether this is the primary profile photo';

COMMIT;

-- ============================================
-- DOWN Migration (Rollback - Create separate file)
-- ============================================
-- File: 006_add_user_photos_down.sql
-- DROP TRIGGER IF EXISTS trigger_user_photos_updated_at ON user_photos;
-- DROP FUNCTION IF EXISTS update_user_photos_updated_at();
-- DROP TABLE IF EXISTS user_photos;
```

### Step 4: Test Migration Locally

```bash
# Test on local database first
export DATABASE_URL="postgres://devuser:devpass@localhost:5432/monorepo_dev?sslmode=disable"

# Run migration
psql $DATABASE_URL -f apps/backend/migrations/006_add_user_photos.sql

# Verify table created
psql $DATABASE_URL -c "\d user_photos"

# Test inserting data
psql $DATABASE_URL -c "
INSERT INTO user_photos (user_id, photo_url, photo_type, is_primary)
VALUES (51, 'https://example.com/photo.jpg', 'PROFILE', true);
"

# Verify insert
psql $DATABASE_URL -c "SELECT * FROM user_photos;"

# Clean up test data
psql $DATABASE_URL -c "DELETE FROM user_photos WHERE user_id = 51;"
```

### Step 5: Create Rollback Migration

```bash
# Create down migration
touch apps/backend/migrations/006_add_user_photos_down.sql
```

```sql
-- Migration Rollback: 006_add_user_photos
-- Description: Remove user_photos table
-- Date: 2025-11-23

BEGIN;

-- Drop trigger
DROP TRIGGER IF EXISTS trigger_user_photos_updated_at ON user_photos;

-- Drop function
DROP FUNCTION IF EXISTS update_user_photos_updated_at();

-- Drop indexes (will be dropped with table, but explicit for clarity)
DROP INDEX IF EXISTS idx_user_photos_user_id;
DROP INDEX IF EXISTS idx_user_photos_type;
DROP INDEX IF EXISTS idx_user_photos_primary;

-- Drop table
DROP TABLE IF EXISTS user_photos;

COMMIT;
```

### Step 6: Commit Migration

```bash
# Add migration files
git add apps/backend/migrations/006_add_user_photos.sql
git add apps/backend/migrations/006_add_user_photos_down.sql

# Commit
git commit -m "Migration: Add user_photos table for profile and gallery images"

# Push
git push origin main
```

## Migration Best Practices

### 1. Always Use Transactions

```sql
-- ✅ Good: Use BEGIN/COMMIT
BEGIN;
CREATE TABLE new_table (...);
CREATE INDEX idx_new ON new_table(column);
COMMIT;

-- ❌ Bad: No transaction
CREATE TABLE new_table (...);
CREATE INDEX idx_new ON new_table(column);
```

**Exception**: Some operations can't be in transactions:
```sql
-- CREATE INDEX CONCURRENTLY cannot be in transaction
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
```

### 2. Make Migrations Idempotent

```sql
-- ✅ Good: Safe to run multiple times
CREATE TABLE IF NOT EXISTS users (...);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ❌ Bad: Fails if run twice
CREATE TABLE users (...);
ALTER TABLE users ADD COLUMN email VARCHAR(255);
CREATE INDEX idx_users_email ON users(email);
```

### 3. Add Indexes Concurrently in Production

```sql
-- ✅ Good: No table lock (use in production)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);

-- ❌ Bad: Locks table (only use in development)
CREATE INDEX idx_users_email ON users(email);
```

### 4. Use Constraints for Data Integrity

```sql
-- ✅ Good: Enforce data integrity
ALTER TABLE users
ADD COLUMN email VARCHAR(255) NOT NULL DEFAULT '',
ADD CONSTRAINT unique_email UNIQUE (email),
ADD CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- ❌ Bad: No constraints
ALTER TABLE users ADD COLUMN email VARCHAR(255);
```

### 5. Add Comments for Documentation

```sql
-- ✅ Good: Document your schema
COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON COLUMN users.email IS 'User email address, must be unique';
COMMENT ON COLUMN users.account_status IS 'Account status: ACTIVE, SUSPENDED, DELETED, PENDING';
```

### 6. Backup Before Destructive Changes

```sql
-- Before dropping table or column:
-- 1. Backup data
CREATE TABLE users_backup AS SELECT * FROM users;

-- 2. Verify backup
SELECT COUNT(*) FROM users_backup;

-- 3. Make change
ALTER TABLE users DROP COLUMN old_column;

-- 4. Drop backup after verification
DROP TABLE users_backup;
```

### 7. Handle Large Tables Carefully

```sql
-- For large tables (>1M rows), add columns with default carefully

-- ❌ Bad: Locks table, rewrites all rows
ALTER TABLE users ADD COLUMN verified BOOLEAN NOT NULL DEFAULT false;

-- ✅ Good: Add nullable first, then update in batches
ALTER TABLE users ADD COLUMN verified BOOLEAN;

-- Update in batches (application code or script)
UPDATE users SET verified = false WHERE verified IS NULL LIMIT 10000;
-- Repeat until done

-- Then add constraint
ALTER TABLE users ALTER COLUMN verified SET NOT NULL;
ALTER TABLE users ALTER COLUMN verified SET DEFAULT false;
```

### 8. Test Migrations

```bash
# Create test script
cat > test-migration.sh <<'EOF'
#!/bin/bash

# 1. Create test database
createdb test_migration

# 2. Run all previous migrations
for migration in apps/backend/migrations/{001..005}_*.sql; do
    psql test_migration -f "$migration"
done

# 3. Run new migration
psql test_migration -f apps/backend/migrations/006_add_user_photos.sql

# 4. Verify
psql test_migration -c "\d user_photos"

# 5. Test rollback
psql test_migration -f apps/backend/migrations/006_add_user_photos_down.sql

# 6. Verify rollback
psql test_migration -c "\d user_photos"  # Should not exist

# 7. Cleanup
dropdb test_migration
EOF

chmod +x test-migration.sh
./test-migration.sh
```

## Rolling Back Migrations

### Option 1: Run Down Migration

```bash
# Run the rollback migration
psql $DATABASE_URL -f apps/backend/migrations/006_add_user_photos_down.sql

# Verify rollback
psql $DATABASE_URL -c "\d user_photos"
# Should output: Did not find relation "user_photos"

# Remove from tracking
psql $DATABASE_URL -c "DELETE FROM schema_migrations WHERE version='006_add_user_photos';"
```

### Option 2: Manual Rollback

```bash
# Connect to database
psql $DATABASE_URL

# Manually drop objects created by migration
DROP TRIGGER IF EXISTS trigger_user_photos_updated_at ON user_photos;
DROP FUNCTION IF EXISTS update_user_photos_updated_at();
DROP TABLE IF EXISTS user_photos;

# Update tracking
DELETE FROM schema_migrations WHERE version='006_add_user_photos';

# Exit
\q
```

### Option 3: Restore from Backup

```bash
# If migration caused data loss or corruption:

# 1. Stop backend (prevent new writes)
# Render Dashboard → Suspend Service

# 2. Restore from backup
psql $DATABASE_URL < backup_before_migration.sql

# 3. Verify data
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"

# 4. Resume backend
# Render Dashboard → Resume Service
```

## Production Migrations

### Pre-Migration Checklist

- [ ] Migration tested in development
- [ ] Migration tested in staging (if available)
- [ ] Backup created
- [ ] Down migration prepared
- [ ] Team notified
- [ ] Maintenance window scheduled (if needed)
- [ ] Rollback plan documented

### Production Migration Process

#### Step 1: Create Backup

```bash
# Set production database URL
export DATABASE_URL="postgres://user:password@host:5432/dbname?sslmode=require"

# Create backup
BACKUP_FILE="backup_before_migration_$(date +%Y%m%d_%H%M%S).sql"
pg_dump $DATABASE_URL > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Verify backup
gunzip -c ${BACKUP_FILE}.gz | head -20

# Store backup securely
# Upload to S3, Google Cloud Storage, or secure location
```

#### Step 2: Notify Team

```bash
# Send notification:
# Subject: Database Migration - [Description]
# Body:
# - Migration: 006_add_user_photos.sql
# - Estimated duration: 2 minutes
# - Expected downtime: None
# - Rollback plan: 006_add_user_photos_down.sql available
# - Contact: [your-email]
```

#### Step 3: Apply Migration

```bash
# Option A: Manual (recommended for first time)
psql $DATABASE_URL -f apps/backend/migrations/006_add_user_photos.sql

# Option B: Using migration script
./run-migrations.sh $DATABASE_URL

# Monitor for errors
# Watch logs in Render Dashboard
```

#### Step 4: Verify Migration

```bash
# Check table exists
psql $DATABASE_URL -c "\d user_photos"

# Check indexes
psql $DATABASE_URL -c "\di user_photos*"

# Check constraints
psql $DATABASE_URL -c "
SELECT con.conname, con.contype, pg_get_constraintdef(con.oid)
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'user_photos';
"

# Test insert
psql $DATABASE_URL -c "
INSERT INTO user_photos (user_id, photo_url, photo_type)
VALUES (51, 'https://example.com/test.jpg', 'PROFILE')
RETURNING *;
"

# Clean up test
psql $DATABASE_URL -c "DELETE FROM user_photos WHERE photo_url = 'https://example.com/test.jpg';"
```

#### Step 5: Monitor Application

```bash
# Check backend logs
# Render Dashboard → Logs

# Monitor errors
# Look for database-related errors

# Check health endpoint
curl https://datifyy-backend.onrender.com/health/db

# Monitor API endpoints
curl https://datifyy-backend.onrender.com/api/v1/users
```

#### Step 6: Update Team

```bash
# Send success notification:
# Subject: Database Migration Complete - [Description]
# Body:
# - Migration: 006_add_user_photos.sql
# - Status: ✅ Successfully applied
# - Duration: 1.5 minutes
# - No issues detected
# - Application functioning normally
```

### Zero-Downtime Migrations

For migrations that might lock tables:

```sql
-- Example: Adding column to large table

-- Step 1: Add column as nullable (fast, no lock)
ALTER TABLE users ADD COLUMN verified BOOLEAN;

-- Step 2: Deploy code that writes to new column
-- (Backend update)

-- Step 3: Backfill data in batches (no lock)
-- Run this script:
DO $$
DECLARE
    batch_size INTEGER := 10000;
    updated INTEGER := 1;
BEGIN
    WHILE updated > 0 LOOP
        WITH batch AS (
            SELECT id FROM users
            WHERE verified IS NULL
            LIMIT batch_size
        )
        UPDATE users
        SET verified = false
        FROM batch
        WHERE users.id = batch.id;

        GET DIAGNOSTICS updated = ROW_COUNT;
        RAISE NOTICE 'Updated % rows', updated;
        PERFORM pg_sleep(0.1);  -- Small delay to avoid overload
    END LOOP;
END $$;

-- Step 4: Add NOT NULL constraint (fast, verified data exists)
ALTER TABLE users ALTER COLUMN verified SET NOT NULL;

-- Step 5: Add default
ALTER TABLE users ALTER COLUMN verified SET DEFAULT false;
```

## Troubleshooting

### Issue 1: Migration Fails Midway

**Symptom**: Migration stops with error, database in inconsistent state

**Solution**:
```bash
# If migration used BEGIN/COMMIT, it auto-rolled back
# Verify by checking table:
psql $DATABASE_URL -c "\d table_name"

# If no transaction, manually rollback
psql $DATABASE_URL -f apps/backend/migrations/XXX_migration_down.sql

# Fix migration file
# Re-run migration
psql $DATABASE_URL -f apps/backend/migrations/XXX_migration.sql
```

### Issue 2: Duplicate Key Violation

**Symptom**: `ERROR: duplicate key value violates unique constraint`

**Solution**:
```bash
# Find duplicate data
psql $DATABASE_URL -c "
SELECT email, COUNT(*)
FROM users
GROUP BY email
HAVING COUNT(*) > 1;
"

# Clean up duplicates before adding unique constraint
# Keep first, delete rest:
DELETE FROM users a USING users b
WHERE a.id > b.id AND a.email = b.email;

# Re-run migration
```

### Issue 3: Permission Denied

**Symptom**: `ERROR: permission denied to create table`

**Solution**:
```bash
# Check current user
psql $DATABASE_URL -c "SELECT current_user;"

# Grant permissions
psql $DATABASE_URL -c "
GRANT CREATE ON SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON DATABASE your_db TO your_user;
"

# Re-run migration
```

### Issue 4: Migration Takes Too Long

**Symptom**: Migration running for 10+ minutes

**Solution**:
```bash
# Check running queries
psql $DATABASE_URL -c "
SELECT pid, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC;
"

# For large tables, use CONCURRENTLY
CREATE INDEX CONCURRENTLY idx_name ON table(column);

# Or add column without default
ALTER TABLE users ADD COLUMN new_col INTEGER;  -- Fast
-- Update in batches via application code
```

### Issue 5: Constraint Violation on Existing Data

**Symptom**: `ERROR: column contains null values`

**Solution**:
```bash
# Fix data first, then add constraint

# Check null count
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users WHERE email IS NULL;"

# Update nulls
psql $DATABASE_URL -c "UPDATE users SET email = 'noemail@example.com' WHERE email IS NULL;"

# Add constraint
psql $DATABASE_URL -c "ALTER TABLE users ALTER COLUMN email SET NOT NULL;"
```

## Migration Tools

### Option 1: golang-migrate (Recommended)

```bash
# Install
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Create migration
migrate create -ext sql -dir apps/backend/migrations -seq add_user_photos

# Run migrations
migrate -path apps/backend/migrations -database $DATABASE_URL up

# Rollback
migrate -path apps/backend/migrations -database $DATABASE_URL down 1

# Check version
migrate -path apps/backend/migrations -database $DATABASE_URL version
```

### Option 2: Atlas (Schema-as-Code)

```bash
# Install
curl -sSf https://atlasgo.sh | sh

# Generate migration from schema diff
atlas migrate diff add_user_photos \
  --to "file://schema.sql" \
  --dev-url "postgres://localhost/dev" \
  --dir "file://apps/backend/migrations"

# Apply migrations
atlas migrate apply \
  --url $DATABASE_URL \
  --dir "file://apps/backend/migrations"
```

### Option 3: Manual Scripts (Current Approach)

Already covered above with `run-migrations.sh`.

## Checklist: Before Creating Migration

- [ ] Understand current schema
- [ ] Design new schema changes
- [ ] Write UP migration
- [ ] Write DOWN migration
- [ ] Test migration locally
- [ ] Test rollback locally
- [ ] Add appropriate indexes
- [ ] Add constraints for data integrity
- [ ] Document with comments
- [ ] Use idempotent SQL (IF NOT EXISTS)
- [ ] Use transactions
- [ ] Commit to version control

## Checklist: Before Running in Production

- [ ] Tested in development
- [ ] Tested in staging (if available)
- [ ] Backup created and verified
- [ ] Team notified
- [ ] Rollback plan ready
- [ ] Estimated duration calculated
- [ ] Downtime window scheduled (if needed)
- [ ] Monitoring ready

## Next Steps

1. ✅ Review existing migrations
2. ✅ Create new migration following best practices
3. ✅ Test locally
4. ✅ Create backup of production
5. ✅ Apply to production
6. ✅ Verify and monitor
7. ✅ Update team
