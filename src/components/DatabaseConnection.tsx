import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Database, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface DatabaseSchema {
  tables: Table[];
}

interface DatabaseConnectionProps {
  onConnectionSuccess: (connectionString: string, schema: DatabaseSchema) => void;
}

const DatabaseConnection = ({ onConnectionSuccess }: DatabaseConnectionProps) => {
  const [connectionString, setConnectionString] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");
  const { toast } = useToast();

  const handleTestConnection = async () => {
    if (!connectionString.trim()) {
      toast({
        title: "Connection String Required",
        description: "Please enter a valid SQL Server connection string.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    setConnectionStatus("idle");

    try {
      // Use Supabase Edge Function to connect to your SQL Server database
      const response = await fetch('/functions/v1/analyze-sqlserver-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ 
          connectionString: connectionString 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze database schema');
      }

      const schema = {
        tables: data.tables.map((table: any) => ({
          name: table.name,
          columns: table.columns.map((col: any) => ({
            name: col.name,
            type: col.type,
            nullable: col.nullable,
            primaryKey: col.primaryKey || false
          }))
        }))
      };

      setConnectionStatus("success");
      toast({
        title: "Database Connected!",
        description: `Successfully analyzed ${schema.tables.length} tables from your SQL Server database.`,
      });

      onConnectionSuccess(connectionString, schema);
    } catch (error) {
      console.error('Database connection error:', error);
      setConnectionStatus("error");
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Unable to connect to the database. Please check your connection string.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Database className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case "success":
        return <Badge variant="secondary" className="bg-success/10 text-success border-success/20">Connected</Badge>;
      case "error":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Not Connected</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Connect to SQL Server Database
        </h2>
        <p className="text-muted-foreground">
          Enter your SQL Server connection string to analyze your actual database schema
        </p>
      </div>

      <Card className="p-6 shadow-card">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="connection-string" className="text-base font-semibold flex items-center gap-2">
              {getStatusIcon()}
              SQL Server Connection String
            </Label>
            {getStatusBadge()}
          </div>

          <Textarea
            id="connection-string"
            placeholder="Server=localhost;Database=MyDatabase;Trusted_Connection=true;"
            value={connectionString}
            onChange={(e) => setConnectionString(e.target.value)}
            rows={3}
            className="font-mono text-sm"
          />

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Example Connection Strings:</h4>
            <div className="space-y-1 text-xs font-mono text-muted-foreground">
              <div>• SQL Server Auth: <code>Server=server;Database=db;User Id=user;Password=pass;</code></div>
              <div>• Windows Auth: <code>Server=server;Database=db;Trusted_Connection=true;</code></div>
              <div>• SQL Express: <code>Server=.\\SQLEXPRESS;Database=db;Trusted_Connection=true;</code></div>
            </div>
          </div>

          <Button 
            onClick={handleTestConnection}
            disabled={isConnecting || !connectionString.trim()}
            className="w-full"
            variant="hero"
            size="lg"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Database Schema...
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                Connect & Analyze Database
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DatabaseConnection;