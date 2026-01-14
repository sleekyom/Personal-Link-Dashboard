# Railway Deployment Guide

This guide will help you deploy the Personal Link Dashboard to Railway.

## Step 1: Set up Environment Variables on Railway

In your Railway project dashboard, go to **Variables** and add the following:

### Required Variables:

```bash
# Database (Railway will create this file automatically)
DATABASE_URL=file:./data.db

# NextAuth Configuration
NEXTAUTH_URL=https://your-app-name.up.railway.app
NEXTAUTH_SECRET=GrSMLezaNiOO1RSE5X+s8o8bq2jutpCLO8/2zWyvC9U=

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Important Notes:

1. **NEXTAUTH_URL**: Replace `your-app-name.up.railway.app` with your actual Railway domain
   - You can find this in your Railway dashboard after deployment
   - Example: `https://personal-link-dashboard-production.up.railway.app`

2. **NEXTAUTH_SECRET**: Use the one provided or generate a new one:
   ```bash
   openssl rand -base64 32
   ```

3. **DATABASE_URL**: For Railway, use `file:./data.db` (SQLite in the container)
   - ⚠️ **Important**: SQLite data will be lost on redeploys unless you use Railway Volumes
   - For production, consider using Railway's PostgreSQL database instead

## Step 2: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Add these authorized redirect URIs:
   ```
   https://your-app-name.up.railway.app/api/auth/callback/google
   http://localhost:8080/api/auth/callback/google  (for local development)
   ```
6. Copy the Client ID and Client Secret
7. Add them to your Railway environment variables

## Step 3: Deploy to Railway

### Option A: Deploy from GitHub (Recommended)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Configure for Railway deployment"
   git push origin main
   ```

2. In Railway dashboard:
   - Click **New Project**
   - Select **Deploy from GitHub repo**
   - Choose your repository
   - Railway will automatically detect it's a Next.js app and deploy

### Option B: Deploy with Railway CLI

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Initialize and deploy:
   ```bash
   railway init
   railway up
   ```

## Step 4: Verify Deployment

1. Check the deployment logs in Railway dashboard
2. Look for:
   - ✅ `Prisma Client generated`
   - ✅ `Database pushed successfully`
   - ✅ `Next.js build completed`

3. Visit your app URL and test:
   - Sign in with Google OAuth
   - Create a dashboard
   - Add links

## Troubleshooting

### Database Issues

If you see "Environment variable not found: DATABASE_URL":
- Verify the variable is set in Railway dashboard
- Redeploy the application

### OAuth Errors

If you see "redirect_uri_mismatch":
- Update NEXTAUTH_URL to match your Railway domain
- Update Google OAuth authorized redirect URIs
- Redeploy

### Build Failures

If build fails on `prisma db push`:
- This is expected on first deploy if no database exists
- Railway will retry and it should succeed

## Upgrading to PostgreSQL (Recommended for Production)

SQLite data is ephemeral on Railway. For production use:

1. Add Railway PostgreSQL:
   - In Railway dashboard, click **New** → **Database** → **PostgreSQL**
   - Railway will automatically add `DATABASE_URL` variable

2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

3. Remove `--accept-data-loss` from build script in `package.json`:
   ```json
   "build": "prisma generate && prisma migrate deploy && next build --turbopack"
   ```

4. Create migration:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Commit and push:
   ```bash
   git add .
   git commit -m "Switch to PostgreSQL"
   git push
   ```

## Environment Variables Summary

| Variable | Example | Required |
|----------|---------|----------|
| DATABASE_URL | `file:./data.db` | ✅ |
| NEXTAUTH_URL | `https://your-app.up.railway.app` | ✅ |
| NEXTAUTH_SECRET | `random-32-byte-string` | ✅ |
| GOOGLE_CLIENT_ID | From Google Cloud Console | ✅ |
| GOOGLE_CLIENT_SECRET | From Google Cloud Console | ✅ |

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Next.js on Railway](https://docs.railway.app/guides/nextjs)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
