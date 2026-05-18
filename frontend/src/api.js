import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

export const assessRisk = async (data) => {
  const response = await api.post('/assess', data);
  return response.data;
};

export const saveVisit = async (visitData) => {
  const response = await api.post('/visits', visitData);
  return response.data;
};

export const getVisits = async () => {
  const response = await api.get('/visits');
  return response.data;
};

export const generateReferral = async (data) => {
  const response = await api.post('/referral', data);
  return response.data;
};

export const assessImage = async (imageData) => {
  const response = await api.post('/image-assess', imageData);
  return response.data;
};

export default api;
