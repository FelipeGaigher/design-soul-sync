import { api } from '@/lib/api';

export type TokenType = 
  | 'COLOR' 
  | 'SPACING' 
  | 'TYPOGRAPHY' 
  | 'BORDER_RADIUS' 
  | 'SHADOW' 
  | 'FONT_SIZE'
  | 'FONT_WEIGHT'
  | 'LINE_HEIGHT'
  | 'OPACITY' 
  | 'Z_INDEX' 
  | 'OTHER';

export interface Token {
  id: string;
  name: string;
  value: string;
  type: TokenType;
  category: string;
  description?: string;
  figmaVariableId?: string;
  figmaLastValue?: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TokenWithDetails extends Token {
  history: TokenHistoryEntry[];
  componentTokens: {
    component: {
      id: string;
      name: string;
      category: string;
    };
  }[];
}

export interface TokenHistoryEntry {
  id: string;
  action: string;
  changes: Record<string, { before: any; after: any }>;
  origin: 'MANUAL' | 'FIGMA' | 'AUTOMATION' | 'AI';
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export interface CreateTokenData {
  name: string;
  value: string;
  type: TokenType;
  category: string;
  description?: string;
  figmaVariableId?: string;
}

export interface UpdateTokenData {
  name?: string;
  value?: string;
  type?: TokenType;
  category?: string;
  description?: string;
}

export interface TokenFilters {
  type?: TokenType;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TokensResponse {
  data: Token[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TokenStats {
  total: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  recentChanges: TokenHistoryEntry[];
}

export interface BulkCreateResult {
  created: Token[];
  errors: { name: string; error: string }[];
}

export const tokensService = {
  async getAll(projectId: string, filters?: TokenFilters): Promise<TokensResponse> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const query = params.toString();
    const url = `/projects/${projectId}/tokens${query ? `?${query}` : ''}`;
    
    const response = await api.get<TokensResponse>(url);
    if (response.error) throw new Error(response.error);
    return response.data!;
  },

  async getById(projectId: string, tokenId: string): Promise<TokenWithDetails> {
    const response = await api.get<TokenWithDetails>(`/projects/${projectId}/tokens/${tokenId}`);
    if (response.error) throw new Error(response.error);
    return response.data!;
  },

  async getStats(projectId: string): Promise<TokenStats> {
    const response = await api.get<TokenStats>(`/projects/${projectId}/tokens/stats`);
    if (response.error) throw new Error(response.error);
    return response.data!;
  },

  async getHistory(projectId: string, page = 1, limit = 20): Promise<{ data: TokenHistoryEntry[]; meta: any }> {
    const response = await api.get<{ data: TokenHistoryEntry[]; meta: any }>(
      `/projects/${projectId}/tokens/history?page=${page}&limit=${limit}`
    );
    if (response.error) throw new Error(response.error);
    return response.data!;
  },

  async getCategories(projectId: string): Promise<string[]> {
    const response = await api.get<string[]>(`/projects/${projectId}/tokens/categories`);
    if (response.error) throw new Error(response.error);
    return response.data!;
  },

  async create(projectId: string, data: CreateTokenData): Promise<Token> {
    const response = await api.post<Token>(`/projects/${projectId}/tokens`, data);
    if (response.error) throw new Error(response.error);
    return response.data!;
  },

  async bulkCreate(projectId: string, tokens: CreateTokenData[]): Promise<BulkCreateResult> {
    const response = await api.post<BulkCreateResult>(`/projects/${projectId}/tokens/bulk`, { tokens });
    if (response.error) throw new Error(response.error);
    return response.data!;
  },

  async update(projectId: string, tokenId: string, data: UpdateTokenData): Promise<Token> {
    const response = await api.patch<Token>(`/projects/${projectId}/tokens/${tokenId}`, data);
    if (response.error) throw new Error(response.error);
    return response.data!;
  },

  async delete(projectId: string, tokenId: string): Promise<void> {
    const response = await api.delete(`/projects/${projectId}/tokens/${tokenId}`);
    if (response.error) throw new Error(response.error);
  },
};
