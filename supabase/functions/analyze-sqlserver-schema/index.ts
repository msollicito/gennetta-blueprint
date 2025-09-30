// Supabase Edge Function to analyze SQL Server database schema
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface ConnectionConfig {
  server: string;
  database: string;
  username?: string;
  password?: string;
  trustedConnection?: boolean;
  port?: number;
}

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey?: boolean;
}

interface Table {
  name: string;
  columns: Column[];
}

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

    // Get the .NET API URL from environment variable
    const dotnetApiUrl = Deno.env.get('DOTNET_API_URL');
    
    if (!dotnetApiUrl) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'DOTNET_API_URL environment variable is not set. Please configure your .NET API endpoint URL in the Supabase secrets.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    try {
      console.log(`Calling .NET API at: ${dotnetApiUrl}`);
      
      // Call the .NET API to analyze the SQL Server schema
      const response = await fetch(`${dotnetApiUrl}/api/analyze-schema`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionString })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API returned status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze schema');
      }

      console.log(`Successfully analyzed ${data.tables.length} tables`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          tables: data.tables,
          message: `Successfully analyzed ${data.tables.length} tables from your SQL Server database`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
      
    } catch (apiError) {
      console.error('API call error:', apiError);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to connect to .NET API: ${apiError instanceof Error ? apiError.message : 'Unknown API error'}`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

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

