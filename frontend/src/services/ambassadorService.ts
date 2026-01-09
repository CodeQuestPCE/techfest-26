import api from '@/lib/api';

export const ambassadorService = {
  generateReferralCode: async () => {
    const response = await api.post('/ambassadors/generate-code');
    return response.data;
  },

  getAmbassadorStats: async () => {
    const response = await api.get('/ambassadors/stats');
    return response.data;
  },

  getLeaderboard: async () => {
    const response = await api.get('/ambassadors/leaderboard');
    return response.data;
  },

  applyReferralCode: async (code: string) => {
    const response = await api.post('/ambassadors/apply-referral', { code });
    return response.data;
  },
};
