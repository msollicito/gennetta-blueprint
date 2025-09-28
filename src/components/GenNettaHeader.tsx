import { Code2, Zap } from "lucide-react";
import genNettaLogo from "@/assets/gennetta-logo.png";

const GenNettaHeader = () => {
  return (
    <header className="bg-gradient-hero border-b border-border/20 shadow-primary">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={genNettaLogo} 
                alt="GenNetta Logo" 
                className="w-12 h-12 rounded-lg shadow-glow"
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground flex items-center gap-2">
                GenNetta
                <Code2 className="w-6 h-6" />
              </h1>
              <p className="text-primary-foreground/80 text-sm">
                .NET Core Code Generator
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-primary-foreground/90">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">
              Powered by SQL Server Analysis
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default GenNettaHeader;