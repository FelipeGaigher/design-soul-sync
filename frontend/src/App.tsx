import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute, PublicRoute } from "@/components/auth";
import { ProjectProvider } from "@/contexts/ProjectContext";
import Tokens from "./pages/Tokens";
import FigmaVariables from "./pages/FigmaVariables";
import Components from "./pages/Components";
import CodeGenerator from "./pages/CodeGenerator";
import Projects from "./pages/Projects";
import Benchmark from "./pages/Benchmark";
import AIAssistant from "./pages/AIAssistant";
import Versioning from "./pages/Versioning";
import ScenariosAutomation from "./pages/ScenariosAutomation";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ProjectProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rota raiz redireciona para login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Rota pública - Login */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            
            {/* Rotas protegidas */}
            <Route path="/tokens" element={
              <ProtectedRoute>
                <AppLayout><Tokens /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/figma-sync" element={
              <ProtectedRoute>
                <AppLayout><FigmaVariables /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/components" element={
              <ProtectedRoute>
                <AppLayout><Components /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/code-generator" element={
              <ProtectedRoute>
                <AppLayout><CodeGenerator /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <AppLayout><Projects /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/benchmark" element={
              <ProtectedRoute>
                <AppLayout><Benchmark /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/ai-assistant" element={
              <ProtectedRoute>
                <AppLayout><AIAssistant /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/versioning" element={
              <ProtectedRoute>
                <AppLayout><Versioning /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/scenarios" element={
              <ProtectedRoute>
                <AppLayout><ScenariosAutomation /></AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Rota 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ProjectProvider>
  </QueryClientProvider>
);

export default App;
