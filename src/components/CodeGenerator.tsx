import { useState, useEffect } from "react";
import JSZip from "jszip";
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

  const handleDownloadProject = async () => {
    const zip = new JSZip();
    
    // Create project structure
    const projectFiles = {
      "GenNettaApp.sln": `Microsoft Visual Studio Solution File, Format Version 12.00
# Visual Studio Version 17
VisualStudioVersion = 17.0.31903.59
MinimumVisualStudioVersion = 10.0.40219.1
Project("{9A19103F-16F7-4668-BE54-9A1E7A4F7556}") = "GenNettaApp", "GenNettaApp\\GenNettaApp.csproj", "{${Math.random().toString(36).substring(7).toUpperCase()}}"
EndProject
Global
	GlobalSection(SolutionConfigurationPlatforms) = preSolution
		Debug|Any CPU = Debug|Any CPU
		Release|Any CPU = Release|Any CPU
	EndGlobalSection
EndGlobal`,
      "GenNettaApp/GenNettaApp.csproj": `<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.0" />
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.0" />
    <PackageReference Include="Microsoft.AspNetCore.Authentication.Google" Version="8.0.0" />
  </ItemGroup>
</Project>`,
      "GenNettaApp/Program.cs": `using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add JWT authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();`,
      "GenNettaApp/Models/User.cs": mockCodePreview,
      "GenNettaApp/Models/ApplicationDbContext.cs": `using Microsoft.EntityFrameworkCore;

namespace GenNettaApp.Models
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
        
        public DbSet<User> Users { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });
        }
    }
}`,
      "GenNettaApp/Repositories/IUserRepository.cs": `using GenNettaApp.Models;

namespace GenNettaApp.Repositories
{
    public interface IUserRepository
    {
        Task<IEnumerable<User>> GetAllAsync();
        Task<User?> GetByIdAsync(int id);
        Task<User> CreateAsync(User user);
        Task<User> UpdateAsync(User user);
        Task DeleteAsync(int id);
    }
}`,
      "GenNettaApp/Repositories/UserRepository.cs": `using GenNettaApp.Models;
using Microsoft.EntityFrameworkCore;

namespace GenNettaApp.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;
        
        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users.ToListAsync();
        }
        
        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }
        
        public async Task<User> CreateAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }
        
        public async Task<User> UpdateAsync(User user)
        {
            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return user;
        }
        
        public async Task DeleteAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user != null)
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
            }
        }
    }
}`,
      "GenNettaApp/Controllers/UsersController.cs": `using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GenNettaApp.Models;
using GenNettaApp.Repositories;

namespace GenNettaApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        
        public UsersController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            var users = await _userRepository.GetAllAsync();
            return Ok(users);
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                return NotFound();
            return Ok(user);
        }
        
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(User user)
        {
            var createdUser = await _userRepository.CreateAsync(user);
            return CreatedAtAction(nameof(GetUser), new { id = createdUser.Id }, createdUser);
        }
        
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, User user)
        {
            if (id != user.Id)
                return BadRequest();
            
            await _userRepository.UpdateAsync(user);
            return NoContent();
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            await _userRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}`,
      "GenNettaApp/appsettings.json": `{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=GenNettaApp;Trusted_Connection=true;TrustServerCertificate=true;"
  },
  "Jwt": {
    "Key": "your-secret-key-here",
    "Issuer": "GenNettaApp",
    "Audience": "GenNettaApp"
  },
  "Authentication": {
    "Google": {
      "ClientId": "your-google-client-id",
      "ClientSecret": "your-google-client-secret"
    }
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}`,
      "README.md": `# GenNetta Generated .NET Core Application

This project was generated by GenNetta, a .NET Core code generator.

## Features
- Entity Framework Core with Repository Pattern
- MVC Architecture
- JWT Authentication
- Google OAuth Integration
- RESTful API endpoints
- SQL Server support

## Setup
1. Update the connection string in appsettings.json
2. Configure Google OAuth credentials
3. Run database migrations: \`dotnet ef database update\`
4. Run the application: \`dotnet run\`

## Generated for Tables: ${selectedTables.join(', ')}
`
    };
    
    // Add all files to zip
    Object.entries(projectFiles).forEach(([path, content]) => {
      zip.file(path, content);
    });
    
    // Generate and download zip
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GenNettaApp_${selectedTables.join('_')}_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Complete!",
      description: "Your .NET Core project has been downloaded successfully.",
    });
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
            <Button variant="hero" size="lg" className="flex-1" onClick={handleDownloadProject}>
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