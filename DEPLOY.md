# Deployment Guide - Render.com

This document outlines the steps to deploy the SPN Mobile App backend on Render.com.

## Prerequisites

- A [Render](https://render.com) account
- A MongoDB database (MongoDB Atlas recommended or Render's managed MongoDB)

## Environment Variables Required

Before deploying, you'll need to set up the following environment variables in Render:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGO_URI` | MongoDB connection string | Yes | None |
| `PORT` | Server port | No (auto-set by Render) | 10000 |
| `NODE_ENV` | Environment mode | No | production |

### Getting MongoDB Connection String

**Option 1: MongoDB Atlas**
1. Create a cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Click "Connect" and select "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `spn_db`
6. Example: `mongodb+srv://<username>:<password>@cluster.mongodb.net/spn_db?retryWrites=true&w=majority`

**Option 2: Render Managed MongoDB**
1. Create a MongoDB instance on Render
2. Copy the internal or external connection string
3. Use the internal connection string if backend and DB are in same region

## Deployment Steps

### Method 1: Using render.yaml (Recommended)

Render automatically detects the `render.yaml` file in your repository root.

1. Push your code to GitHub/GitLab
2. Create a new **Web Service** on Render
3. Connect your repository
4. Render will automatically use the configuration from `render.yaml`
5. Set the `MONGO_URI` environment variable in the Render dashboard
6. Click "Create Web Service"

### Method 2: Manual Setup

1. Log in to Render dashboard
2. Click "New" → "Web Service"
3. Connect your repository
4. Configure:
   - **Name**: `spn-backend` (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free/Paid (based on your needs)
5. Add Environment Variable:
   - Key: `MONGO_URI`
   - Value: Your MongoDB connection string
6. Click "Create Web Service"

### Method 3: Docker (Optional)

If you prefer using Docker:

1. Ensure Dockerfile is in the `backend/` directory (already included)
2. In Render dashboard, select "Docker" as environment
3. Set:
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Build Command**: (leave empty)
   - **Start Command**: `node dist/index.js`
4. Set environment variables (MONGO_URI, etc.)
5. Deploy

## Local Testing

You can test the deployment locally using Docker Compose:

```bash
cd backend
docker-compose up --build
```

The API will be available at: http://localhost:10000

Health check endpoint: `GET /api/health`

## API Endpoints

Once deployed, your backend will be available at: `https://your-service-name.onrender.com`

Base URL structure:
- Authentication: `/api/auth`
- Drivers: `/api/drivers`
- Vehicles: `/api/vehicles`
- Trips: `/api/trips`
- Users: `/api/users`
- Health: `/api/health`

## Notes

- The first deployment may take a few minutes (compiling TypeScript)
- Render free tier has a 512 MB RAM limit; consider upgrading for production use
- If using free tier, the service will sleep after 15 minutes of inactivity
- MongoDB Atlas free tier is recommended for development/testing
- Ensure your MongoDB cluster allows connections from Render (IP whitelist)
- CORS is enabled for all origins by default; consider restricting in production

## Troubleshooting

### Build Fails
- Check Node.js version compatibility (Node 18+ recommended)
- Ensure `npm run build` works locally first

### MongoDB Connection Issues
- Verify MONGO_URI is correct
- Check MongoDB allows connections from Render (for Atlas: add `0.0.0.0/0` to IP whitelist for testing)
- Ensure database user has proper permissions

### Port Issues
- Render auto-assigns PORT; your app must use `process.env.PORT`
- The application is configured to use PORT from environment (defaults to 10000)

### Health Check Failing
- Verify the `/api/health` endpoint returns `{status: 'ok'}`
- Check Render logs for errors

## Updates

After making changes:
1. Push to your repository
2. Render will automatically redeploy (if auto-deploy enabled)
3. Or manually trigger deploy from Render dashboard

## Files Created for Deployment

- `render.yaml` - Render service configuration
- `backend/Dockerfile` - Multi-stage Docker build
- `backend/docker-compose.yml` - Local development with MongoDB
- `DEPLOY.md` - This documentation
