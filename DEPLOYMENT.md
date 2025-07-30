# Vercel Deployment Guide

This guide will help you deploy the KAFKASDER Panel to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. Gemini API key for the AI features

## Deployment Steps

### 1. Connect Your Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Select the repository containing this project

### 2. Configure Project Settings

Vercel should automatically detect this as a Vite project. The configuration is already set up in `vercel.json`:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Set Environment Variables

In the Vercel dashboard, go to your project settings and add the following environment variables:

#### Required Variables

```
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Supabase Database Configuration
POSTGRES_URL=postgres://postgres.eqtsssgwcgiognmoxuuz:HMNx3EEaXkRkGxjP@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
POSTGRES_USER=postgres
POSTGRES_HOST=db.eqtsssgwcgiognmoxuuz.supabase.co
POSTGRES_PASSWORD=HMNx3EEaXkRkGxjP
POSTGRES_DATABASE=postgres
POSTGRES_PRISMA_URL=postgres://postgres.eqtsssgwcgiognmoxuuz:HMNx3EEaXkRkGxjP@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
POSTGRES_URL_NON_POOLING=postgres://postgres.eqtsssgwcgiognmoxuuz:HMNx3EEaXkRkGxjP@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require

# Supabase API Configuration
SUPABASE_URL=https://eqtsssgwcgiognmoxuuz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxdHNzc2d3Y2dpb2dubW94dXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MzI3NzEsImV4cCI6MjA2OTQwODc3MX0.kCTHrkuSLQ5Pi8ijmXCIPkA5rMzDfS2QpeMQQ8Zg3Sc
SUPABASE_JWT_SECRET=N945TzHO6r0CAjDESsITQweKkl0V1AyJ09Lrc4pFUZoKvhalpNMppJOV46mcPfpsjQ1RRk7foMSQ6h2MCCH4Sw==
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxdHNzc2d3Y2dpb2dubW94dXV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgzMjc3MSwiZXhwIjoyMDY5NDA4NzcxfQ.mnC0_H_0C9YzcN8Ad_pHbZrFbKqS_ER3lAj5z1DORlA

# Next.js Public Variables (for client-side access)
NEXT_PUBLIC_SUPABASE_URL=https://eqtsssgwcgiognmoxuuz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxdHNzc2d3Y2dpb2dubW94dXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MzI3NzEsImV4cCI6MjA2OTQwODc3MX0.kCTHrkuSLQ5Pi8ijmXCIPkA5rMzDfS2QpeMQQ8Zg3Sc
```

**Important**: 
- Replace `your_actual_gemini_api_key_here` with your real Gemini API key
- The Supabase credentials above are already configured for your project

### 4. Deploy

1. Click "Deploy" in the Vercel dashboard
2. Wait for the build to complete
3. Your app will be available at the provided Vercel URL

## Configuration Files

The following files have been created/configured for Vercel deployment:

- `vercel.json` - Vercel configuration with build settings and environment variables
- `.vercelignore` - Files to exclude from deployment
- `vite.config.ts` - Updated with production build optimizations

## Environment Variables

### Required Variables

#### AI & External Services
- `GEMINI_API_KEY` - Your Google Gemini API key for AI features

#### Supabase Database Configuration
- `POSTGRES_URL` - Main PostgreSQL connection URL with pooling
- `POSTGRES_USER` - Database username (postgres)
- `POSTGRES_HOST` - Database host URL
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DATABASE` - Database name (postgres)
- `POSTGRES_PRISMA_URL` - Prisma-specific connection URL with pgbouncer
- `POSTGRES_URL_NON_POOLING` - Direct database connection without pooling

#### Supabase API Configuration
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Anonymous/public API key for client-side operations
- `SUPABASE_JWT_SECRET` - JWT secret for token verification
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for server-side operations

#### Next.js Public Variables (Client-side Access)
- `NEXT_PUBLIC_SUPABASE_URL` - Public Supabase URL for client-side
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key for client-side

### Setting Up Environment Variables

1. In Vercel Dashboard → Project → Settings → Environment Variables
2. Add each variable with the appropriate value
3. Make sure to set them for all environments (Production, Preview, Development)

## Build Optimization

The Vite configuration includes:

- Code splitting for better performance
- Vendor chunk separation (React, React DOM)
- Router chunk separation
- Optimized build output

## Troubleshooting

### Build Fails

1. Check that all dependencies are listed in `package.json`
2. Verify environment variables are set correctly
3. Check the build logs in Vercel dashboard

### Environment Variables Not Working

1. Ensure variables are set in Vercel dashboard
2. Check variable names match exactly (case-sensitive)
3. Redeploy after adding new variables

### Routing Issues

- The `vercel.json` includes rewrites to handle client-side routing
- All routes will fallback to `index.html` for proper SPA behavior

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

## Automatic Deployments

Once connected, Vercel will automatically deploy:

- **Production**: When you push to the main/master branch
- **Preview**: When you create pull requests
- **Development**: When you push to other branches

## Support

For Vercel-specific issues, check:

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Vercel Community](https://github.com/vercel/vercel/discussions)