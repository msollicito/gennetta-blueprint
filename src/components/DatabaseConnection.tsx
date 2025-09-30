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
    setIsConnecting(true);
    setConnectionStatus("idle");

    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock database schema with sample tables
      const schema: DatabaseSchema = {
        tables: [
          {
            name: "Users",
            columns: [
              { name: "UserId", type: "int", nullable: false, primaryKey: true },
              { name: "Username", type: "varchar", nullable: false, primaryKey: false },
              { name: "Email", type: "varchar", nullable: false, primaryKey: false },
              { name: "PasswordHash", type: "varchar", nullable: false, primaryKey: false },
              { name: "FirstName", type: "varchar", nullable: true, primaryKey: false },
              { name: "LastName", type: "varchar", nullable: true, primaryKey: false },
              { name: "CreatedAt", type: "datetime", nullable: false, primaryKey: false },
              { name: "LastLoginAt", type: "datetime", nullable: true, primaryKey: false },
            ]
          },
          {
            name: "Products",
            columns: [
              { name: "ProductId", type: "int", nullable: false, primaryKey: true },
              { name: "ProductName", type: "varchar", nullable: false, primaryKey: false },
              { name: "Description", type: "text", nullable: true, primaryKey: false },
              { name: "Price", type: "decimal", nullable: false, primaryKey: false },
              { name: "StockQuantity", type: "int", nullable: false, primaryKey: false },
              { name: "CategoryId", type: "int", nullable: true, primaryKey: false },
              { name: "CreatedAt", type: "datetime", nullable: false, primaryKey: false },
              { name: "UpdatedAt", type: "datetime", nullable: true, primaryKey: false },
            ]
          },
          {
            name: "Orders",
            columns: [
              { name: "OrderId", type: "int", nullable: false, primaryKey: true },
              { name: "UserId", type: "int", nullable: false, primaryKey: false },
              { name: "OrderDate", type: "datetime", nullable: false, primaryKey: false },
              { name: "TotalAmount", type: "decimal", nullable: false, primaryKey: false },
              { name: "Status", type: "varchar", nullable: false, primaryKey: false },
              { name: "ShippingAddress", type: "text", nullable: true, primaryKey: false },
              { name: "ShippedAt", type: "datetime", nullable: true, primaryKey: false },
            ]
          },
          {
            name: "OrderItems",
            columns: [
              { name: "OrderItemId", type: "int", nullable: false, primaryKey: true },
              { name: "OrderId", type: "int", nullable: false, primaryKey: false },
              { name: "ProductId", type: "int", nullable: false, primaryKey: false },
              { name: "Quantity", type: "int", nullable: false, primaryKey: false },
              { name: "UnitPrice", type: "decimal", nullable: false, primaryKey: false },
              { name: "Subtotal", type: "decimal", nullable: false, primaryKey: false },
            ]
          },
          {
            name: "Categories",
            columns: [
              { name: "CategoryId", type: "int", nullable: false, primaryKey: true },
              { name: "CategoryName", type: "varchar", nullable: false, primaryKey: false },
              { name: "Description", type: "text", nullable: true, primaryKey: false },
            ]
          }
        ]
      };

      setConnectionStatus("success");
      toast({
        title: "Demo Database Loaded!",
        description: `Successfully loaded ${schema.tables.length} sample tables (Users, Products, Orders, OrderItems, Categories).`,
      });

      onConnectionSuccess("Demo Database - Sample Data", schema);
    } catch (error) {
      console.error('Demo load error:', error);
      setConnectionStatus("error");
      toast({
        title: "Failed to Load Demo",
        description: error instanceof Error ? error.message : "Unable to load demo data.",
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
          Demo Database Schema
        </h2>
        <p className="text-muted-foreground">
          Click connect to load sample database with Users, Products, Orders, and more
        </p>
      </div>

      <Card className="p-6 shadow-card">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex items-center gap-2">
              {getStatusIcon()}
              Demo Database Status
            </Label>
            {getStatusBadge()}
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Sample Tables Included:</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>• <strong>Users</strong> - User account information with credentials</div>
              <div>• <strong>Products</strong> - Product catalog with pricing and inventory</div>
              <div>• <strong>Orders</strong> - Customer orders with status tracking</div>
              <div>• <strong>OrderItems</strong> - Individual line items for each order</div>
              <div>• <strong>Categories</strong> - Product categorization</div>
            </div>
          </div>

          <Button 
            onClick={handleTestConnection}
            disabled={isConnecting}
            className="w-full"
            variant="hero"
            size="lg"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading Demo Data...
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                Load Demo Database
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DatabaseConnection;