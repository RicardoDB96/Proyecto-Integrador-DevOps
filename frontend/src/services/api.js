//frontend/src/services/api.js
import axios from 'axios';

const API_URL = 'http://54.163.103.27:5000/api';  // ✅ Ajusta esto con la IP correcta

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;