import api from '@/lib/api';

export const registrationService = {
  createRegistration: async (data: {
    eventId: string;
    ticketType: string;
    quantity: number;
    attendeeInfo: any;
  }) => {
    const response = await api.post('/registrations', data);
    return response.data;
  },

  getUserRegistrations: async () => {
    const response = await api.get('/registrations');
    return response.data;
  },

  getRegistration: async (id: string) => {
    const response = await api.get(`/registrations/${id}`);
    return response.data;
  },

  cancelRegistration: async (id: string) => {
    const response = await api.put(`/registrations/${id}/cancel`);
    return response.data;
  },

  getEventRegistrations: async (eventId: string) => {
    const response = await api.get(`/registrations/event/${eventId}`);
    return response.data;
  },
};
