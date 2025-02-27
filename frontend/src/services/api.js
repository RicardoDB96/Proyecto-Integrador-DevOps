//frontend/src/services/api.js
import axios from 'axios';

const API_URL = 'http://35.232.205.232:5000/api';  // ✅ Ajusta esto con la IP correcta

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;