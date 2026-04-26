import { apiClient } from '../client';

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value.trim().toLowerCase() === 'true';
  }

  return Boolean(value);
}

function normalizeProduct(apiProduct) {
  return {
    ...apiProduct,
    saleType: apiProduct.saleType || apiProduct.sale_type,
    unit_weight: toNumberOrNull(apiProduct.unit_weight),
    unitWeight: toNumberOrNull(apiProduct.unitWeight ?? apiProduct.unit_weight),
    calories: toNumberOrNull(apiProduct.calories),
    price: toNumberOrNull(apiProduct.price) ?? 0,
    recommended: toBoolean(apiProduct.recommended),
    is_active: toBoolean(apiProduct.is_active),
    isActive: toBoolean(apiProduct.isActive ?? apiProduct.is_active),
  };
}

export const productsService = {
  getProducts: async () => {
    const response = await apiClient.get('/products');
    return (response.data || []).map(normalizeProduct);
  },

  getProductById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return normalizeProduct(response.data);
  },

  getActiveProducts: async () => {
    const response = await apiClient.get('/products/active');
    return (response.data || []).map(normalizeProduct);
  },
};
