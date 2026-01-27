import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronsUpDown, Building2, FolderOpen, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Project {
  id: string;
  name: string;
  companyId: string | null;
  companyName: string | null;
  alertsCount: number;
  status: string;
}

interface GroupedProjects {
  companyId: string | null;
  companyName: string;
  projects: Project[];
}

interface ProjectSelectorProps {
  currentProjectId?: string;
  onProjectChange?: (projectId: string) => void;
}

export function ProjectSelector({ currentProjectId, onProjectChange }: ProjectSelectorProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (e) {
      console.error("Error fetching projects:", e);
    } finally {
      setLoading(false);
    }
  };

  // Group projects by company
  const groupedProjects: GroupedProjects[] = projects.reduce((acc, project) => {
    const companyId = project.companyId || "personal";
    const companyName = project.companyName || "Projetos Pessoais";

    const existingGroup = acc.find((g) => g.companyId === companyId);
    if (existingGroup) {
      existingGroup.projects.push(project);
    } else {
      acc.push({
        companyId,
        companyName,
        projects: [project],
      });
    }
    return acc;
  }, [] as GroupedProjects[]);

  const currentProject = projects.find((p) => p.id === currentProjectId);

  const handleSelectProject = (projectId: string) => {
    setOpen(false);
    if (onProjectChange) {
      onProjectChange(projectId);
    } else {
      navigate(`/design-system/${projectId}`);
    }
  };

  if (loading || projects.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {currentProject ? currentProject.name : "Selecionar projeto..."}
            </span>
            {currentProject && currentProject.alertsCount > 0 && (
              <span className="flex items-center gap-1 text-amber-500">
                <AlertTriangle className="h-3 w-3" />
                <span className="text-xs">{currentProject.alertsCount}</span>
              </span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar projeto..." />
          <CommandList>
            <CommandEmpty>Nenhum projeto encontrado.</CommandEmpty>
            {groupedProjects.map((group, index) => (
              <div key={group.companyId}>
                {index > 0 && <CommandSeparator />}
                <CommandGroup
                  heading={
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3" />
                      {group.companyName}
                    </div>
                  }
                >
                  {group.projects.map((project) => (
                    <CommandItem
                      key={project.id}
                      value={project.name}
                      onSelect={() => handleSelectProject(project.id)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          currentProjectId === project.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <span className="flex-1 truncate">{project.name}</span>
                      {project.alertsCount > 0 && (
                        <span className="flex items-center gap-1 text-amber-500 text-xs">
                          <AlertTriangle className="h-3 w-3" />
                          {project.alertsCount}
                        </span>
                      )}
                      {project.status === "SUCCESS" && project.alertsCount === 0 && (
                        <span className="text-green-500 text-xs">✓</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
