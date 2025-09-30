# GenNetta Node.js API

This Node.js API analyzes SQL Server database schemas using the `mssql` package.

## Prerequisites

- Node.js 18+ or later
- SQL Server database access

## Local Development

1. Navigate to the nodejs-api directory:
   ```bash
   cd nodejs-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm run dev
   ```

The API will start on `http://localhost:3000`.

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   cd nodejs-api
   vercel
   ```

3. Follow the prompts. Your API will be deployed to a URL like `https://your-project.vercel.app`

### Option 2: Deploy to Railway

1. Sign up at [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect the Node.js app and deploy it

### Option 3: Deploy to Render

1. Sign up at [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Set build command: `cd nodejs-api && npm install && npm run build`
5. Set start command: `cd nodejs-api && npm start`

## Configure Supabase

After deploying, update the `DOTNET_API_URL` secret in your Supabase project:

1. Go to: https://supabase.com/dashboard/project/vpjtsqajpmquhpfxjkbg/settings/functions
2. Update the `DOTNET_API_URL` secret with your deployed API URL (e.g., `https://your-project.vercel.app`)

## API Endpoints

### POST /api/analyze-schema

Analyzes a SQL Server database schema.

**Request:**
```json
{
  "connectionString": "Server=your-server;Database=your-db;User Id=username;Password=password;Encrypt=true"
}
```

**Response:**
```json
{
  "success": true,
  "tables": [
    {
      "name": "TableName",
      "columns": [
        {
          "name": "ColumnName",
          "type": "varchar",
          "nullable": false,
          "primaryKey": true
        }
      ]
    }
  ]
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```
