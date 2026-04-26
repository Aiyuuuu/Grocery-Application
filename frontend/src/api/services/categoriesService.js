import { apiClient } from '../client';

function normalizeCategory(category) {
  return {
    ...category,
    productIds: Array.isArray(category.productIds) ? category.productIds : [],
  };
}

export const categoriesService = {
  getCategories: async () => {
    const response = await apiClient.get('/categories');
    return (response.data || []).map(normalizeCategory);
  },
};
