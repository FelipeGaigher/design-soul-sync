import { api } from '@/lib/api';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  figmaFileId?: string;
  figmaFileName?: string;
  figmaLastSyncAt?: string;
  ownerId: string;
  owner: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  members: ProjectMember[];
  tokensCount: number;
  componentsCount: number;
  divergencesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface CreateProjectData {
  name: string;
  description?: string;
  figmaFileId?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'ARCHIVED';
  figmaFileId?: string;
}

export interface ProjectStats {
  tokensCount: number;
  componentsCount: number;
  divergencesCount: number;
  tokensByType: Record<string, number>;
}

export const projectsService = {
  async getAll(): Promise<Project[]> {
    const response = await api.get<Project[]>('/projects');
    if (response.error) throw new Error(response.error);
    return response.data!;
  },

  async getById(id: string): Promise<Project> {
    const response = await api.get<Project>(`/projects/${id}`);
    if (response.error) throw new Error(response.error);
    return response.data!;
  },

  async getStats(id: string): Promise<ProjectStats> {
    const response = await api.get<ProjectStats>(`/projects/${id}/stats`);
    if (response.error) throw new Error(response.error);
    return response.data!;
  },

  async create(data: CreateProjectData): Promise<Project> {
    const response = await api.post<Project>('/projects', data);
    if (response.error) throw new Error(response.error);
    return response.data!;
  },

  async update(id: string, data: UpdateProjectData): Promise<Project> {
    const response = await api.patch<Project>(`/projects/${id}`, data);
    if (response.error) throw new Error(response.error);
    return response.data!;
  },

  async delete(id: string): Promise<void> {
    const response = await api.delete(`/projects/${id}`);
    if (response.error) throw new Error(response.error);
  },

  async addMember(projectId: string, userId: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER'): Promise<ProjectMember> {
    const response = await api.post<ProjectMember>(`/projects/${projectId}/members`, { userId, role });
    if (response.error) throw new Error(response.error);
    return response.data!;
  },

  async removeMember(projectId: string, userId: string): Promise<void> {
    const response = await api.delete(`/projects/${projectId}/members/${userId}`);
    if (response.error) throw new Error(response.error);
  },

  async getComponents(projectId: string): Promise<any[]> {
    const response = await api.get<any[]>(`/projects/${projectId}/components`);
    if (response.error) throw new Error(response.error);
    return response.data || [];
  },
};
