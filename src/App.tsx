import { Toast } from "@/components/ui/toast";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Index from "./pages/Index";
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
import AddFigmaWizard from "./pages/AddFigmaWizard";
import DesignSystemDetails from "./pages/DesignSystemDetails";
import Dashboard from "./pages/Dashboard"; // Ensure imported if distinct from Index

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/add-figma" element={<AppLayout><AddFigmaWizard /></AppLayout>} />
            <Route path="/design-systems/:id" element={<AppLayout><DesignSystemDetails /></AppLayout>} />
            <Route path="/tokens" element={<AppLayout><Tokens /></AppLayout>} />
            <Route path="/figma-sync" element={<AppLayout><FigmaVariables /></AppLayout>} />
            <Route path="/components" element={<AppLayout><Components /></AppLayout>} />
            <Route path="/code-generator" element={<AppLayout><CodeGenerator /></AppLayout>} />
            <Route path="/projects" element={<AppLayout><Projects /></AppLayout>} />
            <Route path="/benchmark" element={<AppLayout><Benchmark /></AppLayout>} />
            <Route path="/ai-assistant" element={<AppLayout><AIAssistant /></AppLayout>} />
            <Route path="/versioning" element={<AppLayout><Versioning /></AppLayout>} />
            <Route path="/scenarios" element={<AppLayout><ScenariosAutomation /></AppLayout>} />
            <Route path="/login" element={<Login />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
