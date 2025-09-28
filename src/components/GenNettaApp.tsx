import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GenNettaHeader from "./GenNettaHeader";
import DatabaseConnection from "./DatabaseConnection";
import SchemaExplorer from "./SchemaExplorer";
import CodeGenerator from "./CodeGenerator";

type AppStep = "connection" | "schema" | "generation";

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
  tables: { name: string; columns: Column[] }[];
}

const GenNettaApp = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>("connection");
  const [connectionString, setConnectionString] = useState("");
  const [databaseSchema, setDatabaseSchema] = useState<DatabaseSchema | null>(null);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);

  const handleConnectionSuccess = (connStr: string, schema: DatabaseSchema) => {
    setConnectionString(connStr);
    setDatabaseSchema(schema);
    setCurrentStep("schema");
  };

  const handleProceedToGeneration = (tables: string[]) => {
    setSelectedTables(tables);
    setCurrentStep("generation");
  };

  const handleReset = () => {
    setCurrentStep("connection");
    setConnectionString("");
    setDatabaseSchema(null);
    setSelectedTables([]);
  };

  const isStepCompleted = (step: AppStep): boolean => {
    switch (step) {
      case "connection":
        return !!databaseSchema;
      case "schema":
        return selectedTables.length > 0;
      case "generation":
        return false; // Generation is always the final step
    }
  };

  const isStepAccessible = (step: AppStep): boolean => {
    switch (step) {
      case "connection":
        return true;
      case "schema":
        return !!databaseSchema;
      case "generation":
        return selectedTables.length > 0;
    }
  };

  const convertSchemaToMap = (schema: DatabaseSchema) => {
    const schemaMap: { [tableName: string]: Table } = {};
    schema.tables.forEach(table => {
      schemaMap[table.name] = table;
    });
    return schemaMap;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <GenNettaHeader />
      
      <main className="container mx-auto px-6 py-8">
        <Tabs value={currentStep} onValueChange={(value) => {
          if (isStepAccessible(value as AppStep)) {
            setCurrentStep(value as AppStep);
          }
        }}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger 
              value="connection" 
              className="flex items-center gap-2"
              disabled={!isStepAccessible("connection")}
            >
              <div className={`w-2 h-2 rounded-full ${
                isStepCompleted("connection") 
                  ? 'bg-success' 
                  : currentStep === "connection" 
                    ? 'bg-primary' 
                    : 'bg-muted'
              }`} />
              Database Connection
            </TabsTrigger>
            <TabsTrigger 
              value="schema" 
              className="flex items-center gap-2"
              disabled={!isStepAccessible("schema")}
            >
              <div className={`w-2 h-2 rounded-full ${
                isStepCompleted("schema") 
                  ? 'bg-success' 
                  : currentStep === "schema" 
                    ? 'bg-primary' 
                    : 'bg-muted'
              }`} />
              Schema Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="generation" 
              className="flex items-center gap-2"
              disabled={!isStepAccessible("generation")}
            >
              <div className={`w-2 h-2 rounded-full ${
                currentStep === "generation" 
                  ? 'bg-primary' 
                  : 'bg-muted'
              }`} />
              Code Generation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connection" className="mt-0">
            <DatabaseConnection onConnectionSuccess={handleConnectionSuccess} />
          </TabsContent>

          <TabsContent value="schema" className="mt-0">
            {databaseSchema && (
              <SchemaExplorer 
                schema={databaseSchema} 
                onProceedToGeneration={handleProceedToGeneration}
              />
            )}
          </TabsContent>

          <TabsContent value="generation" className="mt-0">
            {databaseSchema && (
              <CodeGenerator 
                selectedTables={selectedTables}
                schema={convertSchemaToMap(databaseSchema)}
                onReset={handleReset}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default GenNettaApp;