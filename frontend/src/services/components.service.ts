import { api } from '@/lib/api';

export interface Component {
  id: string;
  name: string;
  nodeId: string;
  previewUrl?: string;
  description?: string;
  status: 'ok' | 'modified' | 'broken' | 'unauthorized';
}

export interface Folder {
  name: string;
  components: Component[];
}

export interface ProjectComponents {
  id: string;
  name: string;
  figmaUrl: string;
  folders: Folder[];
  lastImportedAt: string;
  companyName?: string;
  alertsCount: number;
}

export const componentsService = {
  async getProjectComponents(projectId: string): Promise<ProjectComponents> {
    const response = await api.get<ProjectComponents>(
      `/projects/${projectId}/components`
    );
    if (response.error) throw new Error(response.error);
    return response.data!;
  },

  async getComponentCode(
    projectId: string,
    componentId: string,
    framework: 'react' | 'vue' | 'angular',
  ): Promise<{ code: string; language: string }> {
    const response = await api.get<{ code: string; language: string }>(
      `/projects/${projectId}/components/${componentId}/code?framework=${framework}`
    );
    if (response.error) throw new Error(response.error);
    return response.data!;
  },

  async importComponents(projectId: string, fileKey: string) {
    const response = await api.post<{
      imported: number;
      updated: number;
      errors: string[];
    }>(`/figma/import-components/${projectId}`, { fileKey });
    if (response.error) throw new Error(response.error);
    return response.data!;
  },
};
