import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  FileCode, 
  Download, 
  Eye, 
  CheckCircle, 
  Loader2, 
  Zap,
  Database,
  Server,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CodeGeneratorProps {
  selectedTables: string[];
  onReset: () => void;
}

const CodeGenerator = ({ selectedTables, onReset }: CodeGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [generatedFiles, setGeneratedFiles] = useState<any[]>([]);
  const { toast } = useToast();

  const generationSteps = [
    "Analyzing database schema...",
    "Generating Entity Framework models...",
    "Creating repository patterns...",
    "Building MVC controllers...",
    "Setting up microservices...",
    "Configuring authentication...",
    "Generating API endpoints...",
    "Finalizing project structure..."
  ];

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setGenerationProgress(prev => {
          const newProgress = Math.min(prev + 12.5, 100);
          if (newProgress < 100) {
            const stepIndex = Math.floor(newProgress / 12.5);
            setCurrentStep(generationSteps[stepIndex] || "Generating code...");
          } else {
            setCurrentStep("Generation complete!");
            setGenerationComplete(true);
            setIsGenerating(false);
            
            // Mock generated files
            setGeneratedFiles([
              { name: "Models/User.cs", type: "Entity Model", lines: 45 },
              { name: "Models/Product.cs", type: "Entity Model", lines: 38 },
              { name: "Repositories/IUserRepository.cs", type: "Repository Interface", lines: 22 },
              { name: "Repositories/UserRepository.cs", type: "Repository Implementation", lines: 89 },
              { name: "Controllers/UsersController.cs", type: "MVC Controller", lines: 156 },
              { name: "Services/UserMicroservice.cs", type: "Microservice", lines: 203 },
              { name: "Auth/GoogleOAuthConfig.cs", type: "Authentication", lines: 67 },
              { name: "Program.cs", type: "Application Entry", lines: 78 }
            ]);

            toast({
              title: "Code Generation Complete!",
              description: `Successfully generated ${selectedTables.length * 8} files for your .NET Core application.`,
            });
          }
          return newProgress;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isGenerating, selectedTables.length, toast]);

  const handleStartGeneration = () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationComplete(false);
    setCurrentStep(generationSteps[0]);
  };

  const mockCodePreview = `
// Generated Entity Model for User table
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace GenNettaApp.Models
{
    [Index(nameof(Email), IsUnique = true)]
    public class User
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}`;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          .NET Core Code Generation
        </h2>
        <p className="text-muted-foreground">
          Generating complete application for {selectedTables.length} selected tables
        </p>
      </div>

      {!isGenerating && !generationComplete && (
        <Card className="p-6 shadow-card">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Ready to Generate</h3>
              <p className="text-muted-foreground mb-4">
                GenNetta will create a complete .NET Core application with Entity Framework, 
                Repository patterns, MVC architecture, microservices, and Google OAuth authentication.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Database className="w-6 h-6 text-primary" />
                  <span className="text-sm font-medium">EF Core Models</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <FileCode className="w-6 h-6 text-primary" />
                  <span className="text-sm font-medium">Repository Pattern</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Server className="w-6 h-6 text-primary" />
                  <span className="text-sm font-medium">Microservices</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Lock className="w-6 h-6 text-primary" />
                  <span className="text-sm font-medium">OAuth + JWT</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleStartGeneration}
              variant="hero"
              size="xl"
              className="w-full"
            >
              <Zap className="w-5 h-5" />
              Start Code Generation
            </Button>
          </div>
        </Card>
      )}

      {isGenerating && (
        <Card className="p-6 shadow-card">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="font-semibold">Generating Your .NET Core Application</span>
            </div>
            
            <Progress value={generationProgress} className="h-2" />
            
            <div className="text-sm text-muted-foreground">
              {currentStep}
            </div>
            
            <div className="text-xs text-muted-foreground">
              {Math.round(generationProgress)}% complete
            </div>
          </div>
        </Card>
      )}

      {generationComplete && (
        <div className="space-y-6">
          <Card className="p-6 shadow-card border-success/20 bg-success/5">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-success" />
              <div>
                <h3 className="font-semibold text-success">Generation Complete!</h3>
                <p className="text-sm text-muted-foreground">
                  Your .NET Core application has been successfully generated.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-success">{generatedFiles.length}</div>
                <div className="text-sm text-muted-foreground">Files Generated</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success">{selectedTables.length}</div>
                <div className="text-sm text-muted-foreground">Tables Processed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success">
                  {generatedFiles.reduce((sum, file) => sum + file.lines, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Lines of Code</div>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="preview" className="space-y-4">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="preview">Code Preview</TabsTrigger>
              <TabsTrigger value="files">Generated Files</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview">
              <Card className="p-4 shadow-card">
                <div className="flex items-center gap-2 mb-4">
                  <FileCode className="w-4 h-4 text-primary" />
                  <span className="font-semibold">Models/User.cs</span>
                  <Badge variant="outline">Entity Model</Badge>
                </div>
                <pre className="bg-code text-code-foreground p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  {mockCodePreview}
                </pre>
              </Card>
            </TabsContent>
            
            <TabsContent value="files">
              <div className="grid gap-2">
                {generatedFiles.map((file, index) => (
                  <Card key={index} className="p-3 shadow-card hover:shadow-primary/10 transition-smooth">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileCode className="w-4 h-4 text-primary" />
                        <div>
                          <div className="font-medium">{file.name}</div>
                          <div className="text-sm text-muted-foreground">{file.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{file.lines} lines</Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-4">
            <Button variant="hero" size="lg" className="flex-1">
              <Download className="w-4 h-4" />
              Download Complete Project
            </Button>
            <Button variant="outline" size="lg" onClick={onReset}>
              Generate Another Project
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeGenerator;