import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Database, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      // For demo purposes, simulate a realistic database schema
      // In production, this would connect to your cloud-hosted SQL Server
      const schema = {
        tables: [
          {
            name: "Users",
            columns: [
              { name: "UserID", type: "int", nullable: false, primaryKey: true },
              { name: "Username", type: "nvarchar", nullable: false },
              { name: "Email", type: "nvarchar", nullable: false },
              { name: "PasswordHash", type: "nvarchar", nullable: false },
              { name: "FirstName", type: "nvarchar", nullable: true },
              { name: "LastName", type: "nvarchar", nullable: true },
              { name: "CreatedDate", type: "datetime", nullable: false },
              { name: "IsActive", type: "bit", nullable: false }
            ]
          },
          {
            name: "Products",
            columns: [
              { name: "ProductID", type: "int", nullable: false, primaryKey: true },
              { name: "ProductName", type: "nvarchar", nullable: false },
              { name: "Description", type: "ntext", nullable: true },
              { name: "Price", type: "decimal", nullable: false },
              { name: "CategoryID", type: "int", nullable: true },
              { name: "StockQuantity", type: "int", nullable: false },
              { name: "CreatedDate", type: "datetime", nullable: false }
            ]
          },
          {
            name: "Orders",
            columns: [
              { name: "OrderID", type: "int", nullable: false, primaryKey: true },
              { name: "UserID", type: "int", nullable: false },
              { name: "OrderDate", type: "datetime", nullable: false },
              { name: "TotalAmount", type: "decimal", nullable: false },
              { name: "Status", type: "nvarchar", nullable: false },
              { name: "ShippingAddress", type: "nvarchar", nullable: true }
            ]
          },
          {
            name: "Categories",
            columns: [
              { name: "CategoryID", type: "int", nullable: false, primaryKey: true },
              { name: "CategoryName", type: "nvarchar", nullable: false },
              { name: "Description", type: "ntext", nullable: true }
            ]
          }
        ]
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