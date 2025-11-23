# Quick Deployment Reference

Fast reference guide for deploying Datifyy to production.

## 🚀 Deploy in 15 Minutes

### Prerequisites (5 min)

1. ✅ GitHub account with repo pushed
2. ✅ Vercel account (free): https://vercel.com
3. ✅ Render account (free): https://render.com
4. ✅ Google Gemini API key: https://console.cloud.google.com

### Step 1: Deploy Database (3 min)

```bash
# Render Dashboard → New → PostgreSQL
Name: datifyy-postgres
Plan: Starter ($7/mo) or Free
Region: Oregon (US West)
→ Create Database
→ Copy "External Database URL"
```

### Step 2: Deploy Redis (2 min)

```bash
# Upstash (free): https://console.upstash.com
→ Create Database
Name: datifyy-cache
Region: US-West-1
→ Copy REDIS_URL
```

### Step 3: Deploy Backend (5 min)

```bash
# Render Dashboard → New → Web Service
Repository: datifyy_monorepo_v2
Name: datifyy-backend
Root Directory: apps/backend
Build Command: go build -o server ./cmd/server
Start Command: ./server

# Environment Variables:
DATABASE_URL=[paste from Step 1]
REDIS_URL=[paste from Step 2]
GEMINI_API_KEY=[your Gemini key]
JWT_SECRET=[generate: openssl rand -base64 32]
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app

→ Create Web Service
→ Wait 5 minutes
→ Copy backend URL: https://datifyy-backend.onrender.com
```

### Step 4: Run Migrations (2 min)

```bash
# Local terminal:
export DATABASE_URL="[External Database URL from Step 1]"

cd apps/backend/migrations
for f in *.sql; do psql $DATABASE_URL -f $f; done

# Verify:
psql $DATABASE_URL -c "\dt"
```

### Step 5: Deploy Frontend (3 min)

```bash
# Vercel Dashboard: https://vercel.com/new
→ Import Git Repository
→ Select datifyy_monorepo_v2
Root Directory: apps/frontend
Framework: Create React App

# Environment Variables:
REACT_APP_API_URL=https://datifyy-backend.onrender.com
REACT_APP_ENV=production

→ Deploy
→ Wait 2 minutes
→ Visit: https://your-app.vercel.app
```

### Step 6: Test (1 min)

```bash
# Backend health
curl https://datifyy-backend.onrender.com/health

# Frontend
open https://your-app.vercel.app

# Test login
# Create account → Login → Profile
```

## ✅ Done!

Your app is live at:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://datifyy-backend.onrender.com

## 🔧 Quick Commands

### View Logs

```bash
# Backend logs
# Render Dashboard → datifyy-backend → Logs

# Frontend logs
# Vercel Dashboard → Deployments → View Function Logs
```

### Update Deployment

```bash
# Frontend & Backend auto-deploy on git push
git add .
git commit -m "Update"
git push origin main

# Vercel & Render auto-deploy in 2-3 minutes
```

### Run New Migration

```bash
# Create migration: apps/backend/migrations/006_new_migration.sql
# Apply:
psql $DATABASE_URL -f apps/backend/migrations/006_new_migration.sql
```

### Rollback Deployment

```bash
# Frontend (Vercel)
# Dashboard → Deployments → Previous → Promote to Production

# Backend (Render)
# Dashboard → Events → Previous Deploy → Rollback
```

## 📚 Full Documentation

- **[Complete Deployment Guide](./DEPLOYMENT.md)** - Comprehensive overview
- **[Frontend Deployment](./FRONTEND_DEPLOYMENT.md)** - Vercel & Render details
- **[Backend Deployment](./BACKEND_DEPLOYMENT.md)** - Render deployment guide
- **[Database Migrations](./DATABASE_MIGRATIONS.md)** - Schema change management

## 🆘 Common Issues

### CORS Error

```bash
# Update backend CORS_ALLOWED_ORIGINS
# Render → datifyy-backend → Environment
CORS_ALLOWED_ORIGINS=https://your-actual-app.vercel.app
→ Manual Deploy
```

### Database Connection Failed

```bash
# Verify DATABASE_URL format:
postgres://user:password@host:5432/dbname?sslmode=require
# Must include: ?sslmode=require for production

# Test connection:
psql $DATABASE_URL -c "SELECT 1;"
```

### Frontend Shows Blank Page

```bash
# Check REACT_APP_API_URL
# Vercel → Project → Settings → Environment Variables
# Must be: https://your-backend.onrender.com (not localhost!)

# Redeploy:
# Vercel → Deployments → ... → Redeploy
```

### Build Fails

```bash
# Frontend: Check Node version (16+)
# Backend: Check Go version (1.24+)

# View build logs:
# Render/Vercel → Logs → Build Logs
```

## 💰 Cost Estimate

Free tier:
- Vercel: Free
- Render Backend: Free (750 hrs/mo) or $7/mo Starter
- Render PostgreSQL: Free or $7/mo Starter
- Upstash Redis: Free (10K commands/day)
- Gemini API: $0-$10/mo (usage-based)

**Total**: $0-14/month (Free tier) or $14-24/month (Starter tier)

## 🔒 Security Checklist

- [ ] Changed default passwords
- [ ] Generated strong JWT_SECRET (32+ chars)
- [ ] Set specific CORS origins (no *)
- [ ] Enabled SSL (sslmode=require)
- [ ] Removed development API keys
- [ ] Set up monitoring alerts

## 📊 Monitoring Setup

### Uptime Monitoring (Free)

```bash
# UptimeRobot: https://uptimerobot.com
→ Add Monitor
URL: https://datifyy-backend.onrender.com/health
Interval: 5 minutes
Alert: Email
```

### Error Tracking (Free)

```bash
# Sentry: https://sentry.io
→ Create Project: datifyy-backend
→ Add DSN to environment:
SENTRY_DSN=https://xxx@sentry.io/xxx
```

## 🔄 Continuous Deployment

Already set up! Every push to `main` triggers:
1. Vercel builds and deploys frontend (~2 min)
2. Render builds and deploys backend (~5 min)

```bash
# Make changes
git add .
git commit -m "New feature"
git push origin main

# Auto-deploys to production ✨
```

## 🌐 Custom Domain (Optional)

### Frontend

```bash
# Vercel Dashboard → Project → Settings → Domains
→ Add: www.yourdomain.com
→ Add DNS records (Vercel provides instructions)
→ SSL auto-issued
```

### Backend

```bash
# Render Dashboard → datifyy-backend → Settings → Custom Domain
→ Add: api.yourdomain.com
→ Add CNAME: api → datifyy-backend.onrender.com
→ SSL auto-issued

# Update REACT_APP_API_URL:
REACT_APP_API_URL=https://api.yourdomain.com
```

## 🎯 Next Steps After Deployment

1. ✅ Set up monitoring (UptimeRobot)
2. ✅ Configure error tracking (Sentry)
3. ✅ Add custom domain (optional)
4. ✅ Set up automated backups
5. ✅ Create admin user
6. ✅ Test all features
7. ✅ Invite beta users

## 📞 Support

- **Documentation Issues**: Check [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Backend Issues**: [BACKEND_DEPLOYMENT.md](./BACKEND_DEPLOYMENT.md)
- **Frontend Issues**: [FRONTEND_DEPLOYMENT.md](./FRONTEND_DEPLOYMENT.md)
- **Database Issues**: [DATABASE_MIGRATIONS.md](./DATABASE_MIGRATIONS.md)
- **Platform Issues**:
  - Vercel: https://vercel.com/support
  - Render: support@render.com
