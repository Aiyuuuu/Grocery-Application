import { createSelector } from '@reduxjs/toolkit';
import {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING,
  TAX_RATE,
  UNIT_SCALE,
} from '../constants/cart';

export const selectProducts = (state) => state.products.items;
export const selectSearchQuery = (state) => state.products.searchQuery || '';
export const selectCategories = (state) => state.categories.items;
export const selectCartItems = (state) => state.cart.items;

export const selectProductById = (state, id) =>
  state.products.items.find((product) => product.id === id);

export const selectCartQuantityById = (state, id) =>
  state.cart.items.find((item) => item.id === id)?.quantity || 0;

export const selectCartCount = createSelector(
  [selectCartItems],
  (items) => items.length
);

export const selectRecommendedProducts = createSelector(
  [selectProducts],
  (products) => products.filter((product) => product.recommended === true)
);

export const selectSearchResults = createSelector(
  [selectProducts, selectSearchQuery],
  (products, searchQuery) => {
    const needle = searchQuery.trim().toLowerCase();
    if (!needle) return [];

    return products.filter((product) => {
      const tags = Array.isArray(product.tags) ? product.tags.join(' ') : '';
      const haystack = `${product.name || ''} ${product.description || ''} ${tags}`.toLowerCase();
      return haystack.includes(needle);
    });
  }
);

export const selectProductsByIdMap = createSelector([selectProducts], (products) => {
  const byId = {};
  products.forEach((product) => {
    byId[product.id] = product;
  });
  return byId;
});

export const selectCategoriesWithProducts = createSelector(
  [selectCategories, selectProductsByIdMap],
  (categories, productsById) =>
    categories.map((category) => ({
      ...category,
      products: category.productIds
        .map((id) => productsById[id])
        .filter(Boolean),
    }))
);

export const selectCartDetails = createSelector(
  [selectCartItems, selectProductsByIdMap],
  (cartItems, productsById) =>
    cartItems
      .map((item) => ({ item, product: productsById[item.id] }))
      .filter((entry) => entry.product)
);

export const selectCartTotals = createSelector([selectCartDetails], (cartDetails) => {
  const subtotal = cartDetails.reduce((sum, { item, product }) => {
    const multiplier = product.saleType === 'variable' ? item.quantity / UNIT_SCALE : item.quantity;
    return sum + multiplier * product.price;
  }, 0);

  const shipping = subtotal > FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING;
  const taxes = subtotal * TAX_RATE;
  const total = subtotal + shipping + taxes;

  return { subtotal, shipping, taxes, total };
});
