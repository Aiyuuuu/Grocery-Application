import { apiClient } from '../client';

function toUiAddress(apiAddress) {
  const street = apiAddress.street_address || '';
  const city = apiAddress.city || 'Karachi';
  const state = apiAddress.province || 'Sindh';
  const zipCode = apiAddress.postal_code || '';

  return {
    id: apiAddress.id,
    name: apiAddress.label || 'Address',
    type: 'home',
    street,
    city,
    state,
    zipCode,
    phoneNumber: apiAddress.phone_number || '',
    instructions: apiAddress.delivery_instructions || '',
    latitude: Number(apiAddress.latitude) || 24.8607,
    longitude: Number(apiAddress.longitude) || 67.0011,
    isDefault: Boolean(apiAddress.is_default ?? apiAddress.isDefault),
    fullAddress: `${street}\n${city}, ${state} ${zipCode}`.trim(),
  };
}

function toApiAddress(payload) {
  return {
    label: payload.name || null,
    street_address: payload.street,
    city: payload.city,
    province: payload.state,
    postal_code: payload.zipCode,
    phone_number: payload.phoneNumber || null,
    delivery_instructions: payload.instructions || null,
    country: 'Pakistan',
    latitude: payload.latitude,
    longitude: payload.longitude,
    isDefault: Boolean(payload.isDefault),
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
