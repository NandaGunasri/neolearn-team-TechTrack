// frontend/src/services/api.js
import axios from 'axios';

const API = axios.create({
  // Make sure this points to your backend
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: false
});

// Attach token from localStorage if present
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // token stored after login/register
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, err => Promise.reject(err));

export default API;
