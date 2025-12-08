import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Edit, Trash2, Box } from "lucide-react";

interface TokenCardProps {
  token: {
    name: string;
    value: string;
    type: string;
    category: string;
  };
  onClick?: () => void;
}

export function TokenCard({ token, onClick }: TokenCardProps) {
  const mockComponentCount = Math.floor(Math.random() * 8) + 2;

  return (
    <Card 
      className="shadow-soft hover:shadow-elevated transition-smooth cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-mono text-sm font-medium">{token.name}</h3>
              <Badge variant="secondary" className="text-xs font-normal">
                {token.type}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{token.category}</p>
          </div>
        </div>

        {/* Visual Value */}
        <div className="mb-4">
          {token.type === "Color" ? (
            <div className="flex items-center gap-3">
              <div 
                className="h-12 w-12 rounded-lg border border-border shadow-subtle flex-shrink-0"
                style={{ backgroundColor: token.value }}
              />
              <div className="flex-1 min-w-0">
                <span className="font-mono text-xs text-muted-foreground break-all">
                  {token.value}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
              <span className="font-mono text-sm">{token.value}</span>
            </div>
          )}
        </div>

        {/* Component Usage */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Box className="h-3 w-3" />
            <span>{mockComponentCount} componentes</span>
          </div>
        </div>

        {/* States for Color tokens */}
        {token.type === "Color" && (
          <div className="mb-4 flex gap-1">
            {["Default", "Hover", "Pressed", "Disabled"].map((state, index) => (
              <div
                key={state}
                className="flex-1 h-6 rounded border border-border"
                style={{
                  backgroundColor: token.value,
                  opacity: 1 - (index * 0.2)
                }}
                title={state}
              />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
