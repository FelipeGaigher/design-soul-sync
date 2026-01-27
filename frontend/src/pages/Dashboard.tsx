import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FigmaImportDialog } from "@/components/figma/FigmaImportDialog";
import {
  Layers,
  GitBranch,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Trophy,
  User,
  Clock,
} from "lucide-react";

interface DashboardStats {
  newComponents: number;
  variations: number;
  consistency: number;
}

interface RecentChange {
  id: string;
  userName: string;
  userRole: string;
  componentName: string;
  action: string;
  projectName: string;
  timeAgo: string;
}

interface Alert {
  id: string;
  type: "warning" | "error";
  message: string;
  projectName: string;
}

interface ConsistentProject {
  id: string;
  name: string;
  consistency: number;
}

const FigmaIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M8 24C10.208 24 12 22.208 12 20V16H8C5.792 16 4 17.792 4 20C4 22.208 5.792 24 8 24Z" fill="#0ACF83"/>
    <path d="M4 12C4 9.792 5.792 8 8 8H12V16H8C5.792 16 4 14.208 4 12Z" fill="#A259FF"/>
    <path d="M4 4C4 1.792 5.792 0 8 0H12V8H8C5.792 8 4 6.208 4 4Z" fill="#F24E1E"/>
    <path d="M12 0H16C18.208 0 20 1.792 20 4C20 6.208 18.208 8 16 8H12V0Z" fill="#FF7262"/>
    <path d="M20 12C20 14.208 18.208 16 16 16C13.792 16 12 14.208 12 12C12 9.792 13.792 8 16 8C18.208 8 20 9.792 20 12Z" fill="#1ABCFE"/>
  </svg>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isFigmaImportOpen, setIsFigmaImportOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    newComponents: 0,
    variations: 0,
    consistency: 0,
  });
  const [recentChanges, setRecentChanges] = useState<RecentChange[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [topProject, setTopProject] = useState<ConsistentProject | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      // For now, use mock data since backend endpoints may not exist
      // In production, these would be real API calls:
      // const [statsRes, changesRes, alertsRes] = await Promise.all([
      //   fetch("/api/dashboard/stats", { headers: { Authorization: `Bearer ${token}` } }),
      //   fetch("/api/dashboard/recent-changes", { headers: { Authorization: `Bearer ${token}` } }),
      //   fetch("/api/dashboard/alerts", { headers: { Authorization: `Bearer ${token}` } }),
      // ]);

      // Mock data for demonstration
      setStats({
        newComponents: 12,
        variations: 3,
        consistency: 98,
      });

      setRecentChanges([
        {
          id: "1",
          userName: "Joao Silva",
          userRole: "Frontend Developer",
          componentName: "Button/Primary",
          action: "alterou",
          projectName: "DS Principal",
          timeAgo: "ha 2 horas",
        },
        {
          id: "2",
          userName: "Maria Santos",
          userRole: "UX Designer",
          componentName: "Card/Header",
          action: "adicionou",
          projectName: "E-commerce",
          timeAgo: "ha 5 horas",
        },
        {
          id: "3",
          userName: "Pedro Costa",
          userRole: "Frontend Developer",
          componentName: "Input/Search",
          action: "alterou",
          projectName: "DS Mobile",
          timeAgo: "ha 1 dia",
        },
      ]);

      setAlerts([
        {
          id: "1",
          type: "warning",
          message: "2 componentes com divergencia",
          projectName: "Mobile",
        },
        {
          id: "2",
          type: "error",
          message: "1 componente quebrado",
          projectName: "E-commerce",
        },
      ]);

      setTopProject({
        id: "1",
        name: "DS Principal",
        consistency: 98,
      });
    } catch (e) {
      console.error("Error fetching dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    if (role.toLowerCase().includes("frontend")) {
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    }
    if (role.toLowerCase().includes("ux") || role.toLowerCase().includes("designer")) {
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    }
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visao geral do seu Design System
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsFigmaImportOpen(true)}>
          <FigmaIcon className="h-4 w-4" />
          Importar do Figma
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Novos Componentes
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.newComponents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              adicionados recentemente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Variacoes
            </CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.variations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              detectadas em projetos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Consistencia
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.consistency}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              media dos projetos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Changes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Ultimas Alteracoes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentChanges.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nenhuma alteracao recente
              </p>
            ) : (
              recentChanges.map((change) => (
                <div
                  key={change.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{change.userName}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(
                          change.userRole
                        )}`}
                      >
                        {change.userRole}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {change.action}{" "}
                      <span className="font-medium text-foreground">
                        {change.componentName}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {change.timeAgo} | Projeto: {change.projectName}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Most Consistent Project */}
          {topProject && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Projeto Mais Consistente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => navigate(`/design-system/${topProject.id}`)}
                >
                  <div>
                    <p className="font-semibold text-lg">{topProject.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {topProject.consistency}% dos componentes sincronizados
                    </p>
                  </div>
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/40">
                    <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Alertas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.length === 0 ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Nenhum alerta ativo</span>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      alert.type === "error"
                        ? "bg-red-50 dark:bg-red-900/20"
                        : "bg-amber-50 dark:bg-amber-900/20"
                    }`}
                  >
                    {alert.type === "error" ? (
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    )}
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          alert.type === "error"
                            ? "text-red-700 dark:text-red-400"
                            : "text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {alert.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Projeto: {alert.projectName}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <FigmaImportDialog open={isFigmaImportOpen} onOpenChange={setIsFigmaImportOpen} />
    </div>
  );
}
