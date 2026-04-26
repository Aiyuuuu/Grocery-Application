import { apiClient } from '../client';

function parseBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value.trim().toLowerCase() === 'true';
  }

  return Boolean(value);
}

function toSafeType(value) {
  return ['home', 'work', 'other'].includes(value) ? value : 'other';
}

function toSafeNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toUiAddress(apiAddress) {
  const street = apiAddress.address || '';
  const city = apiAddress.city || 'Karachi';
  const state = apiAddress.province || 'Sindh';
  const zipCode = apiAddress.postal_code || '';
  const type = toSafeType(apiAddress.type || 'other');
  const isDefault = parseBoolean(apiAddress.is_default ?? apiAddress.isDefault);

  return {
    id: apiAddress.id,
    name: apiAddress.label || type[0].toUpperCase() + type.slice(1),
    label: apiAddress.label || null,
    type,
    street,
    city,
    state,
    zipCode,
    phoneNumber: apiAddress.phone_number || '',
    instructions: apiAddress.delivery_instructions || '',
    latitude: toSafeNumber(apiAddress.latitude, 24.8607),
    longitude: toSafeNumber(apiAddress.longitude, 67.0011),
    isDefault,
    is_default: isDefault ? 'true' : 'false',
    fullAddress: `${street}\n${city}, ${state} ${zipCode}`.trim(),
  };
}

function toApiAddress(payload) {
  const type = toSafeType(payload.type || 'other');

  return {
    label: payload.name || null,
    type,
    address: payload.street,
    city: payload.city,
    province: payload.state,
    postal_code: payload.zipCode,
    phone_number: payload.phoneNumber || null,
    delivery_instructions: payload.instructions || null,
    latitude: toSafeNumber(payload.latitude, 24.8607),
    longitude: toSafeNumber(payload.longitude, 67.0011),
    isDefault: parseBoolean(payload.isDefault),
  };
}

export const addressesService = {
  list: async () => {
    const response = await apiClient.get('/addresses');
    return (response.data || []).map(toUiAddress);
  },
  create: async (payload) => {
    const response = await apiClient.post('/addresses', toApiAddress(payload));
    return toUiAddress(response.data);
  },
  update: async (id, payload) => {
    const response = await apiClient.put(`/addresses/${id}`, toApiAddress(payload));
    return toUiAddress(response.data);
  },
  remove: (id) => apiClient.delete(`/addresses/${id}`),
};
