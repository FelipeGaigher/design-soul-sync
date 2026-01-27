import { api } from '@/lib/api';

export interface Company {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  _count?: {
    projects: number;
  };
}

export interface CreateCompanyData {
  name: string;
  description?: string;
  logoUrl?: string;
}

export const companiesService = {
  async getAll(): Promise<Company[]> {
    const response = await api.get<Company[]>('/companies');
    if (response.error) throw new Error(response.error);
    return response.data || [];
  },

  async create(data: CreateCompanyData): Promise<Company> {
    const response = await api.post<Company>('/companies', data);
    if (response.error) throw new Error(response.error);
    return response.data!;
  },
};
