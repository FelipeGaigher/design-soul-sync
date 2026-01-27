import { api } from '@/lib/api';

export const settingsService = {
  async saveFigmaToken(token: string): Promise<{ success: boolean; message: string }> {
    const response = await api.put<{ success: boolean; message: string }>(
      '/users/me/figma-token',
      { token }
    );
    if (response.error) throw new Error(response.error);
    return response.data!;
  },
};
