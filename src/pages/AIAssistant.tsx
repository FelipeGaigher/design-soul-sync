import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, User, Bot } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou o assistente TokenSync. Como posso ajudar com seu Design System hoje?"
    }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: "user", content: input }]);
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Entendi! Posso ajudar você com isso. Para criar um novo token de cor, você pode ir até a página de Tokens e clicar em 'Novo Token'. Quer que eu te guie passo a passo?"
      }]);
    }, 1000);

    setInput("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-12rem)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="mb-1">Assistente IA</h1>
          <p className="text-sm text-muted-foreground">
            Pergunte qualquer coisa sobre seu Design System
          </p>
        </div>
      </div>

      <Card className="shadow-elevated h-[calc(100%-8rem)]">
        <CardContent className="p-0 h-full flex flex-col">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>

                  {message.role === "user" && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary flex-shrink-0">
                      <User className="h-4 w-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua pergunta..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Dica: Pergunte sobre tokens, componentes, ou como melhorar seu Design System
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-soft cursor-pointer transition-smooth hover:shadow-elevated hover:border-primary">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">Criar Token</h3>
            <p className="text-xs text-muted-foreground">
              "Como criar um token de espaçamento?"
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft cursor-pointer transition-smooth hover:shadow-elevated hover:border-primary">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">Sincronizar Figma</h3>
            <p className="text-xs text-muted-foreground">
              "Como sincronizar variáveis do Figma?"
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft cursor-pointer transition-smooth hover:shadow-elevated hover:border-primary">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">Exportar Código</h3>
            <p className="text-xs text-muted-foreground">
              "Como exportar tokens para CSS?"
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
