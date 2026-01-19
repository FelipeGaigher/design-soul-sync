import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const userId = searchParams.get("userId");
    const provider = searchParams.get("provider");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setStatus("error");
      setError(getErrorMessage(errorParam));
      return;
    }

    if (accessToken && refreshToken && userId) {
      // Store tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userId", userId);
      
      if (provider) {
        localStorage.setItem("authProvider", provider);
      }

      setStatus("success");

      // Redirect to main app
      setTimeout(() => {
        navigate("/projects", { replace: true });
      }, 1500);
    } else {
      setStatus("error");
      setError("Parâmetros de autenticação inválidos");
    }
  }, [searchParams, navigate]);

  const getErrorMessage = (error: string): string => {
    const errors: Record<string, string> = {
      figma_auth_failed: "Falha na autenticação com Figma. Tente novamente.",
      github_auth_failed: "Falha na autenticação com GitHub. Tente novamente.",
      google_auth_failed: "Falha na autenticação com Google. Tente novamente.",
      no_code: "Código de autorização não recebido.",
      access_denied: "Acesso negado pelo usuário.",
    };
    return errors[error] || "Erro desconhecido na autenticação";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {status === "loading" && "Autenticando..."}
            {status === "success" && "Autenticação Concluída!"}
            {status === "error" && "Erro na Autenticação"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Aguarde enquanto processamos sua autenticação"}
            {status === "success" && "Você será redirecionado em instantes"}
            {status === "error" && error}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          {status === "loading" && (
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          )}
          {status === "success" && (
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          )}
          {status === "error" && (
            <>
              <XCircle className="h-16 w-16 text-destructive" />
              <Button onClick={() => navigate("/login")} className="w-full">
                Voltar para Login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
