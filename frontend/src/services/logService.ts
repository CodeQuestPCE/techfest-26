import api from '@/lib/api';

export const logService = {
  // Get activity logs (admin only)
  getActivityLogs: async (params?: {
    action?: string;
    userId?: string;
    limit?: number;
  }) => {
    const response = await api.get('/logs', { params });
    return response.data;
  },

  // Get user-specific logs (admin only)
  getUserLogs: async (userId: string) => {
    const response = await api.get(`/logs/user/${userId}`);
    return response.data;
  }
};
