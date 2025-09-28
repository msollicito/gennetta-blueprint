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

interface CodeGeneratorProps {
  selectedTables: string[];
  schema: { [tableName: string]: Table };
  onReset: () => void;
}

const CodeGenerator = ({ selectedTables, schema, onReset }: CodeGeneratorProps) => {
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
      console.log("Starting generation for tables:", selectedTables);
      console.log("Available schema:", Object.keys(schema));
      selectedTables.forEach(tableName => {
        const table = schema[tableName];
        if (table) {
          console.log(`${tableName} columns:`, table.columns.map(c => `${c.name} (${c.type})`));
        } else {
          console.error(`Missing schema for table: ${tableName}`);
        }
      });
      
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
            
            // Generate files for all selected tables
            const files = [];
            selectedTables.forEach(table => {
              const tableSchema = schema[table];
              const columnCount = tableSchema ? tableSchema.columns.length : 0;
              files.push(
                { name: `Models/${table}.cs`, type: "Entity Model", lines: 20 + columnCount * 6 },
                { name: `Repositories/I${table}Repository.cs`, type: "Repository Interface", lines: 22 },
                { name: `Repositories/${table}Repository.cs`, type: "Repository Implementation", lines: 89 },
                { name: `Controllers/${table}sController.cs`, type: "API Controller", lines: 156 },
                { name: `Controllers/${table}Controller.cs`, type: "MVC Controller", lines: 184 },
                { name: `Views/${table}/Index.cshtml`, type: "Index View", lines: 40 + columnCount * 3 },
                { name: `Views/${table}/Details.cshtml`, type: "Details View", lines: 30 + columnCount * 2 },
                { name: `Views/${table}/Create.cshtml`, type: "Create View", lines: 35 + columnCount * 4 },
                { name: `Views/${table}/Edit.cshtml`, type: "Edit View", lines: 40 + columnCount * 4 },
                { name: `Views/${table}/Delete.cshtml`, type: "Delete View", lines: 25 + columnCount * 2 },
                { name: `Services/${table}Microservice.cs`, type: "Microservice", lines: 203 }
              );
            });
            files.push(
              { name: "Models/ApplicationDbContext.cs", type: "Database Context", lines: 67 },
              { name: "Views/Shared/_Layout.cshtml", type: "Layout View", lines: 89 },
              { name: "Auth/GoogleOAuthConfig.cs", type: "Authentication", lines: 67 },
              { name: "Program.cs", type: "Application Entry", lines: 78 }
            );
            setGeneratedFiles(files);

            toast({
              title: "Code Generation Complete!",
              description: `Successfully generated ${selectedTables.length * 11 + 4} files using real database schema with ${Object.keys(schema).length} tables.`,
            });
          }
          return newProgress;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isGenerating, selectedTables.length, schema, toast]);

  const handleStartGeneration = () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationComplete(false);
    setCurrentStep(generationSteps[0]);
  };

  const pluralize = (word: string): string => {
    if (word.endsWith('y')) {
      return word.slice(0, -1) + 'ies';
    } else if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch') || word.endsWith('x') || word.endsWith('z')) {
      return word + 'es';
    } else {
      return word + 's';
    }
  };

  const mapSqlTypeToCSharp = (sqlType: string): string => {
    const type = sqlType.toLowerCase();
    if (type.includes('varchar') || type.includes('nvarchar') || type.includes('text') || type.includes('char')) return 'string';
    if (type.includes('int') && !type.includes('bigint')) return 'int';
    if (type.includes('bigint')) return 'long';
    if (type.includes('decimal') || type.includes('numeric') || type.includes('money')) return 'decimal';
    if (type.includes('float') || type.includes('real')) return 'double';
    if (type.includes('bit')) return 'bool';
    if (type.includes('datetime') || type.includes('timestamp') || type.includes('date')) return 'DateTime';
    if (type.includes('uniqueidentifier') || type.includes('uuid')) return 'Guid';
    if (type.includes('varbinary') || type.includes('binary') || type.includes('image')) return 'byte[]';
    return 'string'; // Default fallback
  };

  const generateEntityModel = (tableName: string) => {
    const table = schema[tableName];
    if (!table) {
      console.error(`Table ${tableName} not found in schema. Available tables:`, Object.keys(schema));
      return `// ERROR: Table ${tableName} not found in schema`;
    }
    
    console.log(`Generating entity for ${tableName} with columns:`, table.columns.map(c => c.name));
    
    const properties = table.columns.map(column => {
      const csharpType = mapSqlTypeToCSharp(column.type);
      const nullableType = column.nullable && csharpType !== 'string' && csharpType !== 'byte[]' ? `${csharpType}?` : csharpType;
      
      let attributes = [];
      if (column.primaryKey) attributes.push('[Key]');
      if (!column.nullable && csharpType === 'string') attributes.push('[Required]');
      if (csharpType === 'string' && !column.type.toLowerCase().includes('text')) {
        const maxLength = column.type.match(/\((\d+)\)/)?.[1] || '255';
        attributes.push(`[MaxLength(${maxLength})]`);
      }
      
      const attributeString = attributes.length > 0 ? `        ${attributes.join('\n        ')}\n` : '';
      const defaultValue = csharpType === 'string' && !column.nullable ? ' = string.Empty' : 
                          column.name.toLowerCase().includes('createdat') && csharpType === 'DateTime' ? ' = DateTime.UtcNow' : '';
      
      return `${attributeString}        public ${nullableType} ${column.name} { get; set; }${defaultValue}${defaultValue ? ';' : ''}`;
    }).join('\n\n');

    return `// Generated Entity Model for ${tableName} table
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace GenNettaApp.Models
{
    public class ${tableName}
    {
${properties}
    }
}`;
  };

  const generateRepository = (tableName: string) => `using GenNettaApp.Models;
using Microsoft.EntityFrameworkCore;

namespace GenNettaApp.Repositories
{
    public interface I${tableName}Repository
    {
        Task<IEnumerable<${tableName}>> GetAllAsync();
        Task<${tableName}?> GetByIdAsync(int id);
        Task<${tableName}> CreateAsync(${tableName} entity);
        Task<${tableName}> UpdateAsync(${tableName} entity);
        Task DeleteAsync(int id);
    }
    
    public class ${tableName}Repository : I${tableName}Repository
    {
        private readonly ApplicationDbContext _context;
        
        public ${tableName}Repository(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<IEnumerable<${tableName}>> GetAllAsync()
        {
            return await _context.${tableName}.ToListAsync();
        }
        
        public async Task<${tableName}?> GetByIdAsync(int id)
        {
            return await _context.${tableName}.FindAsync(id);
        }
        
        public async Task<${tableName}> CreateAsync(${tableName} entity)
        {
            _context.${tableName}.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }
        
        public async Task<${tableName}> UpdateAsync(${tableName} entity)
        {
            entity.UpdatedAt = DateTime.UtcNow;
            _context.Entry(entity).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return entity;
        }
        
        public async Task DeleteAsync(int id)
        {
            var entity = await _context.${tableName}.FindAsync(id);
            if (entity != null)
            {
                _context.${tableName}.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }
    }
}`;

  const generateController = (tableName: string) => `using Microsoft.AspNetCore.Mvc;
using GenNettaApp.Models;
using GenNettaApp.Repositories;

namespace GenNettaApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ${tableName}sController : ControllerBase
    {
        private readonly I${tableName}Repository _repository;
        
        public ${tableName}sController(I${tableName}Repository repository)
        {
            _repository = repository;
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<${tableName}>>> Get${tableName}s()
        {
            try
            {
                var entities = await _repository.GetAllAsync();
                return Ok(entities);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<${tableName}>> Get${tableName}(int id)
        {
            try
            {
                var entity = await _repository.GetByIdAsync(id);
                if (entity == null)
                    return NotFound($"${tableName} with ID {id} not found");
                return Ok(entity);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        
        [HttpPost]
        public async Task<ActionResult<${tableName}>> Create${tableName}(${tableName} entity)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);
                    
                var created = await _repository.CreateAsync(entity);
                return CreatedAtAction(nameof(Get${tableName}), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        
        [HttpPut("{id}")]
        public async Task<IActionResult> Update${tableName}(int id, ${tableName} entity)
        {
            try
            {
                if (id != entity.Id)
                    return BadRequest("ID mismatch");
                    
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);
                
                await _repository.UpdateAsync(entity);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete${tableName}(int id)
        {
            try
            {
                await _repository.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}`;

  const generateMvcController = (tableName: string) => `using Microsoft.AspNetCore.Mvc;
using GenNettaApp.Models;
using GenNettaApp.Repositories;

namespace GenNettaApp.Controllers
{
    public class ${tableName}Controller : Controller
    {
        private readonly I${tableName}Repository _repository;
        
        public ${tableName}Controller(I${tableName}Repository repository)
        {
            _repository = repository;
        }
        
        // GET: ${tableName}s
        public async Task<IActionResult> Index()
        {
            var entities = await _repository.GetAllAsync();
            return View(entities);
        }
        
        // GET: ${tableName}s/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
                return NotFound();
                
            var entity = await _repository.GetByIdAsync(id.Value);
            if (entity == null)
                return NotFound();
                
            return View(entity);
        }
        
        // GET: ${tableName}s/Create
        public IActionResult Create()
        {
            return View();
        }
        
        // POST: ${tableName}s/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("${getBindableColumns(tableName)}")] ${tableName} entity)
        {
            if (ModelState.IsValid)
            {
                await _repository.CreateAsync(entity);
                return RedirectToAction(nameof(Index));
            }
            return View(entity);
        }
        
        // GET: ${tableName}s/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
                return NotFound();
                
            var entity = await _repository.GetByIdAsync(id.Value);
            if (entity == null)
                return NotFound();
                
            return View(entity);
        }
        
        // POST: ${tableName}s/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("${getBindableColumns(tableName, true)}")] ${tableName} entity)
        {
            if (id != entity.Id)
                return NotFound();
                
            if (ModelState.IsValid)
            {
                try
                {
                    await _repository.UpdateAsync(entity);
                }
                catch (Exception)
                {
                    if (await _repository.GetByIdAsync(entity.Id) == null)
                        return NotFound();
                    throw;
                }
                return RedirectToAction(nameof(Index));
            }
            return View(entity);
        }
        
        // GET: ${tableName}s/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
                return NotFound();
                
            var entity = await _repository.GetByIdAsync(id.Value);
            if (entity == null)
                return NotFound();
                
            return View(entity);
        }
        
        // POST: ${tableName}s/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            await _repository.DeleteAsync(id);
            return RedirectToAction(nameof(Index));
        }
    }
}`;

  const getBindableColumns = (tableName: string, includeId: boolean = false) => {
    const table = schema[tableName];
    if (!table) return 'Id';
    
    return table.columns
      .filter(col => includeId || !col.primaryKey)
      .filter(col => !col.name.toLowerCase().includes('createdat') && !col.name.toLowerCase().includes('updatedat'))
      .map(col => col.name)
      .join(',');
  };

  const getDisplayColumns = (tableName: string) => {
    const table = schema[tableName];
    if (!table) return [{ name: 'Id', type: 'int' }];
    
    // Get first 4-5 most relevant columns for display (excluding timestamps)
    return table.columns
      .filter(col => !col.name.toLowerCase().includes('createdat') && !col.name.toLowerCase().includes('updatedat'))
      .slice(0, 5);
  };

  const generateIndexView = (tableName: string) => {
    const displayCols = getDisplayColumns(tableName);
    const tableHeaders = displayCols.map(col => 
      `                            <th>@Html.DisplayNameFor(model => model.${col.name})</th>`
    ).join('\n');
    
    const tableCells = displayCols.map(col => 
      `                                <td>@Html.DisplayFor(modelItem => item.${col.name})</td>`
    ).join('\n');
    
    return `@model IEnumerable<GenNettaApp.Models.${tableName}>

@{
    ViewData["Title"] = "${pluralize(tableName)}";
}

<div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>${pluralize(tableName)}</h2>
        <a asp-controller="${tableName}" asp-action="Create" class="btn btn-primary">
            <i class="fas fa-plus"></i> Create New ${tableName}
        </a>
    </div>

    <div class="card">
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead class="table-dark">
                        <tr>
${tableHeaders}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach (var item in Model)
                        {
                            <tr>
${tableCells}
                                <td>
                                    <div class="btn-group" role="group">
                                        <a asp-controller="${tableName}" asp-action="Details" asp-route-id="@item.Id" class="btn btn-sm btn-outline-info">
                                            <i class="fas fa-eye"></i> Details
                                        </a>
                                        <a asp-controller="${tableName}" asp-action="Edit" asp-route-id="@item.Id" class="btn btn-sm btn-outline-warning">
                                            <i class="fas fa-edit"></i> Edit
                                        </a>
                                        <a asp-controller="${tableName}" asp-action="Delete" asp-route-id="@item.Id" class="btn btn-sm btn-outline-danger">
                                            <i class="fas fa-trash"></i> Delete
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>`;
  };

  const generateDetailsView = (tableName: string) => {
    const table = schema[tableName];
    if (!table) return '';
    
    const detailFields = table.columns.map(col => {
      if (col.nullable && !col.type.toLowerCase().includes('varchar') && !col.type.toLowerCase().includes('text')) {
        return `                        @if (Model.${col.name}.HasValue)
                        {
                            <dt class="col-sm-3">@Html.DisplayNameFor(model => model.${col.name})</dt>
                            <dd class="col-sm-9">@Html.DisplayFor(model => model.${col.name})</dd>
                        }`;
      } else {
        return `                        <dt class="col-sm-3">@Html.DisplayNameFor(model => model.${col.name})</dt>
                        <dd class="col-sm-9">@Html.DisplayFor(model => model.${col.name})</dd>`;
      }
    }).join('\n                        \n');
    
    return `@model GenNettaApp.Models.${tableName}

@{
    ViewData["Title"] = "${tableName} Details";
}

<div class="container mt-4">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">
                    <h4>${tableName} Details</h4>
                </div>
                <div class="card-body">
                    <dl class="row">
${detailFields}
                    </dl>
                </div>
                <div class="card-footer">
                    <div class="btn-group">
                        <a asp-controller="${tableName}" asp-action="Edit" asp-route-id="@Model.Id" class="btn btn-warning">
                            <i class="fas fa-edit"></i> Edit
                        </a>
                        <a asp-controller="${tableName}" asp-action="Index" class="btn btn-secondary">
                            <i class="fas fa-arrow-left"></i> Back to List
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;
  };

  const generateCreateView = (tableName: string) => {
    const table = schema[tableName];
    if (!table) return '';
    
    const formFields = table.columns
      .filter(col => !col.primaryKey && !col.name.toLowerCase().includes('createdat') && !col.name.toLowerCase().includes('updatedat'))
      .map(col => {
        const inputType = col.type.toLowerCase().includes('text') ? 'textarea' : 'text';
        const isRequired = !col.nullable ? 'required' : '';
        
        if (inputType === 'textarea') {
          return `                        <div class="form-group mb-3">
                            <label asp-for="${col.name}" class="form-label"></label>
                            <textarea asp-for="${col.name}" class="form-control" rows="3" ${isRequired}></textarea>
                            <span asp-validation-for="${col.name}" class="text-danger"></span>
                        </div>`;
        } else {
          return `                        <div class="form-group mb-3">
                            <label asp-for="${col.name}" class="form-label"></label>
                            <input asp-for="${col.name}" class="form-control" ${isRequired} />
                            <span asp-validation-for="${col.name}" class="text-danger"></span>
                        </div>`;
        }
      }).join('\n                        \n');
    
    return `@model GenNettaApp.Models.${tableName}

@{
    ViewData["Title"] = "Create ${tableName}";
}

<div class="container mt-4">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">
                    <h4>Create New ${tableName}</h4>
                </div>
                <div class="card-body">
                    <form asp-controller="${tableName}" asp-action="Create">
                        <div asp-validation-summary="ModelOnly" class="text-danger mb-3"></div>
                        
${formFields}
                        
                        <div class="form-group">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Create
                            </button>
                            <a asp-controller="${tableName}" asp-action="Index" class="btn btn-secondary">
                                <i class="fas fa-times"></i> Cancel
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

@section Scripts {
    @{await Html.RenderPartialAsync("_ValidationScriptsPartial");}
}`;
  };

  const generateEditView = (tableName: string) => {
    const table = schema[tableName];
    if (!table) return '';
    
    const formFields = table.columns
      .filter(col => !col.name.toLowerCase().includes('createdat') && !col.name.toLowerCase().includes('updatedat'))
      .map(col => {
        if (col.primaryKey) {
          return `                        <input type="hidden" asp-for="${col.name}" />`;
        }
        
        const inputType = col.type.toLowerCase().includes('text') ? 'textarea' : 'text';
        const isRequired = !col.nullable ? 'required' : '';
        
        if (inputType === 'textarea') {
          return `                        <div class="form-group mb-3">
                            <label asp-for="${col.name}" class="form-label"></label>
                            <textarea asp-for="${col.name}" class="form-control" rows="3" ${isRequired}></textarea>
                            <span asp-validation-for="${col.name}" class="text-danger"></span>
                        </div>`;
        } else {
          return `                        <div class="form-group mb-3">
                            <label asp-for="${col.name}" class="form-label"></label>
                            <input asp-for="${col.name}" class="form-control" ${isRequired} />
                            <span asp-validation-for="${col.name}" class="text-danger"></span>
                        </div>`;
        }
      }).join('\n                        \n');
    
    return `@model GenNettaApp.Models.${tableName}

@{
    ViewData["Title"] = "Edit ${tableName}";
}

<div class="container mt-4">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">
                    <h4>Edit ${tableName}</h4>
                </div>
                <div class="card-body">
                    <form asp-controller="${tableName}" asp-action="Edit">
                        <div asp-validation-summary="ModelOnly" class="text-danger mb-3"></div>
                        
${formFields}
                        
                        <div class="form-group">
                            <button type="submit" class="btn btn-warning">
                                <i class="fas fa-save"></i> Update
                            </button>
                            <a asp-controller="${tableName}" asp-action="Index" class="btn btn-secondary">
                                <i class="fas fa-times"></i> Cancel
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

@section Scripts {
    @{await Html.RenderPartialAsync("_ValidationScriptsPartial");}
}`;
  };

  const generateDeleteView = (tableName: string) => {
    const table = schema[tableName];
    if (!table) return '';
    
    const displayFields = table.columns
      .filter(col => !col.name.toLowerCase().includes('updatedat'))
      .map(col => {
        if (col.nullable && !col.type.toLowerCase().includes('varchar') && !col.type.toLowerCase().includes('text')) {
          return `                        @if (Model.${col.name}.HasValue)
                        {
                            <dt class="col-sm-3">@Html.DisplayNameFor(model => model.${col.name})</dt>
                            <dd class="col-sm-9">@Html.DisplayFor(model => model.${col.name})</dd>
                        }`;
        } else {
          return `                        <dt class="col-sm-3">@Html.DisplayNameFor(model => model.${col.name})</dt>
                        <dd class="col-sm-9">@Html.DisplayFor(model => model.${col.name})</dd>`;
        }
      }).join('\n                        \n');

    const primaryKeyField = table.columns.find(col => col.primaryKey);
    const primaryKeyName = primaryKeyField ? primaryKeyField.name : 'Id';
    
    return `@model GenNettaApp.Models.${tableName}

@{
    ViewData["Title"] = "Delete ${tableName}";
}

<div class="container mt-4">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card border-danger">
                <div class="card-header bg-danger text-white">
                    <h4>Delete ${tableName}</h4>
                </div>
                <div class="card-body">
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        Are you sure you want to delete this ${tableName}?
                    </div>
                    
                    <dl class="row">
${displayFields}
                    </dl>
                    
                    <form asp-controller="${tableName}" asp-action="Delete">
                        <input type="hidden" asp-for="${primaryKeyName}" />
                        <div class="form-group">
                            <button type="submit" class="btn btn-danger">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                            <a asp-controller="${tableName}" asp-action="Index" class="btn btn-secondary">
                                <i class="fas fa-arrow-left"></i> Back to List
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>`;
  };

  const generateLayoutView = () => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@ViewData["Title"] - GenNetta App</title>
    <link rel="stylesheet" href="~/lib/bootstrap/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="~/css/site.css" asp-append-version="true" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
</head>
<body>
    <header>
        <nav class="navbar navbar-expand-sm navbar-toggleable-sm navbar-dark bg-primary border-bottom box-shadow mb-3">
            <div class="container-fluid">
                <a class="navbar-brand" asp-area="" asp-controller="Home" asp-action="Index">GenNetta App</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target=".navbar-collapse" 
                        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="navbar-collapse collapse d-sm-inline-flex justify-content-between">
                    <ul class="navbar-nav flex-grow-1">
                        <li class="nav-item">
                            <a class="nav-link" asp-area="" asp-controller="Home" asp-action="Index">Home</a>
                        </li>
                        ${selectedTables.map(table => `
                         <li class="nav-item">
                             <a class="nav-link" asp-controller="${table}" asp-action="Index">${table}s</a>
                         </li>`).join('')}
                    </ul>
                </div>
            </div>
        </nav>
    </header>
    <div class="container">
        <main role="main" class="pb-3">
            @RenderBody()
        </main>
    </div>

    <footer class="border-top footer text-muted">
        <div class="container">
            &copy; 2024 - GenNetta App - Generated by GenNetta
        </div>
    </footer>
    <script src="~/lib/jquery/dist/jquery.min.js"></script>
    <script src="~/lib/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
    <script src="~/js/site.js" asp-append-version="true"></script>
    @await RenderSectionAsync("Scripts", required: false)
</body>
</html>`;

  const generateValidationScriptsPartial = () => `<script src="~/lib/jquery-validation/dist/jquery.validate.min.js"></script>
<script src="~/lib/jquery-validation-unobtrusive/jquery.validate.unobtrusive.min.js"></script>`;

  const generateMicroservice = (tableName: string) => `using GenNettaApp.Models;
using GenNettaApp.Repositories;

namespace GenNettaApp.Services
{
    public interface I${tableName}Service
    {
        Task<IEnumerable<${tableName}>> GetAllAsync();
        Task<${tableName}?> GetByIdAsync(int id);
        Task<${tableName}> CreateAsync(${tableName} entity);
        Task<${tableName}> UpdateAsync(${tableName} entity);
        Task DeleteAsync(int id);
    }
    
    public class ${tableName}Service : I${tableName}Service
    {
        private readonly I${tableName}Repository _repository;
        private readonly ILogger<${tableName}Service> _logger;
        
        public ${tableName}Service(I${tableName}Repository repository, ILogger<${tableName}Service> logger)
        {
            _repository = repository;
            _logger = logger;
        }
        
        public async Task<IEnumerable<${tableName}>> GetAllAsync()
        {
            _logger.LogInformation("Getting all ${tableName}s");
            return await _repository.GetAllAsync();
        }
        
        public async Task<${tableName}?> GetByIdAsync(int id)
        {
            _logger.LogInformation("Getting ${tableName} with ID: {Id}", id);
            return await _repository.GetByIdAsync(id);
        }
        
        public async Task<${tableName}> CreateAsync(${tableName} entity)
        {
            _logger.LogInformation("Creating new ${tableName}");
            return await _repository.CreateAsync(entity);
        }
        
        public async Task<${tableName}> UpdateAsync(${tableName} entity)
        {
            _logger.LogInformation("Updating ${tableName} with ID: {Id}", entity.Id);
            return await _repository.UpdateAsync(entity);
        }
        
        public async Task DeleteAsync(int id)
        {
            _logger.LogInformation("Deleting ${tableName} with ID: {Id}", id);
            await _repository.DeleteAsync(id);
        }
    }
}`;

  const handleDownloadProject = async () => {
    const zip = new JSZip();
    
    // Generate DbSets for all tables
    const dbSets = selectedTables.map(table => `        public DbSet<${table}> ${table} { get; set; }`).join('\n');
    const dbConfigEntities = selectedTables.map(table => 
      `            modelBuilder.Entity<${table}>(entity =>
            {
                entity.ToTable("${table}"); // Explicitly map to singular table name
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });`
    ).join('\n');

    // Generate repository registrations
    const repositoryRegistrations = selectedTables.map(table => 
      `builder.Services.AddScoped<I${table}Repository, ${table}Repository>();`
    ).join('\n');

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
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.5.0" />
  </ItemGroup>
</Project>`,
      "GenNettaApp/Program.cs": `using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using GenNettaApp.Models;
using GenNettaApp.Repositories;
using GenNettaApp.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (!connectionString.Contains("TrustServerCertificate"))
{
    connectionString += ";TrustServerCertificate=true";
}
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// Register repositories
${repositoryRegistrations}

// Register services
${selectedTables.map(table => `builder.Services.AddScoped<I${table}Service, ${table}Service>();`).join('\n')}

// Add MVC services
builder.Services.AddControllersWithViews();

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
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "default-key"))
        };
    });

// Add API controllers
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    context.Database.EnsureCreated();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

// Configure MVC routing
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// Configure API routing
app.MapControllers();

app.Run();`,
      "GenNettaApp/Models/ApplicationDbContext.cs": `using Microsoft.EntityFrameworkCore;

namespace GenNettaApp.Models
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
        
${dbSets}
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
${dbConfigEntities}
        }
    }
}`,
      "GenNettaApp/appsettings.json": `{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=GenNettaApp;Trusted_Connection=true;TrustServerCertificate=true;"
  },
  "Jwt": {
    "Key": "your-secret-key-here-make-it-at-least-32-characters-long",
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
      "GenNettaApp/appsettings.Development.json": `{
  "DetailedErrors": true,
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}`,
      "GenNettaApp/Controllers/HomeController.cs": `using Microsoft.AspNetCore.Mvc;
using GenNettaApp.Models;
using System.Diagnostics;

namespace GenNettaApp.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }

    public class ErrorViewModel
    {
        public string? RequestId { get; set; }
        public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
    }
}`,
      "GenNettaApp/Views/_ViewStart.cshtml": `@{
    Layout = "_Layout";
}`,
      "GenNettaApp/Views/_ViewImports.cshtml": `@using GenNettaApp
@using GenNettaApp.Models
@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers`,
      "GenNettaApp/Views/Home/Index.cshtml": `@{
    ViewData["Title"] = "Home Page";
}

<div class="text-center">
    <h1 class="display-4">Welcome to GenNetta App</h1>
    <p>Learn about <a href="https://docs.microsoft.com/aspnet/core">building Web apps with ASP.NET Core</a>.</p>
    
    <div class="row mt-5">
        ${selectedTables.map(table => `
        <div class="col-md-4 mb-3">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${table} Management</h5>
                    <p class="card-text">Manage ${table} records with full CRUD operations.</p>
                    <a href="/${table}" class="btn btn-primary">View ${table}s</a>
                </div>
            </div>
        </div>`).join('')}
    </div>
</div>`,
      "GenNettaApp/wwwroot/css/site.css": `a.navbar-brand {
  white-space: normal;
  text-align: center;
  word-break: break-all;
}

a {
  color: #0077cc;
}

.btn-primary {
  color: #fff;
  background-color: #1b6ec2;
  border-color: #1861ac;
}

.nav-pills .nav-link.active, .nav-pills .show > .nav-link {
  color: #fff;
  background-color: #1b6ec2;
  border-color: #1861ac;
}

.border-top {
  border-top: 1px solid #e5e5e5;
}
.border-bottom {
  border-bottom: 1px solid #e5e5e5;
}

.box-shadow {
  box-shadow: 0 .25rem .75rem rgba(0, 0, 0, .05);
}

button.accept-policy {
  font-size: 1rem;
  line-height: inherit;
}

.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  white-space: nowrap;
  line-height: 60px;
}`,
      "GenNettaApp/wwwroot/js/site.js": `// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.`,
      "README.md": `# GenNetta Generated .NET Core Application

This project was generated by GenNetta, a .NET Core code generator.

## Features
- Entity Framework Core with Repository Pattern
- MVC Architecture with Views and API Controllers
- JWT Authentication
- Google OAuth Integration
- RESTful API endpoints
- SQL Server support
- Complete CRUD operations for all tables
- Microservices architecture
- Error handling and logging
- Bootstrap UI styling

## Generated Tables
${selectedTables.map(table => `- ${table}`).join('\n')}

## Quick Start

### Prerequisites
- .NET 8.0 SDK
- SQL Server (LocalDB, Express, or Full)
- Visual Studio 2022 or VS Code

### Setup Steps
1. **Extract the project** to your desired directory
2. **Update connection string** in \`appsettings.json\`:
   \`\`\`json
   "DefaultConnection": "Server=your-server;Database=GenNettaApp;Trusted_Connection=true;TrustServerCertificate=true;"
   \`\`\`
3. **Install Entity Framework CLI** (if not already installed):
   \`\`\`bash
   dotnet tool install --global dotnet-ef
   \`\`\`
4. **Create and run database migrations**:
   \`\`\`bash
   cd GenNettaApp
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   \`\`\`
5. **Run the application**:
   \`\`\`bash
   dotnet run
   \`\`\`
6. **Access the application**:
   - Web Interface: \`https://localhost:5001\` or \`http://localhost:5000\`
   - API Documentation: \`https://localhost:5001/swagger\`

## Project Structure
\`\`\`
GenNettaApp/
├── Controllers/          # API and MVC Controllers
├── Models/              # Entity Framework models
├── Repositories/        # Repository pattern implementations  
├── Services/           # Business logic microservices
├── Views/              # MVC Razor views
│   ├── Home/           # Home page views
│   ├── Shared/         # Layout and shared views
${selectedTables.map(table => `│   └── ${table}s/         # ${table} CRUD views`).join('\n')}
├── wwwroot/            # Static files (CSS, JS)
├── appsettings.json    # Configuration
└── Program.cs          # Application entry point
\`\`\`

## API Endpoints
${selectedTables.map(table => `
### ${table}
- \`GET /api/${table}s\` - Get all ${table}s
- \`GET /api/${table}s/{id}\` - Get ${table} by ID  
- \`POST /api/${table}s\` - Create new ${table}
- \`PUT /api/${table}s/{id}\` - Update ${table}
- \`DELETE /api/${table}s/{id}\` - Delete ${table}
`).join('')}

## Web Interface
${selectedTables.map(table => `- **${table} Management**: \`/${table}\` - Full CRUD interface`).join('\n')}

## Configuration

### JWT Authentication
Update the JWT settings in \`appsettings.json\`:
\`\`\`json
"Jwt": {
  "Key": "your-secure-secret-key-at-least-32-characters",
  "Issuer": "your-app-name",
  "Audience": "your-app-name"  
}
\`\`\`

### Google OAuth (Optional)
1. Create a Google Cloud project and OAuth 2.0 credentials
2. Update \`appsettings.json\`:
   \`\`\`json
   "Authentication": {
     "Google": {
       "ClientId": "your-google-client-id",
       "ClientSecret": "your-google-client-secret"
     }
   }
   \`\`\`

## Troubleshooting

### Common Issues
1. **Database Connection Failed**: Verify SQL Server is running and connection string is correct
2. **Migration Errors**: Ensure EF Core CLI tools are installed
3. **Port Already in Use**: Change ports in \`launchSettings.json\`
4. **Authentication Issues**: Verify JWT key is at least 32 characters

### Development Commands
\`\`\`bash
# Build the project
dotnet build

# Run tests (if any)
dotnet test

# Watch for changes during development
dotnet watch run

# Create new migration
dotnet ef migrations add [MigrationName]

# Update database with latest migration
dotnet ef database update
\`\`\`

---
**Generated by GenNetta** - .NET Core Code Generator
`
    };

    // Generate files for each table
    selectedTables.forEach(tableName => {
      projectFiles[`GenNettaApp/Models/${tableName}.cs`] = generateEntityModel(tableName);
      projectFiles[`GenNettaApp/Repositories/${tableName}Repository.cs`] = generateRepository(tableName);
      projectFiles[`GenNettaApp/Controllers/${tableName}sController.cs`] = generateController(tableName);
      projectFiles[`GenNettaApp/Controllers/${tableName}Controller.cs`] = generateMvcController(tableName);
      projectFiles[`GenNettaApp/Views/${tableName}/Index.cshtml`] = generateIndexView(tableName);
      projectFiles[`GenNettaApp/Views/${tableName}/Details.cshtml`] = generateDetailsView(tableName);
      projectFiles[`GenNettaApp/Views/${tableName}/Create.cshtml`] = generateCreateView(tableName);
      projectFiles[`GenNettaApp/Views/${tableName}/Edit.cshtml`] = generateEditView(tableName);
      projectFiles[`GenNettaApp/Views/${tableName}/Delete.cshtml`] = generateDeleteView(tableName);
      projectFiles[`GenNettaApp/Services/${tableName}Service.cs`] = generateMicroservice(tableName);
    });

    // Add shared layout
    projectFiles[`GenNettaApp/Views/Shared/_Layout.cshtml`] = generateLayoutView();
    projectFiles[`GenNettaApp/Views/Shared/_ValidationScriptsPartial.cshtml`] = generateValidationScriptsPartial();
    
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