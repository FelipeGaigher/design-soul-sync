import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, projectsService } from '@/services/projects.service';
import { authService } from '@/services/auth.service';

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  isLoading: boolean;
  error: string | null;
  setActiveProject: (project: Project | null) => void;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const ACTIVE_PROJECT_KEY = 'activeProjectId';

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProjectState] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    if (!authService.isAuthenticated()) {
      setProjects([]);
      setActiveProjectState(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await projectsService.getAll();
      setProjects(data);

      // Restaurar projeto ativo do localStorage
      const savedProjectId = localStorage.getItem(ACTIVE_PROJECT_KEY);
      if (savedProjectId) {
        const savedProject = data.find(p => p.id === savedProjectId);
        if (savedProject) {
          setActiveProjectState(savedProject);
        } else if (data.length > 0) {
          setActiveProjectState(data[0]);
          localStorage.setItem(ACTIVE_PROJECT_KEY, data[0].id);
        }
      } else if (data.length > 0) {
        setActiveProjectState(data[0]);
        localStorage.setItem(ACTIVE_PROJECT_KEY, data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar projetos');
    } finally {
      setIsLoading(false);
    }
  };

  const setActiveProject = (project: Project | null) => {
    setActiveProjectState(project);
    if (project) {
      localStorage.setItem(ACTIVE_PROJECT_KEY, project.id);
    } else {
      localStorage.removeItem(ACTIVE_PROJECT_KEY);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        isLoading,
        error,
        setActiveProject,
        refreshProjects: fetchProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
