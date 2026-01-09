import api from '@/lib/api';

export const paymentService = {
  // Create payment intent
  createPaymentIntent: async (amount: number, registrationId: string) => {
    const response = await api.post('/payments/create-intent', {
      amount,
      registrationId
    });
    return response.data;
  },

  // Get payment details
  getPayment: async (id: string) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  }
};
