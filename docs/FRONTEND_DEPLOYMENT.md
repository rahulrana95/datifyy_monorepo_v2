# Frontend Deployment Guide

Comprehensive guide for deploying the Datifyy React frontend to production.

## Table of Contents

1. [Overview](#overview)
2. [Deployment Options](#deployment-options)
3. [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
4. [Render Deployment](#render-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Build Optimization](#build-optimization)
7. [Custom Domain Setup](#custom-domain-setup)
8. [Debugging](#debugging)
9. [Troubleshooting](#troubleshooting)

## Overview

The Datifyy frontend is a React application built with:
- **Framework**: React 18.2+ with TypeScript
- **Build Tool**: Create React App (react-scripts)
- **UI Libraries**: Chakra UI, Ark UI, Framer Motion
- **State Management**: Zustand, React Query
- **Routing**: React Router v7

### Build Output

```bash
npm run build
# Creates: /build directory
# Contains: Static HTML, CSS, JS files
# Size: ~500KB gzipped
```

## Deployment Options

| Platform | Difficulty | Cost | Speed | Recommended |
|----------|-----------|------|-------|-------------|
| Vercel | Easy | Free tier | Fast | ✅ Yes |
| Render | Medium | Free tier | Medium | Good alternative |
| Netlify | Easy | Free tier | Fast | Good alternative |

## Vercel Deployment (Recommended)

Vercel is the easiest and fastest option with automatic deployments, built-in CDN, and excellent DX.

### Prerequisites

- GitHub/GitLab account with your repository
- Vercel account (free at https://vercel.com)

### Step 1: Prepare Your Repository

```bash
# Ensure your code is pushed to GitHub
cd /Users/rahulrana/repo/datifyy_monorepo_v2
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Deploy to Vercel (Web UI)

1. **Go to Vercel**: https://vercel.com/new

2. **Import Repository**:
   - Click "Add New" → "Project"
   - Select "Import Git Repository"
   - Choose your `datifyy_monorepo_v2` repository
   - Click "Import"

3. **Configure Build Settings**:
   ```
   Framework Preset: Create React App
   Root Directory: apps/frontend
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

4. **Set Environment Variables**:
   Click "Environment Variables" and add:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com
   REACT_APP_ENV=production
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Get your deployment URL: `https://your-app.vercel.app`

### Step 3: Deploy to Vercel (CLI - Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Navigate to frontend directory
cd apps/frontend

# Deploy
vercel

# Follow prompts:
# Set up and deploy "apps/frontend"? [Y/n] Y
# Which scope? [your-username]
# Link to existing project? [y/N] N
# What's your project's name? datifyy-frontend
# In which directory is your code located? ./
# Want to override settings? [y/N] N

# Production deployment
vercel --prod

# Note your deployment URL
# Example: https://datifyy-frontend.vercel.app
```

### Step 4: Configure Environment Variables (CLI)

```bash
# Add environment variables
vercel env add REACT_APP_API_URL production
# Paste your backend URL: https://your-backend.onrender.com

vercel env add REACT_APP_ENV production
# Enter: production

# Pull environment variables locally (optional)
vercel env pull .env.production.local
```

### Step 5: Set Up Automatic Deployments

Vercel automatically deploys on every push to `main`:

```bash
# Make a change
echo "// Updated" >> src/App.tsx

# Commit and push
git add .
git commit -m "Update app"
git push origin main

# Vercel will automatically:
# 1. Detect the push
# 2. Build your app
# 3. Deploy to production
# 4. Comment on your commit with deployment URL
```

### Step 6: Configure Build Settings (Optional)

Create `vercel.json` in the root of `apps/frontend`:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "create-react-app",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Vercel Dashboard Features

Access at https://vercel.com/dashboard:

1. **Deployments**: View all deployments, preview URLs
2. **Analytics**: Page views, performance metrics
3. **Logs**: Build logs, function logs
4. **Settings**: Environment variables, domains, integrations

### Vercel Preview Deployments

Vercel creates preview deployments for every branch:

```bash
# Create a feature branch
git checkout -b feature/new-ui

# Make changes and push
git add .
git commit -m "Add new UI"
git push origin feature/new-ui

# Vercel creates preview URL:
# https://datifyy-frontend-git-feature-new-ui.vercel.app

# Share with team for review
# Merge to main when ready → auto-deploys to production
```

## Render Deployment

Render is a good alternative to Vercel with similar ease of use.

### Step 1: Prepare Repository

```bash
# Same as Vercel - ensure code is pushed to GitHub
cd /Users/rahulrana/repo/datifyy_monorepo_v2
git push origin main
```

### Step 2: Create Static Site on Render

1. **Go to Render**: https://dashboard.render.com

2. **New Static Site**:
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Select `datifyy_monorepo_v2`

3. **Configure Build**:
   ```
   Name: datifyy-frontend
   Root Directory: apps/frontend
   Build Command: npm install && npm run build
   Publish Directory: apps/frontend/build
   Auto-Deploy: Yes (main branch)
   ```

4. **Add Environment Variables**:
   - Click "Environment"
   - Add `REACT_APP_API_URL`: `https://your-backend.onrender.com`
   - Add `REACT_APP_ENV`: `production`

5. **Deploy**:
   - Click "Create Static Site"
   - Wait 3-5 minutes for build
   - Get URL: `https://datifyy-frontend.onrender.com`

### Step 3: Configure Redirects for SPA

Create `apps/frontend/public/_redirects`:

```
/*    /index.html   200
```

Create `apps/frontend/public/render.yaml`:

```yaml
services:
  - type: web
    name: datifyy-frontend
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./build
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    headers:
      - path: /static/*
        name: Cache-Control
        value: public, max-age=31536000, immutable
```

### Step 4: Custom Domain (Render)

1. Go to your static site settings
2. Click "Custom Domain"
3. Add your domain: `www.yourdomain.com`
4. Add DNS records at your domain registrar:
   ```
   Type: CNAME
   Name: www
   Value: datifyy-frontend.onrender.com
   ```
5. Wait for DNS propagation (5-60 minutes)
6. SSL certificate auto-issued by Render

## Environment Configuration

### Required Environment Variables

```bash
# apps/frontend/.env.production
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_ENV=production

# Optional
REACT_APP_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
REACT_APP_ANALYTICS_ID=G-XXXXXXXXXX
```

### Environment Variable Priority

1. Platform environment variables (Vercel/Render dashboard)
2. `.env.production` file
3. `.env` file

### Testing Environment Variables

```bash
# Locally test production build
cd apps/frontend

# Create production env file
cat > .env.production.local <<EOF
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_ENV=production
EOF

# Build with production env
npm run build

# Serve locally
npx serve -s build -l 3000

# Test in browser
open http://localhost:3000

# Check environment variables in console
console.log(process.env.REACT_APP_API_URL)
```

## Build Optimization

### 1. Analyze Bundle Size

```bash
cd apps/frontend

# Install bundle analyzer
npm install --save-dev webpack-bundle-analyzer

# Analyze build
npm run build
npx webpack-bundle-analyzer build/static/js/*.js

# Check bundle sizes
# Main bundle should be < 500KB gzipped
```

### 2. Code Splitting

Already implemented with React Router:

```typescript
// Lazy load routes
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminPanel = lazy(() => import('./pages/Admin'));

// Wrap in Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/admin" element={<AdminPanel />} />
  </Routes>
</Suspense>
```

### 3. Image Optimization

```bash
# Optimize images before deployment
npm install -g imagemin-cli

# Compress all images
imagemin public/images/* --out-dir=public/images

# Use WebP format
imagemin public/images/*.{jpg,png} --plugin=webp --out-dir=public/images
```

### 4. Performance Budget

Add to `package.json`:

```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "statements": 80,
        "branches": 80,
        "functions": 80,
        "lines": 80
      }
    }
  },
  "bundlesize": [
    {
      "path": "./build/static/js/*.js",
      "maxSize": "500 KB"
    },
    {
      "path": "./build/static/css/*.css",
      "maxSize": "100 KB"
    }
  ]
}
```

## Custom Domain Setup

### Vercel Custom Domain

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project** → "Settings" → "Domains"
3. **Add Domain**: Enter `yourdomain.com` and `www.yourdomain.com`
4. **Configure DNS** at your registrar:

   ```
   # For root domain
   Type: A
   Name: @
   Value: 76.76.21.21

   # For www subdomain
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

5. **Wait for DNS propagation** (5-60 minutes)
6. **SSL**: Vercel auto-issues SSL certificate

### Render Custom Domain

1. **Go to Render Dashboard**
2. **Select your static site** → "Settings" → "Custom Domain"
3. **Add Domain**: `www.yourdomain.com`
4. **Configure DNS**:

   ```
   Type: CNAME
   Name: www
   Value: datifyy-frontend.onrender.com
   ```

5. **SSL**: Auto-issued by Render

### Verify DNS Propagation

```bash
# Check DNS records
dig yourdomain.com
dig www.yourdomain.com

# Check from multiple locations
curl https://www.whatsmydns.net/api/details?server=google&query=yourdomain.com&type=A

# Test SSL certificate
curl -I https://yourdomain.com
```

## Debugging

### Enable Source Maps in Production (Temporarily)

```bash
# Edit package.json
{
  "scripts": {
    "build": "GENERATE_SOURCEMAP=true react-scripts build"
  }
}

# Rebuild and deploy
npm run build

# After debugging, disable source maps:
{
  "scripts": {
    "build": "GENERATE_SOURCEMAP=false react-scripts build"
  }
}
```

### Check Build Logs

**Vercel**:
```bash
# Via CLI
vercel logs your-deployment-url

# Via Dashboard
# Go to: Deployments → Select deployment → "View Build Logs"
```

**Render**:
```bash
# Via Dashboard
# Go to: Your static site → "Logs" tab
# Filter: Build logs

# Via CLI (if available)
render logs -f datifyy-frontend
```

### Debug Production Build Locally

```bash
cd apps/frontend

# Build production bundle
npm run build

# Serve with error logging
npx serve -s build -l 3000 --debug

# Open browser with console
open http://localhost:3000

# Check for errors in DevTools Console
# Network tab → Check failed requests
# Console → Check JavaScript errors
```

### Common Build Issues

#### Issue 1: Build Fails - TypeScript Errors

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Fix errors, then rebuild
npm run build
```

#### Issue 2: Environment Variables Not Working

```bash
# Verify variables are prefixed with REACT_APP_
echo $REACT_APP_API_URL  # Should print URL

# Check in code
console.log(process.env.REACT_APP_API_URL)

# Rebuild after changing env vars
npm run build
```

#### Issue 3: Routes Return 404

**Solution for Vercel**: Add `vercel.json` (see Step 6 above)

**Solution for Render**: Add `_redirects` file:
```bash
cd apps/frontend/public
echo "/*    /index.html   200" > _redirects
```

## Troubleshooting

### CORS Errors

**Symptom**: Browser console shows:
```
Access to fetch at 'https://backend.onrender.com/api/v1/users' from origin 'https://yourapp.vercel.app'
has been blocked by CORS policy
```

**Solution**:
1. Update backend CORS configuration
2. Add your frontend URL to `CORS_ALLOWED_ORIGINS`
3. Redeploy backend

```go
// In backend
cors.New(cors.Config{
    AllowOrigins: []string{
        "https://yourapp.vercel.app",
        "https://www.yourdomain.com",
    },
    AllowCredentials: true,
})
```

### API Calls Failing

**Symptom**: Network errors, API returns 404

**Solution**:
```bash
# 1. Verify REACT_APP_API_URL
# In browser console:
console.log(process.env.REACT_APP_API_URL)

# 2. Check backend is running
curl https://your-backend.onrender.com/health

# 3. Test API endpoint directly
curl https://your-backend.onrender.com/api/v1/users

# 4. Check Network tab in DevTools
# - Request URL should match backend
# - Check response status and body
```

### Blank Page After Deployment

**Symptom**: White screen, no errors in console

**Solutions**:
```bash
# 1. Check browser console for errors
# 2. Verify build completed successfully
# 3. Check public path in package.json

# Add to package.json if using subdirectory
{
  "homepage": "https://yourdomain.com"
}

# 4. Rebuild and redeploy
npm run build

# 5. Check for JavaScript errors in production
# Enable source maps temporarily
GENERATE_SOURCEMAP=true npm run build
```

### Slow Initial Load

**Symptoms**: App takes 5+ seconds to load

**Solutions**:
```bash
# 1. Analyze bundle size
npm run build
npx webpack-bundle-analyzer build/static/js/*.js

# 2. Implement code splitting (already done)
# 3. Lazy load heavy components

# 4. Optimize images
npm install -g imagemin-cli
imagemin public/**/*.{jpg,png} --plugin=webp --out-dir=public/

# 5. Enable CDN (Vercel does this automatically)

# 6. Add performance monitoring
# Install Web Vitals
npm install web-vitals

# In src/index.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Environment-Specific Issues

**Symptom**: Works locally but fails in production

**Debug Steps**:
```bash
# 1. Test production build locally
npm run build
npx serve -s build

# 2. Check environment variables
# Vercel: https://vercel.com/your-project/settings/environment-variables
# Render: Dashboard → Environment

# 3. Check build logs for warnings
# Look for:
# - Missing dependencies
# - Peer dependency warnings
# - Build warnings

# 4. Compare local vs production
# - Node version
# - npm version
# - Environment variables
```

## Performance Monitoring

### Set Up Vercel Analytics

```bash
# Install Vercel Analytics
cd apps/frontend
npm install @vercel/analytics

# Add to src/index.tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

### Set Up Sentry Error Tracking

```bash
# Install Sentry
npm install @sentry/react

# Configure in src/index.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.REACT_APP_ENV,
  tracesSampleRate: 1.0,
});

# Add to Vercel environment variables
REACT_APP_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

## Rollback Procedure

### Vercel Rollback

```bash
# Via Dashboard
# 1. Go to Deployments
# 2. Find previous working deployment
# 3. Click "..." → "Promote to Production"

# Via CLI
vercel rollback
# Select deployment to rollback to
```

### Render Rollback

```bash
# Via Dashboard
# 1. Go to your static site
# 2. Click "Deploys"
# 3. Find previous deployment
# 4. Click "Rollback to this version"
```

## Checklist: Before Going Live

- [ ] Environment variables configured
- [ ] Backend URL updated in `REACT_APP_API_URL`
- [ ] CORS configured on backend
- [ ] Build succeeds without errors
- [ ] All routes working (no 404s)
- [ ] API calls working
- [ ] Authentication working
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate issued
- [ ] Analytics/monitoring set up
- [ ] Error tracking configured
- [ ] Tested on mobile devices
- [ ] Tested in Chrome, Firefox, Safari
- [ ] Performance metrics acceptable (LCP < 2.5s)

## Next Steps

1. ✅ Deploy backend first (see [BACKEND_DEPLOYMENT.md](./BACKEND_DEPLOYMENT.md))
2. ✅ Get backend URL
3. ✅ Deploy frontend with correct `REACT_APP_API_URL`
4. ✅ Test all features
5. ✅ Set up monitoring
6. ✅ Configure custom domain
7. ✅ Go live! 🎉
