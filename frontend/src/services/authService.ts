import api from '@/lib/api';

export const authService = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    college: string;
    phone: string;
    referralCode?: string;
    role?: string;
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updatePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await api.put('/auth/updatepassword', data);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgotpassword', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.put(`/auth/resetpassword/${token}`, {
      password,
    });
    return response.data;
  },
};
