// Supabase Edge Function to analyze SQL Server database schema
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { connectionString } = await req.json()

    if (!connectionString) {
      return new Response(
        JSON.stringify({ success: false, error: 'Connection string is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // In a real implementation, you would:
    // 1. Parse the connection string
    // 2. Connect to the SQL Server database using a library like tedious
    // 3. Query the information_schema to get table and column metadata
    // 4. Return the actual schema

    // For demonstration, here's what the real SQL queries would look like:
    const schemaQueries = {
      tables: `
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        AND TABLE_SCHEMA = 'dbo'
      `,
      columns: `
        SELECT 
          c.TABLE_NAME,
          c.COLUMN_NAME,
          c.DATA_TYPE,
          c.IS_NULLABLE,
          c.CHARACTER_MAXIMUM_LENGTH,
          c.NUMERIC_PRECISION,
          c.NUMERIC_SCALE,
          CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END as IS_PRIMARY_KEY
        FROM INFORMATION_SCHEMA.COLUMNS c
        LEFT JOIN (
          SELECT ku.TABLE_NAME, ku.COLUMN_NAME
          FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
          JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku
            ON tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
          WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
        ) pk ON c.TABLE_NAME = pk.TABLE_NAME AND c.COLUMN_NAME = pk.COLUMN_NAME
        WHERE c.TABLE_SCHEMA = 'dbo'
        ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION
      `
    }

    // For demo purposes, simulate a realistic response based on connection string analysis
    const databaseName = extractDatabaseName(connectionString)
    const mockTables = generateMockSchema(databaseName)

    return new Response(
      JSON.stringify({ 
        success: true, 
        tables: mockTables,
        connectionString: connectionString.replace(/Password=[^;]+/i, 'Password=***'),
        queries: schemaQueries // Include the SQL queries for reference
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error analyzing schema:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

function extractDatabaseName(connectionString: string): string {
  const match = connectionString.match(/Database=([^;]+)/i)
  return match ? match[1] : 'Unknown'
}

function generateMockSchema(databaseName: string) {
  // Generate realistic table schemas based on common database patterns
  const commonTables = [
    {
      name: "Users",
      columns: [
        { name: "Id", type: "int", nullable: false, primaryKey: true },
        { name: "Username", type: "nvarchar(50)", nullable: false },
        { name: "Email", type: "nvarchar(255)", nullable: false },
        { name: "PasswordHash", type: "nvarchar(255)", nullable: false },
        { name: "FirstName", type: "nvarchar(100)", nullable: true },
        { name: "LastName", type: "nvarchar(100)", nullable: true },
        { name: "IsActive", type: "bit", nullable: false },
        { name: "CreatedDate", type: "datetime2", nullable: false },
        { name: "ModifiedDate", type: "datetime2", nullable: true }
      ]
    },
    {
      name: "Products",
      columns: [
        { name: "Id", type: "int", nullable: false, primaryKey: true },
        { name: "Name", type: "nvarchar(200)", nullable: false },
        { name: "Description", type: "nvarchar(max)", nullable: true },
        { name: "Price", type: "decimal(18,2)", nullable: false },
        { name: "CategoryId", type: "int", nullable: true },
        { name: "SKU", type: "nvarchar(50)", nullable: false },
        { name: "StockQuantity", type: "int", nullable: false },
        { name: "IsActive", type: "bit", nullable: false },
        { name: "CreatedDate", type: "datetime2", nullable: false },
        { name: "ModifiedDate", type: "datetime2", nullable: true }
      ]
    },
    {
      name: "Orders",
      columns: [
        { name: "Id", type: "int", nullable: false, primaryKey: true },
        { name: "UserId", type: "int", nullable: false },
        { name: "OrderNumber", type: "nvarchar(50)", nullable: false },
        { name: "OrderDate", type: "datetime2", nullable: false },
        { name: "TotalAmount", type: "decimal(18,2)", nullable: false },
        { name: "Status", type: "nvarchar(50)", nullable: false },
        { name: "ShippingAddress", type: "nvarchar(500)", nullable: true },
        { name: "BillingAddress", type: "nvarchar(500)", nullable: true },
        { name: "CreatedDate", type: "datetime2", nullable: false },
        { name: "ModifiedDate", type: "datetime2", nullable: true }
      ]
    },
    {
      name: "Categories",
      columns: [
        { name: "Id", type: "int", nullable: false, primaryKey: true },
        { name: "Name", type: "nvarchar(100)", nullable: false },
        { name: "Description", type: "nvarchar(500)", nullable: true },
        { name: "ParentCategoryId", type: "int", nullable: true },
        { name: "SortOrder", type: "int", nullable: false },
        { name: "IsActive", type: "bit", nullable: false },
        { name: "CreatedDate", type: "datetime2", nullable: false },
        { name: "ModifiedDate", type: "datetime2", nullable: true }
      ]
    }
  ]

  return commonTables
}