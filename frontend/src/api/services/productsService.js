import { apiClient } from '../client';

export const productsService = {
  list: () => apiClient.get('/products'),
  getById: (id) => apiClient.get(`/products/${id}`),
  search: (query) => apiClient.get('/products', { params: { q: query } }),
};
