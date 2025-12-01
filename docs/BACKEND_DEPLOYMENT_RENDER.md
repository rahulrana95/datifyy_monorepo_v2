# Backend Deployment to Render.com - Step by Step Guide

**Platform**: Render.com
**Application**: Datifyy Go Backend
**Database**: PostgreSQL with datifyy_v2_ tables

---

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] GitHub account with repository access
- [ ] Render.com account (sign up at https://render.com)
- [ ] Backend code with datifyy_v2_ tables (✅ Already done!)
- [ ] All migrations ready in `apps/backend/migrations/`

---

## Part 1: Set Up Database on Render

### Step 1.1: Create PostgreSQL Database

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click **"New +"** button (top right)
   - Select **"PostgreSQL"**

2. **Configure Database**
   ```
   Name: datifyy-production-db
   Database: datifyy_prod
   User: datifyy_admin
   Region: Oregon (US West) or closest to you
   PostgreSQL Version: 15 (or latest)
   Instance Type: Free (for testing) or Starter ($7/month recommended)
   ```

3. **Click "Create Database"**
   - Wait 2-3 minutes for provisioning
   - Database will show "Available" when ready

4. **Copy Database Credentials**

   After creation, you'll see:
   ```
   Internal Database URL: postgres://user:pass@hostname/dbname
   External Database URL: postgres://user:pass@hostname:5432/dbname
   ```

   **IMPORTANT**: Copy the **Internal Database URL** - you'll need it!

   Example format:
   ```
   postgres://datifyy_admin:AbCd1234XyZ@dpg-xxxxx-a.oregon-postgres.render.com/datifyy_prod
   ```

5. **Save Credentials**
   Create a file `render-credentials.txt` locally:
   ```
   DATABASE_URL=<paste your Internal Database URL here>
   ```

---

### Step 1.2: Run Database Migrations

**Option A: Using Render Shell (Recommended)**

1. In Render Dashboard, click on your database
2. Click **"Connect"** tab
3. Copy the **PSQL Command**
4. Open your terminal and run:

```bash
# Connect to Render database
psql <paste the PSQL command here>

# You should see: datifyy_prod=>
```

5. Run each migration file:

```bash
# In psql, run migrations one by one
\i /local/path/to/apps/backend/migrations/001_initial_schema.sql
\i /local/path/to/apps/backend/migrations/002_add_auth_fields.sql
\i /local/path/to/apps/backend/migrations/003_seed_data.sql
\i /local/path/to/apps/backend/migrations/004_add_user_features.sql
\i /local/path/to/apps/backend/migrations/005_expand_partner_preferences.sql
\i /local/path/to/apps/backend/migrations/006_add_availability_slots.sql
\i /local/path/to/apps/backend/migrations/007_add_admin_and_dates.sql
\i /local/path/to/apps/backend/migrations/008_add_curated_matches.sql
```

**Option B: Using Local Connection**

```bash
# From your project root
cd apps/backend

# Set the DATABASE_URL environment variable
export DATABASE_URL="<your Internal Database URL from Render>"

# Run migrations
for migration in migrations/*.sql; do
  echo "Running $migration..."
  psql $DATABASE_URL -f "$migration"
done
```

6. **Verify Tables Created**

```sql
-- In psql
\dt

-- You should see all 18 datifyy_v2_* tables
SELECT COUNT(*) FROM pg_tables WHERE tablename LIKE 'datifyy_v2_%';
-- Should return: 18
```

---

## Part 2: Set Up Redis on Render (or Upstash)

### Option A: Upstash Redis (Recommended - Free Tier Available)

1. **Go to Upstash**
   - Visit: https://console.upstash.com
   - Sign up/Login with GitHub

2. **Create Redis Database**
   ```
   Name: datifyy-prod-redis
   Type: Regional
   Region: Same as your Render database region
   TLS: Enabled
   ```

3. **Copy Redis URL**
   - Click on your database
   - Copy the **"UPSTASH_REDIS_REST_URL"** or connection string
   - Format: `redis://default:xxxxx@hostname:port`

4. **Save Redis URL**
   Add to your `render-credentials.txt`:
   ```
   REDIS_URL=<paste Redis URL here>
   ```

### Option B: Render Redis (Paid - $7/month minimum)

1. In Render Dashboard → **"New +"** → **"Redis"**
2. Configure and create
3. Copy the Redis URL

---

## Part 3: Prepare Backend for Deployment

### Step 3.1: Create Render Configuration File

Create `apps/backend/render.yaml`:

```yaml
services:
  - type: web
    name: datifyy-backend
    runtime: go
    region: oregon
    plan: starter  # or free
    buildCommand: go build -o bin/server ./cmd/server
    startCommand: ./bin/server
    rootDir: apps/backend
    envVars:
      - key: PORT
        value: 8080
      - key: ENV
        value: production
      - key: DATABASE_URL
        sync: false  # Will set manually
      - key: REDIS_URL
        sync: false  # Will set manually
      - key: GEMINI_API_KEY
        sync: false  # Will set manually
      - key: CORS_ALLOWED_ORIGINS
        value: https://your-frontend-url.vercel.app
    healthCheckPath: /health
```

### Step 3.2: Update Go Module (if needed)

```bash
cd apps/backend

# Ensure go.mod is up to date
go mod tidy

# Commit if needed
git add go.mod go.sum
git commit -m "Update Go modules for production"
```

### Step 3.3: Add Health Check Endpoint

Verify your health endpoint exists in `cmd/server/main.go`:

```go
// Should have this endpoint
http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{
        "status": "ok",
        "timestamp": time.Now().Format(time.RFC3339),
    })
})
```

If not present, let me know and I'll add it.

---

## Part 4: Deploy to Render

### Step 4.1: Push Code to GitHub

```bash
# From project root
git status

# Add any uncommitted changes
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### Step 4.2: Create Web Service on Render

1. **Go to Render Dashboard**
   - Click **"New +"** → **"Web Service"**

2. **Connect Repository**
   - Click **"Connect Account"** for GitHub
   - Authorize Render to access your repositories
   - Find and select `datifyy_monorepo_v2`

3. **Configure Service**

   Fill in these settings:

   ```
   Name: datifyy-backend
   Region: Oregon (US West) - Same as database
   Branch: main
   Root Directory: apps/backend
   Runtime: Go
   Build Command: go build -o bin/server ./cmd/server
   Start Command: ./bin/server
   Instance Type: Free (for testing) or Starter ($7/month)
   ```

4. **Click "Advanced"** to add environment variables

---

### Step 4.3: Add Environment Variables

Click **"Add Environment Variable"** and add each of these:

| Key | Value | Notes |
|-----|-------|-------|
| `PORT` | `8080` | Port the server listens on |
| `ENV` | `production` | Environment mode |
| `DATABASE_URL` | `<Your Render PostgreSQL Internal URL>` | From Step 1.1 |
| `REDIS_URL` | `<Your Redis URL>` | From Step 2 |
| `GEMINI_API_KEY` | `AIzaSyC53mtEboE2xnrL5xd2KZeUYR1cATvmk60` | Or your production key |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` | Your frontend URL (add after frontend deployment) |

**IMPORTANT NOTES:**
- For `DATABASE_URL`: Use the **Internal Database URL** (not External)
- For `CORS_ALLOWED_ORIGINS`: You can add multiple origins separated by commas
- Don't include trailing slashes in URLs

### Step 4.4: Deploy!

1. Click **"Create Web Service"**
2. Render will start building your application
3. You'll see build logs in real-time

**Build Process (2-5 minutes):**
```
==> Downloading cache...
==> Detected Go app
==> Installing Go 1.21.x
==> Running 'go build -o bin/server ./cmd/server'
==> Build successful!
==> Starting service...
```

4. **Wait for "Live" Status**
   - Service will show **"Live"** when ready
   - You'll get a URL like: `https://datifyy-backend.onrender.com`

---

## Part 5: Verify Deployment

### Step 5.1: Test Health Endpoint

```bash
# Test the health check
curl https://datifyy-backend.onrender.com/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-12-01T..."
}
```

### Step 5.2: Test Database Connection

Check the logs in Render Dashboard:
- Click on your service
- Go to **"Logs"** tab
- Look for successful database connection messages

### Step 5.3: Test API Endpoint

```bash
# Test a simple API endpoint (adjust based on your API)
curl https://datifyy-backend.onrender.com/api/v1/health/db

# Or try accessing from browser:
https://datifyy-backend.onrender.com/health
```

---

## Part 6: Production Checklist

### Security & Performance

- [ ] **Environment Variables Set Correctly**
  ```bash
  # In Render Dashboard → Your Service → Environment
  # Verify all variables are present and correct
  ```

- [ ] **CORS Configuration**
  ```bash
  # After frontend deployment, update CORS_ALLOWED_ORIGINS
  # Render Dashboard → Environment → Edit CORS_ALLOWED_ORIGINS
  CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://datifyy.com
  ```

- [ ] **Database Connection Pool**
  - Check your database connection settings
  - Render Free tier: Max 10 connections
  - Starter tier: Max 20 connections

- [ ] **Health Checks Working**
  ```bash
  curl https://datifyy-backend.onrender.com/health
  ```

- [ ] **Seed Data Present**
  ```sql
  -- Connect to database and verify
  SELECT COUNT(*) FROM datifyy_v2_users;
  -- Should return: 11

  SELECT COUNT(*) FROM datifyy_v2_admin_users;
  -- Should return: 2
  ```

---

## Part 7: Common Issues & Solutions

### Issue 1: Build Fails - "Go Version Not Found"

**Error:**
```
Error: Go version not found
```

**Solution:**
Add `go.mod` file in `apps/backend/` root:
```bash
cd apps/backend
go mod init github.com/datifyy/backend
go mod tidy
git add go.mod go.sum
git commit -m "Add go.mod"
git push
```

Then redeploy on Render.

---

### Issue 2: Database Connection Refused

**Error in logs:**
```
pq: connection refused
```

**Solutions:**

1. **Check DATABASE_URL format**
   - Must be **Internal Database URL** (not External)
   - Format: `postgres://user:pass@internal-host/dbname`
   - Do NOT include port (Render handles this internally)

2. **Verify Database is Running**
   - Render Dashboard → Your Database → Should show "Available"

3. **Check SSL Mode**
   - Add `?sslmode=require` to DATABASE_URL:
   ```
   postgres://user:pass@host/dbname?sslmode=require
   ```

---

### Issue 3: Redis Connection Failed

**Error:**
```
redis: connection refused
```

**Solution:**
1. Verify REDIS_URL is correct
2. Check Redis is running (Upstash console or Render dashboard)
3. Test Redis connection:
   ```bash
   # Use redis-cli
   redis-cli -u $REDIS_URL ping
   # Should return: PONG
   ```

---

### Issue 4: CORS Errors from Frontend

**Error in frontend:**
```
Access-Control-Allow-Origin error
```

**Solution:**
1. Update `CORS_ALLOWED_ORIGINS` environment variable in Render
2. Add your frontend URL:
   ```
   https://your-frontend.vercel.app
   ```
3. Redeploy backend (or wait for auto-deploy)

---

### Issue 5: Service Keeps Crashing

**Check logs:**
```
Render Dashboard → Your Service → Logs
```

**Common causes:**
1. Missing environment variable
2. Database migration not run
3. Port mismatch (ensure PORT=8080)
4. Panic in Go code

**Debug steps:**
```bash
# Check recent logs
Render Dashboard → Logs → Filter by "error"

# Verify environment variables
Render Dashboard → Environment → Check all vars present
```

---

### Issue 6: Build Succeeds but Service Won't Start

**Check:**
1. Start command is correct: `./bin/server`
2. Build command output is `bin/server`
3. Health check path is `/health`

**Fix:**
```
Render Dashboard → Settings →
Build Command: go build -o bin/server ./cmd/server
Start Command: ./bin/server
```

---

## Part 8: Post-Deployment

### Enable Auto-Deploy

1. Render Dashboard → Your Service → Settings
2. Scroll to **"Build & Deploy"**
3. Enable **"Auto-Deploy: Yes"**
4. Now every push to `main` will auto-deploy!

### Set Up Monitoring

1. **Render Metrics** (Built-in)
   - Dashboard → Your Service → Metrics
   - Monitor CPU, Memory, Request rate

2. **Set Up Alerts**
   - Dashboard → Your Service → Settings → Notifications
   - Add email/Slack webhook for alerts

### Custom Domain (Optional)

1. Render Dashboard → Your Service → Settings
2. Scroll to **"Custom Domain"**
3. Add your domain: `api.datifyy.com`
4. Update DNS:
   ```
   Type: CNAME
   Name: api
   Value: datifyy-backend.onrender.com
   ```

---

## Summary Checklist

Before going live:

- [ ] PostgreSQL database created on Render
- [ ] All 18 tables created with datifyy_v2_ prefix
- [ ] Seed data loaded (11 users, 2 admins)
- [ ] Redis setup (Upstash or Render)
- [ ] Environment variables configured
- [ ] Backend deployed to Render
- [ ] Health check returns 200 OK
- [ ] Database connection working
- [ ] CORS configured for frontend
- [ ] Auto-deploy enabled
- [ ] Monitoring set up

---

## Quick Reference

### Important URLs

```bash
# Your backend API
https://datifyy-backend.onrender.com

# Health check
https://datifyy-backend.onrender.com/health

# Render Dashboard
https://dashboard.render.com

# Database connection
<Use Internal Database URL from Render>
```

### Environment Variables Template

```bash
PORT=8080
ENV=production
DATABASE_URL=postgres://user:pass@internal-host/dbname?sslmode=require
REDIS_URL=redis://default:pass@host:port
GEMINI_API_KEY=your_gemini_api_key
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

---

## Next Steps

After backend deployment:

1. ✅ Test all API endpoints
2. ✅ Deploy frontend to Vercel (see FRONTEND_DEPLOYMENT.md)
3. ✅ Update frontend `REACT_APP_API_URL` to backend URL
4. ✅ Update backend `CORS_ALLOWED_ORIGINS` with frontend URL
5. ✅ Test end-to-end flow
6. 🚀 Go live!

---

## Need Help?

If you encounter any issues:

1. **Check Render Logs**
   - Dashboard → Your Service → Logs

2. **Verify Environment Variables**
   - Dashboard → Environment → Check all values

3. **Test Database Connection**
   ```bash
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM datifyy_v2_users;"
   ```

4. **Check Build Logs**
   - Dashboard → Your Service → Events → View Build Logs

---

**Ready to deploy? Start with Part 1 and follow each step carefully!**
