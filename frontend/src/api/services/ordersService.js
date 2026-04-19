import { apiClient } from '../client';

export const ordersService = {
  listOrders: async () => {
    const response = await apiClient.get('/orders');
    return response.data?.orders || [];
  },

  placeOrder: async (payload) => {
    const response = await apiClient.post('/orders', payload);
    return response.data;
  },
};
