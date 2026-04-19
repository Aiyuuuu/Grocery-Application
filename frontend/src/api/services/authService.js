import { apiClient } from '../client';

export const authService = {
  signIn: (payload) => apiClient.post('/auth/sign-in', payload),
  register: (payload) => apiClient.post('/auth/register', payload),
  forgotPassword: (payload) => apiClient.post('/auth/forgot-password', payload),
};
