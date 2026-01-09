import api from '@/lib/api';

export const ticketService = {
  getUserTickets: async () => {
    const response = await api.get('/tickets');
    return response.data;
  },

  getTicket: async (id: string) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  validateTicket: async (id: string) => {
    const response = await api.post(`/tickets/${id}/validate`);
    return response.data;
  },

  getTicketByQR: async (ticketNumber: string) => {
    const response = await api.get(`/tickets/qr/${ticketNumber}`);
    return response.data;
  },
};
