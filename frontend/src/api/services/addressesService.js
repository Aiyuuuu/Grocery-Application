import { apiClient } from '../client';

export const addressesService = {
  list: () => apiClient.get('/addresses'),
  create: (payload) => apiClient.post('/addresses', payload),
  update: (id, payload) => apiClient.put(`/addresses/${id}`, payload),
  remove: (id) => apiClient.delete(`/addresses/${id}`),
};
