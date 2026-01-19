import { api } from '@/lib/api';

export interface FigmaProject {
  id: string;
  name: string;
  last_modified: string;
  thumbnail_url?: string;
}

export interface FigmaFile {
  key: string;
  id?: string;
  name: string;
  thumbnail_url?: string;
  thumbnailUrl?: string;
  last_modified?: string;
  lastModified?: string;
  version?: string;
}

export interface FigmaTeam {
  id: string;
  name: string;
}

export interface FigmaVariable {
  id: string;
  name: string;
  key: string;
  variableCollectionId: string;
  resolvedType: 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR';
  valuesByMode: Record<string, any>;
  remote: boolean;
  description: string;
  hiddenFromPublishing: boolean;
  scopes: string[];
  codeSyntax: Record<string, string>;
}

export interface FigmaVariableCollection {
  id: string;
  name: string;
  key: string;
  modes: Array<{ modeId: string; name: string }>;
  defaultModeId: string;
  remote: boolean;
  hiddenFromPublishing: boolean;
  variableIds: string[];
}

export interface FigmaVariablesResponse {
  status: number;
  error: boolean;
  meta: {
    variableCollections: Record<string, FigmaVariableCollection>;
    variables: Record<string, FigmaVariable>;
  };
}

export interface FigmaProjectsResponse {
  projects: FigmaProject[];
}

export interface FigmaFilesResponse {
  files: FigmaFile[];
}

export interface FigmaTeamsResponse {
  teams: FigmaTeam[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const figmaService = {
  // Get OAuth authorization URL
  getAuthUrl(): string {
    return `${API_URL}/auth/figma`;
  },

  // Check if user has Figma connected
  async isConnected(): Promise<boolean> {
    try {
      const response = await api.get<{ connected: boolean }>('/figma/status');
      return response.data?.connected || false;
    } catch {
      return false;
    }
  },

  // Get user's Figma teams
  async getTeams(): Promise<FigmaTeam[]> {
    const response = await api.get<FigmaTeamsResponse>('/figma/teams');
    if (response.error) throw new Error(response.error);
    return response.data?.teams || [];
  },

  // Get user's recent Figma files/projects
  async getProjects(): Promise<FigmaFile[]> {
    const response = await api.get<{ projects: FigmaFile[] }>('/figma/projects');
    if (response.error) throw new Error(response.error);
    return response.data?.projects || [];
  },

  // Get file info by fileKey
  async getFileInfo(fileKey: string): Promise<FigmaFile> {
    const response = await api.get<FigmaFile>(`/figma/files/${fileKey}`);
    if (response.error) throw new Error(response.error);
    return response.data!;
  },

  // Get files in a project
  async getFiles(projectId: string): Promise<FigmaFile[]> {
    const response = await api.get<FigmaFilesResponse>(`/figma/projects/${projectId}/files`);
    if (response.error) throw new Error(response.error);
    return response.data?.files || [];
  },

  // Get variables from a file
  async getVariables(fileKey: string): Promise<FigmaVariablesResponse> {
    const response = await api.get<FigmaVariablesResponse>(`/figma/files/${fileKey}/variables`);
    if (response.error) throw new Error(response.error);
    return response.data!;
  },

  // Import variables from Figma to a project
  async importVariables(projectId: string, fileKey: string): Promise<{ imported: number; updated: number; errors: string[] }> {
    const response = await api.post<{ imported: number; updated: number; errors: string[] }>(
      `/figma/import/${projectId}`,
      { fileKey }
    );
    if (response.error) throw new Error(response.error);
    return response.data!;
  },

  // Sync variables (check for divergences)
  async syncVariables(projectId: string, fileKey: string): Promise<{
    divergences: Array<{
      tokenName: string;
      localValue: string;
      figmaValue: string;
      type: 'added' | 'removed' | 'modified';
    }>;
  }> {
    const response = await api.post<{
      divergences: Array<{
        tokenName: string;
        localValue: string;
        figmaValue: string;
        type: 'added' | 'removed' | 'modified';
      }>;
    }>(`/figma/sync/${projectId}`, { fileKey });
    if (response.error) throw new Error(response.error);
    return response.data!;
  },
};
