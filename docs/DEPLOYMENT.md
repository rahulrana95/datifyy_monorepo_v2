# Datifyy Deployment Guide

Complete guide for deploying the Datifyy dating platform to production.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Production Checklist](#production-checklist)
5. [Quick Start](#quick-start)
6. [Deployment Options](#deployment-options)
7. [Post-Deployment](#post-deployment)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)

## Overview

Datifyy is a full-stack dating platform with:
- **Frontend**: React application (TypeScript)
- **Backend**: Go server with HTTP/REST and gRPC APIs
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **AI**: Google Gemini API integration

## Architecture

```
┌─────────────┐         ┌─────────────┐
│   Frontend  │────────▶│   Backend   │
│   (React)   │         │    (Go)     │
│  Port 3000  │         │  Port 8080  │
└─────────────┘         └──────┬──────┘
                               │
                    ┌──────────┼──────────┐
                    │          │          │
              ┌─────▼────┐ ┌──▼────┐ ┌──▼──────┐
              │PostgreSQL│ │ Redis │ │ Gemini  │
              │   5432   │ │ 6379  │ │   AI    │
              └──────────┘ └───────┘ └─────────┘
```

## Prerequisites

### Required Accounts

1. **Render.com** (for backend) or **Railway.app** / **Fly.io** as alternatives
2. **Vercel** (for frontend, recommended) or **Render** / **Netlify**
3. **Render PostgreSQL** or **Supabase** / **Neon** for database
4. **Upstash Redis** or **Redis Cloud** for caching
5. **Google Cloud Console** for Gemini API key

### Required Tools (Local)

```bash
# Install if not present
node --version    # v16+ required
npm --version     # v8+ required
go version        # 1.24+ required
git --version     # Any recent version
psql --version    # PostgreSQL client (optional but helpful)
```

## Production Checklist

Before deploying, ensure you have:

### 1. Environment Variables

Create a secure `.env.production` file with:

```bash
# Backend Environment Variables
ENV=production
PORT=8080

# Database (from your PostgreSQL provider)
DATABASE_URL=postgres://user:password@host:5432/dbname?sslmode=require
DB_HOST=your-db-host.com
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_secure_password
DB_NAME=datifyy_prod

# Redis (from your Redis provider)
REDIS_URL=redis://user:password@host:6379
REDIS_HOST=your-redis-host.com
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# AI Services
GEMINI_API_KEY=your_production_gemini_api_key

# Security
JWT_SECRET=generate_a_strong_random_secret_here_min_32_chars
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com

# Optional: Email service (if using)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

```bash
# Frontend Environment Variables
REACT_APP_API_URL=https://your-backend-domain.onrender.com
REACT_APP_ENV=production
```

### 2. Security Checklist

- [ ] Change all default passwords
- [ ] Generate strong JWT secret (min 32 characters)
- [ ] Enable SSL/TLS for database connections
- [ ] Set up CORS with specific allowed origins (no wildcards)
- [ ] Remove development API keys
- [ ] Enable rate limiting on API endpoints
- [ ] Set secure cookie flags (httpOnly, secure, sameSite)
- [ ] Review and remove debug logging in production
- [ ] Enable database connection pooling
- [ ] Set up database backups (automated)

### 3. Database Preparation

- [ ] Run all migrations (see [DATABASE_MIGRATIONS.md](./DATABASE_MIGRATIONS.md))
- [ ] Set up database backups
- [ ] Configure connection pooling (recommended: max 20 connections)
- [ ] Create database indexes for performance
- [ ] Remove test/seed data if present

### 4. Performance Optimization

- [ ] Enable Redis caching
- [ ] Set up CDN for static assets (Vercel does this automatically)
- [ ] Configure proper cache headers
- [ ] Enable gzip/brotli compression
- [ ] Optimize database queries (check slow query log)
- [ ] Set up connection pooling

### 5. Monitoring & Logging

- [ ] Set up error tracking (Sentry, Rollbar, etc.)
- [ ] Configure application logging
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Enable database query monitoring
- [ ] Configure alerts for critical errors

## Quick Start

### Option 1: Vercel (Frontend) + Render (Backend)

This is the **recommended** approach for beginners.

```bash
# 1. Deploy Database (Render PostgreSQL)
# Go to: https://dashboard.render.com → New → PostgreSQL
# Copy the External Database URL

# 2. Deploy Redis (Upstash)
# Go to: https://console.upstash.com → Create Database
# Copy the REDIS_URL

# 3. Deploy Backend (Render)
# Go to: https://dashboard.render.com → New → Web Service
# Connect your GitHub repo
# Set environment variables
# Deploy

# 4. Deploy Frontend (Vercel)
# Go to: https://vercel.com/new
# Import your GitHub repo
# Set REACT_APP_API_URL to your backend URL
# Deploy
```

### Option 2: All on Render

Deploy everything on Render.com:

```bash
# 1. Database → Render PostgreSQL
# 2. Redis → Render Redis (if available) or Upstash
# 3. Backend → Render Web Service
# 4. Frontend → Render Static Site
```

## Deployment Options

Choose your deployment platform:

1. **[Frontend Deployment](./FRONTEND_DEPLOYMENT.md)**
   - Vercel (Recommended)
   - Render
   - Netlify

2. **[Backend Deployment](./BACKEND_DEPLOYMENT.md)**
   - Render (Recommended)
   - Railway
   - Fly.io

3. **[Database Migrations](./DATABASE_MIGRATIONS.md)**
   - How to apply migrations
   - How to create new migrations
   - Rollback procedures

## Post-Deployment

### 1. Verify Deployment

```bash
# Test backend health
curl https://your-backend.onrender.com/health

# Expected response:
# {"status":"ok","timestamp":"2025-11-23T12:00:00Z"}

# Test frontend
curl https://your-app.vercel.app

# Should return HTML
```

### 2. Run Database Migrations

```bash
# Connect to production database
psql $DATABASE_URL

# Run migrations
\i apps/backend/migrations/001_initial_schema.sql
\i apps/backend/migrations/002_add_auth_fields.sql
\i apps/backend/migrations/003_seed_data.sql
\i apps/backend/migrations/004_add_user_features.sql
\i apps/backend/migrations/005_expand_partner_preferences.sql
```

### 3. Create Admin User

```bash
# SSH into backend or use SQL client
psql $DATABASE_URL

# Create admin user
INSERT INTO users (email, password_hash, role, account_status)
VALUES (
  'admin@yourdomain.com',
  -- Generate hash using bcrypt
  '$2a$10$yourhashedpassword',
  'ADMIN',
  'ACTIVE'
);
```

### 4. Test Critical Features

- [ ] User registration
- [ ] User login
- [ ] Profile creation
- [ ] Availability slot creation
- [ ] AI date curation
- [ ] Admin panel access

## Monitoring

### Application Metrics

1. **Backend Metrics**
   ```bash
   # Key metrics to monitor
   - Request latency (p50, p95, p99)
   - Error rate (4xx, 5xx)
   - Database connection pool usage
   - Redis hit/miss ratio
   - AI API call success rate
   ```

2. **Frontend Metrics**
   ```bash
   # Vercel automatically provides
   - Page load time
   - Core Web Vitals (LCP, FID, CLS)
   - Error tracking
   ```

### Set Up Alerts

1. **Uptime Monitoring**
   - Use UptimeRobot (free tier available)
   - Monitor: `/health` endpoint every 5 minutes
   - Alert on: 2 consecutive failures

2. **Error Tracking**
   ```bash
   # Recommended: Sentry
   # Go to: https://sentry.io
   # Install in both frontend and backend
   # Set SENTRY_DSN environment variable
   ```

### Logs

Access logs on your platform:

```bash
# Render
render logs -f your-service-name

# Vercel
vercel logs your-deployment-url --follow

# Direct database logs (if needed)
psql $DATABASE_URL -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

## Troubleshooting

### Common Issues

#### 1. Frontend can't connect to Backend

**Symptoms**: CORS errors, network errors in browser console

**Solutions**:
```bash
# Check CORS settings in backend
# Ensure CORS_ALLOWED_ORIGINS includes your frontend domain

# Verify REACT_APP_API_URL is correct
echo $REACT_APP_API_URL

# Test backend directly
curl https://your-backend.onrender.com/health
```

#### 2. Database Connection Fails

**Symptoms**: `connection refused`, `connection timeout`

**Solutions**:
```bash
# Verify DATABASE_URL format
# Should be: postgres://user:password@host:5432/dbname?sslmode=require

# Test connection manually
psql $DATABASE_URL

# Check database is accessible
pg_isready -d $DATABASE_URL

# Verify connection pool settings
# Max connections should be < database max_connections
```

#### 3. Redis Connection Issues

**Symptoms**: Cache misses, `connection refused`

**Solutions**:
```bash
# Verify REDIS_URL format
echo $REDIS_URL

# Test Redis connection
redis-cli -u $REDIS_URL ping
# Should return: PONG

# Check Redis is accepting connections
redis-cli -h your-redis-host -p 6379 -a your-password ping
```

#### 4. AI API Failures

**Symptoms**: 500 errors on `/api/v1/admin/curation/analyze`

**Solutions**:
```bash
# Verify GEMINI_API_KEY is set
echo $GEMINI_API_KEY

# Check Gemini quota
# Go to: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com

# Test API directly
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

#### 5. Build Failures

**Frontend build fails**:
```bash
# Check Node version
node --version  # Should be 16+

# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

**Backend build fails**:
```bash
# Check Go version
go version  # Should be 1.24+

# Clear module cache
go clean -modcache

# Download dependencies
go mod download

# Build
go build -o server ./cmd/server
```

#### 6. Migration Failures

**Symptoms**: Database schema mismatch, table not found

**Solutions**:
```bash
# Check which migrations have run
psql $DATABASE_URL -c "SELECT * FROM schema_migrations ORDER BY version;"

# Manually verify tables exist
psql $DATABASE_URL -c "\dt"

# Re-run specific migration
psql $DATABASE_URL -f apps/backend/migrations/XXX_migration_name.sql

# See DATABASE_MIGRATIONS.md for detailed guide
```

### Debug Mode

Enable debug logging temporarily:

```bash
# Backend - add environment variable
ENV=development
LOG_LEVEL=debug

# Check logs for detailed error messages
render logs -f your-service

# Frontend - check browser console
# Open DevTools → Console → Filter by 'error'
```

### Health Check Endpoints

```bash
# Backend health
curl https://your-backend.onrender.com/health

# Database health (via backend)
curl https://your-backend.onrender.com/api/v1/health/db

# Redis health (via backend)
curl https://your-backend.onrender.com/api/v1/health/redis
```

## Performance Optimization

### Database Optimization

```sql
-- Add indexes for frequently queried columns
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_users_account_status ON users(account_status);
CREATE INDEX CONCURRENTLY idx_availability_user_time ON availability_slots(user_id, start_time);
CREATE INDEX CONCURRENTLY idx_partner_prefs_user ON partner_preferences(user_id);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';

-- Enable query stats
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

### Caching Strategy

```go
// Implement caching in backend
// Cache user profiles for 5 minutes
// Cache availability slots for 1 minute
// Cache partner preferences for 10 minutes
```

### CDN Setup

Vercel automatically provides CDN. For Render:

```bash
# Use Cloudflare in front of Render
# Go to: cloudflare.com
# Add your domain
# Point DNS to Render
# Enable caching rules
```

## Backup Strategy

### Database Backups

```bash
# Render provides automatic backups
# Manual backup:
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup:
psql $DATABASE_URL < backup_file.sql

# Automated backups (recommended)
# Set up cron job or use Render's backup feature
```

### Redis Backups

```bash
# Redis persistence is enabled by default on Upstash
# Manual snapshot (if using self-hosted)
redis-cli -u $REDIS_URL BGSAVE
```

## Scaling

### Horizontal Scaling

```bash
# Render
# Go to: Dashboard → Your Service → Settings
# Increase number of instances: 1 → 3

# Configure load balancing (automatic on Render)
```

### Database Scaling

```bash
# Render PostgreSQL
# Upgrade plan for more CPU/RAM
# Enable read replicas for read-heavy workloads

# Connection pooling
# Set max connections: 20-50 per instance
```

## Security Best Practices

1. **Secrets Management**
   ```bash
   # Never commit secrets to git
   # Use platform environment variables
   # Rotate secrets regularly (every 90 days)
   ```

2. **Rate Limiting**
   ```go
   // Implement in backend
   // - 100 requests/minute per IP for API
   // - 10 requests/minute for auth endpoints
   ```

3. **SQL Injection Prevention**
   ```go
   // Always use parameterized queries
   db.QueryContext(ctx, "SELECT * FROM users WHERE email = $1", email)
   // Never use string concatenation
   ```

4. **CORS Configuration**
   ```go
   // Production CORS
   AllowedOrigins: []string{"https://yourdomain.com"}
   AllowCredentials: true
   ```

## Cost Estimation

### Monthly Costs (USD)

| Service | Provider | Tier | Cost |
|---------|----------|------|------|
| Frontend | Vercel | Free/Pro | $0-$20 |
| Backend | Render | Starter | $7 |
| Database | Render PostgreSQL | Starter | $7 |
| Redis | Upstash | Free | $0 |
| Gemini API | Google | Pay-as-go | $5-50 |
| **Total** | | | **$19-$84/mo** |

### Free Tier Option

- Frontend: Vercel Free
- Backend: Render Free (with 750 hours/month)
- Database: Neon Free (1GB storage)
- Redis: Upstash Free (10K commands/day)
- Gemini: $0.075 per 1M tokens

**Total**: ~$5-15/month (mainly Gemini usage)

## Support & Resources

- **Documentation**: `/docs` folder
- **Backend API**: [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md)
- **Frontend Guide**: [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md)
- **Postman Guide**: [POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md)
- **GitHub Issues**: Your repository issues page

## Next Steps

1. ✅ Review this deployment guide
2. ✅ Follow [FRONTEND_DEPLOYMENT.md](./FRONTEND_DEPLOYMENT.md)
3. ✅ Follow [BACKEND_DEPLOYMENT.md](./BACKEND_DEPLOYMENT.md)
4. ✅ Set up monitoring and alerts
5. ✅ Create backup strategy
6. ✅ Test all critical features
7. ✅ Go live! 🚀
