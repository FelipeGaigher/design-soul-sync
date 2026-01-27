import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute, PublicRoute } from "@/components/auth";
import { ProjectProvider } from "@/contexts/ProjectContext";
import Login from "./pages/Login";
import OAuthCallback from "./pages/OAuthCallback";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import ImportFlow from "./pages/ImportFlow";
import DesignSystemView from "./pages/DesignSystemView";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ProjectProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rota raiz e dashboard */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            } />

            {/* Rota publica - Login */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />

            {/* Rota publica - OAuth Callback */}
            <Route path="/oauth/callback" element={<OAuthCallback />} />

            {/* Rotas protegidas */}
            <Route path="/projects" element={
              <ProtectedRoute>
                <AppLayout><Projects /></AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/users" element={
              <ProtectedRoute>
                <AppLayout><Users /></AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute>
                <AppLayout><Settings /></AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/import/:projectId" element={
              <ProtectedRoute>
                <AppLayout><ImportFlow /></AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/design-system/:id" element={
              <ProtectedRoute>
                <AppLayout><DesignSystemView /></AppLayout>
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
