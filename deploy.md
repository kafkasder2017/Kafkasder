# Deno Deploy Setup

This project has been configured to run on Deno Deploy. Here's how to deploy it:

## Prerequisites

1. Build the React application first:
   ```bash
   npm run build
   ```

2. Make sure you have a Deno Deploy account at https://deno.com/deploy

## Deployment Options

### Option 1: GitHub Integration (Recommended)

1. Push your code to a GitHub repository
2. Connect your GitHub account to Deno Deploy
3. Create a new project in Deno Deploy
4. Select your repository and set:
   - **Entry Point**: `server.ts`
   - **Environment Variables**: Set `PORT` if needed (optional, defaults to 8000)

### Option 2: Manual Deployment

1. Install Deno CLI: https://deno.land/manual/getting_started/installation
2. Install deployctl:
   ```bash
   deno install --allow-read --allow-write --allow-env --allow-net --allow-run --no-check -r -f https://deno.land/x/deploy/deployctl.ts
   ```
3. Deploy:
   ```bash
   deployctl deploy --project=your-project-name server.ts
   ```

## Local Development

To run the Deno server locally:

```bash
deno run --allow-net --allow-read --allow-env server.ts
```

Or use the task defined in deno.json:

```bash
deno task start
```

## Files Created for Deno Deploy

- `deno.json` - Deno configuration file with tasks and imports
- `server.ts` - Deno server that serves the built React application
- `deploy.md` - This deployment guide

## Important Notes

1. The `server.ts` file is excluded from TypeScript compilation in `tsconfig.json`
2. The server serves static files from the `dist` directory
3. All routes fallback to `index.html` for SPA routing
4. The server includes CORS support and proper content-type headers

## Environment Variables

- `PORT` - Server port (defaults to 8000)

Your application is now ready for Deno Deploy! 🚀