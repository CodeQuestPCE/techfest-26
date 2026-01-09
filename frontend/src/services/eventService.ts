import api from '@/lib/api';
import { Event } from '@/types';

export const eventService = {
  getEvents: async (params?: {
    category?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    city?: string;
  }) => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  getEvent: async (id: string) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  createEvent: async (eventData: Partial<Event>) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  updateEvent: async (id: string, eventData: Partial<Event>) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id: string) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  checkAvailability: async (id: string) => {
    const response = await api.get(`/events/${id}/availability`);
    return response.data;
  },
};
