import axios from 'axios';
export const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
export const client = axios.create({ baseURL: apiUrl, timeout: 15000 });
export function setToken(token) {
  if (token) client.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete client.defaults.headers.common.Authorization;
}
export function errorMessage(error) {
  return error.response?.data?.message || (error.request ? 'Cannot reach the server. Check your connection and try again.' : error.message) || 'Something went wrong. Please try again.';
}
