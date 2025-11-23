# Backend Deployment Guide

Comprehensive guide for deploying the Datifyy Go backend to production on Render.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Render Deployment](#render-deployment)
4. [Database Setup](#database-setup)
5. [Redis Setup](#redis-setup)
6. [Environment Configuration](#environment-configuration)
7. [Build Configuration](#build-configuration)
8. [Health Checks](#health-checks)
9. [Debugging](#debugging)
10. [Troubleshooting](#troubleshooting)
11. [Scaling](#scaling)

## Overview

The Datifyy backend is a Go server providing:
- **HTTP/REST API**: Port 8080
- **gRPC API**: Port 9090
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **AI**: Google Gemini API integration

### Architecture

```
┌──────────────────────────────────────┐
│         Backend (Go 1.24)            │
│  ┌────────────┐    ┌──────────────┐  │
│  │  HTTP/REST │    │     gRPC     │  │
│  │  Port 8080 │    │  Port 9090   │  │
│  └────────────┘    └──────────────┘  │
└──────────┬───────────────┬───────────┘
           │               │
    ┌──────▼──────┐ ┌─────▼──────┐
    │  PostgreSQL │ │   Redis    │
    │    5432     │ │    6379    │
    └─────────────┘ └────────────┘
           │
    ┌──────▼──────────┐
    │  Gemini AI API  │
    └─────────────────┘
```

## Prerequisites

### 1. Accounts Required

- **Render**: https://dashboard.render.com (for backend hosting)
- **Render PostgreSQL** or **Supabase**: For database
- **Upstash Redis**: https://console.upstash.com (for caching)
- **Google Cloud Console**: For Gemini API key

### 2. Get Gemini API Key

```bash
# 1. Go to: https://console.cloud.google.com/
# 2. Create new project: "Datifyy Production"
# 3. Enable API: "Generative Language API"
# 4. Go to: APIs & Services → Credentials
# 5. Create API Key
# 6. Copy key: AIza...
```

### 3. Local Testing

```bash
# Test backend builds locally first
cd apps/backend

# Build
go build -o server ./cmd/server

# Run
DATABASE_URL="postgres://user:pass@localhost:5432/db" \
REDIS_URL="redis://localhost:6379" \
GEMINI_API_KEY="your_key" \
./server

# Should output:
# ✓ Connected to PostgreSQL
# ✓ Connected to Redis
# 🌐 HTTP server listening on port 8080
# 🚀 gRPC server listening on port 9090
```

## Render Deployment

### Step 1: Create New Web Service

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → "Web Service"
3. **Connect Repository**:
   - Connect your GitHub account
   - Select `datifyy_monorepo_v2` repository
   - Click "Connect"

### Step 2: Configure Service

```yaml
Name: datifyy-backend
Environment: Go
Region: Oregon (US West) or closest to your users
Branch: main
Root Directory: apps/backend

Build Command:
  go build -o server ./cmd/server

Start Command:
  ./server
```

### Step 3: Configure Instance

```yaml
Instance Type: Starter ($7/month) or Free

Resources:
- Free: 512 MB RAM, 0.1 CPU
- Starter: 512 MB RAM, 0.5 CPU (Recommended)
- Standard: 2 GB RAM, 1 CPU (For production)

Auto-Deploy: Yes (deploys on git push to main)
```

### Step 4: Advanced Settings

```yaml
Health Check Path: /health
Docker Command: (leave empty)
Pre-Deploy Command: (leave empty for now)
```

### Step 5: Click "Create Web Service"

Wait 5-10 minutes for initial deployment.

## Database Setup

### Option 1: Render PostgreSQL (Recommended)

#### 1. Create PostgreSQL Instance

```bash
# In Render Dashboard:
# 1. Click "New +" → "PostgreSQL"
# 2. Configure:

Name: datifyy-postgres
Database: datifyy_prod
User: datifyy_user
Region: Same as backend (Oregon)
PostgreSQL Version: 15
Instance Type: Starter ($7/month)

# 3. Click "Create Database"
# 4. Wait 2-3 minutes for provisioning
```

#### 2. Get Connection Details

```bash
# In database dashboard, copy:

Internal Database URL:
postgres://datifyy_user:password@dpg-xxxxx/datifyy_prod

External Database URL (for migrations):
postgres://datifyy_user:password@dpg-xxxxx.oregon-postgres.render.com/datifyy_prod

Connection Details:
Host: dpg-xxxxx.oregon-postgres.render.com
Port: 5432
Database: datifyy_prod
Username: datifyy_user
Password: [auto-generated]
```

#### 3. Run Migrations

```bash
# Install psql locally if not present
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql-client

# Set database URL
export DATABASE_URL="postgres://datifyy_user:password@dpg-xxxxx.oregon-postgres.render.com/datifyy_prod?sslmode=require"

# Test connection
psql $DATABASE_URL -c "SELECT version();"

# Run migrations in order
cd /Users/rahulrana/repo/datifyy_monorepo_v2/apps/backend/migrations

psql $DATABASE_URL -f 001_initial_schema.sql
psql $DATABASE_URL -f 002_add_auth_fields.sql
psql $DATABASE_URL -f 003_seed_data.sql
psql $DATABASE_URL -f 004_add_user_features.sql
psql $DATABASE_URL -f 005_expand_partner_preferences.sql

# Verify migrations
psql $DATABASE_URL -c "\dt"

# Should show all tables:
# - users
# - partner_preferences
# - interests
# - availability_slots
# - etc.
```

### Option 2: Supabase (Alternative)

```bash
# 1. Go to: https://supabase.com/dashboard
# 2. Create new project:
#    - Name: Datifyy Production
#    - Database Password: [generate strong password]
#    - Region: Closest to your users

# 3. Get connection string:
# Go to: Settings → Database → Connection String
# Copy "URI" format:
postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# 4. Run migrations (same as Render PostgreSQL above)
```

### Database Performance Settings

```sql
-- Connect to database
psql $DATABASE_URL

-- Optimize for production
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET work_mem = '16MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';

-- Restart database (on Render: Dashboard → Suspend → Resume)
```

## Redis Setup

### Option 1: Upstash Redis (Recommended - Free Tier)

```bash
# 1. Go to: https://console.upstash.com
# 2. Create account / Login
# 3. Click "Create Database"
# 4. Configure:

Name: datifyy-cache
Type: Regional
Region: US-West-1 (or closest to backend)
TLS: Enabled

# 5. Click "Create"
# 6. Copy connection details:

REDIS_URL: redis://default:[password]@[endpoint]:6379
Endpoint: [endpoint].upstash.io
Port: 6379
Password: [auto-generated]
```

### Option 2: Redis Cloud (Alternative)

```bash
# 1. Go to: https://redis.com/try-free/
# 2. Sign up for free account
# 3. Create new subscription:
#    - Cloud: AWS
#    - Region: us-west-1
#    - Name: Datifyy Cache

# 4. Create database
# 5. Get connection URL:
# redis://default:[password]@[endpoint]:6379
```

### Test Redis Connection

```bash
# Install redis-cli
# macOS: brew install redis
# Ubuntu: sudo apt-get install redis-tools

# Test connection
redis-cli -u "redis://default:[password]@[endpoint]:6379" ping
# Should output: PONG

# Test set/get
redis-cli -u $REDIS_URL SET test "Hello"
redis-cli -u $REDIS_URL GET test
# Should output: "Hello"
```

## Environment Configuration

### Required Environment Variables

Go to: Render Dashboard → Your Backend Service → "Environment"

Add these variables:

```bash
# Application
ENV=production
PORT=8080

# Database (from Render PostgreSQL or Supabase)
DATABASE_URL=postgres://user:password@host:5432/dbname?sslmode=require
DB_HOST=dpg-xxxxx.oregon-postgres.render.com
DB_PORT=5432
DB_USER=datifyy_user
DB_PASSWORD=[your-db-password]
DB_NAME=datifyy_prod

# Redis (from Upstash or Redis Cloud)
REDIS_URL=redis://default:[password]@endpoint:6379
REDIS_HOST=[endpoint].upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=[your-redis-password]

# AI Services
GEMINI_API_KEY=AIzaSyC53mtEboE2xnrL5xd2KZeUYR1cATvmk60

# Security
JWT_SECRET=[generate-strong-32-char-secret]
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://www.yourdomain.com

# Optional: Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=[your-sendgrid-key]
```

### Generate Secure Secrets

```bash
# Generate JWT_SECRET (32 characters minimum)
openssl rand -base64 32

# Or
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Example output:
# vK8p2Xn4Qm9Rw6Yt7Zu1Av3Bx5Cy8Dz0E
```

### Environment Variable Best Practices

```bash
# 1. Never commit secrets to git
# 2. Use platform environment variables (not .env files in production)
# 3. Rotate secrets every 90 days
# 4. Use different secrets for dev/staging/production
# 5. Limit CORS origins to specific domains (no wildcards)
```

## Build Configuration

### Create Render Configuration File

Create `apps/backend/render.yaml`:

```yaml
services:
  - type: web
    name: datifyy-backend
    env: go
    buildCommand: go build -o server ./cmd/server
    startCommand: ./server
    healthCheckPath: /health
    autoDeploy: true
    envVars:
      - key: ENV
        value: production
      - key: PORT
        value: 8080
      - key: DATABASE_URL
        fromDatabase:
          name: datifyy-postgres
          property: connectionString
      - key: REDIS_URL
        sync: false
      - key: GEMINI_API_KEY
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: CORS_ALLOWED_ORIGINS
        sync: false

databases:
  - name: datifyy-postgres
    databaseName: datifyy_prod
    user: datifyy_user
    plan: starter
```

### Optimize Build

Create `apps/backend/.dockerignore`:

```
.git
.github
*.md
*.log
tmp/
.env*
*.test
coverage.txt
```

### Production Build Settings

```bash
# Optimize Go build for production
# Render automatically uses: go build

# For manual deployment:
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
  -ldflags="-w -s" \
  -o server \
  ./cmd/server

# Flags:
# -ldflags="-w -s": Strip debug info (smaller binary)
# CGO_ENABLED=0: Static binary
# GOOS=linux: Linux binary
```

## Health Checks

### Implement Health Endpoint

Verify this exists in `cmd/server/main.go`:

```go
// Health check endpoint
mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]interface{}{
        "status": "ok",
        "timestamp": time.Now().Format(time.RFC3339),
        "version": "1.0.0",
    })
})

// Database health check
mux.HandleFunc("/health/db", func(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
    defer cancel()

    if err := db.PingContext(ctx); err != nil {
        w.WriteHeader(http.StatusServiceUnavailable)
        json.NewEncoder(w).Encode(map[string]string{
            "status": "error",
            "error": err.Error(),
        })
        return
    }

    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
})

// Redis health check
mux.HandleFunc("/health/redis", func(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
    defer cancel()

    if err := redisClient.Ping(ctx).Err(); err != nil {
        w.WriteHeader(http.StatusServiceUnavailable)
        json.NewEncoder(w).Encode(map[string]string{
            "status": "error",
            "error": err.Error(),
        })
        return
    }

    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
})
```

### Test Health Checks

```bash
# After deployment, test endpoints:

# Main health check
curl https://datifyy-backend.onrender.com/health
# Expected: {"status":"ok","timestamp":"2025-11-23T12:00:00Z","version":"1.0.0"}

# Database health
curl https://datifyy-backend.onrender.com/health/db
# Expected: {"status":"ok"}

# Redis health
curl https://datifyy-backend.onrender.com/health/redis
# Expected: {"status":"ok"}
```

## Debugging

### View Logs

```bash
# In Render Dashboard:
# 1. Go to your backend service
# 2. Click "Logs" tab
# 3. Logs auto-update in real-time

# Filter logs:
# - Search box: Filter by keyword
# - Time range: Last hour / 6 hours / 24 hours

# Common log patterns to search:
# - "error"
# - "panic"
# - "failed"
# - "connection refused"
```

### Enable Debug Logging (Temporarily)

```bash
# Add environment variable
LOG_LEVEL=debug

# Redeploy
# View detailed logs in Logs tab

# After debugging, remove or set to:
LOG_LEVEL=info
```

### SSH into Container (Render)

```bash
# Render doesn't provide SSH access
# Use logs and health checks for debugging

# Alternative: Add debug endpoints (temporarily)
# In main.go:
mux.HandleFunc("/debug/vars", func(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]interface{}{
        "env": os.Getenv("ENV"),
        "db_host": os.Getenv("DB_HOST"),
        "redis_host": os.Getenv("REDIS_HOST"),
        // Don't expose secrets!
    })
})

# Call endpoint:
curl https://datifyy-backend.onrender.com/debug/vars

# REMOVE before production!
```

### Test Database Connection

```bash
# From local machine, test production database
export DATABASE_URL="[your-production-db-url]"

# Test connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"

# Check active connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Check table sizes
psql $DATABASE_URL -c "
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

### Monitor API Performance

```bash
# Test API endpoints
curl -w "@curl-format.txt" -o /dev/null -s https://datifyy-backend.onrender.com/api/v1/users

# Create curl-format.txt:
cat > curl-format.txt <<EOF
    time_namelookup:  %{time_namelookup}s\n
       time_connect:  %{time_connect}s\n
    time_appconnect:  %{time_appconnect}s\n
   time_pretransfer:  %{time_pretransfer}s\n
      time_redirect:  %{time_redirect}s\n
 time_starttransfer:  %{time_starttransfer}s\n
                    ----------\n
         time_total:  %{time_total}s\n
EOF

# Output example:
#     time_namelookup:  0.002s
#        time_connect:  0.045s
#     time_appconnect:  0.167s
#    time_pretransfer:  0.167s
#       time_redirect:  0.000s
#  time_starttransfer:  0.298s
#                     ----------
#          time_total:  0.298s
```

## Troubleshooting

### Issue 1: Build Fails

**Symptom**: Deployment fails with build error

**Common Causes**:
```bash
# 1. Go version mismatch
# Solution: Check go.mod version matches Render's Go version

# 2. Missing dependencies
# Solution: Ensure go.mod and go.sum are committed
git add go.mod go.sum
git commit -m "Update dependencies"
git push

# 3. Import path issues
# Solution: Verify module path in go.mod
module github.com/datifyy/backend  # Should match your repo
```

**Debug**:
```bash
# Build locally to identify issue
cd apps/backend
go mod download
go build -o server ./cmd/server

# Check for errors
# Fix errors, then commit and push
```

### Issue 2: Database Connection Fails

**Symptom**: Logs show `connection refused` or `no pg_hba.conf entry`

**Solutions**:
```bash
# 1. Verify DATABASE_URL format
# Should include: ?sslmode=require for production
postgres://user:password@host:5432/dbname?sslmode=require

# 2. Check database is running
# Render Dashboard → PostgreSQL → Should show "Available"

# 3. Test from local machine
psql $DATABASE_URL -c "SELECT 1;"

# 4. Check firewall/IP whitelist
# Render PostgreSQL allows all IPs by default
# If using Supabase, check IP restrictions

# 5. Verify credentials
# Check DB_USER, DB_PASSWORD match database settings
```

### Issue 3: Redis Connection Fails

**Symptom**: Logs show `redis: connection refused`

**Solutions**:
```bash
# 1. Verify REDIS_URL format
# Upstash: redis://default:[password]@[endpoint]:6379
# Include password!

# 2. Test connection
redis-cli -u $REDIS_URL ping

# 3. Check TLS requirement
# Upstash requires TLS, ensure Go client uses TLS:
// In code:
opt, err := redis.ParseURL(os.Getenv("REDIS_URL"))
opt.TLSConfig = &tls.Config{
    MinVersion: tls.VersionTLS12,
}
redisClient := redis.NewClient(opt)

# 4. Check Upstash dashboard
# Ensure database is Active
```

### Issue 4: AI API Failures

**Symptom**: 500 errors on AI endpoints

**Solutions**:
```bash
# 1. Verify GEMINI_API_KEY is set
# Render Dashboard → Environment → Check variable exists

# 2. Test API key
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}'

# 3. Check quota
# Google Cloud Console → Generative Language API → Quotas
# Ensure you haven't hit rate limits

# 4. Check error logs
# Render Logs → Search for "gemini" or "AI"
```

### Issue 5: CORS Errors from Frontend

**Symptom**: Frontend can't connect, CORS errors in browser

**Solutions**:
```bash
# 1. Add frontend URL to CORS_ALLOWED_ORIGINS
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,https://www.yourdomain.com

# 2. Verify CORS middleware in code
// In main.go:
corsMiddleware := cors.New(cors.Config{
    AllowOrigins:     strings.Split(os.Getenv("CORS_ALLOWED_ORIGINS"), ","),
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
    AllowCredentials: true,
})

# 3. Test CORS
curl -H "Origin: https://your-app.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://datifyy-backend.onrender.com/api/v1/users -v

# Should return:
# Access-Control-Allow-Origin: https://your-app.vercel.app
```

### Issue 6: Slow Performance

**Symptoms**: API responses take >1 second

**Solutions**:
```bash
# 1. Enable connection pooling
// In database connection:
db.SetMaxOpenConns(25)
db.SetMaxIdleConns(25)
db.SetConnMaxLifetime(5 * time.Minute)

# 2. Add database indexes
psql $DATABASE_URL -c "
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_users_status ON users(account_status);
CREATE INDEX CONCURRENTLY idx_availability_user ON availability_slots(user_id);
"

# 3. Enable Redis caching
# Cache frequently accessed data
# Set TTL: 5 minutes for user profiles, 1 minute for availability

# 4. Upgrade instance
# Render: Starter → Standard (2GB RAM, 1 CPU)

# 5. Check slow queries
psql $DATABASE_URL -c "
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
"
```

### Issue 7: Out of Memory

**Symptom**: Service crashes, logs show OOM

**Solutions**:
```bash
# 1. Upgrade instance size
# Render Dashboard → Settings → Instance Type → Standard

# 2. Optimize memory usage
// Add to main.go:
import "runtime/debug"
debug.SetGCPercent(50)  // More aggressive GC

# 3. Check for memory leaks
// Add heap profiling endpoint (development only!)
import _ "net/http/pprof"
// Visit: https://your-backend.onrender.com/debug/pprof/heap

# 4. Limit concurrent requests
// Add rate limiting middleware
```

## Scaling

### Horizontal Scaling

```bash
# Render Dashboard → Your Service → Settings

# Scaling Options:
# 1. Auto-scaling (Pro plan)
#    - Min instances: 1
#    - Max instances: 3
#    - Scale metric: CPU > 70%

# 2. Manual scaling (All plans)
#    - Increase instance count: 1 → 2 → 3
#    - Load balancer automatically distributes requests

# 3. Upgrade instance type
#    - Starter (512MB) → Standard (2GB) → Pro (4GB)
```

### Database Scaling

```bash
# 1. Connection pooling (already implemented)
db.SetMaxOpenConns(25)

# 2. Read replicas (Render Pro plan)
# Dashboard → PostgreSQL → Add Read Replica

# 3. Upgrade database instance
# Starter → Standard → Pro

# 4. Database optimization
psql $DATABASE_URL -c "VACUUM ANALYZE;"
psql $DATABASE_URL -c "REINDEX DATABASE datifyy_prod;"
```

### Caching Strategy

```go
// Implement multi-level caching

// 1. Redis for shared cache (all instances)
redisClient.Set(ctx, "user:123", userData, 5*time.Minute)

// 2. In-memory cache for hot data
var userCache = make(map[string]User)

// 3. Cache invalidation on updates
func updateUser(userID string) {
    // Update database
    db.Exec(...)

    // Invalidate cache
    redisClient.Del(ctx, "user:"+userID)
    delete(userCache, userID)
}
```

## Monitoring & Alerts

### Set Up Uptime Monitoring

```bash
# Use UptimeRobot (free):
# 1. Go to: https://uptimerobot.com
# 2. Add monitor:
#    - Type: HTTP(s)
#    - URL: https://datifyy-backend.onrender.com/health
#    - Interval: 5 minutes
#    - Alert: Email after 2 failures

# 3. Add database monitor:
#    - URL: https://datifyy-backend.onrender.com/health/db
```

### Application Performance Monitoring (APM)

```bash
# Option 1: New Relic (free tier)
# 1. Sign up: https://newrelic.com
# 2. Install agent:
go get github.com/newrelic/go-agent/v3/newrelic

# 3. Add to main.go:
app, _ := newrelic.NewApplication(
    newrelic.ConfigAppName("Datifyy Backend"),
    newrelic.ConfigLicense(os.Getenv("NEW_RELIC_LICENSE_KEY")),
)

# Option 2: Sentry
# 1. Sign up: https://sentry.io
# 2. Install SDK:
go get github.com/getsentry/sentry-go

# 3. Initialize:
sentry.Init(sentry.ClientOptions{
    Dsn: os.Getenv("SENTRY_DSN"),
    Environment: "production",
})
```

## Rollback Procedure

```bash
# Render Dashboard → Your Service → Events

# Find previous deployment:
# 1. Click on successful deployment
# 2. Click "Rollback to this version"
# 3. Confirm rollback

# Alternative: Git revert
git revert HEAD
git push origin main
# Render auto-deploys the reverted version
```

## Backup & Recovery

### Database Backups

```bash
# Render PostgreSQL: Automatic daily backups (retained 7 days)

# Manual backup:
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backups (cron):
# Create backup script:
cat > backup.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/backup_$DATE.sql.gz
# Keep last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
EOF

chmod +x backup.sh

# Add to crontab (daily at 2 AM):
0 2 * * * /path/to/backup.sh
```

### Restore from Backup

```bash
# Stop backend (prevent new writes)
# Render Dashboard → Suspend Service

# Restore database
gunzip -c backup_20251123_020000.sql.gz | psql $DATABASE_URL

# Or from plain SQL:
psql $DATABASE_URL < backup_20251123_020000.sql

# Resume backend
# Render Dashboard → Resume Service
```

## Checklist: Before Going Live

- [ ] Database deployed and migrations run
- [ ] Redis deployed and tested
- [ ] All environment variables configured
- [ ] JWT_SECRET generated (32+ characters)
- [ ] CORS_ALLOWED_ORIGINS set to frontend URL
- [ ] Gemini API key tested
- [ ] Health endpoints returning 200
- [ ] Database backups enabled
- [ ] Monitoring/uptime checks configured
- [ ] Test all API endpoints
- [ ] Load testing performed
- [ ] Error tracking configured (Sentry)
- [ ] Logs reviewed for errors
- [ ] SSL certificate verified
- [ ] Performance optimized (indexes, caching)
- [ ] Security reviewed (no secrets in code)

## Next Steps

1. ✅ Deploy database and Redis
2. ✅ Configure environment variables
3. ✅ Deploy backend to Render
4. ✅ Run database migrations
5. ✅ Test health endpoints
6. ✅ Update frontend with backend URL
7. ✅ Set up monitoring
8. ✅ Go live! 🚀

## Support

- **Render Docs**: https://render.com/docs
- **Render Support**: support@render.com
- **Backend Issues**: Check logs first, then GitHub issues
- **Database Issues**: Verify connection string and SSL mode
