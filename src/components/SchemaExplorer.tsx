import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, ChevronRight, Database, FileCode, Settings } from "lucide-react";

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

interface SchemaExplorerProps {
  schema: {
    tables: Table[];
  };
  onProceedToGeneration: (selectedTables: string[]) => void;
}

const SchemaExplorer = ({ schema, onProceedToGeneration }: SchemaExplorerProps) => {
  const [selectedTables, setSelectedTables] = useState<string[]>(
    schema.tables.map(t => t.name) // Select all by default
  );
  const [expandedTables, setExpandedTables] = useState<string[]>([]);

  const toggleTableSelection = (tableName: string) => {
    setSelectedTables(prev => 
      prev.includes(tableName) 
        ? prev.filter(t => t !== tableName)
        : [...prev, tableName]
    );
  };

  const toggleTableExpanded = (tableName: string) => {
    setExpandedTables(prev => 
      prev.includes(tableName)
        ? prev.filter(t => t !== tableName)
        : [...prev, tableName]
    );
  };

  const selectAllTables = () => {
    setSelectedTables(schema.tables.map(t => t.name));
  };

  const deselectAllTables = () => {
    setSelectedTables([]);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Database Schema Analysis
        </h2>
        <p className="text-muted-foreground">
          Select tables to include in your .NET Core application
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <Database className="w-3 h-3" />
            {schema.tables.length} Tables Found
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2">
            <FileCode className="w-3 h-3" />
            {selectedTables.length} Selected
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={selectAllTables}
          >
            Select All
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={deselectAllTables}
          >
            Deselect All
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {schema.tables.map((table) => (
          <Card key={table.name} className="p-4 shadow-card hover:shadow-primary/10 transition-smooth">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedTables.includes(table.name)}
                  onCheckedChange={() => toggleTableSelection(table.name)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTableExpanded(table.name)}
                  className="p-0 h-auto"
                >
                  <ChevronRight 
                    className={`w-4 h-4 transition-transform ${
                      expandedTables.includes(table.name) ? 'rotate-90' : ''
                    }`}
                  />
                </Button>
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{table.name}</span>
                </div>
              </div>
              
              <Badge variant="secondary">
                {table.columns.length} columns
              </Badge>
            </div>

            {expandedTables.includes(table.name) && (
              <div className="mt-4 ml-8 pl-4 border-l-2 border-border">
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Columns:</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  {table.columns.map((column, index) => (
                    <div key={index} className="flex items-center justify-between py-1 px-2 bg-muted/30 rounded">
                      <span className="font-mono">{column.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {column.type}
                        </Badge>
                        {column.primaryKey && (
                          <Badge variant="default" className="text-xs px-1 py-0 bg-primary/10 text-primary">
                            PK
                          </Badge>
                        )}
                        {!column.nullable && (
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            NOT NULL
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-gradient-subtle border-primary/20">
        <div className="flex items-start gap-3">
          <Settings className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground">Generation Preview</h3>
            <p className="text-sm text-muted-foreground mb-3">
              GenNetta will generate the following for each selected table:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>• Entity Framework Models</div>
              <div>• Repository Patterns (CRUD)</div>
              <div>• MVC Controllers</div>
              <div>• API Endpoints (REST)</div>
              <div>• Microservice Architecture</div>
              <div>• Google OAuth 2.0 + JWT Auth</div>
            </div>
          </div>
        </div>
      </Card>

      <Button 
        onClick={() => onProceedToGeneration(selectedTables)}
        disabled={selectedTables.length === 0}
        variant="hero"
        size="xl"
        className="w-full"
      >
        <FileCode className="w-5 h-5" />
        Generate .NET Core Application ({selectedTables.length} tables)
      </Button>
    </div>
  );
};

export default SchemaExplorer;