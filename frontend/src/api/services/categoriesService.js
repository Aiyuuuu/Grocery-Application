import { apiClient } from '../client';

export const categoriesService = {
  list: () => apiClient.get('/categories'),
  getByName: (name) => apiClient.get('/categories', { params: { name } }),
};
