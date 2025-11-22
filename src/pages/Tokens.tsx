import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Copy, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const mockTokens = [
  { name: "color/primary-500", value: "#6BA5E7", type: "Color", category: "Colors" },
  { name: "color/accent-400", value: "#F0E4C8", type: "Color", category: "Colors" },
  { name: "spacing/md", value: "16px", type: "Spacing", category: "Layout" },
  { name: "spacing/lg", value: "24px", type: "Spacing", category: "Layout" },
  { name: "font/heading", value: "Inter", type: "Font Family", category: "Typography" },
  { name: "font/body", value: "Inter", type: "Font Family", category: "Typography" },
  { name: "radius/md", value: "0.75rem", type: "Border Radius", category: "Borders" },
  { name: "shadow/soft", value: "0 4px 12px rgba(0,0,0,0.06)", type: "Shadow", category: "Effects" },
];

export default function Tokens() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTokens = mockTokens.filter(token =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2">Tokens</h1>
          <p className="text-muted-foreground">
            Gerencie os tokens do seu Design System
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Token
        </Button>
      </div>

      <Card className="shadow-soft">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">Nome</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTokens.map((token, index) => (
                <TableRow 
                  key={index}
                  className="group transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-mono text-sm font-medium">
                    {token.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {token.type === "Color" && (
                        <div 
                          className="h-6 w-6 rounded border border-border shadow-subtle"
                          style={{ backgroundColor: token.value }}
                        />
                      )}
                      <span className="font-mono text-xs">{token.value}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {token.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {token.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Total de Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{mockTokens.length}</div>
            <p className="text-xs text-muted-foreground mt-1">8 categorias</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Última Atualização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">2h</div>
            <p className="text-xs text-muted-foreground mt-1">color/primary-500</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Status Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
              <span className="text-lg font-semibold">Sincronizado</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Com Figma</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
