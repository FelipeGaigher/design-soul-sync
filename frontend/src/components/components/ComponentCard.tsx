import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Code, Copy } from "lucide-react";

interface ComponentCardProps {
  component: {
    name: string;
    description: string;
    variants: number;
    tokens: number;
    category: string;
  };
  onClick?: () => void;
}

export function ComponentCard({ component, onClick }: ComponentCardProps) {
  return (
    <Card 
      className="shadow-soft hover:shadow-elevated transition-smooth cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="space-y-4">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-lg">{component.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {component.category}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {component.description}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{component.variants} variantes</span>
            <span>•</span>
            <span>{component.tokens} tokens</span>
          </div>

          <div className="pt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 gap-2"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Eye className="h-3 w-3" />
              Preview
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 gap-2"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Code className="h-3 w-3" />
              Código
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
