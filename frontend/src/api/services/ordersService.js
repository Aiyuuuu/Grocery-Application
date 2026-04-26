import { apiClient } from '../client';

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeStatus(status) {
  const safe = String(status || 'placed').trim().toLowerCase();

  if (['placed', 'packaged', 'enroute', 'arrived'].includes(safe)) {
    return safe;
  }

  return 'placed';
}

function normalizeOrder(order) {
  return {
    ...order,
    id: order.id,
    orderNumber: order.orderNumber || order.order_number || String(order.id || ''),
    status: normalizeStatus(order.status),
    total: toNumber(order.total),
    itemCount: toNumber(order.itemCount ?? order.item_count),
    createdAt: order.createdAt || order.created_at,
  };
}

export const ordersService = {
  listOrders: async () => {
    const response = await apiClient.get('/orders');
    return (response.data?.orders || []).map(normalizeOrder);
  },

  placeOrder: async (payload) => {
    const response = await apiClient.post('/orders', payload);
    return response.data;
  },
};
