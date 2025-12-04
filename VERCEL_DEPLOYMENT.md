# Vercel Deployment Guide

This guide explains how to deploy the Project Management application to Vercel with a serverless proxy backend to fix CORS issues.

## Architecture Overview

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Browser   │────────▶│  Vercel (Frontend│────────▶│   API Backend   │
│             │         │   + Serverless)  │         │   (ngrok URL)   │
└─────────────┘         └──────────────────┘         └─────────────────┘
                               │
                               ├─ Static Files (React App)
                               └─ /api/* → Serverless Proxy Function
```

### How It Works

1. **Development Mode**:
   - Frontend requests → `http://localhost:5173/api/*`
   - Vite dev proxy → Forwards to ngrok API
   - No CORS issues ✓

2. **Production Mode (Vercel)**:
   - Frontend requests → `https://your-app.vercel.app/api/*`
   - Vercel serverless function → Forwards to ngrok API
   - No CORS issues ✓

## Files Added for Vercel Deployment

### 1. `/api/[...path].ts` - Serverless Proxy Function
- Catch-all route that handles all `/api/*` requests
- Forwards requests to the actual API backend
- Adds proper CORS headers
- Handles all HTTP methods (GET, POST, PUT, DELETE, etc.)

### 2. `/vercel.json` - Vercel Configuration
- Configures build settings
- Sets up routing for API proxy
- Defines CORS headers

### 3. Updated `/src/services/api.ts`
- Always uses `/api` prefix (both dev and prod)
- Works with Vite proxy in development
- Works with Vercel serverless function in production

## Deployment Steps

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 2: Configure Environment Variables

In your Vercel project settings, add the following environment variable:

- **Key**: `VITE_API_BASE_URL`
- **Value**: `https://897d77d8e056.ngrok-free.app` (or your actual API URL)

You can do this via:

**Option A: Vercel Dashboard**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the variable

**Option B: Vercel CLI**
```bash
vercel env add VITE_API_BASE_URL
```

### Step 3: Deploy to Vercel

**Option A: Git-based Deployment (Recommended)**

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your repository
5. Vercel auto-detects Vite configuration
6. Click "Deploy"

**Option B: CLI Deployment**

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Step 4: Verify Deployment

1. Open your Vercel deployment URL
2. Check the browser console for any errors
3. Test API requests:
   - Projects list should load
   - Task details should work
   - No CORS errors in console ✓

## Testing the Proxy Locally

Before deploying, you can test the serverless function locally using Vercel CLI:

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Run in development mode with serverless functions
vercel dev
```

This will:
- Start the Vite dev server
- Run serverless functions locally on port 3000
- Allow you to test the production proxy behavior

## Troubleshooting

### Issue: CORS errors still appearing

**Solution**: Make sure the environment variable `VITE_API_BASE_URL` is set in Vercel dashboard.

### Issue: 404 on API routes

**Solution**: Check that:
1. The `/api` folder exists in your repository
2. The `[...path].ts` file is present
3. Vercel has detected it as a serverless function

### Issue: API requests timing out

**Solution**: Vercel serverless functions have a 10-second timeout on the Hobby plan. If your API is slow, consider:
1. Upgrading to Vercel Pro (60s timeout)
2. Adding caching to the proxy
3. Optimizing your backend API

### Issue: Environment variables not working

**Solution**:
1. Make sure to redeploy after adding environment variables
2. Variables starting with `VITE_` are exposed to the client
3. Check Vercel deployment logs for any errors

## Monitoring and Logs

### View Deployment Logs

```bash
# Via CLI
vercel logs <deployment-url>

# Via Dashboard
# Go to your project → Deployments → Select deployment → View Logs
```

### Check Serverless Function Logs

In the Vercel dashboard:
1. Go to your project
2. Click on "Functions" tab
3. Select `/api/[...path]`
4. View invocation logs

## Security Considerations

### Current Setup (Development/Testing)
- CORS is set to `*` (allow all origins)
- Suitable for development and testing

### Production Recommendations

For production, update `/api/[...path].ts` to restrict CORS:

```typescript
// Instead of:
res.setHeader('Access-Control-Allow-Origin', '*');

// Use:
const allowedOrigins = ['https://your-app.vercel.app'];
const origin = req.headers.origin;
if (origin && allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin);
}
```

## Cost Considerations

### Vercel Hobby Plan (Free)
- 100 GB bandwidth/month
- 100 hours serverless function execution
- Usually sufficient for small projects

### Scaling
- Each API request = 1 serverless function invocation
- Monitor usage in Vercel dashboard
- Consider caching strategies to reduce function calls

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Test all API endpoints
3. Consider adding:
   - Response caching
   - Request rate limiting
   - Error monitoring (Sentry, etc.)
   - Analytics

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
