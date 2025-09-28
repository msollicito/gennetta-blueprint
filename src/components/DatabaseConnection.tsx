import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Database, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DatabaseConnectionProps {
  onConnectionSuccess: (connectionString: string, schema: any) => void;
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
      // Simulate database connection and schema analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock schema data for demo
      const mockSchema = {
        tables: [
          { name: "Users", columns: ["Id", "Name", "Email", "CreatedAt"] },
          { name: "Products", columns: ["Id", "Name", "Price", "CategoryId"] },
          { name: "Orders", columns: ["Id", "UserId", "ProductId", "Quantity", "OrderDate"] },
          { name: "Categories", columns: ["Id", "Name", "Description"] }
        ]
      };

      setConnectionStatus("success");
      toast({
        title: "Connection Successful!",
        description: `Found ${mockSchema.tables.length} tables in database.`,
      });

      onConnectionSuccess(connectionString, mockSchema);
    } catch (error) {
      setConnectionStatus("error");
      toast({
        title: "Connection Failed",
        description: "Unable to connect to the database. Please check your connection string.",
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
          Enter your SQL Server 2014+ connection string to analyze the database schema
        </p>
      </div>

      <Card className="p-6 shadow-card">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="connection-string" className="text-base font-semibold flex items-center gap-2">
              {getStatusIcon()}
              Database Connection String
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
                Connecting & Analyzing Schema...
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