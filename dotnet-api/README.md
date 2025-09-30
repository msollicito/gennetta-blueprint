# GenNetta .NET API

This is the .NET backend API that analyzes SQL Server database schemas using ADO.NET and Entity Framework Core.

## Prerequisites

- .NET 8.0 SDK or later
- SQL Server database access

## Setup

1. Navigate to the dotnet-api directory:
   ```bash
   cd dotnet-api
   ```

2. Restore dependencies:
   ```bash
   dotnet restore
   ```

3. Run the API:
   ```bash
   dotnet run
   ```

The API will start on `http://localhost:5000` (or `https://localhost:5001` for HTTPS).

## Deployment

### Deploy to Azure App Service

1. Publish the project:
   ```bash
   dotnet publish -c Release
   ```

2. Deploy to Azure using Azure CLI or Visual Studio.

### Deploy to IIS

1. Publish the project to a folder:
   ```bash
   dotnet publish -c Release -o ./publish
   ```

2. Copy the contents of the `publish` folder to your IIS server.

3. Create a new website in IIS pointing to the published folder.

## Configure Supabase Edge Function

After deploying your .NET API, configure the `DOTNET_API_URL` secret in Supabase:

1. Go to your Supabase project settings
2. Navigate to Edge Functions secrets
3. Add a new secret named `DOTNET_API_URL` with the value of your deployed API URL (e.g., `https://your-api.azurewebsites.net`)

## API Endpoints

### POST /api/analyze-schema

Analyzes a SQL Server database schema and returns all tables and columns.

**Request Body:**
```json
{
  "connectionString": "Server=your-server;Database=your-db;User Id=username;Password=password;"
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
