import { apiClient } from '../../api/client';

function normalizeProductPayload(values) {
  const saleType = values.saleType;
  const normalizedRecommended = String(values.recommended || 'no').trim().toLowerCase();
  const parsedPrice = Number(values.price);
  const parsedCalories = Number(values.calories);
  const parsedUnitWeight =
    values.unitWeight === '' || values.unitWeight === null || values.unitWeight === undefined
      ? null
      : Number(values.unitWeight);

  if (!values.id || !values.name || !values.image || !values.unit) {
    throw new Error('id, name, image and unit are required');
  }

  if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
    throw new Error('price must be a positive number');
  }

  if (!Number.isFinite(parsedCalories) || parsedCalories < 0) {
    throw new Error('calories must be 0 or greater');
  }

  if (!['fixed', 'variable'].includes(saleType)) {
    throw new Error('sale_type must be fixed or variable');
  }

  if (!['kg', 'l', 'g', 'ml'].includes(values.unit)) {
    throw new Error('unit must be one of: kg, l, g, ml');
  }

  if (!['yes', 'no'].includes(normalizedRecommended)) {
    throw new Error('recommended must be yes or no');
  }

  if (saleType === 'variable' && parsedUnitWeight !== null) {
    throw new Error('unit_weight must be empty for variable products');
  }

  if (saleType === 'fixed' && parsedUnitWeight !== null && (!Number.isFinite(parsedUnitWeight) || parsedUnitWeight <= 0)) {
    throw new Error('unit_weight must be a valid positive number for fixed products');
  }

  return {
    id: String(values.id).trim(),
    name: String(values.name).trim(),
    description: String(values.description || '').trim(),
    image: String(values.image).trim(),
    price: parsedPrice,
    calories: parsedCalories,
    sale_type: saleType,
    unit: values.unit,
    unit_weight: parsedUnitWeight,
    recommended: normalizedRecommended === 'yes' ? 'true' : 'false',
  };
}

export async function createCategory(name) {
  const safeName = String(name || '').trim();

  if (!safeName) {
    throw new Error('Category name is required');
  }

  await apiClient.post('/categories', { name: safeName });
}

async function assignProductToCategory(categoryId, productId) {
  const categoryProductsResponse = await apiClient.get(`/categories/${categoryId}/products`);
  const existingProductIds = Array.isArray(categoryProductsResponse.data?.productIds)
    ? categoryProductsResponse.data.productIds
    : [];

  if (existingProductIds.includes(productId)) {
    return;
  }

  await apiClient.put(`/categories/${categoryId}/products`, {
    productIds: [...existingProductIds, productId],
  });
}

export async function createProductWithCategories(values, categoryIds) {
  const payload = normalizeProductPayload(values);

  const normalizedCategoryIds = [
    ...new Set(
      (categoryIds || [])
        .map((id) => String(id || '').trim())
        .filter((id) => id.length > 0)
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id))
    ),
  ];

  if (normalizedCategoryIds.length > 10) {
    throw new Error('You can assign up to 10 categories');
  }

  await apiClient.post('/products', payload);

  try {
    for (const categoryId of normalizedCategoryIds) {
      await assignProductToCategory(categoryId, payload.id);
    }
  } catch (error) {
    // Prevent partially-created products when category assignment fails.
    try {
      await apiClient.delete(`/products/${payload.id}`);
    } catch (_rollbackError) {
      // intentionally ignored: rollback failure should not block flow
    }
    throw error;
  }
}

export async function deleteProduct(productId) {
  await apiClient.delete(`/products/${productId}`);
}

export async function deleteCategory(categoryId) {
  await apiClient.delete(`/categories/${categoryId}`);
}
